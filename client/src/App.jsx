import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, ProtectedRoute, GuestRoute } from './hooks/useAuth.jsx';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';

// Layout Components
import AppShell from './components/layout/AppShell';

// Screen Components
import LandingPage from './components/screens/LandingPage';
import Login from './components/screens/Login';
import Signup from './components/screens/Signup';
import Dashboard from './components/screens/Dashboard';
import CreateTrip from './components/screens/CreateTrip';
import MyTrips from './components/screens/MyTrips';
import ItineraryBuilder from './components/screens/ItineraryBuilder';
import ItineraryView from './components/screens/ItineraryView';
import CitySearch from './components/screens/CitySearch';
import ActivitySearch from './components/screens/ActivitySearch';
import BudgetBreakdown from './components/screens/BudgetBreakdown';
import TripCalendar from './components/screens/TripCalendar';
import SharedItinerary from './components/screens/SharedItinerary';
import UserProfile from './components/screens/UserProfile';
import AdminAnalytics from './components/screens/AdminAnalytics';

/**
 * Main App component with routing
 */
function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <Router>
            <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={
            <GuestRoute>
              <Login />
            </GuestRoute>
          } />
          <Route path="/signup" element={
            <GuestRoute>
              <Signup />
            </GuestRoute>
          } />
          <Route path="/shared/:shareId" element={<SharedItinerary />} />
          
          {/* Protected Routes */}
          <Route path="/" element={
            <ProtectedRoute>
              <AppShell />
            </ProtectedRoute>
          }>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/trips" element={<MyTrips />} />
            <Route path="/trips/create" element={<CreateTrip />} />
            <Route path="/trips/:tripId" element={<ItineraryView />} />
            <Route path="/trips/:tripId/edit" element={<ItineraryBuilder />} />
            <Route path="/explore" element={<CitySearch />} />
            <Route path="/activities" element={<ActivitySearch />} />
            <Route path="/trips/:tripId/budget" element={<BudgetBreakdown />} />
            <Route path="/trips/:tripId/calendar" element={<TripCalendar />} />
            <Route path="/profile" element={<UserProfile />} />
            <Route path="/admin" element={<AdminAnalytics />} />
          </Route>
          
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
