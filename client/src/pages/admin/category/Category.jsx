import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Tag, 
  Plus, 
  ShieldCheck, 
  Search, 
  ArrowRight, 
  Download, 
  Edit2,
  MessageSquare,
  Eye,
  Trash2
} from 'lucide-react';
import DynamicTable from '../../../components/DynamicTable';
import DynamicToast from '../../../components/DynamicToast';
import RouteProtection from '../../../components/RouteProtection';
import ProtectedAction from '../../../components/ProtectedAction';
import RightSideModal from '../../../components/RightSideModal';

function CategoryContent() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [viewingCategory, setViewingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    details: '',
    status: 'active'
  });
  const [toast, setToast] = useState(null);

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  // Fetch categories
  const fetchCategories = async () => {
    setLoading(true);
    setError(null);
    try {
      const adminToken = localStorage.getItem('adminToken');
      const response = await fetch(`${import.meta.env.VITE_SERVER_LINK}/api/categories`, {
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }

      const result = await response.json();
      setCategories(result.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchCategories();
  }, []);

  const handleAddCategoryClick = () => {
    setEditingCategory(null);
    setFormData({ name: '', details: '', status: 'active' });
    setIsModalOpen(true);
  };

  const handleViewCategoryClick = (row) => {
    setViewingCategory(row);
    setIsViewModalOpen(true);
  };

  const handleEditCategoryClick = (row) => {
    setEditingCategory(row);
    setFormData({
      name: row.name || '',
      details: row.details || '',
      status: row.status || 'active'
    });
    setIsModalOpen(true);
  };

  const handleDeleteCategoryClick = async (row) => {
    if (window.confirm(`Are you sure you want to delete category "${row.name}"?`)) {
      try {
        const adminToken = localStorage.getItem('adminToken');
        const response = await fetch(`${import.meta.env.VITE_SERVER_LINK}/api/categories/${row.id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${adminToken}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to delete category');
        }

        setToast({ type: 'success', message: 'Category deleted successfully' });
        fetchCategories();
      } catch (err) {
        setToast({ type: 'error', message: err.message });
      }
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
    setFormData({ name: '', details: '', status: 'active' });
  };

  const handleViewModalClose = () => {
    setIsViewModalOpen(false);
    setViewingCategory(null);
  };

  const handleEditFromView = () => {
    if (viewingCategory) {
      setEditingCategory(viewingCategory);
      setFormData({
        name: viewingCategory.name || '',
        details: viewingCategory.details || '',
        status: viewingCategory.status || 'active'
      });
      setIsViewModalOpen(false);
      setIsModalOpen(true);
    }
  };

  const handleToastClose = () => {
    setToast(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form data
    if (!formData.name.trim()) {
      setToast({
        type: 'error',
        message: 'Category name is required'
      });
      return;
    }
    
    try {
      console.log('Submitting form data:', formData);
      
      const adminToken = localStorage.getItem('adminToken');
      const url = editingCategory 
        ? `${import.meta.env.VITE_SERVER_LINK}/api/categories/${editingCategory.id}`
        : `${import.meta.env.VITE_SERVER_LINK}/api/categories`;
      
      const method = editingCategory ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save category');
      }

      setToast({
        type: 'success',
        message: `Category "${formData.name}" ${editingCategory ? 'updated' : 'created'} successfully!` 
      });
      setIsModalOpen(false);
      setEditingCategory(null);
      // Reset form data
      setFormData({
        name: '',
        details: '',
        status: 'active'
      });
      fetchCategories();
    } catch (error) {
      console.error('Submit error:', error);
      setToast({
        type: 'error',
        message: `Network error occurred while ${editingCategory ? 'updating' : 'creating'} category` 
      });
    }
  };

  if (loading) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs font-black uppercase tracking-[3px] text-gray-400">Syncing Category Database...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-10 flex items-center justify-center">
        <div className="bg-red-50 border-l-4 border-red-600 p-6 rounded-r-xl shadow-sm">
          <h3 className="text-red-800 font-bold uppercase text-sm">System Error</h3>
          <p className="text-red-600 text-sm mt-1">{error}</p>
        </div>
      </div>
    );
  }

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'name', label: 'Name' },
    { key: 'details', label: 'Details' },
    { 
      key: 'status', 
      label: 'Status',
      render: (value) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          value === 1 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {value === 1 ? 'Active' : 'Inactive'}
        </span>
      )
    },
    { 
      key: 'created_at', 
      label: 'Created',
      render: (value) => new Date(value).toLocaleDateString()
    }
  ];

  const actions = [
    {
      icon: Edit2,
      label: 'Edit',
      onClick: handleEditCategoryClick,
      className: 'text-emerald-600 hover:bg-emerald-50'
    }
  ];

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
                <Tag size={24} />
              </div>
              <h1 className="text-4xl font-black text-black tracking-tighter">
                Category <span className="text-emerald-600 italic">Registry</span>
              </h1>
            </div>
          </div>

          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-5 py-3 bg-white border border-gray-200 text-xs font-bold text-black rounded-xl hover:bg-gray-50 transition-all shadow-sm">
              <Download size={14} />
              EXPORT LIST
            </button>
            <ProtectedAction routeName="categories">
              <button onClick={handleAddCategoryClick} className="flex items-center gap-2 px-6 py-3 bg-black text-white text-xs font-bold rounded-xl hover:bg-emerald-600 transition-all uppercase tracking-widest">
                <Plus size={14} />
                Add Category
              </button>
            </ProtectedAction>
          </div>
        </motion.div>

        {/* --- SUMMARY TILES --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <SummaryCard
            icon={<Tag className="text-emerald-600" size={20} />}
            label="Total Categories"
            value={categories?.length || 0}
            subText="System Categories"
          />
          <SummaryCard
            icon={<ShieldCheck className="text-black" size={20} />}
            label="Active"
            value={categories?.filter(c => c.status === 'active').length || 0}
            subText="Enabled Categories"
          />
          <SummaryCard
            icon={<Search className="text-gray-400" size={20} />}
            label="Inactive"
            value={categories?.filter(c => c.status === 'inactive').length || 0}
            subText="Disabled Categories"
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
          data={categories}
          title="Category table"
          enableAddButton={false}
          enableActionColumn={true}
          actionButtons={actions}
          badgeColumns={[
            {
              column: 'status',
              values: {
                1: 'green',
                0: 'red'
              }
            }
          ]}
        />
      </motion.div>

      {/* Add Category Modal */}
      <RightSideModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingCategory ? 'Edit Category' : 'Create New Category'}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-700 mb-2">
                Category Name <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                placeholder="Enter category name..."
                required
              />
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-700 mb-2">
                Details
              </label>
              <textarea
                value={formData.details}
                onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                rows="4"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                placeholder="Enter category details..."
              />
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-700 mb-2">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
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
              {editingCategory ? 'Update Category' : 'Create Category'}
            </button>
          </div>
        </form>
      </RightSideModal>

      {/* View Category Modal */}
      <RightSideModal
        isOpen={isViewModalOpen}
        onClose={handleViewModalClose}
        title="View Category Details"
      >
        {viewingCategory && (
          <div className="space-y-4">
            {/* Header Section */}
            <div className="border-b border-gray-200 pb-4">
              <h3 className="text-lg font-black text-black uppercase tracking-tight mb-2">Category Details</h3>
              <div className="flex items-center gap-3">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${
                  viewingCategory.status === 'active' 
                    ? 'bg-green-100 text-green-800 border-green-200'
                    : 'bg-red-100 text-red-800 border-red-200'
                }`}>
                  {viewingCategory.status === 'active' ? 'ACTIVE' : 'INACTIVE'}
                </span>
                <span className="text-xs text-gray-500">
                  ID: #{viewingCategory.id}
                </span>
              </div>
            </div>

            {/* Name Section */}
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Name</label>
              <h4 className="text-base font-bold text-black leading-tight">
                {viewingCategory.name || 'Untitled Category'}
              </h4>
            </div>

            {/* Details Section */}
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Details</label>
              <div className="bg-white p-4 rounded-lg border border-gray-200 min-h-[120px]">
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {viewingCategory.details || 'No details available'}
                </p>
              </div>
            </div>

            {/* Created Date Section */}
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Created Date</label>
              <p className="text-sm text-gray-600">
                {viewingCategory.created_at ? 
                  new Date(viewingCategory.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  }) : 
                  'Unknown'
                }
              </p>
            </div>

            {/* Updated Date Section */}
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Updated Date</label>
              <p className="text-sm text-gray-600">
                {viewingCategory.updated_at ? 
                  new Date(viewingCategory.updated_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  }) : 
                  'Unknown'
                }
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                onClick={handleEditFromView}
                className="flex-1 px-4 py-3 bg-black text-white text-xs font-black rounded-xl hover:bg-emerald-600 transition-all uppercase tracking-widest flex items-center justify-center gap-2"
              >
                <Edit2 size={14} />
                Edit Category
              </button>
              <button
                onClick={handleViewModalClose}
                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 text-xs font-black rounded-xl hover:bg-gray-200 transition-all uppercase tracking-widest"
              >
                Close
              </button>
            </div>
          </div>
        )}
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
  );
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
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{label}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          <p className="text-xs text-gray-600 mt-1">{subText}</p>
        </div>
        <div className="p-3 bg-gray-50 rounded-lg">
          {icon}
        </div>
      </div>
    </motion.div>
  );
}

export default function Category() {
  return (
    <RouteProtection>
      <CategoryContent />
    </RouteProtection>
  );
}
