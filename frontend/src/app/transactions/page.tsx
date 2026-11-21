'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Filter,
  Download,
  Calendar,
  Search
} from 'lucide-react'
import { toast } from 'sonner'
import axios from 'axios'

interface Transaction {
  id: number
  transaction_type: string
  amount_kg: number
  balance_after: number
  description: string
  created_at: string
  related_flight_id?: number
  related_user_email?: string
}

export default function TransactionsPage() {
  const router = useRouter()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState({
    type: 'all',
    search: '',
    dateFrom: '',
    dateTo: ''
  })
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 15

  useEffect(() => {
    fetchTransactions()
  }, [])

  const fetchTransactions = async () => {
    try {
      const token = localStorage.getItem('auth_token')
      if (!token) {
        router.push('/login')
        return
      }

      const response = await axios.get(
        'http://localhost:8000/api/v1/transactions',
        { headers: { Authorization: `Bearer ${token}` } }
      )

      setTransactions(response.data)
    } catch (error) {
      console.error('Error fetching transactions:', error)
      toast.error('Erreur lors du chargement des transactions')
    } finally {
      setLoading(false)
    }
  }

  // Filter transactions
  const filteredTransactions = transactions.filter(transaction => {
    if (filter.type !== 'all' && transaction.transaction_type !== filter.type) {
      return false
    }
    if (filter.search && !transaction.description.toLowerCase().includes(filter.search.toLowerCase())) {
      return false
    }
    if (filter.dateFrom && new Date(transaction.created_at) < new Date(filter.dateFrom)) {
      return false
    }
    if (filter.dateTo && new Date(transaction.created_at) > new Date(filter.dateTo)) {
      return false
    }
    return true
  })

  // Pagination
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedTransactions = filteredTransactions.slice(startIndex, startIndex + itemsPerPage)

  // Statistics
  const stats = {
    total: transactions.length,
    credits: transactions.filter(t => t.transaction_type === 'credit').length,
    debits: transactions.filter(t => t.transaction_type === 'debit').length,
    transfers: transactions.filter(t => t.transaction_type === 'transfer').length,
    totalCredits: transactions
      .filter(t => t.transaction_type === 'credit')
      .reduce((sum, t) => sum + t.amount_kg, 0),
    totalDebits: transactions
      .filter(t => t.transaction_type === 'debit')
      .reduce((sum, t) => sum + t.amount_kg, 0)
  }

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'credit':
        return <TrendingUp className="w-6 h-6 text-green-600" />
      case 'debit':
        return <TrendingDown className="w-6 h-6 text-red-600" />
      case 'transfer':
        return <RefreshCw className="w-6 h-6 text-blue-600" />
      default:
        return <RefreshCw className="w-6 h-6 text-gray-600" />
    }
  }

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'credit':
        return 'bg-green-50 border-green-200'
      case 'debit':
        return 'bg-red-50 border-red-200'
      case 'transfer':
        return 'bg-blue-50 border-blue-200'
      default:
        return 'bg-gray-50 border-gray-200'
    }
  }

  const exportTransactions = () => {
    const csv = [
      ['Date', 'Type', 'Montant (kg)', 'Solde après', 'Description'].join(','),
      ...filteredTransactions.map(t => [
        new Date(t.created_at).toLocaleDateString('fr-FR'),
        t.transaction_type,
        t.amount_kg,
        t.balance_after,
        `"${t.description}"`
      ].join(','))
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `transactions_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    toast.success('Export réussi !')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 p-6">
      <div className="max-w-7xl mx-auto">
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-display font-bold gradient-text mb-2">
                Historique des transactions
              </h1>
              <p className="text-gray-600">
                Consultez toutes vos transactions de kilos
              </p>
            </div>
            <button
              onClick={exportTransactions}
              className="btn-primary flex items-center"
            >
              <Download className="w-5 h-5 mr-2" />
              Exporter CSV
            </button>
          </div>
        </motion.div>

        {/* Statistics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6"
        >
          <div className="card-premium p-6">
            <p className="text-sm text-gray-600 mb-2">Total transactions</p>
            <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
          </div>
          <div className="card-premium p-6 bg-green-50">
            <p className="text-sm text-gray-600 mb-2">Crédits</p>
            <p className="text-3xl font-bold text-green-600">+{stats.totalCredits.toFixed(1)} kg</p>
            <p className="text-xs text-gray-500 mt-1">{stats.credits} transactions</p>
          </div>
          <div className="card-premium p-6 bg-red-50">
            <p className="text-sm text-gray-600 mb-2">Débits</p>
            <p className="text-3xl font-bold text-red-600">-{stats.totalDebits.toFixed(1)} kg</p>
            <p className="text-xs text-gray-500 mt-1">{stats.debits} transactions</p>
          </div>
          <div className="card-premium p-6 bg-blue-50">
            <p className="text-sm text-gray-600 mb-2">Transferts</p>
            <p className="text-3xl font-bold text-blue-600">{stats.transfers}</p>
            <p className="text-xs text-gray-500 mt-1">envoyés/reçus</p>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card-premium p-6 mb-6"
        >
          <div className="flex items-center mb-4">
            <Filter className="w-5 h-5 mr-2 text-primary-600" />
            <h3 className="text-lg font-bold text-gray-900">Filtres</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type
              </label>
              <select
                value={filter.type}
                onChange={(e) => setFilter({ ...filter, type: e.target.value })}
                className="input-field"
              >
                <option value="all">Tous</option>
                <option value="credit">Crédits</option>
                <option value="debit">Débits</option>
                <option value="transfer">Transferts</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Recherche
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={filter.search}
                  onChange={(e) => setFilter({ ...filter, search: e.target.value })}
                  className="input-field pl-10"
                  placeholder="Rechercher..."
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date début
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="date"
                  value={filter.dateFrom}
                  onChange={(e) => setFilter({ ...filter, dateFrom: e.target.value })}
                  className="input-field pl-10"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date fin
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="date"
                  value={filter.dateTo}
                  onChange={(e) => setFilter({ ...filter, dateTo: e.target.value })}
                  className="input-field pl-10"
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Transactions List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card-premium p-6"
        >
          {paginatedTransactions.length === 0 ? (
            <div className="text-center py-12">
              <span className="text-6xl">📝</span>
              <h3 className="text-xl font-semibold text-gray-900 mt-4">
                Aucune transaction trouvée
              </h3>
              <p className="text-gray-600 mt-2">
                Essayez de modifier vos filtres
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {paginatedTransactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all hover:shadow-md ${getTransactionColor(transaction.transaction_type)}`}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        {getTransactionIcon(transaction.transaction_type)}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">
                          {transaction.description}
                        </p>
                        <p className="text-sm text-gray-600">
                          {new Date(transaction.created_at).toLocaleDateString('fr-FR', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-xl font-bold ${
                        transaction.transaction_type === 'credit'
                          ? 'text-green-600'
                          : transaction.transaction_type === 'debit'
                          ? 'text-red-600'
                          : 'text-blue-600'
                      }`}>
                        {transaction.transaction_type === 'debit' ? '-' : '+'}
                        {transaction.amount_kg.toFixed(1)} kg
                      </p>
                      <p className="text-sm text-gray-600">
                        Solde: {transaction.balance_after.toFixed(1)} kg
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-6 flex items-center justify-between border-t pt-6">
                  <div className="text-sm text-gray-700">
                    Affichage {startIndex + 1} à {Math.min(startIndex + itemsPerPage, filteredTransactions.length)} sur {filteredTransactions.length}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="btn-outline disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Précédent
                    </button>
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const page = i + 1
                      return (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`px-4 py-2 rounded-xl font-semibold transition-all ${
                            currentPage === page
                              ? 'bg-primary-500 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {page}
                        </button>
                      )
                    })}
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="btn-outline disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Suivant
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </motion.div>
      </div>
    </div>
  )
}
