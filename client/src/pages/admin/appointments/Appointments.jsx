import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  Clock, 
  User, 
  Plus, 
  Edit2, 
  Trash2, 
  Eye, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  RefreshCw,
  ShieldCheck,
  Search,
  ArrowRight,
  Download,
  MessageSquare
} from 'lucide-react';
import DynamicTable from '../../../components/DynamicTable';
import DynamicToast from '../../../components/DynamicToast';
import RouteProtection from '../../../components/RouteProtection';
import ProtectedAction from '../../../components/ProtectedAction';
import RightSideModal from '../../../components/RightSideModal';

function AppointmentsContent() {
  const [appointments, setAppointments] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [viewingAppointment, setViewingAppointment] = useState(null);
  const [formData, setFormData] = useState({
    app_mu_id: '',
    app_date: '',
    app_start_time: '',
    app_end_time: '',
    app_reason: '',
    app_notes: '',
    app_status: 'pending'
  });
  const [toast, setToast] = useState(null);

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  // Fetch appointments
  const fetchAppointments = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${import.meta.env.VITE_SERVER_LINK}/api/appointments`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setAppointments(result.data);
        }
      } else {
        throw new Error('Failed to fetch appointments');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch users
  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${import.meta.env.VITE_SERVER_LINK}/api/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setUsers(result.data);
        }
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  useEffect(() => {
    fetchAppointments();
    fetchUsers();
  }, []);

  const handleAddAppointmentClick = () => {
    setEditingAppointment(null);
    setFormData({
      app_mu_id: '',
      app_date: '',
      app_start_time: '',
      app_end_time: '',
      app_reason: '',
      app_notes: '',
      app_status: 'pending'
    });
    setIsModalOpen(true);
  };

  const handleViewAppointmentClick = (row) => {
    setViewingAppointment(row);
    setIsViewModalOpen(true);
  };

  const handleEditAppointmentClick = (row) => {
    setEditingAppointment(row);
    setFormData({
      app_mu_id: row.app_mu_id,
      app_date: row.app_date,
      app_start_time: row.app_start_time,
      app_end_time: row.app_end_time,
      app_reason: row.app_reason,
      app_notes: row.app_notes || '',
      app_status: row.app_status
    });
    setIsModalOpen(true);
  };

  const handleDeleteAppointmentClick = async (row) => {
    if (window.confirm(`Are you sure you want to delete appointment for "${row.mu_fullname}"?`)) {
      try {
        const token = localStorage.getItem('adminToken');
        const response = await fetch(`${import.meta.env.VITE_SERVER_LINK}/api/appointments/${row.app_id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
          throw new Error('Failed to delete appointment');
        }

        setToast({ type: 'success', message: 'Appointment deleted successfully' });
        fetchAppointments();
      } catch (err) {
        setToast({ type: 'error', message: err.message });
      }
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingAppointment(null);
    setFormData({
      app_mu_id: '',
      app_date: '',
      app_start_time: '',
      app_end_time: '',
      app_reason: '',
      app_notes: '',
      app_status: 'pending'
    });
  };

  const handleViewModalClose = () => {
    setIsViewModalOpen(false);
    setViewingAppointment(null);
  };

  const handleEditFromView = () => {
    if (viewingAppointment) {
      setEditingAppointment(viewingAppointment);
      setFormData({
        app_mu_id: viewingAppointment.app_mu_id,
        app_date: viewingAppointment.app_date,
        app_start_time: viewingAppointment.app_start_time,
        app_end_time: viewingAppointment.app_end_time,
        app_reason: viewingAppointment.app_reason,
        app_notes: viewingAppointment.app_notes || '',
        app_status: viewingAppointment.app_status
      });
      setIsViewModalOpen(false);
      setIsModalOpen(true);
    }
  };

  const handleToastClose = () => {
    setToast(null);
  };

  const updateStatus = async (id, status) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${import.meta.env.VITE_SERVER_LINK}/api/appointments/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ app_status: status })
      });
      
      if (response.ok) {
        setToast({ type: 'success', message: `Appointment status updated to ${status}` });
        fetchAppointments();
      } else {
        throw new Error('Failed to update status');
      }
    } catch (error) {
      setToast({ type: 'error', message: error.message });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form data
    if (!formData.app_mu_id || !formData.app_date || !formData.app_start_time || !formData.app_end_time || !formData.app_reason) {
      setToast({
        type: 'error',
        message: 'Please fill in all required fields'
      });
      return;
    }
    
    try {
      const token = localStorage.getItem('adminToken');
      const url = editingAppointment 
        ? `${import.meta.env.VITE_SERVER_LINK}/api/appointments/${editingAppointment.app_id}`
        : `${import.meta.env.VITE_SERVER_LINK}/api/appointments`;
      
      const method = editingAppointment ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save appointment');
      }

      setToast({
        type: 'success',
        message: `Appointment ${editingAppointment ? 'updated' : 'created'} successfully!`
      });
      setIsModalOpen(false);
      setEditingAppointment(null);
      setFormData({
        app_mu_id: '',
        app_date: '',
        app_start_time: '',
        app_end_time: '',
        app_reason: '',
        app_notes: '',
        app_status: 'pending'
      });
      fetchAppointments();
    } catch (error) {
      setToast({
        type: 'error',
        message: `Network error occurred while ${editingAppointment ? 'updating' : 'creating'} appointment`
      });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'text-emerald-600 bg-emerald-50';
      case 'rejected': return 'text-red-600 bg-red-50';
      case 'cancelled': return 'text-gray-600 bg-gray-50';
      case 'done': return 'text-blue-600 bg-blue-50';
      default: return 'text-yellow-600 bg-yellow-50';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved': return <CheckCircle size={16} />;
      case 'rejected': return <XCircle size={16} />;
      case 'cancelled': return <AlertCircle size={16} />;
      case 'done': return <CheckCircle size={16} />;
      default: return <Clock size={16} />;
    }
  };

  if (loading) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs font-black uppercase tracking-[3px] text-gray-400">Syncing Appointment Database...</p>
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
    { key: 'app_id', label: 'ID' },
    { key: 'mu_fullname', label: 'User' },
    { key: 'app_date', label: 'Date' },
    { key: 'app_start_time', label: 'Start Time' },
    { key: 'app_end_time', label: 'End Time' },
    { key: 'app_reason', label: 'Reason' },
    { 
      key: 'app_status', 
      label: 'Status',
      render: (value) => (
        <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(value)}`}>
          {getStatusIcon(value)}
          {value}
        </span>
      )
    }
  ];

  const handleBulkApprove = async (selectedRows) => {
    if (!selectedRows || selectedRows.length === 0) {
      setToast({ type: 'error', message: 'Please select appointments to approve' });
      return;
    }

    try {
      const token = localStorage.getItem('adminToken');
      const approvePromises = selectedRows.map(row => 
        fetch(`${import.meta.env.VITE_SERVER_LINK}/api/appointments/${row.id}/status`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ app_status: 'approved' })
        })
      );

      await Promise.all(approvePromises);
      setToast({ type: 'success', message: `${selectedRows.length} appointment(s) approved successfully` });
      fetchAppointments();
    } catch (error) {
      setToast({ type: 'error', message: 'Failed to approve appointments' });
    }
  };

  const handleBulkReject = async (selectedRows) => {
    if (!selectedRows || selectedRows.length === 0) {
      setToast({ type: 'error', message: 'Please select appointments to reject' });
      return;
    }

    try {
      const token = localStorage.getItem('adminToken');
      const rejectPromises = selectedRows.map(row => 
        fetch(`${import.meta.env.VITE_SERVER_LINK}/api/appointments/${row.id}/status`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ app_status: 'rejected' })
        })
      );

      await Promise.all(rejectPromises);
      setToast({ type: 'success', message: `${selectedRows.length} appointment(s) rejected successfully` });
      fetchAppointments();
    } catch (error) {
      setToast({ type: 'error', message: 'Failed to reject appointments' });
    }
  };

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
                <Calendar size={24} />
              </div>
              <h1 className="text-4xl font-black text-black tracking-tighter">
                Appointment <span className="text-emerald-600 italic">Registry</span>
              </h1>
            </div>
          </div>

          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-5 py-3 bg-white border border-gray-200 text-xs font-bold text-black rounded-xl hover:bg-gray-50 transition-all shadow-sm">
              <Download size={14} />
              EXPORT LIST
            </button>
          </div>
        </motion.div>

        {/* --- SUMMARY TILES --- */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <SummaryCard
            icon={<Calendar className="text-emerald-600" size={20} />}
            label="Total Appointments"
            value={appointments?.length || 0}
            subText="All Appointments"
          />
          <SummaryCard
            icon={<Clock className="text-yellow-600" size={20} />}
            label="Pending"
            value={appointments?.filter(a => a.app_status === 'pending').length || 0}
            subText="Awaiting Review"
          />
          <SummaryCard
            icon={<CheckCircle className="text-emerald-600" size={20} />}
            label="Approved"
            value={appointments?.filter(a => a.app_status === 'approved').length || 0}
            subText="Confirmed Appointments"
          />
          <SummaryCard
            icon={<AlertCircle className="text-gray-400" size={20} />}
            label="Other"
            value={appointments?.filter(a => !['pending', 'approved'].includes(a.app_status)).length || 0}
            subText="Rejected/Cancelled/Done"
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
          data={appointments}
          title="Appointment table"
          enableAddButton={false}
          enableActionColumn={false}
          enableCheckbox={true}
          checkboxColumn="app_id"
          checkboxCondition={{ column: 'app_status', value: 'pending' }}
          checkboxConditionAll={true}
          checkboxActions={[
            {
              label: 'Approve Selected',
              onClick: handleBulkApprove,
              icon: CheckCircle
            },
            {
              label: 'Reject Selected',
              onClick: handleBulkReject,
              icon: XCircle,
              className: 'bg-red-600 border-red-600 hover:bg-red-200 hover:text-red-700 hover:border-red-300'
            }
          ]}
          badgeColumns={[
            {
              column: 'status',
              values: {
                'APPROVED': 'green',
                'REJECTED': 'red',
                'PENDING': 'yellow',
              },
            },
          ]}
        />
      </motion.div>

      {/* Add/Edit Appointment Modal */}
      <RightSideModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingAppointment ? 'Edit Appointment' : 'Create New Appointment'}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-700 mb-2">
                User <span className="text-red-600">*</span>
              </label>
              <select
                value={formData.app_mu_id}
                onChange={(e) => setFormData({ ...formData, app_mu_id: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                required
              >
                <option value="">Select User</option>
                {users.map(user => (
                  <option key={user.mu_id} value={user.mu_id}>
                    {user.mu_fullname}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-700 mb-2">
                Date <span className="text-red-600">*</span>
              </label>
              <input
                type="date"
                value={formData.app_date}
                onChange={(e) => setFormData({ ...formData, app_date: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-700 mb-2">
                  Start Time <span className="text-red-600">*</span>
                </label>
                <input
                  type="time"
                  value={formData.app_start_time}
                  onChange={(e) => setFormData({ ...formData, app_start_time: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-700 mb-2">
                  End Time <span className="text-red-600">*</span>
                </label>
                <input
                  type="time"
                  value={formData.app_end_time}
                  onChange={(e) => setFormData({ ...formData, app_end_time: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-700 mb-2">
                Reason <span className="text-red-600">*</span>
              </label>
              <textarea
                value={formData.app_reason}
                onChange={(e) => setFormData({ ...formData, app_reason: e.target.value })}
                rows="3"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                placeholder="Enter appointment reason..."
                required
              />
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-700 mb-2">
                Notes
              </label>
              <textarea
                value={formData.app_notes}
                onChange={(e) => setFormData({ ...formData, app_notes: e.target.value })}
                rows="2"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                placeholder="Additional notes..."
              />
            </div>

            {editingAppointment && (
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={formData.app_status}
                  onChange={(e) => setFormData({ ...formData, app_status: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                >
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="done">Done</option>
                </select>
              </div>
            )}
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
              {editingAppointment ? 'Update Appointment' : 'Create Appointment'}
            </button>
          </div>
        </form>
      </RightSideModal>

      {/* View Appointment Modal */}
      <RightSideModal
        isOpen={isViewModalOpen}
        onClose={handleViewModalClose}
        title="View Appointment Details"
      >
        {viewingAppointment && (
          <div className="space-y-4">
            {/* Header Section */}
            <div className="border-b border-gray-200 pb-4">
              <h3 className="text-lg font-black text-black uppercase tracking-tight mb-2">Appointment Details</h3>
              <div className="flex items-center gap-3">
                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(viewingAppointment.app_status)}`}>
                  {getStatusIcon(viewingAppointment.app_status)}
                  {viewingAppointment.app_status?.toUpperCase()}
                </span>
                <span className="text-xs text-gray-500">
                  ID: #{viewingAppointment.app_id}
                </span>
              </div>
            </div>

            {/* User Section */}
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">User</label>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                  <User size={16} className="text-emerald-600" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-black">{viewingAppointment.mu_fullname}</h4>
                  <p className="text-sm text-gray-600">{viewingAppointment.mu_email}</p>
                </div>
              </div>
            </div>

            {/* Date & Time Section */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Date</label>
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-emerald-600" />
                  <p className="text-sm text-gray-700">
                    {viewingAppointment.app_date ? 
                      new Date(viewingAppointment.app_date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      }) : 
                      'Unknown'
                    }
                  </p>
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Time</label>
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-emerald-600" />
                  <p className="text-sm text-gray-700">
                    {viewingAppointment.app_start_time} - {viewingAppointment.app_end_time}
                  </p>
                </div>
              </div>
            </div>

            {/* Reason Section */}
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Reason</label>
              <div className="bg-white p-4 rounded-lg border border-gray-200 min-h-[80px]">
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {viewingAppointment.app_reason || 'No reason provided'}
                </p>
              </div>
            </div>

            {/* Notes Section */}
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Notes</label>
              <div className="bg-white p-4 rounded-lg border border-gray-200 min-h-[80px]">
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {viewingAppointment.app_notes || 'No notes available'}
                </p>
              </div>
            </div>

            {/* Created/Updated Section */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Created Date</label>
                <p className="text-sm text-gray-600">
                  {viewingAppointment.created_at ? 
                    new Date(viewingAppointment.created_at).toLocaleDateString('en-US', {
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
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Updated Date</label>
                <p className="text-sm text-gray-600">
                  {viewingAppointment.updated_at ? 
                    new Date(viewingAppointment.updated_at).toLocaleDateString('en-US', {
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
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                onClick={handleEditFromView}
                className="flex-1 px-4 py-3 bg-black text-white text-xs font-black rounded-xl hover:bg-emerald-600 transition-all uppercase tracking-widest flex items-center justify-center gap-2"
              >
                <Edit2 size={14} />
                Edit Appointment
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

export default function Appointments() {
  return (
    <RouteProtection>
      <AppointmentsContent />
    </RouteProtection>
  );
}
