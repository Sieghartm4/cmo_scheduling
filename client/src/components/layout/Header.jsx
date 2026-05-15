import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Menu, Bell, LogOut, User, Settings, ChevronDown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { clearAuthData } from '../../utils/authProtection'
import { preventCaching, clearHistoryAndPreventBack } from '../../utils/cacheControl'
import ProfileModal from '../ProfileModal'

export default function Header({ isCollapsed, onToggleSidebar }) {
  const navigate = useNavigate()
  const [showDropdown, setShowDropdown] = useState(false)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [user, setUser] = useState(null)
  const dropdownRef = useRef(null)

  useEffect(() => {
    // Check for admin or user session
    const adminData = localStorage.getItem('admin')
    const userData = localStorage.getItem('user')

    if (adminData) {
      setUser(JSON.parse(adminData))
    } else if (userData) {
      setUser(JSON.parse(userData))
    }

    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = () => {
    // Aggressive session clearing
    localStorage.clear()
    sessionStorage.clear()

    // Force hard redirect to prevent any back navigation
    window.location.replace('/')
  }

  return (
    <>
      <header className="bg-white border-b border-emerald-200 shadow-sm">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              className="p-2 rounded-lg hover:bg-emerald-50 transition-all"
              onClick={onToggleSidebar}
            >
              <Menu size={24} className="text-emerald-600" />
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button className="p-2 rounded-full hover:bg-emerald-50 text-emerald-600 relative transition-all">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-emerald-600 rounded-full border-2 border-white"></span>
            </button>

            <div className="h-8 w-px bg-emerald-200 mx-1"></div>

            <div className="relative" ref={dropdownRef}>
              <button
                className="flex items-center gap-3 p-1 rounded-full hover:bg-emerald-50 transition-all"
                onClick={() => setShowDropdown(!showDropdown)}
              >
                <div className="w-9 h-9 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 flex items-center justify-center text-white text-xs font-bold shadow-lg shadow-emerald-500/20 border-b-2 border-emerald-600">
                  {user?.mu_first_name?.charAt(0) ||
                    user?.fullname?.charAt(0) ||
                    'A'}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-bold text-gray-900 leading-none">
                    {user?.mu_first_name || user?.fullname || 'Admin'}
                  </p>
                  <p className="text-[10px] text-emerald-600 uppercase tracking-tighter mt-1 font-semibold">
                    {localStorage.getItem('adminToken') ? 'System Admin' : 'User'}
                  </p>
                </div>
                <ChevronDown
                  size={14}
                  className={`text-emerald-600 transition-transform ${showDropdown ? 'rotate-180' : ''}`}
                />
              </button>

              <AnimatePresence>
                {showDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-3 w-56 bg-white rounded-xl shadow-2xl border border-emerald-100 py-2 z-50 overflow-hidden"
                  >
                    <button
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-emerald-50 transition-colors"
                      onClick={() => {
                        setShowProfileModal(true)
                        setShowDropdown(false)
                      }}
                    >
                      <User size={16} className="text-emerald-600" /> My Profile
                    </button>
                    <div className="h-px bg-emerald-100 my-1 mx-2"></div>
                    <button
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-emerald-600 hover:bg-emerald-50 transition-colors font-bold"
                      onClick={handleLogout}
                    >
                      <LogOut size={16} /> Log Out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </header>

      <ProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        user={user}
      />
    </>
  )
}
