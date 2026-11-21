'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Shield, FileText } from 'lucide-react'
import Link from 'next/link'

export default function TermsPage() {
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
            <div className="p-3 bg-primary-50 rounded-xl text-primary-600">
              <FileText className="w-8 h-8" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Conditions Générales d'Utilisation</h1>
          </div>

          <div className="prose prose-blue max-w-none text-gray-600 space-y-6">
            <p className="lead text-lg text-gray-700">
              Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
            </p>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">1. Acceptation des Conditions</h2>
              <p>
                En accédant et en utilisant la plateforme AirWeight, vous acceptez d'être lié par ces conditions générales d'utilisation. Si vous n'acceptez pas ces termes, veuillez ne pas utiliser nos services.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">2. Description du Service</h2>
              <p>
                AirWeight est une plateforme permettant aux voyageurs de gérer leurs franchises bagages non utilisées. Nous fournissons des outils pour scanner, suivre et potentiellement valoriser ces excédents.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">3. Compte Utilisateur</h2>
              <p>
                Vous êtes responsable de maintenir la confidentialité de votre mot de passe et de votre compte. Vous acceptez de nous notifier immédiatement de toute utilisation non autorisée de votre compte.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">4. Utilisation des Crédits</h2>
              <p>
                Les crédits "Kilos" accumulés sur la plateforme n'ont pas de valeur monétaire directe en dehors de l'écosystème AirWeight et de nos partenaires agréés.
              </p>
            </section>

             <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">5. Modification des Services</h2>
              <p>
                Nous nous réservons le droit de modifier ou d'interrompre le service à tout moment, avec ou sans préavis.
              </p>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
