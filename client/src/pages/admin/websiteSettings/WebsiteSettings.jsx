import React from 'react'
import { motion } from 'framer-motion'
import {
  Globe,
  Phone,
  Save,
  CheckCircle,
  Image,
  Mail,
  Hash,
  MapPin,
  Palette,
  Type,
} from 'lucide-react'
import RouteProtection from '../../../components/RouteProtection'
import ProtectedAction from '../../../components/ProtectedAction'
import DynamicToast from '../../../components/DynamicToast'
import useWebsiteSettings from './useWebsiteSettings'

function WebsiteSettingsContent() {
  const {
    settings,
    loading,
    error,
    logoPreview,
    backgroundPreview,
    aboutMeImagePreview,
    status,
    formData,
    toast,
    hideToast,
    backgroundInputMode,
    setBackgroundInputMode,
    handleLogoChange,
    handleBackgroundChange,
    handleAboutMeImageChange,
    handleInputChange,
    handleSubmit,
  } = useWebsiteSettings()

  const fadeInUp = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  }

  if (loading) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center gap-4 bg-[#f4f5f7]">
        <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-gray-500 font-medium">
          Synchronizing Website Settings...
        </p>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col gap-6 overflow-hidden bg-[#f4f5f7]">
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
      <ProtectedAction
        routeName="website_settings"
        fallback={
          <div className="flex flex-col items-center justify-center h-full text-center gap-3">
            <Globe size={48} className="text-gray-300" />
            <h3 className="text-lg font-bold text-gray-500">Access Restricted</h3>
            <p className="text-sm text-gray-400">
              Please contact systems admin for Website Settings access.
            </p>
          </div>
        }
      >
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          className="flex flex-col gap-4 h-full overflow-hidden"
        >
          {/* ── Page Header ────────────────── */}
          <div className="flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white border border-gray-200 rounded-xl flex items-center justify-center shadow-sm">
                <Globe size={24} className="text-emerald-600" />
              </div>
              <div>
                <h1 className="text-3xl font-black text-gray-900 leading-none tracking-tight">
                  Website <span className="text-emerald-600 italic">Settings</span>
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">
                    Content Management & Branding
                  </p>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleSubmit}
                className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-all duration-200 shadow-lg hover:shadow-emerald-900/20 uppercase tracking-widest"
              >
                <Save size={14} />
                Save Changes
              </button>
            </div>
          </div>

          {/* ── Summary Cards ────────────────────────────────────── */}
          <div className="grid grid-cols-3 gap-6 flex-shrink-0">
            <SummaryCard
              label="Website Title"
              value={formData.website_title || 'NOT SET'}
              icon={<Globe size={20} className="text-emerald-600" />}
              sub="Brand Identity"
            />
            <SummaryCard
              label="Contact Status"
              value={formData.contact_email || 'NO EMAIL'}
              icon={<Mail size={20} className="text-blue-600" />}
              sub="Primary Contact"
            />
            <SummaryCard
              label="Profile Status"
              value={status === 'active' ? 'Active' : 'Inactive'}
              icon={
                <CheckCircle
                  size={20}
                  className={
                    status === 'active' ? 'text-green-600' : 'text-gray-400'
                  }
                />
              }
              sub="Live Configuration"
            />
          </div>

          {/* ── Main Form Container ────────────────────────────────── */}
          <div className="flex-1 bg-white border border-gray-200 rounded-2xl shadow-xl flex flex-col overflow-hidden">
            {/* Dark Section Header */}
            <div className="bg-emerald-700 h-12 flex items-center justify-between px-6 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-[4px] h-6 bg-emerald-400 rounded-full" />
                <span className="text-white text-sm font-bold uppercase tracking-[2px]">
                  Website Configuration
                </span>
              </div>
            </div>

            {/* Scrollable Form Body */}
            <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
              <div className="w-full grid grid-cols-12 gap-x-8 gap-y-10">
                {/* LEFT COLUMN: Contact Information */}
                <div className="col-span-4 flex flex-col gap-6">
                  <SectionHeader label="Contact Information" />

                  <Field label="Contact Email">
                    <div className="relative">
                      <Mail
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                        size={16}
                      />
                      <input
                        type="email"
                        value={formData.contact_email}
                        onChange={(e) =>
                          handleInputChange('contact_email', e.target.value)
                        }
                        className={inputCls}
                      />
                    </div>
                  </Field>

                  <Field label="Contact Phone">
                    <div className="relative">
                      <Phone
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                        size={16}
                      />
                      <input
                        type="tel"
                        value={formData.contact_number}
                        onChange={(e) =>
                          handleInputChange('contact_number', e.target.value)
                        }
                        placeholder="+1 (555) 123-4567"
                        className={inputCls}
                      />
                    </div>
                  </Field>

                  <SectionHeader label="Business Location" />
                  <Field label="Complete Address">
                    <div className="relative">
                      <MapPin
                        className="absolute left-3 top-4 text-gray-400"
                        size={16}
                      />
                      <textarea
                        value={formData.location}
                        onChange={(e) =>
                          handleInputChange('location', e.target.value)
                        }
                        rows={3}
                        className={inputCls + ' pl-10 pt-3 resize-none'}
                        placeholder="Street Address, City, State, ZIP Code"
                      />
                    </div>
                  </Field>

                  <SectionHeader label="Footer & Disclaimer" />
                  <Field label="Disclaimer Text">
                    <textarea
                      value={formData.disclaimer}
                      onChange={(e) =>
                        handleInputChange('disclaimer', e.target.value)
                      }
                      rows={5}
                      className={inputCls + ' resize-none'}
                      placeholder="Add any disclaimers, legal notices, or footer text..."
                    />
                  </Field>
                </div>

                {/* CENTER COLUMN: Hero Section Content & About Me */}
                <div className="col-span-4 flex flex-col gap-6">
                  <SectionHeader label="Hero Section Content" />

                  <Field label="Welcome Badge">
                    <div className="relative">
                      <Type
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                        size={16}
                      />
                      <input
                        type="text"
                        value={formData.welcome_badge}
                        onChange={(e) =>
                          handleInputChange('welcome_badge', e.target.value)
                        }
                        placeholder="e.g. 🚀 Welcome to the Future"
                        className={inputCls}
                      />
                    </div>
                  </Field>

                  <Field label="Hero Title">
                    <input
                      type="text"
                      value={formData.hero_title}
                      onChange={(e) =>
                        handleInputChange('hero_title', e.target.value)
                      }
                      placeholder="e.g. Connect, Schedule, and Stay Informed"
                      className={inputCls}
                    />
                  </Field>

                  <Field label="Hero Description">
                    <textarea
                      value={formData.hero_description}
                      onChange={(e) =>
                        handleInputChange('hero_description', e.target.value)
                      }
                      rows={3}
                      className={inputCls + ' resize-none'}
                      placeholder="Describe your platform and its benefits..."
                    />
                  </Field>

                  <SectionHeader label="About Me Section" />
                  <Field label="About Me Description">
                    <textarea
                      value={formData.about_me_description}
                      onChange={(e) =>
                        handleInputChange('about_me_description', e.target.value)
                      }
                      rows={4}
                      className={inputCls + ' resize-none'}
                      placeholder="Write a brief biography or professional background..."
                    />
                  </Field>
                </div>

                {/* RIGHT COLUMN: Visual Assets & Images */}
                <div className="col-span-4 flex flex-col gap-6">
                  <SectionHeader label="Website Branding" />

                  <Field label="Website Title">
                    <div className="relative">
                      <Globe
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                        size={16}
                      />
                      <input
                        type="text"
                        value={formData.website_title}
                        onChange={(e) =>
                          handleInputChange('website_title', e.target.value)
                        }
                        placeholder="e.g. CMO Connect"
                        className={inputCls}
                      />
                    </div>
                  </Field>

                  <Field label="Website Logo">
                    <div className="p-4 bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center gap-4">
                      <div className="w-full h-36 bg-white rounded-xl border border-gray-100 shadow-inner flex items-center justify-center overflow-hidden relative group">
                        {logoPreview ? (
                          <img
                            src={logoPreview}
                            alt="Website Logo"
                            className="w-full h-full object-contain p-4"
                          />
                        ) : (
                          <div className="flex flex-col items-center gap-2 text-gray-300">
                            <Image size={48} strokeWidth={1} />
                            <span className="text-[10px] uppercase font-bold tracking-widest">
                              No Logo
                            </span>
                          </div>
                        )}
                        <label className="absolute inset-0 bg-emerald-600/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                          <input
                            type="file"
                            className="hidden"
                            onChange={handleLogoChange}
                          />
                          <span className="text-white text-xs font-bold uppercase tracking-tighter">
                            Replace Logo
                          </span>
                        </label>
                      </div>
                      <p className="text-[9px] text-gray-400 text-center leading-relaxed px-4">
                        PNG or SVG (Max 2MB)
                      </p>
                    </div>
                  </Field>

                  <Field label="About Me Image">
                    <div className="p-4 bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center gap-4">
                      <div className="w-full h-36 bg-white rounded-xl border border-gray-100 shadow-inner flex items-center justify-center overflow-hidden relative group">
                        {aboutMeImagePreview ? (
                          <img
                            src={aboutMeImagePreview}
                            alt="About Me"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="flex flex-col items-center gap-2 text-gray-300">
                            <Image size={48} strokeWidth={1} />
                            <span className="text-[10px] uppercase font-bold tracking-widest">
                              No Image
                            </span>
                          </div>
                        )}
                        <label className="absolute inset-0 bg-emerald-600/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                          <input
                            type="file"
                            className="hidden"
                            onChange={handleAboutMeImageChange}
                            accept="image/*"
                          />
                          <span className="text-white text-xs font-bold uppercase tracking-tighter">
                            Replace Image
                          </span>
                        </label>
                      </div>
                      <p className="text-[9px] text-gray-400 text-center leading-relaxed px-4">
                        JPG, PNG, or GIF (Max 2MB)
                      </p>
                    </div>
                  </Field>

                  <SectionHeader label="Background Settings" />

                  {/* Background Input Mode Toggle */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => setBackgroundInputMode('text')}
                      className={`flex-1 py-2 px-3 rounded-lg border-2 text-xs font-bold uppercase tracking-widest transition-all ${
                        backgroundInputMode === 'text'
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
                          : 'bg-white border-gray-200 text-gray-400 hover:border-gray-300'
                      }`}
                    >
                      <Type size={14} className="inline mr-2" />
                      CSS
                    </button>
                    <button
                      onClick={() => setBackgroundInputMode('file')}
                      className={`flex-1 py-2 px-3 rounded-lg border-2 text-xs font-bold uppercase tracking-widest transition-all ${
                        backgroundInputMode === 'file'
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
                          : 'bg-white border-gray-200 text-gray-400 hover:border-gray-300'
                      }`}
                    >
                      <Image size={14} className="inline mr-2" />
                      Image
                    </button>
                  </div>

                  {/* Text Input Mode */}
                  {backgroundInputMode === 'text' && (
                    <Field label="CSS Gradient">
                      <div className="relative">
                        <Palette
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                          size={16}
                        />
                        <textarea
                          value={formData.background_value}
                          onChange={(e) =>
                            handleInputChange('background_value', e.target.value)
                          }
                          rows={3}
                          className={inputCls + ' pl-10 pt-3 resize-none'}
                          placeholder="from-emerald-50 via-teal-50 to-cyan-50"
                        />
                      </div>
                    </Field>
                  )}

                  {/* File Upload Mode */}
                  {backgroundInputMode === 'file' && (
                    <Field label="Background Image">
                      <div className="p-4 bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center gap-4">
                        <div className="w-full h-36 bg-white rounded-xl border border-gray-100 shadow-inner flex items-center justify-center overflow-hidden relative group">
                          {backgroundPreview ? (
                            <img
                              src={backgroundPreview}
                              alt="Background"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="flex flex-col items-center gap-2 text-gray-300">
                              <Image size={48} strokeWidth={1} />
                              <span className="text-[10px] uppercase font-bold tracking-widest">
                                No Background
                              </span>
                            </div>
                          )}
                          <label className="absolute inset-0 bg-emerald-600/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                            <input
                              type="file"
                              className="hidden"
                              onChange={handleBackgroundChange}
                              accept="image/*"
                            />
                            <span className="text-white text-xs font-bold uppercase tracking-tighter">
                              Replace
                            </span>
                          </label>
                        </div>
                        <p className="text-[9px] text-gray-400 text-center leading-relaxed px-4">
                          JPG, PNG, or GIF (Max 5MB)
                        </p>
                      </div>
                    </Field>
                  )}
                </div>
              </div>
            </div>

            {/* Footer Status Bar */}
            <div className="bg-gray-50 border-t border-gray-200 px-6 py-3 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-4">
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                  Last Sync:{' '}
                  <span className="text-gray-900 font-black">10:01 AM</span>
                </p>
                <div className="h-3 w-px bg-gray-300" />
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                  Version:{' '}
                  <span className="text-gray-900 font-black">
                    V1.0.0 WEBSITE SETTINGS
                  </span>
                </p>
              </div>
              <p className="text-[11px] font-black text-emerald-600 tracking-[2px] uppercase">
                CMO Connect
              </p>
            </div>
          </div>
        </motion.div>
      </ProtectedAction>
      {toast && (
        <DynamicToast
          type={toast.type}
          message={toast.message}
          onClose={hideToast}
        />
      )}
    </div>
  )
}

// ── Refined Helpers ──────────────────────────────────────────────────────

const inputCls =
  'w-full pl-10 pr-4 py-3 text-sm border-2 border-gray-100 rounded-xl bg-gray-50 text-gray-900 placeholder-gray-300 focus:outline-none focus:border-emerald-600 focus:bg-white focus:ring-4 focus:ring-emerald-50 transition-all font-medium'

function SummaryCard({ label, value, icon, sub }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-3 flex items-center gap-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="w-12 h-12 bg-[#f8f9fa] border border-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">
          {label}
        </p>
        <p className="text-lg font-black text-gray-900 truncate tracking-tight">
          {value}
        </p>
        <p className="text-[9px] text-gray-400 font-bold uppercase tracking-tighter">
          {sub}
        </p>
      </div>
    </div>
  )
}

function Field({ label, children, className = '' }) {
  return (
    <div className={className}>
      <label className="block text-[10px] font-black text-gray-500 uppercase tracking-[1.5px] mb-2">
        {label}
      </label>
      {children}
    </div>
  )
}

function SectionHeader({ label }) {
  return (
    <div className="col-span-full flex items-center gap-4 mt-2">
      <span className="text-[11px] font-black text-gray-900 uppercase tracking-[3px]">
        {label}
      </span>
      <div className="flex-1 h-[2px] bg-gray-100 rounded-full" />
    </div>
  )
}

export default function WebsiteSettings() {
  return (
    <RouteProtection routeName="website_settings">
      <WebsiteSettingsContent />
    </RouteProtection>
  )
}
