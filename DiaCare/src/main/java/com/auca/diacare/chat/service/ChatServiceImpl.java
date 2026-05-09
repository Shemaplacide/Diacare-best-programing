package com.auca.diacare.chat.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.auca.diacare.auth.model.User;
import com.auca.diacare.auth.repository.UserRepository;
import com.auca.diacare.chat.dto.ChatMessageResponse;
import com.auca.diacare.chat.dto.ConversationResponse;
import com.auca.diacare.chat.model.ChatMessage;
import com.auca.diacare.chat.model.Conversation;
import com.auca.diacare.chat.repository.ChatMessageRepository;
import com.auca.diacare.chat.repository.ConversationRepository;

@Service
public class ChatServiceImpl implements ChatService {

    private final ConversationRepository conversationRepository;
    private final ChatMessageRepository  chatMessageRepository;
    private final UserRepository         userRepository;

    public ChatServiceImpl(ConversationRepository conversationRepository,
                           ChatMessageRepository chatMessageRepository,
                           UserRepository userRepository) {
        this.conversationRepository = conversationRepository;
        this.chatMessageRepository  = chatMessageRepository;
        this.userRepository         = userRepository;
    }

    @Override
    @Transactional
    public ConversationResponse getOrCreateConversation(String currentUserEmail, String otherUserEmail) {
        Conversation conv = conversationRepository.findByParticipants(currentUserEmail, otherUserEmail)
                .orElseGet(() -> {
                    User current = findUser(currentUserEmail);
                    User other   = findUser(otherUserEmail);
                    Conversation c = new Conversation();
                    c.setParticipantOne(current);
                    c.setParticipantTwo(other);
                    return conversationRepository.save(c);
                });
        return ConversationResponse.from(conv);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ConversationResponse> getMyConversations(String email) {
        return conversationRepository.findAllByParticipant(email)
                .stream()
                .map(ConversationResponse::from)
                .toList();
    }

    @Override
    @Transactional
    public ChatMessageResponse sendMessage(Long conversationId, String senderEmail, String content, boolean isEmergency) {
        Conversation conv  = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new RuntimeException("Conversation not found"));
        User sender = findUser(senderEmail);

        ChatMessage msg = new ChatMessage();
        msg.setConversation(conv);
        msg.setSender(sender);
        msg.setContent(content);
        msg.setEmergency(isEmergency);
        return ChatMessageResponse.from(chatMessageRepository.save(msg));
    }

    @Override
    @Transactional(readOnly = true)
    public List<ChatMessageResponse> getMessages(Long conversationId) {
        return chatMessageRepository.findByConversation_IdOrderBySentAtAsc(conversationId)
                .stream()
                .map(ChatMessageResponse::from)
                .toList();
    }

    @Override
    @Transactional
    public void markMessagesRead(Long conversationId, String readerEmail) {
        List<ChatMessage> unread = chatMessageRepository
                .findByConversation_IdOrderBySentAtAsc(conversationId)
                .stream()
                .filter(m -> !m.getSender().getEmail().equals(readerEmail) && !m.isRead())
                .toList();
        unread.forEach(m -> m.setRead(true));
        chatMessageRepository.saveAll(unread);
    }

    @Override
    @Transactional(readOnly = true)
    public long getTotalUnread(String email) {
        return chatMessageRepository.countTotalUnreadForUser(email);
    }

    @Override
    @Transactional(readOnly = true)
    public Map<Long, Long> getUnreadPerConversation(String email, List<Long> conversationIds) {
        Map<Long, Long> result = new HashMap<>();
        conversationIds.forEach(id ->
            result.put(id, chatMessageRepository.countUnreadInConversation(id, email)));
        return result;
    }

    @Override
    @Transactional
    public ChatMessageResponse acknowledgeEmergency(Long messageId) {
        ChatMessage msg = chatMessageRepository.findById(messageId)
                .orElseThrow(() -> new RuntimeException("Message not found"));
        msg.setEmergencyAcknowledged(true);
        return ChatMessageResponse.from(chatMessageRepository.save(msg));
    }

    @Override
    @Transactional(readOnly = true)
    public List<ChatMessageResponse> getActiveEmergencies() {
        return chatMessageRepository.findByIsEmergencyTrueAndEmergencyAcknowledgedFalse()
                .stream()
                .map(ChatMessageResponse::from)
                .toList();
    }

    private User findUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found: " + email));
    }
}
