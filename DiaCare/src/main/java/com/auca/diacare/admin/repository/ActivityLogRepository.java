package com.auca.diacare.admin.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.auca.diacare.admin.model.ActivityLog;

@Repository
public interface ActivityLogRepository extends JpaRepository<ActivityLog, Long> {
    List<ActivityLog> findTop1ByEmailAndLoginStatusOrderByLoginAtDesc(String email, String loginStatus);
}
