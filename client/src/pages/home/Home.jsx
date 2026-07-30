import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import PublicHeader from '../../components/layout/PublicHeader'
import Footer from '../../components/layout/Footer'
import LoadingOverlay from '../../components/LoadingOverlay'
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
  const [homePageContent, setHomePageContent] = useState(null)
  const [homepageImage, setHomepageImage] = useState(null)
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

  // Fetch home page content and settings from API
  useEffect(() => {
    const fetchHomePageData = async () => {
      try {
        const timestamp = new Date().getTime()
        
        // Fetch home page sections (now includes homepage_image)
        const sectionsResponse = await fetch(
          `${import.meta.env.VITE_SERVER_LINK}/api/home-page-sections?t=${timestamp}`,
          {
            cache: 'no-cache',
          },
        )

        let content = ''
        let homepageImage = null

        if (sectionsResponse.ok) {
          const result = await sectionsResponse.json()
          console.log('Sections result:', result)
          if (result.success && result.data) {
            content = result.data.content
            homepageImage = result.data.homepage_image
            console.log('Content length:', content?.length)
            console.log('Homepage image:', homepageImage ? `Found, length: ${homepageImage.length}` : 'UNDEFINED')
          }
        }

        // Inject homepage image into hero section background if available
        if (homepageImage && content) {
          console.log('Injecting image into content...')
          const originalContent = content
          content = content.replace(/url\(\s*["']?\s*["']?\s*\)/g, `url("${homepageImage}")`)
          console.log('Content changed:', originalContent !== content)
          console.log('Content after injection sample:', content.substring(0, 300))
        } else {
          console.log('Skipping injection - homepageImage:', !!homepageImage, 'content:', !!content)
        }

        setHomePageContent(content)
        setHomepageImage(homepageImage)
      } catch (error) {
        console.error('Error fetching home page data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchHomePageData()
  }, [])

  return (
    <div className="min-h-screen">
      <PublicHeader />
      {loading && <LoadingOverlay message="Loading home content…" />}

      {/* Dynamic Home Page Content */}
      <div
        className="w-full"
        dangerouslySetInnerHTML={{
          __html: homePageContent || '<div className="p-8 text-center text-gray-500">No content available</div>'
        }}
      />

      <Footer />
    </div>
  )
}
