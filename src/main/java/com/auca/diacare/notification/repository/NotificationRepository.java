package com.auca.diacare.notification.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.auca.diacare.notification.model.Notification;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByRecipient_EmailOrderByCreatedAtDesc(String email);
    List<Notification> findByRecipient_EmailAndIsReadFalse(String email);
}
