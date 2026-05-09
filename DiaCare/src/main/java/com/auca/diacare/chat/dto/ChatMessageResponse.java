package com.auca.diacare.chat.dto;

import java.time.LocalDateTime;

import com.auca.diacare.chat.model.ChatMessage;

public class ChatMessageResponse {

    private Long id;
    private Long conversationId;
    private SenderInfo sender;
    private String content;
    private boolean isRead;
    private boolean isEmergency;
    private boolean emergencyAcknowledged;
    private LocalDateTime sentAt;

    public static class SenderInfo {
        private Long id;
        private String username;
        private String email;
        private String role;

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getRole() { return role; }
        public void setRole(String role) { this.role = role; }
    }

    public static ChatMessageResponse from(ChatMessage msg) {
        ChatMessageResponse r = new ChatMessageResponse();
        r.id                    = msg.getId();
        r.conversationId        = msg.getConversation().getId();
        r.content               = msg.getContent();
        r.isRead                = msg.isRead();
        r.isEmergency           = msg.isEmergency();
        r.emergencyAcknowledged = msg.isEmergencyAcknowledged();
        r.sentAt                = msg.getSentAt();

        SenderInfo s = new SenderInfo();
        s.id       = msg.getSender().getId();
        s.username = msg.getSender().getUsername();
        s.email    = msg.getSender().getEmail();
        s.role     = msg.getSender().getRole().name();
        r.sender   = s;

        return r;
    }

    public Long getId() { return id; }
    public Long getConversationId() { return conversationId; }
    public SenderInfo getSender() { return sender; }
    public String getContent() { return content; }
    public boolean isRead() { return isRead; }
    public boolean isEmergency() { return isEmergency; }
    public boolean isEmergencyAcknowledged() { return emergencyAcknowledged; }
    public LocalDateTime getSentAt() { return sentAt; }
}
