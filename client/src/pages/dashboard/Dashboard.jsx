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
  Loader2
} from 'lucide-react';
import RouteProtection from '../../components/RouteProtection';

export default function Dashboard() {
  return (
    <RouteProtection routeName="dashboard">
      <DashboardContent />
    </RouteProtection>
  );
}

function DashboardContent() {
  const [stats, setStats] = useState(null);
  const [recentAppointments, setRecentAppointments] = useState([]);
  const [recentPosts, setRecentPosts] = useState([]);
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
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('token');
        
        const [statsResponse, appointmentsResponse, postsResponse] = await Promise.all([
          fetch(`${import.meta.env.VITE_SERVER_LINK}/dashboard/stats`, {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          fetch(`${import.meta.env.VITE_SERVER_LINK}/dashboard/appointments`, {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          fetch(`${import.meta.env.VITE_SERVER_LINK}/dashboard/posts`, {
            headers: { 'Authorization': `Bearer ${token}` }
          })
        ]);

        if (!statsResponse.ok || !appointmentsResponse.ok || !postsResponse.ok) {
          throw new Error('Failed to fetch dashboard data');
        }

        const [statsData, appointmentsData, postsData] = await Promise.all([
          statsResponse.json(),
          appointmentsResponse.json(),
          postsResponse.json()
        ]);

        setStats(statsData.data);
        setRecentAppointments(appointmentsData.data);
        setRecentPosts(postsData.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin" size={48} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h3 className="text-lg font-bold text-red-600 mb-2">Error loading dashboard</h3>
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
      className="space-y-8 pb-10"
    >
      {/* --- Section 1: Admin Dashboard Stats --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Users" 
          value={stats?.total_users || 0} 
          trend="Active Users" 
          isPositive={null} 
          icon={<Users size={20}/>} 
        />
        <StatCard 
          title="Total Appointments" 
          value={stats?.total_appointments || 0} 
          trend="All Time" 
          isPositive={null} 
          icon={<Calendar size={20}/>} 
        />
        <StatCard 
          title="Pending Appointments" 
          value={stats?.pending_appointments || 0} 
          trend="Action Required" 
          isPositive={false} 
          icon={<Clock size={20}/>} 
        />
        <StatCard 
          title="Total Posts" 
          value={stats?.total_posts || 0} 
          trend="Published" 
          isPositive={true} 
          icon={<MessageSquare size={20}/>} 
        />
      </div>

      {/* --- Section 2: Main Analytics Grid --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Cash Flow Preview (recommended for Accounting) */}
        <motion.div variants={item} className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-bold text-black tracking-tight">Financial Performance</h3>
              <p className="text-xs text-gray-400 uppercase tracking-widest font-semibold mt-1">Monthly Supply vs Services</p>
            </div>
            <select className="bg-gray-50 border border-gray-200 text-xs font-bold py-1.5 px-3 rounded-lg outline-none focus:ring-2 focus:ring-red-600/10 transition-all">
              <option>Last 6 Months</option>
              <option>Year to Date</option>
            </select>
          </div>
          
          {/* Mock Chart Visual */}
          <div className="h-64 w-full bg-slate-50 rounded-xl border border-dashed border-gray-200 flex items-end justify-between p-4 gap-2">
            {[40, 70, 45, 90, 65, 85].map((h, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full bg-red-600/10 rounded-t-md relative group transition-all hover:bg-red-600" style={{ height: `${h}%` }}>
                  <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] py-1 px-2 rounded whitespace-nowrap">
                    ₱{(h * 10).toFixed(1)}k
                  </div>
                </div>
                <span className="text-[10px] font-bold text-gray-400">MON-0{i+1}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Recent Appointments */}
        <motion.div variants={item} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-black tracking-tight">Recent Appointments</h3>
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
              {recentAppointments.length} total
            </span>
          </div>
          <div className="space-y-4">
            {recentAppointments.slice(0, 5).map((appointment) => (
              <div key={appointment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <p className="font-semibold text-sm text-black">{appointment.user_fullname}</p>
                  <p className="text-xs text-gray-500 truncate">{appointment.reason}</p>
                  <p className="text-xs text-gray-400">
                    {new Date(appointment.date).toLocaleDateString()} at {appointment.start_time}
                  </p>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  appointment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  appointment.status === 'approved' ? 'bg-green-100 text-green-800' :
                  appointment.status === 'rejected' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {appointment.status}
                </span>
              </div>
            ))}
            {recentAppointments.length === 0 && (
              <p className="text-center text-gray-500 text-sm py-8">No recent appointments</p>
            )}
          </div>
        </motion.div>

        {/* Recent Posts */}
        <motion.div variants={item} className="bg-black rounded-3xl p-6 text-white shadow-2xl">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <CheckCircle2 size={18} className="text-red-500" />
              Recent Posts
            </h3>
            <span className="text-xs text-gray-400 bg-gray-800 px-2 py-1 rounded-full">
              {recentPosts.length} total
            </span>
          </div>
          <div className="space-y-4">
            {recentPosts.slice(0, 5).map((post) => (
              <div key={post.id} className="border-b border-gray-800 pb-4 last:border-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-semibold text-sm text-white">{post.user_fullname}</p>
                    <p className="text-xs text-gray-400 mt-1 line-clamp-2">{post.content}</p>
                    <p className="text-xs text-gray-600 mt-2">
                      {new Date(post.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ml-3 ${
                    post.type === 'text' ? 'bg-blue-900 text-blue-300' :
                    post.type === 'image' ? 'bg-green-900 text-green-300' :
                    post.type === 'video' ? 'bg-purple-900 text-purple-300' :
                    'bg-gray-800 text-gray-300'
                  }`}>
                    {post.type}
                  </span>
                </div>
              </div>
            ))}
            {recentPosts.length === 0 && (
              <p className="text-center text-gray-500 text-sm py-8">No recent posts</p>
            )}
          </div>
        </motion.div>

      </div>
    </motion.div>
  );
}

// --- Internal Reusable Components ---

function StatCard({ title, value, trend, isPositive, icon }) {
  return (
    <motion.div 
      variants={{ hidden: { scale: 0.9, opacity: 0 }, show: { scale: 1, opacity: 1 }}}
      className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow group"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="p-2.5 bg-gray-50 rounded-xl group-hover:bg-red-50 group-hover:text-red-600 transition-colors text-gray-500">
          {icon}
        </div>
        {trend && (
          <div className={`flex items-center text-xs font-bold ${
            isPositive === null ? 'text-gray-400' : isPositive ? 'text-green-600' : 'text-red-600'
          }`}>
            {isPositive === true && <TrendingUp size={12} className="mr-1" />}
            {isPositive === false && <TrendingDown size={12} className="mr-1" />}
            {trend}
          </div>
        )}
      </div>
      <div>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{title}</p>
        <h4 className="text-2xl font-black text-black mt-1 tracking-tight">{value}</h4>
      </div>
    </motion.div>
  );
}

function TransactionItem({ label, desc, amount, date }) {
  const isNegative = amount.startsWith('-');
  return (
    <div className="flex justify-between items-center group cursor-pointer">
      <div className="flex flex-col">
        <span className="text-xs font-bold text-white group-hover:text-red-500 transition-colors">{label}</span>
        <span className="text-[10px] text-gray-500">{desc}</span>
      </div>
      <div className="text-right">
        <span className={`text-xs font-bold ${isNegative ? 'text-gray-300' : 'text-red-500'}`}>{amount}</span>
        <p className="text-[10px] text-gray-600">{date}</p>
      </div>
    </div>
  );
}