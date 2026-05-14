import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useEffect } from 'react'
import AdminLogin from './pages/login/admin/AdminLogin'
import UserLogin from './pages/login/user/UserLogin'
import Home from './pages/home/Home'
import PostsFeed from './pages/postsFeed/PostsFeed'
import Calendar from './pages/calendar/Calendar'
import AboutMe from './pages/aboutMe/AboutMe'
import Disclaimer from './pages/disclaimer/Disclaimer'
import Layout from './components/layout/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import StrictRouteGuard from './components/StrictRouteGuard'
import Dashboard from './pages/dashboard/Dashboard'
import Users from './pages/users/Users'
import Appointments from './pages/admin/appointments/Appointments'
import UserManagement from './pages/admin/users/UserManagement'
import Posts from './pages/admin/posts/Posts'
import Category from './pages/admin/category/Category'
import WebsiteSettings from './pages/admin/websiteSettings/WebsiteSettings'
import SocialMedia from './pages/admin/settings/SocialMedia'
import { preventCaching, forceReloadOnBack } from './utils/cacheControl'
import { ModalProvider } from './contexts/ModalContext'

function App() {
  useEffect(() => {
    preventCaching()
    forceReloadOnBack()

    // Prevent browser caching
    const metaTags = [
      { httpEquiv: 'Cache-Control', content: 'no-cache, no-store, must-revalidate' },
      { httpEquiv: 'Pragma', content: 'no-cache' },
      { httpEquiv: 'Expires', content: '0' },
    ]

    metaTags.forEach((tag) => {
      let meta = document.querySelector(`meta[http-equiv="${tag.httpEquiv}"]`)
      if (!meta) {
        meta = document.createElement('meta')
        meta.httpEquiv = tag.httpEquiv
        document.head.appendChild(meta)
      }
      meta.content = tag.content
    })

    // Prevent back button caching
    const handleUnload = () => {
      window.scrollTo(0, 0)
    }

    window.addEventListener('unload', handleUnload)

    return () => {
      window.removeEventListener('unload', handleUnload)
    }
  }, [])

  return (
    <BrowserRouter>
      <ModalProvider>
        <StrictRouteGuard>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<UserLogin />} />
            <Route path="/posts" element={<PostsFeed />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/about-me" element={<AboutMe />} />
            <Route path="/disclaimer" element={<Disclaimer />} />
            <Route path="/admin" element={<AdminLogin />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route element={<Layout />}>
              <Route
                path="dashboard"
                element={
                  <ProtectedRoute routeName="dashboard">
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="admin/dashboard"
                element={
                  <ProtectedRoute routeName="admin-dashboard">
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="users"
                element={
                  <ProtectedRoute routeName="users">
                    <Users />
                  </ProtectedRoute>
                }
              />
              <Route
                path="admin/users"
                element={
                  <ProtectedRoute routeName="admin-dashboard">
                    <UserManagement />
                  </ProtectedRoute>
                }
              />
              <Route
                path="admin/appointments"
                element={
                  <ProtectedRoute routeName="admin-dashboard">
                    <Appointments />
                  </ProtectedRoute>
                }
              />
              <Route
                path="admin/posts"
                element={
                  <ProtectedRoute routeName="admin-dashboard">
                    <Posts />
                  </ProtectedRoute>
                }
              />
              <Route
                path="admin/categories"
                element={
                  <ProtectedRoute routeName="admin-dashboard">
                    <Category />
                  </ProtectedRoute>
                }
              />
              <Route
                path="admin/website-settings"
                element={
                  <ProtectedRoute routeName="admin-dashboard">
                    <WebsiteSettings />
                  </ProtectedRoute>
                }
              />
              <Route
                path="admin/social-media"
                element={
                  <ProtectedRoute routeName="admin-dashboard">
                    <SocialMedia />
                  </ProtectedRoute>
                }
              />
            </Route>
          </Routes>
        </StrictRouteGuard>
      </ModalProvider>
    </BrowserRouter>
  )
}

export default App
