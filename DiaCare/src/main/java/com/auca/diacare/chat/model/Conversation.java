package com.auca.diacare.chat.model;

import java.time.LocalDateTime;

import com.auca.diacare.auth.model.User;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

@Entity
@Table(name = "conversations", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"participant_one_id", "participant_two_id"})
})
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Conversation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "participant_one_id", nullable = false)
    private User participantOne;

    @ManyToOne
    @JoinColumn(name = "participant_two_id", nullable = false)
    private User participantTwo;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() { createdAt = LocalDateTime.now(); }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getParticipantOne() { return participantOne; }
    public void setParticipantOne(User p) { this.participantOne = p; }

    public User getParticipantTwo() { return participantTwo; }
    public void setParticipantTwo(User p) { this.participantTwo = p; }

    public LocalDateTime getCreatedAt() { return createdAt; }
}
