'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { toast } from 'sonner';

interface WalletStats {
  balance_kg: number;
  total_earned_kg: number;
  total_spent_kg: number;
  total_transferred_kg: number;
}

interface Transaction {
  id: number;
  transaction_type: string;
  amount_kg: number;
  balance_after: number;
  description: string;
  created_at: string;
}

export default function WalletPage() {
  const router = useRouter();
  const [wallet, setWallet] = useState<WalletStats | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferData, setTransferData] = useState({
    recipientEmail: '',
    amount: ''
  });

  useEffect(() => {
    fetchWalletData();
  }, []);

  const fetchWalletData = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        router.push('/login');
        return;
      }

      const [walletResponse, transactionsResponse] = await Promise.all([
        axios.get('http://localhost:8000/api/v1/wallet', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('http://localhost:8000/api/v1/transactions?limit=10', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      setWallet(walletResponse.data);
      setTransactions(transactionsResponse.data);
    } catch (error) {
      console.error('Error fetching wallet data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('auth_token');
      await axios.post(
        'http://localhost:8000/api/v1/transactions/transfer',
        {
          recipient_email: transferData.recipientEmail,
          amount_kg: parseFloat(transferData.amount)
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success('Transfert réussi !');
      setShowTransferModal(false);
      setTransferData({ recipientEmail: '', amount: '' });
      fetchWalletData();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Échec du transfert');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600"></div>
      </div>
    );
  }

  if (!wallet) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <span className="text-6xl">❌</span>
          <h2 className="text-2xl font-bold text-gray-900 mt-4">Wallet not found</h2>
        </div>
      </div>
    );
  }

  const totalActivity = wallet.total_earned_kg + wallet.total_spent_kg + wallet.total_transferred_kg;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">💰 My Wallet</h1>
              <p className="text-gray-600 mt-1">Manage your baggage credits</p>
            </div>
            <button
              data-testid="transfer-btn"
              onClick={() => setShowTransferModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
            >
              🔄 Transfer Credits
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Balance Card */}
        <div className="bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl shadow-2xl p-8 mb-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm uppercase tracking-wide">Current Balance</p>
              <h2 data-testid="wallet-balance" className="text-6xl font-bold mt-2">{wallet.balance_kg.toFixed(1)} kg</h2>
              <p className="text-purple-100 mt-2">Available for use or transfer</p>
            </div>
            <div className="text-8xl opacity-20">
              💰
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Earned</p>
                <p className="text-3xl font-bold text-green-600 mt-1">
                  {wallet.total_earned_kg.toFixed(1)} kg
                </p>
              </div>
              <div className="bg-green-100 p-4 rounded-lg">
                <span className="text-3xl">📈</span>
              </div>
            </div>
            <div className="mt-4 bg-green-50 rounded-lg p-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Lifetime earnings</span>
                <span className="font-semibold text-green-700">
                  {totalActivity > 0 ? ((wallet.total_earned_kg / totalActivity) * 100).toFixed(0) : 0}%
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Spent</p>
                <p className="text-3xl font-bold text-red-600 mt-1">
                  {wallet.total_spent_kg.toFixed(1)} kg
                </p>
              </div>
              <div className="bg-red-100 p-4 rounded-lg">
                <span className="text-3xl">📉</span>
              </div>
            </div>
            <div className="mt-4 bg-red-50 rounded-lg p-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Lifetime spending</span>
                <span className="font-semibold text-red-700">
                  {totalActivity > 0 ? ((wallet.total_spent_kg / totalActivity) * 100).toFixed(0) : 0}%
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Transferred</p>
                <p className="text-3xl font-bold text-blue-600 mt-1">
                  {wallet.total_transferred_kg.toFixed(1)} kg
                </p>
              </div>
              <div className="bg-blue-100 p-4 rounded-lg">
                <span className="text-3xl">🔄</span>
              </div>
            </div>
            <div className="mt-4 bg-blue-50 rounded-lg p-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Lifetime transfers</span>
                <span className="font-semibold text-blue-700">
                  {totalActivity > 0 ? ((wallet.total_transferred_kg / totalActivity) * 100).toFixed(0) : 0}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Activity Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Activity Chart (Visual Representation) */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Activity Breakdown</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-700 font-medium">Earned</span>
                  <span className="text-green-600 font-bold">{wallet.total_earned_kg.toFixed(1)} kg</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full transition-all duration-500"
                    style={{ width: `${totalActivity > 0 ? (wallet.total_earned_kg / totalActivity) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-700 font-medium">Spent</span>
                  <span className="text-red-600 font-bold">{wallet.total_spent_kg.toFixed(1)} kg</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-red-500 to-red-600 rounded-full transition-all duration-500"
                    style={{ width: `${totalActivity > 0 ? (wallet.total_spent_kg / totalActivity) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-700 font-medium">Transferred</span>
                  <span className="text-blue-600 font-bold">{wallet.total_transferred_kg.toFixed(1)} kg</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500"
                    style={{ width: `${totalActivity > 0 ? (wallet.total_transferred_kg / totalActivity) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg border-2 border-purple-200">
              <p className="text-sm text-gray-700">
                <strong>Total Activity:</strong> {totalActivity.toFixed(1)} kg
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button
                onClick={() => router.push('/flights/add')}
                className="w-full p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-lg hover:from-green-100 hover:to-emerald-100 transition-all text-left"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-3xl">✈️</span>
                  <div>
                    <p className="font-semibold text-gray-900">Add Flight</p>
                    <p className="text-sm text-gray-600">Earn more credits from your flights</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setShowTransferModal(true)}
                className="w-full p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg hover:from-blue-100 hover:to-indigo-100 transition-all text-left"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-3xl">🔄</span>
                  <div>
                    <p className="font-semibold text-gray-900">Transfer Credits</p>
                    <p className="text-sm text-gray-600">Send credits to another user</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => router.push('/transactions')}
                className="w-full p-4 bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-lg hover:from-purple-100 hover:to-pink-100 transition-all text-left"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-3xl">📊</span>
                  <div>
                    <p className="font-semibold text-gray-900">View Transactions</p>
                    <p className="text-sm text-gray-600">See your complete history</p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-gray-900">Recent Transactions</h3>
            <button
              onClick={() => router.push('/transactions')}
              className="text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
            >
              View All →
            </button>
          </div>
          {transactions.length === 0 ? (
            <div className="text-center py-8">
              <span className="text-4xl">📝</span>
              <p className="text-gray-600 mt-2">No transactions yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.slice(0, 5).map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">
                      {transaction.transaction_type === 'credit' ? '💰' :
                       transaction.transaction_type === 'debit' ? '💸' : '🔄'}
                    </span>
                    <div>
                      <p className="font-medium text-gray-900">{transaction.description}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(transaction.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${
                      transaction.transaction_type === 'credit' ? 'text-green-600' :
                      transaction.transaction_type === 'debit' ? 'text-red-600' : 'text-blue-600'
                    }`}>
                      {transaction.transaction_type === 'debit' ? '-' : '+'}
                      {transaction.amount_kg.toFixed(1)} kg
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Transfer Modal */}
      {showTransferModal && (
        <div data-testid="transfer-modal" className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Transfer Credits</h2>
              <button
                onClick={() => setShowTransferModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleTransfer} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Recipient Email
                </label>
                <input
                  data-testid="recipient-email-input"
                  type="email"
                  required
                  pattern="[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}"
                  value={transferData.recipientEmail}
                  onChange={(e) => setTransferData({ ...transferData, recipientEmail: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="recipient@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount (kg)
                </label>
                <input
                  data-testid="transfer-amount-input"
                  type="number"
                  step="0.1"
                  min="0.1"
                  max={wallet.balance_kg}
                  required
                  value={transferData.amount}
                  onChange={(e) => setTransferData({ ...transferData, amount: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="0.0"
                />
                <p className="text-sm text-gray-600 mt-1">
                  Available: {wallet.balance_kg.toFixed(1)} kg
                </p>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  data-testid="transfer-cancel-btn"
                  type="button"
                  onClick={() => setShowTransferModal(false)}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  data-testid="transfer-submit-btn"
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
                >
                  Transfer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
