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
  X
} from 'lucide-react';
import { setSidebarOpen } from '../../store/slices/uiSlice';

const Sidebar = () => {
  const dispatch = useDispatch();
  const { sidebarOpen } = useSelector((state) => state.ui);
  const { trips } = useSelector((state) => state.trips);

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'My Trips', href: '/trips', icon: Map },
    { name: 'Create Trip', href: '/trips/create', icon: Plus },
    { name: 'Profile', href: '/profile', icon: User },
  ];

  const closeSidebar = () => {
    dispatch(setSidebarOpen(false));
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
        fixed lg:sticky top-0 left-0 z-40 h-screen w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:transform-none
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <div className="flex items-center">
            <Map className="h-8 w-8 text-primary-600 mr-2" />
            <span className="text-xl font-bold text-gray-900">GlobeTrotter</span>
          </div>
          <button
            onClick={closeSidebar}
            className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <nav className="mt-6 px-3">
          <div className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  onClick={closeSidebar}
                  className={({ isActive }) =>
                    `group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                      isActive
                        ? 'bg-primary-100 text-primary-900'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`
                  }
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {item.name}
                </NavLink>
              );
            })}
          </div>
        </nav>

        {/* Quick actions */}
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

        {/* Recent trips */}
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
      </div>
    </>
  );
};

export default Sidebar; 