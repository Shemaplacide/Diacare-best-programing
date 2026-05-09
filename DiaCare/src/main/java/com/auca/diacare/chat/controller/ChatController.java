package com.auca.diacare.chat.controller;

import java.security.Principal;
import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.auca.diacare.auth.model.Role;
import com.auca.diacare.auth.model.User;
import com.auca.diacare.auth.repository.UserRepository;
import com.auca.diacare.chat.dto.ChatMessageDTO;
import com.auca.diacare.chat.dto.ChatMessageResponse;
import com.auca.diacare.chat.dto.ConversationDTO;
import com.auca.diacare.chat.dto.ConversationResponse;
import com.auca.diacare.chat.service.ChatService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/chat")
@Tag(name = "Chat", description = "Real-time messaging between doctors, patients, and admin")
@SecurityRequirement(name = "bearerAuth")
public class ChatController {

    private final ChatService chatService;
    private final SimpMessagingTemplate messagingTemplate;
    private final UserRepository userRepository;

    public ChatController(ChatService chatService, SimpMessagingTemplate messagingTemplate,
                          UserRepository userRepository) {
        this.chatService       = chatService;
        this.messagingTemplate = messagingTemplate;
        this.userRepository    = userRepository;
    }

    // ── REST ──────────────────────────────────────────────────────────────────

    @Operation(summary = "Get list of users available to chat with")
    @GetMapping("/users")
    public ResponseEntity<List<Map<String, String>>> getChatableUsers(Authentication auth) {
        String email   = auth.getName();
        String roleStr = auth.getAuthorities().iterator().next().getAuthority().replace("ROLE_", "");
        Role   myRole  = Role.valueOf(roleStr);

        List<Map<String, String>> result = userRepository.findAll().stream()
                .filter(u -> !u.getEmail().equals(email) && u.isActive() && u.getRole() != myRole)
                .map(u -> Map.of(
                        "email",    u.getEmail(),
                        "username", u.getUsername(),
                        "role",     u.getRole().name()))
                .toList();

        return ResponseEntity.ok(result);
    }

    @Operation(summary = "Get or create a conversation with another user")
    @PostMapping("/conversations")
    public ResponseEntity<ConversationResponse> getOrCreate(@Valid @RequestBody ConversationDTO dto,
                                                            Authentication auth) {
        return ResponseEntity.ok(
                chatService.getOrCreateConversation(auth.getName(), dto.getOtherUserEmail()));
    }

    @Operation(summary = "List all my conversations")
    @GetMapping("/conversations")
    public ResponseEntity<List<ConversationResponse>> myConversations(Authentication auth) {
        return ResponseEntity.ok(chatService.getMyConversations(auth.getName()));
    }

    @Operation(summary = "Get message history for a conversation")
    @GetMapping("/conversations/{id}/messages")
    public ResponseEntity<List<ChatMessageResponse>> messages(@PathVariable Long id) {
        return ResponseEntity.ok(chatService.getMessages(id));
    }

    @Operation(summary = "Mark all messages in a conversation as read")
    @PutMapping("/conversations/{id}/read")
    public ResponseEntity<Void> markRead(@PathVariable Long id, Authentication auth) {
        chatService.markMessagesRead(id, auth.getName());
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Get total unread message count")
    @GetMapping("/unread/count")
    public ResponseEntity<Long> unreadCount(Authentication auth) {
        return ResponseEntity.ok(chatService.getTotalUnread(auth.getName()));
    }

    @Operation(summary = "Get unread counts per conversation")
    @PostMapping("/unread/per-conversation")
    public ResponseEntity<Map<Long, Long>> unreadPerConv(@RequestBody List<Long> conversationIds,
                                                          Authentication auth) {
        return ResponseEntity.ok(chatService.getUnreadPerConversation(auth.getName(), conversationIds));
    }

    @Operation(summary = "Acknowledge an emergency message")
    @PutMapping("/messages/{id}/acknowledge-emergency")
    public ResponseEntity<ChatMessageResponse> acknowledgeEmergency(@PathVariable Long id) {
        return ResponseEntity.ok(chatService.acknowledgeEmergency(id));
    }

    @Operation(summary = "Get all active unacknowledged emergency messages")
    @GetMapping("/emergencies")
    public ResponseEntity<List<ChatMessageResponse>> activeEmergencies() {
        return ResponseEntity.ok(chatService.getActiveEmergencies());
    }

    // ── WebSocket STOMP ───────────────────────────────────────────────────────

    @MessageMapping("/chat.send")
    public void handleMessage(@Payload ChatMessageDTO dto, Principal principal) {
        String senderEmail = principal.getName();
        ChatMessageResponse saved = chatService.sendMessage(
                dto.getConversationId(), senderEmail, dto.getContent(), dto.isEmergency());

        // Find the other participant directly from the conversation
        ConversationResponse conv = chatService.getMyConversations(senderEmail).stream()
                .filter(c -> c.getId().equals(saved.getConversationId()))
                .findFirst()
                .orElse(null);

        if (conv != null) {
            String recipientEmail = conv.getParticipantOne().getEmail().equals(senderEmail)
                    ? conv.getParticipantTwo().getEmail()
                    : conv.getParticipantOne().getEmail();
            messagingTemplate.convertAndSendToUser(recipientEmail, "/queue/messages", saved);
        }
        messagingTemplate.convertAndSendToUser(senderEmail, "/queue/messages", saved);

        // Immediate admin alert for emergency messages
        if (saved.isEmergency()) {
            List<User> admins = userRepository.findAll().stream()
                    .filter(u -> u.getRole() == Role.ADMIN && u.isActive())
                    .toList();
            for (User admin : admins) {
                messagingTemplate.convertAndSendToUser(
                    admin.getEmail(), "/queue/emergency-alert",
                    Map.of(
                        "messageId",      saved.getId(),
                        "patientName",    saved.getSender().getUsername(),
                        "content",        saved.getContent(),
                        "sentAt",         saved.getSentAt().toString(),
                        "conversationId", saved.getConversationId(),
                        "alert",          "EMERGENCY: " + saved.getSender().getUsername() + " needs immediate help!"
                    )
                );
            }
        }
    }
}
