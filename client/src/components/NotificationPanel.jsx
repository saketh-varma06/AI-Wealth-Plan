import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { notificationAPI } from '../services/api'
import { RiBellLine, RiCloseLine, RiCheckLine, RiDeleteBinLine } from 'react-icons/ri'
import toast from 'react-hot-toast'

const TYPE_STYLES = {
  alert: 'bg-red-500/20 text-red-400 border-red-500/30',
  reminder: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  achievement: 'bg-brand-500/20 text-brand-400 border-brand-500/30',
  info: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
}

export default function NotificationPanel({ onClose }) {
  const [notifications, setNotifications] = useState([])
  const [unread, setUnread] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    notificationAPI.getNotifications()
      .then(r => { setNotifications(r.data.notifications); setUnread(r.data.unreadCount) })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const markRead = async (id) => {
    try {
      await notificationAPI.markAsRead(id)
      setNotifications(n => n.map(notif => notif._id === id ? { ...notif, isRead: true } : notif))
      setUnread(u => Math.max(0, u - 1))
    } catch { /* silent */ }
  }

  const markAllRead = async () => {
    try {
      await notificationAPI.markAllRead()
      setNotifications(n => n.map(notif => ({ ...notif, isRead: true })))
      setUnread(0)
      toast.success('All marked as read')
    } catch { toast.error('Failed') }
  }

  const deleteNotif = async (id) => {
    try {
      await notificationAPI.deleteNotification(id)
      setNotifications(n => n.filter(notif => notif._id !== id))
    } catch { /* silent */ }
  }

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-40" onClick={onClose} />
      <motion.div initial={{ opacity: 0, x: 20, scale: 0.95 }} animate={{ opacity: 1, x: 0, scale: 1 }} exit={{ opacity: 0, x: 20, scale: 0.95 }}
        className="fixed top-16 right-4 w-80 max-h-[80vh] bg-surface-800 border border-surface-600 rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-surface-600">
          <div className="flex items-center gap-2">
            <RiBellLine className="text-brand-400" />
            <span className="font-display font-semibold text-white text-sm">Notifications</span>
            {unread > 0 && (
              <span className="w-5 h-5 bg-brand-500 text-white text-xs font-bold rounded-full flex items-center justify-center">{unread}</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {unread > 0 && (
              <button onClick={markAllRead} className="text-xs text-brand-400 hover:text-brand-300">Mark all read</button>
            )}
            <button onClick={onClose} className="text-gray-400 hover:text-white p-1">
              <RiCloseLine />
            </button>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-10">
              <RiBellLine className="text-4xl text-gray-600 mx-auto mb-2" />
              <p className="text-gray-500 text-sm">No notifications yet</p>
            </div>
          ) : (
            <div className="divide-y divide-surface-700">
              {notifications.map(n => (
                <div key={n._id} className={`p-4 transition-all hover:bg-surface-700/50 ${!n.isRead ? 'bg-brand-500/5' : ''}`}>
                  <div className="flex items-start gap-3">
                    <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${!n.isRead ? 'bg-brand-400' : 'bg-surface-500'}`} />
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${!n.isRead ? 'text-white' : 'text-gray-300'}`}>{n.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{n.message}</p>
                      <p className="text-xs text-gray-600 mt-1">{new Date(n.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      {!n.isRead && (
                        <button onClick={() => markRead(n._id)} className="p-1 rounded-lg hover:bg-brand-500/20 hover:text-brand-400 text-gray-500 transition-all">
                          <RiCheckLine className="text-sm" />
                        </button>
                      )}
                      <button onClick={() => deleteNotif(n._id)} className="p-1 rounded-lg hover:bg-red-500/20 hover:text-red-400 text-gray-500 transition-all">
                        <RiDeleteBinLine className="text-sm" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </>
  )
}
