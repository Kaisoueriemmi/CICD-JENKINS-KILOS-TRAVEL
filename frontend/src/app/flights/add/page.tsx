'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Plane, 
  Calendar, 
  MapPin, 
  Weight, 
  ArrowLeft,
  CheckCircle,
  Search
} from 'lucide-react'
import { toast } from 'sonner'
import axios from 'axios'
import { searchAirports, Airport } from '@/lib/airports'

// Composant Autocomplete
const AirportAutocomplete = ({
  label,
  value,
  onChange,
  placeholder,
  testId
}: {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder: string
  testId?: string
}) => {
  const [query, setQuery] = useState(value)
  const [results, setResults] = useState<Airport[]>([])
  const [showResults, setShowResults] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowResults(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVal = e.target.value
    setQuery(newVal)
    onChange(newVal) // Update parent even if not selected
    
    if (newVal.length > 1) {
      try {
        const results = await searchAirports(newVal)
        setResults(results)
        setShowResults(true)
      } catch (err) {
        console.error(err)
      }
    } else {
      setShowResults(false)
    }
  }

  const handleSelect = (airport: Airport) => {
    setQuery(`${airport.city} (${airport.code})`)
    onChange(airport.code)
    setShowResults(false)
  }

  return (
    <div className="relative" ref={wrapperRef}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          data-testid={testId}
          type="text"
          value={query}
          onChange={handleSearch}
          onFocus={() => query.length > 1 && setShowResults(true)}
          className="input-field pl-10 uppercase"
          placeholder={placeholder}
          required
        />
      </div>
      <AnimatePresence>
        {showResults && results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-auto"
          >
            {results.map((airport) => (
              <button
                key={airport.code}
                type="button"
                onClick={() => handleSelect(airport)}
                className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center justify-between border-b border-gray-100 last:border-0"
              >
                <div>
                  <p className="font-semibold text-gray-900">{airport.city}</p>
                  <p className="text-sm text-gray-500">{airport.name}</p>
                </div>
                <span className="bg-primary-50 text-primary-700 px-2 py-1 rounded-lg text-sm font-bold">
                  {airport.code}
                </span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function AddFlightPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1)

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null
    if (!token) router.push('/login')
  }, [])
  const [formData, setFormData] = useState({
    flight_number: '',
    airline: '',
    departure_airport: '',
    arrival_airport: '',
    flight_date: '',
    flight_type: 'domestic',
    allowed_weight_kg: 23,
    actual_weight_kg: 0
  })

  const airlines = [
    'Air France', 'Lufthansa', 'British Airways', 'Emirates', 'Qatar Airways',
    'Turkish Airlines', 'KLM', 'Swiss', 'Iberia', 'Alitalia', 'Ryanair', 'EasyJet', 'Tunisair'
  ]

  const flightTypes = [
    { value: 'domestic', label: 'Domestique', weight: 23 },
    { value: 'international', label: 'International', weight: 23 },
    { value: 'transatlantic', label: 'Transatlantique', weight: 32 }
  ]

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    setLoading(true)

    try {
      const token = localStorage.getItem('auth_token')

      // Backend expects ISO datetime, not bare date
      const dateTime = formData.flight_date.includes('T')
        ? formData.flight_date
        : `${formData.flight_date}T00:00:00`

      const flightData = {
        flight_number: formData.flight_number,
        airline: formData.airline,
        departure_airport: formData.departure_airport,
        arrival_airport: formData.arrival_airport,
        flight_date: dateTime,
        flight_type: formData.flight_type,
        allowed_weight_kg: formData.allowed_weight_kg,
        actual_weight_kg: formData.actual_weight_kg
      }

      await axios.post(
        'http://localhost:8000/api/v1/flights/',
        flightData,
        { headers: { Authorization: `Bearer ${token}` } }
      )

      toast.success('Vol ajouté avec succès ! 🎉')
      router.push('/flights')
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Erreur lors de l\'ajout du vol')
    } finally {
      setLoading(false)
    }
  }

  const creditEarned = Math.max(0, formData.allowed_weight_kg - formData.actual_weight_kg)

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 p-6">
      <div className="max-w-3xl mx-auto">
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
            Retour
          </button>
          <h1 className="text-4xl font-display font-bold gradient-text mb-2">
            Ajouter un vol
          </h1>
          <p className="text-gray-600">
            Enregistrez votre vol et gagnez des kilos
          </p>
        </motion.div>

        {/* Progress Steps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center flex-1">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold transition-all ${
                  step >= s 
                    ? 'bg-primary-500 text-white' 
                    : 'bg-gray-200 text-gray-400'
                }`}>
                  {step > s ? <CheckCircle className="w-6 h-6" /> : s}
                </div>
                {s < 3 && (
                  <div className={`flex-1 h-1 mx-2 transition-all ${
                    step > s ? 'bg-primary-500' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-sm">
            <span className={step >= 1 ? 'text-primary-600 font-semibold' : 'text-gray-400'}>
              Informations
            </span>
            <span className={step >= 2 ? 'text-primary-600 font-semibold' : 'text-gray-400'}>
              Bagages
            </span>
            <span className={step >= 3 ? 'text-primary-600 font-semibold' : 'text-gray-400'}>
              Confirmation
            </span>
          </div>
        </motion.div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <form onSubmit={handleSubmit} className="card-premium p-8">
            {/* Step 1: Flight Information */}
            {step === 1 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Informations du vol
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Numéro de vol *
                    </label>
                    <div className="relative">
                      <Plane className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        data-testid="flight-number-input"
                        type="text"
                        required
                        value={formData.flight_number}
                        onChange={(e) => setFormData({ ...formData, flight_number: e.target.value.toUpperCase() })}
                        className="input-field pl-10"
                        placeholder="AF1234"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Compagnie aérienne *
                    </label>
                    <select
                      data-testid="airline-select"
                      required
                      value={formData.airline}
                      onChange={(e) => setFormData({ ...formData, airline: e.target.value })}
                      className="input-field"
                    >
                      <option value="">Sélectionner...</option>
                      {airlines.map((airline) => (
                        <option key={airline} value={airline}>{airline}</option>
                      ))}
                    </select>
                  </div>

                  {/* Airport Autocomplete Fields */}
                  <AirportAutocomplete
                    label="Aéroport de départ *"
                    value={formData.departure_airport}
                    onChange={(val) => setFormData({ ...formData, departure_airport: val })}
                    placeholder="Ville ou code (ex: CDG)"
                    testId="departure-input"
                  />

                  <AirportAutocomplete
                    label="Aéroport d'arrivée *"
                    value={formData.arrival_airport}
                    onChange={(val) => setFormData({ ...formData, arrival_airport: val })}
                    placeholder="Ville ou code (ex: DXB)"
                    testId="arrival-input"
                  />

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date du vol *
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        data-testid="flight-date-input"
                        type="date"
                        required
                        value={formData.flight_date}
                        onChange={(e) => setFormData({ ...formData, flight_date: e.target.value })}
                        className="input-field pl-10"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Type de vol *
                    </label>
                    <select
                      data-testid="flight-type-select"
                      required
                      value={formData.flight_type}
                      onChange={(e) => {
                        const type = flightTypes.find(t => t.value === e.target.value)
                        setFormData({ 
                          ...formData, 
                          flight_type: e.target.value,
                          allowed_weight_kg: type?.weight || 23
                        })
                      }}
                      className="input-field"
                    >
                      {flightTypes.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label} ({type.weight}kg)
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <button
                  data-testid="suivant-btn"
                  type="button"
                  onClick={() => {
                    // Simple validation
                    if (formData.flight_number && formData.airline && formData.departure_airport && formData.arrival_airport && formData.flight_date) {
                      setStep(2)
                    } else {
                      toast.error('Veuillez remplir tous les champs obligatoires')
                    }
                  }}
                  className="btn-primary w-full"
                >
                  Suivant
                </button>
              </div>
            )}

            {/* Step 2: Baggage Information */}
            {step === 2 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Informations bagages
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Poids autorisé (kg)
                    </label>
                    <div className="relative">
                      <Weight className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        data-testid="allowed-weight-input"
                        type="number"
                        required
                        value={formData.allowed_weight_kg}
                        onChange={(e) => setFormData({ ...formData, allowed_weight_kg: parseFloat(e.target.value) })}
                        className="input-field pl-10"
                        min="0"
                        step="0.1"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Poids réel (kg) *
                    </label>
                    <div className="relative">
                      <Weight className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        data-testid="actual-weight-input"
                        type="number"
                        required
                        value={formData.actual_weight_kg}
                        onChange={(e) => setFormData({ ...formData, actual_weight_kg: parseFloat(e.target.value) })}
                        className="input-field pl-10"
                        min="0"
                        step="0.1"
                      />
                    </div>
                  </div>
                </div>

                {/* Credit Preview */}
                <div className={`p-6 rounded-xl border-2 ${
                  creditEarned > 0 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-orange-50 border-orange-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-700">
                        Crédits estimés
                      </p>
                      <p className={`text-3xl font-bold mt-1 ${
                        creditEarned > 0 ? 'text-green-600' : 'text-orange-600'
                      }`}>
                        {creditEarned > 0 ? '+' : ''}{creditEarned.toFixed(1)} kg
                      </p>
                    </div>
                    <div className="text-5xl">
                      {creditEarned > 0 ? '🎉' : '⚠️'}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    {creditEarned > 0 
                      ? 'Félicitations ! Vous allez gagner des crédits.'
                      : 'Vous avez dépassé votre allocation de bagages.'}
                  </p>
                </div>

                <div className="flex gap-4">
                  <button
                    data-testid="precedent-btn"
                    type="button"
                    onClick={() => setStep(1)}
                    className="btn-outline flex-1"
                  >
                    Précédent
                  </button>
                  <button
                    data-testid="suivant-btn-step2"
                    type="button"
                    onClick={() => setStep(3)}
                    className="btn-primary flex-1"
                  >
                    Suivant
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Confirmation */}
            {step === 3 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Confirmation
                </h2>

                <div className="bg-gray-50 rounded-xl p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Vol</p>
                      <p className="font-semibold">{formData.flight_number}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Compagnie</p>
                      <p className="font-semibold">{formData.airline}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Trajet</p>
                      <p className="font-semibold">
                        {formData.departure_airport} → {formData.arrival_airport}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Date</p>
                      <p className="font-semibold">
                        {new Date(formData.flight_date).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Bagages</p>
                      <p className="font-semibold">
                        {formData.actual_weight_kg}kg / {formData.allowed_weight_kg}kg
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Crédits</p>
                      <p className={`font-semibold ${
                        creditEarned > 0 ? 'text-green-600' : 'text-orange-600'
                      }`}>
                        {creditEarned > 0 ? '+' : ''}{creditEarned.toFixed(1)} kg
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="btn-outline flex-1"
                  >
                    Précédent
                  </button>
                  <button
                    data-testid="confirm-btn"
                    type="button"
                    onClick={() => handleSubmit()}
                    disabled={loading}
                    className="btn-primary flex-1"
                  >
                    {loading ? 'Enregistrement...' : 'Confirmer'}
                  </button>
                </div>
              </div>
            )}
          </form>
        </motion.div>
      </div>
    </div>
  )
}
