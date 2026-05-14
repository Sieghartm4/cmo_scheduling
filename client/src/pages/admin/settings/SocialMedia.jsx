import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Globe, Plus, ShieldCheck, Search, Download, Edit2 } from 'lucide-react'
import DynamicTable from '../../../components/DynamicTable'
import DynamicToast from '../../../components/DynamicToast'
import RouteProtection from '../../../components/RouteProtection'
import ProtectedAction from '../../../components/ProtectedAction'
import RightSideModal from '../../../components/RightSideModal'

function SocialMediaContent() {
  const [socialMediaLinks, setSocialMediaLinks] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingLink, setEditingLink] = useState(null)
  const [formData, setFormData] = useState({
    platform: '',
    url: '',
    status: 'active',
  })
  const [toast, setToast] = useState(null)

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  }

  // Fetch social media links
  const fetchSocialMedia = async () => {
    setLoading(true)
    setError(null)
    try {
      const adminToken = localStorage.getItem('adminToken')
      const response = await fetch(
        `${import.meta.env.VITE_SERVER_LINK}/api/social-media`,
        {
          headers: {
            Authorization: `Bearer ${adminToken}`,
          },
        },
      )

      if (!response.ok) {
        throw new Error('Failed to fetch social media links')
      }

      const result = await response.json()
      setSocialMediaLinks(result.data || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    fetchSocialMedia()
  }, [])

  const handleAddLinkClick = () => {
    setEditingLink(null)
    setFormData({ platform: '', url: '', status: 'active' })
    setIsModalOpen(true)
  }

  const handleEditLinkClick = (row) => {
    setEditingLink(row)
    setFormData({
      platform: row.platform || '',
      url: row.url || '',
      status: row.status || 'active',
    })
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingLink(null)
    setFormData({ platform: '', url: '', status: 'active' })
  }

  const handleToastClose = () => {
    setToast(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validate form data
    if (!formData.platform.trim()) {
      setToast({
        type: 'error',
        message: 'Platform name is required',
      })
      return
    }

    if (!formData.url.trim()) {
      setToast({
        type: 'error',
        message: 'URL is required',
      })
      return
    }

    // Basic URL validation
    try {
      new URL(formData.url)
    } catch {
      setToast({
        type: 'error',
        message: 'Please enter a valid URL',
      })
      return
    }

    try {
      const adminToken = localStorage.getItem('adminToken')
      const adminData = JSON.parse(localStorage.getItem('admin'))
      const mu_id = adminData?.id || 1

      const url = editingLink
        ? `${import.meta.env.VITE_SERVER_LINK}/api/social-media/${editingLink.id}`
        : `${import.meta.env.VITE_SERVER_LINK}/api/social-media`

      const method = editingLink ? 'PUT' : 'POST'

      const payload = editingLink
        ? {
            platform: formData.platform,
            url: formData.url,
            status: formData.status,
          }
        : {
            mu_id,
            platform: formData.platform,
            url: formData.url,
            status: formData.status,
          }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to save social media link')
      }

      setToast({
        type: 'success',
        message: `Social media link "${formData.platform}" ${editingLink ? 'updated' : 'created'} successfully!`,
      })
      setIsModalOpen(false)
      setEditingLink(null)
      setFormData({ platform: '', url: '', status: 'active' })
      fetchSocialMedia()
    } catch (error) {
      console.error('Submit error:', error)
      setToast({
        type: 'error',
        message: `Network error occurred while ${editingLink ? 'updating' : 'creating'} social media link`,
      })
    }
  }

  if (loading) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs font-black uppercase tracking-[3px] text-gray-400">
          Syncing Social Media Database...
        </p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-10 flex items-center justify-center">
        <div className="bg-red-50 border-l-4 border-red-600 p-6 rounded-r-xl shadow-sm">
          <h3 className="text-red-800 font-bold uppercase text-sm">System Error</h3>
          <p className="text-red-600 text-sm mt-1">{error}</p>
        </div>
      </div>
    )
  }

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'platform', label: 'Platform' },
    { key: 'url', label: 'URL' },
    {
      key: 'status',
      label: 'Status',
      render: (value) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            value === 'active' || value === 1
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {value === 'active' || value === 1 ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      key: 'created_at',
      label: 'Created',
      render: (value) => new Date(value).toLocaleDateString(),
    },
  ]

  const actions = [
    {
      icon: Edit2,
      label: 'Edit',
      onClick: handleEditLinkClick,
      className: 'text-emerald-600 hover:bg-emerald-50',
    },
  ]

  return (
    <div className="h-full flex flex-col bg-transparent overflow-hidden">
      {/* --- HEADER SECTION --- */}
      <div className="flex-shrink-0">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-4"
        >
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-black rounded-lg text-emerald-500 shadow-lg shadow-black/20">
                <Globe size={24} />
              </div>
              <h1 className="text-4xl font-black text-black tracking-tighter">
                Social Media <span className="text-emerald-600 italic">Links</span>
              </h1>
            </div>
          </div>

          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-5 py-3 bg-white border border-gray-200 text-xs font-bold text-black rounded-xl hover:bg-gray-50 transition-all shadow-sm">
              <Download size={14} />
              EXPORT LIST
            </button>
            <ProtectedAction routeName="socialMedia">
              <button
                onClick={handleAddLinkClick}
                className="flex items-center gap-2 px-6 py-3 bg-black text-white text-xs font-bold rounded-xl hover:bg-emerald-600 transition-all uppercase tracking-widest"
              >
                <Plus size={14} />
                Add Link
              </button>
            </ProtectedAction>
          </div>
        </motion.div>

        {/* --- SUMMARY TILES --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <SummaryCard
            icon={<Globe className="text-emerald-600" size={20} />}
            label="Total Links"
            value={socialMediaLinks?.length || 0}
            subText="Social Media Accounts"
          />
          <SummaryCard
            icon={<ShieldCheck className="text-black" size={20} />}
            label="Active"
            value={
              socialMediaLinks?.filter((l) => l.status === 'active').length || 0
            }
            subText="Enabled Links"
          />
          <SummaryCard
            icon={<Search className="text-gray-400" size={20} />}
            label="Inactive"
            value={
              socialMediaLinks?.filter((l) => l.status !== 'active').length || 0
            }
            subText="Disabled Links"
          />
        </div>
      </div>

      {/* --- TABLE SECTION --- */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="flex-1 min-h-0 bg-white rounded-2xl shadow-xl shadow-black/5 overflow-hidden border border-gray-100"
      >
        <DynamicTable
          data={socialMediaLinks}
          title="Social Media Links table"
          enableAddButton={false}
          enableActionColumn={true}
          actionButtons={actions}
          badgeColumns={[
            {
              column: 'status',
              values: {
                ACTIVE: 'green',
                INACTIVE: 'red',
              },
            },
          ]}
        />
      </motion.div>

      {/* Add/Edit Link Modal */}
      <RightSideModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingLink ? 'Edit Social Media Link' : 'Add New Social Media Link'}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-700 mb-2">
                Platform Name <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                value={formData.platform}
                onChange={(e) =>
                  setFormData({ ...formData, platform: e.target.value })
                }
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                placeholder="e.g., Facebook, Twitter, Instagram..."
                required
              />
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-700 mb-2">
                Profile URL <span className="text-red-600">*</span>
              </label>
              <input
                type="url"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                placeholder="https://example.com/profile"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-700 mb-2">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value })
                }
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleCloseModal}
              className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 text-xs font-black rounded-xl hover:bg-gray-200 transition-all uppercase tracking-widest"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-black text-white text-xs font-black rounded-xl hover:bg-emerald-600 transition-all uppercase tracking-widest flex items-center justify-center gap-2"
            >
              <Plus size={14} />
              {editingLink ? 'Update Link' : 'Add Link'}
            </button>
          </div>
        </form>
      </RightSideModal>

      {/* Toast */}
      {toast && (
        <DynamicToast
          type={toast.type}
          message={toast.message}
          onClose={handleToastClose}
        />
      )}
    </div>
  )
}

// Summary Card Component
function SummaryCard({ icon, label, value, subText }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
            {label}
          </p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          <p className="text-xs text-gray-600 mt-1">{subText}</p>
        </div>
        <div className="p-3 bg-gray-50 rounded-lg">{icon}</div>
      </div>
    </motion.div>
  )
}

export default function SocialMedia() {
  return (
    <RouteProtection>
      <SocialMediaContent />
    </RouteProtection>
  )
}
