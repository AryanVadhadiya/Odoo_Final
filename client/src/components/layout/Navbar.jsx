import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Button from '../ui/Button';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Debug log to confirm if the user state updates after login
  useEffect(() => {
    console.log('User state in Navbar:', user);
  }, [user]);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Handle logout
  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Navigation items
  const navigationItems = [
    { name: 'Home', href: '/', current: location.pathname === '/' },
    { name: 'Explore', href: '/explore', current: location.pathname === '/explore' },
    { name: 'My Trips', href: '/trips', current: location.pathname === '/trips' },
    { name: 'Budget', href: '/budget', current: location.pathname === '/budget' },
  ];

  // User menu items
  const userMenuItems = [
    { name: 'Profile', href: '/profile', icon: 'user' },
    { name: 'Settings', href: '/settings', icon: 'settings' },
    { name: 'Saved', href: '/saved', icon: 'bookmark' },
  ];

  const navbarClasses = [
    'fixed top-0 left-0 right-0 z-40 transition-all duration-200',
    isScrolled
      ? 'bg-white/95 backdrop-blur-md shadow-lg border-b border-neutral-200'
      : 'bg-white/80 backdrop-blur-sm',
  ].join(' ');

  return (
    <nav className={navbarClasses}>
      <div className="container-responsive">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-brand-midnight to-brand-ocean rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-xl font-bold text-brand-midnight">GlobeTrotter</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-8">
            {navigationItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`
                  px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200
                  ${item.current
                    ? 'text-brand-ocean bg-brand-ocean/10'
                    : 'text-neutral-700 hover:text-brand-ocean hover:bg-neutral-100'
                  }
                `}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* User Menu / Auth Buttons */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            {isAuthenticated() ? (
              <div className="relative group">
                <button className="flex items-center space-x-2 p-2 rounded-lg hover:bg-neutral-100 transition-colors">
                  <div className="w-8 h-8 bg-brand-ocean rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {user?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                    </span>
                  </div>
                  <span className="text-neutral-700 font-medium">
                    {user?.name || 'User'}
                  </span>
                  <svg className="w-4 h-4 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-neutral-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <div className="py-1">
                    {userMenuItems.map((item) => (
                      <Link
                        key={item.name}
                        to={item.href}
                        className="flex items-center px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100 transition-colors"
                      >
                        <span>{item.name}</span>
                      </Link>
                    ))}
                    <hr className="my-1 border-neutral-200" />
                    <button
                      onClick={handleLogout}
                      className="w-full text-left flex items-center px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100 transition-colors"
                    >
                      Sign out
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    Sign in
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button variant="primary" size="sm">
                    Get Started
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-md text-neutral-700 hover:text-brand-ocean hover:bg-neutral-100 transition-colors"
              aria-label="Toggle mobile menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-neutral-200 bg-white/95 backdrop-blur-md">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navigationItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`
                    block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200
                    ${item.current
                      ? 'text-brand-ocean bg-brand-ocean/10'
                      : 'text-neutral-700 hover:text-brand-ocean hover:bg-neutral-100'
                    }
                  `}
                >
                  {item.name}
                </Link>
              ))}

              {/* Mobile User Menu */}
              {isAuthenticated() ? (
                <div className="pt-4 border-t border-neutral-200">
                  <div className="px-3 py-2">
                    <p className="text-sm font-medium text-neutral-900">
                      {user?.name || 'User'}
                    </p>
                    <p className="text-sm text-neutral-500">
                      {user?.email}
                    </p>
                  </div>
                  {userMenuItems.map((item) => (
                    <Link
                      key={item.name}
                      to={item.href}
                      className="block px-3 py-2 text-base text-neutral-700 hover:text-brand-ocean hover:bg-neutral-100 rounded-md transition-colors"
                    >
                      {item.name}
                    </Link>
                  ))}
                  <button
                    onClick={handleLogout}
                    className="w-full text-left block px-3 py-2 text-base text-neutral-700 hover:text-brand-ocean hover:bg-neutral-100 rounded-md transition-colors"
                  >
                    Sign out
                  </button>
                </div>
              ) : (
                <div className="pt-4 border-t border-neutral-200 space-y-2">
                  <Link to="/login">
                    <Button variant="ghost" size="sm" fullWidth>
                      Sign in
                    </Button>
                  </Link>
                  <Link to="/signup">
                    <Button variant="primary" size="sm" fullWidth>
                      Get Started
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
