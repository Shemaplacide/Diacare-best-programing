import api from './axios'

export const getChatableUsers        = ()                       => api.get('/chat/users')
export const getOrCreateConversation = (otherUserEmail)         => api.post('/chat/conversations', { otherUserEmail })
export const getMyConversations      = ()                       => api.get('/chat/conversations')
export const getMessages             = (conversationId)         => api.get(`/chat/conversations/${conversationId}/messages`)
export const markRead                = (conversationId)         => api.put(`/chat/conversations/${conversationId}/read`)
export const getTotalUnread          = ()                       => api.get('/chat/unread/count')
export const getUnreadPerConversation= (ids)                    => api.post('/chat/unread/per-conversation', ids)
export const acknowledgeEmergency    = (messageId)              => api.put(`/chat/messages/${messageId}/acknowledge-emergency`)
export const getActiveEmergencies    = ()                       => api.get('/chat/emergencies')
