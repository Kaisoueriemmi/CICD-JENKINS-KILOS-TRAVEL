'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  CreditCard, 
  Lock, 
  CheckCircle, 
  ShieldCheck,
  ArrowLeft,
  Calendar
} from 'lucide-react'
import { toast } from 'sonner'
import axios from 'axios'

function CheckoutContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const planName = searchParams.get('plan') || 'Premium'
  const price = searchParams.get('price') || '9.99'
  
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1) // 1: Payment, 2: Success
  const [cardData, setCardData] = useState({
    number: '',
    expiry: '',
    cvc: '',
    name: ''
  })

  // Format credit card number with spaces
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '')
    if (value.length > 16) value = value.slice(0, 16)
    
    // Add spaces every 4 digits
    const formatted = value.replace(/(\d{4})(?=\d)/g, '$1 ')
    setCardData({ ...cardData, number: formatted })
  }

  // Format expiry date (MM/YY)
  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '')
    if (value.length > 4) value = value.slice(0, 4)
    
    if (value.length > 2) {
      value = `${value.slice(0, 2)}/${value.slice(2)}`
    }
    setCardData({ ...cardData, expiry: value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const token = localStorage.getItem('auth_token')
      
      // Call backend to create subscription (simulated if endpoint doesn't exist yet)
      try {
        await axios.post(
          'http://localhost:8000/api/v1/subscriptions',
          {
            plan_type: planName.toLowerCase()
          },
          { headers: { Authorization: `Bearer ${token}` } }
        )
      } catch (err) {
        console.warn('Backend endpoint might not exist yet, proceeding with frontend simulation')
      }

      setStep(2) // Move to success step
      toast.success('Paiement réussi ! Bienvenue dans le club. 🎉')
      
      // Redirect after a delay
      setTimeout(() => {
        router.push('/dashboard')
      }, 5000)
    } catch (error) {
      toast.error('Le paiement a échoué. Veuillez réessayer.')
    } finally {
      setLoading(false)
    }
  }

  if (step === 2) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 text-center"
        >
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Paiement Réussi !</h1>
          <p className="text-gray-600 mb-6">
            Votre abonnement <span className="font-semibold text-primary-600">{planName}</span> est maintenant actif.
          </p>
          <div className="bg-gray-50 rounded-xl p-4 mb-6 text-sm text-left">
            <div className="flex justify-between mb-2">
              <span className="text-gray-500">Montant payé</span>
              <span className="font-semibold">{price}€</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-500">Date</span>
              <span className="font-semibold">{new Date().toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Référence</span>
              <span className="font-mono text-xs">INV-{Math.random().toString(36).substr(2, 9).toUpperCase()}</span>
            </div>
          </div>
          <p className="text-sm text-gray-400 mb-6">
            Vous allez être redirigé vers votre tableau de bord dans quelques secondes...
          </p>
          <button 
            onClick={() => router.push('/dashboard')}
            className="btn-primary w-full"
          >
            Aller au Dashboard maintenant
          </button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Order Summary */}
        <motion.div 
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="bg-white rounded-2xl shadow-lg p-6 h-fit"
        >
          <button 
            onClick={() => router.back()}
            className="flex items-center text-gray-500 hover:text-gray-900 mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour aux plans
          </button>
          
          <h2 className="text-xl font-bold text-gray-900 mb-6">Résumé de la commande</h2>
          
          <div className="flex items-center justify-between p-4 bg-primary-50 rounded-xl mb-6">
            <div>
              <p className="font-bold text-primary-900">Plan {planName}</p>
              <p className="text-sm text-primary-700">Facturation mensuelle</p>
            </div>
            <p className="text-2xl font-bold text-primary-600">{price}€</p>
          </div>

          <ul className="space-y-3 mb-6">
            <li className="flex items-center text-sm text-gray-600">
              <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
              Accès immédiat aux fonctionnalités Premium
            </li>
            <li className="flex items-center text-sm text-gray-600">
              <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
              Annulation possible à tout moment
            </li>
            <li className="flex items-center text-sm text-gray-600">
              <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
              Paiement sécurisé via Stripe
            </li>
          </ul>

          <div className="border-t border-gray-100 pt-4">
            <div className="flex justify-between items-center font-bold text-lg">
              <span>Total à payer</span>
              <span>{price}€</span>
            </div>
          </div>
        </motion.div>

        {/* Payment Form */}
        <motion.div 
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="bg-white rounded-2xl shadow-lg p-8"
        >
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-gray-900">Paiement Sécurisé</h2>
            <div className="flex space-x-2">
              <Lock className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium text-green-600">SSL Encrypted</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Titulaire de la carte
              </label>
              <input
                type="text"
                required
                value={cardData.name}
                onChange={(e) => setCardData({ ...cardData, name: e.target.value })}
                className="input-field"
                placeholder="Jean Dupont"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Numéro de carte
              </label>
              <div className="relative">
                <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  required
                  value={cardData.number}
                  onChange={handleCardNumberChange}
                  className="input-field pl-10 font-mono"
                  placeholder="0000 0000 0000 0000"
                  maxLength={19}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Expiration
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    required
                    value={cardData.expiry}
                    onChange={handleExpiryChange}
                    className="input-field pl-10 font-mono"
                    placeholder="MM/YY"
                    maxLength={5}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CVC
                </label>
                <div className="relative">
                  <ShieldCheck className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    required
                    value={cardData.cvc}
                    onChange={(e) => setCardData({ ...cardData, cvc: e.target.value.replace(/\D/g, '').slice(0, 3) })}
                    className="input-field pl-10 font-mono"
                    placeholder="123"
                    maxLength={3}
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-4 text-lg shadow-lg hover:shadow-xl transition-all"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Traitement en cours...
                </span>
              ) : (
                `Payer ${price}€`
              )}
            </button>
            
            <p className="text-xs text-center text-gray-500 mt-4">
              En cliquant sur "Payer", vous acceptez nos conditions générales de vente. 
              Ceci est une simulation de paiement sécurisée.
            </p>
          </form>
        </motion.div>
      </div>
    </div>
  )
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  )
}
