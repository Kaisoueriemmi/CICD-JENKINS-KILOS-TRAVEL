'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

interface Subscription {
  id: number;
  plan_type: string;
  status: string;
  start_date: string;
  end_date?: string;
  auto_renew: boolean;
  price_paid: number;
}

interface User {
  role: string;
}

export default function SubscriptionPage() {
  const router = useRouter();
  const [currentSubscription, setCurrentSubscription] = useState<Subscription | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const plans = [
    {
      name: 'Free',
      price: 0,
      period: 'forever',
      features: [
        '✅ Basic flight tracking',
        '✅ Up to 5 flights per month',
        '✅ Standard credit calculation',
        '✅ Basic wallet features',
        '❌ Priority support',
        '❌ Advanced analytics',
        '❌ Family sharing'
      ],
      color: 'from-gray-600 to-gray-700',
      popular: false
    },
    {
      name: 'Premium',
      price: 9.99,
      period: 'month',
      features: [
        '✅ Unlimited flights',
        '✅ Enhanced credit multipliers',
        '✅ Priority OCR processing',
        '✅ Advanced analytics',
        '✅ Priority support',
        '✅ Export reports (CSV/PDF)',
        '❌ Family sharing (up to 5 members)'
      ],
      color: 'from-indigo-600 to-purple-600',
      popular: true
    },
    {
      name: 'Family',
      price: 19.99,
      period: 'month',
      features: [
        '✅ Everything in Premium',
        '✅ Family sharing (up to 5 members)',
        '✅ Shared wallet',
        '✅ Family analytics dashboard',
        '✅ Dedicated support',
        '✅ Custom credit rules',
        '✅ API access'
      ],
      color: 'from-pink-600 to-rose-600',
      popular: false
    }
  ];

  useEffect(() => {
    fetchSubscriptionData();
  }, []);

  const fetchSubscriptionData = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        router.push('/login');
        return;
      }

      const [userResponse, subsResponse] = await Promise.all([
        axios.get('http://localhost:8000/api/v1/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('http://localhost:8000/api/v1/subscriptions', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      setUser(userResponse.data);
      if (subsResponse.data.length > 0) {
        setCurrentSubscription(subsResponse.data[0]);
      }
    } catch (error) {
      console.error('Error fetching subscription data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = (planName: string, planPrice: number) => {
    setSelectedPlan(planName);

    if (planName === 'Free') {
      alert('You are already on the Free plan');
      setSelectedPlan(null);
      return;
    }

    // Redirect to checkout page with plan details
    router.push(`/checkout?plan=${encodeURIComponent(planName)}&price=${planPrice}`);
  };

  const handleCancelSubscription = async () => {
    if (!currentSubscription) return;

    const confirmed = confirm('Are you sure you want to cancel your subscription? You will lose access to premium features at the end of your billing period.');
    
    if (!confirmed) return;

    try {
      const token = localStorage.getItem('auth_token');
      await axios.delete(
        `http://localhost:8000/api/v1/subscriptions/${currentSubscription.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert('Subscription cancelled successfully');
      fetchSubscriptionData();
    } catch (error: any) {
      alert(error.response?.data?.detail || 'Failed to cancel subscription');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600"></div>
      </div>
    );
  }

  const currentPlan = user?.role || 'user';

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900">💎 Choose Your Plan</h1>
            <p className="text-gray-600 mt-2 text-lg">Unlock more features and maximize your baggage credits</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Current Subscription Banner */}
        {currentSubscription && (
          <div className="mb-8 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="bg-green-500 p-3 rounded-full">
                  <span className="text-3xl">✅</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Active Subscription</h3>
                  <p className="text-gray-700">
                    You're currently on the <strong>{currentSubscription.plan_type}</strong> plan
                  </p>
                  {currentSubscription.end_date && (
                    <p className="text-sm text-gray-600 mt-1">
                      {currentSubscription.auto_renew ? 'Renews' : 'Expires'} on {new Date(currentSubscription.end_date).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
              {currentSubscription.plan_type !== 'free' && (
                <button
                  onClick={handleCancelSubscription}
                  className="px-4 py-2 border-2 border-red-300 text-red-700 rounded-lg font-semibold hover:bg-red-50 transition-all"
                >
                  Cancel Subscription
                </button>
              )}
            </div>
          </div>
        )}

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {plans.map((plan) => {
            const isCurrentPlan = currentPlan.toLowerCase() === plan.name.toLowerCase() || 
                                  (currentPlan === 'user' && plan.name === 'Free');
            
            return (
              <div
                key={plan.name}
                className={`relative bg-white rounded-2xl shadow-xl overflow-hidden transition-all hover:scale-105 ${
                  plan.popular ? 'ring-4 ring-indigo-500' : ''
                }`}
              >
                {plan.popular && (
                  <div className="absolute top-0 right-0 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-1 text-sm font-semibold rounded-bl-lg">
                    ⭐ Most Popular
                  </div>
                )}

                <div className={`bg-gradient-to-r ${plan.color} p-8 text-white`}>
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <div className="flex items-baseline">
                    <span className="text-5xl font-bold">${plan.price}</span>
                    <span className="text-xl ml-2">/{plan.period}</span>
                  </div>
                </div>

                <div className="p-8">
                  <ul className="space-y-4 mb-8">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start space-x-3">
                        <span className="text-lg flex-shrink-0">{feature.split(' ')[0]}</span>
                        <span className="text-gray-700">{feature.substring(feature.indexOf(' ') + 1)}</span>
                      </li>
                    ))}
                  </ul>

                  {isCurrentPlan ? (
                    <button
                      disabled
                      className="w-full px-6 py-3 bg-gray-200 text-gray-500 rounded-lg font-semibold cursor-not-allowed"
                    >
                      Current Plan
                    </button>
                  ) : (
                    <button
                      onClick={() => handleUpgrade(plan.name, plan.price)}
                      disabled={selectedPlan === plan.name}
                      className={`w-full px-6 py-3 bg-gradient-to-r ${plan.color} text-white rounded-lg font-semibold hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {selectedPlan === plan.name ? (
                        <span className="flex items-center justify-center">
                          <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Processing...
                        </span>
                      ) : plan.price === 0 ? (
                        'Get Started'
                      ) : currentPlan === 'user' ? (
                        `Upgrade to ${plan.name}`
                      ) : (
                        `Switch to ${plan.name}`
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* FAQ Section */}
        <div className="bg-white rounded-xl shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Frequently Asked Questions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Can I change my plan anytime?</h3>
              <p className="text-gray-600 text-sm">Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately.</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">What payment methods do you accept?</h3>
              <p className="text-gray-600 text-sm">We accept all major credit cards, debit cards, and PayPal through our secure Stripe integration.</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Is there a free trial?</h3>
              <p className="text-gray-600 text-sm">The Free plan is available forever with no credit card required. Premium plans offer a 14-day money-back guarantee.</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Can I cancel my subscription?</h3>
              <p className="text-gray-600 text-sm">Yes, you can cancel anytime. You'll retain access until the end of your billing period.</p>
            </div>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-4">Trusted by thousands of travelers worldwide</p>
          <div className="flex justify-center items-center space-x-8 text-gray-400">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">🔒</span>
              <span className="text-sm">Secure Payment</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-2xl">💳</span>
              <span className="text-sm">Stripe Protected</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-2xl">✅</span>
              <span className="text-sm">Money-back Guarantee</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
