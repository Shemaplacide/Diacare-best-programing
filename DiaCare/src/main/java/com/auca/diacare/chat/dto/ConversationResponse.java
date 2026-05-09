package com.auca.diacare.chat.dto;

import java.time.LocalDateTime;

import com.auca.diacare.chat.model.Conversation;

public class ConversationResponse {

    private Long id;
    private ParticipantInfo participantOne;
    private ParticipantInfo participantTwo;
    private LocalDateTime createdAt;

    public static class ParticipantInfo {
        private Long id;
        private String username;
        private String email;
        private String role;

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getUsername() { return username; }
        public void setUsername(String u) { this.username = u; }
        public String getEmail() { return email; }
        public void setEmail(String e) { this.email = e; }
        public String getRole() { return role; }
        public void setRole(String r) { this.role = r; }
    }

    public static ConversationResponse from(Conversation conv) {
        ConversationResponse r = new ConversationResponse();
        r.id        = conv.getId();
        r.createdAt = conv.getCreatedAt();

        ParticipantInfo p1 = new ParticipantInfo();
        p1.id       = conv.getParticipantOne().getId();
        p1.username = conv.getParticipantOne().getUsername();
        p1.email    = conv.getParticipantOne().getEmail();
        p1.role     = conv.getParticipantOne().getRole().name();
        r.participantOne = p1;

        ParticipantInfo p2 = new ParticipantInfo();
        p2.id       = conv.getParticipantTwo().getId();
        p2.username = conv.getParticipantTwo().getUsername();
        p2.email    = conv.getParticipantTwo().getEmail();
        p2.role     = conv.getParticipantTwo().getRole().name();
        r.participantTwo = p2;

        return r;
    }

    public Long getId() { return id; }
    public ParticipantInfo getParticipantOne() { return participantOne; }
    public ParticipantInfo getParticipantTwo() { return participantTwo; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
