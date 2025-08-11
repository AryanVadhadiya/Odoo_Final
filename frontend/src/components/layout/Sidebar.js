import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { NavLink, Link } from 'react-router-dom';
import { 
  Home, 
  Map, 
  Calendar, 
  Plus, 
  User, 
  Settings, 
  BarChart3,
  X,
  ChevronLeft,
  ChevronRight,
  Search,
  ClipboardList
} from 'lucide-react';
import { setSidebarOpen, toggleSidebarCollapsed } from '../../store/slices/uiSlice';

const Sidebar = () => {
  const dispatch = useDispatch();
  const { sidebarOpen, sidebarCollapsed } = useSelector((state) => state.ui);
  const { trips } = useSelector((state) => state.trips);

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'My Trips', href: '/trips', icon: Map },
    { name: 'Create Trip', href: '/trips/create', icon: Plus },
    { name: 'Trip Planner', href: '/planner', icon: ClipboardList },
    { name: 'Budget Overview', href: '/budget', icon: BarChart3 },
    { name: 'Search Cities', href: '/cities', icon: Search },
    { name: 'Profile', href: '/profile', icon: User },
  ];

  const closeSidebar = () => {
    dispatch(setSidebarOpen(false));
  };

  const toggleCollapse = () => {
    dispatch(toggleSidebarCollapsed());
  };

  return (
    <>
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-gray-600 bg-opacity-75 z-40 lg:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <div className={`
        flex-shrink-0 fixed lg:relative top-0 left-0 z-40 h-screen bg-white/90 backdrop-blur-xl shadow-2xl border-r border-white/20 transform transition-all duration-500 ease-in-out lg:transform-none
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        ${sidebarCollapsed ? 'w-16' : 'w-64'}
      `}>
        {/* Sidebar gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary-500/10 via-secondary-500/10 to-accent-500/10 pointer-events-none"></div>
        
        <div className={`relative z-10 flex items-center justify-between h-16 px-6 border-b border-white/20 bg-gradient-to-r from-primary-600/20 to-secondary-600/20 ${sidebarCollapsed ? 'lg:px-3' : ''}`}>
          <div className={`flex items-center ${sidebarCollapsed ? 'lg:justify-center lg:w-full' : ''}`}>
            <Map className="h-8 w-8 text-primary-600 mr-2 animate-pulse-glow" />
            {!sidebarCollapsed && (
              <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">GlobeTrotter</span>
            )}
          </div>
          <button
            onClick={closeSidebar}
            className="lg:hidden p-2 rounded-lg text-gray-400 hover:text-gray-500 hover:bg-white/20 transition-all duration-300"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Collapse toggle button - only visible on desktop */}
        <div className="hidden lg:block">
          <button
            onClick={toggleCollapse}
            className="absolute -right-3 top-20 bg-white border border-gray-300 rounded-full p-1.5 hover:bg-gray-50 shadow-md z-50"
          >
            {sidebarCollapsed ? (
              <ChevronRight className="h-3 w-3 text-gray-600" />
            ) : (
              <ChevronLeft className="h-3 w-3 text-gray-600" />
            )}
          </button>
        </div>

        <nav className="mt-6 px-3 relative z-10">
          <div className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  onClick={closeSidebar}
                  className={({ isActive }) =>
                    `group flex items-center px-3 py-3 text-sm font-medium rounded-xl transition-all duration-300 transform hover:scale-105 ${
                      isActive
                        ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-lg shadow-primary-500/25'
                        : 'text-gray-700 hover:bg-gradient-to-r hover:from-primary-100 hover:to-secondary-100 hover:text-primary-700'
                    } ${sidebarCollapsed ? 'lg:justify-center lg:px-2' : ''}`
                  }
                  title={sidebarCollapsed ? item.name : ''}
                >
                  <Icon className={`h-5 w-5 ${!sidebarCollapsed ? 'mr-3' : ''} transition-all duration-300`} />
                  {!sidebarCollapsed && (
                    <span className="transition-all duration-300">{item.name}</span>
                  )}
                </NavLink>
              );
            })}
          </div>
        </nav>

        {/* Quick actions */}
        {!sidebarCollapsed && (
          <div className="mt-8 px-3">
            <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Quick Actions
            </h3>
            <div className="mt-3 space-y-1">
              <Link
                to="/trips/create"
                className="group flex items-center w-full px-3 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50 hover:text-gray-900 transition-colors duration-200"
              >
                <Plus className="mr-3 h-5 w-5" />
                New Trip
              </Link>
              <Link
                to="/trips"
                className="group flex items-center w-full px-3 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50 hover:text-gray-900 transition-colors duration-200"
              >
                <Map className="mr-3 h-5 w-5" />
                View All Trips
              </Link>
            </div>
          </div>
        )}

        {/* Recent trips */}
        {!sidebarCollapsed && (
          <div className="mt-8 px-3">
            <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Recent Trips
            </h3>
            <div className="mt-3 space-y-1">
              {trips && trips.length > 0 ? (
                trips.slice(0, 3).map((trip) => (
                  <Link
                    key={trip._id}
                    to={`/trips/${trip._id}`}
                    className="px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-md cursor-pointer block"
                  >
                    <div className="font-medium">{trip.name}</div>
                    <div className="text-xs text-gray-500">
                      {new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}
                    </div>
                  </Link>
                ))
              ) : (
                <div className="px-3 py-2 text-sm text-gray-500">
                  No trips yet
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Sidebar; 