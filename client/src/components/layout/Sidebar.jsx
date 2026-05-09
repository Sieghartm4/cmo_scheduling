import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Calendar, Users, Settings, Activity, ChevronRight, MessageSquare, Tag } from 'lucide-react';

export default function Sidebar({ isCollapsed }) {
    const [isDashboardOpen, setIsDashboardOpen] = useState(false);
    const [isUsersOpen, setIsUsersOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const location = useLocation();
    const [user, setUser] = useState(null);

    useEffect(() => {
        try {
            const userData = JSON.parse(localStorage.getItem('user'));
            const adminData = JSON.parse(localStorage.getItem('admin'));
            
            if (userData) {
                setUser(userData);
            } else if (adminData) {
                setUser(adminData);
            }
        } catch (error) {
            console.error('Error loading user data:', error);
        }
    }, []);

    useEffect(() => {
        const currentPath = location.pathname;
        
        if (currentPath.includes('/dashboard')) {
            setIsDashboardOpen(true);
            setIsUsersOpen(false);
            setIsSettingsOpen(false);
        } else if (currentPath.includes('/users')) {
            setIsDashboardOpen(false);
            setIsUsersOpen(true);
            setIsSettingsOpen(false);
        } else if (currentPath.includes('/settings')) {
            setIsDashboardOpen(false);
            setIsUsersOpen(false);
            setIsSettingsOpen(true);
        } else {
            setIsDashboardOpen(true);
            setIsUsersOpen(false);
            setIsSettingsOpen(false);
        }
    }, [location.pathname]);

    function NavLink({ to, icon: Icon, children }) {
        const isActive = location.pathname === to || location.pathname.startsWith(to);
        return (
            <Link
                to={to}
                className={`flex items-center gap-3 px-3 py-3 rounded-xl font-semibold transition-all duration-200 group ${
                    isActive 
                        ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/20' 
                        : 'text-emerald-300 hover:bg-emerald-50 hover:text-emerald-700'
                }`}
            >
                <Icon size={20} className={isActive ? 'text-white' : 'group-hover:text-emerald-700'} />
                {!isCollapsed && <span className="text-sm">{children}</span>}
            </Link>
        );
    };

    return (
        <aside className={`${isCollapsed ? 'w-20' : 'w-72'} bg-gradient-to-b from-emerald-900 to-emerald-800 text-white flex flex-col shrink-0 transition-all duration-300 ease-in-out`}>
            <style dangerouslySetInnerHTML={{
                __html: `
                .custom-sidebar-scrollbar::-webkit-scrollbar {
                    width: 5px;
                }
                .custom-sidebar-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-sidebar-scrollbar::-webkit-scrollbar-thumb {
                    background: #10b981; /* emerald-500 */
                    border-radius: 10px;
                }
                .custom-sidebar-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #059669; /* emerald-600 */
                }
            `}} />
            
            <div className="flex items-center h-16 px-6 border-b border-emerald-700">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-emerald-500/20">
                        <Calendar size={16} />
                    </div>
                    {!isCollapsed && (
                        <div className="overflow-hidden whitespace-nowrap">
                            <span className="font-bold tracking-tight text-white block">Schedule</span>
                            <span className="text-emerald-300 font-bold tracking-[0.2em] -mt-1 block">PRO</span>
                        </div>
                    )}
                </div>
            </div>

            <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto custom-sidebar-scrollbar">
                <NavLink to="/dashboard" icon={LayoutDashboard}>
                    Dashboard
                </NavLink>

                <div className="space-y-2">
                    {!isCollapsed && (
                        <p className="text-[10px] font-bold text-emerald-300 uppercase tracking-widest px-3 mb-2">Scheduling</p>
                    )}
                    <button
                        onClick={() => setIsUsersOpen(!isUsersOpen)}
                        className={`w-full flex items-center justify-between px-3 py-3 rounded-xl font-semibold transition-all ${
                            isUsersOpen ? 'text-white' : 'text-emerald-300 hover:text-white hover:bg-emerald-700'
                        }`}
                    >
                        <div className="flex items-center gap-3">
                            <Users size={20} className={isUsersOpen ? 'text-white' : ''} />
                            {!isCollapsed && <span className="text-sm">User Management</span>}
                        </div>
                        <ChevronRight size={14} className={`transition-transform ${isUsersOpen ? 'rotate-90' : ''}`} />
                    </button>

                    {isUsersOpen && !isCollapsed && (
                        <div className="mt-2 ml-4 space-y-1 border-l border-emerald-700 pl-4">
                            <NavLink to="/admin/users" icon={Users}>
                                User Management
                            </NavLink>
                            <NavLink to="/admin/appointments" icon={Calendar}>
                                Appointments
                            </NavLink>
                            <NavLink to="/admin/posts" icon={MessageSquare}>
                                Post Management
                            </NavLink>
                            <NavLink to="/admin/categories" icon={Tag}>
                                Category Management
                            </NavLink>
                        </div>
                    )}
                </div>

                <div className="space-y-2">
                    {!isCollapsed && (
                        <p className="text-[10px] font-bold text-emerald-300 uppercase tracking-widest px-3 mb-2">System</p>
                    )}
                    <button
                        onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                        className={`w-full flex items-center justify-between px-3 py-3 rounded-xl font-semibold transition-all ${
                            isSettingsOpen ? 'text-white' : 'text-emerald-300 hover:text-white hover:bg-emerald-700'
                        }`}
                    >
                        <div className="flex items-center gap-3">
                            <Settings size={20} className={isSettingsOpen ? 'text-white' : ''} />
                            {!isCollapsed && <span className="text-sm">Settings</span>}
                        </div>
                        <ChevronRight size={14} className={`transition-transform ${isSettingsOpen ? 'rotate-90' : ''}`} />
                    </button>

                    {isSettingsOpen && !isCollapsed && (
                        <div className="mt-2 ml-4 space-y-1 border-l border-emerald-700 pl-4">
                            <NavLink to="/settings/general" icon={Settings}>
                                General Settings
                            </NavLink>
                            <NavLink to="/settings/system" icon={Settings}>
                                System Configuration
                            </NavLink>
                            <NavLink to="/settings/notifications" icon={Activity}>
                                Notifications
                            </NavLink>
                        </div>
                    )}
                </div>
            </nav>
        </aside>
    );
}
