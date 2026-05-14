import React, { useEffect, useState } from 'react'

const clamp = (value, min, max) => Math.max(min, Math.min(max, value))

const getTooltipCoords = (rect, placement, width = 340, height = 160) => {
  const margin = 14
  const viewportWidth = window.innerWidth
  const viewportHeight = window.innerHeight

  let left = rect.left + rect.width / 2 - width / 2
  let top = rect.bottom + margin
  let transform = 'translateX(0)'

  switch (placement) {
    case 'top':
      top = rect.top - height - margin
      left = rect.left + rect.width / 2 - width / 2
      break
    case 'left':
      top = rect.top + rect.height / 2 - height / 2
      left = rect.left - width - margin
      break
    case 'right':
      top = rect.top + rect.height / 2 - height / 2
      left = rect.right + margin
      break
    case 'bottom':
    default:
      top = rect.bottom + margin
      left = rect.left + rect.width / 2 - width / 2
      break
  }

  left = clamp(left, 16, viewportWidth - width - 16)
  top = clamp(top, 16, viewportHeight - height - 16)

  return { top, left, width, height, transform }
}

const TutorialGuide = ({ isOpen, onClose, steps = [], initialStep = 0 }) => {
  const [currentStep, setCurrentStep] = useState(initialStep)
  const [targetRect, setTargetRect] = useState(null)

  useEffect(() => {
    if (!isOpen) return
    setCurrentStep(initialStep)
  }, [initialStep, isOpen])

  useEffect(() => {
    if (!isOpen) return

    const updateRect = (scrollToTarget = false) => {
      const step = steps[currentStep]
      if (!step || !step.selector) {
        setTargetRect(null)
        return
      }
      const element = document.querySelector(step.selector)
      if (!element) {
        setTargetRect(null)
        return
      }
      if (scrollToTarget) {
        element.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
          inline: 'nearest',
        })
      }
      setTargetRect(element.getBoundingClientRect())
    }

    const onScroll = () => window.requestAnimationFrame(() => updateRect(false))
    const onResize = () => window.requestAnimationFrame(() => updateRect(false))

    updateRect(true)
    window.addEventListener('scroll', onScroll, true)
    window.addEventListener('resize', onResize)

    let observer
    const step = steps[currentStep]
    const element = step?.selector && document.querySelector(step.selector)
    if (window.ResizeObserver && element) {
      observer = new ResizeObserver(onResize)
      observer.observe(element)
    }

    return () => {
      window.removeEventListener('scroll', onScroll, true)
      window.removeEventListener('resize', onResize)
      if (observer) observer.disconnect()
    }
  }, [isOpen, steps, currentStep])

  const step = steps[currentStep]
  const tooltipPlacement = step?.placement || 'bottom'
  const tooltipCoords = targetRect
    ? getTooltipCoords(targetRect, tooltipPlacement)
    : {
        top: 80,
        left: 40,
        width: Math.min(360, window.innerWidth - 32),
        height: 160,
      }

  const showPrev = currentStep > 0
  const showNext = currentStep < steps.length - 1

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      {!targetRect && <div className="absolute inset-0 bg-black/70" />}
      {targetRect && (
        <div
          style={{
            position: 'absolute',
            top: targetRect.top - 10,
            left: targetRect.left - 10,
            width: targetRect.width + 20,
            height: targetRect.height + 20,
            borderRadius: 18,
            boxShadow: '0 0 0 9999px rgba(0,0,0,0.68)',
            border: '2px solid #34d399',
            transition: 'all 0.2s ease',
            pointerEvents: 'none',
            background: 'transparent',
          }}
        />
      )}

      <div
        style={{
          position: 'absolute',
          top: tooltipCoords.top,
          left: tooltipCoords.left,
          width: tooltipCoords.width,
          zIndex: 2010,
          pointerEvents: 'auto',
        }}
      >
        <div className="relative rounded-3xl border border-emerald-100 bg-white p-5 shadow-2xl">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm text-emerald-600 uppercase tracking-[0.2em] font-semibold">
                Guide
              </p>
              <h2 className="mt-2 text-lg font-semibold text-slate-900">
                {step?.title || 'Tutorial step'}
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-sm text-slate-500 hover:text-slate-900"
            >
              Close
            </button>
          </div>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            {step?.description || 'Follow the highlighted area to continue.'}
          </p>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span>
                Step {currentStep + 1} of {steps.length}
              </span>
              {step?.selector && (
                <span className="text-slate-400 truncate">{step.selector}</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCurrentStep((prev) => Math.max(0, prev - 1))}
                disabled={!showPrev}
                className="rounded-full border border-slate-200 px-3 py-1 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-40 hover:border-slate-300"
              >
                Prev
              </button>
              <button
                type="button"
                onClick={() =>
                  setCurrentStep((prev) => Math.min(steps.length - 1, prev + 1))
                }
                className="rounded-full bg-emerald-600 px-4 py-1.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:bg-slate-300"
                disabled={!showNext}
              >
                {showNext ? 'Next' : 'Finish'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TutorialGuide
