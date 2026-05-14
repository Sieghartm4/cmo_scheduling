import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  Heart,
  MessageCircle,
  Share2,
  Clock,
  Calendar,
  User,
  Send,
  X,
  ChevronLeft,
  ChevronRight,
  Lock,
  Bookmark,
  MoreHorizontal,
  ThumbsUp,
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import Footer from '../../components/layout/Footer'
import PublicHeader from '../../components/layout/PublicHeader'

// Recursive Comment Item Component with Reply Support
const CommentItem = React.memo(function CommentItem({
  comment,
  postId,
  onReply,
  isLoggedIn,
  depth = 0,
}) {
  const [replyText, setReplyText] = useState('')
  const [showReplyInput, setShowReplyInput] = useState(false)
  const [showReplies, setShowReplies] = useState(true)
  const maxDepth = 10

  console.log(
    `CommentItem - depth:${depth}, id:${comment?.id}, text:"${comment?.text}", replies:`,
    comment?.replies,
  )

  const handleReplySubmit = (e) => {
    e.preventDefault()
    if (!replyText.trim()) return

    onReply(postId, replyText, comment.id)
    setReplyText('')
    setShowReplyInput(false)
  }

  const formatTime = (dateString) => {
    if (!dateString) return 'Just now'
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now - date) / 1000)

    if (diffInSeconds < 60) return 'Just now'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`

    return date.toLocaleDateString()
  }

  const hasReplies = comment.replies && comment.replies.length > 0
  const replyCount = comment.replies?.length || 0

  return (
    <div className={`${depth > 0 ? 'ml-8 border-l-2 border-emerald-100 pl-3' : ''}`}>
      <div className="flex gap-3">
        <div className="w-8 h-8 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full flex items-center justify-center flex-shrink-0">
          <span className="text-white text-xs font-bold">
            {comment.author?.charAt(0) || 'U'}
          </span>
        </div>
        <div className="flex-1">
          <div className="bg-white rounded-2xl px-4 py-2 shadow-sm">
            <div className="flex items-center gap-2">
              <p className="text-xs font-semibold text-gray-900">
                {comment.author || 'User'}
              </p>
              <span className="text-xs text-gray-400">
                · {formatTime(comment.created_at)}
              </span>
            </div>
            <p className="text-sm text-gray-700 mt-0.5">
              {comment.text || comment.comment}
            </p>
          </div>

          <div className="flex items-center gap-4 mt-1 ml-2">
            <button
              onClick={() => setShowReplyInput(!showReplyInput)}
              className="text-xs text-gray-500 hover:text-emerald-600 font-medium transition-colors"
            >
              Reply
            </button>
            {hasReplies && (
              <button
                onClick={() => setShowReplies(!showReplies)}
                className="text-xs text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
              >
                {showReplies ? 'Hide' : 'Show'} {replyCount}{' '}
                {replyCount === 1 ? 'reply' : 'replies'}
              </button>
            )}
          </div>

          {showReplyInput && isLoggedIn && (
            <form onSubmit={handleReplySubmit} className="flex gap-2 mt-2">
              <input
                type="text"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Write a reply..."
                autoFocus
                className="flex-1 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-full text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
              />
              <button
                type="submit"
                disabled={!replyText.trim()}
                className="p-1.5 bg-emerald-500 text-white rounded-full disabled:opacity-50 text-xs hover:bg-emerald-600 transition-colors"
              >
                <Send size={12} />
              </button>
              <button
                type="button"
                onClick={() => setShowReplyInput(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={12} />
              </button>
            </form>
          )}
        </div>
      </div>

      {hasReplies && showReplies && (
        <div className="mt-2 space-y-3">
          {comment.replies.map((reply, idx) => (
            <CommentItem
              key={reply.id || idx}
              comment={reply}
              postId={postId}
              onReply={onReply}
              isLoggedIn={isLoggedIn}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  )
})

// Main PostDetail Component
export default function PostDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)
  const [showLoginPrompt, setShowLoginPrompt] = useState(false)
  const [commentText, setCommentText] = useState('')
  const [isLiked, setIsLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [fullscreenMediaIndex, setFullscreenMediaIndex] = useState(null)
  const [saved, setSaved] = useState(false)

  const currentFullscreenMedia =
    fullscreenMediaIndex !== null ? post?.media?.[fullscreenMediaIndex] : null
  const totalMedia = post?.media?.length || 0

  // Check authentication
  const checkAuth = () => {
    const token = localStorage.getItem('token')
    const user = localStorage.getItem('user')

    if (token && user) {
      try {
        const parsedUser = JSON.parse(user)
        setIsLoggedIn(true)
        setCurrentUser(parsedUser)
        return parsedUser
      } catch (e) {
        console.error('Error parsing user data:', e)
        setIsLoggedIn(false)
        setCurrentUser(null)
      }
    } else {
      setIsLoggedIn(false)
      setCurrentUser(null)
    }
    return null
  }

  const apiBase =
    import.meta.env.VITE_SERVER_LINK || import.meta.env.VITE_API_URL || ''

  // Fetch post data
  const fetchPost = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${apiBase}/posts/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch post')
      }

      const result = await response.json()
      if (result.success) {
        const postData = result.data
        setPost(postData)
        setIsLiked(postData.userLiked || false)
        setLikeCount(postData.likes || 0)
      } else {
        toast.error('Post not found')
        navigate('/posts')
      }
    } catch (error) {
      console.error('Error fetching post:', error)
      toast.error('Failed to load post')
      navigate('/posts')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkAuth()
    fetchPost()
  }, [id])

  const goToPrevMedia = () => {
    setFullscreenMediaIndex((prev) => (prev > 0 ? prev - 1 : totalMedia - 1))
  }

  const goToNextMedia = () => {
    setFullscreenMediaIndex((prev) => (prev < totalMedia - 1 ? prev + 1 : 0))
  }

  const handleMediaClick = (index) => {
    setFullscreenMediaIndex(index)
  }

  const closeFullscreen = () => {
    setFullscreenMediaIndex(null)
  }

  const handleLike = async () => {
    if (!isLoggedIn) {
      setShowLoginPrompt(true)
      return
    }

    try {
      const response = await fetch(`${apiBase}/api/likes/post/${id}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      })

      const result = await response.json()
      if (result.success) {
        setIsLiked(result.data.liked)
        setLikeCount(result.data.likeCount)
      } else {
        toast.error('Failed to like post')
      }
    } catch (error) {
      console.error('Error liking post:', error)
      toast.error('Failed to like post')
    }
  }

  const handleComment = async (postId, text, parentId = null) => {
    if (!isLoggedIn) {
      setShowLoginPrompt(true)
      return
    }

    try {
      const response = await fetch(`${apiBase}/api/comments/post/${postId}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ comment: text, parent_id: parentId }),
      })

      const result = await response.json()
      if (result.success) {
        // Refresh post data to get updated comments
        fetchPost()
        toast.success('Comment added!')
      } else {
        toast.error('Failed to add comment')
      }
    } catch (error) {
      console.error('Error adding comment:', error)
      toast.error('Failed to add comment')
    }
  }

  const copyTextToClipboard = async (text) => {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text)
    }

    const textarea = document.createElement('textarea')
    textarea.value = text
    textarea.style.position = 'fixed'
    textarea.style.opacity = '0'
    document.body.appendChild(textarea)
    textarea.focus()
    textarea.select()

    try {
      const successful = document.execCommand('copy')
      if (!successful) {
        throw new Error('Copy command failed')
      }
    } finally {
      document.body.removeChild(textarea)
    }
  }

  const handleShare = async () => {
    const url = window.location.href
    const shareData = {
      title: post?.title || 'Post',
      text: post?.content
        ? `${post.title}

${post.content.slice(0, 120)}...`
        : 'Check out this post',
      url,
    }

    try {
      if (navigator.share) {
        await navigator.share(shareData)
        toast.success('Post shared successfully!')
        return
      }

      await copyTextToClipboard(url)
      toast.success('Post link copied to clipboard!')
    } catch (error) {
      console.error('Failed to share or copy link:', error)
      toast.error('Unable to share link. Please copy it manually.')
    }
  }

  const handleLogin = () => {
    navigate('/login')
  }

  const handleBack = () => {
    navigate(-1)
  }

  const formatDate = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const isDataUri = (value) => {
    return (
      typeof value === 'string' &&
      /^data:[a-zA-Z0-9+/.-]+\/[a-zA-Z0-9+/.-]+;base64,/.test(value)
    )
  }

  const isBase64String = (value) => {
    return typeof value === 'string' && /^[A-Za-z0-9+/]+={0,2}$/.test(value)
  }

  const isVideo = (url) => {
    if (!url) return false
    if (isDataUri(url)) {
      return url.startsWith('data:video/')
    }
    return (
      /\.(mp4|webm|ogg|mov|avi|m4v)$/i.test(url) ||
      url.includes('youtube.com') ||
      url.includes('youtu.be') ||
      url.includes('vimeo.com')
    )
  }

  const getVideoRenderData = (url) => {
    if (!url) return null

    if (isDataUri(url)) {
      return {
        type: 'direct',
        url,
      }
    }

    // YouTube
    const youtubeMatch = url.match(
      /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/,
    )
    if (youtubeMatch) {
      return {
        type: 'youtube',
        videoId: youtubeMatch[1],
        embedUrl: `https://www.youtube.com/embed/${youtubeMatch[1]}`,
      }
    }

    // Vimeo
    const vimeoMatch = url.match(/vimeo\.com\/(\d+)/)
    if (vimeoMatch) {
      return {
        type: 'vimeo',
        videoId: vimeoMatch[1],
        embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}`,
      }
    }

    // Facebook
    if (url.includes('facebook.com') || url.includes('fb.watch')) {
      return {
        type: 'facebook',
        url,
        embedUrl: `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(
          url,
        )}&show_text=0&width=560`,
      }
    }

    // Direct video file
    return {
      type: 'direct',
      url: url,
    }
  }

  const isImage = (url) => {
    if (!url) return false
    if (isDataUri(url)) {
      return url.startsWith('data:image/')
    }
    return /\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i.test(url)
  }

  const isHtmlEmbed = (url) => {
    if (!url || typeof url !== 'string') return false
    if (isDataUri(url)) return false
    return /<(iframe|video|embed|object|blockquote|script)/i.test(url)
  }

  const isEmbed = (url) => {
    if (!url || typeof url !== 'string') return false
    if (isDataUri(url)) return false
    return (
      url.includes('youtube.com') ||
      url.includes('youtu.be') ||
      url.includes('vimeo.com') ||
      url.includes('facebook.com') ||
      url.includes('fb.watch')
    )
  }

  const normalizeMediaUrl = (item) => {
    if (!item) return item
    if (isBase64String(item)) {
      return `data:image/jpeg;base64,${item}`
    }
    return item
  }

  // Media Item Component
  const MediaItem = React.memo(({ item, onClick, className = '' }) => {
    const normalizedItem = normalizeMediaUrl(item)

    if (isImage(normalizedItem)) {
      return (
        <img
          src={normalizedItem}
          alt="Post media"
          className={`w-full h-full object-cover cursor-pointer ${className}`}
          onClick={onClick}
          loading="lazy"
        />
      )
    } else if (isVideo(normalizedItem)) {
      const videoData = getVideoRenderData(normalizedItem)
      if (
        videoData?.type === 'youtube' ||
        videoData?.type === 'vimeo' ||
        videoData?.type === 'facebook'
      ) {
        return (
          <iframe
            src={videoData.embedUrl}
            className={`w-full h-full ${className}`}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title="Embedded video"
          />
        )
      }

      return (
        <video
          src={videoData?.url || normalizedItem}
          className={`w-full h-full object-cover cursor-pointer ${className}`}
          controls
          onClick={onClick}
        />
      )
    } else if (isHtmlEmbed(normalizedItem)) {
      return (
        <div
          className={`w-full h-full ${className}`}
          dangerouslySetInnerHTML={{ __html: normalizedItem }}
        />
      )
    } else {
      return (
        <div
          className={`w-full h-full bg-gray-100 flex items-center justify-center cursor-pointer ${className}`}
          onClick={onClick}
        >
          <div className="text-center p-4">
            <p className="text-gray-600 break-all">{normalizedItem}</p>
            <a
              href={normalizedItem}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-block px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors text-sm"
            >
              Open Link
            </a>
          </div>
        </div>
      )
    }
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading post...</p>
        </div>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Post not found</h2>
          <p className="text-gray-600 mb-4">
            The post you're looking for doesn't exist.
          </p>
          <button
            onClick={() => navigate('/posts')}
            className="px-6 py-3 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
          >
            Back to Posts
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PublicHeader />

      <div className="w-full max-w-[80vw] mx-auto p-4">
        <div className="mb-4">
          <button
            onClick={handleBack}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold text-gray-700 bg-white border border-gray-200 shadow-sm hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Posts
          </button>
        </div>

        {/* Post Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
        >
          {/* Post Header */}
          <div className="p-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-lg sm:text-xl">
                <span className="text-white font-bold text-xl">
                  {post.title?.charAt(0) || 'C'}
                </span>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 text-2xl md:text-3xl">
                  {post.title || 'CMO Scheduling Team'}
                </h4>
                <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
                  <Clock size={14} />
                  <span>{formatDate(post.created_at)}</span>
                  {post.category_name && (
                    <>
                      <span className="text-gray-300">·</span>
                      <span className="text-emerald-600 font-medium">
                        {post.category_name}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <MoreHorizontal size={20} className="text-gray-500" />
            </button>
          </div>

          {/* Post Content */}
          <div className="px-6 pb-5">
            {post.category_name && (
              <div className="mb-3">
                <span className="inline-block px-3 py-1.5 bg-emerald-100 text-emerald-700 text-sm rounded-full font-medium">
                  {post.category_name}
                </span>
              </div>
            )}
            <p className="text-gray-700 text-base md:text-lg leading-8">
              {post.content}
            </p>
          </div>

          {/* Media */}
          {post.media && post.media.length > 0 && (
            <div className="mt-3 mx-4 rounded-xl overflow-hidden border border-gray-100">
              {post.media.length === 1 && (
                <div className="relative aspect-video overflow-hidden">
                  <MediaItem
                    item={post.media[0]}
                    onClick={() => handleMediaClick(0)}
                  />
                </div>
              )}

              {post.media.length === 2 && (
                <div className="grid grid-cols-2 gap-1">
                  {post.media.map((item, idx) => (
                    <div key={idx} className="relative aspect-video overflow-hidden">
                      <MediaItem item={item} onClick={() => handleMediaClick(idx)} />
                    </div>
                  ))}
                </div>
              )}

              {post.media.length === 3 && (
                <div className="grid grid-cols-2 gap-1">
                  <div className="relative aspect-[4/3] overflow-hidden row-span-2">
                    <MediaItem
                      item={post.media[0]}
                      onClick={() => handleMediaClick(0)}
                    />
                  </div>
                  <div className="relative aspect-video overflow-hidden">
                    <MediaItem
                      item={post.media[1]}
                      onClick={() => handleMediaClick(1)}
                    />
                  </div>
                  <div className="relative aspect-video overflow-hidden">
                    <MediaItem
                      item={post.media[2]}
                      onClick={() => handleMediaClick(2)}
                    />
                  </div>
                </div>
              )}

              {post.media.length >= 4 && (
                <div className="grid grid-cols-2 gap-1">
                  {post.media.slice(0, 4).map((item, idx) => (
                    <div key={idx} className="relative aspect-video overflow-hidden">
                      <MediaItem item={item} onClick={() => handleMediaClick(idx)} />
                      {idx === 3 && post.media.length > 4 && (
                        <div
                          onClick={() => handleMediaClick(idx)}
                          className="absolute inset-0 bg-black/60 flex items-center justify-center cursor-pointer"
                        >
                          <span className="text-white text-2xl font-bold">
                            +{post.media.length - 4}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Engagement Stats */}
          <div className="px-6 py-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-gray-100 mt-3">
            <div className="flex flex-wrap items-center gap-3 text-sm md:text-base text-gray-500">
              <div className="flex items-center -space-x-1">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                  <ThumbsUp size={12} className="text-white" />
                </div>
              </div>
              <span className="ml-1">{likeCount} likes</span>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span>{post.commentCount || 0} comments</span>
              <span>{post.shares || 0} shares</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="px-4 py-3 grid gap-3 sm:grid-cols-4">
            <button
              onClick={handleLike}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all text-base font-medium ${
                isLiked
                  ? 'text-red-500 bg-red-50'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Heart size={20} className={isLiked ? 'fill-current' : ''} />
              <span className="text-base font-semibold">Like</span>
            </button>
            <button
              onClick={() => document.getElementById('comment-input')?.focus()}
              className="flex-1 flex items-center justify-center gap-2 py-3 text-gray-700 hover:bg-gray-100 rounded-xl transition-all"
            >
              <MessageCircle size={20} />
              <span className="text-base font-semibold">Comment</span>
            </button>
            <button
              onClick={handleShare}
              className="flex-1 flex items-center justify-center gap-2 py-3 text-gray-700 hover:bg-gray-100 rounded-xl transition-all"
            >
              <Share2 size={20} />
              <span className="text-base font-semibold">Share</span>
            </button>
            <button
              onClick={() => setSaved(!saved)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all ${
                saved
                  ? 'text-emerald-600 bg-emerald-50'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Bookmark size={20} className={saved ? 'fill-current' : ''} />
            </button>
          </div>

          {/* Comments Section */}
          <AnimatePresence>
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              className="border-t border-gray-100 bg-gray-50"
            >
              <style
                dangerouslySetInnerHTML={{
                  __html: `
                  .custom-scrollbar::-webkit-scrollbar { width: 5px; }
                  .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                  .custom-scrollbar::-webkit-scrollbar-thumb { background: #10b981; border-radius: 10px; }
                  .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #059669; }
                `,
                }}
              />

              <div className="p-4 space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
                {post.comments?.map((comment, index) => (
                  <CommentItem
                    key={comment.id || index}
                    comment={comment}
                    postId={post.id}
                    onReply={handleComment}
                    isLoggedIn={isLoggedIn}
                    depth={0}
                  />
                ))}
                {!post.comments?.length && (
                  <p className="text-center text-gray-500 text-sm py-4">
                    No comments yet. Be the first to comment!
                  </p>
                )}
              </div>

              {/* Comment Input */}
              {isLoggedIn ? (
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    if (commentText.trim()) {
                      handleComment(post.id, commentText)
                      setCommentText('')
                    }
                  }}
                  className="p-4 border-t border-gray-200"
                >
                  <div className="flex gap-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <User size={14} className="text-white" />
                    </div>
                    <div className="flex-1 relative">
                      <input
                        id="comment-input"
                        type="text"
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder="Write a comment..."
                        className="w-full pl-4 pr-12 py-3 bg-white border border-gray-200 rounded-full text-base focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                      />
                      <button
                        type="submit"
                        disabled={!commentText.trim()}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-emerald-500 text-white rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:bg-emerald-600 transition-colors"
                      >
                        <Send size={14} />
                      </button>
                    </div>
                  </div>
                </form>
              ) : (
                <div className="p-4 border-t border-gray-200">
                  <button
                    onClick={() => setShowLoginPrompt(true)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full text-sm font-medium transition-colors"
                  >
                    <Lock size={14} />
                    <span>Sign in to comment</span>
                  </button>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Fullscreen Media Modal */}
      {currentFullscreenMedia !== null && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(6, 78, 59, .45)',
            backdropFilter: 'blur(6px)',
            zIndex: 50,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
          onClick={closeFullscreen}
        >
          <button
            onClick={(e) => {
              e.stopPropagation()
              closeFullscreen()
            }}
            className="absolute top-4 right-4 z-50 p-2 bg-black/50 text-white hover:bg-black/70 rounded-full transition-colors"
          >
            <X size={32} />
          </button>

          <div className="absolute inset-0 flex items-center justify-between px-4 pointer-events-none">
            {totalMedia > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    goToPrevMedia()
                  }}
                  className="pointer-events-auto rounded-full bg-black/30 p-4 text-white hover:bg-black/50 transition-colors shadow-lg"
                  aria-label="Previous media"
                >
                  <ChevronLeft size={32} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    goToNextMedia()
                  }}
                  className="pointer-events-auto rounded-full bg-black/30 p-4 text-white hover:bg-black/50 transition-colors shadow-lg"
                  aria-label="Next media"
                >
                  <ChevronRight size={32} />
                </button>
              </>
            )}
          </div>

          <div
            className="max-w-[90vw] max-h-[90vh] w-full h-full flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            {isImage(currentFullscreenMedia) ? (
              <img
                src={currentFullscreenMedia}
                alt="Full screen media"
                className="max-w-full max-h-full object-contain rounded-lg"
              />
            ) : isVideo(currentFullscreenMedia) ? (
              (() => {
                const videoData = getVideoRenderData(currentFullscreenMedia)
                if (
                  videoData?.type === 'youtube' ||
                  videoData?.type === 'vimeo' ||
                  videoData?.type === 'facebook'
                ) {
                  return (
                    <iframe
                      src={videoData.embedUrl}
                      className="w-full h-full max-w-4xl aspect-video rounded-lg"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      title="Embedded video"
                    />
                  )
                }

                return (
                  <video
                    src={currentFullscreenMedia}
                    className="max-w-full max-h-full rounded-lg"
                    controls
                    autoPlay
                  />
                )
              })()
            ) : isHtmlEmbed(currentFullscreenMedia) ? (
              <div
                className="w-full h-full max-w-4xl aspect-video"
                dangerouslySetInnerHTML={{
                  __html: currentFullscreenMedia
                    .replace(/width="\d+"/g, 'width="100%"')
                    .replace(/height="\d+"/g, 'height="100%"'),
                }}
              />
            ) : (
              <div className="bg-white rounded-lg p-8 max-w-2xl">
                <p className="text-gray-800 break-all">{currentFullscreenMedia}</p>
                <a
                  href={currentFullscreenMedia}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-block px-6 py-3 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
                >
                  Open Link
                </a>
              </div>
            )}
          </div>

          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white text-sm tracking-wide">
            {fullscreenMediaIndex + 1} / {totalMedia}
          </div>
        </div>
      )}
      {/* CTA Section */}
      <section className="py-20 mt-20 bg-gradient-to-r from-emerald-500 to-teal-600">
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

      {/* Login Prompt Modal */}
      <LoginPrompt
        isOpen={showLoginPrompt}
        onClose={() => setShowLoginPrompt(false)}
        onLogin={handleLogin}
      />
    </div>
  )
}

// Login Prompt Modal Component
function LoginPrompt({ isOpen, onClose, onLogin }) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl"
      >
        <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <Lock size={28} className="text-white" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Sign In Required</h3>
        <p className="text-gray-600 mb-6">
          Please sign in to like posts, leave comments, and engage with the
          community.
        </p>
        <div className="space-y-3">
          <button
            onClick={onLogin}
            className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
          >
            Sign In
          </button>
          <button
            onClick={onClose}
            className="w-full py-3 text-gray-600 font-medium hover:bg-gray-100 rounded-xl transition-colors"
          >
            Continue Browsing
          </button>
        </div>
      </motion.div>
    </div>
  )
}
