import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Calendar,
  Facebook,
  Instagram,
  Twitter,
  Youtube,
  Linkedin,
  Globe,
  Github,
} from 'lucide-react'

export default function Footer() {
  const navigate = useNavigate()
  const [homePageSettings, setHomePageSettings] = useState(null)
  const [socialMediaLinks, setSocialMediaLinks] = useState([])
  const [isLoggedIn, setIsLoggedIn] = useState(false)

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

  const checkLoginStatus = () => {
    const token =
      localStorage.getItem('token') ||
      localStorage.getItem('userToken') ||
      localStorage.getItem('adminToken')
    setIsLoggedIn(!!token)
  }

  useEffect(() => {
    checkLoginStatus()
    window.addEventListener('storage', checkLoginStatus)
    const interval = setInterval(checkLoginStatus, 1000)
    return () => {
      window.removeEventListener('storage', checkLoginStatus)
      clearInterval(interval)
    }
  }, [])

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
      }
    }

    fetchHomePageSettings()
  }, [])

  useEffect(() => {
    const fetchSocialMediaLinks = async () => {
      try {
        const timestamp = new Date().getTime()
        const response = await fetch(
          `${import.meta.env.VITE_SERVER_LINK}/api/social-media?t=${timestamp}`,
          {
            cache: 'no-cache',
          },
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

  return (
    <footer className="bg-gray-900 text-gray-400 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              {homePageSettings?.website_logo ? (
                // If logo exists, display it
                homePageSettings.website_logo.startsWith('data:') ||
                homePageSettings.website_logo.startsWith('http') ? (
                  <img
                    src={
                      homePageSettings.website_logo.startsWith('data:')
                        ? homePageSettings.website_logo
                        : `data:image/jpeg;base64,${homePageSettings.website_logo}`
                    }
                    alt={homePageSettings.website_title || 'Logo'}
                    className="w-25 h-25 rounded-xl object-cover"
                  />
                ) : (
                  <div className="w-25 h-25 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                    <Calendar size={24} className="text-white" />
                  </div>
                )
              ) : (
                // Default logo if none provided
                <div className="w-25 h-25 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                  <Calendar size={24} className="text-white" />
                </div>
              )}
              <span className="text-xl font-bold text-white">
                {homePageSettings?.website_title || 'CMO Connect'}
              </span>
            </div>
            <p className="text-sm">
              Your all-in-one platform for scheduling and community engagement.
            </p>
            <div className="flex items-center gap-3 mt-4">
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
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <Icon size={20} />
                  </a>
                )
              })}
            </div>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <button
                  onClick={() => navigate('/about-me')}
                  className="hover:text-emerald-400 transition-colors"
                >
                  About Me
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/disclaimer')}
                  className="hover:text-emerald-400 transition-colors"
                >
                  Disclaimer
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/posts')}
                  className="hover:text-emerald-400 transition-colors"
                >
                  Posts
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/calendar')}
                  className="hover:text-emerald-400 transition-colors"
                >
                  Schedule
                </button>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Account</h4>
            <ul className="space-y-2 text-sm">
              {!isLoggedIn && (
                <li>
                  <button
                    onClick={() => navigate('/login')}
                    className="hover:text-emerald-400 transition-colors"
                  >
                    Sign In
                  </button>
                </li>
              )}
              <li>
                <button
                  onClick={() => navigate(isLoggedIn ? '/dashboard' : '/login')}
                  className="hover:text-emerald-400 transition-colors"
                >
                  {isLoggedIn ? 'Dashboard' : 'Get Started'}
                </button>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Contact</h4>
            <ul className="space-y-2 text-sm">
              <li>{homePageSettings?.contact_email || 'support@cmoconnect.com'}</li>
              <li>{homePageSettings?.contact_number || '+1 (555) 123-4567'}</li>
              <li>
                {homePageSettings?.location ||
                  '123 Business Ave, Suite 100, San Francisco, CA 94105'}
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 pt-8 text-center text-sm">
          <p>
            &copy; 2026 {homePageSettings?.website_title || 'CMO Connect'}. All
            rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
