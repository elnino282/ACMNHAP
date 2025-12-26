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
<<<<<<< Updated upstream
    date = "2025-12-25T03:06:33+0700",
=======
    date = "2025-12-23T15:20:06+0700",
>>>>>>> Stashed changes
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 17.0.17 (Microsoft)"
)
@Component
public class FarmerMapperImpl implements FarmerMapper {

    @Override
    public User toUser(FarmerCreationRequest request) {
        if ( request == null ) {
            return null;
        }

        User.UserBuilder user = User.builder();

<<<<<<< Updated upstream
        user.email( request.getEmail() );
        user.phone( request.getPhone() );
        user.fullName( request.getFullName() );
=======
>>>>>>> Stashed changes
        user.username( request.getUsername() );
        user.password( request.getPassword() );

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
