package org.example.QuanLyMuaVu.Mapper;

import javax.annotation.processing.Generated;
import org.example.QuanLyMuaVu.DTO.Request.FarmerCreationRequest;
import org.example.QuanLyMuaVu.DTO.Request.FarmerUpdateRequest;
import org.example.QuanLyMuaVu.DTO.Request.UserUpdateRequest;
import org.example.QuanLyMuaVu.DTO.Response.FarmerResponse;
import org.example.QuanLyMuaVu.Entity.User;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-01-02T02:08:37+0700",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 17.0.12 (Oracle Corporation)"
)
@Component
public class FarmerMapperImpl implements FarmerMapper {

    @Override
    public User toUser(FarmerCreationRequest request) {
        if ( request == null ) {
            return null;
        }

        User.UserBuilder user = User.builder();

        user.email( request.getEmail() );
        user.phone( request.getPhone() );
        user.fullName( request.getFullName() );
        user.username( request.getUsername() );

        return user.build();
    }

    @Override
    public FarmerResponse toFarmerResponse(User user) {
        if ( user == null ) {
            return null;
        }

        FarmerResponse.FarmerResponseBuilder farmerResponse = FarmerResponse.builder();

        farmerResponse.id( user.getId() );
        farmerResponse.username( user.getUsername() );
        farmerResponse.email( user.getEmail() );
        farmerResponse.fullName( user.getFullName() );
        farmerResponse.phone( user.getPhone() );
        farmerResponse.roles( rolesToStringList( user.getRoles() ) );

        farmerResponse.status( user.getStatus() != null ? user.getStatus().getCode() : null );

        return farmerResponse.build();
    }

    @Override
    public void updateUser(User user, FarmerUpdateRequest request) {
        if ( request == null ) {
            return;
        }
    }

    @Override
    public void updateUserFromRequest(User user, UserUpdateRequest request) {
        if ( request == null ) {
            return;
        }

        user.setUsername( request.getUsername() );
        user.setEmail( request.getEmail() );
        user.setFullName( request.getFullName() );
        user.setPhone( request.getPhone() );
    }
}
