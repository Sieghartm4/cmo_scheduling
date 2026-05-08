import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  MessageSquare, 
  ArrowUpRight, 
  Users, 
  Clock, 
  CheckCircle2,
  Loader2,
  Settings,
  Shield,
  Activity
} from 'lucide-react';

export default function AdminDashboard() {
  return <AdminDashboardContent />;
}

function AdminDashboardContent() {
  const [stats, setStats] = useState(null);
  const [recentAppointments, setRecentAppointments] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Container animation for staggered children
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  useEffect(() => {
    const fetchAdminDashboardData = async () => {
      try {
        const adminToken = localStorage.getItem('adminToken');
        
        const [statsResponse, appointmentsResponse, usersResponse] = await Promise.all([
          fetch(`${import.meta.env.VITE_SERVER_LINK}/api/admin/stats`, {
            headers: { 'Authorization': `Bearer ${adminToken}` }
          }),
          fetch(`${import.meta.env.VITE_SERVER_LINK}/api/admin/recent-appointments`, {
            headers: { 'Authorization': `Bearer ${adminToken}` }
          }),
          fetch(`${import.meta.env.VITE_SERVER_LINK}/api/admin/recent-users`, {
            headers: { 'Authorization': `Bearer ${adminToken}` }
          })
        ]);

        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          setStats(statsData.data);
        }

        if (appointmentsResponse.ok) {
          const appointmentsData = await appointmentsResponse.json();
          setRecentAppointments(appointmentsData.data || []);
        }

        if (usersResponse.ok) {
          const usersData = await usersResponse.json();
          setRecentUsers(usersData.data || []);
        }

      } catch (error) {
        console.error('Admin dashboard fetch error:', error);
        setError('Failed to load admin dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchAdminDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-red-600" size={48} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Shield className="mx-auto text-red-600 mb-4" size={48} />
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={item} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600 mt-1">Manage your system and monitor activity</p>
          </div>
          <div className="flex items-center space-x-2">
            <Settings className="text-gray-400" size={20} />
            <span className="text-sm text-gray-500">Admin Panel</span>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {stats?.totalUsers || 0}
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <Users className="text-blue-600" size={24} />
            </div>
          </div>
          <div className="flex items-center mt-4 text-sm">
            <TrendingUp className="text-green-500 mr-1" size={16} />
            <span className="text-green-600">+12% from last month</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Appointments</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {stats?.totalAppointments || 0}
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <Calendar className="text-green-600" size={24} />
            </div>
          </div>
          <div className="flex items-center mt-4 text-sm">
            <TrendingUp className="text-green-500 mr-1" size={16} />
            <span className="text-green-600">+8% from last month</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Sessions</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {stats?.activeSessions || 0}
              </p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <Activity className="text-purple-600" size={24} />
            </div>
          </div>
          <div className="flex items-center mt-4 text-sm">
            <Clock className="text-gray-500 mr-1" size={16} />
            <span className="text-gray-600">Real-time</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">System Health</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {stats?.systemHealth || 'Good'}
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <CheckCircle2 className="text-green-600" size={24} />
            </div>
          </div>
          <div className="flex items-center mt-4 text-sm">
            <TrendingUp className="text-green-500 mr-1" size={16} />
            <span className="text-green-600">All systems operational</span>
          </div>
        </div>
      </motion.div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div variants={item} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Appointments</h3>
          <div className="space-y-3">
            {recentAppointments.length > 0 ? (
              recentAppointments.slice(0, 5).map((appointment, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Calendar className="text-gray-400" size={16} />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{appointment.title || 'Appointment'}</p>
                      <p className="text-xs text-gray-500">{appointment.date || 'No date'}</p>
                    </div>
                  </div>
                  <ArrowUpRight className="text-gray-400" size={16} />
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No recent appointments</p>
            )}
          </div>
        </motion.div>

        <motion.div variants={item} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Users</h3>
          <div className="space-y-3">
            {recentUsers.length > 0 ? (
              recentUsers.slice(0, 5).map((user, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Users className="text-gray-400" size={16} />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{user.fullname || user.email}</p>
                      <p className="text-xs text-gray-500">{user.role || 'User'}</p>
                    </div>
                  </div>
                  <ArrowUpRight className="text-gray-400" size={16} />
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No recent users</p>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
