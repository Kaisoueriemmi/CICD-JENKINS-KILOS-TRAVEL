'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  User,
  Mail,
  Phone,
  MapPin,
  Edit,
  Camera,
  LogOut,
  Shield,
  Bell
} from 'lucide-react'
import { toast } from 'sonner'
import { useAuthStore } from '@/lib/store'
import { usersAPI } from '@/lib/api'

export default function ProfilePage() {
  const router = useRouter()
  const { user, logout, setUser } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    address: '',
    bio: ''
  })

  // Redirect if not authenticated
  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null
    if (!token) {
      router.push('/login')
      return
    }
    // Fetch user from API if not in store
    if (!user && token) {
      usersAPI.getMe().then((res) => {
        setUser(res.data)
      }).catch(() => {
        router.push('/login')
      })
    }
  }, [])

  useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.full_name || '',
        email: user.email || '',
        phone: user.phone_number || '',
        address: '',
        bio: ''
      })
    }
  }, [user])

  const handleCancel = () => {
    // Restore original values
    if (user) {
      setFormData({
        full_name: user.full_name || '',
        email: user.email || '',
        phone: user.phone_number || '',
        address: '',
        bio: ''
      })
    }
    setIsEditing(false)
  }

  const handleSave = async () => {
    if (!user) return
    setLoading(true)
    try {
      const res = await usersAPI.updateMe(user.id, {
        full_name: formData.full_name,
        phone_number: formData.phone || undefined,
      })
      setUser(res.data)
      toast.success('Profil mis à jour avec succès !')
      setIsEditing(false)
    } catch (error: any) {
      toast.error(error?.response?.data?.detail || 'Erreur lors de la mise à jour')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex justify-between items-center"
        >
          <div>
            <h1 className="text-4xl font-display font-bold gradient-text mb-2">
              Mon Profil
            </h1>
            <p className="text-gray-600">Gérez vos informations personnelles</p>
          </div>
          <button
            onClick={handleLogout}
            className="btn-outline border-red-200 text-red-600 hover:bg-red-50 flex items-center"
          >
            <LogOut className="w-5 h-5 mr-2" />
            Déconnexion
          </button>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="md:col-span-1 space-y-6"
          >
            <div className="card-premium p-6 text-center">
              <div className="relative inline-block mb-4">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary-100 to-secondary-100 p-1 mx-auto">
                  <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
                    {user?.full_name ? (
                      <span className="text-4xl font-bold text-primary-600">
                        {user.full_name.charAt(0).toUpperCase()}
                      </span>
                    ) : (
                      <User className="w-16 h-16 text-gray-300" />
                    )}
                  </div>
                </div>
                <button className="absolute bottom-0 right-0 p-2 bg-primary-500 text-white rounded-full hover:bg-primary-600 transition-colors shadow-lg">
                  <Camera className="w-4 h-4" />
                </button>
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-1">{user?.full_name || '—'}</h2>
              <p className="text-gray-500 text-sm mb-4">{user?.email || ''}</p>
              <div className="flex justify-center gap-2">
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                  Vérifié
                </span>
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                  Voyageur
                </span>
              </div>
            </div>

            <div className="card-premium p-6">
              <h3 className="font-bold text-gray-900 mb-4">Statistiques</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm">Vols total</span>
                  <span className="font-semibold">—</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm">Pays visités</span>
                  <span className="font-semibold">—</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm">Kilos sauvés</span>
                  <span className="font-semibold text-green-600">—</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="md:col-span-2"
          >
            <div className="card-premium p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Informations personnelles
                </h2>
                {!isEditing ? (
                  <button
                    data-testid="edit-btn"
                    onClick={() => setIsEditing(true)}
                    className="btn-outline flex items-center"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Modifier
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      data-testid="cancel-btn"
                      onClick={handleCancel}
                      className="btn-outline"
                    >
                      Annuler
                    </button>
                    <button
                      data-testid="save-btn"
                      onClick={handleSave}
                      disabled={loading}
                      className="btn-primary"
                    >
                      {loading ? 'Enregistrement...' : 'Sauvegarder'}
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nom complet
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        data-testid="full-name-input"
                        type="text"
                        disabled={!isEditing}
                        value={formData.full_name}
                        onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                        className={`input-field pl-10 ${!isEditing ? 'bg-gray-50' : ''}`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        data-testid="email-input-profile"
                        type="email"
                        disabled={true}
                        value={formData.email}
                        className="input-field pl-10 bg-gray-50 cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Téléphone
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="tel"
                        disabled={!isEditing}
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className={`input-field pl-10 ${!isEditing ? 'bg-gray-50' : ''}`}
                        placeholder="+33 6 12 34 56 78"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Localisation
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        disabled={!isEditing}
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        className={`input-field pl-10 ${!isEditing ? 'bg-gray-50' : ''}`}
                        placeholder="Paris, France"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                  <textarea
                    disabled={!isEditing}
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    rows={4}
                    className={`input-field ${!isEditing ? 'bg-gray-50' : ''}`}
                    placeholder="Dites-nous en plus sur vous..."
                  />
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() => router.push('/settings')}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center">
                    <Shield className="w-5 h-5 text-primary-600 mr-3" />
                    <span className="font-medium text-gray-900">Sécurité</span>
                  </div>
                  <span className="text-gray-400">→</span>
                </button>
                <button
                  onClick={() => router.push('/notifications')}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center">
                    <Bell className="w-5 h-5 text-primary-600 mr-3" />
                    <span className="font-medium text-gray-900">Notifications</span>
                  </div>
                  <span className="text-gray-400">→</span>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
