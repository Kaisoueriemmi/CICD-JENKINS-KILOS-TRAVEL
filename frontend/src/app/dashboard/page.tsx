'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Wallet,
  Plane,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Leaf,
  ArrowRight,
  Clock
} from 'lucide-react'
import { useAuthStore, useWalletStore } from '@/lib/store'
import { walletAPI, flightAPI, transactionAPI } from '@/lib/api'
import ClientLayout from '@/components/ClientLayout'
import Link from 'next/link'

export default function DashboardPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()
  const { wallet, setWallet } = useWalletStore()
  
  const [stats, setStats] = useState<any>(null)
  const [recentFlights, setRecentFlights] = useState<any[]>([])
  const [recentTransactions, setRecentTransactions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }

    loadDashboardData()
  }, [isAuthenticated])

  const loadDashboardData = async () => {
    try {
      // Load wallet
      const walletRes = await walletAPI.getWallet()
      setWallet(walletRes.data)

      // Load stats
      const statsRes = await walletAPI.getStats()
      setStats(statsRes.data)

      // Load recent flights
      const flightsRes = await flightAPI.getFlights(0, 3) // Reduce to 3 for cleaner UI
      setRecentFlights(flightsRes.data)

      // Load recent transactions
      const transactionsRes = await transactionAPI.getTransactions(0, 5)
      setRecentTransactions(transactionsRes.data)
    } catch (error) {
      console.error('Error loading dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Chargement de votre espace...</p>
        </div>
      </div>
    )
  }

  const StatCard = ({ title, value, icon: Icon, color, subtext }: any) => (
    <motion.div 
      whileHover={{ y: -5 }}
      className={`bg-white rounded-2xl shadow-sm border border-gray-100 p-6 relative overflow-hidden group`}
    >
      <div className={`absolute top-0 right-0 w-24 h-24 bg-${color}-50 rounded-full -mr-8 -mt-8 transition-transform group-hover:scale-110 opacity-50`}></div>
      
      <div className="relative z-10 flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
          <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
          {subtext && <p className="text-xs text-gray-400 mt-1">{subtext}</p>}
        </div>
        <div className={`w-12 h-12 bg-${color}-100 rounded-xl flex items-center justify-center text-${color}-600`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </motion.div>
  )

  return (
    <ClientLayout>
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Bonjour, {user?.full_name?.split(' ')[0]} ! 👋
            </h1>
            <p className="text-gray-500 mt-1">
              Voici ce qui se passe sur votre compte aujourd'hui.
            </p>
          </div>
          <button
            onClick={() => router.push('/flights/add')}
            className="flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 group"
          >
            <Plus className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform" />
            Nouveau Vol
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Custom Stat Cards to ensure colors work with Tailwind Safelist or JIT */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 relative overflow-hidden group hover:shadow-md transition-all">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-full -mr-8 -mt-8 transition-transform group-hover:scale-110 opacity-50"></div>
            <div className="relative z-10 flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Solde Wallet</p>
                <h3 className="text-2xl font-bold text-gray-900">{(wallet?.balance_kg ?? 0).toFixed(1)} <span className="text-sm font-normal text-gray-500">kg</span></h3>
                <p className="text-xs text-green-600 mt-1 flex items-center">
                  <TrendingUp className="w-3 h-3 mr-1" /> Dispo
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
                <Wallet className="w-6 h-6" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 relative overflow-hidden group hover:shadow-md transition-all">
            <div className="absolute top-0 right-0 w-24 h-24 bg-green-50 rounded-full -mr-8 -mt-8 transition-transform group-hover:scale-110 opacity-50"></div>
            <div className="relative z-10 flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Total Économisé</p>
                <h3 className="text-2xl font-bold text-gray-900">{stats?.total_kg_saved.toFixed(1)} <span className="text-sm font-normal text-gray-500">kg</span></h3>
                <p className="text-xs text-gray-400 mt-1">Depuis le début</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-green-600">
                <ArrowUpRight className="w-6 h-6" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 relative overflow-hidden group hover:shadow-md transition-all">
            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-50 rounded-full -mr-8 -mt-8 transition-transform group-hover:scale-110 opacity-50"></div>
            <div className="relative z-10 flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Valeur Estimée</p>
                <h3 className="text-2xl font-bold text-gray-900">{stats?.money_saved.toFixed(0)}€</h3>
                <p className="text-xs text-purple-600 mt-1">Économies réalisées</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600">
                <span className="text-xl font-bold">€</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 relative overflow-hidden group hover:shadow-md transition-all">
            <div className="absolute top-0 right-0 w-24 h-24 bg-orange-50 rounded-full -mr-8 -mt-8 transition-transform group-hover:scale-110 opacity-50"></div>
            <div className="relative z-10 flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Impact CO₂</p>
                <h3 className="text-2xl font-bold text-gray-900">{stats?.carbon_footprint_reduced.toFixed(1)} <span className="text-sm font-normal text-gray-500">kg</span></h3>
                <p className="text-xs text-orange-600 mt-1 flex items-center">
                  <Leaf className="w-3 h-3 mr-1" /> Réduits
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600">
                <Leaf className="w-6 h-6" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Main Content Area (2/3) */}
          <div className="xl:col-span-2 space-y-8">
            
            {/* Recent Flights Section */}
            <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h2 className="text-lg font-bold text-gray-900 flex items-center">
                  <Plane className="w-5 h-5 mr-2 text-blue-600" />
                  Vos derniers vols
                </h2>
                <Link href="/flights" className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center">
                  Voir tout <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </div>
              
              <div className="p-0">
                {recentFlights.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Plane className="w-8 h-8 text-gray-300" />
                    </div>
                    <h3 className="text-gray-900 font-medium mb-1">Aucun vol enregistré</h3>
                    <p className="text-gray-500 text-sm mb-4">Commencez par ajouter votre premier vol</p>
                    <button onClick={() => router.push('/flights/add')} className="text-blue-600 font-medium hover:underline">
                      Ajouter un vol maintenant
                    </button>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {recentFlights.map((flight) => (
                      <div key={flight.id} className="p-6 hover:bg-gray-50 transition-colors flex items-center justify-between group">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center font-bold">
                            {flight.airline.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="font-bold text-gray-900">{flight.departure_airport}</span>
                              <ArrowRight className="w-4 h-4 text-gray-400" />
                              <span className="font-bold text-gray-900">{flight.arrival_airport}</span>
                            </div>
                            <div className="flex items-center text-sm text-gray-500 mt-1">
                              <span>{new Date(flight.flight_date).toLocaleDateString()}</span>
                              <span className="mx-2">•</span>
                              <span className="font-mono bg-gray-100 px-2 py-0.5 rounded text-xs">{flight.flight_number}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className={`font-bold text-lg ${flight.difference_kg > 0 ? 'text-green-600' : 'text-red-500'}`}>
                            {flight.difference_kg > 0 ? '+' : ''}{flight.difference_kg} kg
                          </div>
                          <div className="text-xs text-gray-500 mt-1 flex items-center justify-end">
                            {flight.is_credited ? (
                              <span className="flex items-center text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                                ✓ Crédité
                              </span>
                            ) : (
                              <span className="flex items-center text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded-full">
                                <Clock className="w-3 h-3 mr-1" /> En attente
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>

          </div>

          {/* Sidebar Area (1/3) */}
          <div className="space-y-8">
            
            {/* Wallet Quick View */}
            <section className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl shadow-lg p-6 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-10 -mt-10 blur-xl"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-10 rounded-full -ml-8 -mb-8 blur-xl"></div>
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold text-lg">Mon Wallet</h3>
                  <Wallet className="w-6 h-6 opacity-80" />
                </div>
                
                <div className="mb-6">
                  <p className="text-indigo-200 text-sm mb-1">Solde disponible</p>
                  <h3 className="text-4xl font-bold">{(wallet?.balance_kg ?? 0).toFixed(1)} <span className="text-xl font-normal opacity-80">kg</span></h3>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <button className="bg-white text-indigo-600 py-2.5 px-4 rounded-xl font-semibold text-sm hover:bg-indigo-50 transition-colors flex items-center justify-center">
                    <ArrowDownRight className="w-4 h-4 mr-2" />
                    Utiliser
                  </button>
                  <button className="bg-indigo-500 bg-opacity-40 text-white py-2.5 px-4 rounded-xl font-semibold text-sm hover:bg-opacity-50 transition-colors flex items-center justify-center backdrop-blur-sm">
                    <ArrowUpRight className="w-4 h-4 mr-2" />
                    Transférer
                  </button>
                </div>
              </div>
            </section>

            {/* Recent Transactions Mini */}
            <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center">
                <Clock className="w-5 h-5 mr-2 text-gray-400" />
                Transactions récentes
              </h3>
              
              <div className="space-y-4">
                {recentTransactions.length === 0 ? (
                  <p className="text-center text-gray-500 text-sm py-4">Aucune transaction récente</p>
                ) : (
                  recentTransactions.slice(0, 3).map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          transaction.transaction_type === 'credit' ? 'bg-green-100 text-green-600' :
                          transaction.transaction_type === 'debit' ? 'bg-red-100 text-red-600' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {transaction.transaction_type === 'credit' ? <ArrowUpRight className="w-4 h-4" /> : 
                           <ArrowDownRight className="w-4 h-4" />}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 capitalize">
                            {transaction.transaction_type === 'credit' ? 'Crédit' : 'Débit'}
                          </p>
                          <p className="text-xs text-gray-400">
                            {new Date(transaction.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <span className={`text-sm font-bold ${
                        transaction.transaction_type === 'credit' ? 'text-green-600' : 'text-gray-900'
                      }`}>
                        {transaction.transaction_type === 'credit' ? '+' : '-'}{Math.abs(transaction.amount_kg).toFixed(1)}
                      </span>
                    </div>
                  ))
                )}
              </div>
              
              {recentTransactions.length > 0 && (
                <button 
                  onClick={() => router.push('/transactions')}
                  className="w-full mt-4 text-center text-sm text-blue-600 hover:text-blue-700 font-medium pt-3 border-t border-gray-100"
                >
                  Voir l'historique complet
                </button>
              )}
            </section>
          </div>
        </div>
      </div>
    </ClientLayout>
  )
}
