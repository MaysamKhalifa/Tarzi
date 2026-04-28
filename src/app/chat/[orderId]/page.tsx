'use client'

import { use, useState, useEffect, useRef } from 'react'
import { Send, Phone, Scissors } from 'lucide-react'
import PageHeader from '@/components/layout/PageHeader'
import { createClient } from '@/lib/supabase/client'
import { useApp } from '@/lib/context/AppContext'
import type { ChatMessage, Order } from '@/types/database'

export default function ChatPage({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = use(params)
  const { user, profile } = useApp()
  const [order, setOrder] = useState<Order | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [loading, setLoading] = useState(true)
  const bottomRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  useEffect(() => {
    if (!user) return

    // Fetch order
    supabase.from('orders').select('*').eq('id', orderId).eq('user_id', user.id).single()
      .then(({ data }) => { setOrder(data); })

    // Fetch existing messages
    supabase.from('chat_messages').select('*').eq('order_id', orderId)
      .order('created_at', { ascending: true })
      .then(({ data }) => {
        setMessages(data || [])
        setLoading(false)
      })

    // Realtime subscription
    const channel = supabase
      .channel(`chat:${orderId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_messages',
        filter: `order_id=eq.${orderId}`,
      }, payload => {
        setMessages(prev => [...prev, payload.new as ChatMessage])
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [user, orderId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async () => {
    if (!input.trim() || !user || sending) return
    setSending(true)
    const msg = input.trim()
    setInput('')

    const { error } = await supabase.from('chat_messages').insert({
      order_id: orderId,
      sender_id: user.id,
      sender_type: 'user',
      sender_name: profile?.full_name || user.email || 'You',
      message: msg,
    })

    if (error) setInput(msg)
    setSending(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const formatTime = (ts: string) => {
    return new Date(ts).toLocaleTimeString('en-AE', { hour: '2-digit', minute: '2-digit' })
  }

  const formatDate = (ts: string) => {
    const d = new Date(ts)
    const today = new Date()
    if (d.toDateString() === today.toDateString()) return 'Today'
    const yesterday = new Date(today)
    yesterday.setDate(today.getDate() - 1)
    if (d.toDateString() === yesterday.toDateString()) return 'Yesterday'
    return d.toLocaleDateString('en-AE', { month: 'short', day: 'numeric' })
  }

  // Group messages by date
  const grouped: { date: string; messages: ChatMessage[] }[] = []
  messages.forEach(msg => {
    const dateLabel = formatDate(msg.created_at)
    const last = grouped[grouped.length - 1]
    if (!last || last.date !== dateLabel) {
      grouped.push({ date: dateLabel, messages: [msg] })
    } else {
      last.messages.push(msg)
    }
  })

  return (
    <div className="h-dvh flex flex-col bg-white">
      {/* Header */}
      <div className="px-4 pt-12 pb-3 flex items-center gap-3"
        style={{ background: 'linear-gradient(135deg, #e91e8c 0%, #f06292 100%)' }}>
        <PageHeader
          title={order?.tailor_name || 'Chat with Tailor'}
          subtitle={order ? `${order.order_number} • ${order.garment_type}` : 'Loading...'}
          transparent
          rightElement={
            <a href={`tel:+971500000000`}
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/20">
              <Phone size={18} color="white" />
            </a>
          }
        />
      </div>

      {/* Chat area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-1"
        style={{ background: '#f8f8f8' }}>
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="w-8 h-8 rounded-full border-2 border-pink-200 border-t-pink-500 animate-spin" />
          </div>
        ) : (
          <>
            {/* System message */}
            <div className="text-center mb-4">
              <span className="px-4 py-1.5 rounded-full text-xs"
                style={{ background: '#e8e8e8', color: '#757575' }}>
                Chat with your tailor about your order
              </span>
            </div>

            {grouped.length === 0 && (
              <div className="flex flex-col items-center justify-center flex-1 gap-3 py-12">
                <div className="w-16 h-16 rounded-full flex items-center justify-center"
                  style={{ background: '#fce4ec' }}>
                  <Scissors size={28} color="#e91e8c" />
                </div>
                <p style={{ fontSize: 15, fontWeight: 700, color: '#1a1a1a' }}>Start the conversation!</p>
                <p style={{ fontSize: 13, color: '#9e9e9e', textAlign: 'center' }}>
                  Ask your tailor about materials, style, timeline, and more.
                </p>
              </div>
            )}

            {grouped.map(group => (
              <div key={group.date}>
                {/* Date divider */}
                <div className="flex items-center gap-3 my-4">
                  <div className="flex-1 h-px" style={{ background: '#e8e8e8' }} />
                  <span style={{ fontSize: 11, color: '#9e9e9e', fontWeight: 600 }}>{group.date}</span>
                  <div className="flex-1 h-px" style={{ background: '#e8e8e8' }} />
                </div>

                {group.messages.map((msg, i) => {
                  const isUser = msg.sender_id === user?.id
                  return (
                    <div key={msg.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-2`}>
                      <div className="flex flex-col" style={{ maxWidth: '80%' }}>
                        {!isUser && i === 0 && (
                          <p style={{ fontSize: 11, color: '#9e9e9e', marginBottom: 3, marginLeft: 4 }}>
                            {msg.sender_name}
                          </p>
                        )}
                        <div className={isUser ? 'bubble-user' : 'bubble-tailor'}>
                          <p style={{ fontSize: 14, lineHeight: 1.5 }}>{msg.message}</p>
                        </div>
                        <p style={{ fontSize: 10, color: '#bbb', marginTop: 2, textAlign: isUser ? 'right' : 'left', paddingLeft: 4, paddingRight: 4 }}>
                          {formatTime(msg.created_at)}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            ))}
            <div ref={bottomRef} />
          </>
        )}
      </div>

      {/* Input area */}
      <div className="px-4 py-3 bg-white flex items-end gap-3"
        style={{ borderTop: '1px solid #f0f0f0', paddingBottom: 'calc(12px + env(safe-area-inset-bottom))' }}>
        <div className="flex-1 relative">
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            rows={1}
            className="w-full px-4 py-3 rounded-2xl resize-none outline-none"
            style={{
              border: '1.5px solid #e8e8e8',
              background: '#fafafa',
              fontSize: 14,
              maxHeight: 100,
              lineHeight: 1.5,
            }}
            onInput={e => {
              const t = e.target as HTMLTextAreaElement
              t.style.height = 'auto'
              t.style.height = Math.min(t.scrollHeight, 100) + 'px'
            }}
          />
        </div>
        <button onClick={sendMessage} disabled={!input.trim() || sending}
          className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 transition-all"
          style={{
            background: input.trim() ? 'linear-gradient(135deg, #e91e8c 0%, #f06292 100%)' : '#f5f5f5',
            boxShadow: input.trim() ? '0 4px 12px rgba(233,30,140,0.3)' : 'none',
          }}>
          <Send size={18} color={input.trim() ? 'white' : '#9e9e9e'} />
        </button>
      </div>
    </div>
  )
}
