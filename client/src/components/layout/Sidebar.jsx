import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Calendar,
  Users,
  Settings,
  Activity,
  ChevronRight,
  MessageSquare,
  Tag,
  Globe,
} from 'lucide-react'

export default function Sidebar({ isCollapsed }) {
  const [isDashboardOpen, setIsDashboardOpen] = useState(false)
  const [isUsersOpen, setIsUsersOpen] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const location = useLocation()
  const [user, setUser] = useState(null)
  const [homePageSettings, setHomePageSettings] = useState(null)

  useEffect(() => {
    try {
      const userData = JSON.parse(localStorage.getItem('user'))
      const adminData = JSON.parse(localStorage.getItem('admin'))

      if (userData) {
        setUser(userData)
      } else if (adminData) {
        setUser(adminData)
      }
    } catch (error) {
      console.error('Error loading user data:', error)
    }
  }, [])

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

  useEffect(() => {
    const currentPath = location.pathname

    // More comprehensive path checking for better navigation state management
    const isDashboardPath = currentPath.includes('/dashboard')
    const isUsersPath =
      currentPath.includes('/users') ||
      currentPath.includes('/admin/users') ||
      currentPath.includes('/admin/appointments') ||
      currentPath.includes('/admin/posts') ||
      currentPath.includes('/admin/categories')
    const isSettingsPath =
      currentPath.includes('/settings') ||
      currentPath.includes('/admin/website-settings') ||
      currentPath.includes('/settings/general') ||
      currentPath.includes('/settings/system') ||
      currentPath.includes('/settings/notifications') ||
      currentPath.includes('/admin/social-media')

    if (isDashboardPath) {
      setIsDashboardOpen(true)
      setIsUsersOpen(false)
      setIsSettingsOpen(false)
    } else if (isUsersPath) {
      setIsDashboardOpen(false)
      setIsUsersOpen(true)
      setIsSettingsOpen(false)
    } else if (isSettingsPath) {
      setIsDashboardOpen(false)
      setIsUsersOpen(false)
      setIsSettingsOpen(true)
    } else {
      setIsDashboardOpen(true)
      setIsUsersOpen(false)
      setIsSettingsOpen(false)
    }
  }, [location.pathname])

  function NavLink({ to, icon: Icon, children }) {
    const isActive = location.pathname === to || location.pathname.startsWith(to)
    return (
      <Link
        to={to}
        className={`flex items-center gap-3 px-3 py-3 rounded-xl font-semibold transition-all duration-200 group ${
          isActive
            ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/20'
            : 'text-emerald-300 hover:bg-emerald-50 hover:text-emerald-700'
        }`}
      >
        <Icon
          size={20}
          className={isActive ? 'text-white' : 'group-hover:text-emerald-700'}
        />
        {!isCollapsed && <span className="text-sm">{children}</span>}
      </Link>
    )
  }

  return (
    <aside
      className={`${isCollapsed ? 'w-20' : 'w-72'} bg-gradient-to-b from-emerald-900 to-emerald-800 text-white flex flex-col shrink-0 transition-all duration-300 ease-in-out`}
    >
      <style
        dangerouslySetInnerHTML={{
          __html: `
                .custom-sidebar-scrollbar::-webkit-scrollbar {
                    width: 5px;
                }
                .custom-sidebar-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-sidebar-scrollbar::-webkit-scrollbar-thumb {
                    background: #10b981; /* emerald-500 */
                    border-radius: 10px;
                }
                .custom-sidebar-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #059669; /* emerald-600 */
                }
            `,
        }}
      />

      <div className="flex items-center h-16 px-6 border-b border-emerald-700">
        <div className="flex items-center gap-3">
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
                className="w-15 h-15 rounded-full"
              />
            ) : (
              <div className="w-15 h-15 bg-emerald-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-emerald-500/20">
                <Calendar size={16} />
              </div>
            )
          ) : (
            <div className="w-15 h-15 bg-emerald-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-emerald-500/20">
              <Calendar size={16} />
            </div>
          )}
          {!isCollapsed && (
            <div className="overflow-hidden whitespace-nowrap">
              <span className="font-bold tracking-tight text-white block">
                {homePageSettings?.website_title || 'Schedule'}
              </span>
            </div>
          )}
        </div>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto custom-sidebar-scrollbar">
        <NavLink to="/dashboard" icon={LayoutDashboard}>
          Dashboard
        </NavLink>

        <div className="space-y-2">
          {!isCollapsed && (
            <p className="text-[10px] font-bold text-emerald-300 uppercase tracking-widest px-3 mb-2">
              Scheduling
            </p>
          )}
          <button
            onClick={() => setIsUsersOpen(!isUsersOpen)}
            className={`w-full flex items-center justify-between px-3 py-3 rounded-xl font-semibold transition-all ${
              isUsersOpen
                ? 'text-white'
                : 'text-emerald-300 hover:text-white hover:bg-emerald-700'
            }`}
          >
            <div className="flex items-center gap-3">
              <Users size={20} className={isUsersOpen ? 'text-white' : ''} />
              {!isCollapsed && <span className="text-sm">User Management</span>}
            </div>
            <ChevronRight
              size={14}
              className={`transition-transform ${isUsersOpen ? 'rotate-90' : ''}`}
            />
          </button>

          {isUsersOpen && !isCollapsed && (
            <div className="mt-2 ml-4 space-y-1 border-l border-emerald-700 pl-4">
              <NavLink to="/admin/users" icon={Users}>
                User Management
              </NavLink>
              <NavLink to="/admin/appointments" icon={Calendar}>
                Appointments
              </NavLink>
              <NavLink to="/admin/posts" icon={MessageSquare}>
                Post Management
              </NavLink>
              <NavLink to="/admin/categories" icon={Tag}>
                Category Management
              </NavLink>
            </div>
          )}
        </div>

        <div className="space-y-2">
          {!isCollapsed && (
            <p className="text-[10px] font-bold text-emerald-300 uppercase tracking-widest px-3 mb-2">
              System
            </p>
          )}
          <button
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
            className={`w-full flex items-center justify-between px-3 py-3 rounded-xl font-semibold transition-all ${
              isSettingsOpen
                ? 'text-white'
                : 'text-emerald-300 hover:text-white hover:bg-emerald-700'
            }`}
          >
            <div className="flex items-center gap-3">
              <Settings size={20} className={isSettingsOpen ? 'text-white' : ''} />
              {!isCollapsed && <span className="text-sm">Settings</span>}
            </div>
            <ChevronRight
              size={14}
              className={`transition-transform ${isSettingsOpen ? 'rotate-90' : ''}`}
            />
          </button>

          {isSettingsOpen && !isCollapsed && (
            <div className="mt-2 ml-4 space-y-1 border-l border-emerald-700 pl-4">
              <NavLink to="/admin/website-settings" icon={Globe}>
                Website Settings
              </NavLink>
              <NavLink to="/admin/social-media" icon={Globe}>
                Social Media
              </NavLink>
            </div>
          )}
        </div>
      </nav>
    </aside>
  )
}
