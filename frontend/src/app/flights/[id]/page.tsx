'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  ArrowLeft, 
  Plane, 
  Calendar, 
  MapPin, 
  Weight,
  CheckCircle,
  Clock,
  Trash2,
  Edit
} from 'lucide-react'
import { toast } from 'sonner'
import axios from 'axios'

interface Flight {
  id: number
  flight_number: string
  airline: string
  departure_airport: string
  arrival_airport: string
  flight_date: string
  flight_type: string
  allowed_weight_kg: number
  actual_weight_kg: number
  difference_kg: number
  credit_value_kg: number
  is_credited: boolean
  scan_verified: boolean
  created_at: string
}

export default function FlightDetailPage() {
  const router = useRouter()
  const params = useParams()
  const [flight, setFlight] = useState<Flight | null>(null)
  const [loading, setLoading] = useState(true)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  useEffect(() => {
    fetchFlight()
  }, [])

  const fetchFlight = async () => {
    try {
      const token = localStorage.getItem('auth_token')
      if (!token) {
        router.push('/login')
        return
      }

      const response = await axios.get(
        `http://localhost:8000/api/v1/flights/${params.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )

      setFlight(response.data)
    } catch (error) {
      console.error('Error fetching flight:', error)
      toast.error('Erreur lors du chargement du vol')
      router.push('/flights')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem('auth_token')
      await axios.delete(
        `http://localhost:8000/api/v1/flights/${params.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )

      toast.success('Vol supprimé avec succès')
      router.push('/flights')
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Erreur lors de la suppression')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary-600"></div>
      </div>
    )
  }

  if (!flight) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center">
        <div className="text-center">
          <span className="text-6xl">❌</span>
          <h2 className="text-2xl font-bold text-gray-900 mt-4">Vol introuvable</h2>
        </div>
      </div>
    )
  }

  const getFlightTypeColor = (type: string) => {
    switch (type) {
      case 'domestic': return 'bg-blue-100 text-blue-800'
      case 'international': return 'bg-purple-100 text-purple-800'
      case 'transatlantic': return 'bg-indigo-100 text-indigo-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <button
            onClick={() => router.back()}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Retour aux vols
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-display font-bold gradient-text mb-2">
                Vol {flight.flight_number}
              </h1>
              <p className="text-gray-600">{flight.airline}</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => router.push(`/flights/${flight.id}/edit`)}
                className="btn-outline flex items-center"
              >
                <Edit className="w-5 h-5 mr-2" />
                Modifier
              </button>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="btn-outline border-red-300 text-red-600 hover:bg-red-50 flex items-center"
              >
                <Trash2 className="w-5 h-5 mr-2" />
                Supprimer
              </button>
            </div>
          </div>
        </motion.div>

        {/* Status Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`mb-6 p-6 rounded-2xl ${
            flight.is_credited
              ? 'bg-gradient-to-r from-green-500 to-emerald-500'
              : 'bg-gradient-to-r from-orange-500 to-amber-500'
          } text-white`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {flight.is_credited ? (
                <CheckCircle className="w-12 h-12" />
              ) : (
                <Clock className="w-12 h-12" />
              )}
              <div>
                <h3 className="text-2xl font-bold">
                  {flight.is_credited ? 'Crédité' : 'En attente'}
                </h3>
                <p className="text-white/90">
                  {flight.is_credited
                    ? 'Les crédits ont été ajoutés à votre wallet'
                    : 'En attente de vérification'}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-white/90 text-sm">Crédits</p>
              <p className="text-4xl font-bold">
                {flight.difference_kg > 0 ? '+' : ''}{flight.credit_value_kg.toFixed(1)} kg
              </p>
            </div>
          </div>
        </motion.div>

        {/* Flight Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6"
        >
          {/* Route Card */}
          <div className="card-premium p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <MapPin className="w-5 h-5 mr-2 text-primary-600" />
              Itinéraire
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Départ</p>
                  <p className="text-2xl font-bold text-gray-900">{flight.departure_airport}</p>
                </div>
                <Plane className="w-8 h-8 text-primary-500 transform rotate-90" />
                <div className="text-right">
                  <p className="text-sm text-gray-600">Arrivée</p>
                  <p className="text-2xl font-bold text-gray-900">{flight.arrival_airport}</p>
                </div>
              </div>
              <div className="pt-4 border-t">
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getFlightTypeColor(flight.flight_type)}`}>
                  {flight.flight_type}
                </span>
              </div>
            </div>
          </div>

          {/* Date Card */}
          <div className="card-premium p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-primary-600" />
              Date et heure
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Date du vol</p>
                <p className="text-xl font-semibold text-gray-900">
                  {new Date(flight.flight_date).toLocaleDateString('fr-FR', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
              <div className="pt-3 border-t">
                <p className="text-sm text-gray-600">Ajouté le</p>
                <p className="text-sm font-medium text-gray-700">
                  {new Date(flight.created_at).toLocaleDateString('fr-FR')}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Baggage Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card-premium p-6 mb-6"
        >
          <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
            <Weight className="w-5 h-5 mr-2 text-primary-600" />
            Détails des bagages
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-blue-50 rounded-xl">
              <p className="text-sm text-gray-600 mb-2">Poids autorisé</p>
              <p className="text-3xl font-bold text-blue-600">{flight.allowed_weight_kg} kg</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-xl">
              <p className="text-sm text-gray-600 mb-2">Poids réel</p>
              <p className="text-3xl font-bold text-purple-600">{flight.actual_weight_kg} kg</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-xl">
              <p className="text-sm text-gray-600 mb-2">Différence</p>
              <p className={`text-3xl font-bold ${
                flight.difference_kg > 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {flight.difference_kg > 0 ? '+' : ''}{flight.difference_kg.toFixed(1)} kg
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-6">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">Utilisation</span>
              <span className="font-semibold text-gray-900">
                {((flight.actual_weight_kg / flight.allowed_weight_kg) * 100).toFixed(0)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  flight.actual_weight_kg <= flight.allowed_weight_kg
                    ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                    : 'bg-gradient-to-r from-red-500 to-orange-500'
                }`}
                style={{ width: `${Math.min((flight.actual_weight_kg / flight.allowed_weight_kg) * 100, 100)}%` }}
              />
            </div>
          </div>
        </motion.div>

        {/* Credits Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card-premium p-6"
        >
          <h3 className="text-lg font-bold text-gray-900 mb-4">Résumé des crédits</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
              <span className="text-gray-700">Différence de poids</span>
              <span className="font-semibold text-gray-900">
                {flight.difference_kg.toFixed(1)} kg
              </span>
            </div>
            <div className="flex justify-between items-center p-4 bg-primary-50 rounded-lg">
              <span className="text-gray-700 font-semibold">Crédits gagnés</span>
              <span className={`text-xl font-bold ${
                flight.credit_value_kg > 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {flight.credit_value_kg > 0 ? '+' : ''}{flight.credit_value_kg.toFixed(1)} kg
              </span>
            </div>
            {flight.scan_verified && (
              <div className="flex items-center justify-center p-3 bg-green-50 rounded-lg text-green-700">
                <CheckCircle className="w-5 h-5 mr-2" />
                <span className="font-medium">Vérifié par scan</span>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8"
          >
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                <Trash2 className="w-8 h-8 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Supprimer ce vol ?
              </h2>
              <p className="text-gray-600">
                Cette action est irréversible. Le vol et les crédits associés seront supprimés.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 btn-outline"
              >
                Annuler
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 bg-red-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-red-700 transition-all shadow-lg hover:shadow-xl"
              >
                Supprimer
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
