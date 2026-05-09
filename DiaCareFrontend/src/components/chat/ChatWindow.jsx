import { useEffect, useRef, useState, useCallback } from 'react'
import { Send, Check, CheckCheck, ArrowLeft, AlertTriangle } from 'lucide-react'
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import { getMessages, markRead, acknowledgeEmergency } from '../../api/chat'
import { authStore } from '../../store/authStore'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8085/api/v1'
const WS_URL   = API_BASE.replace('/api/v1', '/ws')

function formatTime(dt) {
  if (!dt) return ''
  return new Date(dt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function formatDateLabel(dt) {
  const d         = new Date(dt)
  const today     = new Date()
  const yesterday = new Date(); yesterday.setDate(today.getDate() - 1)
  if (d.toDateString() === today.toDateString())     return 'Today'
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday'
  return d.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })
}

function groupByDate(messages) {
  const groups = []
  let lastLabel = null
  messages.forEach(msg => {
    const label = formatDateLabel(msg.sentAt)
    if (label !== lastLabel) { groups.push({ type: 'date', label }); lastLabel = label }
    groups.push({ type: 'msg', msg })
  })
  return groups
}

export default function ChatWindow({ conversation, onBack }) {
  const [messages, setMessages]       = useState([])
  const [text, setText]               = useState('')
  const [isEmergency, setIsEmergency] = useState(false)
  const bottomRef                     = useRef(null)
  const stompRef                      = useRef(null)
  const textareaRef                   = useRef(null)
  const currentEmail                  = authStore.getUser()?.email
  const currentRole                   = authStore.getRole()

  // Load history when conversation changes
  useEffect(() => {
    if (!conversation) return
    setMessages([])
    getMessages(conversation.id).then(r => setMessages(r.data)).catch(() => {})
    markRead(conversation.id).catch(() => {})
  }, [conversation])

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // WebSocket — one persistent connection, re-subscribe when conversation changes
  useEffect(() => {
    if (!conversation) return
    const token  = authStore.getToken()
    const convId = conversation.id

    const client = new Client({
      webSocketFactory: () => new SockJS(`${WS_URL}?token=${token}`),
      reconnectDelay: 5000,
      onConnect: () => {
        client.subscribe('/user/queue/messages', (frame) => {
          const msg = JSON.parse(frame.body)
          // FIX 1: backend DTO uses flat `conversationId`, not nested `conversation.id`
          const msgConvId = msg.conversationId ?? msg.conversation?.id
          if (msgConvId === convId) {
            setMessages(prev => prev.find(m => m.id === msg.id) ? prev : [...prev, msg])
          }
        })
      },
    })
    client.activate()
    stompRef.current = client
    return () => { client.deactivate() }
  }, [conversation])

  const send = useCallback(() => {
    const trimmed = text.trim()
    if (!trimmed || !stompRef.current?.connected) return
    stompRef.current.publish({
      destination: '/app/chat.send',
      body: JSON.stringify({
        conversationId: conversation.id,
        content: trimmed,
        emergency: isEmergency,
      }),
    })
    setText('')
    setIsEmergency(false)
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.focus()
    }
  }, [text, isEmergency, conversation])

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }
  }

  if (!conversation) {
    return (
      <div className="hidden md:flex flex-1 flex-col items-center justify-center gap-3 bg-[#F0F2F5]">
        <div className="w-20 h-20 rounded-full bg-[#DFE5E7] flex items-center justify-center">
          <Send size={32} className="text-[#8696A0]" />
        </div>
        <p className="text-[#8696A0] text-sm font-medium">Select a conversation to start chatting</p>
      </div>
    )
  }

  const other    = conversation.participantOne?.email === currentEmail
    ? conversation.participantTwo : conversation.participantOne
  const initials = other?.username?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  const grouped  = groupByDate(messages)

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-[#EFEAE2]"
      style={{ backgroundImage: 'radial-gradient(circle, #d4d4d4 1px, transparent 1px)', backgroundSize: '20px 20px' }}>

      {/* Header */}
      <div className="flex items-center gap-3 px-3 py-3 bg-[#F0F2F5] border-b border-[#E9EDEF] shrink-0">
        {onBack && (
          <button onClick={onBack}
            className="md:hidden w-8 h-8 flex items-center justify-center rounded-full bg-transparent border-0 cursor-pointer text-[#1E293B] hover:bg-[#E9EDEF] transition shrink-0">
            <ArrowLeft size={20} />
          </button>
        )}
        <div className="w-10 h-10 rounded-full bg-[#0A4174] text-white flex items-center justify-center text-sm font-bold shrink-0">
          {initials}
        </div>
        <div>
          <p className="font-semibold text-[#1E293B] text-sm m-0">{other?.username}</p>
          <p className="text-xs text-[#8696A0] m-0 capitalize">{other?.role?.toLowerCase()}</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 py-3 flex flex-col gap-1">
        {messages.length === 0 && (
          <div className="flex justify-center mt-6">
            <span className="bg-white/80 text-[#8696A0] text-xs px-4 py-1.5 rounded-full shadow-sm">
              No messages yet — say hello! 👋
            </span>
          </div>
        )}

        {grouped.map((item, i) => {
          if (item.type === 'date') return (
            <div key={`d-${i}`} className="flex justify-center my-2">
              <span className="bg-white/80 text-[#8696A0] text-xs px-3 py-1 rounded-full shadow-sm">
                {item.label}
              </span>
            </div>
          )

          const { msg }  = item
          const mine     = msg.sender?.email === currentEmail
          const isEmerg  = msg.isEmergency === true

          // FIX 2: bubble and tail colours — emergency overrides normal green/white
          const bubbleBg  = isEmerg
            ? (mine ? 'bg-red-100 border border-red-300' : 'bg-red-50 border border-red-300')
            : (mine ? 'bg-[#D9FDD3]' : 'bg-white')
          const tailBg    = isEmerg
            ? (mine ? 'bg-red-100' : 'bg-red-50')
            : (mine ? 'bg-[#D9FDD3]' : 'bg-white')
          const roundedCorner = mine ? 'rounded-tr-none' : 'rounded-tl-none'
          const tailSide      = mine ? '-right-2' : '-left-2'
          const tailTranslate = mine ? '-translate-x-2' : 'translate-x-0'

          return (
            <div key={msg.id} className={`flex flex-col ${mine ? 'items-end' : 'items-start'}`}>

              {/* FIX 3: Emergency label + acknowledge */}
              {isEmerg && (
                <div className={`flex items-center gap-1 mb-0.5 text-[11px] font-bold text-red-600 ${mine ? 'mr-2' : 'ml-2'}`}>
                  <AlertTriangle size={11} />
                  <span>SOS</span>
                  {!msg.emergencyAcknowledged && (currentRole === 'ADMIN' || currentRole === 'DOCTOR') && (
                    <button
                      onClick={() =>
                        acknowledgeEmergency(msg.id)
                          .then(r => setMessages(prev => prev.map(m => m.id === r.data.id ? r.data : m)))
                          .catch(() => {})
                      }
                      className="ml-1 text-[10px] bg-red-600 text-white px-2 py-0.5 rounded-full border-0 cursor-pointer hover:bg-red-700 transition">
                      Acknowledge
                    </button>
                  )}
                  {msg.emergencyAcknowledged && (
                    <span className="ml-1 text-[10px] text-green-600 font-semibold">✓ Acknowledged</span>
                  )}
                </div>
              )}

              {/* Bubble */}
              <div className={`relative max-w-[75%] sm:max-w-[65%] px-3 pt-2 pb-1 rounded-lg shadow-sm text-sm leading-relaxed ${bubbleBg} ${roundedCorner}`}>
                {/* Tail */}
                <div className={`absolute top-0 w-2 h-2 overflow-hidden ${tailSide}`}>
                  <div className={`w-4 h-4 rotate-45 ${tailBg} ${tailTranslate}`} />
                </div>

                <p className="m-0 text-[#1E293B] break-words">{msg.content}</p>

                {/* FIX 2: ticks — use read/isRead from DTO */}
                <div className="flex items-center justify-end gap-1 mt-0.5">
                  <span className="text-[10px] text-[#8696A0]">{formatTime(msg.sentAt)}</span>
                  {mine && (
                    msg.read || msg.isRead
                      ? <CheckCheck size={12} className="text-[#53BDEB]" />
                      : <Check size={12} className="text-[#8696A0]" />
                  )}
                </div>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div className={`flex items-end gap-2 px-3 py-2 shrink-0 transition-colors ${isEmergency ? 'bg-red-50 border-t border-red-200' : 'bg-[#F0F2F5]'}`}>
        {/* Emergency toggle — patients only */}
        {currentRole === 'PATIENT' && (
          <button
            onClick={() => setIsEmergency(v => !v)}
            title={isEmergency ? 'Cancel emergency' : 'Flag as SOS emergency'}
            className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 border-0 cursor-pointer transition shadow-sm
              ${isEmergency ? 'bg-red-600 text-white animate-pulse' : 'bg-white text-red-500 hover:bg-red-50'}`}>
            <AlertTriangle size={18} />
          </button>
        )}

        <div className={`flex-1 rounded-3xl px-4 py-2 flex items-end shadow-sm ${isEmergency ? 'bg-red-50 border border-red-300' : 'bg-white'}`}>
          <textarea
            ref={textareaRef}
            rows={1}
            value={text}
            onChange={e => {
              setText(e.target.value)
              e.target.style.height = 'auto'
              e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'
            }}
            onKeyDown={onKeyDown}
            placeholder={isEmergency ? '🚨 SOS — admin will be alerted immediately…' : 'Type a message'}
            className={`flex-1 resize-none border-0 outline-none text-sm bg-transparent leading-relaxed
              ${isEmergency ? 'text-red-700 placeholder-red-400' : 'text-[#1E293B]'}`}
            style={{ maxHeight: 120 }}
          />
        </div>

        <button onClick={send} disabled={!text.trim()}
          className={`w-11 h-11 rounded-full text-white flex items-center justify-center shrink-0 disabled:opacity-40 transition shadow
            ${isEmergency ? 'bg-red-600 hover:bg-red-700' : 'bg-[#0A4174] hover:bg-[#0d5299]'}`}>
          <Send size={18} />
        </button>
      </div>
    </div>
  )
}
