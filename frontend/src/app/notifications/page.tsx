'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Bell, 
  CheckCircle, 
  Info, 
  Trash2, 
  Filter,
  Check
} from 'lucide-react'
import { toast } from 'sonner'
import { notificationsAPI } from '@/lib/api'
import ClientLayout from '@/components/ClientLayout'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

interface Notification {
  id: number
  title: string
  message: string
  notification_type: string
  is_read: boolean
  read_at: string | null
  created_at: string
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'unread'>('all')

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null
    if (!token) {
      if (typeof window !== 'undefined') window.location.href = '/login'
    }
  }, [])

  const fetchNotifications = async () => {
    setLoading(true)
    try {
      const response = await notificationsAPI.getNotifications({
        limit: 50,
        unread_only: filter === 'unread'
      })
      // Adapt response structure if needed
      const data = response.data
      setNotifications(Array.isArray(data) ? data : data.notifications || [])
    } catch (error) {
      toast.error('Erreur lors du chargement des notifications')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNotifications()
  }, [filter])

  const handleMarkAsRead = async (id: number) => {
    try {
      // Optimistic update
      setNotifications(prev => prev.map(n => 
        n.id === id ? { ...n, is_read: true } : n
      ))
      await notificationsAPI.markAsRead(id)
    } catch (error) {
      fetchNotifications()
    }
  }

  const handleMarkAllRead = async () => {
    try {
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
      await notificationsAPI.markAllAsRead()
      toast.success('Toutes les notifications marquées comme lues')
    } catch (error) {
      fetchNotifications()
    }
  }

  const handleDelete = async (id: number) => {
    try {
      setNotifications(prev => prev.filter(n => n.id !== id))
      await notificationsAPI.deleteNotification(id)
      toast.success('Notification supprimée')
    } catch (error) {
      toast.error('Erreur lors de la suppression')
      fetchNotifications()
    }
  }

  return (
    <ClientLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <Bell className="w-8 h-8 mr-3 text-primary-600" />
              Notifications
            </h1>
            <p className="text-gray-500 mt-1">
              Gérez vos alertes et messages importants
            </p>
          </div>
          <div className="flex gap-2">
            <button
              data-testid="mark-all-read-btn"
              onClick={handleMarkAllRead}
              className="btn-outline flex items-center"
            >
              <Check className="w-4 h-4 mr-2" />
              Tout marquer comme lu
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-2 rounded-xl shadow-sm border border-gray-100 flex gap-2 w-fit">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'all' 
                ? 'bg-primary-50 text-primary-700' 
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            Toutes
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'unread' 
                ? 'bg-primary-50 text-primary-700' 
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            Non lues
          </button>
        </div>

        {/* List */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-500">Chargement...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div data-testid="empty-state" className="p-16 text-center">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bell className="w-8 h-8 text-gray-300" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">C'est calme par ici</h3>
              <p className="text-gray-500">Aucune notification à afficher pour le moment.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  data-testid="notification-item"
                  className={`p-6 transition-colors hover:bg-gray-50 flex gap-4 group ${
                    !notification.is_read ? 'bg-blue-50/30' : ''
                  }`}
                >
                  <div className={`mt-1 p-2 rounded-full h-fit flex-shrink-0 ${
                    notification.notification_type === 'success' || notification.notification_type === 'credit'
                      ? 'bg-green-100 text-green-600'
                      : notification.notification_type === 'warning'
                      ? 'bg-orange-100 text-orange-600'
                      : notification.notification_type === 'error'
                      ? 'bg-red-100 text-red-600'
                      : 'bg-blue-100 text-blue-600'
                  }`}>
                    {notification.notification_type === 'success' || notification.notification_type === 'credit' ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <Info className="w-5 h-5" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className={`font-semibold ${!notification.is_read ? 'text-gray-900' : 'text-gray-700'}`}>
                        {notification.title}
                      </h3>
                      <span className="text-xs text-gray-400 whitespace-nowrap ml-4">
                        {format(new Date(notification.created_at), 'Pp', { locale: fr })}
                      </span>
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-3">
                      {notification.message}
                    </p>

                    <div className="flex items-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      {!notification.is_read && (
                        <button
                          data-testid="mark-read-btn"
                          onClick={() => handleMarkAsRead(notification.id)}
                          className="text-xs font-medium text-primary-600 hover:text-primary-700 flex items-center"
                        >
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Marquer comme lu
                        </button>
                      )}
                      <button
                        data-testid="delete-notification-btn"
                        onClick={() => handleDelete(notification.id)}
                        className="text-xs font-medium text-red-600 hover:text-red-700 flex items-center"
                      >
                        <Trash2 className="w-3 h-3 mr-1" />
                        Supprimer
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </ClientLayout>
  )
}
