package com.auca.diacare.notification.service;

import java.util.List;

import com.auca.diacare.notification.model.Notification;
import com.auca.diacare.notification.model.Notification.Type;

public interface NotificationService {
    Notification send(String recipientEmail, Type type, String message);
    List<Notification> getMyNotifications(String email);
    List<Notification> getUnreadNotifications(String email);
    Notification markAsRead(Long id);
    void deleteNotification(Long id);
}
