import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import PublicHeader from '../../components/layout/PublicHeader'
import Footer from '../../components/layout/Footer'
import { Shield, FileText } from 'lucide-react'

export default function Disclaimer() {
  const navigate = useNavigate()
  const [homePageSettings, setHomePageSettings] = useState(null)
  const [loading, setLoading] = useState(true)

  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  }

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  }

  // Fetch home page settings from API
  useEffect(() => {
    const fetchHomePageSettings = async () => {
      try {
        const timestamp = new Date().getTime()
        const response = await fetch(
          `${import.meta.env.VITE_SERVER_LINK}/api/home-page-settings?t=${timestamp}`,
          {
            cache: 'no-cache',
          },
        )
        if (response.ok) {
          const result = await response.json()
          if (result.success && result.data) {
            setHomePageSettings(result.data)
          }
        }
      } catch (error) {
        console.error('Error fetching home page settings:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchHomePageSettings()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-50">
      <PublicHeader />

      {/* Hero Section */}
      <section className="relative overflow-hidden min-h-[50vh] flex items-center">
        <div className="absolute inset-0 bg-gradient-to-r from-slate-600/20 to-gray-600/20" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="text-center space-y-8"
          >
            <motion.div variants={fadeInUp}>
              <span className="inline-block px-4 py-2 bg-gradient-to-r from-slate-600 to-gray-600 text-white rounded-full text-sm font-semibold mb-6">
                Legal Notice
              </span>
            </motion.div>

            <motion.h1
              variants={fadeInUp}
              className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight"
            >
              Disclaimer &{' '}
              <span className="bg-gradient-to-r from-slate-600 to-gray-600 bg-clip-text text-transparent">
                Legal Information
              </span>
            </motion.h1>

            <motion.p
              variants={fadeInUp}
              className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed"
            >
              Important legal information and terms that govern the use of our
              services.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Disclaimer Content */}
      <section className="py-20 lg:py-28">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Main Disclaimer Content */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="lg:col-span-2 space-y-8"
            >
              <motion.div variants={fadeInUp}>
                <div className="bg-white rounded-2xl shadow-xl p-8 lg:p-12 border border-gray-100">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-16 h-16 bg-gradient-to-r from-slate-600 to-gray-600 rounded-xl flex items-center justify-center">
                      <FileText size={32} className="text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">
                        Official Disclaimer
                      </h2>
                      <p className="text-gray-600">
                        Last updated: {new Date().toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="prose prose-lg max-w-none text-gray-700">
                    {loading ? (
                      <div className="space-y-4">
                        <div className="h-4 bg-gray-200 rounded animate-pulse" />
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
                        <div className="h-4 bg-gray-200 rounded animate-pulse" />
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-5/6" />
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-4/5" />
                      </div>
                    ) : (
                      <div className="whitespace-pre-line leading-relaxed">
                        {homePageSettings?.disclaimer ||
                          `This website and its contents are provided for informational purposes only. All information, products, and services are presented without warranty of any kind, either express or implied.

By accessing and using this website, you acknowledge and agree that the use of any information, products, or services is at your own risk. We shall not be liable for any direct, indirect, incidental, consequential, or punitive damages arising out of your access to or use of this website.

All content on this website is subject to change without notice. We reserve the right to modify, suspend, or discontinue any aspect of this website at any time.

For legal advice or professional services, please consult with qualified professionals in the appropriate field. The information provided here does not constitute legal, financial, or medical advice.`}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            </motion.div>

            {/* Sidebar with Contact Information */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="space-y-6"
            >
              {/* Contact Information */}
              <motion.div
                variants={fadeInUp}
                className="bg-gradient-to-r from-slate-600 to-gray-600 rounded-xl shadow-lg p-6 text-white"
              >
                <h4 className="font-semibold mb-4">Questions?</h4>
                <div className="space-y-3">
                  {homePageSettings?.contact_email && (
                    <p className="text-sm">
                      <strong>Email:</strong> {homePageSettings.contact_email}
                    </p>
                  )}
                  {homePageSettings?.contact_number && (
                    <p className="text-sm">
                      <strong>Phone:</strong> {homePageSettings.contact_number}
                    </p>
                  )}
                  {homePageSettings?.location && (
                    <p className="text-sm">
                      <strong>Location:</strong> {homePageSettings.location}
                    </p>
                  )}
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-slate-600 to-gray-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="space-y-8"
          >
            <motion.h2
              variants={fadeInUp}
              className="text-3xl lg:text-4xl font-bold text-white"
            >
              Have Questions About Our Services?
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-xl text-slate-100">
              We're here to help. Contact us for more information or clarification.
            </motion.p>
            <motion.div variants={fadeInUp}>
              <button
                onClick={() => navigate('/login')}
                className="inline-flex items-center gap-3 px-8 py-4 bg-white text-slate-600 font-semibold rounded-xl hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                Contact Us
                <Shield size={20} />
              </button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
