import { useEffect, useState, useRef } from 'react'
import { AlertTriangle } from 'lucide-react'
import { toast } from 'react-toastify'
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import {
  getChatableUsers, getMyConversations, getOrCreateConversation,
  getMessages, getUnreadPerConversation, getActiveEmergencies, acknowledgeEmergency,
} from '../../api/chat'
import { authStore } from '../../store/authStore'
import ConversationList from './ConversationList'
import ChatWindow from './ChatWindow'
import NewChatModal from './NewChatModal'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8085/api/v1'
const WS_URL   = API_BASE.replace('/api/v1', '/ws')

export default function ChatPage({ infoMessage }) {
  const [conversations, setConversations] = useState([])
  const [selected, setSelected]           = useState(null)
  const [chatableUsers, setChatableUsers] = useState([])
  const [showModal, setShowModal]         = useState(false)
  const [lastMessages, setLastMessages]   = useState({})
  const [unreadCounts, setUnreadCounts]   = useState({})
  const [emergencies, setEmergencies]     = useState([])
  const [starting, setStarting]           = useState(false)
  const [mobileView, setMobileView]       = useState('list')
  const stompRef                          = useRef(null)
  const currentRole                       = authStore.getRole()
  const currentEmail                      = authStore.getUser()?.email

  // Load conversations, users, unread counts, and active emergencies
  useEffect(() => {
    Promise.all([getMyConversations(), getChatableUsers()])
      .then(([convRes, usersRes]) => {
        const convs = convRes.data
        setConversations(convs)
        setChatableUsers(usersRes.data)

        // Last message previews
        convs.forEach(conv => {
          getMessages(conv.id).then(r => {
            const msgs = r.data
            if (msgs.length > 0)
              setLastMessages(prev => ({ ...prev, [conv.id]: msgs[msgs.length - 1] }))
          }).catch(() => {})
        })

        // Unread counts per conversation
        if (convs.length > 0) {
          getUnreadPerConversation(convs.map(c => c.id))
            .then(r => setUnreadCounts(r.data))
            .catch(() => {})
        }
      })
      .catch(() => toast.error('Failed to load chat'))

    // Load active emergencies for admin
    if (currentRole === 'ADMIN') {
      getActiveEmergencies().then(r => setEmergencies(r.data)).catch(() => {})
    }
  }, [])

  // WebSocket for emergency alerts (admin only)
  useEffect(() => {
    if (currentRole !== 'ADMIN') return
    const token  = authStore.getToken()
    const client = new Client({
      webSocketFactory: () => new SockJS(`${WS_URL}?token=${token}`),
      reconnectDelay: 5000,
      onConnect: () => {
        client.subscribe('/user/queue/emergency-alert', (frame) => {
          const alert = JSON.parse(frame.body)
          setEmergencies(prev => {
            // avoid duplicates by messageId
            if (prev.find(e => e.id === alert.messageId)) return prev
            return [...prev, {
              id: alert.messageId,
              content: alert.content,
              sentAt: alert.sentAt,
              conversationId: alert.conversationId,
              sender: { username: alert.patientName },
              emergencyAcknowledged: false,
            }]
          })
          toast.error(`🚨 Emergency: ${alert.patientName} needs immediate help!`, { autoClose: false })
        })
      },
    })
    client.activate()
    stompRef.current = client
    return () => { client.deactivate() }
  }, [currentRole])

  // When a new message arrives via WebSocket, update unread count for that conversation
  // (ChatWindow handles its own messages; we just need to update the badge on the list)
  const handleNewMessageForList = (convId) => {
    if (selected?.id !== convId) {
      setUnreadCounts(prev => ({ ...prev, [convId]: (prev[convId] || 0) + 1 }))
    }
  }

  const handleSelectConv = (conv) => {
    setSelected(conv)
    setMobileView('chat')
    // Clear unread badge for this conversation
    setUnreadCounts(prev => ({ ...prev, [conv.id]: 0 }))
  }

  const handleSelectUser = async (user) => {
    setShowModal(false)
    setStarting(true)
    try {
      const { data } = await getOrCreateConversation(user.email)
      setConversations(prev => prev.find(c => c.id === data.id) ? prev : [data, ...prev])
      setSelected(data)
      setMobileView('chat')
    } catch {
      toast.error('Could not start conversation')
    } finally {
      setStarting(false)
    }
  }

  const handleAcknowledge = async (msgId) => {
    try {
      await acknowledgeEmergency(msgId)
      setEmergencies(prev => prev.filter(e => e.id !== msgId))
      toast.success('Emergency acknowledged')
    } catch {
      toast.error('Failed to acknowledge')
    }
  }

  const handleBack = () => {
    setMobileView('list')
    setSelected(null)
  }

  const totalUnread = Object.values(unreadCounts).reduce((a, b) => a + b, 0)

  return (
    <div className="flex flex-col gap-3" style={{ height: 'calc(100vh - 130px)' }}>

      {/* Optional info banner */}
      {infoMessage && (
        <div className="bg-[#EFF6FF] border border-[#BFDBFE] rounded-xl px-4 py-2.5 text-sm text-[#1E40AF] shrink-0">
          {infoMessage}
        </div>
      )}

      {/* Admin emergency alert banner */}
      {currentRole === 'ADMIN' && emergencies.length > 0 && (
        <div className="shrink-0 flex flex-col gap-2">
          {emergencies.map(e => (
            <div key={e.id}
              className="flex items-start gap-3 bg-red-50 border border-red-300 rounded-xl px-4 py-3 animate-pulse">
              <AlertTriangle size={18} className="text-red-600 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-red-700 m-0">
                  🚨 Emergency from {e.sender?.username}
                </p>
                <p className="text-xs text-red-600 m-0 truncate mt-0.5">{e.content}</p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => {
                    const conv = conversations.find(c => c.id === e.conversationId)
                    if (conv) handleSelectConv(conv)
                  }}
                  className="text-xs bg-red-600 text-white px-3 py-1.5 rounded-lg border-0 cursor-pointer hover:bg-red-700 transition">
                  Open Chat
                </button>
                <button
                  onClick={() => handleAcknowledge(e.id)}
                  className="text-xs bg-white text-red-600 border border-red-300 px-3 py-1.5 rounded-lg cursor-pointer hover:bg-red-50 transition">
                  Acknowledge
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Chat layout */}
      <div className="flex flex-1 min-h-0 rounded-2xl overflow-hidden border border-[#E9EDEF] shadow-sm">

        {/* Conversation list panel */}
        <div className={`
          flex-col h-full
          ${mobileView === 'list' ? 'flex' : 'hidden'}
          md:flex md:w-72 md:shrink-0
          w-full
        `}>
          <ConversationList
            conversations={conversations}
            selected={selected}
            onSelect={handleSelectConv}
            lastMessages={lastMessages}
            unreadCounts={unreadCounts}
            totalUnread={totalUnread}
            onNewChat={() => setShowModal(true)}
          />
        </div>

        {/* Chat window panel */}
        <div className={`
          flex-col flex-1 min-w-0 h-full
          ${mobileView === 'chat' ? 'flex' : 'hidden'}
          md:flex
        `}>
          <ChatWindow
            conversation={selected}
            onBack={handleBack}
          />
        </div>
      </div>

      {showModal && (
        <NewChatModal
          users={chatableUsers}
          onSelect={handleSelectUser}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  )
}
