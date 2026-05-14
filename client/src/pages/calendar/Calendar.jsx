import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import PublicHeader from '../../components/layout/PublicHeader'
import Footer from '../../components/layout/Footer'
import DynamicToast from '../../components/DynamicToast'
import TutorialGuide from '../../components/TutorialGuide'
import {
  ChevronLeft,
  ChevronRight,
  X,
  Calendar,
  Clock,
  CheckCircle,
  Loader2,
  Sparkles,
  Lock,
  BookOpen,
} from 'lucide-react'

/* ─── Google Fonts ───────────────────────────────────────────────────────── */
if (!document.getElementById('cal-fonts')) {
  const link = document.createElement('link')
  link.id = 'cal-fonts'
  link.rel = 'stylesheet'
  link.href =
    'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap'
  document.head.appendChild(link)
}

/* ─── Styles ─────────────────────────────────────────────────────────────── */
const css = `
  .cal-root {
    --em-900:  #064e3b;
    --em-800:  #065f46;
    --em-700:  #047857;
    --em-600:  #059669;
    --em-500:  #10b981;
    --em-400:  #34d399;
    --em-300:  #6ee7b7;
    --em-100:  #d1fae5;
    --em-50:   #ecfdf5;
    --teal-600:#0d9488;
    --teal-500:#14b8a6;
    --slate-900:#0f172a;
    --slate-800:#1e293b;
    --slate-700:#334155;
    --slate-500:#64748b;
    --slate-400:#94a3b8;
    --slate-200:#e2e8f0;
    --slate-100:#f1f5f9;
    --slate-50: #f8fafc;
    --white:    #ffffff;
    --font: 'Plus Jakarta Sans', system-ui, sans-serif;
    --r-sm: 10px;
    --r-md: 16px;
    --r-lg: 22px;
    --r-xl: 28px;
  }

  .cal-root, .cal-root * {
    font-family: var(--font);
    box-sizing: border-box;
  }

  .cal-bg {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    background: linear-gradient(145deg, #f0fdf8 0%, #ecfdf5 40%, #f0fdfa 100%);
    background-attachment: fixed;
  }

  .cal-accent-bar {
    height: 3px;
    background: linear-gradient(90deg, var(--em-700), var(--teal-500), var(--em-500));
    flex-shrink: 0;
  }

  .cal-card {
    background: var(--white);
    border-radius: var(--r-xl);
    border: 1px solid var(--em-100);
    box-shadow:
      0 1px 3px rgba(16,185,129,.06),
      0 8px 24px rgba(16,185,129,.06),
      0 32px 64px rgba(6,78,59,.06);
    overflow: hidden;
  }

  /* ── Sidebar ── */
  .cal-sidebar {
    background: linear-gradient(160deg, var(--em-800) 0%, var(--em-900) 100%);
    padding: 2rem 1.75rem;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    position: relative;
    overflow: hidden;
    height: 100%;
    min-height: 480px;
  }
  .cal-sidebar::before {
    content: '';
    position: absolute;
    top: -60px; right: -60px;
    width: 200px; height: 200px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(52,211,153,.15) 0%, transparent 70%);
    pointer-events: none;
  }
  .cal-sidebar::after {
    content: '';
    position: absolute;
    bottom: -40px; left: -40px;
    width: 160px; height: 160px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(20,184,166,.12) 0%, transparent 70%);
    pointer-events: none;
  }

  .cal-sidebar-badge {
    display: inline-flex;
    align-items: center;
    gap: .5rem;
    background: rgba(52,211,153,.15);
    border: 1px solid rgba(52,211,153,.25);
    border-radius: 99px;
    padding: .3rem .75rem;
    width: fit-content;
  }
  .cal-sidebar-badge-dot {
    width: 7px; height: 7px;
    border-radius: 50%;
    background: var(--em-400);
  }
  .cal-sidebar-badge-text {
    font-size: .65rem;
    font-weight: 700;
    letter-spacing: .18em;
    text-transform: uppercase;
    color: var(--em-300);
  }

  .cal-sidebar-title {
    font-size: 1.65rem;
    font-weight: 800;
    color: var(--white);
    line-height: 1.2;
    position: relative;
  }
  .cal-sidebar-sub {
    font-size: .8rem;
    color: rgba(255,255,255,.45);
    margin-top: .4rem;
    line-height: 1.65;
    font-weight: 400;
  }

  .cal-right-panel {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 1.75rem;
    min-height: 480px;
  }

  .cal-right-panel-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 1rem;
    flex-wrap: wrap;
  }

  .cal-right-panel-title {
    font-size: 1.35rem;
    font-weight: 800;
    color: var(--slate-900);
    line-height: 1.2;
  }

  .cal-right-panel-sub {
    font-size: .88rem;
    color: var(--slate-500);
    line-height: 1.6;
    margin-top: .35rem;
  }

  .cal-appointment-list {
    display: flex;
    flex-direction: column;
    gap: .75rem;
    overflow-y: auto;
    min-height: 0;
    max-height: calc(100vh - 420px);
    padding-right: .2rem;
  }

  .cal-appointment-card {
    background: var(--slate-50);
    border: 1px solid var(--slate-200);
    border-radius: var(--r-sm);
    padding: 1rem 1rem;
    cursor: pointer;
    transition: all .15s;
    text-align: left;
    width: 100%;
  }

  .cal-appointment-card:hover {
    background: var(--white);
    transform: translateY(-1px);
    box-shadow: 0 10px 24px rgba(16,185,129,.08);
  }

  .cal-appointment-card-top {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: .75rem;
    flex-wrap: wrap;
  }

  .cal-appointment-date {
    font-size: .95rem;
    font-weight: 700;
    color: var(--slate-900);
  }

  .cal-appointment-time {
    margin-top: .25rem;
    font-size: .82rem;
    color: var(--slate-500);
  }

  .cal-appointment-reason {
    margin-top: .6rem;
    font-size: .82rem;
    color: var(--slate-600);
    line-height: 1.5;
  }

  .cal-appointment-status {
    font-size: .65rem;
    font-weight: 700;
    text-transform: uppercase;
    padding: .32rem .65rem;
    border-radius: 999px;
    white-space: nowrap;
    display: inline-flex;
    align-items: center;
  }

  .cal-appointment-status.pending {
    background: #facc15;
    color: #92400e;
  }

  .cal-appointment-status.approved {
    background: #34d399;
    color: #065f46;
  }

  .cal-appointment-status.rejected {
    background: #dc2626;
    color: #ffffff;
  }

  .cal-appointment-empty {
    padding: 1.25rem;
    text-align: center;
    color: var(--slate-400);
    font-size: .9rem;
    background: var(--slate-50);
    border: 1px dashed var(--slate-200);
    border-radius: var(--r-sm);
  }

  .cal-stat {
    background: rgba(255,255,255,.06);
    border: 1px solid rgba(255,255,255,.1);
    border-radius: var(--r-md);
    padding: 1.1rem 1.25rem;
    position: relative;
  }
  .cal-stat-label {
    font-size: .65rem;
    font-weight: 700;
    letter-spacing: .18em;
    text-transform: uppercase;
    color: var(--em-300);
  }
  .cal-stat-value {
    font-size: 2rem;
    font-weight: 800;
    color: var(--white);
    margin-top: .3rem;
    line-height: 1;
  }
  .cal-stat-hint {
    font-size: .72rem;
    color: white;
    margin-top: .3rem;
    font-weight: 400;
  }

  .cal-selected-stat {
    background: rgba(16,185,129,.12);
    border: 1px solid rgba(52,211,153,.25);
    border-radius: var(--r-md);
    padding: 1.1rem 1.25rem;
  }
  .cal-selected-stat .cal-stat-value {
    font-size: 1rem;
    color: var(--em-300);
    font-weight: 600;
  }
  .cal-selected-stat .cal-stat-hint { color: white; }

  .cal-steps {
    border-top: 1px solid rgba(255,255,255,.08);
    padding-top: 1.25rem;
    margin-top: auto;
  }
  .cal-steps-label {
    font-size: .65rem;
    font-weight: 700;
    letter-spacing: .18em;
    text-transform: uppercase;
    color: white;
    margin-bottom: .875rem;
  }
  .cal-step {
    display: flex;
    align-items: flex-start;
    gap: .75rem;
    margin-bottom: .625rem;
    font-size: .78rem;
    color: white;
    line-height: 1.55;
    font-weight: 400;
  }
  .cal-step-num {
    width: 20px; height: 20px;
    border-radius: 50%;
    background: rgba(16,185,129,.2);
    border: 1px solid rgba(52,211,153,.3);
    display: flex; align-items: center; justify-content: center;
    font-size: .6rem;
    font-weight: 700;
    color: var(--em-300);
    flex-shrink: 0;
    margin-top: 1px;
  }

  /* ── Calendar main ── */
  .cal-main {
    padding: 2rem;
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }

  .cal-nav {
    display: flex;
    align-items: center;
    gap: 1rem;
  }
  .cal-nav-arrow {
    width: 38px; height: 38px;
    border-radius: 50%;
    border: 1.5px solid var(--slate-200);
    background: var(--white);
    color: var(--slate-500);
    display: flex; align-items: center; justify-content: center;
    cursor: pointer;
    transition: all .15s;
    flex-shrink: 0;
  }
  .cal-nav-arrow:hover {
    background: var(--em-600);
    border-color: var(--em-600);
    color: var(--white);
    box-shadow: 0 4px 12px rgba(16,185,129,.3);
  }
  .cal-nav-month {
    flex: 1;
    font-size: 1.4rem;
    font-weight: 800;
    color: var(--slate-900);
    text-align: center;
  }
  .cal-nav-jump {
    display: flex;
    align-items: center;
    gap: .45rem;
    border: 1.5px solid var(--slate-200);
    border-radius: 99px;
    padding: .35rem .875rem;
    background: var(--slate-50);
    transition: border-color .15s;
  }
  .cal-nav-jump:focus-within {
    border-color: var(--em-500);
    background: var(--white);
  }
  .cal-nav-jump-label {
    font-size: .62rem;
    font-weight: 700;
    letter-spacing: .15em;
    text-transform: uppercase;
    color: var(--slate-400);
    white-space: nowrap;
  }
  .cal-nav-jump input {
    background: transparent;
    border: none;
    outline: none;
    font-size: .8rem;
    color: var(--slate-900);
    font-family: var(--font);
    font-weight: 500;
    width: 110px;
  }

  .cal-day-headers {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 3px;
  }
  .cal-day-hdr {
    text-align: center;
    font-size: .62rem;
    font-weight: 700;
    letter-spacing: .14em;
    text-transform: uppercase;
    color: var(--slate-400);
    padding: .25rem 0;
  }

  .cal-grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 3px;
  }

  .cal-cell {
    border-radius: var(--r-sm);
    min-height: 80px;
    border: 1.5px solid transparent;
    transition: all .15s;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    padding: .5rem .5rem .4rem;
    text-align: left;
    background: var(--slate-50);
    position: relative;
    overflow: hidden;
  }
  .cal-cell-empty {
    background: transparent !important;
    border-color: transparent !important;
    cursor: default;
    pointer-events: none;
  }
  .cal-cell-default:hover {
    background: var(--white);
    border-color: var(--em-300);
    box-shadow: 0 2px 10px rgba(16,185,129,.1);
    transform: translateY(-1px);
  }
  .cal-cell-booked {
    background: var(--em-50);
    border-color: var(--em-300);
  }
  .cal-cell-booked::after {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 3px;
    background: linear-gradient(90deg, var(--em-500), var(--teal-500));
  }
  .cal-cell-booked:hover {
    border-color: var(--em-500);
    box-shadow: 0 2px 12px rgba(16,185,129,.15);
    transform: translateY(-1px);
  }
  .cal-cell-today {
    background: linear-gradient(145deg, var(--em-600), var(--teal-600));
    border-color: transparent !important;
    box-shadow: 0 4px 16px rgba(16,185,129,.35);
  }
  .cal-cell-today:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(16,185,129,.4);
  }
  .cal-cell-selected {
    border-color: var(--em-500) !important;
    box-shadow: 0 0 0 3px rgba(16,185,129,.15) !important;
  }

  .cal-cell-num {
    font-size: .8rem;
    font-weight: 700;
    color: var(--slate-800);
    line-height: 1;
  }
  .cal-cell-today .cal-cell-num { color: rgba(255,255,255,.95); }

  .cal-cell-badge {
    position: absolute;
    top: .35rem; right: .35rem;
    width: 18px; height: 18px;
    border-radius: 50%;
    background: var(--em-600);
    color: var(--white);
    font-size: .58rem;
    font-weight: 800;
    display: flex; align-items: center; justify-content: center;
  }
  .cal-cell-today .cal-cell-badge { background: rgba(255,255,255,.25); }

  .cal-cell-sub {
    margin-top: auto;
    font-size: .58rem;
    font-weight: 600;
    color: var(--em-700);
    letter-spacing: .04em;
  }
  .cal-cell-today .cal-cell-sub { color: rgba(255,255,255,.6); }

  .cal-legend {
    display: flex;
    align-items: center;
    gap: 1.25rem;
    flex-wrap: wrap;
    padding-top: 1rem;
    border-top: 1px solid var(--slate-200);
  }
  .cal-legend-item {
    display: flex;
    align-items: center;
    gap: .45rem;
    font-size: .73rem;
    font-weight: 500;
    color: var(--slate-500);
  }
  .cal-legend-swatch {
    width: 12px; height: 12px;
    border-radius: 3px;
    flex-shrink: 0;
  }

  /* ── Backdrop ── */
  .cal-backdrop {
    position: fixed; inset: 0;
    background: rgba(6,78,59,.45);
    backdrop-filter: blur(6px);
    z-index: 50;
    display: flex; align-items: center; justify-content: center;
    padding: 1rem;
  }

  .cal-modal {
    background: var(--white);
    border-radius: var(--r-lg);
    width: 100%;
    max-width: 420px;
    overflow: hidden;
    box-shadow: 0 32px 80px rgba(6,78,59,.25), 0 0 0 1px rgba(16,185,129,.12);
  }

  .cal-modal-hd {
    background: linear-gradient(135deg, var(--em-700) 0%, var(--teal-600) 100%);
    padding: 1.5rem 1.5rem 1.35rem;
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 1rem;
    position: relative;
    overflow: hidden;
  }
  .cal-modal-hd::before {
    content: '';
    position: absolute;
    top: -30px; right: -30px;
    width: 120px; height: 120px;
    border-radius: 50%;
    background: rgba(255,255,255,.07);
    pointer-events: none;
  }
  .cal-modal-hd-title {
    font-size: 1.2rem;
    font-weight: 800;
    color: var(--white);
    position: relative;
  }
  .cal-modal-hd-sub {
    font-size: .73rem;
    color: rgba(255,255,255,.6);
    margin-top: .2rem;
    font-weight: 400;
    position: relative;
  }
  .cal-modal-x {
    width: 30px; height: 30px;
    border-radius: 50%;
    border: 1px solid rgba(255,255,255,.2);
    background: rgba(255,255,255,.1);
    color: rgba(255,255,255,.8);
    display: flex; align-items: center; justify-content: center;
    cursor: pointer;
    flex-shrink: 0;
    transition: all .15s;
    position: relative;
  }
  .cal-modal-x:hover { background: rgba(255,255,255,.2); color: var(--white); }

  .cal-modal-body { padding: 1.5rem; }

  .cal-slot {
    display: flex;
    align-items: flex-start;
    gap: .75rem;
    padding: .8rem 1rem;
    background: var(--em-50);
    border: 1px solid var(--em-100);
    border-radius: var(--r-sm);
    margin-bottom: .5rem;
  }
  .cal-slot-icon {
    width: 30px; height: 30px;
    border-radius: 50%;
    background: rgba(16,185,129,.15);
    border: 1px solid rgba(16,185,129,.2);
    display: flex; align-items: center; justify-content: center;
    color: var(--em-600);
    flex-shrink: 0;
  }
  .cal-slot-time {
    font-size: .83rem;
    font-weight: 700;
    color: var(--slate-900);
  }
  .cal-slot-reason {
    font-size: .73rem;
    color: var(--slate-500);
    margin-top: .15rem;
    font-weight: 400;
  }

  .cal-empty-day {
    text-align: center;
    padding: 1.5rem 1rem;
    background: var(--slate-50);
    border: 1.5px dashed var(--slate-200);
    border-radius: var(--r-sm);
    color: var(--slate-400);
    font-size: .82rem;
    font-weight: 500;
  }

  .cal-field { display: flex; flex-direction: column; gap: .35rem; }
  .cal-label {
    font-size: .67rem;
    font-weight: 700;
    letter-spacing: .12em;
    text-transform: uppercase;
    color: var(--slate-500);
  }
  .cal-input {
    width: 100%;
    padding: .6rem .875rem;
    border: 1.5px solid var(--slate-200);
    border-radius: var(--r-sm);
    font-size: .875rem;
    font-weight: 500;
    color: var(--slate-900);
    font-family: var(--font);
    background: var(--slate-50);
    outline: none;
    transition: all .15s;
  }
  .cal-input:focus {
    border-color: var(--em-500);
    background: var(--white);
    box-shadow: 0 0 0 3px rgba(16,185,129,.12);
  }
  textarea.cal-input { resize: none; }

  .cal-date-pill {
    display: inline-flex;
    align-items: center;
    gap: .5rem;
    background: var(--em-50);
    border: 1px solid var(--em-100);
    border-radius: 99px;
    padding: .4rem .9rem;
    font-size: .8rem;
    font-weight: 700;
    color: var(--em-700);
  }

  .cal-time-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: .75rem;
  }

  .cal-btn-primary {
    width: 100%;
    padding: .75rem 1.25rem;
    background: linear-gradient(135deg, var(--em-600) 0%, var(--teal-600) 100%);
    color: var(--white);
    border: none;
    border-radius: var(--r-sm);
    font-size: .875rem;
    font-weight: 700;
    font-family: var(--font);
    cursor: pointer;
    display: flex; align-items: center; justify-content: center; gap: .5rem;
    transition: all .18s;
    box-shadow: 0 4px 14px rgba(16,185,129,.25);
  }
  .cal-btn-primary:hover {
    transform: translateY(-1px);
    box-shadow: 0 8px 22px rgba(16,185,129,.35);
  }
  .cal-btn-primary:disabled { opacity: .55; cursor: not-allowed; transform: none; box-shadow: none; }

  .cal-btn-ghost {
    flex: 1;
    padding: .72rem 1.25rem;
    background: var(--white);
    color: var(--slate-700);
    border: 1.5px solid var(--slate-200);
    border-radius: var(--r-sm);
    font-size: .875rem;
    font-weight: 600;
    font-family: var(--font);
    cursor: pointer;
    transition: all .15s;
  }
  .cal-btn-ghost:hover { background: var(--slate-50); border-color: var(--slate-300); }

  .cal-btn-submit {
    flex: 1;
    padding: .72rem 1.25rem;
    background: linear-gradient(135deg, var(--em-600) 0%, var(--teal-600) 100%);
    color: var(--white);
    border: none;
    border-radius: var(--r-sm);
    font-size: .875rem;
    font-weight: 700;
    font-family: var(--font);
    cursor: pointer;
    display: flex; align-items: center; justify-content: center; gap: .5rem;
    transition: all .18s;
    box-shadow: 0 4px 14px rgba(16,185,129,.25);
  }
  .cal-btn-submit:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(16,185,129,.35); }
  .cal-btn-submit:disabled { opacity: .55; cursor: not-allowed; transform: none; box-shadow: none; }
`

export default function CalendarPage() {
  const navigate = useNavigate()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [appointments, setAppointments] = useState([])
  const [selectedDay, setSelectedDay] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [showDayModal, setShowDayModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)
  const [homePageSettings, setHomePageSettings] = useState(null)
  const [formData, setFormData] = useState({
    reason: '',
    notes: '',
    startTime: '09:00',
    endTime: '10:00',
  })
  const [submitting, setSubmitting] = useState(false)
  const [toast, setToast] = useState(null)
  const [dayAppointments, setDayAppointments] = useState([])
  const [userAppointments, setUserAppointments] = useState([])
  const [selectedAppointment, setSelectedAppointment] = useState(null)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showCalendarTutorial, setShowCalendarTutorial] = useState(false)

  const calendarTutorialSteps = [
    {
      selector: '#tutorial-calendar-nav',
      title: 'Navigate months',
      description:
        'Use the left and right arrows to move through months and locate the date you want to book.',
      placement: 'bottom',
    },
    {
      selector: '#tutorial-calendar-grid',
      title: 'Pick a date',
      description:
        'Click any available date to see appointment slots and start booking.',
      placement: 'right',
    },
    {
      selector: '#tutorial-calendar-appointments',
      title: 'Review your bookings',
      description:
        'Your confirmed or pending appointments appear here for quick access.',
      placement: 'left',
    },
  ]

  useEffect(() => {
    if (!document.getElementById('cal-styles')) {
      const el = document.createElement('style')
      el.id = 'cal-styles'
      el.textContent = css
      document.head.appendChild(el)
    }
  }, [])

  useEffect(() => {
    const token =
      localStorage.getItem('token') ||
      localStorage.getItem('userToken') ||
      localStorage.getItem('adminToken')
    const userData = localStorage.getItem('user')
    setIsLoggedIn(!!token)
    if (userData) {
      try {
        setCurrentUser(JSON.parse(userData))
      } catch {
        setCurrentUser(null)
      }
    }
  }, [])

  useEffect(() => {
    fetchAppointments()
    fetchHomePageSettings()
  }, [])

  useEffect(() => {
    const userId = currentUser?.id || currentUser?.mu_id
    if (userId) {
      fetchUserAppointments(userId)
    }
  }, [currentUser])

  const fetchHomePageSettings = async () => {
    try {
      const timestamp = new Date().getTime()
      const response = await fetch(
        `${import.meta.env.VITE_SERVER_LINK}/api/home-page-settings?t=${timestamp}`,
        { cache: 'no-cache' },
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

  const fetchUserAppointments = async (userId) => {
    if (!userId) return
    try {
      const token =
        localStorage.getItem('token') ||
        localStorage.getItem('userToken') ||
        localStorage.getItem('adminToken')
      const response = await fetch(
        `${import.meta.env.VITE_SERVER_LINK}/api/appointments?mu_id=${encodeURIComponent(
          userId,
        )}`,
        { headers: token ? { Authorization: `Bearer ${token}` } : {} },
      )
      if (response.ok) {
        const result = await response.json()
        const userAppts = (result.data || []).map((apt) => ({
          ...apt,
          date: normalizeAppointmentDate(apt.date),
        }))
        setUserAppointments(userAppts)
      }
    } catch (error) {
      console.error('Error fetching user appointments:', error)
    }
  }

  const normalizeAppointmentDate = (value) => {
    if (!value) return value
    if (typeof value === 'string') {
      const m = value.match(/^(\d{4}-\d{2}-\d{2})/)
      return m ? m[1] : value
    }
    if (value instanceof Date && !Number.isNaN(value.getTime())) {
      const y = value.getFullYear()
      const mo = String(value.getMonth() + 1).padStart(2, '0')
      const d = String(value.getDate()).padStart(2, '0')
      return `${y}-${mo}-${d}`
    }
    return String(value)
  }

  const fetchAppointments = async () => {
    try {
      setLoading(true)
      const token =
        localStorage.getItem('token') ||
        localStorage.getItem('userToken') ||
        localStorage.getItem('adminToken')
      const response = await fetch(
        `${import.meta.env.VITE_SERVER_LINK}/api/appointments`,
        { headers: token ? { Authorization: `Bearer ${token}` } : {} },
      )
      if (response.ok) {
        const result = await response.json()
        const approved = (result.data || [])
          .map((apt) => ({ ...apt, date: normalizeAppointmentDate(apt.date) }))
          .filter((apt) => apt.status === 'approved')
        setAppointments(approved)
      }
    } catch (error) {
      console.error('Error fetching appointments:', error)
    } finally {
      setLoading(false)
    }
  }

  const getDaysInMonth = (date) =>
    new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()

  const getFirstDayOfMonth = (date) =>
    new Date(date.getFullYear(), date.getMonth(), 1).getDay()

  const handlePrevMonth = () =>
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))

  const handleNextMonth = () =>
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))

  const formatDateString = (day) => {
    const y = currentDate.getFullYear()
    const mo = String(currentDate.getMonth() + 1).padStart(2, '0')
    const d = String(day).padStart(2, '0')
    return `${y}-${mo}-${d}`
  }

  const getAppointmentsForDay = (day) => {
    const dateStr = formatDateString(day)
    return appointments.filter((apt) => apt.date === dateStr)
  }

  const hasConflict = (day, startTime, endTime) => {
    const dateStr = formatDateString(day)
    return appointments
      .filter((apt) => apt.date === dateStr)
      .some((apt) => startTime < apt.end_time && endTime > apt.start_time)
  }

  const handleDayClick = (day) => {
    if (!isLoggedIn) {
      setShowLoginModal(true)
      return
    }
    setDayAppointments(getAppointmentsForDay(day))
    setSelectedDay(day)
    setShowDayModal(true)
  }

  const handleLogin = () => {
    setShowLoginModal(false)
    navigate('/login')
  }

  const closeLoginModal = () => {
    setShowLoginModal(false)
  }

  const handleBookClick = () => {
    setShowDayModal(false)
    setShowModal(true)
  }

  const handleSubmitAppointment = async (e) => {
    e.preventDefault()
    if (!formData.reason.trim()) {
      setToast({ type: 'error', message: 'Please enter appointment reason' })
      return
    }
    if (hasConflict(selectedDay, formData.startTime, formData.endTime)) {
      setToast({
        type: 'error',
        message: 'There is already an appointment at that time',
      })
      return
    }
    try {
      setSubmitting(true)
      const token =
        localStorage.getItem('token') ||
        localStorage.getItem('userToken') ||
        localStorage.getItem('adminToken')
      const response = await fetch(
        `${import.meta.env.VITE_SERVER_LINK}/api/appointments`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            app_mu_id: currentUser?.id || currentUser?.mu_id,
            app_date: formatDateString(selectedDay),
            app_start_time: formData.startTime,
            app_end_time: formData.endTime,
            app_reason: formData.reason,
            app_notes: formData.notes,
          }),
        },
      )
      if (response.ok) {
        setToast({
          type: 'success',
          message: 'Appointment requested! Awaiting admin approval.',
        })
        setFormData({ reason: '', notes: '', startTime: '09:00', endTime: '10:00' })
        setSelectedDay(null)
        setShowModal(false)
        fetchAppointments()
        const userId = currentUser?.id || currentUser?.mu_id
        if (userId) fetchUserAppointments(userId)
      } else {
        const error = await response.json()
        setToast({
          type: 'error',
          message: error.message || 'Failed to book appointment',
        })
      }
    } catch {
      setToast({ type: 'error', message: 'Error booking appointment' })
    } finally {
      setSubmitting(false)
    }
  }

  const daysInMonth = getDaysInMonth(currentDate)
  const firstDay = getFirstDayOfMonth(currentDate)
  const monthName = currentDate.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  })
  const monthInputValue = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`

  const handleMonthChange = (e) => {
    const [year, month] = e.target.value.split('-').map(Number)
    if (year && month) setCurrentDate(new Date(year, month - 1, 1))
  }

  const calendarDays = []
  for (let i = 0; i < firstDay; i++) calendarDays.push(null)
  for (let i = 1; i <= daysInMonth; i++) calendarDays.push(i)

  const today = new Date()

  return (
    <div className="cal-root cal-bg">
      <div className="cal-accent-bar" />
      <PublicHeader />
      <TutorialGuide
        isOpen={showCalendarTutorial}
        onClose={() => setShowCalendarTutorial(false)}
        steps={calendarTutorialSteps}
        initialStep={0}
      />

      <main style={{ flex: 1, overflowY: 'auto', padding: '2rem 1.25rem' }}>
        <div style={{ maxWidth: 1600, margin: '0 auto', height: '90vh' }}>
          <style>{`
            @media(min-width:900px){
              .cal-layout{ grid-template-columns: 280px minmax(0,1fr) 320px !important; }
            }
          `}</style>
          <style
            dangerouslySetInnerHTML={{
              __html: `
              .custom-scrollbar::-webkit-scrollbar { width: 5px; }
              .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
              .custom-scrollbar::-webkit-scrollbar-thumb { background: #10b981; border-radius: 10px; }
              .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #059669; }
              .row-checkbox { width: 15px; height: 15px; accent-color: #10b981; cursor: pointer; }
            `,
            }}
          />

          <div
            className="cal-layout"
            style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.25rem' }}
          >
            {/* ── Sidebar ── */}
            <div className="cal-card">
              <div className="cal-sidebar">
                <div className="cal-sidebar-badge">
                  <div className="cal-sidebar-badge-dot" />
                  <span className="cal-sidebar-badge-text">Scheduler</span>
                </div>

                <div>
                  <div className="cal-sidebar-title">
                    Appointment
                    <br />
                    Calendar
                  </div>
                  <div className="cal-sidebar-sub">
                    Pick a date, review available slots, and submit your booking
                    request.
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowCalendarTutorial(true)}
                    className="mt-4 animate-bounce inline-flex items-center justify-center gap-2 rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-lg transition hover:bg-emerald-700"
                  >
                    <BookOpen size={16} className="text-white" />
                    Start calendar tour
                  </button>
                </div>

                <div className="cal-stat">
                  <div className="cal-stat-label">Approved this month</div>
                  <div className="cal-stat-value">
                    {loading ? '–' : appointments.length}
                  </div>
                  <div className="cal-stat-hint">Confirmed appointments</div>
                </div>

                <div className="cal-selected-stat">
                  <div className="cal-stat-label">Selected date</div>
                  <div className="cal-stat-value">
                    {selectedDay ? formatDateString(selectedDay) : 'None selected'}
                  </div>
                  <div className="cal-stat-hint text-white">
                    Click any date on the grid
                  </div>
                </div>

                <div className="cal-steps">
                  <div className="cal-steps-label">How it works</div>
                  {[
                    'Pick a date to see already-booked slots.',
                    'Choose a time range and enter your reason.',
                    'Submit and await admin approval.',
                    'Approved slots appear in the calendar instantly.',
                  ].map((step, i) => (
                    <div key={i} className="cal-step">
                      <div className="cal-step-num">{i + 1}</div>
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Calendar ── */}
            <div className="cal-card">
              <div className="cal-main">
                {/* Month nav */}
                <div className="cal-nav" id="tutorial-calendar-nav">
                  <button
                    type="button"
                    className="cal-nav-arrow"
                    onClick={handlePrevMonth}
                    aria-label="Previous month"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <div className="cal-nav-month">{monthName}</div>
                  <button
                    type="button"
                    className="cal-nav-arrow"
                    onClick={handleNextMonth}
                    aria-label="Next month"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>

                {/* Subtitle + jump */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '.5rem',
                  }}
                >
                  <p
                    style={{
                      fontSize: '.78rem',
                      color: 'var(--slate-400)',
                      fontWeight: 500,
                      margin: 0,
                    }}
                  ></p>
                  <label className="cal-nav-jump">
                    <span className="cal-nav-jump-label">Jump to</span>
                    <input
                      type="month"
                      value={monthInputValue}
                      onChange={handleMonthChange}
                    />
                  </label>
                </div>

                {/* Day headers */}
                <div className="cal-day-headers">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                    <div key={d} className="cal-day-hdr">
                      {d}
                    </div>
                  ))}
                </div>

                {/* Grid */}
                <div className="cal-grid" id="tutorial-calendar-grid">
                  {calendarDays.map((day, idx) => {
                    if (!day)
                      return <div key={idx} className="cal-cell cal-cell-empty" />

                    const dayAppts = getAppointmentsForDay(day)
                    const isToday =
                      day === today.getDate() &&
                      currentDate.getMonth() === today.getMonth() &&
                      currentDate.getFullYear() === today.getFullYear()
                    const isSelected = day === selectedDay

                    let cls = 'cal-cell'
                    if (isToday) cls += ' cal-cell-today'
                    else if (dayAppts.length > 0) cls += ' cal-cell-booked'
                    else cls += ' cal-cell-default'
                    if (isSelected && !isToday) cls += ' cal-cell-selected'

                    return (
                      <motion.button
                        key={idx}
                        className={cls}
                        onClick={() => handleDayClick(day)}
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.96 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start',
                          }}
                        >
                          <span className="cal-cell-num">{day}</span>
                          {dayAppts.length > 0 && (
                            <span className="cal-cell-badge">{dayAppts.length}</span>
                          )}
                        </div>
                        {dayAppts.length > 0 && (
                          <div className="cal-cell-sub">
                            {dayAppts.length} booked
                          </div>
                        )}
                      </motion.button>
                    )
                  })}
                </div>

                {/* Legend */}
                <div className="cal-legend">
                  <div className="cal-legend-item">
                    <div
                      className="cal-legend-swatch"
                      style={{
                        background: 'linear-gradient(135deg,#059669,#0d9488)',
                      }}
                    />
                    Today
                  </div>
                  <div className="cal-legend-item">
                    <div
                      className="cal-legend-swatch"
                      style={{
                        background: '#ecfdf5',
                        border: '1.5px solid #6ee7b7',
                      }}
                    />
                    Has appointments
                  </div>
                  <div className="cal-legend-item">
                    <div
                      className="cal-legend-swatch"
                      style={{
                        background: '#f8fafc',
                        border: '1.5px solid #e2e8f0',
                      }}
                    />
                    Available
                  </div>
                </div>
              </div>
            </div>

            {/* ── My appointments ── */}
            <div className="cal-card" id="tutorial-calendar-appointments">
              <div className="cal-right-panel">
                <div className="cal-right-panel-header">
                  <div>
                    <div className="cal-right-panel-title">My Appointments</div>
                    <div className="cal-right-panel-sub">
                      All your bookings, including pending and rejected requests.
                    </div>
                  </div>
                  <div className="cal-sidebar-badge">
                    <div className="cal-sidebar-badge-dot" />
                    <span className="cal-sidebar-badge-text">
                      {userAppointments.length} item
                      {userAppointments.length === 1 ? '' : 's'}
                    </span>
                  </div>
                </div>

                {isLoggedIn ? (
                  <div className="cal-appointment-list custom-scrollbar">
                    {userAppointments.length === 0 ? (
                      <div className="cal-appointment-empty">
                        No appointments found. Pick a date to request a booking.
                      </div>
                    ) : (
                      userAppointments.map((apt) => (
                        <button
                          key={apt.id}
                          type="button"
                          className="cal-appointment-card"
                          onClick={() => setSelectedAppointment(apt)}
                        >
                          <div className="cal-appointment-card-top">
                            <div>
                              <div className="cal-appointment-date">{apt.date}</div>
                              <div className="cal-appointment-time">
                                {apt.start_time} — {apt.end_time}
                              </div>
                            </div>
                            <span
                              className={`cal-appointment-status ${apt.status || 'pending'}`}
                            >
                              {apt.status
                                ? apt.status.charAt(0).toUpperCase() +
                                  apt.status.slice(1)
                                : 'Pending'}
                            </span>
                          </div>
                          <div className="cal-appointment-reason">
                            {apt.reason || 'No reason provided'}
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                ) : (
                  <div className="cal-appointment-empty">
                    Sign in to see your appointments and details.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ── Day Modal ── */}
      <AnimatePresence>
        {showDayModal && (
          <motion.div
            className="cal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="cal-modal"
              initial={{ scale: 0.93, opacity: 0, y: 14 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.93, opacity: 0, y: 14 }}
              transition={{ type: 'spring', stiffness: 360, damping: 28 }}
            >
              <div className="cal-modal-hd">
                <div>
                  <div className="cal-modal-hd-title">
                    {selectedDay && formatDateString(selectedDay)}
                  </div>
                  <div className="cal-modal-hd-sub">
                    {dayAppointments.length === 0
                      ? 'No bookings — this day is open'
                      : `${dayAppointments.length} slot${dayAppointments.length > 1 ? 's' : ''} already booked`}
                  </div>
                </div>
                <button
                  className="cal-modal-x"
                  onClick={() => setShowDayModal(false)}
                >
                  <X size={14} />
                </button>
              </div>

              <div className="cal-modal-body">
                {dayAppointments.length > 0 ? (
                  <div style={{ marginBottom: '1.125rem' }}>
                    <div
                      style={{
                        fontSize: '.65rem',
                        fontWeight: 700,
                        letterSpacing: '.12em',
                        textTransform: 'uppercase',
                        color: 'var(--slate-400)',
                        marginBottom: '.625rem',
                      }}
                    >
                      Booked slots
                    </div>
                    {dayAppointments.map((apt, idx) => (
                      <div key={idx} className="cal-slot">
                        <div className="cal-slot-icon">
                          <Clock size={13} />
                        </div>
                        <div>
                          <div className="cal-slot-time">
                            {apt.start_time} – {apt.end_time}
                          </div>
                          <div className="cal-slot-reason">
                            {apt.reason || 'No reason provided'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div
                    className="cal-empty-day"
                    style={{ marginBottom: '1.125rem' }}
                  >
                    <Calendar
                      size={22}
                      style={{
                        color: 'var(--slate-300)',
                        margin: '0 auto .4rem',
                        display: 'block',
                      }}
                    />
                    No appointments on this date
                  </div>
                )}

                <button className="cal-btn-primary" onClick={handleBookClick}>
                  <Sparkles size={14} />
                  Book an appointment
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Book Modal ── */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            className="cal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="cal-modal"
              style={{ maxWidth: 460 }}
              initial={{ scale: 0.93, opacity: 0, y: 14 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.93, opacity: 0, y: 14 }}
              transition={{ type: 'spring', stiffness: 360, damping: 28 }}
            >
              <div className="cal-modal-hd">
                <div>
                  <div className="cal-modal-hd-title">Book Appointment</div>
                  <div className="cal-modal-hd-sub">
                    Fill in the details to submit your request
                  </div>
                </div>
                <button className="cal-modal-x" onClick={() => setShowModal(false)}>
                  <X size={14} />
                </button>
              </div>

              <div className="cal-modal-body">
                <form
                  onSubmit={handleSubmitAppointment}
                  style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
                >
                  <div className="cal-date-pill">
                    <Calendar size={13} />
                    {selectedDay && formatDateString(selectedDay)}
                  </div>

                  <div className="cal-time-row">
                    <div className="cal-field">
                      <label className="cal-label">Start time</label>
                      <input
                        type="time"
                        value={formData.startTime}
                        onChange={(e) =>
                          setFormData({ ...formData, startTime: e.target.value })
                        }
                        className="cal-input"
                      />
                    </div>
                    <div className="cal-field">
                      <label className="cal-label">End time</label>
                      <input
                        type="time"
                        value={formData.endTime}
                        onChange={(e) =>
                          setFormData({ ...formData, endTime: e.target.value })
                        }
                        className="cal-input"
                      />
                    </div>
                  </div>

                  <div className="cal-field">
                    <label className="cal-label">
                      Reason <span style={{ color: 'var(--em-500)' }}>*</span>
                    </label>
                    <textarea
                      value={formData.reason}
                      onChange={(e) =>
                        setFormData({ ...formData, reason: e.target.value })
                      }
                      placeholder="Describe the purpose of your appointment…"
                      className="cal-input"
                      rows={3}
                    />
                  </div>

                  <div className="cal-field">
                    <label className="cal-label">Additional notes</label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) =>
                        setFormData({ ...formData, notes: e.target.value })
                      }
                      placeholder="Any extra information…"
                      className="cal-input"
                      rows={2}
                    />
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      gap: '.625rem',
                      paddingTop: '.125rem',
                    }}
                  >
                    <button
                      type="button"
                      className="cal-btn-ghost"
                      onClick={() => setShowModal(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="cal-btn-submit"
                      disabled={submitting}
                    >
                      {submitting ? (
                        <>
                          <Loader2 size={14} className="animate-spin" />
                          Submitting…
                        </>
                      ) : (
                        <>
                          <CheckCircle size={14} />
                          Confirm booking
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Appointment Details Modal */}
      <AnimatePresence>
        {selectedAppointment && (
          <motion.div
            className="cal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="cal-modal"
              initial={{ scale: 0.93, opacity: 0, y: 14 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.93, opacity: 0, y: 14 }}
              transition={{ type: 'spring', stiffness: 360, damping: 28 }}
            >
              <div className="cal-modal-hd">
                <div>
                  <div className="cal-modal-hd-title">Appointment Details</div>
                  <div style={{ marginTop: '0.5rem' }}>
                    <span
                      className={`cal-appointment-status ${selectedAppointment.status || 'pending'}`}
                    >
                      {selectedAppointment.status
                        ? selectedAppointment.status.charAt(0).toUpperCase() +
                          selectedAppointment.status.slice(1)
                        : 'Pending'}
                    </span>
                  </div>
                  <div className="cal-modal-hd-sub">
                    Review the full booking details and current status.
                  </div>
                </div>
                <button
                  className="cal-modal-x"
                  onClick={() => setSelectedAppointment(null)}
                >
                  <X size={14} />
                </button>
              </div>
              <div className="cal-modal-body">
                <div style={{ display: 'grid', gap: '1.5rem' }}>
                  <div className="cal-field">
                    <label className="cal-label">Date</label>
                    <div className="cal-date-pill">
                      <Calendar size={13} />
                      {selectedAppointment.date
                        ? new Date(selectedAppointment.date).toLocaleDateString(
                            'en-US',
                            {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              weekday: 'short',
                            },
                          )
                        : 'Unknown'}
                    </div>
                  </div>
                  <div className="cal-field">
                    <label className="cal-label">Time</label>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        fontSize: '0.875rem',
                        fontWeight: 500,
                        color: 'var(--slate-900)',
                      }}
                    >
                      <Clock size={14} style={{ color: 'var(--em-600)' }} />
                      {selectedAppointment.start_time} —{' '}
                      {selectedAppointment.end_time}
                    </div>
                  </div>
                  <div className="cal-field">
                    <label className="cal-label">Notes</label>
                    <div
                      style={{
                        fontSize: '0.875rem',
                        color: 'var(--slate-600)',
                        lineHeight: 1.5,
                        background: 'var(--slate-50)',
                        padding: '0.75rem',
                        borderRadius: 'var(--r-sm)',
                        border: '1px solid var(--slate-200)',
                      }}
                    >
                      {selectedAppointment.notes || 'No additional notes'}
                    </div>
                  </div>
                  {selectedAppointment.status === 'rejected' && (
                    <div
                      style={{
                        backgroundColor: '#dc2626',
                        color: 'white',
                        padding: '1rem',
                        borderRadius: '8px',
                        marginTop: '0.5rem',
                      }}
                    >
                      <strong>Rejection Reason</strong>
                      <div style={{ marginTop: '0.5rem' }}>
                        {selectedAppointment.reason || 'No reason provided'}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <DynamicToast
            type={toast.type}
            message={toast.message}
            onClose={() => setToast(null)}
          />
        )}
      </AnimatePresence>

      {/* Login Modal */}
      <AnimatePresence>
        {showLoginModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl"
            >
              <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock size={28} className="text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Sign In Required
              </h3>
              <p className="text-gray-600 mb-6">
                Please sign in to book appointments and engage with the community.
              </p>
              <div className="space-y-3">
                <button
                  onClick={handleLogin}
                  className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                >
                  Sign In
                </button>
                <button
                  onClick={closeLoginModal}
                  className="w-full py-3 text-gray-600 font-medium hover:bg-gray-100 rounded-xl transition-colors"
                >
                  Continue Browsing
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <Footer />
    </div>
  )
}
