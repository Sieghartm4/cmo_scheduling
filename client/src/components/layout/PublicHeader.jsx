import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  Calendar,
  User,
  LogOut,
  ChevronDown,
  Menu,
  X,
  Home,
  Facebook,
  Instagram,
  Twitter,
  Youtube,
  Linkedin,
  Globe,
  Github,
} from 'lucide-react'

export default function PublicHeader() {
  const navigate = useNavigate()
  const location = useLocation()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState(null)
  const [showLogout, setShowLogout] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [homePageSettings, setHomePageSettings] = useState(null)
  const [socialMediaLinks, setSocialMediaLinks] = useState([])

  const socialIconComponents = {
    facebook: Facebook,
    instagram: Instagram,
    twitter: Twitter,
    youtube: Youtube,
    linkedin: Linkedin,
    github: Github,
    tiktok: Globe,
    website: Globe,
    web: Globe,
  }

  const handleHomeClick = () => {
    if (location.pathname === '/') {
      // Already on home page, scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      // Not on home page, navigate to home
      navigate('/')
    }
  }

  const checkLoginStatus = () => {
    const token =
      localStorage.getItem('token') ||
      localStorage.getItem('userToken') ||
      localStorage.getItem('adminToken')
    const userData = localStorage.getItem('user')
    setIsLoggedIn(!!token)
    if (userData) {
      try {
        setUser(JSON.parse(userData))
      } catch (e) {
        setUser(null)
      }
    } else {
      setUser(null)
    }
  }

  const handleLogout = () => {
    // Clear all auth tokens
    localStorage.removeItem('token')
    localStorage.removeItem('userToken')
    localStorage.removeItem('adminToken')
    localStorage.removeItem('user')

    // Update state
    setIsLoggedIn(false)
    setUser(null)
    setShowLogout(false)

    // Navigate to home
    navigate('/')
  }

  // Fetch home page settings from API
  useEffect(() => {
    const fetchHomePageSettings = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_SERVER_LINK}/api/home-page-settings`,
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

  // Fetch social media links from API
  useEffect(() => {
    const fetchSocialMediaLinks = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_SERVER_LINK}/api/social-media`,
        )
        if (response.ok) {
          const result = await response.json()
          if (result.success && Array.isArray(result.data)) {
            setSocialMediaLinks(
              result.data
                .filter((item) =>
                  item.status ? item.status.toLowerCase() !== 'inactive' : true,
                )
                .map((item) => ({
                  platform:
                    item.platform ||
                    item.social_media_platform ||
                    item.master_social_media_platform ||
                    '',
                  url:
                    item.url ||
                    item.social_media_url ||
                    item.master_social_media_url ||
                    '',
                  status:
                    item.status ||
                    item.social_media_status ||
                    item.master_social_media_status ||
                    'active',
                })),
            )
          }
        }
      } catch (error) {
        console.error('Error fetching social media links:', error)
      }
    }

    fetchSocialMediaLinks()
  }, [])

  useEffect(() => {
    checkLoginStatus()

    // Listen for storage changes (login/logout in other tabs)
    window.addEventListener('storage', checkLoginStatus)

    // Check every second for changes (for same-tab updates)
    const interval = setInterval(checkLoginStatus, 1000)

    return () => {
      window.removeEventListener('storage', checkLoginStatus)
      clearInterval(interval)
    }
  }, [])

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div
            onClick={handleHomeClick}
            className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
          >
            {homePageSettings?.website_logo &&
              // If logo exists, display it
              (homePageSettings.website_logo.startsWith('data:') ||
              homePageSettings.website_logo.startsWith('http') ? (
                <img
                  src={
                    homePageSettings.website_logo.startsWith('data:')
                      ? homePageSettings.website_logo
                      : `data:image/jpeg;base64,${homePageSettings.website_logo}`
                  }
                  alt={homePageSettings.website_title || 'Logo'}
                  className="w-20 h-20 rounded-xl object-cover"
                />
              ) : (
                <div className="w-20 h-20 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                  <Calendar size={40} className="text-white" />
                </div>
              ))}
            {homePageSettings?.website_title && (
              <span className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                {homePageSettings.website_title}
              </span>
            )}
          </div>

          {/* Nav Links */}
          <div className="hidden md:flex items-center gap-8">
            <button
              onClick={() => navigate('/')}
              className="text-gray-600 hover:text-emerald-600 font-medium transition-colors flex items-center gap-2"
            >
              <Home size={16} />
              Home
            </button>
            <button
              onClick={() => navigate('/about-me')}
              className="text-gray-600 hover:text-emerald-600 font-medium transition-colors"
            >
              About Me
            </button>
            <button
              onClick={() => navigate('/disclaimer')}
              className="text-gray-600 hover:text-emerald-600 font-medium transition-colors"
            >
              Disclaimer
            </button>
            <button
              onClick={() => navigate('/posts')}
              className="text-gray-600 hover:text-emerald-600 font-medium transition-colors"
            >
              Posts
            </button>
            <button
              onClick={() => navigate('/calendar')}
              className="text-gray-600 hover:text-emerald-600 font-medium transition-colors"
            >
              Schedule
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-gray-600 bg-white/90 border border-gray-200 hover:text-emerald-600 hover:shadow-md transition-all"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-4 relative">
            {isLoggedIn ? (
              <div className="flex items-center gap-3">
                {/* User Name - Clickable for logout */}
                <div className="relative">
                  <button
                    onClick={() => setShowLogout(!showLogout)}
                    className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg font-medium hover:shadow-md transition-all"
                  >
                    <User size={18} />
                    <span className="hidden sm:inline">
                      {user?.fullname || user?.mu_fullname || user?.email || 'User'}
                    </span>
                    <ChevronDown
                      size={16}
                      className={`transition-transform ${showLogout ? 'rotate-180' : ''}`}
                    />
                  </button>

                  {/* Logout Dropdown */}
                  {showLogout && (
                    <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {user?.fullname ||
                            user?.mu_fullname ||
                            user?.email ||
                            'User'}
                        </p>
                        <p className="text-xs text-gray-500 truncate mt-0.5">
                          {user?.email || ''}
                        </p>
                      </div>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors mt-1"
                      >
                        <LogOut size={16} />
                        <span className="font-medium">Logout</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <>
                <button
                  onClick={() => {
                    navigate('/login')
                    setMobileMenuOpen(false)
                  }}
                  className="text-gray-600 hover:text-emerald-600 font-medium transition-colors"
                >
                  Sign In
                </button>
                <button
                  onClick={() => {
                    navigate('/login')
                    setMobileMenuOpen(false)
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg font-medium hover:shadow-lg transition-all"
                >
                  Get Started
                </button>
              </>
            )}
            <div className="flex items-center gap-3 ml-3">
              {socialMediaLinks.map((item) => {
                const Icon =
                  socialIconComponents[item.platform?.toLowerCase()?.trim()] || Globe
                if (!item.url) return null
                return (
                  <a
                    key={`${item.platform}-${item.url}`}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 hover:text-emerald-600 transition-colors"
                  >
                    <Icon size={18} />
                  </a>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden absolute inset-x-0 top-full bg-white border-b border-gray-100 shadow-lg z-40">
          <div className="px-4 py-5 space-y-4">
            <button
              onClick={() => {
                navigate('/')
                setMobileMenuOpen(false)
              }}
              className="flex items-center gap-2 w-full text-left text-gray-700 hover:text-emerald-600 font-medium"
            >
              <Home size={16} />
              Home
            </button>
            <button
              onClick={() => {
                navigate('/about-me')
                setMobileMenuOpen(false)
              }}
              className="w-full text-left text-gray-700 hover:text-emerald-600 font-medium"
            >
              About Me
            </button>
            <button
              onClick={() => {
                navigate('/disclaimer')
                setMobileMenuOpen(false)
              }}
              className="w-full text-left text-gray-700 hover:text-emerald-600 font-medium"
            >
              Disclaimer
            </button>
            <button
              onClick={() => {
                navigate('/posts')
                setMobileMenuOpen(false)
              }}
              className="w-full text-left text-gray-700 hover:text-emerald-600 font-medium"
            >
              Posts
            </button>
            <button
              onClick={() => {
                navigate('/calendar')
                setMobileMenuOpen(false)
              }}
              className="w-full text-left text-gray-700 hover:text-emerald-600 font-medium"
            >
              Schedule
            </button>
            <div className="flex flex-wrap gap-3 pt-4">
              {socialMediaLinks.map((item) => {
                const Icon =
                  socialIconComponents[item.platform?.toLowerCase()?.trim()] || Globe
                if (!item.url) return null
                return (
                  <a
                    key={`${item.platform}-${item.url}`}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-700 hover:text-emerald-600 transition-colors"
                  >
                    <Icon size={20} />
                  </a>
                )
              })}
            </div>
            <div className="border-t border-gray-200 pt-4">
              {isLoggedIn ? (
                <>
                  <button
                    onClick={() => setShowLogout(!showLogout)}
                    className="w-full text-left text-gray-700 hover:text-emerald-600 font-medium flex items-center justify-between"
                  >
                    <span>
                      {user?.fullname || user?.mu_fullname || user?.email || 'User'}
                    </span>
                    <ChevronDown
                      size={16}
                      className={`transition-transform ${showLogout ? 'rotate-180' : ''}`}
                    />
                  </button>
                  {showLogout && (
                    <button
                      onClick={() => {
                        handleLogout()
                        setMobileMenuOpen(false)
                      }}
                      className="mt-3 w-full text-left text-red-600 hover:bg-red-50 px-3 py-2 rounded-lg"
                    >
                      Logout
                    </button>
                  )}
                </>
              ) : (
                <>
                  <button
                    onClick={() => {
                      navigate('/login')
                      setMobileMenuOpen(false)
                    }}
                    className="w-full text-left text-gray-700 hover:text-emerald-600 font-medium"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => {
                      navigate('/login')
                      setMobileMenuOpen(false)
                    }}
                    className="mt-3 w-full px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg font-medium"
                  >
                    Get Started
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
