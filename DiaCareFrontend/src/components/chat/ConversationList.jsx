import { Edit } from 'lucide-react'
import { authStore } from '../../store/authStore'

function timeAgo(dt) {
  if (!dt) return ''
  const d         = new Date(dt)
  const today     = new Date()
  const yesterday = new Date(); yesterday.setDate(today.getDate() - 1)
  if (d.toDateString() === today.toDateString())
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday'
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' })
}

export default function ConversationList({ conversations, selected, onSelect, lastMessages, unreadCounts, totalUnread, onNewChat }) {
  const currentEmail = authStore.getUser()?.email

  return (
    <div className="flex flex-col bg-white border-r border-[#E9EDEF] h-full w-full">

      {/* Header — title + total unread badge + new chat button */}
      <div className="flex items-center justify-between px-4 py-4 bg-[#F0F2F5] border-b border-[#E9EDEF] shrink-0">
        <div className="flex items-center gap-2">
          <p className="font-bold text-[#1E293B] text-base m-0">Chats</p>
          {totalUnread > 0 && (
            <span className="min-w-[20px] h-5 px-1.5 rounded-full bg-[#0A4174] text-white text-[11px] font-bold flex items-center justify-center">
              {totalUnread > 99 ? '99+' : totalUnread}
            </span>
          )}
        </div>
        <button
          onClick={onNewChat}
          title="New chat"
          className="w-9 h-9 rounded-full bg-[#0A4174] text-white flex items-center justify-center border-0 cursor-pointer hover:bg-[#0d5299] transition shadow-sm">
          <Edit size={16} />
        </button>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 && (
          <p className="text-center text-sm text-[#8696A0] mt-10 px-4">
            No conversations yet.<br />Tap the pencil icon to start one.
          </p>
        )}
        {conversations.map(conv => {
          const other    = conv.participantOne?.email === currentEmail
            ? conv.participantTwo : conv.participantOne
          const initials = other?.username?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
          const isActive = selected?.id === conv.id
          const last     = lastMessages?.[conv.id]
          const unread   = unreadCounts?.[conv.id] || 0

          return (
            <button key={conv.id} onClick={() => onSelect(conv)}
              className={`w-full flex items-center gap-3 px-4 py-3 border-0 cursor-pointer transition text-left
                ${isActive ? 'bg-[#F0F2F5]' : 'bg-white hover:bg-[#F5F6F6]'}`}>

              {/* Avatar */}
              <div className="relative shrink-0">
                <div className="w-12 h-12 rounded-full bg-[#0A4174] text-white flex items-center justify-center text-sm font-bold">
                  {initials}
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <p className={`text-sm m-0 truncate ${unread > 0 ? 'font-bold text-[#1E293B]' : 'font-semibold text-[#1E293B]'}`}>
                    {other?.username}
                  </p>
                  {last && (
                    <span className={`text-[11px] shrink-0 ${unread > 0 ? 'text-[#0A4174] font-semibold' : 'text-[#8696A0]'}`}>
                      {timeAgo(last.sentAt)}
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between gap-1 mt-0.5">
                  <p className={`text-xs m-0 truncate ${unread > 0 ? 'text-[#1E293B] font-medium' : 'text-[#8696A0]'}`}>
                    {last ? last.content : <span className="italic">No messages yet</span>}
                  </p>
                  {/* Unread badge */}
                  {unread > 0 && (
                    <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-[#0A4174] text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                      {unread > 99 ? '99+' : unread}
                    </span>
                  )}
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
