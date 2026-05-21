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
  Info,
  AlertCircle,
  Newspaper,
  Clock,
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
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
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
    localStorage.removeItem('token')
    localStorage.removeItem('userToken')
    localStorage.removeItem('adminToken')
    localStorage.removeItem('user')

    setIsLoggedIn(false)
    setUser(null)
    setShowLogout(false)

    navigate('/')
  }

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
    window.addEventListener('storage', checkLoginStatus)
    const interval = setInterval(checkLoginStatus, 1000)

    return () => {
      window.removeEventListener('storage', checkLoginStatus)
      clearInterval(interval)
    }
  }, [])

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
      <div className="w-full px-2 sm:px-3 lg:px-4">
        <div className="flex justify-between items-center h-20 gap-2">
          {/* Left - Logo */}
          <div
            onClick={handleHomeClick}
            className="flex items-center gap-1 cursor-pointer hover:opacity-80 transition-opacity flex-shrink-0"
          >
            {homePageSettings?.website_logo &&
              (homePageSettings.website_logo.startsWith('data:') ||
              homePageSettings.website_logo.startsWith('http') ? (
                <img
                  src={
                    homePageSettings.website_logo.startsWith('data:')
                      ? homePageSettings.website_logo
                      : `data:image/jpeg;base64,${homePageSettings.website_logo}`
                  }
                  alt={homePageSettings.website_title || 'Logo'}
                  className="w-20 h-20 rounded-full"
                />
              ) : (
                <div className="w-20 h-20 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <Calendar size={28} className="text-white" />
                </div>
              ))}
            {homePageSettings?.website_title && (
              <span className="text-sm sm:text-lg font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent inline">
                {homePageSettings.website_title}
              </span>
            )}
          </div>

          {/* Center - Nav Links & User */}
          <div className="hidden md:flex items-center gap-6 flex-1 justify-center">
            <button
              onClick={handleHomeClick}
              className="text-gray-600 hover:text-emerald-600 font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap text-base"
            >
              <Home size={16} />
              Home
            </button>
            {/* --- HIGHLIGHTED POSTS BUTTON --- */}
            <button
              onClick={() => navigate('/posts')}
              className="relative text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border-2 border-emerald-500/30 hover:border-emerald-500 font-bold px-2 py-2 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap text-lg shadow-sm transform hover:scale-105"
            >
              <Newspaper size={20} className="text-emerald-600" />
              <span>Posts</span>
              <span className="absolute -top-1.5 -right-1.5 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
            </button>
            <button
              onClick={() => navigate('/calendar')}
              className="text-gray-600 hover:text-emerald-600 font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap text-base"
            >
              <Clock size={16} />
              Schedule
            </button>
            <button
              onClick={() => navigate('/about-me')}
              className="text-gray-600 hover:text-emerald-600 font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap text-base"
            >
              <Info size={16} />
              About Me
            </button>
            <button
              onClick={() => navigate('/disclaimer')}
              className="text-gray-600 hover:text-emerald-600 font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap text-base"
            >
              <AlertCircle size={16} />
              Disclaimer
            </button>

            {isLoggedIn ? (
              <div className="flex items-center gap-3">
                <div className="relative">
                  <button
                    onClick={() => setShowLogout(!showLogout)}
                    className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg font-medium hover:shadow-md transition-all whitespace-nowrap text-sm"
                  >
                    <User size={16} />
                    <span className="hidden sm:inline text-sm">
                      {user?.fullname || user?.mu_fullname || user?.email || 'User'}
                    </span>
                    <ChevronDown
                      size={14}
                      className={`transition-transform ${showLogout ? 'rotate-180' : ''}`}
                    />
                  </button>

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
                  className="text-gray-600 hover:text-emerald-600 font-medium transition-colors whitespace-nowrap text-base"
                >
                  Sign In
                </button>
                <button
                  onClick={() => {
                    navigate('/login')
                    setMobileMenuOpen(false)
                  }}
                  className="px-3 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg font-medium hover:shadow-lg transition-all whitespace-nowrap text-sm"
                >
                  Get Started
                </button>
              </>
            )}
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

          {/* Right - Social Media */}
          <div className="hidden md:flex items-center gap-3 flex-shrink-0">
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
                  <Icon size={20} />
                </a>
              )
            })}
          </div>
        </div>
      </div>

      {/* Mobile Sidebar/Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute inset-x-0 top-full bg-white border-b border-gray-100 shadow-lg z-40">
          <div className="px-4 py-5 space-y-4">
            <button
              onClick={() => {
                handleHomeClick()
                setMobileMenuOpen(false)
              }}
              className="flex items-center gap-2 w-full text-left text-gray-700 hover:text-emerald-600 font-medium"
            >
              <Home size={16} />
              Home
            </button>
            <button
              onClick={() => {
                navigate('/posts')
                setMobileMenuOpen(false)
              }}
              className="w-full text-left text-emerald-700 bg-emerald-50 border border-emerald-300 font-bold px-4 py-3 rounded-xl flex items-center gap-2 text-lg shadow-xs"
            >
              <Newspaper size={20} className="text-emerald-600" />
              Posts
              <span className="ml-auto h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            </button>
            <button
              onClick={() => {
                navigate('/calendar')
                setMobileMenuOpen(false)
              }}
              className="w-full text-left text-gray-700 hover:text-emerald-600 font-medium flex items-center gap-2"
            >
              <Clock size={16} />
              Schedule
            </button>
            <button
              onClick={() => {
                navigate('/about-me')
                setMobileMenuOpen(false)
              }}
              className="w-full text-left text-gray-700 hover:text-emerald-600 font-medium flex items-center gap-2"
            >
              <Info size={16} />
              About Me
            </button>
            <button
              onClick={() => {
                navigate('/disclaimer')
                setMobileMenuOpen(false)
              }}
              className="w-full text-left text-gray-700 hover:text-emerald-600 font-medium flex items-center gap-2"
            >
              <AlertCircle size={16} />
              Disclaimer
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
