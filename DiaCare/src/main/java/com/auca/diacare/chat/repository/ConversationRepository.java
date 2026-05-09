package com.auca.diacare.chat.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.auca.diacare.chat.model.Conversation;

public interface ConversationRepository extends JpaRepository<Conversation, Long> {

    @Query("SELECT c FROM Conversation c WHERE " +
           "(c.participantOne.email = :emailA AND c.participantTwo.email = :emailB) OR " +
           "(c.participantOne.email = :emailB AND c.participantTwo.email = :emailA)")
    Optional<Conversation> findByParticipants(@Param("emailA") String emailA, @Param("emailB") String emailB);

    @Query("SELECT c FROM Conversation c WHERE " +
           "c.participantOne.email = :email OR c.participantTwo.email = :email " +
           "ORDER BY c.createdAt DESC")
    List<Conversation> findAllByParticipant(@Param("email") String email);
}
