package com.auca.diacare.admin.model;

import java.time.LocalDateTime;

import com.auca.diacare.auth.model.Role;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "activity_logs")
public class ActivityLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String fullName;
    private String email;

    @Enumerated(EnumType.STRING)
    private Role role;

    private String portalAccessed;
    private LocalDateTime loginAt;
    private LocalDateTime logoutAt;
    private String loginStatus;

    @Column(length = 500)
    private String deviceOrBrowser;

    @Column(length = 500)
    private String recentActivity;

    public Long getId() { return id; }
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }
    public String getPortalAccessed() { return portalAccessed; }
    public void setPortalAccessed(String portalAccessed) { this.portalAccessed = portalAccessed; }
    public LocalDateTime getLoginAt() { return loginAt; }
    public void setLoginAt(LocalDateTime loginAt) { this.loginAt = loginAt; }
    public LocalDateTime getLogoutAt() { return logoutAt; }
    public void setLogoutAt(LocalDateTime logoutAt) { this.logoutAt = logoutAt; }
    public String getLoginStatus() { return loginStatus; }
    public void setLoginStatus(String loginStatus) { this.loginStatus = loginStatus; }
    public String getDeviceOrBrowser() { return deviceOrBrowser; }
    public void setDeviceOrBrowser(String deviceOrBrowser) { this.deviceOrBrowser = deviceOrBrowser; }
    public String getRecentActivity() { return recentActivity; }
    public void setRecentActivity(String recentActivity) { this.recentActivity = recentActivity; }
}
