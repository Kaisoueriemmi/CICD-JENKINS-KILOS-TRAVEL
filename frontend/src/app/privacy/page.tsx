'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Shield, Lock } from 'lucide-react'
import Link from 'next/link'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <Link href="/" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-8 transition-colors">
          <ArrowLeft className="w-5 h-5 mr-2" />
          Retour à l'accueil
        </Link>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-12"
        >
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-green-50 rounded-xl text-green-600">
              <Shield className="w-8 h-8" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Politique de Confidentialité</h1>
          </div>

          <div className="prose prose-blue max-w-none text-gray-600 space-y-6">
            <p className="lead text-lg text-gray-700">
              Votre vie privée est notre priorité. Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
            </p>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">1. Collecte des Données</h2>
              <p>
                Nous collectons les informations que vous nous fournissez directement, notamment lors de la création de votre compte, de l'enregistrement de vos vols, et de vos communications avec nous.
              </p>
              <ul className="list-disc pl-5 mt-2 space-y-2">
                <li>Informations d'identité (Nom, Email)</li>
                <li>Données de voyage (Vols, Billets)</li>
                <li>Données techniques (Adresse IP, Cookies)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">2. Utilisation des Données</h2>
              <p>
                Vos données sont utilisées pour fournir, maintenir et améliorer nos services, notamment pour :
              </p>
              <ul className="list-disc pl-5 mt-2 space-y-2">
                <li>Gérer votre compte et vos crédits</li>
                <li>Vérifier la validité de vos billets (OCR sécurisé)</li>
                <li>Vous envoyer des notifications pertinentes</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">3. Protection des Données</h2>
              <p>
                Nous mettons en œuvre des mesures de sécurité techniques et organisationnelles appropriées pour protéger vos données contre tout accès, modification, divulgation ou destruction non autorisés.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">4. Vos Droits</h2>
              <p>
                Conformément au RGPD, vous disposez d'un droit d'accès, de rectification, de suppression et de portabilité de vos données. Contactez-nous à privacy@airweight.io pour exercer ces droits.
              </p>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
