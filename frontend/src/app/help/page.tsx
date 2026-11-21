'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  HelpCircle, 
  Search, 
  ChevronDown, 
  ChevronUp, 
  Mail, 
  MessageCircle,
  Book,
  Video,
  FileText
} from 'lucide-react'

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const faqs = [
    {
      question: "Comment fonctionne le système de kilos ?",
      answer: "Le système de kilos vous permet d'économiser et de partager des kilos de bagages. Lorsque vous voyagez léger, vous gagnez des kilos que vous pouvez utiliser lors de vos prochains voyages ou transférer à d'autres utilisateurs."
    },
    {
      question: "Comment puis-je gagner des kilos ?",
      answer: "Vous gagnez des kilos en voyageant avec moins de bagages que votre allocation. Par exemple, si vous avez droit à 23kg mais ne voyagez qu'avec 15kg, vous gagnez 8kg de crédit."
    },
    {
      question: "Comment utiliser mes kilos accumulés ?",
      answer: "Vous pouvez utiliser vos kilos lors de votre prochain vol si vous dépassez votre allocation de bagages, ou les transférer à un ami ou un membre de votre famille."
    },
    {
      question: "Les kilos expirent-ils ?",
      answer: "Non, vos kilos n'expirent jamais. Vous pouvez les conserver aussi longtemps que vous le souhaitez et les utiliser quand vous en avez besoin."
    },
    {
      question: "Comment transférer des kilos à quelqu'un ?",
      answer: "Allez dans votre wallet, cliquez sur 'Transférer', entrez l'email du destinataire et le nombre de kilos que vous souhaitez transférer."
    },
    {
      question: "Puis-je vendre mes kilos ?",
      answer: "Non, les kilos ne peuvent pas être vendus. Ils peuvent uniquement être utilisés pour vos propres bagages ou transférés gratuitement à d'autres utilisateurs."
    },
    {
      question: "Comment suivre mes vols ?",
      answer: "Tous vos vols sont automatiquement enregistrés dans votre tableau de bord. Vous pouvez voir l'historique complet, les kilos gagnés et utilisés pour chaque vol."
    },
    {
      question: "Que faire si j'ai un problème avec mon compte ?",
      answer: "Contactez notre support via le formulaire ci-dessous ou envoyez-nous un email à support@airweight.io. Nous répondons généralement sous 24h."
    }
  ]

  const resources = [
    {
      icon: Book,
      title: "Guide d'utilisation",
      description: "Apprenez à utiliser toutes les fonctionnalités",
      link: "#"
    },
    {
      icon: Video,
      title: "Tutoriels vidéo",
      description: "Regardez nos tutoriels pas à pas",
      link: "#"
    },
    {
      icon: FileText,
      title: "Documentation",
      description: "Consultez la documentation complète",
      link: "#"
    }
  ]

  const filteredFaqs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 bg-primary-100 rounded-full mb-6">
            <HelpCircle className="w-10 h-10 text-primary-600" />
          </div>
          <h1 className="text-4xl font-display font-bold gradient-text mb-4">
            Centre d'aide
          </h1>
          <p className="text-xl text-gray-600">
            Comment pouvons-nous vous aider aujourd'hui ?
          </p>
        </motion.div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-12"
        >
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher dans les questions fréquentes..."
              className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-gray-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 transition-all duration-300 text-lg"
            />
          </div>
        </motion.div>

        {/* Resources */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
        >
          {resources.map((resource, index) => {
            const Icon = resource.icon
            return (
              <a
                key={index}
                href={resource.link}
                className="card-premium p-6 text-center hover:scale-105 transition-transform duration-300"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-100 rounded-xl mb-4">
                  <Icon className="w-6 h-6 text-primary-600" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{resource.title}</h3>
                <p className="text-sm text-gray-600">{resource.description}</p>
              </a>
            )
          })}
        </motion.div>

        {/* FAQs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-12"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Questions fréquentes
          </h2>
          <div className="space-y-4">
            {filteredFaqs.map((faq, index) => (
              <div key={index} className="card-premium overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 transition-colors duration-200"
                >
                  <span className="font-semibold text-gray-900 pr-4">
                    {faq.question}
                  </span>
                  {openFaq === index ? (
                    <ChevronUp className="w-5 h-5 text-primary-600 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  )}
                </button>
                {openFaq === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="px-6 pb-6"
                  >
                    <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                  </motion.div>
                )}
              </div>
            ))}
          </div>

          {filteredFaqs.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">
                Aucune question ne correspond à votre recherche.
              </p>
            </div>
          )}
        </motion.div>

        {/* Contact Support */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card-premium p-8 text-center"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Vous ne trouvez pas de réponse ?
          </h2>
          <p className="text-gray-600 mb-6">
            Notre équipe de support est là pour vous aider
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="mailto:support@airweight.io"
              className="btn-primary inline-flex items-center justify-center"
            >
              <Mail className="w-5 h-5 mr-2" />
              Envoyer un email
            </a>
            <button className="btn-outline inline-flex items-center justify-center">
              <MessageCircle className="w-5 h-5 mr-2" />
              Chat en direct
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
