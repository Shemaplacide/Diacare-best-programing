package com.auca.diacare.chat.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.auca.diacare.chat.model.ChatMessage;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {

    List<ChatMessage> findByConversation_IdOrderBySentAtAsc(Long conversationId);

    // Unread messages in a conversation not sent by the reader
    long countByConversation_IdAndIsReadFalseAndSender_EmailNot(Long conversationId, String senderEmail);

    // Total unread across ALL conversations for a user
    @Query("SELECT COUNT(m) FROM ChatMessage m WHERE " +
           "(m.conversation.participantOne.email = :email OR m.conversation.participantTwo.email = :email) " +
           "AND m.sender.email <> :email AND m.isRead = false")
    long countTotalUnreadForUser(@Param("email") String email);

    // Unread per conversation for a user (for badges on conversation list)
    @Query("SELECT COUNT(m) FROM ChatMessage m WHERE " +
           "m.conversation.id = :convId AND m.sender.email <> :email AND m.isRead = false")
    long countUnreadInConversation(@Param("convId") Long convId, @Param("email") String email);

    // Emergency messages not yet acknowledged and older than a given time (for escalation scheduler)
    @Query("SELECT m FROM ChatMessage m WHERE m.isEmergency = true AND m.emergencyAcknowledged = false " +
           "AND m.sentAt <= :cutoff")
    List<ChatMessage> findUnacknowledgedEmergenciesBefore(@Param("cutoff") LocalDateTime cutoff);

    // All unacknowledged emergencies (for admin dashboard alert)
    List<ChatMessage> findByIsEmergencyTrueAndEmergencyAcknowledgedFalse();
}
