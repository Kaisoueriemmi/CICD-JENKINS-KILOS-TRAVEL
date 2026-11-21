'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Plane,
  Wallet,
  TrendingUp,
  Zap,
  Users,
  ArrowRight,
  CheckCircle,
} from 'lucide-react'

export default function Home() {
  const [, setHoveredFeature] = useState<number | null>(null)

  const features = [
    {
      icon: <Wallet className="w-8 h-8" />,
      title: 'Bagage Wallet',
      description: 'Stockez vos kilos non utilisés dans un portefeuille virtuel sécurisé',
      gradient: 'from-blue-500 to-cyan-400',
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: 'Scan Intelligent',
      description: 'Scannez vos tickets de bagages avec notre technologie OCR avancée',
      gradient: 'from-purple-500 to-pink-500',
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: 'Conversion Dynamique',
      description: 'Algorithme intelligent qui valorise vos kilos selon le type de vol',
      gradient: 'from-orange-500 to-red-500',
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: 'Marché de Kilos',
      description: 'Transférez vos crédits à vos proches voyageant sur la même compagnie',
      gradient: 'from-green-500 to-emerald-500',
    },
  ]

  const stats = [
    { value: '10K+', label: 'Utilisateurs Actifs' },
    { value: '50K+', label: 'Kilos Économisés' },
    { value: '€2M+', label: 'Économies Réalisées' },
    { value: '25+', label: 'Compagnies Partenaires' },
  ]

  const pricingPlans = [
    {
      name: 'Free',
      price: '0€',
      period: '/mois',
      features: [
        "Stockage jusqu'à 5 kg",
        '2 scans par mois',
        'Historique 3 mois',
        'Support communautaire',
      ],
      cta: 'Commencer Gratuitement',
      popular: false,
    },
    {
      name: 'Premium',
      price: '4.99€',
      period: '/mois',
      features: [
        'Stockage illimité',
        'Scans illimités',
        'Historique complet',
        'Transferts entre amis',
        'Support prioritaire',
        'Analytics avancés',
      ],
      cta: 'Essayer Premium',
      popular: true,
    },
    {
      name: 'Family',
      price: '9.99€',
      period: '/mois',
      features: [
        "Jusqu'à 5 comptes",
        'Pool de kilos partagé',
        'Toutes les fonctionnalités Premium',
        'Dashboard familial',
        'Support VIP',
      ],
      cta: 'Essayer Family',
      popular: false,
    },
  ]

  return (
    <div className="min-h-screen bg-white">

      {/* ── Navbar ─────────────────────────────────────────────────────── */}
      <nav className="fixed top-0 w-full bg-white/90 backdrop-blur-lg border-b border-gray-100 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Plane className="w-7 h-7 text-sky-500" />
              <span className="text-2xl font-bold text-gray-900">
                Air<span className="text-sky-500">Weight</span>
              </span>
            </div>

            <div className="hidden md:flex items-center space-x-8">
              <Link href="#features" className="text-gray-600 hover:text-sky-500 transition-colors text-sm font-medium">
                Fonctionnalités
              </Link>
              <Link href="#pricing" className="text-gray-600 hover:text-sky-500 transition-colors text-sm font-medium">
                Tarifs
              </Link>
              <Link href="#about" className="text-gray-600 hover:text-sky-500 transition-colors text-sm font-medium">
                À Propos
              </Link>
              <Link href="/login" className="text-gray-600 hover:text-sky-500 transition-colors text-sm font-medium">
                Connexion
              </Link>
              <Link
                href="/login"
                className="bg-sky-500 hover:bg-sky-600 text-white text-sm font-semibold px-5 py-2 rounded-lg transition-all duration-200 shadow-md shadow-sky-200"
              >
                S'inscrire
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <section className="pt-32 pb-20 px-4 bg-gradient-to-br from-white via-sky-50 to-indigo-50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              Transformez vos{' '}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-sky-500 to-purple-500">
                kilos perdus
              </span>
              <br />en crédits bagages
            </h1>
            <p className="text-xl md:text-2xl text-gray-500 mb-10 max-w-3xl mx-auto">
              La première plateforme SaaS qui valorise vos kilos non utilisés.{' '}
              Économisez sur vos futurs excès de bagages.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 bg-sky-500 hover:bg-sky-600 text-white font-semibold text-lg px-8 py-4 rounded-xl transition-all duration-200 shadow-lg shadow-sky-200"
              >
                Commencer Gratuitement
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="#demo"
                className="inline-flex items-center gap-2 border-2 border-sky-500 text-sky-500 hover:bg-sky-500 hover:text-white font-semibold text-lg px-8 py-4 rounded-xl transition-all duration-200"
              >
                Voir la Démo
              </Link>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-20"
          >
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-sky-500 to-purple-500 mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-500 text-sm">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────────────── */}
      <section id="features" className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Fonctionnalités{' '}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-pink-500">
                Innovantes
              </span>
            </h2>
            <p className="text-xl text-gray-500 max-w-2xl mx-auto">
              Une plateforme complète pour gérer intelligemment vos crédits bagages
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                onMouseEnter={() => setHoveredFeature(index)}
                onMouseLeave={() => setHoveredFeature(null)}
                className="group"
              >
                <div className={`bg-gradient-to-br ${feature.gradient} p-6 rounded-2xl text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 h-full`}>
                  <div className="mb-4 group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                  <p className="text-white/90 text-sm">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ─────────────────────────────────────────────────── */}
      <section className="py-20 px-4 bg-gradient-to-br from-sky-50 to-indigo-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Comment ça{' '}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-sky-500 to-purple-500">
                fonctionne
              </span>{' '}
              ?
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Voyagez Léger',
                description: 'Prenez votre vol avec moins de bagages que votre franchise autorisée',
              },
              {
                step: '02',
                title: 'Scannez & Créditez',
                description: 'Scannez votre ticket de bagage et recevez vos crédits instantanément',
              },
              {
                step: '03',
                title: 'Utilisez & Économisez',
                description: "Utilisez vos crédits pour vos futurs excès et économisez des centaines d'euros",
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="relative"
              >
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300 p-8">
                  <div className="text-6xl font-bold text-sky-100 mb-4">{item.step}</div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">{item.title}</h3>
                  <p className="text-gray-500">{item.description}</p>
                </div>
                {index < 2 && (
                  <ArrowRight className="hidden md:block absolute top-1/2 -right-4 w-8 h-8 text-sky-300 z-10" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ──────────────────────────────────────────────────────── */}
      <section id="pricing" className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Tarifs{' '}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-sky-500 to-cyan-400">
                Transparents
              </span>
            </h2>
            <p className="text-xl text-gray-500">
              Choisissez le plan qui vous convient
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {pricingPlans.map((plan, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="relative"
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                    <span className="bg-gradient-to-r from-sky-500 to-purple-500 text-white px-4 py-1 rounded-full text-sm font-semibold shadow">
                      Plus Populaire
                    </span>
                  </div>
                )}
                <div
                  className={`bg-white rounded-2xl shadow-xl border p-8 h-full flex flex-col transition-all duration-300 hover:shadow-2xl ${
                    plan.popular ? 'border-sky-400 ring-2 ring-sky-400' : 'border-gray-100'
                  }`}
                >
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <div className="mb-6">
                    <span className="text-5xl font-bold text-gray-900">{plan.price}</span>
                    <span className="text-gray-400 ml-1">{plan.period}</span>
                  </div>
                  <ul className="space-y-3 mb-8 flex-1">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-sky-500 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-600 text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/login"
                    className={
                      plan.popular
                        ? 'block w-full text-center bg-sky-500 hover:bg-sky-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-md shadow-sky-200'
                        : 'block w-full text-center border border-sky-500 text-sky-500 hover:bg-sky-50 font-semibold py-3 px-6 rounded-xl transition-all duration-200'
                    }
                  >
                    {plan.cta}
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <section className="py-20 px-4 bg-gradient-to-r from-sky-400 via-blue-500 to-purple-600">
        <div className="max-w-4xl mx-auto text-center text-white">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Prêt à économiser sur vos bagages ?
            </h2>
            <p className="text-xl mb-8 text-white/90">
              Rejoignez des milliers de voyageurs qui économisent déjà avec AirWeight
            </p>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 bg-white text-sky-600 hover:bg-gray-50 font-semibold px-8 py-4 rounded-xl transition-all duration-200 shadow-xl"
            >
              Créer mon compte gratuitement
              <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Plane className="w-6 h-6 text-sky-400" />
                <span className="text-xl font-bold">AirWeight</span>
              </div>
              <p className="text-gray-400 text-sm">
                La première plateforme de gestion de crédits bagages.
              </p>
            </div>

            <div>
              <h4 className="font-bold mb-4">Produit</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><Link href="#features" className="hover:text-white transition-colors">Fonctionnalités</Link></li>
                <li><Link href="#pricing" className="hover:text-white transition-colors">Tarifs</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">API</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4">Entreprise</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><Link href="#" className="hover:text-white transition-colors">À Propos</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Blog</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Carrières</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><Link href="#" className="hover:text-white transition-colors">Aide</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Contact</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Statut</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center text-gray-400 text-sm">
            <p>&copy; 2026 AirWeight. Made with ✈ by Kais Oueriemmi. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
