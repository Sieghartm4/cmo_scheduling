import React, { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Save,
  Layout,
  Code,
  X,
  ArrowUp,
  ArrowDown,
  Copy,
  Trash2,
  Plus,
  MousePointerClick,
  Type,
  Heading1,
  Square,
  CreditCard,
  Image as ImageIcon,
  Columns,
  Minus,
  List,
  Undo,
  Redo,
  Maximize,
  Minimize,
  BookOpen,
} from 'lucide-react'
import RouteProtection from '../../../components/RouteProtection'
import ProtectedAction from '../../../components/ProtectedAction'
import DynamicToast from '../../../components/DynamicToast'
import TutorialGuide from '../../../components/TutorialGuide'

const EDITABLE_TAGS = new Set([
  'DIV', 'SECTION', 'P', 'SPAN', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6',
  'A', 'BUTTON', 'UL', 'OL', 'LI', 'IMG', 'ARTICLE', 'HEADER', 'FOOTER',
  'NAV', 'ASIDE', 'FIGURE', 'FIGCAPTION', 'BLOCKQUOTE',
])

// Shared responsive stylesheet for anything added through the block picker.
// Injected once into the saved HTML so blocks stay styled/responsive on the live site too.
const BUILDER_STYLE_ID = 'cm-builder-styles'
const BUILDER_STYLES = `
<style id="${BUILDER_STYLE_ID}">
.cm-block{max-width:100%;box-sizing:border-box;}
.cm-heading{font-weight:800;margin:16px 0;line-height:1.25;}
.cm-text{line-height:1.6;margin:12px 0;}
.cm-button{display:inline-block;padding:12px 28px;border-radius:10px;border:none;font-weight:700;cursor:pointer;font-size:15px;text-decoration:none;}
.cm-card{padding:24px;border-radius:16px;background:#ffffff;border:1px solid #e5e7eb;box-shadow:0 4px 12px rgba(0,0,0,0.06);}
.cm-card-title{font-weight:800;margin:0 0 8px 0;font-size:18px;}
.cm-card-text{margin:0;line-height:1.6;color:#4b5563;}
.cm-image{width:100%;height:auto;border-radius:12px;display:block;}
.cm-columns{display:flex;gap:24px;flex-wrap:wrap;margin:16px 0;}
.cm-col{flex:1 1 280px;min-width:0;}
.cm-list{padding-left:20px;line-height:1.9;margin:12px 0;}
.cm-divider{border:none;border-top:1px solid #e5e7eb;margin:28px 0;}
@media (max-width:640px){
  .cm-columns{flex-direction:column;}
  .cm-card{padding:16px;}
  .cm-heading{font-size:1.3em;}
}
</style>`.trim()

function ensureBuilderStyles(html) {
  if (!html) return `${BUILDER_STYLES}\n`
  if (html.includes(BUILDER_STYLE_ID)) return html
  return `${BUILDER_STYLES}\n${html}`
}

function markElementsEditable(root) {
  root.querySelectorAll('*').forEach((el) => {
    if (EDITABLE_TAGS.has(el.tagName) && !el.closest('style')) {
      el.setAttribute('data-editable', 'true')
      el.setAttribute('draggable', 'true')
    }
  })
}

function rgbToHex(rgb) {
  if (!rgb) return null
  if (rgb.startsWith('#')) return rgb
  const m = rgb.match(/rgba?\(([^)]+)\)/)
  if (!m) return null
  const parts = m[1].split(',').map((s) => parseFloat(s.trim()))
  const [r, g, b, a] = parts
  if (a === 0) return null
  return '#' + [r, g, b].map((x) => Math.round(x).toString(16).padStart(2, '0')).join('')
}

// ---------- Block library ----------
const BLOCK_TYPES = [
  { type: 'text', label: 'Text', icon: Type },
  { type: 'heading', label: 'Heading', icon: Heading1 },
  { type: 'button', label: 'Button', icon: Square },
  { type: 'card', label: 'Card', icon: CreditCard },
  { type: 'image', label: 'Image', icon: ImageIcon },
  { type: 'columns', label: 'Two Columns', icon: Columns },
  { type: 'list', label: 'List', icon: List },
  { type: 'divider', label: 'Divider', icon: Minus },
]

function getBlockHTML(type, theme) {
  const accent = theme?.accent || '#059669'
  const textColor = theme?.color || '#111827'
  switch (type) {
    case 'text':
      return `<p class="cm-block cm-text" style="color:${textColor};font-size:16px;">Double-click to edit this text. Drag to reorder, or use the panel on the right to restyle it.</p>`
    case 'heading':
      return `<h2 class="cm-block cm-heading" style="color:${textColor};font-size:28px;">New Heading</h2>`
    case 'button':
      return `<button class="cm-block cm-button" style="background:${accent};color:#ffffff;">Click Me</button>`
    case 'card':
      return `<div class="cm-block cm-card"><h3 class="cm-card-title" style="color:${textColor};">Card Title</h3><p class="cm-card-text">Add a short description for this card. Double-click any part to edit it.</p></div>`
    case 'image':
      return `<img class="cm-block cm-image" src="https://placehold.co/800x400/e5e7eb/9ca3af?text=Image" alt="Image" />`
    case 'columns':
      return `<div class="cm-block cm-columns"><div class="cm-col cm-card"><h3 class="cm-card-title" style="color:${textColor};">Column One</h3><p class="cm-card-text">Edit this column's text.</p></div><div class="cm-col cm-card"><h3 class="cm-card-title" style="color:${textColor};">Column Two</h3><p class="cm-card-text">Edit this column's text.</p></div></div>`
    case 'list':
      return `<ul class="cm-block cm-list" style="color:${textColor};"><li>List item one</li><li>List item two</li><li>List item three</li></ul>`
    case 'divider':
      return `<hr class="cm-block cm-divider" />`
    default:
      return `<div class="cm-block">New block</div>`
  }
}

function BlockPreviewThumb({ type }) {
  switch (type) {
    case 'text':
      return (
        <div className="w-full">
          <div className="h-1.5 w-full bg-gray-300 rounded-full mb-1" />
          <div className="h-1.5 w-3/4 bg-gray-300 rounded-full" />
        </div>
      )
    case 'heading':
      return <div className="h-2.5 w-4/5 bg-gray-500 rounded-full" />
    case 'button':
      return <div className="h-5 w-16 bg-emerald-600 rounded-md" />
    case 'card':
      return <div className="h-8 w-full border border-gray-300 rounded-md bg-gray-50" />
    case 'image':
      return <div className="h-8 w-full bg-gray-200 rounded-md flex items-center justify-center"><ImageIcon size={14} className="text-gray-400" /></div>
    case 'columns':
      return (
        <div className="flex gap-1 w-full">
          <div className="h-8 flex-1 bg-gray-100 border border-gray-300 rounded-md" />
          <div className="h-8 flex-1 bg-gray-100 border border-gray-300 rounded-md" />
        </div>
      )
    case 'list':
      return (
        <div className="w-full flex flex-col gap-1">
          <div className="h-1.5 w-full bg-gray-300 rounded-full" />
          <div className="h-1.5 w-4/5 bg-gray-300 rounded-full" />
          <div className="h-1.5 w-3/5 bg-gray-300 rounded-full" />
        </div>
      )
    case 'divider':
      return <div className="h-px w-full bg-gray-400" />
    default:
      return null
  }
}

function HomePageSectionsContent() {
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [settingsLoading, setSettingsLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState(null)
  const [sectionId, setSectionId] = useState(null)
  const [mode, setMode] = useState('visual') // 'visual' | 'code'
  const [homePageSettings, setHomePageSettings] = useState(null)
  const [selectedInfo, setSelectedInfo] = useState(null)
  const [pickerOpen, setPickerOpen] = useState(false)
  const [placingType, setPlacingType] = useState(null)
  const [history, setHistory] = useState([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [isFullScreen, setIsFullScreen] = useState(false)
  const [showTutorial, setShowTutorial] = useState(false)

  // Tutorial steps for the home page sections editor
  const tutorialSteps = [
    {
      title: 'Welcome to Home Page Editor',
      description: 'This editor allows you to create and customize your home page content using a visual editor or HTML code. Let\'s walk through the main features.',
      selector: null,
      placement: 'bottom',
    },
    {
      title: 'Visual Editor Mode',
      description: 'The visual editor lets you drag, drop, and edit content blocks directly. Click to select elements, double-click to edit text, and drag to reorder blocks.',
      selector: '[data-tutorial="visual-editor"]',
      placement: 'bottom',
      action: () => setMode('visual'),
    },
    {
      title: 'HTML Code Mode',
      description: 'Switch to HTML code mode to edit the raw HTML directly. This is useful for advanced users who want full control over the markup.',
      selector: '[data-tutorial="html-editor"]',
      placement: 'bottom',
      action: () => setMode('code'),
    },
    {
      title: 'Undo & Redo',
      description: 'Made a mistake? Use the undo button (or Ctrl+Z) to go back. Use redo (or Ctrl+Y) to restore your changes. Your history is saved automatically.',
      selector: '[data-tutorial="undo-button"]',
      placement: 'bottom',
      action: () => setMode('visual'),
    },
    {
      title: 'Add Content Blocks',
      description: 'Click "Add Block" to choose from pre-designed content blocks like headings, text, buttons, cards, images, columns, lists, and dividers.',
      selector: '[data-tutorial="add-block"]',
      placement: 'bottom',
    },
    {
      title: 'Save Your Changes',
      description: 'When you\'re happy with your changes, click the Save button to publish your home page content.',
      selector: '[data-tutorial="save-button"]',
      placement: 'bottom',
    },
    {
      title: 'Full Screen Mode',
      description: 'For a distraction-free editing experience, click the maximize icon in the editor header to enter full screen mode. Press ESC to exit.',
      selector: '[data-tutorial="fullscreen-toggle"]',
      placement: 'bottom',
      action: () => setMode('visual'),
    },
    {
      title: 'Style Inspector',
      description: 'When you select an element in visual mode, a style panel appears on the right. Use it to change colors, fonts, alignment, and more.',
      selector: '[data-tutorial="style-inspector"]',
      placement: 'left',
      action: () => {
        setMode('visual')
        // Select a dummy element to show the inspector
        setTimeout(() => {
          const previewEl = previewRef.current?.querySelector('[data-editable]')
          if (previewEl) {
            previewEl.click()
          }
        }, 100)
      },
    },
    {
      title: 'You\'re All Set!',
      description: 'You now know the basics of editing your home page. Experiment with different blocks and styles to create your perfect homepage!',
      selector: null,
      placement: 'bottom',
      action: () => deselectAll(),
    },
  ]

  const [styleForm, setStyleForm] = useState({
    color: '#000000',
    backgroundColor: '#ffffff',
    fontSize: 16,
    fontWeight: '400',
    textAlign: 'left',
    fontStyle: 'normal',
  })

  const previewRef = useRef(null)
  const selectedRef = useRef(null)
  const ghostRef = useRef(null)
  const dropTargetRef = useRef(null)
  const domInitializedRef = useRef(false)
  const isHistoryUpdateRef = useRef(false)

  const fadeInUp = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  }

  const ready = !loading && !settingsLoading

  useEffect(() => {
    fetchSections()
    fetchHomePageSettings()
  }, [])

  // Initialize history with initial content
  useEffect(() => {
    if (content && history.length === 0) {
      setHistory([content])
      setHistoryIndex(0)
    }
  }, [content, history.length])

  const fetchSections = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SERVER_LINK}/api/home-page-sections`,
      )
      if (response.ok) {
        const result = await response.json()
        if (result.success && result.data) {
          setContent(result.data.content || '')
          setSectionId(result.data.id)
        }
      }
    } catch (error) {
      console.error('Error fetching sections:', error)
    } finally {
      setLoading(false)
    }
  }

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
    } finally {
      setSettingsLoading(false)
    }
  }

  const showToast = (type, message) => {
    setToast({ type, message })
    setTimeout(() => setToast(null), 3000)
  }

  const getBackgroundStyle = () => {
    if (!homePageSettings) return {}
    const bgValue = homePageSettings.homepage_image
    const isBase64 =
      bgValue?.startsWith('data:') || (bgValue?.startsWith('/') && bgValue?.includes('9j/'))
    const isUrl = bgValue?.startsWith('http')

    if (isBase64 || isUrl) {
      let imageSrc = bgValue
      if (isBase64 && !bgValue.startsWith('data:')) {
        imageSrc = `data:image/jpeg;base64,${bgValue}`
      }
      return {
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(${imageSrc})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }
    }
    return {}
  }

  const getBackgroundClass = () => {
    if (!homePageSettings) return 'bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50'
    const bgValue = homePageSettings.homepage_image
    const isBase64 =
      bgValue?.startsWith('data:') || (bgValue?.startsWith('/') && bgValue?.includes('9j/'))
    const isUrl = bgValue?.startsWith('http')
    if (isBase64 || isUrl) return ''
    return `bg-gradient-to-br ${bgValue || 'from-emerald-50 via-teal-50 to-cyan-50'}`
  }

  const processContent = (htmlContent) => {
    if (!htmlContent) return htmlContent
    if (homePageSettings?.homepage_image) {
      const bgStyle = getBackgroundStyle()
      const bgClass = getBackgroundClass()

      return htmlContent.replace(
        /(<section[^>]*hero-section-bg[^>]*style=")[^"]*("[^>]*>)/,
        (match, prefix, suffix) => {
          const styleParts = []
          if (bgStyle.backgroundImage) styleParts.push(`background-image: ${bgStyle.backgroundImage}`)
          if (bgStyle.backgroundSize) styleParts.push(`background-size: ${bgStyle.backgroundSize}`)
          if (bgStyle.backgroundPosition) styleParts.push(`background-position: ${bgStyle.backgroundPosition}`)
          if (bgStyle.backgroundRepeat) styleParts.push(`background-repeat: ${bgStyle.backgroundRepeat}`)
          const newStyle = styleParts.join('; ')
          const newClass = bgClass
            ? match.replace(/class="[^"]*"/, `class="${bgClass}"`)
            : match
          return `${prefix}${newStyle}${suffix}`
        },
      )
    }
    return htmlContent
  }

  // ---------- History management ----------
  const pushToHistory = useCallback((newContent) => {
    if (isHistoryUpdateRef.current) {
      isHistoryUpdateRef.current = false
      return
    }
    setHistory((prev) => {
      const newHistory = prev.slice(0, historyIndex + 1)
      newHistory.push(newContent)
      // Limit history to 50 items
      if (newHistory.length > 50) {
        newHistory.shift()
      }
      return newHistory
    })
    setHistoryIndex((prev) => Math.min(prev + 1, 49))
  }, [historyIndex])

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      isHistoryUpdateRef.current = true
      setHistoryIndex((prev) => prev - 1)
      setContent(history[historyIndex - 1])
      showToast('success', 'Undo')
    }
  }, [historyIndex, history])

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      isHistoryUpdateRef.current = true
      setHistoryIndex((prev) => prev + 1)
      setContent(history[historyIndex + 1])
      showToast('success', 'Redo')
    }
  }, [historyIndex, history])

  // Keyboard shortcuts for undo/redo
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault()
        undo()
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault()
        redo()
      } else if (e.key === 'Escape' && isFullScreen) {
        setIsFullScreen(false)
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [undo, redo, isFullScreen])

  // ---------- Visual editor: sync DOM -> content state ----------
  const syncFromDOM = useCallback(() => {
    const container = previewRef.current
    if (!container) return
    const clone = container.cloneNode(true)
    clone.querySelectorAll('[data-editable]').forEach((el) => {
      el.removeAttribute('data-editable')
      el.removeAttribute('draggable')
      el.removeAttribute('data-selected')
      el.removeAttribute('contenteditable')
      el.style.outline = ''
      el.style.outlineOffset = ''
      el.style.cursor = ''
      el.style.opacity = ''
      el.style.borderTop = ''
      el.style.borderBottom = ''
      el.style.transition = ''
      el.style.boxShadow = ''
      if (el.getAttribute('style') === '') el.removeAttribute('style')
    })
    const newContent = ensureBuilderStyles(clone.innerHTML)
    setContent(newContent)
    pushToHistory(newContent)
  }, [pushToHistory])

  // ---------- Visual editor: inject content into the live DOM ----------
  const initDOM = useCallback(() => {
    const container = previewRef.current
    if (!container) return
    const html = ensureBuilderStyles(processContent(content))
    container.innerHTML =
      html && html.replace(/<style[\s\S]*?<\/style>/, '').trim()
        ? html
        : `${BUILDER_STYLES}<p style="padding: 40px; text-align:center; color:#9ca3af;">No content yet. Click "Add Block" to start building, or switch to HTML Code.</p>`
    markElementsEditable(container)
    domInitializedRef.current = true
  }, [content, homePageSettings]) // eslint-disable-line react-hooks/exhaustive-deps

  // Always (re)activate the visual editor as soon as data is ready and whenever
  // the user switches back into visual mode — fixes it being inert on load/refresh.
  useEffect(() => {
    if (mode === 'visual' && ready) {
      initDOM()
      selectedRef.current = null
      setSelectedInfo(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, ready])

  // Re-render visual DOM when content changes (for undo/redo)
  useEffect(() => {
    if (mode === 'visual' && ready && content) {
      initDOM()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content])

  // ---------- Visual editor: selection / drag / edit handlers ----------
  useEffect(() => {
    const container = previewRef.current
    if (!container || mode !== 'visual') return

    let dragEl = null

    const clearSelectionOutline = () => {
      container.querySelectorAll('[data-selected="true"]').forEach((el) => {
        el.removeAttribute('data-selected')
        el.style.outline = ''
      })
    }

    const selectElement = (el) => {
      clearSelectionOutline()
      selectedRef.current = el
      el.setAttribute('data-selected', 'true')
      el.style.outline = '2px solid #059669'
      el.style.outlineOffset = '2px'
      const computed = window.getComputedStyle(el)
      setSelectedInfo({ tag: el.tagName.toLowerCase() })
      setStyleForm({
        color: rgbToHex(computed.color) || '#000000',
        backgroundColor: rgbToHex(computed.backgroundColor) || '#ffffff',
        fontSize: parseInt(computed.fontSize) || 16,
        fontWeight: computed.fontWeight,
        textAlign: computed.textAlign,
        fontStyle: computed.fontStyle,
      })
    }

    const handleClick = (e) => {
      if (placingType) return // handled by placement listeners instead

      // Prevent navigation on all links and buttons in the visual editor
      const linkOrButton = e.target.closest('a, button')
      if (linkOrButton && container.contains(linkOrButton)) {
        e.preventDefault()
        e.stopPropagation()
        return
      }

      const el = e.target.closest('[data-editable="true"]')
      if (!el || !container.contains(el)) {
        clearSelectionOutline()
        selectedRef.current = null
        setSelectedInfo(null)
        return
      }
      e.stopPropagation()
      selectElement(el)
    }

    const handleDblClick = (e) => {
      if (placingType) return
      const el = e.target.closest('[data-editable="true"]')
      if (!el) return
      e.stopPropagation()
      e.preventDefault()
      el.contentEditable = 'true'
      el.style.cursor = 'text'
      el.focus()
      const onBlur = () => {
        el.contentEditable = 'false'
        el.style.cursor = ''
        el.removeEventListener('blur', onBlur)
        syncFromDOM()
      }
      el.addEventListener('blur', onBlur)
    }

    const handleMouseOver = (e) => {
      if (placingType) return
      const el = e.target.closest('[data-editable="true"]')
      if (!el || el.getAttribute('data-selected') === 'true') return
      el.style.outline = '1px dashed #10b981'
    }

    const handleMouseOut = (e) => {
      if (placingType) return
      const el = e.target.closest('[data-editable="true"]')
      if (!el || el.getAttribute('data-selected') === 'true') return
      el.style.outline = ''
    }

    const handleDragStart = (e) => {
      if (placingType) { e.preventDefault(); return }
      const el = e.target.closest('[data-editable="true"]')
      if (!el || el.isContentEditable) { e.preventDefault(); return }
      dragEl = el
      e.dataTransfer.effectAllowed = 'move'
      e.stopPropagation()
      setTimeout(() => { el.style.opacity = '0.4' }, 0)
    }

    const handleDragOver = (e) => {
      if (!dragEl) return
      const el = e.target.closest('[data-editable="true"]')
      if (!el || el === dragEl || el.parentElement !== dragEl.parentElement) return
      e.preventDefault()
      e.stopPropagation()
      const rect = el.getBoundingClientRect()
      const before = e.clientY - rect.top < rect.height / 2
      el.style.borderTop = before ? '3px solid #059669' : ''
      el.style.borderBottom = !before ? '3px solid #059669' : ''
    }

    const clearDropStyles = () => {
      container.querySelectorAll('[data-editable="true"]').forEach((el) => {
        el.style.borderTop = ''
        el.style.borderBottom = ''
      })
    }

    const handleDrop = (e) => {
      if (!dragEl) return
      const el = e.target.closest('[data-editable="true"]')
      clearDropStyles()
      if (!el || el === dragEl || el.parentElement !== dragEl.parentElement) return
      e.preventDefault()
      e.stopPropagation()
      const rect = el.getBoundingClientRect()
      const before = e.clientY - rect.top < rect.height / 2
      if (before) el.parentElement.insertBefore(dragEl, el)
      else el.parentElement.insertBefore(dragEl, el.nextSibling)
      syncFromDOM()
    }

    const handleDragEnd = () => {
      if (dragEl) dragEl.style.opacity = ''
      clearDropStyles()
      dragEl = null
    }

    container.addEventListener('click', handleClick)
    container.addEventListener('dblclick', handleDblClick)
    container.addEventListener('mouseover', handleMouseOver)
    container.addEventListener('mouseout', handleMouseOut)
    container.addEventListener('dragstart', handleDragStart)
    container.addEventListener('dragover', handleDragOver)
    container.addEventListener('drop', handleDrop)
    container.addEventListener('dragend', handleDragEnd)

    return () => {
      container.removeEventListener('click', handleClick)
      container.removeEventListener('dblclick', handleDblClick)
      container.removeEventListener('mouseover', handleMouseOver)
      container.removeEventListener('mouseout', handleMouseOut)
      container.removeEventListener('dragstart', handleDragStart)
      container.removeEventListener('dragover', handleDragOver)
      container.removeEventListener('drop', handleDrop)
      container.removeEventListener('dragend', handleDragEnd)
    }
  }, [mode, syncFromDOM, placingType])

  // ---------- Block picker: click-to-place placement mode ----------
  useEffect(() => {
    if (!placingType) return
    const container = previewRef.current
    const ghost = ghostRef.current
    if (!container || !ghost) return

    const clearDropHighlight = () => {
      if (dropTargetRef.current) {
        dropTargetRef.current.style.outline = ''
        dropTargetRef.current.style.outlineOffset = ''
      }
      dropTargetRef.current = null
    }

    const onMouseMove = (e) => {
      ghost.style.left = `${e.clientX + 14}px`
      ghost.style.top = `${e.clientY + 14}px`

      const overContainer = container.contains(e.target)
      ghost.style.opacity = overContainer ? '1' : '0.55'

      clearDropHighlight()
      if (overContainer) {
        const el = e.target.closest('[data-editable="true"]')
        if (el && container.contains(el)) {
          dropTargetRef.current = el
          el.style.outline = '2px dashed #2563eb'
          el.style.outlineOffset = '2px'
        }
      }
    }

    const onClick = (e) => {
      const overContainer = container.contains(e.target)
      if (!overContainer) {
        // Clicked outside the canvas — cancel placement.
        cancelPlacement()
        return
      }
      e.preventDefault()
      e.stopPropagation()
      placeBlock(e)
    }

    const onKeyDown = (e) => {
      if (e.key === 'Escape') cancelPlacement()
    }

    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('click', onClick, true)
    document.addEventListener('keydown', onKeyDown)
    document.body.style.cursor = 'copy'

    return () => {
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('click', onClick, true)
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.cursor = ''
      clearDropHighlight()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [placingType])

  const cancelPlacement = () => {
    setPlacingType(null)
  }

  const getTheme = () => {
    const container = previewRef.current
    if (!container) return { accent: '#059669', color: '#111827' }
    const sample = container.querySelector('p, h1, h2, h3, span')
    const computed = sample ? window.getComputedStyle(sample) : null
    return {
      accent: '#059669',
      color: (computed && rgbToHex(computed.color)) || '#111827',
    }
  }

  const flashAndSelect = (el) => {
    el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    const originalOutline = el.style.outline
    const originalShadow = el.style.boxShadow
    el.style.transition = 'box-shadow 0.3s ease'
    el.style.outline = '2px solid #2563eb'
    el.style.outlineOffset = '2px'
    el.style.boxShadow = '0 0 0 6px rgba(37,99,235,0.25)'
    setTimeout(() => {
      el.style.boxShadow = originalShadow
      el.style.outline = originalOutline
    }, 900)

    const container = previewRef.current
    const clearSelectionOutline = () => {
      container.querySelectorAll('[data-selected="true"]').forEach((n) => {
        n.removeAttribute('data-selected')
      })
    }
    clearSelectionOutline()
    selectedRef.current = el
    el.setAttribute('data-selected', 'true')
    const computed = window.getComputedStyle(el)
    setSelectedInfo({ tag: el.tagName.toLowerCase() })
    setStyleForm({
      color: rgbToHex(computed.color) || '#000000',
      backgroundColor: rgbToHex(computed.backgroundColor) || '#ffffff',
      fontSize: parseInt(computed.fontSize) || 16,
      fontWeight: computed.fontWeight,
      textAlign: computed.textAlign,
      fontStyle: computed.fontStyle,
    })
  }

  const placeBlock = (e) => {
    const container = previewRef.current
    if (!container || !placingType) return

    const wrapper = document.createElement('div')
    wrapper.innerHTML = getBlockHTML(placingType, getTheme())
    const newEl = wrapper.firstElementChild

    const target = dropTargetRef.current
    if (target && target !== newEl) {
      target.style.outline = ''
      target.style.outlineOffset = ''
      const rect = target.getBoundingClientRect()
      const before = e.clientY - rect.top < rect.height / 2
      if (before) target.parentElement.insertBefore(newEl, target)
      else target.parentElement.insertBefore(newEl, target.nextSibling)
    } else {
      container.appendChild(newEl)
    }

    markElementsEditable(container)
    setPlacingType(null)
    setPickerOpen(false)
    syncFromDOM()

    // Wait a tick so the freshly-synced DOM node reference is stable, then highlight it.
    requestAnimationFrame(() => flashAndSelect(newEl))
  }

  // ---------- Inspector actions ----------
  const applyStyle = (prop, value) => {
    const el = selectedRef.current
    if (!el) return
    el.style[prop] = value
    setStyleForm((f) => ({ ...f, [prop]: value }))
    syncFromDOM()
  }

  const handleFontSize = (val) => {
    const el = selectedRef.current
    if (!el) return
    el.style.fontSize = `${val}px`
    setStyleForm((f) => ({ ...f, fontSize: val }))
    syncFromDOM()
  }

  const toggleBold = () => {
    const el = selectedRef.current
    if (!el) return
    const isBold = ['bold', '700', '800', '900'].includes(String(styleForm.fontWeight)) || parseInt(styleForm.fontWeight) >= 600
    const newWeight = isBold ? '400' : '700'
    el.style.fontWeight = newWeight
    setStyleForm((f) => ({ ...f, fontWeight: newWeight }))
    syncFromDOM()
  }

  const toggleItalic = () => {
    const el = selectedRef.current
    if (!el) return
    const newStyle = styleForm.fontStyle === 'italic' ? 'normal' : 'italic'
    el.style.fontStyle = newStyle
    setStyleForm((f) => ({ ...f, fontStyle: newStyle }))
    syncFromDOM()
  }

  const moveSelected = (direction) => {
    const el = selectedRef.current
    if (!el) return
    if (direction === 'up' && el.previousElementSibling) {
      el.parentElement.insertBefore(el, el.previousElementSibling)
    } else if (direction === 'down' && el.nextElementSibling) {
      el.parentElement.insertBefore(el.nextElementSibling, el)
    }
    syncFromDOM()
  }

  const duplicateSelected = () => {
    const el = selectedRef.current
    if (!el) return
    const clone = el.cloneNode(true)
    el.parentElement.insertBefore(clone, el.nextSibling)
    syncFromDOM()
  }

  const deleteSelected = () => {
    const el = selectedRef.current
    if (!el) return
    el.remove()
    selectedRef.current = null
    setSelectedInfo(null)
    syncFromDOM()
  }

  const deselectAll = () => {
    if (previewRef.current) {
      previewRef.current.querySelectorAll('[data-selected="true"]').forEach((el) => {
        el.removeAttribute('data-selected')
        el.style.outline = ''
      })
    }
    selectedRef.current = null
    setSelectedInfo(null)
  }

  const startPlacing = (type) => {
    setPlacingType(type)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const url = sectionId
        ? `${import.meta.env.VITE_SERVER_LINK}/api/home-page-sections/${sectionId}`
        : `${import.meta.env.VITE_SERVER_LINK}/api/home-page-sections`
      const method = sectionId ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, status: 'active' }),
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          if (!sectionId) setSectionId(result.data.id)
          showToast('success', 'Home page content saved successfully')
        }
      } else {
        showToast('error', 'Failed to save content')
      }
    } catch (error) {
      console.error('Error saving content:', error)
      showToast('error', 'Error saving content')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center gap-4 bg-[#f4f5f7]">
        <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-gray-500 font-medium">Loading Home Page Sections...</p>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col gap-6 overflow-hidden bg-[#f4f5f7]">
      <ProtectedAction
        routeName="website_settings"
        fallback={
          <div className="flex flex-col items-center justify-center h-full text-center gap-3">
            <Layout size={48} className="text-gray-300" />
            <h3 className="text-lg font-bold text-gray-500">Access Restricted</h3>
            <p className="text-sm text-gray-400">
              Please contact systems admin for Home Page Sections access.
            </p>
          </div>
        }
      >
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          className="flex flex-col gap-4 h-full overflow-hidden relative"
        >
          {/* Page Header */}
          <div className="flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white border border-gray-200 rounded-xl flex items-center justify-center shadow-sm">
                <Code size={24} className="text-emerald-600" />
              </div>
              <div>
                <h1 className="text-3xl font-black text-gray-900 leading-none tracking-tight">
                  Home Page <span className="text-emerald-600 italic">Content</span>
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">
                    {mode === 'visual' ? 'Visual Editor' : 'HTML Editor'}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                data-tutorial="undo-button"
                onClick={undo}
                disabled={historyIndex <= 0}
                className="px-3 py-2 rounded-lg font-semibold transition flex items-center gap-2 bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Undo (Ctrl+Z)"
              >
                <Undo size={16} />
              </button>
              <button
                data-tutorial="redo-button"
                onClick={redo}
                disabled={historyIndex >= history.length - 1}
                className="px-3 py-2 rounded-lg font-semibold transition flex items-center gap-2 bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Redo (Ctrl+Y)"
              >
                <Redo size={16} />
              </button>
              {mode === 'visual' && (
                <button
                  data-tutorial="add-block"
                  onClick={() => setPickerOpen((o) => !o)}
                  className={`px-4 py-2 rounded-lg font-semibold transition flex items-center gap-2 ${
                    pickerOpen ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  <Plus size={16} />
                  Add Block
                </button>
              )}
              <div className="flex items-center bg-gray-200 rounded-lg p-1">
                <button
                  data-tutorial="visual-editor"
                  onClick={() => setMode('visual')}
                  className={`px-3 py-1.5 rounded-md text-sm font-semibold transition flex items-center gap-2 ${
                    mode === 'visual' ? 'bg-white text-emerald-700 shadow-sm' : 'text-gray-600'
                  }`}
                >
                  <Layout size={15} />
                  Visual Editor
                </button>
                <button
                  data-tutorial="html-editor"
                  onClick={() => setMode('code')}
                  className={`px-3 py-1.5 rounded-md text-sm font-semibold transition flex items-center gap-2 ${
                    mode === 'code' ? 'bg-white text-emerald-700 shadow-sm' : 'text-gray-600'
                  }`}
                >
                  <Code size={15} />
                  HTML Code
                </button>
              </div>
              <button
                onClick={() => setShowTutorial(true)}
                className="animate-bounce inline-flex items-center justify-center gap-2 rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-lg transition hover:bg-emerald-700"
                title="Show Tutorial"
              >
                <BookOpen size={16} className="text-white" />
                Guide
              </button>
              <button
                data-tutorial="save-button"
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save size={18} />
                {saving ? 'Saving...' : 'Save Content'}
              </button>
            </div>
          </div>

          {/* Block Picker Popover */}
          <AnimatePresence>
            {pickerOpen && mode === 'visual' && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="absolute right-0 top-16 z-30 w-[340px] bg-white border border-gray-200 rounded-2xl shadow-2xl p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-black uppercase tracking-wider text-gray-500">
                    Choose a block
                  </p>
                  <button onClick={() => setPickerOpen(false)} className="text-gray-400 hover:text-gray-600">
                    <X size={16} />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {BLOCK_TYPES.map(({ type, label, icon: Icon }) => (
                    <button
                      key={type}
                      onClick={() => startPlacing(type)}
                      className="flex flex-col items-start gap-2 p-3 rounded-xl border border-gray-200 hover:border-emerald-400 hover:bg-emerald-50 transition text-left"
                    >
                      <div className="w-full h-8 flex items-center px-1">
                        <BlockPreviewThumb type={type} />
                      </div>
                      <div className="flex items-center gap-1.5 text-xs font-bold text-gray-700">
                        <Icon size={13} className="text-emerald-600" />
                        {label}
                      </div>
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-gray-400 mt-3 leading-relaxed">
                  Pick a block, then move your mouse onto the page and click where you want to drop it.
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Placement mode hint bar */}
          <AnimatePresence>
            {placingType && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="absolute left-1/2 -translate-x-1/2 top-16 z-30 bg-gray-900 text-white text-sm font-semibold px-4 py-2 rounded-full shadow-lg flex items-center gap-3"
              >
                <MousePointerClick size={15} className="text-emerald-400" />
                Click on the page to place your block
                <button
                  onClick={cancelPlacement}
                  className="ml-1 text-gray-300 hover:text-white underline underline-offset-2"
                >
                  Cancel
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main Content */}
          <div className={`flex-1 bg-white border border-gray-200 rounded-2xl shadow-xl flex flex-col overflow-hidden ${isFullScreen ? 'fixed inset-0 z-50 rounded-none border-none shadow-none' : ''}`}>
            {/* Editor Header */}
            <div className="bg-emerald-700 h-12 flex items-center justify-between px-6 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-[4px] h-6 bg-emerald-400 rounded-full" />
                <span className="text-white text-sm font-bold uppercase tracking-[2px]">
                  {mode === 'visual' ? 'Visual Content Editor' : 'HTML Content Editor'}
                </span>
              </div>
              <div className="flex items-center gap-4">
                {mode === 'visual' && (
                  <div className="hidden md:flex items-center gap-2 text-emerald-100 text-xs">
                    <MousePointerClick size={14} />
                    Click to select • Double-click to edit text • Drag to reorder
                  </div>
                )}
                {mode === 'visual' && (
                  <button
                    data-tutorial="fullscreen-toggle"
                    onClick={() => setIsFullScreen(!isFullScreen)}
                    className="text-white hover:text-emerald-200 transition p-2 rounded hover:bg-emerald-600/50"
                    title={isFullScreen ? 'Exit Full Screen (ESC)' : 'Full Screen'}
                  >
                    {isFullScreen ? <Minimize size={24} /> : <Maximize size={24} />}
                  </button>
                )}
              </div>
            </div>

            {/* Editor/Preview + Inspector */}
            <div className="flex-1 overflow-hidden flex">
              {mode === 'visual' ? (
                <>
                  <div
                    ref={previewRef}
                    className="flex-1 h-full overflow-y-auto bg-white"
                  />
                  {selectedInfo && (
                    <div data-tutorial="style-inspector" className="w-72 border-l border-gray-200 bg-white flex-shrink-0 overflow-y-auto">
                      <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                        <span className="text-xs font-black uppercase tracking-wider text-emerald-700">
                          &lt;{selectedInfo.tag}&gt;
                        </span>
                        <button onClick={deselectAll} className="text-gray-400 hover:text-gray-600">
                          <X size={16} />
                        </button>
                      </div>
                      <div className="p-4 flex flex-col gap-4">
                        <div>
                          <label className="text-[11px] font-bold uppercase text-gray-500 tracking-wider">
                            Text Color
                          </label>
                          <input
                            type="color"
                            value={styleForm.color}
                            onChange={(e) => applyStyle('color', e.target.value)}
                            className="w-full h-9 mt-1 rounded cursor-pointer border border-gray-200"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-bold uppercase text-gray-500 tracking-wider">
                            Background Color
                          </label>
                          <div className="flex items-center gap-2 mt-1">
                            <input
                              type="color"
                              value={styleForm.backgroundColor}
                              onChange={(e) => applyStyle('backgroundColor', e.target.value)}
                              className="w-full h-9 rounded cursor-pointer border border-gray-200"
                            />
                            <button
                              onClick={() => applyStyle('backgroundColor', 'transparent')}
                              className="text-[10px] text-gray-400 hover:text-gray-600 whitespace-nowrap"
                            >
                              Clear
                            </button>
                          </div>
                        </div>
                        <div>
                          <label className="text-[11px] font-bold uppercase text-gray-500 tracking-wider">
                            Font Size ({styleForm.fontSize}px)
                          </label>
                          <input
                            type="range"
                            min="10"
                            max="72"
                            value={styleForm.fontSize}
                            onChange={(e) => handleFontSize(e.target.value)}
                            className="w-full mt-1"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={toggleBold}
                            className={`flex-1 py-2 rounded-lg border text-sm font-bold ${
                              ['bold', '700', '800', '900'].includes(String(styleForm.fontWeight)) || parseInt(styleForm.fontWeight) >= 600
                                ? 'bg-emerald-600 text-white border-emerald-600'
                                : 'border-gray-200 text-gray-600'
                            }`}
                          >
                            B
                          </button>
                          <button
                            onClick={toggleItalic}
                            className={`flex-1 py-2 rounded-lg border text-sm italic font-bold ${
                              styleForm.fontStyle === 'italic'
                                ? 'bg-emerald-600 text-white border-emerald-600'
                                : 'border-gray-200 text-gray-600'
                            }`}
                          >
                            I
                          </button>
                        </div>
                        <div>
                          <label className="text-[11px] font-bold uppercase text-gray-500 tracking-wider">
                            Alignment
                          </label>
                          <div className="flex items-center gap-2 mt-1">
                            {['left', 'center', 'right'].map((align) => (
                              <button
                                key={align}
                                onClick={() => applyStyle('textAlign', align)}
                                className={`flex-1 py-2 rounded-lg border text-xs font-bold capitalize ${
                                  styleForm.textAlign === align
                                    ? 'bg-emerald-600 text-white border-emerald-600'
                                    : 'border-gray-200 text-gray-600'
                                }`}
                              >
                                {align}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="border-t border-gray-100 pt-4 flex flex-col gap-2">
                          <label className="text-[11px] font-bold uppercase text-gray-500 tracking-wider">
                            Arrange
                          </label>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => moveSelected('up')}
                              className="flex-1 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 flex items-center justify-center gap-1 text-xs font-bold"
                            >
                              <ArrowUp size={14} /> Up
                            </button>
                            <button
                              onClick={() => moveSelected('down')}
                              className="flex-1 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 flex items-center justify-center gap-1 text-xs font-bold"
                            >
                              <ArrowDown size={14} /> Down
                            </button>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={duplicateSelected}
                              className="flex-1 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 flex items-center justify-center gap-1 text-xs font-bold"
                            >
                              <Copy size={14} /> Duplicate
                            </button>
                            <button
                              onClick={deleteSelected}
                              className="flex-1 py-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 flex items-center justify-center gap-1 text-xs font-bold"
                            >
                              <Trash2 size={14} /> Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full h-full p-6 font-mono text-sm text-gray-900 bg-gray-50 resize-none focus:outline-none focus:bg-white transition-colors"
                  placeholder="Enter your home page HTML content here..."
                  spellCheck={false}
                />
              )}
            </div>

            {/* Footer */}
            <div className="bg-gray-50 border-t border-gray-200 px-6 py-3 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-4">
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                  Characters: <span className="text-gray-900 font-black">{content.length}</span>
                </p>
              </div>
              <p className="text-[11px] font-black text-emerald-600 tracking-[2px] uppercase">
                CMO Connect
              </p>
            </div>
          </div>
        </motion.div>
      </ProtectedAction>

      {/* Floating ghost preview that follows the cursor while placing a block */}
      <div
        ref={ghostRef}
        style={{
          position: 'fixed',
          left: 0,
          top: 0,
          zIndex: 9999,
          pointerEvents: 'none',
          display: placingType ? 'block' : 'none',
          transform: 'translate(0, 0)',
        }}
      >
        {placingType && (
          <div className="bg-white border-2 border-emerald-500 rounded-lg shadow-2xl px-3 py-2 flex items-center gap-2 opacity-95">
            {(() => {
              const meta = BLOCK_TYPES.find((b) => b.type === placingType)
              const Icon = meta?.icon || Plus
              return (
                <>
                  <Icon size={14} className="text-emerald-600" />
                  <span className="text-xs font-bold text-gray-700">{meta?.label}</span>
                </>
              )
            })()}
          </div>
        )}
      </div>

      {toast && (
        <DynamicToast type={toast.type} message={toast.message} onClose={() => setToast(null)} />
      )}

      <TutorialGuide
        isOpen={showTutorial}
        onClose={() => setShowTutorial(false)}
        steps={tutorialSteps}
      />
    </div>
  )
}

export default function HomePageSections() {
  return (
    <RouteProtection routeName="website_settings">
      <HomePageSectionsContent />
    </RouteProtection>
  )
}