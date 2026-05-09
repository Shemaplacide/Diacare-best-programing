package com.auca.diacare.chat.service;

import java.util.List;
import java.util.Map;

import com.auca.diacare.chat.dto.ChatMessageResponse;
import com.auca.diacare.chat.dto.ConversationResponse;
import com.auca.diacare.chat.model.ChatMessage;
import com.auca.diacare.chat.model.Conversation;

public interface ChatService {

    ConversationResponse getOrCreateConversation(String currentUserEmail, String otherUserEmail);

    List<ConversationResponse> getMyConversations(String email);

    ChatMessageResponse sendMessage(Long conversationId, String senderEmail, String content, boolean isEmergency);

    List<ChatMessageResponse> getMessages(Long conversationId);

    void markMessagesRead(Long conversationId, String readerEmail);

    long getTotalUnread(String email);

    Map<Long, Long> getUnreadPerConversation(String email, List<Long> conversationIds);

    ChatMessageResponse acknowledgeEmergency(Long messageId);

    List<ChatMessageResponse> getActiveEmergencies();
}
