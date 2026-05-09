package com.auca.diacare.chat.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import com.auca.diacare.auth.model.Role;
import com.auca.diacare.auth.model.User;
import com.auca.diacare.auth.repository.UserRepository;
import com.auca.diacare.chat.model.ChatMessage;
import com.auca.diacare.chat.repository.ChatMessageRepository;

@Component
public class EmergencyEscalationScheduler {

    private final ChatMessageRepository chatMessageRepository;
    private final UserRepository        userRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public EmergencyEscalationScheduler(ChatMessageRepository chatMessageRepository,
                                        UserRepository userRepository,
                                        SimpMessagingTemplate messagingTemplate) {
        this.chatMessageRepository = chatMessageRepository;
        this.userRepository        = userRepository;
        this.messagingTemplate     = messagingTemplate;
    }

    // Runs every 60 seconds — checks for emergencies older than 5 minutes with no acknowledgement
    @Scheduled(fixedDelay = 60_000)
    public void escalateUnacknowledgedEmergencies() {
        LocalDateTime cutoff = LocalDateTime.now().minusMinutes(5);
        List<ChatMessage> stale = chatMessageRepository.findUnacknowledgedEmergenciesBefore(cutoff);

        if (stale.isEmpty()) return;

        List<User> admins = userRepository.findAll().stream()
                .filter(u -> u.getRole() == Role.ADMIN && u.isActive())
                .toList();

        for (ChatMessage msg : stale) {
            String patientName = msg.getSender().getUsername();
            String alert = String.format(
                "EMERGENCY ALERT: Patient \"%s\" sent an emergency message %d minutes ago with no response. Message: \"%s\"",
                patientName,
                java.time.temporal.ChronoUnit.MINUTES.between(msg.getSentAt(), LocalDateTime.now()),
                msg.getContent().length() > 80 ? msg.getContent().substring(0, 80) + "…" : msg.getContent()
            );

            for (User admin : admins) {
                messagingTemplate.convertAndSendToUser(
                    admin.getEmail(), "/queue/emergency-alert",
                    java.util.Map.of(
                        "messageId",    msg.getId(),
                        "patientName",  patientName,
                        "content",      msg.getContent(),
                        "sentAt",       msg.getSentAt().toString(),
                        "conversationId", msg.getConversation().getId(),
                        "alert",        alert
                    )
                );
            }
        }
    }
}
