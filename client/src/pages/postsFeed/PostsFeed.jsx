import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate, Link } from 'react-router-dom'
import PublicHeader from '../../components/layout/PublicHeader'
import TutorialGuide from '../../components/TutorialGuide'
import {
  Heart,
  MessageCircle,
  Share2,
  MoreHorizontal,
  Send,
  Calendar,
  User,
  Users,
  Lock,
  X,
  ChevronLeft,
  Clock,
  ThumbsUp,
  Bookmark,
  Loader2,
  Search,
  Filter,
  TrendingUp,
  Hash,
  ChevronRight,
  Flame,
  Bell,
  BarChart3,
  ArrowUp,
  BookOpen,
} from 'lucide-react'

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
  const maxDepth = 10 // Prevent excessive nesting visually

  console.log(
    `CommentItem - depth:${depth}, id:${comment?.id}, text:"${comment?.text}", replies:`,
    comment?.replies,
  )

  const handleReplySubmit = (e) => {
    e.preventDefault()
    if (!replyText.trim()) return
    onReply?.(postId, replyText, comment.id) // comment.id is parentId
    setReplyText('')
    setShowReplyInput(false)
    setShowReplies(true)
  }

  const formatTime = (dateString) => {
    if (!dateString) return 'Just now'
    const date = new Date(dateString)
    const now = new Date()
    const diff = Math.floor((now - date) / 1000)
    if (diff < 60) return 'Just now'
    if (diff < 3600) return `${Math.floor(diff / 60)}m`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`
    if (diff < 604800) return `${Math.floor(diff / 86400)}d`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
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
                · {formatTime(comment.created_at || comment.time)}
              </span>
            </div>
            <p className="text-sm text-gray-700 mt-0.5">
              {comment.text || comment.comment}
            </p>
          </div>

          {/* Comment Actions */}
          <div className="flex items-center gap-4 mt-1 ml-2">
            <button
              onClick={() => {
                if (!isLoggedIn) {
                  onReply?.(postId, '', null) // Trigger login prompt
                  return
                }
                setShowReplyInput(!showReplyInput)
              }}
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

          {/* Reply Input */}
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

      {/* Nested Replies - Recursive */}
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

// Post Card Component - memoized to prevent re-renders during auth polling
const PostCard = React.memo(function PostCard({
  post,
  onLike,
  onComment,
  onReply,
  isLoggedIn,
  currentUser,
  onShare,
}) {
  const navigate = useNavigate()
  const [showComments, setShowComments] = useState(false)
  const [commentText, setCommentText] = useState('')
  const [isLiked, setIsLiked] = useState(post.userLiked || false)
  const [likeCount, setLikeCount] = useState(post.likes || 0)
  const [isExpanded, setIsExpanded] = useState(false)
  const [saved, setSaved] = useState(false)
  const [fullscreenMediaIndex, setFullscreenMediaIndex] = useState(null)

  const currentFullscreenMedia =
    fullscreenMediaIndex !== null ? post.media?.[fullscreenMediaIndex] : null
  const totalMedia = post.media?.length || 0

  const goToPrevMedia = () => {
    if (totalMedia === 0 || fullscreenMediaIndex === null) return
    setFullscreenMediaIndex((prev) => (prev > 0 ? prev - 1 : totalMedia - 1))
  }

  const goToNextMedia = () => {
    if (totalMedia === 0 || fullscreenMediaIndex === null) return
    setFullscreenMediaIndex((prev) => (prev < totalMedia - 1 ? prev + 1 : 0))
  }

  // Sync with post data when it changes (e.g., on refresh)
  useEffect(() => {
    setIsLiked(post.userLiked || false)
    setLikeCount(post.likes || 0)
  }, [post.userLiked, post.likes])

  const handleMediaClick = (index) => {
    setFullscreenMediaIndex(index)
  }

  const closeFullscreen = () => {
    setFullscreenMediaIndex(null)
  }

  const handleLike = () => {
    if (!isLoggedIn) {
      onLike?.(post.id, false) // Trigger login prompt
      return
    }
    setIsLiked(!isLiked)
    setLikeCount(isLiked ? likeCount - 1 : likeCount + 1)
    onLike?.(post.id, !isLiked)
  }

  const handleSubmitComment = (e) => {
    e.preventDefault()
    if (!isLoggedIn) {
      onComment?.(post.id, '') // Trigger login prompt
      return
    }
    if (!commentText.trim()) return
    onComment?.(post.id, commentText, null) // null = top-level comment (no parent)
    setCommentText('')
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = Math.floor((now - date) / 1000)

    if (diff < 60) return 'Just now'
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const isVideo = (url) => {
    return (
      url &&
      (url.includes('youtube') ||
        url.includes('youtu.be') ||
        url.includes('vimeo') ||
        url.match(/\.(mp4|webm|mov|ogg)(\?|$)/i))
    )
  }

  const getVideoRenderData = (url) => {
    if (!url) return { type: 'unknown', src: url }
    if (url.includes('youtube.com/watch?v=')) {
      const videoId = url.split('v=')[1]?.split('&')[0]
      if (videoId)
        return { type: 'youtube', src: `https://www.youtube.com/embed/${videoId}` }
    }
    if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1]?.split('?')[0]
      if (videoId)
        return { type: 'youtube', src: `https://www.youtube.com/embed/${videoId}` }
    }
    if (url.includes('vimeo.com/')) {
      const videoId = url.split('vimeo.com/')[1]?.split('?')[0]
      if (videoId)
        return { type: 'vimeo', src: `https://player.vimeo.com/video/${videoId}` }
    }
    if (url.match(/\.(mp4|webm|mov|ogg)(\?|$)/i)) {
      return { type: 'file', src: url }
    }
    return { type: 'unknown', src: url }
  }

  const isImage = (url) => {
    return (
      url &&
      (url.includes('.jpg') ||
        url.includes('.jpeg') ||
        url.includes('.png') ||
        url.includes('.gif') ||
        url.includes('.webp') ||
        url.startsWith('data:image'))
    )
  }

  const isEmbed = (url) => {
    // Check if it's an iframe HTML string (Facebook embed, etc.)
    return (
      url &&
      (url.includes('<iframe') ||
        url.includes('</iframe>') ||
        url.includes('facebook.com/plugins'))
    )
  }

  // Media Item Component - memoized to prevent re-renders during auth polling
  const MediaItem = React.memo((props) => {
    const { item, onClick, clickable = true } = props
    const handleClick = (event) => {
      event?.stopPropagation()
      if (clickable && onClick) onClick(item)
    }

    if (isImage(item)) {
      return (
        <img
          src={item}
          alt="Post media"
          onClick={handleClick}
          className={`w-full h-full object-cover hover:scale-105 transition-transform duration-300 ${clickable ? 'cursor-pointer' : ''}`}
        />
      )
    }
    if (isEmbed(item)) {
      return (
        <div
          className="w-full h-full"
          onClick={handleClick}
          dangerouslySetInnerHTML={{
            __html: item
              .replace(/width="\d+"/g, 'width="100%"')
              .replace(/height="\d+"/g, 'height="100%"'),
          }}
        />
      )
    }
    if (isVideo(item)) {
      const videoData = getVideoRenderData(item)
      if (videoData.type === 'youtube' || videoData.type === 'vimeo') {
        return (
          <div
            onClick={handleClick}
            className={`w-full h-full ${clickable ? 'cursor-pointer' : ''}`}
          >
            <iframe
              src={videoData.src}
              className="w-full h-full"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title="Embedded video"
            />
          </div>
        )
      }

      if (videoData.type === 'file') {
        return (
          <video
            src={videoData.src}
            controls
            onClick={handleClick}
            className={`w-full h-full object-cover ${clickable ? 'cursor-pointer' : ''}`}
          />
        )
      }

      return (
        <div
          onClick={handleClick}
          className={`w-full h-full bg-gray-900 flex items-center justify-center ${clickable ? 'cursor-pointer' : ''}`}
        >
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
            <div className="w-0 h-0 border-t-8 border-t-transparent border-l-12 border-l-white border-b-8 border-b-transparent ml-1" />
          </div>
        </div>
      )
    }
    return (
      <div
        onClick={handleClick}
        className={`w-full h-full bg-gray-100 flex items-center justify-center p-4 ${clickable ? 'cursor-pointer' : ''}`}
      >
        <a
          href={item}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="text-emerald-600 text-sm text-center break-all hover:underline"
        >
          {item.substring(0, 50)}...
        </a>
      </div>
    )
  })

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
    >
      {/* Post Header */}
      <div className="p-4">
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => navigate(`/posts/${post.id}`)}
            className="flex-1 flex items-center gap-3 text-left rounded-2xl px-3 py-3 cursor-pointer hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-200"
          >
            <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">
                {post.title?.charAt(0) || 'C'}
              </span>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 text-lg">
                {post.title || 'CMO Scheduling Team'}
              </h4>
              <div className="flex items-center gap-1.5 text-xs text-gray-400">
                <Clock size={11} />
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
          </button>
          <button
            type="button"
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <MoreHorizontal size={20} className="text-gray-500" />
          </button>
        </div>
      </div>

      {/* Post Content */}
      <div className="px-4 pb-3">
        {/* Category Badge */}
        {post.category_name && (
          <div className="mb-2">
            <span className="inline-block px-2 py-1 bg-emerald-100 text-emerald-700 text-xs rounded-full font-medium">
              {post.category_name}
            </span>
          </div>
        )}
        <p
          className={`text-gray-700 text-sm leading-relaxed ${!isExpanded && 'line-clamp-3'}`}
        >
          {post.content}
        </p>
        {post.content?.length > 200 && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-emerald-600 text-sm font-medium mt-1 hover:underline"
          >
            {isExpanded ? 'Show less' : 'Read more'}
          </button>
        )}
      </div>

      {/* Media Gallery - Facebook Style */}
      {post.media && post.media.length > 0 && (
        <div className="mt-3 mx-4 rounded-xl overflow-hidden border border-gray-100">
          {/* Single Media - Full width video ratio */}
          {post.media.length === 1 && (
            <div
              className="relative aspect-video overflow-hidden cursor-pointer"
              onClick={() => navigate(`/posts/${post.id}`)}
            >
              <MediaItem
                item={post.media[0]}
                onClick={() => navigate(`/posts/${post.id}`)}
              />
            </div>
          )}

          {/* Two Media - Side by side, equal height */}
          {post.media.length === 2 && (
            <div className="grid grid-cols-2 gap-1">
              {post.media.map((item, idx) => (
                <div
                  key={idx}
                  className="relative aspect-video overflow-hidden cursor-pointer"
                  onClick={() => navigate(`/posts/${post.id}`)}
                >
                  <MediaItem
                    item={item}
                    onClick={() => navigate(`/posts/${post.id}`)}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Three Media - First large on left, two stacked on right */}
          {post.media.length === 3 && (
            <div className="grid grid-cols-2 gap-1">
              <div
                className="relative aspect-[4/3] overflow-hidden row-span-2 cursor-pointer"
                onClick={() => navigate(`/posts/${post.id}`)}
              >
                <MediaItem
                  item={post.media[0]}
                  onClick={() => navigate(`/posts/${post.id}`)}
                />
              </div>
              <div
                className="relative aspect-video overflow-hidden cursor-pointer"
                onClick={() => navigate(`/posts/${post.id}`)}
              >
                <MediaItem
                  item={post.media[1]}
                  onClick={() => navigate(`/posts/${post.id}`)}
                />
              </div>
              <div
                className="relative aspect-video overflow-hidden cursor-pointer"
                onClick={() => navigate(`/posts/${post.id}`)}
              >
                <MediaItem
                  item={post.media[2]}
                  onClick={() => navigate(`/posts/${post.id}`)}
                />
              </div>
            </div>
          )}

          {/* Four or More Media - 2x2 grid with overlay on last */}
          {post.media.length >= 4 && (
            <div className="grid grid-cols-2 gap-1">
              {post.media.slice(0, 4).map((item, idx) => (
                <div
                  key={idx}
                  className="relative aspect-video overflow-hidden cursor-pointer"
                  onClick={() => navigate(`/posts/${post.id}`)}
                >
                  <MediaItem
                    item={item}
                    onClick={() => navigate(`/posts/${post.id}`)}
                  />
                  {idx === 3 && post.media.length > 4 && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center pointer-events-none">
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

      {/* Post Stats */}
      <div className="px-4 py-3 flex items-center justify-between border-b border-gray-100 mt-3">
        <div className="flex items-center gap-1 text-sm text-gray-500">
          <div className="flex items-center -space-x-1">
            <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
              <ThumbsUp size={10} className="text-white" />
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
      <div className="px-2 py-1 flex items-center justify-between">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            handleLike()
          }}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg transition-all ${isLiked ? 'text-red-500' : 'text-gray-600 hover:bg-gray-100'}`}
        >
          <Heart size={20} className={isLiked ? 'fill-current' : ''} />
          <span className="text-sm font-medium">Like</span>
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            setShowComments(!showComments)
          }}
          className="flex-1 flex items-center justify-center gap-2 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
        >
          <MessageCircle size={20} />
          <span className="text-sm font-medium">Comment</span>
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onShare(post.id)
          }}
          className="flex-1 flex items-center justify-center gap-2 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
        >
          <Share2 size={20} />
          <span className="text-sm font-medium">Share</span>
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            setSaved(!saved)
          }}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg transition-all ${saved ? 'text-emerald-600' : 'text-gray-600 hover:bg-gray-100'}`}
        >
          <Bookmark size={20} className={saved ? 'fill-current' : ''} />
        </button>
      </div>

      {/* Comments Section */}
      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-gray-100 bg-gray-50 custom-scrollbar"
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

            {/* Existing Comments - Recursive */}
            <div className="p-4 space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
              {post.comments?.map((comment, index) => (
                <CommentItem
                  key={comment.id || index}
                  comment={comment}
                  postId={post.id}
                  onReply={onReply || onComment}
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
                onSubmit={handleSubmitComment}
                className="p-4 border-t border-gray-200"
              >
                <div className="flex gap-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <User size={14} className="text-white" />
                  </div>
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Write a comment..."
                      className="w-full pl-4 pr-12 py-2 bg-white border border-gray-200 rounded-full text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
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
                  onClick={() => onComment?.(post.id, '', null)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full text-sm font-medium transition-colors"
                >
                  <Lock size={14} />
                  <span>Sign in to comment</span>
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Full-Screen Media Viewer */}
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
          {/* Close Button */}
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

          {/* Media Display */}
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
            ) : isEmbed(currentFullscreenMedia) ? (
              <div
                className="w-full h-full max-w-4xl aspect-video"
                dangerouslySetInnerHTML={{
                  __html: currentFullscreenMedia
                    .replace(/width="\d+"/g, 'width="100%"')
                    .replace(/height="\d+"/g, 'height="100%"'),
                }}
              />
            ) : isVideo(currentFullscreenMedia) ? (
              (() => {
                const videoData = getVideoRenderData(currentFullscreenMedia)
                if (videoData.type === 'youtube' || videoData.type === 'vimeo') {
                  return (
                    <div className="w-full h-full max-w-4xl rounded-lg overflow-hidden">
                      <iframe
                        src={videoData.src}
                        className="w-full h-full"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        title="Embedded video"
                      />
                    </div>
                  )
                }
                if (videoData.type === 'file') {
                  return (
                    <video
                      src={videoData.src}
                      controls
                      className="w-full h-full max-w-4xl rounded-lg bg-black"
                    />
                  )
                }
                return (
                  <div className="w-full max-w-4xl aspect-video bg-gray-900 rounded-lg flex items-center justify-center">
                    <p className="text-white text-lg">Video Player</p>
                  </div>
                )
              })()
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
    </motion.div>
  )
})

// Login Prompt Modal
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

// Main Posts Feed Component
export default function PostsFeed() {
  const navigate = useNavigate()
  const [posts, setPosts] = useState([])
  const [categories, setCategories] = useState([])
  const [suggestedPosts, setSuggestedPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)
  const [showLoginPrompt, setShowLoginPrompt] = useState(false)
  const [showPostsTutorial, setShowPostsTutorial] = useState(false)
  const [activeTab, setActiveTab] = useState('all')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredPosts, setFilteredPosts] = useState([])

  const postsTutorialSteps = [
    {
      selector: '#tutorial-post-search',
      title: 'Search posts quickly',
      description:
        'Type keywords here to find posts, categories, or authors across the community feed.',
      placement: 'bottom',
    },
    {
      selector: '#tutorial-post-category',
      title: 'Filter by category',
      description:
        'Choose a category to narrow the feed and see posts that match your interests.',
      placement: 'bottom',
    },
    {
      selector: '.tutorial-first-post',
      title: 'Browse posts',
      description:
        'This highlights the first post in the feed so you can see the action bar and content clearly.',
      placement: 'right',
    },
  ]

  // Check authentication - only updates state if changed
  const checkAuth = () => {
    const token =
      localStorage.getItem('token') ||
      localStorage.getItem('userToken') ||
      localStorage.getItem('adminToken')
    const userData = localStorage.getItem('user')

    const newIsLoggedIn = !!token
    let newCurrentUser = null

    if (userData) {
      try {
        newCurrentUser = JSON.parse(userData)
      } catch (e) {
        newCurrentUser = null
      }
    }

    // Only update state if actually changed (prevents re-renders)
    setIsLoggedIn((prev) => {
      if (prev !== newIsLoggedIn) return newIsLoggedIn
      return prev
    })

    setCurrentUser((prev) => {
      if (JSON.stringify(prev) !== JSON.stringify(newCurrentUser))
        return newCurrentUser
      return prev
    })
  }

  useEffect(() => {
    checkAuth()

    // Poll for auth changes every 5 seconds (reduced from 1s to prevent video refresh)
    const interval = setInterval(checkAuth, 5000)

    // Listen for storage events (login/logout in other tabs)
    const handleStorage = () => checkAuth()
    window.addEventListener('storage', handleStorage)

    return () => {
      clearInterval(interval)
      window.removeEventListener('storage', handleStorage)
    }
  }, [])

  // Fetch categories and posts
  useEffect(() => {
    fetchCategories()
    fetchPosts()
    fetchSuggestedPosts()
  }, [])

  // Filter posts when search or category changes
  useEffect(() => {
    filterPosts()
  }, [posts, selectedCategory, searchQuery])

  const fetchCategories = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SERVER_LINK}/api/categories`,
      )
      if (response.ok) {
        const result = await response.json()
        setCategories(result.data || [])
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const fetchSuggestedPosts = async () => {
    try {
      // For now, use a subset of posts as suggested posts
      const response = await fetch(`${import.meta.env.VITE_SERVER_LINK}/posts/feed`)
      if (response.ok) {
        const result = await response.json()
        const token =
          localStorage.getItem('token') ||
          localStorage.getItem('userToken') ||
          localStorage.getItem('adminToken')

        // Take top 3 posts with most likes as suggested
        const suggested = result.data
          .sort((a, b) => (b.likes || 0) - (a.likes || 0))
          .slice(0, 3)

        const suggestedWithCounts = await Promise.all(
          suggested.map(async (post) => {
            let commentCount = 0
            try {
              const commentsRes = await fetch(
                `${import.meta.env.VITE_SERVER_LINK}/api/comments/post/${post.id}`,
                {
                  headers: token ? { Authorization: `Bearer ${token}` } : {},
                },
              )
              if (commentsRes.ok) {
                const commentsResult = await commentsRes.json()
                const comments = commentsResult.data || []
                commentCount =
                  commentsResult.count ?? countCommentsIncludingReplies(comments)
              }
            } catch (err) {
              console.error(
                `Error fetching comments for suggested post ${post.id}:`,
                err,
              )
            }
            return {
              ...post,
              commentCount,
            }
          }),
        )

        setSuggestedPosts(suggestedWithCounts)
      }
    } catch (error) {
      console.error('Error fetching suggested posts:', error)
    }
  }

  const countCommentsIncludingReplies = (comments = []) => {
    if (!Array.isArray(comments)) return 0
    return comments.reduce((count, comment) => {
      return count + 1 + countCommentsIncludingReplies(comment.replies)
    }, 0)
  }

  const filterPosts = () => {
    let filtered = [...posts]

    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter((post) => post.category_name === selectedCategory)
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (post) =>
          post.title?.toLowerCase().includes(query) ||
          post.content?.toLowerCase().includes(query) ||
          post.category_name?.toLowerCase().includes(query),
      )
    }

    setFilteredPosts(filtered)
  }

  const fetchPosts = async () => {
    try {
      setLoading(true)
      // Use new /feed endpoint with proper engagement data
      const response = await fetch(`${import.meta.env.VITE_SERVER_LINK}/posts/feed`)

      if (!response.ok) throw new Error('Failed to fetch posts')

      const result = await response.json()
      console.log('Posts fetched:', result.data?.length || 0, 'posts')

      if (result.success) {
        // Fetch like status for each post if user is logged in
        const token =
          localStorage.getItem('token') ||
          localStorage.getItem('userToken') ||
          localStorage.getItem('adminToken')
        console.log('Fetch posts - token exists:', !!token)

        const postsWithDetails = await Promise.all(
          result.data.map(async (post) => {
            // Fetch comments for this post
            const commentsRes = await fetch(
              `${import.meta.env.VITE_SERVER_LINK}/api/comments/post/${post.id}`,
              {
                headers: token ? { Authorization: `Bearer ${token}` } : {},
              },
            )
            let comments = []
            let totalCommentCount = 0
            if (commentsRes.ok) {
              const commentsResult = await commentsRes.json()
              comments = commentsResult.data || []
              totalCommentCount =
                commentsResult.count ?? countCommentsIncludingReplies(comments)
              console.log(`Post ${post.id} - Comments received:`, comments)
              console.log(`Post ${post.id} - Comments count:`, comments.length)
              if (comments.length > 0) {
                console.log(`Post ${post.id} - First comment:`, comments[0])
                console.log(
                  `Post ${post.id} - First comment replies:`,
                  comments[0].replies,
                )
              }
            }

            // Fetch like status if logged in
            let userLiked = false
            let likeCount = post.likes || 0

            if (token) {
              const likesRes = await fetch(
                `${import.meta.env.VITE_SERVER_LINK}/api/likes/post/${post.id}`,
                {
                  headers: { Authorization: `Bearer ${token}` },
                },
              )
              if (likesRes.ok) {
                const likesResult = await likesRes.json()
                userLiked = likesResult.data?.userLiked || false
                likeCount = likesResult.data?.likeCount || likeCount
                console.log(
                  `Post ${post.id}: likes=${likeCount}, userLiked=${userLiked}`,
                )
              }
            }

            return {
              ...post,
              comments,
              commentCount: totalCommentCount,
              likes: likeCount,
              userLiked,
            }
          }),
        )
        setPosts(postsWithDetails)
      }
    } catch (error) {
      console.error('Error fetching posts:', error)
      // Use sample data if API fails
      setPosts(getSamplePosts())
    } finally {
      setLoading(false)
    }
  }

  const getSamplePosts = () => [
    {
      id: 1,
      title: 'Welcome to Our Community! 🎉',
      content:
        'We are excited to announce the launch of our new community features. Connect with fellow users, share your experiences, and stay updated with the latest news and announcements. Thank you for being part of our journey!',
      media: [],
      likes: 234,
      shares: 45,
      comments: [
        { author: 'Alice Johnson', text: 'So excited to be here!', time: '1h ago' },
        { author: 'Bob Wilson', text: 'Great initiative!', time: '2h ago' },
      ],
      author: 'CMO Scheduling Team',
      created_at: new Date().toISOString(),
    },
    {
      id: 2,
      title: 'New Appointment Slots Available 📅',
      content:
        'We have just opened new appointment slots for next week. Book your appointment now to secure your preferred time. Limited slots available!',
      media: [
        'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
        'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800',
      ],
      likes: 156,
      shares: 23,
      comments: [
        { author: 'Carol Davis', text: 'Just booked mine!', time: '30m ago' },
      ],
      author: 'Appointment Manager',
      created_at: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: 3,
      title: 'Holiday Schedule Update 🎄',
      content:
        'Please note our updated schedule for the upcoming holiday season. We will be closed on December 25th and January 1st. Regular hours will resume on January 2nd.',
      media: ['https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800'],
      likes: 89,
      shares: 67,
      comments: [],
      author: 'Admin Team',
      created_at: new Date(Date.now() - 172800000).toISOString(),
    },
  ]

  const handleLike = async (postId, liked) => {
    const token =
      localStorage.getItem('token') ||
      localStorage.getItem('userToken') ||
      localStorage.getItem('adminToken')

    console.log('Like clicked - token:', token ? 'exists' : 'missing')

    if (!token) {
      setShowLoginPrompt(true)
      return
    }

    try {
      console.log('Sending like request for post:', postId)
      const response = await fetch(
        `${import.meta.env.VITE_SERVER_LINK}/api/likes/post/${postId}`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      )

      console.log('Like response status:', response.status)

      if (response.ok) {
        const result = await response.json()
        console.log('Like result:', result)
        // Update post in state
        setPosts(
          posts.map((post) =>
            post.id === postId
              ? {
                  ...post,
                  userLiked: result.data?.liked,
                  likes: result.data?.likeCount,
                }
              : post,
          ),
        )
      } else {
        const errorData = await response.json()
        console.error('Like API error:', errorData)
      }
    } catch (error) {
      console.error('Error toggling like:', error)
    }
  }

  const handleComment = async (postId, text, parentId = null) => {
    const token =
      localStorage.getItem('token') ||
      localStorage.getItem('userToken') ||
      localStorage.getItem('adminToken')

    console.log('Comment clicked - token:', token ? 'exists' : 'missing')

    if (!token) {
      setShowLoginPrompt(true)
      return
    }

    if (!text || !text.trim()) return

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SERVER_LINK}/api/comments/post/${postId}`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ comment: text.trim(), parentId }),
        },
      )

      if (response.ok) {
        // Refresh comments for this post
        const commentsRes = await fetch(
          `${import.meta.env.VITE_SERVER_LINK}/api/comments/post/${postId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        )
        if (commentsRes.ok) {
          const commentsResult = await commentsRes.json()
          setPosts(
            posts.map((post) =>
              post.id === postId
                ? { ...post, comments: commentsResult.data || [] }
                : post,
            ),
          )
        }
      }
    } catch (error) {
      console.error('Error adding comment:', error)
    }
  }

  const handleLogin = () => {
    navigate('/login')
  }

  const copyTextToClipboard = async (text) => {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text)
    }

    const textarea = document.createElement('textarea')
    textarea.value = text
    textarea.style.position = 'fixed'
    textarea.style.left = '-9999px'
    textarea.style.top = '0'
    document.body.appendChild(textarea)
    textarea.focus()
    textarea.select()

    try {
      const successful = document.execCommand('copy')
      if (!successful) {
        throw new Error('Fallback copy command failed')
      }
    } finally {
      document.body.removeChild(textarea)
    }
  }

  const handleShare = async (postId) => {
    const url = `${window.location.origin}/posts/${postId}`
    const shareData = {
      title: 'Check out this post',
      text: `Read this post: ${url}`,
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

  const totalLikes = posts.reduce((sum, p) => sum + (p.likes || 0), 0)

  return (
    <div className="h-screen bg-[#f0f2f5] flex flex-col">
      {/* Top accent stripe */}
      <div className="h-1 bg-gradient-to-r from-emerald-400 via-teal-500 to-emerald-600 flex-shrink-0 " />
      <PublicHeader />

      {/* ── 3-column layout ─────────────────────────────────────── */}
      <main className="flex-1 flex flex-col px-4 sm:px-6 py-4 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 lg:overflow-hidden overflow-y-auto">
        <TutorialGuide
          isOpen={showPostsTutorial}
          onClose={() => setShowPostsTutorial(false)}
          steps={postsTutorialSteps}
          initialStep={0}
        />

        <div className="grid grid-cols-1 lg:grid-cols-[350px_1fr_350px] gap-10 lg:h-full items-stretch">
          {/* ══ LEFT SIDEBAR — Search & Categories ══════════════ */}
          <aside className="space-y-5 lg:h-full lg:overflow-y-auto pr-2 custom-scrollbar">
            {/* Search widget */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
              <div className="px-4 pt-4 pb-3 border-b border-gray-50 flex items-center gap-2">
                <div className="w-7 h-7 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <Search size={14} className="text-emerald-600" />
                </div>
                <span className="text-sm font-bold text-gray-800">Search Posts</span>
                <button
                  type="button"
                  onClick={() => setShowPostsTutorial(true)}
                  className="animate-bounce inline-flex items-center justify-center gap-2 rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg transition hover:bg-emerald-700 active:scale-95"
                >
                  <BookOpen size={16} className="text-white" />
                  Start tutorial
                </button>
              </div>
              <div className="p-4">
                {/* Search input */}
                <div className="relative mb-3" id="tutorial-post-search">
                  <Search
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    size={15}
                  />
                  <input
                    type="text"
                    placeholder="Search posts, categories..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-9 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:bg-white transition-all"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X size={13} />
                    </button>
                  )}
                </div>

                {/* Result count */}
                {searchQuery && (
                  <p className="text-xs text-gray-500 mb-3">
                    {filteredPosts.length} result
                    {filteredPosts.length !== 1 ? 's' : ''} for &ldquo;{searchQuery}
                    &rdquo;
                  </p>
                )}

                {/* Category dropdown (original) */}
                <select
                  id="tutorial-post-category"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:bg-white transition-all mb-3"
                >
                  <option value="">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.name}>
                      {cat.name}
                    </option>
                  ))}
                </select>

                {/* Quick filters */}
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                  Quick Filters
                </p>
                <div className="space-y-1">
                  {['Most Recent', 'Most Liked', 'Most Commented'].map((f) => (
                    <button
                      key={f}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-emerald-50 hover:text-emerald-700 transition-colors group"
                    >
                      <span>{f}</span>
                      <ChevronRight
                        size={14}
                        className="text-gray-300 group-hover:text-emerald-500 transition-colors"
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Categories pills widget */}
            {categories.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
                <div className="px-4 pt-4 pb-3 border-b border-gray-50 flex items-center gap-2">
                  <div className="w-7 h-7 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <Hash size={14} className="text-emerald-600" />
                  </div>
                  <span className="text-sm font-bold text-gray-800">Categories</span>
                </div>
                <div className="p-4 space-y-1">
                  <button
                    onClick={() => setSelectedCategory('')}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      !selectedCategory
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <span>All Posts</span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${!selectedCategory ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}
                    >
                      {posts.length}
                    </span>
                  </button>
                  {categories.map((cat) => {
                    const count = posts.filter(
                      (p) => p.category_name === cat.name,
                    ).length
                    return (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.name)}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                          selectedCategory === cat.name
                            ? 'bg-emerald-600 text-white shadow-sm'
                            : 'text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-2 h-2 rounded-full ${selectedCategory === cat.name ? 'bg-white' : 'bg-emerald-400'}`}
                          />
                          <span>{cat.name}</span>
                        </div>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${selectedCategory === cat.name ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}
                        >
                          {count}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Community Stats */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
              <div className="px-4 pt-4 pb-3 border-b border-gray-50 flex items-center gap-2">
                <div className="w-7 h-7 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <BarChart3 size={14} className="text-emerald-600" />
                </div>
                <span className="text-sm font-bold text-gray-800">
                  Community Stats
                </span>
              </div>
              <div className="p-4 space-y-3">
                {[
                  {
                    label: 'Total Posts',
                    value: posts.length,
                    icon: '📝',
                    color: 'text-blue-600 bg-blue-50',
                  },
                  {
                    label: 'Total Likes',
                    value: totalLikes.toLocaleString(),
                    icon: '❤️',
                    color: 'text-red-600 bg-red-50',
                  },
                  {
                    label: 'Categories',
                    value: categories.length,
                    icon: '🏷️',
                    color: 'text-purple-600 bg-purple-50',
                  },
                  {
                    label: 'Active Filters',
                    value: (searchQuery ? 1 : 0) + (selectedCategory ? 1 : 0),
                    icon: '🔍',
                    color: 'text-emerald-600 bg-emerald-50',
                  },
                ].map(({ label, value, icon, color }) => (
                  <div key={label} className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center text-base ${color}`}
                    >
                      {icon}
                    </div>
                    <div>
                      <p className="text-base font-bold text-gray-900 leading-none">
                        {value}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">{label}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </aside>

          {/* ══ CENTER — Posts feed (SCROLLABLE) ══════════════ */}
          <div className="min-w-0 lg:h-full lg:overflow-y-auto pr-2 pb-5 custom-scrollbar flex flex-col items-center flex-1">
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

            {/* Content wrapper with max-width */}
            <div className="w-full max-w-[1000px] " id="tutorial-post-feed">
              {/* Feed header */}
              <div className="flex items-center justify-between w-full max-w-[600px]">
                <div></div>
                {(searchQuery || selectedCategory) && (
                  <button
                    onClick={() => {
                      setSearchQuery('')
                      setSelectedCategory('')
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs font-medium text-gray-600 transition-colors"
                  >
                    <X size={12} /> Clear filters
                  </button>
                )}
              </div>

              {/* Posts */}
              <AnimatePresence>
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <Loader2
                        className="animate-spin text-emerald-600 mx-auto mb-3"
                        size={32}
                      />
                      <p className="text-gray-500">Loading posts...</p>
                    </div>
                  </div>
                ) : filteredPosts.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center w-full max-w-[1900px]"
                  >
                    <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <MessageCircle size={28} className="text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {searchQuery || selectedCategory
                        ? 'No posts found'
                        : 'No posts yet'}
                    </h3>
                    <p className="text-gray-500">
                      {searchQuery || selectedCategory
                        ? 'Try adjusting your search or filters'
                        : 'Wait for the Posts by the Author!'}
                    </p>
                  </motion.div>
                ) : (
                  <div className="space-y-5">
                    {filteredPosts.map((post, index) => (
                      <motion.div
                        key={post.id}
                        id={`post-${post.id}`}
                        className={index === 0 ? 'tutorial-first-post' : undefined}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <PostCard
                          post={post}
                          onLike={handleLike}
                          onComment={handleComment}
                          onReply={handleComment}
                          isLoggedIn={isLoggedIn}
                          currentUser={currentUser}
                          onShare={handleShare}
                        />
                      </motion.div>
                    ))}
                  </div>
                )}
              </AnimatePresence>
            </div>

            {/* End of Feed */}
            {!loading && filteredPosts.length > 0 && (
              <div className="mt-8 text-center w-full max-w-[600px]">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-gray-100 shadow-sm text-xs text-gray-400">
                  <span>You've reached the end of the feed</span>
                  <span>·</span>
                </div>
              </div>
            )}
          </div>

          {/* Floating Back to Top Button */}
          <button
            onClick={() => {
              // Always try mobile scrolling for smaller screens
              const isMobileView = window.innerWidth < 1024
              console.log(
                'Mobile view:',
                isMobileView,
                'Window width:',
                window.innerWidth,
              )

              if (isMobileView) {
                // Mobile: scroll to entire page with all methods
                console.log('Scrolling entire page to top')

                // Try all possible scroll methods
                window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })
                window.scrollTo(0, 0)
                document.documentElement.scrollTop = 0
                document.body.scrollTop = 0
                document.body.scrollIntoView({ behavior: 'smooth', block: 'start' })
              } else {
                // Desktop: scroll to center column (posts feed)
                const scrollableContainer = document.querySelector(
                  '.min-w-0.lg\\:h-full.lg\\:overflow-y-auto.pr-2.pb-5.custom-scrollbar',
                )
                if (scrollableContainer) {
                  console.log('Scrolling posts feed to top')
                  scrollableContainer.scrollTo({ top: 0, behavior: 'smooth' })
                } else {
                  console.log('No scrollable container found')
                }
              }
            }}
            className="fixed bottom-8 right-8 z-50 bg-emerald-600 text-white p-3 rounded-full shadow-lg hover:bg-emerald-700 transition-all duration-200 hover:scale-110"
            title="Back to top"
          >
            <ArrowUp className="w-5 h-5" />
          </button>

          {/* ══ RIGHT SIDEBAR — Suggestions & More ══════════════ */}
          <aside className="space-y-5 lg:h-full lg:overflow-y-auto lg:sticky pr-2 lg:top-6 custom-scrollbar">
            {/* Trending Posts */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
              <div className="px-4 pt-4 pb-3 border-b border-gray-50 flex items-center gap-2">
                <div className="w-7 h-7 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Flame size={14} className="text-orange-500" />
                </div>
                <span className="text-sm font-bold text-gray-800">
                  Trending Posts
                </span>
              </div>
              <div className="p-4 space-y-2">
                {(suggestedPosts.length
                  ? suggestedPosts
                  : getSamplePosts().slice(0, 3)
                ).map((post, i) => (
                  <button
                    key={post.id}
                    onClick={() => {
                      const postElement = document.getElementById(`post-${post.id}`)
                      if (postElement)
                        postElement.scrollIntoView({
                          behavior: 'smooth',
                          block: 'center',
                        })
                    }}
                    className="w-full text-left group"
                  >
                    <div className="flex gap-3 p-2.5 rounded-xl hover:bg-gray-50 transition-colors">
                      <div className="flex-shrink-0 w-7 h-7 rounded-lg bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center">
                        <span className="text-xs font-bold text-orange-500">
                          #{i + 1}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 line-clamp-2 group-hover:text-emerald-700 transition-colors leading-snug">
                          {post.title || 'Untitled Post'}
                        </p>
                        <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
                          <Heart size={10} className="text-red-400" />
                          <span>{post.likes || 0}</span>
                          <MessageCircle size={10} className="text-blue-400" />
                          <span>{post.commentCount || 0}</span>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Suggested Posts (original logic) */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
              <div className="px-4 pt-4 pb-3 border-b border-gray-50 flex items-center gap-2">
                <div className="w-7 h-7 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <TrendingUp size={14} className="text-emerald-600" />
                </div>
                <span className="text-sm font-bold text-gray-800">
                  Suggested Posts
                </span>
              </div>
              <div className="p-4 space-y-3">
                {suggestedPosts.map((post, index) => (
                  <div
                    key={post.id}
                    className="cursor-pointer group"
                    onClick={() => {
                      const postElement = document.getElementById(`post-${post.id}`)
                      if (postElement)
                        postElement.scrollIntoView({
                          behavior: 'smooth',
                          block: 'center',
                        })
                    }}
                  >
                    <div className="p-3 rounded-xl border border-gray-100 group-hover:border-emerald-200 group-hover:bg-emerald-50 transition-all">
                      <h4 className="text-sm font-medium text-gray-900 line-clamp-2 mb-1">
                        {post.title || 'Untitled Post'}
                      </h4>
                      <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                        {post.content}
                      </p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{post.likes || 0} likes</span>
                        <span>{post.commentCount || 0} comments</span>
                      </div>
                      {post.category_name && (
                        <div className="mt-2">
                          <span className="inline-block px-2 py-1 bg-emerald-100 text-emerald-700 text-xs rounded-full">
                            {post.category_name}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {suggestedPosts.length === 0 && (
                  <p className="text-center text-gray-500 text-sm py-4">
                    No suggested posts yet
                  </p>
                )}
              </div>
            </div>

            {/* Stay Updated CTA */}
            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-5 text-white shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <Bell size={16} className="text-white/80" />
                <span className="text-sm font-bold">
                  {isLoggedIn ? 'Notifications Active' : 'Stay Updated'}
                </span>
              </div>
              <p className="text-xs text-white/80 mb-4 leading-relaxed">
                {isLoggedIn
                  ? "You're all set! Get notified about new posts, replies, and community updates."
                  : 'Sign in to get notified about new posts, replies, and community updates.'}
              </p>
              {isLoggedIn ? (
                <div className="flex items-center gap-2 bg-white/20 rounded-xl px-3 py-2">
                  <div className="w-6 h-6 bg-white/30 rounded-full flex items-center justify-center">
                    <User size={12} className="text-white" />
                  </div>
                  <span className="text-xs font-medium text-white">
                    {currentUser?.fullname ||
                      currentUser?.mu_fullname ||
                      currentUser?.email ||
                      "You're signed in"}
                  </span>
                </div>
              ) : (
                <button
                  onClick={handleLogin}
                  className="w-full py-2.5 bg-white text-emerald-700 rounded-xl text-sm font-bold hover:bg-emerald-50 transition-colors shadow-sm"
                >
                  Sign In
                </button>
              )}
            </div>

            {/* Quick Stats (original widget) */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
              <div className="px-4 pt-4 pb-3 border-b border-gray-50 flex items-center gap-2">
                <div className="w-7 h-7 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <Hash size={14} className="text-emerald-600" />
                </div>
                <span className="text-sm font-bold text-gray-800">Quick Stats</span>
              </div>
              <div className="p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Posts</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {posts.length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Categories</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {categories.length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Active Filters</span>
                  <span className="text-sm font-semibold text-emerald-600">
                    {(searchQuery ? 1 : 0) + (selectedCategory ? 1 : 0)}
                  </span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>

      {/* Login Prompt Modal */}
      <LoginPrompt
        isOpen={showLoginPrompt}
        onClose={() => setShowLoginPrompt(false)}
        onLogin={handleLogin}
      />
    </div>
  )
}
