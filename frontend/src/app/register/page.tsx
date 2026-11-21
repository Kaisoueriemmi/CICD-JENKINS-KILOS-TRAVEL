'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Eye, EyeOff, User, Mail, Lock, Phone, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react'
import { authAPI } from '@/lib/api'
import { toast } from 'sonner'

export default function RegisterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone_number: '',
    password: '',
    confirm_password: ''
  })
  
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (formData.full_name.length < 2) {
      newErrors.full_name = 'Le nom doit contenir au moins 2 caractères'
    }
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email invalide'
    }
    
    if (formData.password.length < 8) {
      newErrors.password = 'Le mot de passe doit contenir au moins 8 caractères'
    } else if (!/\d/.test(formData.password)) {
      newErrors.password = 'Le mot de passe doit contenir au moins un chiffre'
    } else if (!/[A-Z]/.test(formData.password)) {
      newErrors.password = 'Le mot de passe doit contenir au moins une majuscule'
    }
    
    if (formData.password !== formData.confirm_password) {
      newErrors.confirm_password = 'Les mots de passe ne correspondent pas'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setLoading(true)
    
    try {
      await authAPI.register({
        full_name: formData.full_name,
        email: formData.email,
        phone_number: formData.phone_number || undefined,
        password: formData.password
      })
      
      toast.success('Compte créé avec succès ! Veuillez vérifier votre email.')
      
      // Delay to show success message
      setTimeout(() => {
        router.push('/login')
      }, 2000)
      
    } catch (error: any) {
      console.error('Registration error:', error)
      const message = error.response?.data?.detail || 'Erreur lors de l\'inscription'
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        
        {/* Left Side - Hero Content */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="hidden md:block"
        >
          <h1 className="text-5xl font-display font-bold text-gray-900 mb-6 leading-tight">
            Rejoignez la révolution <br />
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              AirWeight
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            Optimisez vos franchises bagages, gagnez de l'argent et voyagez plus intelligemment.
            Rejoignez des milliers de voyageurs qui économisent chaque jour.
          </p>
          
          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg">Monétisez vos kilos</h3>
                <p className="text-gray-600">Transformez vos kilos inutilisés en crédits ou en argent.</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg">Scan intelligent</h3>
                <p className="text-gray-600">Scannez vos billets et laissez notre IA calculer vos droits.</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg">Communauté active</h3>
                <p className="text-gray-600">Échangez des kilos avec d'autres voyageurs vérifiés.</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Right Side - Registration Form */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white rounded-3xl shadow-xl p-8 md:p-12 relative overflow-hidden"
        >
          {/* Decorative background circle */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full -mr-32 -mt-32 z-0"></div>
          
          <div className="relative z-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Créer un compte</h2>
            <p className="text-gray-600 mb-8">Commencez votre voyage avec AirWeight</p>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom complet</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    required
                    className={`block w-full pl-10 pr-3 py-3 border ${errors.full_name ? 'border-red-500' : 'border-gray-300'} rounded-xl focus:ring-blue-500 focus:border-blue-500 bg-gray-50 focus:bg-white transition-colors`}
                    placeholder="John Doe"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  />
                </div>
                {errors.full_name && <p className="mt-1 text-xs text-red-500 flex items-center"><AlertCircle className="w-3 h-3 mr-1" />{errors.full_name}</p>}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email professionnel</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    required
                    className={`block w-full pl-10 pr-3 py-3 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-xl focus:ring-blue-500 focus:border-blue-500 bg-gray-50 focus:bg-white transition-colors`}
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                {errors.email && <p className="mt-1 text-xs text-red-500 flex items-center"><AlertCircle className="w-3 h-3 mr-1" />{errors.email}</p>}
              </div>
              
              {/* Phone (Optional) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone (Optionnel)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="tel"
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-blue-500 focus:border-blue-500 bg-gray-50 focus:bg-white transition-colors"
                    placeholder="+33 6 12 34 56 78"
                    value={formData.phone_number}
                    onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                  />
                </div>
              </div>

              {/* Password */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      className={`block w-full pl-10 pr-10 py-3 border ${errors.password ? 'border-red-500' : 'border-gray-300'} rounded-xl focus:ring-blue-500 focus:border-blue-500 bg-gray-50 focus:bg-white transition-colors`}
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      )}
                    </button>
                  </div>
                  {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Confirmer</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      className={`block w-full pl-10 pr-3 py-3 border ${errors.confirm_password ? 'border-red-500' : 'border-gray-300'} rounded-xl focus:ring-blue-500 focus:border-blue-500 bg-gray-50 focus:bg-white transition-colors`}
                      placeholder="••••••••"
                      value={formData.confirm_password}
                      onChange={(e) => setFormData({ ...formData, confirm_password: e.target.value })}
                    />
                  </div>
                  {errors.confirm_password && <p className="mt-1 text-xs text-red-500">{errors.confirm_password}</p>}
                </div>
              </div>
              
              {/* Password Info */}
              <div className="text-xs text-gray-500 mt-1">
                Le mot de passe doit contenir 8+ caractères, incluant majuscules & chiffres.
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center py-4 px-4 border border-transparent rounded-xl shadow-lg text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transform hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    CRÉER MON COMPTE
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </button>
              
              {/* Terms */}
              <p className="text-xs text-center text-gray-500 mt-4">
                En vous inscrivant, vous acceptez nos <Link href="/terms" className="text-blue-600 hover:underline">Conditions d'utilisation</Link> et notre <Link href="/privacy" className="text-blue-600 hover:underline">Politique de confidentialité</Link>.
              </p>
            </form>

            {/* Login Link */}
            <div className="mt-8 text-center pt-8 border-t border-gray-100">
              <p className="text-sm text-gray-600">
                Vous avez déjà un compte ?{' '}
                <Link href="/login" className="font-semibold text-blue-600 hover:text-blue-500 hover:underline transition-colors">
                  Connexion
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
