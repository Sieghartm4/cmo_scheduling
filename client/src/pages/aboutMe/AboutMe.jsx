import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import PublicHeader from '../../components/layout/PublicHeader'
import Footer from '../../components/layout/Footer'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import {
  User,
  MapPin,
  Phone,
  Mail,
  Heart,
  BookOpen,
  Star,
  Lightbulb,
  TrendingUp,
  Shield,
  Sunrise,
  Award,
} from 'lucide-react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

// Icon pool for story cards
const CARD_ICONS = [
  BookOpen,
  Heart,
  TrendingUp,
  Lightbulb,
  Shield,
  Sunrise,
  Star,
  Award,
]

// Card themes — alternating visual styles
const CARD_THEMES = [
  {
    gradient: 'from-emerald-500 to-teal-600',
    bg: 'bg-white',
    border: 'border-emerald-100',
    headingColor: 'text-emerald-700',
    iconBg: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
    accentBar: 'bg-gradient-to-b from-emerald-400 to-teal-500',
    tag: 'bg-emerald-50 text-emerald-600',
  },
  {
    gradient: 'from-teal-500 to-cyan-600',
    bg: 'bg-gradient-to-br from-teal-50/60 to-cyan-50/60',
    border: 'border-teal-100',
    headingColor: 'text-teal-700',
    iconBg: 'bg-teal-50',
    iconColor: 'text-teal-600',
    accentBar: 'bg-gradient-to-b from-teal-400 to-cyan-500',
    tag: 'bg-teal-50 text-teal-600',
  },
]

export default function AboutMe() {
  const navigate = useNavigate()
  const [homePageSettings, setHomePageSettings] = useState(null)
  const [loading, setLoading] = useState(true)
  const [mapCoordinates, setMapCoordinates] = useState(null)
  const [mapLoading, setMapLoading] = useState(false)

  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  }

  const fadeInLeft = {
    hidden: { opacity: 0, x: -40 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.6 } },
  }

  const fadeInRight = {
    hidden: { opacity: 0, x: 40 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.6 } },
  }

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
  }

  useEffect(() => {
    const fetchHomePageSettings = async () => {
      try {
        const timestamp = new Date().getTime()
        const response = await fetch(
          `${import.meta.env.VITE_SERVER_LINK}/api/home-page-settings?t=${timestamp}`,
          { cache: 'no-cache' },
        )
        if (response.ok) {
          const result = await response.json()
          if (result.success && result.data) {
            setHomePageSettings(result.data)
            if (result.data.location) geocodeLocation(result.data.location)
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

  const getAboutMeImage = () => {
    if (!homePageSettings?.about_me_image) return null
    if (homePageSettings.about_me_image.startsWith('data:'))
      return homePageSettings.about_me_image
    if (homePageSettings.about_me_image.startsWith('/'))
      return `data:image/jpeg;base64,${homePageSettings.about_me_image}`
    if (homePageSettings.about_me_image.startsWith('http'))
      return homePageSettings.about_me_image
    return null
  }

  const geocodeLocation = async (address) => {
    if (!address) return
    setMapLoading(true)
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`,
        { headers: { 'User-Agent': 'CMO-Scheduling-App/1.0' } },
      )
      if (response.ok) {
        const data = await response.json()
        if (data?.length > 0) {
          const { lat, lon } = data[0]
          setMapCoordinates([parseFloat(lat), parseFloat(lon)])
        }
      }
    } catch (error) {
      console.error('Error geocoding location:', error)
    } finally {
      setMapLoading(false)
    }
  }

  /**
   * Parse raw DB text into sections.
   * Handles literal "\n" strings (as stored in DB) AND actual newlines.
   */
  const parseAboutMeContent = (text) => {
    if (!text) return []

    // Fix literal \n stored as text in DB (e.g. "hello\n\nworld" → actual newlines)
    const fixed = text
      .replace(/\\n/g, '\n') // literal \n → real newline
      .replace(/\r/g, '')

    const headingTriggers = [
      'How',
      'When',
      'Reaching',
      'Achieving',
      'The road',
      'Stop',
      "Here's",
      'My road',
      'Before I begin',
      'This was',
      'Without further delay',
    ]

    const isHeading = (line) => {
      const t = line.trim()
      if (!t || t.length > 120) return false
      if (/[.?!]$/.test(t)) return false
      return headingTriggers.some((trigger) => t.startsWith(trigger))
    }

    const blocks = fixed
      .split(/\n{2,}/)
      .map((b) => b.trim())
      .filter(Boolean)

    const sections = []
    let current = null

    for (const block of blocks) {
      const lines = block
        .split('\n')
        .map((l) => l.trim())
        .filter(Boolean)
      if (!lines.length) continue

      if (isHeading(lines[0])) {
        if (current) sections.push(current)
        current = {
          heading: lines[0],
          content: lines.slice(1).join(' '),
        }
      } else {
        const paragraph = lines.join(' ')
        if (current) {
          current.content = current.content
            ? `${current.content} ${paragraph}`
            : paragraph
        } else {
          sections.push({ heading: null, content: paragraph })
        }
      }
    }
    if (current) sections.push(current)

    return sections.filter((s) => s.content || s.heading)
  }

  const sections = parseAboutMeContent(homePageSettings?.about_me_description)

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      <PublicHeader />

      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="relative overflow-hidden min-h-[15vh] flex items-center">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/20 to-teal-600/20" />
        {/* decorative blobs */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-200/40 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-teal-200/40 rounded-full blur-3xl" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-6">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="text-center space-y-6"
          >
            <motion.h1
              variants={fadeInUp}
              className="text-3xl lg:text-5xl font-bold text-gray-900 leading-tight"
            >
              Get to Know{' '}
              <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                Me Better
              </span>
            </motion.h1>
            <motion.p
              variants={fadeInUp}
              className="text-base lg:text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed"
            >
              Learn more about my background, experience, and what drives me to help
              you succeed.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* ── Profile Card ─────────────────────────────────── */}
      <section className="py-10 lg:py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-1">
          <div className="grid lg:grid-cols-[3fr_1fr] gap-12 items-center">
            {/* ── Image + floating cards ── */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInLeft}
              className="relative"
            >
              {/* Main image */}
              <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                {getAboutMeImage() ? (
                  <img
                    src={getAboutMeImage()}
                    alt="About Me"
                    className="w-full h-[560px] object-cover"
                  />
                ) : (
                  <div className="w-full h-[560px] bg-gradient-to-br from-emerald-100 to-teal-200 flex items-center justify-center">
                    <User size={80} className="text-emerald-400" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              </div>

              {/* Floating Email card — top-left, floats up/down slowly */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4, duration: 0.5 }}
                animate={{ y: [0, -10, 0] }}
                // framer-motion keyframe loop for the float
                style={{ position: 'absolute', top: '-20px', left: '-20px' }}
              >
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                  className="bg-white rounded-2xl shadow-xl px-4 py-3 flex items-center gap-3 border border-gray-100"
                >
                  <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center shrink-0">
                    <Mail size={18} className="text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-medium">Email me</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {homePageSettings?.contact_email || 'Contact email'}
                    </p>
                  </div>
                </motion.div>
              </motion.div>

              {/* Floating Phone card — bottom-right, floats with offset phase */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.6, duration: 0.5 }}
                style={{ position: 'absolute', bottom: '-20px', right: '-20px' }}
              >
                <motion.div
                  animate={{ y: [0, 10, 0] }}
                  transition={{
                    duration: 3.4,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: 0.5,
                  }}
                  className="bg-white rounded-2xl shadow-xl px-4 py-3 flex items-center gap-3 border border-gray-100"
                >
                  <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center shrink-0">
                    <Phone size={18} className="text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-medium">Call me</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {homePageSettings?.contact_number || 'Contact number'}
                    </p>
                  </div>
                </motion.div>
              </motion.div>
            </motion.div>

            {/* ── Info panel ── */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInRight}
              className="flex flex-col gap-6"
            >
              <div>
                <p className="text-sm font-semibold text-emerald-600 uppercase tracking-widest mb-2">
                  Personal Profile
                </p>
                <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">
                  {homePageSettings?.name || 'About Me'}
                </h2>
              </div>

              <div className="h-px bg-gray-100" />

              <p className="text-gray-500 leading-relaxed text-[15px]">
                Read my story below — I share my personal journey and experiences
                that have shaped who I am and how I help others today.
              </p>

              <button
                onClick={() => navigate('/login')}
                className="self-start inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-sm font-semibold rounded-xl shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200"
              >
                Get Started
              </button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Story Cards ──────────────────────────────────── */}
      <section className="pb-20 lg:pb-28">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section header */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center mb-12"
          >
            <motion.h2
              variants={fadeInUp}
              className="text-3xl lg:text-4xl font-bold text-gray-900 mb-3"
            >
              My Story
            </motion.h2>
            <motion.div
              variants={fadeInUp}
              className="w-20 h-1 bg-gradient-to-r from-emerald-500 to-teal-600 mx-auto rounded-full"
            />
          </motion.div>

          {loading ? (
            /* Skeleton */
            <div className="space-y-6">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={`w-full lg:w-[78%] ${i % 2 === 0 ? 'ml-auto' : ''} bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-3`}
                >
                  <div className="h-5 bg-gray-200 rounded animate-pulse w-1/3" />
                  <div className="h-3 bg-gray-100 rounded animate-pulse" />
                  <div className="h-3 bg-gray-100 rounded animate-pulse w-5/6" />
                  <div className="h-3 bg-gray-100 rounded animate-pulse w-4/6" />
                </div>
              ))}
            </div>
          ) : sections.length > 0 ? (
            <div className="space-y-15">
              {sections.map((section, idx) => {
                const theme = CARD_THEMES[idx % CARD_THEMES.length]
                const Icon = CARD_ICONS[idx % CARD_ICONS.length]
                const isRight = idx % 2 === 1
                const cardVariant = isRight ? fadeInRight : fadeInLeft

                return (
                  <motion.div
                    key={idx}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: '-40px' }}
                    variants={cardVariant}
                    className={`flex ${isRight ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`
                        w-full lg:w-[80%] ${theme.bg} border ${theme.border}
                        rounded-2xl shadow-sm overflow-hidden
                        hover:shadow-md transition-shadow duration-300
                      `}
                    >
                      {/* Coloured top-strip with icon */}
                      <div
                        className={`h-1.5 w-full bg-gradient-to-r ${theme.gradient}`}
                      />

                      <div className="p-6 lg:p-8">
                        <div className="flex items-start gap-4">
                          {/* Icon badge */}
                          <div
                            className={`shrink-0 w-10 h-10 rounded-xl ${theme.iconBg} flex items-center justify-center mt-0.5`}
                          >
                            <Icon size={18} className={theme.iconColor} />
                          </div>

                          <div className="flex-1 min-w-0">
                            {/* Chapter label */}
                            <span
                              className={`inline-block text-xs font-semibold uppercase tracking-widest px-2 py-0.5 rounded-full ${theme.tag} mb-2`}
                            >
                              Part {idx + 1}
                            </span>

                            {section.heading && (
                              <h3
                                className={`text-xl lg:text-2xl font-bold ${theme.headingColor} mb-3 leading-snug`}
                              >
                                {section.heading}
                              </h3>
                            )}

                            {section.content && (
                              <p className="text-gray-600 leading-relaxed text-[15px]">
                                {section.content}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          ) : (
            !loading && (
              <p className="text-center text-gray-400 italic py-12">
                About me information will be shared here soon.
              </p>
            )
          )}
        </div>
      </section>

      {/* ── Location ─────────────────────────────────────── */}
      <section className="py-20 lg:py-28 bg-white/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center mb-12"
          >
            <motion.h2
              variants={fadeInUp}
              className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4"
            >
              Where I Work
            </motion.h2>
            <motion.div
              variants={fadeInUp}
              className="w-24 h-1 bg-gradient-to-r from-emerald-500 to-teal-600 mx-auto rounded-full"
            />
          </motion.div>

          {homePageSettings?.location && (
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
            >
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                    <MapPin size={24} className="text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 font-medium">Location</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {homePageSettings.location}
                    </p>
                  </div>
                </div>
              </div>

              <div className="h-80 relative z-0">
                {mapLoading ? (
                  <div className="h-full flex items-center justify-center bg-gray-50">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">Loading map…</p>
                    </div>
                  </div>
                ) : mapCoordinates ? (
                  <MapContainer
                    center={mapCoordinates}
                    zoom={13}
                    style={{ height: '100%', width: '100%' }}
                    className="rounded-b-2xl relative z-0"
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <Marker position={mapCoordinates}>
                      <Popup>
                        <strong>{homePageSettings.location}</strong>
                      </Popup>
                    </Marker>
                  </MapContainer>
                ) : (
                  <div className="h-full flex items-center justify-center bg-gray-50">
                    <div className="text-center">
                      <MapPin size={32} className="text-gray-300 mx-auto mb-2" />
                      <p className="text-sm text-gray-400">Map not available</p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────── */}
      <section className="py-20 bg-gradient-to-r from-emerald-600 to-teal-600">
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
              Ready to Work Together?
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-xl text-emerald-100">
              Let's connect and discuss how we can achieve your goals together.
            </motion.p>
            <motion.div variants={fadeInUp}>
              <button
                onClick={() => navigate('/login')}
                className="inline-flex items-center gap-3 px-8 py-4 bg-white text-emerald-600 font-semibold rounded-xl hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                Get Started
                <User size={20} />
              </button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
