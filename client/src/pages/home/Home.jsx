import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import PublicHeader from '../../components/layout/PublicHeader'
import Footer from '../../components/layout/Footer'
import {
  Calendar,
  Clock,
  MessageCircle,
  Heart,
  Share2,
  Users,
  Star,
  ArrowRight,
  Play,
  Shield,
  Zap,
  Globe,
} from 'lucide-react'

export default function Home() {
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
        console.log('API Response status:', response.status)
        if (response.ok) {
          const result = await response.json()
          console.log('API Response data:', result)
          if (result.success && result.data) {
            console.log('Setting home page settings:', result.data)
            setHomePageSettings(result.data)
          } else {
            console.log('No data in response or success false')
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

  const features = [
    {
      icon: <Calendar className="w-6 h-6" />,
      title: 'Easy Scheduling',
      description:
        'Book appointments seamlessly with our intuitive calendar interface',
    },
    {
      icon: <MessageCircle className="w-6 h-6" />,
      title: 'Community Posts',
      description:
        'Stay updated with announcements, news, and community discussions',
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: 'Real-time Updates',
      description: 'Get instant notifications about your appointments and posts',
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: 'Connect with Others',
      description: 'Join a community of users and share your experiences',
    },
  ]

  const stats = [
    { number: '10K+', label: 'Active Users' },
    { number: '50K+', label: 'Appointments' },
    { number: '1K+', label: 'Community Posts' },
    { number: '99%', label: 'Satisfaction' },
  ]

  // Determine background style
  const getBackgroundStyle = () => {
    if (!homePageSettings || loading) {
      return {}
    }

    const bgValue = homePageSettings.background_value
    const isBase64 =
      bgValue?.startsWith('data:') ||
      (bgValue?.startsWith('/') && bgValue?.includes('9j/'))
    const isUrl = bgValue?.startsWith('http')

    if (isBase64 || isUrl) {
      let imageSrc = bgValue
      if (isBase64 && !bgValue.startsWith('data:')) {
        imageSrc = `data:image/jpeg;base64,${bgValue}`
      }

      return {
        // ADDED: Dark overlay to fix readability and blur effect
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(${imageSrc})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }
    }
    return {}
  }

  const getBackgroundClass = () => {
    if (loading) {
      return 'bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50'
    }

    if (!homePageSettings) {
      return 'bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50'
    }

    const bgValue = homePageSettings.background_value
    const isBase64 =
      bgValue?.startsWith('data:') ||
      (bgValue?.startsWith('/') && bgValue?.includes('9j/'))
    const isUrl = bgValue?.startsWith('http')

    if (isBase64 || isUrl) {
      return ''
    }

    return `bg-gradient-to-br ${bgValue || 'from-emerald-50 via-teal-50 to-cyan-50'}`
  }

  return (
    <div className="min-h-screen">
      <PublicHeader />

      {/* Hero Section */}
      <section
        className={`relative overflow-hidden min-h-[80vh] flex items-center ${getBackgroundClass()}`}
        style={getBackgroundStyle()}
      >
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              className="space-y-8"
            >
              <motion.div variants={fadeInUp}>
                <span className="inline-block px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-full text-sm font-semibold mb-6">
                  {loading
                    ? 'Welcome to the Future of Scheduling'
                    : homePageSettings?.welcome_badge ||
                      'Welcome to the Future of Scheduling'}
                </span>
              </motion.div>

              <motion.h1
                variants={fadeInUp}
                className="text-5xl lg:text-7xl font-bold text-white leading-tight"
              >
                {loading
                  ? 'Connect, Schedule, and'
                  : homePageSettings?.hero_title
                      ?.split(' ')
                      .slice(0, -1)
                      .join(' ') || 'Connect, Schedule, and'}{' '}
                <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
                  {loading
                    ? 'Stay Informed'
                    : homePageSettings?.hero_title?.split(' ').slice(-1)[0] ||
                      'Stay Informed'}
                </span>
              </motion.h1>

              <motion.p
                variants={fadeInUp}
                className="text-xl text-gray-100 leading-relaxed drop-shadow-md"
              >
                {loading
                  ? 'Your all-in-one platform for appointment scheduling and community engagement. Book appointments effortlessly and stay connected with your vibrant community.'
                  : homePageSettings?.hero_description ||
                    'Your all-in-one platform for appointment scheduling and community engagement. Book appointments effortlessly and stay connected with your vibrant community.'}
              </motion.p>

              <motion.div variants={fadeInUp} className="flex flex-wrap gap-4">
                <button
                  onClick={() => navigate('/calendar')}
                  className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
                >
                  <Calendar size={20} />
                  Schedule Now
                </button>
                <button
                  onClick={() => navigate('/posts')}
                  className="px-8 py-4 bg-white/10 backdrop-blur-md text-white border border-white/20 rounded-xl font-semibold hover:bg-white/30 transition-all"
                >
                  View Community
                </button>
              </motion.div>

              {/* Trust Indicators */}
              <motion.div
                variants={fadeInUp}
                className="flex items-center gap-6 pt-4"
              >
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="w-10 h-10 rounded-full border-2 border-white bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-xs font-bold"
                    >
                      {String.fromCharCode(64 + i)}
                    </div>
                  ))}
                </div>
                <p className="text-sm text-gray-200">
                  <span className="font-semibold text-white">10,000+</span> users
                  trust us
                </p>
              </motion.div>
            </motion.div>

            {/* Right Content - Hero Image/Illustration */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="relative bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-6 border border-white/20">
                {/* Sample Post Card */}
                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-6 mb-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold">T</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        TheAnxietyNurse
                      </h4>
                      <p className="text-sm text-gray-500">2 hours ago</p>
                    </div>
                  </div>
                  <p className="text-gray-700 mb-4">
                    🎉 Exciting news! Our new community feature is now live. Connect
                    with fellow users and stay updated!
                  </p>
                  <div className="flex items-center gap-6 text-gray-500 text-sm">
                    <span className="flex items-center gap-1">
                      <Heart size={16} className="text-red-500" /> 234 likes
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageCircle size={16} /> 45 comments
                    </span>
                  </div>
                </div>

                {/* Floating Elements */}
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ repeat: Infinity, duration: 3 }}
                  className="absolute -top-4 -right-4 bg-white rounded-xl shadow-lg p-4 border border-gray-100"
                >
                  <div className="flex items-center gap-2 text-emerald-600">
                    <Calendar size={20} />
                    <span className="font-semibold text-sm">Easy Booking</span>
                  </div>
                </motion.div>

                <motion.div
                  animate={{ y: [0, 10, 0] }}
                  transition={{ repeat: Infinity, duration: 3, delay: 1 }}
                  className="absolute -bottom-4 -left-4 bg-white rounded-xl shadow-lg p-4 border border-gray-100"
                >
                  <div className="flex items-center gap-2 text-teal-600">
                    <Users size={20} />
                    <span className="font-semibold text-sm">10K+ Community</span>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* REMOVED: Background Decoration divs that were causing the blurriness */}
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-2">
                  {stat.number}
                </div>
                <p className="text-gray-600 font-medium">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section
        id="features"
        className="py-20 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything You Need
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Powerful features designed to make your experience seamless and
              enjoyable
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-all hover:-translate-y-1"
              >
                <div className="w-14 h-14 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center text-white mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Why Choose{' '}
                <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  TheAnxietyNurse?
                </span>
              </h2>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                We're more than just a scheduling platform. We're a community-driven
                ecosystem that connects people, simplifies appointments, and keeps
                everyone informed with the latest updates and announcements.
              </p>

              <div className="space-y-6">
                {[
                  {
                    icon: <Shield size={24} />,
                    title: 'Secure & Reliable',
                    desc: 'Your data is protected with enterprise-grade security',
                  },
                  {
                    icon: <Zap size={24} />,
                    title: 'Lightning Fast',
                    desc: 'Optimized performance for the best user experience',
                  },
                  {
                    icon: <Globe size={24} />,
                    title: 'Always Available',
                    desc: '24/7 access from anywhere in the world',
                  },
                ].map((item, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 flex-shrink-0">
                      {item.icon}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">
                        {item.title}
                      </h4>
                      <p className="text-gray-600">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl p-8 text-white">
                <h3 className="text-2xl font-bold mb-4">Join Our Community Today</h3>
                <p className="mb-6 text-emerald-100">
                  Be part of a growing community of users who trust CMO Connect for
                  their scheduling and communication needs.
                </p>
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex -space-x-3">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        className="w-10 h-10 rounded-full border-2 border-white bg-white/20 flex items-center justify-center text-white text-xs font-bold"
                      >
                        {String.fromCharCode(64 + i)}
                      </div>
                    ))}
                  </div>
                  <span className="text-sm">+10,000 members</span>
                </div>
                <button
                  onClick={() => navigate('/posts')}
                  className="w-full py-3 bg-white text-emerald-600 rounded-xl font-semibold hover:bg-emerald-50 transition-all flex items-center justify-center gap-2"
                >
                  <Play size={18} />
                  Explore Posts
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section
        id="testimonials"
        className="py-20 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              What Our Users Say
            </h2>
            <p className="text-xl text-gray-600">Don't just take our word for it</p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-8"
          >
            {[
              {
                name: 'Sarah Johnson',
                role: 'Regular Client',
                content:
                  "The easiest appointment booking system I've ever used. The community posts keep me informed about everything!",
                rating: 5,
              },
              {
                name: 'Michael Chen',
                role: 'Business Owner',
                content:
                  'CMO Connect has streamlined our scheduling process. Our clients love the community engagement features.',
                rating: 5,
              },
              {
                name: 'Emily Davis',
                role: 'Healthcare Professional',
                content:
                  'Fantastic platform! The combination of scheduling and community features is exactly what we needed.',
                rating: 5,
              },
            ].map((testimonial, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100"
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      className="text-yellow-400 fill-current"
                    />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 leading-relaxed italic">
                  "{testimonial.content}"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white font-bold">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      {testimonial.name}
                    </h4>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-emerald-500 to-teal-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-emerald-100 mb-8">
            Join our community today and experience the future of scheduling and
            engagement
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={() => navigate('/calendar')}
              className="px-8 py-4 bg-white text-emerald-600 rounded-xl font-semibold hover:bg-emerald-50 transition-all shadow-lg flex items-center gap-2"
            >
              <Calendar size={20} />
              Book an Appointment
            </button>
            <button
              onClick={() => navigate('/posts')}
              className="px-8 py-4 bg-white/10 text-white border-2 border-white rounded-xl font-semibold hover:bg-white/20 transition-all"
            >
              View Community Posts
            </button>
            <button
              onClick={() => navigate('/login')}
              className="px-8 py-4 bg-emerald-700 text-white border-2 border-emerald-400 rounded-xl font-semibold hover:bg-emerald-800 transition-all"
            >
              Sign In Now
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
