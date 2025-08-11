import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { 
  Bell, 
  Search, 
  User, 
  Settings, 
  LogOut, 
  Menu,
  Globe,
  PanelLeftClose,
  PanelLeft
} from 'lucide-react';
import { logout } from '../../store/slices/authSlice';
import { toggleSidebar, toggleSidebarCollapsed } from '../../store/slices/uiSlice';

const Header = () => {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { sidebarOpen, sidebarCollapsed } = useSelector((state) => state.ui);

  const handleLogout = () => {
    dispatch(logout());
    setUserMenuOpen(false);
  };

  const handleToggleCollapse = () => {
    dispatch(toggleSidebarCollapsed());
  };

  return (
    <header className="bg-white/80 backdrop-blur-xl shadow-lg border-b border-white/20 h-16 relative z-30">
      {/* Header gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary-500/10 via-secondary-500/10 to-accent-500/10 pointer-events-none"></div>
      
      <div className="flex items-center justify-between h-full px-6 relative z-10">
        {/* Left side */}
        <div className="flex items-center">
          {/* Mobile menu button */}
          <button
            onClick={() => dispatch(toggleSidebar())}
            className="lg:hidden p-2 rounded-xl bg-gradient-to-r from-primary-500/20 to-secondary-500/20 text-primary-600 hover:from-primary-500/30 hover:to-secondary-500/30 transition-all duration-300 transform hover:scale-105"
          >
            <Menu className="h-6 w-6" />
          </button>

          {/* Desktop collapse button */}
          <button
            onClick={handleToggleCollapse}
            className="hidden lg:block p-2 rounded-xl bg-gradient-to-r from-primary-500/20 to-secondary-500/20 text-primary-600 hover:from-primary-500/30 hover:to-secondary-500/30 transition-all duration-300 transform hover:scale-105 mr-2"
          >
            {sidebarCollapsed ? (
              <PanelLeft className="h-6 w-6" />
            ) : (
              <PanelLeftClose className="h-6 w-6" />
            )}
          </button>

          {/* Logo */}
          <Link to="/dashboard" className="flex items-center ml-4 lg:ml-0 group">
            <Globe className="h-8 w-8 text-primary-600 mr-2 animate-pulse-glow group-hover:animate-float" />
            <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">GlobeTrotter</span>
          </Link>
        </div>

        {/* Center - Search */}
        <div className="hidden md:flex flex-1 max-w-lg mx-8">
          <div className="relative w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-primary-400" />
            </div>
            <input
              type="text"
              placeholder="Search trips, destinations..."
              className="block w-full pl-10 pr-4 py-3 border border-white/20 rounded-xl bg-white/60 backdrop-blur-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-all duration-300"
              onChange={(e) => {
                // TODO: Implement search functionality
                console.log('Search:', e.target.value);
              }}
            />
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-4">
          {/* Admin Dashboard Link */}
          <Link
            to="/admin"
            className="flex items-center px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 rounded-xl transform hover:scale-105"
          >
            <Globe className="h-4 w-4 mr-2" />
            Admin
          </Link>
          
          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="p-2 rounded-xl bg-gradient-to-r from-primary-500/20 to-secondary-500/20 text-primary-600 hover:from-primary-500/30 hover:to-secondary-500/30 transition-all duration-300 transform hover:scale-105 relative"
            >
              <Bell className="h-6 w-6" />
              <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-gradient-to-r from-danger-500 to-danger-600 animate-pulse"></span>
            </button>

            {/* Notifications dropdown */}
            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 z-50 animate-slide-down">
                <div className="p-4">
                  <h3 className="text-lg font-medium bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent mb-2">Notifications</h3>
                  <div className="space-y-2">
                    <div className="p-3 bg-gradient-to-r from-primary-50/80 to-secondary-50/80 rounded-xl border border-primary-200/30">
                      <p className="text-sm text-primary-800">
                        Your trip to Paris starts in 3 days!
                      </p>
                      <p className="text-xs text-primary-600 mt-1">2 hours ago</p>
                    </div>
                    <div className="p-3 bg-gradient-to-r from-gray-50/80 to-gray-100/80 rounded-xl border border-gray-200/30">
                      <p className="text-sm text-gray-800">
                        New destination added to your bucket list
                      </p>
                      <p className="text-xs text-gray-600 mt-1">1 day ago</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* User menu */}
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center space-x-3 p-2 rounded-xl bg-gradient-to-r from-primary-500/20 to-secondary-500/20 hover:from-primary-500/30 hover:to-secondary-500/30 transition-all duration-300 transform hover:scale-105"
            >
              <div className="w-8 h-8 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-white text-sm font-medium">
                  {user?.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <span className="hidden md:block text-sm font-medium text-gray-700">
                {user?.name}
              </span>
            </button>

            {/* User dropdown */}
            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 z-50 animate-slide-down">
                <div className="py-1">
                  <Link
                    to="/profile"
                    className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-primary-50 hover:to-secondary-50 transition-all duration-300 rounded-xl mx-1"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    <User className="h-4 w-4 mr-3 text-primary-600" />
                    Profile
                  </Link>
                  <Link
                    to="/profile"
                    className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-primary-50 hover:to-secondary-50 transition-all duration-300 rounded-xl mx-1"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    <Settings className="h-4 w-4 mr-3 text-primary-600" />
                    Profile Settings
                  </Link>

                  <hr className="my-1 border-gray-200/50" />
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-danger-50 hover:to-danger-100 transition-all duration-300 rounded-xl mx-1"
                  >
                    <LogOut className="h-4 w-4 mr-3 text-danger-600" />
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile search */}
      <div className="md:hidden px-6 pb-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-primary-400" />
          </div>
          <input
            type="text"
            placeholder="Search trips, destinations..."
            className="block w-full pl-10 pr-4 py-3 border border-white/20 rounded-xl bg-white/60 backdrop-blur-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-all duration-300"
            onChange={(e) => {
              // TODO: Implement search functionality
              console.log('Search:', e.target.value);
            }}
          />
        </div>
      </div>
    </header>
  );
};

export default Header; 