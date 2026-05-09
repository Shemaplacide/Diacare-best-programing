package com.auca.diacare.notification.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.auca.diacare.auth.model.User;
import com.auca.diacare.auth.repository.UserRepository;
import com.auca.diacare.notification.model.Notification;
import com.auca.diacare.notification.model.Notification.Type;
import com.auca.diacare.notification.repository.NotificationRepository;

@Service
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    public NotificationServiceImpl(NotificationRepository notificationRepository, UserRepository userRepository) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
    }

    @Override
    public Notification send(String recipientEmail, Type type, String message) {
        User recipient = userRepository.findByEmail(recipientEmail)
                .orElseThrow(() -> new RuntimeException("User not found: " + recipientEmail));

        Notification notification = new Notification();
        notification.setRecipient(recipient);
        notification.setType(type);
        notification.setMessage(message);

        return notificationRepository.save(notification);
    }

    @Override
    public List<Notification> getMyNotifications(String email) {
        return notificationRepository.findByRecipient_EmailOrderByCreatedAtDesc(email);
    }

    @Override
    public List<Notification> getUnreadNotifications(String email) {
        return notificationRepository.findByRecipient_EmailAndIsReadFalse(email);
    }

    @Override
    public Notification markAsRead(Long id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        notification.setRead(true);
        return notificationRepository.save(notification);
    }

    @Override
    public void deleteNotification(Long id) {
        notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        notificationRepository.deleteById(id);
    }
}
