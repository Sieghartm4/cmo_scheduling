import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { GoogleLogin } from '@react-oauth/google'
import {
  Lock,
  Mail,
  ArrowRight,
  Loader2,
  MessageCircle,
  Newspaper,
  Phone,
  User,
  Eye,
  EyeOff,
  Star,
  Bell,
} from 'lucide-react'
import Footer from '../../../components/layout/Footer'
import useUserLogin from './useUserLogin'
import useGoogleAuth from './useGoogleAuth'

export default function UserLogin() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [homePageSettings, setHomePageSettings] = useState(null)
  const { login, loading, error } = useUserLogin()
  const {
    handleGoogleAuth,
    handleGoogleError,
    loading: googleLoading,
    error: googleError,
  } = useGoogleAuth()

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
          }
        }
      } catch (error) {
        console.error('Error fetching home page settings:', error)
      }
    }

    fetchHomePageSettings()
  }, [])

  useEffect(() => {
    const adminToken = localStorage.getItem('adminToken')
    const userToken = localStorage.getItem('userToken')

    if (adminToken) {
      navigate('/admin/dashboard')
      return
    }

    if (userToken) {
      navigate('/dashboard')
      return
    }
  }, [navigate])

  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.key === 'F1') {
        event.preventDefault()
        window.location.href = '/admin/login'
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    login(formData)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      {/* Header Section */}
      <div className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            >
              {homePageSettings?.website_logo ? (
                homePageSettings.website_logo.startsWith('data:') ||
                homePageSettings.website_logo.startsWith('http') ? (
                  <img
                    src={
                      homePageSettings.website_logo.startsWith('data:')
                        ? homePageSettings.website_logo
                        : `data:image/jpeg;base64,${homePageSettings.website_logo}`
                    }
                    alt={homePageSettings.website_title || 'Logo'}
                    className="w-20 h-20"
                  />
                ) : (
                  <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                    <Newspaper size={24} className="text-white" />
                  </div>
                )
              ) : (
                <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                  <Newspaper size={24} className="text-white" />
                </div>
              )}
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  {homePageSettings?.website_title || 'CMO Scheduling'}
                </h1>
                <p className="text-xs text-gray-500">
                  {homePageSettings?.website_tagline ||
                    "Explore TheAnxietyNurse's journey"}
                </p>
              </div>
            </button>
            <button
              onClick={() => navigate('/')}
              className="text-emerald-600 font-medium hover:underline"
            >
              ← Back Home
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Welcome Content */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Welcome to the
                <span className="block text-emerald-600">TheAnxietyNurse Blog</span>
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Explore TheAnxietyNurse's story through his blog posts about anxiety,
                recovery, and life as a nurse in Japan. You can view, like, comment
                on, and share posts — only admins can publish new articles.
              </p>
            </div>

            {/* Features */}
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center shrink-0">
                  <MessageCircle size={24} className="text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">
                    TheAnxietyNurse Story
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Follow TheAnxietyNurse's journey from anxiety to recovery. View
                    his posts, like them, comment, and share your support.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center shrink-0">
                  <User size={24} className="text-teal-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">
                    Connect with Members
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Engage with posts, comment, and build connections with others
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-cyan-100 rounded-xl flex items-center justify-center shrink-0">
                  <Bell size={24} className="text-cyan-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">
                    Instant Notifications
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Get notified about replies, mentions, and trending posts
                  </p>
                </div>
              </div>
            </div>

            {/* Testimonial */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <div className="flex items-center gap-1 mb-3">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={16}
                    className="text-yellow-400 fill-current"
                  />
                ))}
              </div>
              <p className="text-gray-700 italic mb-3">
                "The community feed is fantastic — easy to discover and engage with
                posts. I always find useful conversations here!"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">
                    Sarah Johnson
                  </p>
                  <p className="text-gray-500 text-xs">Community Member</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Side - Login Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-md mx-auto w-full"
          >
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Newspaper size={32} className="text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Sign In to Explore TheAnxietyNurse Blog
                </h3>
                <p className="text-gray-600">
                  Access your account to view, share, and interact with posts
                </p>
              </div>

              <AnimatePresence>
                {(error || googleError) && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm flex items-center gap-3"
                  >
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                    {error || googleError}
                  </motion.div>
                )}
              </AnimatePresence>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                        <Mail size={20} />
                      </span>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg bg-gray-50 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all duration-200"
                        placeholder="your.email@example.com"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                        <Lock size={20} />
                      </span>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className="w-full pl-11 pr-12 py-3 border border-gray-300 rounded-lg bg-gray-50 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all duration-200"
                        placeholder="Enter your password"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-emerald-600 transition-colors"
                      >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500 focus:ring-2"
                    />
                    <span className="text-sm text-gray-600">Remember me</span>
                  </label>
                  <a
                    href="#"
                    className="text-sm font-medium text-emerald-600 hover:text-emerald-700 transition-colors"
                  >
                    Forgot password?
                  </a>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading || googleLoading}
                  className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-3.5 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign In & Explore TheAnxietyNurse
                      <ArrowRight size={20} />
                    </>
                  )}
                </motion.button>
              </form>

              <div className="mt-6">
                <div className="relative flex items-center gap-3">
                  <div className="flex-1 border-t border-gray-200"></div>
                  <span className="text-xs text-gray-500 font-medium">OR</span>
                  <div className="flex-1 border-t border-gray-200"></div>
                </div>
              </div>

              <div className="mt-6 flex justify-center">
                <GoogleLogin
                  onSuccess={handleGoogleAuth}
                  onError={handleGoogleError}
                  size="large"
                  width="100%"
                />
              </div>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  New here?{' '}
                  <button
                    onClick={() => navigate('/register')}
                    className="font-medium text-emerald-600 hover:text-emerald-700 transition-colors"
                  >
                    Create an account
                  </button>
                </p>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center justify-center gap-6 text-xs text-gray-500">
                  <a href="#" className="hover:text-gray-700 transition-colors">
                    Privacy Policy
                  </a>
                  <span>•</span>
                  <a href="#" className="hover:text-gray-700 transition-colors">
                    Terms of Service
                  </a>
                  <span>•</span>
                  <a href="#" className="hover:text-gray-700 transition-colors">
                    Help Center
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
