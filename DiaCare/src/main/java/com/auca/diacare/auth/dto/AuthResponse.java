package com.auca.diacare.auth.dto;

import com.auca.diacare.auth.model.Role;

public class AuthResponse {
    private String access_token;
    private UserInfo user;

    public AuthResponse(String access_token, String email, String username, Role role) {
        this.access_token = access_token;
        this.user = new UserInfo(username, email, role);
    }

    public String getAccess_token() {
        return access_token;
    }

    public void setAccess_token(String access_token) {
        this.access_token = access_token;
    }

    public UserInfo getUser() {
        return user;
    }

    public void setUser(UserInfo user) {
        this.user = user;
    }

    public static class UserInfo {
        private String name;
        private String email;
        private Role role;

        public UserInfo(String name, String email, Role role) {
            this.name = name;
            this.email = email;
            this.role = role;
        }

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }

        public Role getRole() {
            return role;
        }

        public void setRole(Role role) {
            this.role = role;
        }
    }
}
