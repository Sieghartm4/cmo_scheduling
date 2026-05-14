import React, { useState, useEffect, useRef } from 'react'
import { motion, useMotionValue, useTransform, animate } from 'framer-motion'
import {
  Calendar,
  MessageSquare,
  Users,
  Clock,
  CheckCircle2,
  Loader2,
  Heart,
  MessageCircle,
  AlertTriangle,
  TrendingUp,
  Activity,
  Sparkles,
  Zap,
  ArrowUpRight,
} from 'lucide-react'
import { format } from 'date-fns'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from 'recharts'
import RouteProtection from '../../components/RouteProtection'

/* ── Google Font import (Syne + Plus Jakarta Sans) ── */
const fontLink = document.createElement('link')
fontLink.href =
  'https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap'
fontLink.rel = 'stylesheet'
document.head.appendChild(fontLink)

export default function Dashboard() {
  return (
    <RouteProtection routeName="dashboard">
      <DashboardContent />
    </RouteProtection>
  )
}

/* ── Animated counter hook ── */
function useCounter(target, duration = 1.2) {
  const [display, setDisplay] = useState(0)
  useEffect(() => {
    let start = 0
    const step = target / (duration * 60)
    const timer = setInterval(() => {
      start += step
      if (start >= target) {
        setDisplay(target)
        clearInterval(timer)
      } else setDisplay(Math.floor(start))
    }, 1000 / 60)
    return () => clearInterval(timer)
  }, [target])
  return display
}

/* ── Floating orb background ── */
function FloatingOrbs() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10">
      {[
        { color: '#d1fae5', w: 500, h: 500, x: -100, y: -100, dur: 18 },
        { color: '#fef3c7', w: 400, h: 400, x: '70%', y: '10%', dur: 22 },
        { color: '#ede9fe', w: 350, h: 350, x: '20%', y: '60%', dur: 26 },
        { color: '#fee2e2', w: 300, h: 300, x: '80%', y: '70%', dur: 20 },
        { color: '#e0f2fe', w: 280, h: 280, x: '50%', y: '40%', dur: 30 },
      ].map((orb, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full blur-3xl opacity-60"
          style={{
            width: orb.w,
            height: orb.h,
            left: orb.x,
            top: orb.y,
            background: orb.color,
          }}
          animate={{
            x: [0, 30, -20, 10, 0],
            y: [0, -25, 15, -10, 0],
            scale: [1, 1.06, 0.97, 1.03, 1],
          }}
          transition={{ duration: orb.dur, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}
    </div>
  )
}

function DashboardContent() {
  const [overview, setOverview] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.09 } },
  }
  const item = {
    hidden: { y: 24, opacity: 0 },
    show: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
    },
  }

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        const token =
          localStorage.getItem('token') || localStorage.getItem('adminToken')
        if (!token) throw new Error('No auth token available')
        const response = await fetch(
          `${import.meta.env.VITE_SERVER_LINK}/dashboard/overview`,
          { headers: { Authorization: `Bearer ${token}` } },
        )
        if (!response.ok) {
          const payload = await response.json().catch(() => null)
          throw new Error(payload?.message || 'Unable to load dashboard overview')
        }
        const result = await response.json()
        setOverview(result.data)
      } catch (err) {
        setError(err.message || 'Failed to load dashboard overview')
      } finally {
        setLoading(false)
      }
    }
    fetchOverview()
  }, [])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <FloatingOrbs />
        <div className="flex flex-col items-center gap-5">
          <div className="relative">
            <div className="h-16 w-16 rounded-full border-4 border-emerald-200 border-t-emerald-600 animate-spin" />
            <Sparkles
              className="absolute inset-0 m-auto text-emerald-500"
              size={20}
            />
          </div>
          <p className="text-sm font-semibold text-slate-400 tracking-widest uppercase">
            Loading dashboard…
          </p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white px-4">
        <FloatingOrbs />
        <div className="rounded-3xl border border-red-100 bg-white p-10 shadow-2xl max-w-md w-full text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
            <AlertTriangle className="text-red-500" size={24} />
          </div>
          <h2 className="text-xl font-bold text-black">Dashboard unavailable</h2>
          <p className="mt-2 text-sm text-slate-500">{error}</p>
        </div>
      </div>
    )
  }

  const stats = overview?.stats || {}
  const recentAppointments = overview?.recentAppointments || []
  const recentPosts = overview?.recentPosts || []
  const recentComments = overview?.recentComments || []
  const appointmentStatusCounts = overview?.appointmentStatusCounts || []
  const postStatusCounts = overview?.postStatusCounts || []
  const activityStats = overview?.activityStats || []

  const chartData = activityStats.length
    ? activityStats
    : [{ date: 'No data', posts: 0, comments: 0, likes: 0 }]

  const formatChartDate = (v) => {
    try {
      return format(new Date(v), 'MMM d')
    } catch {
      return v
    }
  }
  const formatTooltipLabel = (l) => {
    try {
      return format(new Date(l), 'EEEE, MMM d')
    } catch {
      return l
    }
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="dashboard-scrollbar relative min-h-screen px-4  sm:px-8 lg:px-10"
      style={{
        fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
        background: '#f0fdf4',
      }}
    >
      <style
        dangerouslySetInnerHTML={{
          __html: `
            body::-webkit-scrollbar,
            .dashboard-scrollbar::-webkit-scrollbar {
              width: 8px;
              height: 8px;
            }
            body::-webkit-scrollbar-track,
            .dashboard-scrollbar::-webkit-scrollbar-track {
              background: rgba(16, 185, 129, 0.08);
            }
            body::-webkit-scrollbar-thumb,
            .dashboard-scrollbar::-webkit-scrollbar-thumb {
              background: rgba(16, 185, 129, 0.45);
              border-radius: 9999px;
              border: 2px solid transparent;
              background-clip: content-box;
            }
            body::-webkit-scrollbar-thumb:hover,
            .dashboard-scrollbar::-webkit-scrollbar-thumb:hover {
              background: rgba(16, 185, 129, 0.75);
            }
            body {
              scrollbar-width: thin;
              scrollbar-color: rgba(16, 185, 129, 0.45) rgba(16, 185, 129, 0.08);
            }
            .dashboard-scrollbar {
              scrollbar-width: thin;
              scrollbar-color: rgba(16, 185, 129, 0.45) rgba(16, 185, 129, 0.08);
            }
          `,
        }}
      />
      <FloatingOrbs />

      {/* ── Header ── */}
      <motion.div
        variants={item}
        className="mb-10 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between"
      >
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700 uppercase tracking-wider">
              <Zap size={11} className="fill-emerald-500 text-emerald-500" />
              Analytics Hub
            </span>
          </div>
          <h1
            className="text-3xl font-extrabold text-gray-900 sm:text-4xl"
            style={{ fontFamily: "'Syne', sans-serif", letterSpacing: '-0.03em' }}
          >
            Dashboard
            <span
              className="ml-3 inline-block text-transparent bg-clip-text"
              style={{
                backgroundImage:
                  'linear-gradient(135deg, #059669, #10b981, #34d399)',
              }}
            >
              Overview
            </span>
          </h1>
        </div>
        <motion.span
          whileHover={{ scale: 1.04 }}
          className="inline-flex items-center gap-2 rounded-2xl bg-white border border-emerald-100 px-5 py-2.5 text-xs font-semibold text-slate-600 shadow-md shadow-emerald-100/40"
        >
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400" />
          Live · Updated {new Date().toLocaleDateString()}
        </motion.span>
      </motion.div>

      {/* ── Metric Cards ── */}
      <motion.div
        variants={item}
        className="grid grid-cols-2 gap-4 xl:grid-cols-4 mb-6"
      >
        <MetricCard
          title="Posts"
          value={stats.total_posts ?? 0}
          subtitle={`${stats.published_posts ?? 0} published`}
          icon={<MessageSquare size={20} />}
          gradient="from-emerald-500 to-teal-400"
          glow="shadow-emerald-200"
          badge="bg-emerald-50 text-emerald-700"
          sparkline={[3, 5, 4, 7, 6, 9, 8]}
        />
        <MetricCard
          title="Comments"
          value={stats.total_comments ?? 0}
          subtitle="Community replies"
          icon={<MessageCircle size={20} />}
          gradient="from-violet-500 to-purple-400"
          glow="shadow-violet-200"
          badge="bg-violet-50 text-violet-700"
          sparkline={[2, 4, 3, 5, 4, 6, 7]}
        />
        <MetricCard
          title="Likes"
          value={stats.total_likes ?? 0}
          subtitle={`${stats.total_interactions ?? 0} interactions`}
          icon={<Heart size={20} />}
          gradient="from-rose-500 to-pink-400"
          glow="shadow-rose-200"
          badge="bg-rose-50 text-rose-700"
          sparkline={[5, 6, 4, 8, 7, 9, 10]}
        />
        <MetricCard
          title="Appointments"
          value={stats.total_appointments ?? 0}
          subtitle={`${stats.pending_appointments ?? 0} pending`}
          icon={<Calendar size={20} />}
          gradient="from-amber-500 to-orange-400"
          glow="shadow-amber-200"
          badge="bg-amber-50 text-amber-700"
          sparkline={[1, 3, 2, 4, 3, 5, 4]}
        />
      </motion.div>

      {/* ── Chart + Status ── */}
      <motion.div
        variants={item}
        className="grid gap-5 xl:grid-cols-[1.6fr_1fr] mb-5"
      >
        {/* Area Chart */}
        <section className="rounded-3xl bg-white border border-white/80 p-6 shadow-xl shadow-emerald-100/30 backdrop-blur-sm relative overflow-hidden">
          <div
            className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl opacity-20"
            style={{ background: 'radial-gradient(circle, #6ee7b7, transparent)' }}
          />
          <div className="mb-6 flex items-start justify-between gap-4 relative">
            <div>
              <h2
                className="text-lg font-bold text-gray-900"
                style={{ fontFamily: "'Syne', sans-serif" }}
              >
                7-day Engagement
              </h2>
              <p className="mt-0.5 text-xs text-slate-400 font-medium">
                Posts, comments & likes over the last week
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-white shadow-md shadow-emerald-200">
              <TrendingUp size={11} />
              Trend
            </span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  {[
                    { id: 'gPosts', color: '#059669' },
                    { id: 'gComments', color: '#7c3aed' },
                    { id: 'gLikes', color: '#f43f5e' },
                  ].map((g) => (
                    <linearGradient key={g.id} id={g.id} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={g.color} stopOpacity={0.25} />
                      <stop offset="95%" stopColor={g.color} stopOpacity={0} />
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid strokeDasharray="4 4" stroke="#f0fdf4" />
                <XAxis
                  dataKey="date"
                  tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 500 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={formatChartDate}
                />
                <YAxis
                  tick={{ fill: '#94a3b8', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 16,
                    border: 'none',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                    fontSize: 12,
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                  }}
                  labelFormatter={formatTooltipLabel}
                />
                <Legend
                  verticalAlign="top"
                  height={36}
                  wrapperStyle={{
                    fontSize: 12,
                    paddingBottom: 8,
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="posts"
                  stroke="#059669"
                  fill="url(#gPosts)"
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{ r: 5, fill: '#059669', strokeWidth: 0 }}
                />
                <Area
                  type="monotone"
                  dataKey="comments"
                  stroke="#7c3aed"
                  fill="url(#gComments)"
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{ r: 5, fill: '#7c3aed', strokeWidth: 0 }}
                />
                <Area
                  type="monotone"
                  dataKey="likes"
                  stroke="#f43f5e"
                  fill="url(#gLikes)"
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{ r: 5, fill: '#f43f5e', strokeWidth: 0 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Status Breakdown */}
        <section className="rounded-3xl bg-white border border-white/80 p-6 shadow-xl shadow-slate-100/50 backdrop-blur-sm relative overflow-hidden">
          <div
            className="absolute -bottom-8 -right-8 w-48 h-48 rounded-full blur-3xl opacity-20"
            style={{ background: 'radial-gradient(circle, #c4b5fd, transparent)' }}
          />
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <h2
                className="text-lg font-bold text-gray-900"
                style={{ fontFamily: "'Syne', sans-serif" }}
              >
                Status Breakdown
              </h2>
              <p className="mt-0.5 text-xs text-slate-400 font-medium">
                Appointments & posts distribution
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-xl bg-violet-600 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-white shadow-md shadow-violet-200">
              <Activity size={11} />
              Live
            </span>
          </div>
          <div className="space-y-6">
            <StatusMeter
              title="Appointments"
              items={appointmentStatusCounts}
              barColors={['#059669', '#f59e0b', '#ef4444', '#6b7280']}
            />
            <StatusMeter
              title="Posts"
              items={postStatusCounts}
              barColors={['#7c3aed', '#0ea5e9', '#f43f5e', '#64748b']}
            />
          </div>
        </section>
      </motion.div>

      {/* ── Recent Activity ── */}
      <motion.div variants={item} className="grid gap-5 xl:grid-cols-3">
        <ListCard
          title="Appointments"
          count={recentAppointments.length}
          icon={<Clock size={16} />}
          accent="from-amber-500 to-orange-400"
          glowColor="amber"
        >
          {recentAppointments.length > 0 ? (
            recentAppointments.map((a) => (
              <ItemCard
                key={a.id}
                title={a.user_fullname || 'Unknown'}
                accentColor="#f59e0b"
              >
                <p className="text-xs text-slate-500 line-clamp-2">
                  {a.reason || 'No reason provided'}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span className="text-[11px] text-slate-400">
                    {new Date(a.date).toLocaleDateString()}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {a.start_time || ''}
                  </span>
                  <StatusBadge status={a.status} />
                </div>
              </ItemCard>
            ))
          ) : (
            <EmptyState text="No recent appointments" />
          )}
        </ListCard>

        <ListCard
          title="Recent Posts"
          count={recentPosts.length}
          icon={<MessageSquare size={16} />}
          accent="from-emerald-500 to-teal-400"
          glowColor="emerald"
        >
          {recentPosts.length > 0 ? (
            recentPosts.map((post) => (
              <ItemCard
                key={post.id}
                title={post.title || 'Untitled post'}
                accentColor="#059669"
              >
                <p className="text-xs text-slate-500 line-clamp-2">
                  {post.content
                    ? `${post.content.slice(0, 120)}${post.content.length > 120 ? '…' : ''}`
                    : 'No content available'}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span className="text-[11px] text-slate-400">
                    {new Date(post.created_at).toLocaleDateString()}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] text-rose-400 font-semibold">
                    <Heart size={10} className="fill-rose-400" />
                    {post.likes ?? 0}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] text-violet-400 font-semibold">
                    <MessageCircle size={10} />
                    {post.comments ?? 0}
                  </span>
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                    {post.status ?? 'post'}
                  </span>
                </div>
              </ItemCard>
            ))
          ) : (
            <EmptyState text="No recent posts" />
          )}
        </ListCard>

        <ListCard
          title="Comments"
          count={recentComments.length}
          icon={<MessageCircle size={16} />}
          accent="from-violet-500 to-purple-400"
          glowColor="violet"
        >
          {recentComments.length > 0 ? (
            recentComments.map((c) => (
              <ItemCard
                key={c.id}
                title={c.commenter_name || 'Anonymous'}
                accentColor="#7c3aed"
              >
                <p className="text-xs text-slate-600 line-clamp-2">
                  {c.comment || 'No comment text'}
                </p>
                <p className="mt-2 text-[11px] text-slate-400 line-clamp-1">
                  On:{' '}
                  {c.post_content
                    ? `${c.post_content.slice(0, 70)}${c.post_content.length > 70 ? '…' : ''}`
                    : 'Unknown post'}
                </p>
              </ItemCard>
            ))
          ) : (
            <EmptyState text="No recent comments" />
          )}
        </ListCard>
      </motion.div>
    </motion.div>
  )
}

/* ─────────────────── Sub-components ─────────────────── */

function MiniSparkline({ values = [], color = '#059669' }) {
  const max = Math.max(...values, 1)
  const w = 64,
    h = 28
  const pts = values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * w
      const y = h - (v / max) * h
      return `${x},${y}`
    })
    .join(' ')
  return (
    <svg width={w} height={h} className="opacity-70">
      <polyline
        points={pts}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function MetricCard({
  title,
  value,
  subtitle,
  icon,
  gradient,
  glow,
  badge,
  sparkline = [],
}) {
  const count = useCounter(value)
  const color = gradient.includes('emerald')
    ? '#059669'
    : gradient.includes('violet')
      ? '#7c3aed'
      : gradient.includes('rose')
        ? '#f43f5e'
        : '#f59e0b'

  return (
    <motion.div
      className={`relative overflow-hidden rounded-3xl bg-white border border-white/80 p-5 shadow-xl ${glow}/30 cursor-default`}
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Subtle gradient background blob */}
      <div
        className={`absolute -top-8 -right-8 h-32 w-32 rounded-full bg-gradient-to-br ${gradient} opacity-10 blur-2xl`}
      />

      <div className="flex items-start justify-between gap-3 relative">
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br ${gradient} text-white shadow-lg`}
        >
          {icon}
        </div>
        <span
          className={`rounded-full ${badge} px-2.5 py-1 text-[10px] font-bold leading-none`}
        >
          {subtitle}
        </span>
      </div>

      <div className="mt-4 relative">
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">
          {title}
        </p>
        <p
          className="mt-1 text-3xl font-black text-gray-900"
          style={{ fontFamily: "'Syne', sans-serif" }}
        >
          {count.toLocaleString()}
        </p>
      </div>

      <div className="mt-3 flex items-end justify-between">
        <MiniSparkline values={sparkline} color={color} />
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-500">
          <ArrowUpRight size={12} />
          +12%
        </span>
      </div>
    </motion.div>
  )
}

function ListCard({ title, count, icon, children, accent, glowColor }) {
  return (
    <section
      className={`rounded-3xl bg-white border border-white/80 p-5 shadow-xl shadow-${glowColor}-100/30 relative overflow-hidden`}
    >
      <div
        className={`absolute -top-10 -right-10 h-32 w-32 rounded-full bg-gradient-to-br ${accent} opacity-10 blur-2xl`}
      />
      <div className="mb-4 flex items-center justify-between gap-3 border-b border-slate-100 pb-4 relative">
        <div className="flex items-center gap-2.5">
          <div
            className={`flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br ${accent} text-white shadow-md`}
          >
            {icon}
          </div>
          <h2
            className="text-sm font-bold text-gray-900"
            style={{ fontFamily: "'Syne', sans-serif" }}
          >
            {title}
          </h2>
        </div>
        <span
          className={`flex h-6 min-w-6 items-center justify-center rounded-full bg-gradient-to-br ${accent} px-2.5 text-[11px] font-black text-white shadow-sm`}
        >
          {count}
        </span>
      </div>
      <div className="space-y-3">{children}</div>
    </section>
  )
}

function ItemCard({ title, children, accentColor }) {
  return (
    <motion.div
      className="rounded-2xl border border-slate-100 bg-slate-50/80 p-3.5 hover:bg-white hover:shadow-md transition-all duration-200 cursor-pointer group"
      whileHover={{ x: 2 }}
    >
      <div className="flex items-start gap-2.5">
        <div
          className="mt-0.5 h-2 w-2 flex-shrink-0 rounded-full"
          style={{ backgroundColor: accentColor }}
        />
        <p className="text-sm font-semibold text-gray-900 leading-snug group-hover:text-gray-700 transition-colors">
          {title}
        </p>
      </div>
      <div className="mt-2 pl-4.5">{children}</div>
    </motion.div>
  )
}

function StatusBadge({ status }) {
  const norm = `${status ?? ''}`.toLowerCase()
  const cfg =
    norm === 'approved'
      ? { bg: 'bg-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-400' }
      : norm === 'pending'
        ? { bg: 'bg-amber-100', text: 'text-amber-700', dot: 'bg-amber-400' }
        : norm === 'rejected'
          ? { bg: 'bg-rose-100', text: 'text-rose-700', dot: 'bg-rose-400' }
          : { bg: 'bg-slate-100', text: 'text-slate-600', dot: 'bg-slate-400' }
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full ${cfg.bg} px-2.5 py-0.5 text-[10px] font-bold ${cfg.text}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
      {status || 'unknown'}
    </span>
  )
}

function EmptyState({ text }) {
  return (
    <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-gradient-to-br from-slate-50 to-white px-4 py-8 text-center">
      <div className="text-2xl mb-2">✨</div>
      <p className="text-xs font-medium text-slate-400">{text}</p>
    </div>
  )
}

function StatusMeter({ title, items, barColors = [] }) {
  const total = items.reduce((sum, i) => sum + Number(i.count || 0), 0)
  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <p
          className="text-sm font-bold text-gray-900"
          style={{ fontFamily: "'Syne', sans-serif" }}
        >
          {title}
        </p>
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-500">
          {total} total
        </span>
      </div>
      <div className="space-y-3">
        {items.map((item, idx) => {
          const count = Number(item.count || 0)
          const pct = total ? Math.round((count / total) * 100) : 0
          const color = barColors[idx % barColors.length] || '#059669'
          return (
            <div key={`${title}-${item.status}`}>
              <div className="mb-1.5 flex items-center justify-between text-xs">
                <span className="capitalize font-medium text-slate-600">
                  {item.status || 'Unknown'}
                </span>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-gray-900">{count}</span>
                  <span className="text-slate-400 text-[10px]">{pct}%</span>
                </div>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                <motion.div
                  className="h-full rounded-full"
                  style={{
                    background: `linear-gradient(90deg, ${color}, ${color}cc)`,
                  }}
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{
                    duration: 1,
                    ease: [0.22, 1, 0.36, 1],
                    delay: idx * 0.1,
                  }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
