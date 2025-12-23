package org.example.QuanLyMuaVu.Service;

import java.text.ParseException;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.StringJoiner;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;

import org.example.QuanLyMuaVu.DTO.Request.AuthenticationRequest;
import org.example.QuanLyMuaVu.DTO.Request.IntrospectRequest;
import org.example.QuanLyMuaVu.DTO.Request.LogoutRequest;
import org.example.QuanLyMuaVu.DTO.Request.RefreshRequest;
import org.example.QuanLyMuaVu.DTO.Response.AuthenticationResponse;
import org.example.QuanLyMuaVu.DTO.Response.IntrospectResponse;
import org.example.QuanLyMuaVu.Entity.InvalidatedToken;
import org.example.QuanLyMuaVu.Entity.Role;
import org.example.QuanLyMuaVu.Entity.User;
import org.example.QuanLyMuaVu.Exception.AppException;
import org.example.QuanLyMuaVu.Exception.ErrorCode;
import org.example.QuanLyMuaVu.Repository.InvalidatedTokenRepository;
import org.example.QuanLyMuaVu.Repository.UserRepository;
import com.nimbusds.jose.*;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jose.crypto.MACVerifier;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AuthenticationService {
    UserRepository userRepository;
    InvalidatedTokenRepository invalidatedTokenRepository;

    @NonFinal
    @Value("${jwt.signerKey}")
    protected String SIGNER_KEY;

    @NonFinal
    @Value("${jwt.valid-duration}")
    protected long VALID_DURATION;

    @NonFinal
    @Value("${jwt.refreshable-duration}")
    protected long REFRESHABLE_DURATION;

    public IntrospectResponse introspect(IntrospectRequest request) throws JOSEException, ParseException {
        var token = request.getToken();
        log.debug("Introspecting token: {}", token.substring(0, Math.min(20, token.length())) + "...");
        
        boolean isValid = true;

        try {
            verifyToken(token, false);
            log.debug("Token introspection successful - token is valid");
        } catch (AppException e) {
            log.warn("Token introspection failed: {}", e.getMessage());
            isValid = false;
        }

        return IntrospectResponse.builder().valid(isValid).build();
    }

    public AuthenticationResponse authenticate(AuthenticationRequest request) {
        log.info("Authentication attempt for user: {}", request.getUsername());
        
        PasswordEncoder passwordEncoder = new BCryptPasswordEncoder(10);
        var user = userRepository
                .findByUsername(request.getUsername())
                .orElseThrow(() -> {
                    log.warn("Authentication failed - user not found: {}", request.getUsername());
                    return new AppException(ErrorCode.USER_NOT_FOUND);
                });

        boolean authenticated = passwordEncoder.matches(request.getPassword(), user.getPassword());

        if (!authenticated) {
            log.warn("Authentication failed - invalid credentials for user: {}", request.getUsername());
            throw new AppException(ErrorCode.INVALID_CREDENTIALS);
        }

        var token = generateToken(user);
        log.info("Authentication successful for user: {} - token generated", user.getUsername());

        return AuthenticationResponse.builder()
                .token(token)
                .authenticated(true)
                .username(user.getUsername())
                .roles(user.getRoles().stream().map(Role::getCode).toList())
                .build();
    }

    public void logout(LogoutRequest request) throws ParseException, JOSEException {
        log.info("Logout attempt for token: {}", request.getToken().substring(0, Math.min(20, request.getToken().length())) + "...");
        
        try {
            var signToken = verifyToken(request.getToken(), true);

            String jit = signToken.getJWTClaimsSet().getJWTID();
            Date expiryTime = signToken.getJWTClaimsSet().getExpirationTime();

            InvalidatedToken invalidatedToken =
                    InvalidatedToken.builder().id(jit).expiryTime(expiryTime).build();

            invalidatedTokenRepository.save(invalidatedToken);
            log.info("Token invalidated successfully - JIT: {}", jit);
        } catch (AppException exception) {
            log.info("Logout - Token already expired or invalid");
        }
    }

    public AuthenticationResponse refreshToken(RefreshRequest request) throws ParseException, JOSEException {
        log.info("Token refresh attempt");
        
        var signedJWT = verifyToken(request.getToken(), true);

        var jit = signedJWT.getJWTClaimsSet().getJWTID();
        var expiryTime = signedJWT.getJWTClaimsSet().getExpirationTime();

        InvalidatedToken invalidatedToken =
                InvalidatedToken.builder().id(jit).expiryTime(expiryTime).build();

        invalidatedTokenRepository.save(invalidatedToken);
        log.debug("Old token invalidated - JIT: {}", jit);

        var username = signedJWT.getJWTClaimsSet().getSubject();
        log.debug("Refreshing token for user: {}", username);

        var user =
                userRepository.findByUsername(username).orElseThrow(() -> new AppException(ErrorCode.UNAUTHENTICATED));

        var token = generateToken(user);
        log.info("Token refreshed successfully for user: {}", username);

        return AuthenticationResponse.builder()
                .token(token)
                .authenticated(true)
                .username(user.getUsername())
                .roles(user.getRoles().stream().map(Role::getCode).toList())
                .build();
    }

    private String generateToken(User user) {
        log.debug("Generating JWT token for user: {}", user.getUsername());
        
        JWSHeader header = new JWSHeader(JWSAlgorithm.HS512);

        JWTClaimsSet jwtClaimsSet = new JWTClaimsSet.Builder()
                .subject(user.getUsername())
                .issuer("QuanLyMuaVu")
                .issueTime(new Date())
                .expirationTime(new Date(
                        Instant.now().plus(VALID_DURATION, ChronoUnit.SECONDS).toEpochMilli()))
                .jwtID(UUID.randomUUID().toString())
                .claim("scope", buildScope(user))
                .build();

        Payload payload = new Payload(jwtClaimsSet.toJSONObject());

        JWSObject jwsObject = new JWSObject(header, payload);

        try {
            jwsObject.sign(new MACSigner(SIGNER_KEY.getBytes()));
            String token = jwsObject.serialize();
            log.debug("JWT token generated successfully for user: {} - expires in {} seconds", 
                     user.getUsername(), VALID_DURATION);
            return token;
        } catch (JOSEException e) {
            log.error("Cannot create token for user: {}", user.getUsername(), e);
            throw new RuntimeException(e);
        }
    }

    private SignedJWT verifyToken(String token, boolean isRefresh) throws JOSEException, ParseException {
        log.debug("Verifying token - isRefresh: {}", isRefresh);
        
        JWSVerifier verifier = new MACVerifier(SIGNER_KEY.getBytes());

        SignedJWT signedJWT = SignedJWT.parse(token);

        Date expiryTime = (isRefresh)
                ? new Date(signedJWT
                .getJWTClaimsSet()
                .getIssueTime()
                .toInstant()
                .plus(REFRESHABLE_DURATION, ChronoUnit.SECONDS)
                .toEpochMilli())
                : signedJWT.getJWTClaimsSet().getExpirationTime();

        var verified = signedJWT.verify(verifier);

        if (!(verified && expiryTime.after(new Date()))) {
            log.warn("Token verification failed - verified: {}, expired: {}", verified, expiryTime.before(new Date()));
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }

        if (invalidatedTokenRepository.existsById(signedJWT.getJWTClaimsSet().getJWTID())) {
            log.warn("Token is invalidated - JIT: {}", signedJWT.getJWTClaimsSet().getJWTID());
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }

        log.debug("Token verification successful");
        return signedJWT;
    }

    private String buildScope(User user) {
        StringJoiner stringJoiner = new StringJoiner(" ");

        if (!CollectionUtils.isEmpty(user.getRoles()))
            user.getRoles().forEach(role -> {
                stringJoiner.add("ROLE_" + role.getCode());
            });

        return stringJoiner.toString();
    }
}
