import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth.jsx';
import { ToastProvider } from './context/ToastContext';
import AppShell from './components/layout/AppShell';

// Import screens (we'll create these next)
import Login from './screens/Login';
import Signup from './screens/Signup';
import Dashboard from './screens/Dashboard';
import CreateTrip from './screens/CreateTrip';
import MyTrips from './screens/MyTrips';
import ItineraryBuilder from './screens/ItineraryBuilder';
import ItineraryView from './screens/ItineraryView';
import CitySearch from './screens/CitySearch';
import ActivitySearch from './screens/ActivitySearch';
import BudgetBreakdown from './screens/BudgetBreakdown';
import TripCalendar from './screens/TripCalendar';
import SharedItinerary from './screens/SharedItinerary';
import UserProfile from './screens/UserProfile';
import AdminAnalytics from './screens/AdminAnalytics';

// Protected Route component
const ProtectedRoute = ({ children }) => {
  // TODO: Implement proper auth check when backend is ready
  const isAuthenticated = localStorage.getItem('accessToken');

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Public Route component (redirects authenticated users)
const PublicRoute = ({ children }) => {
  // TODO: Implement proper auth check when backend is ready
  const isAuthenticated = localStorage.getItem('accessToken');

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            } />
            <Route path="/signup" element={
              <PublicRoute>
                <Signup />
              </PublicRoute>
            } />

            {/* Protected Routes */}
            <Route path="/" element={
              <ProtectedRoute>
                <AppShell />
              </ProtectedRoute>
            }>
              <Route index element={<Dashboard />} />
              <Route path="trips" element={<MyTrips />} />
              <Route path="trips/create" element={<CreateTrip />} />
              <Route path="trips/:tripId" element={<ItineraryView />} />
              <Route path="trips/:tripId/edit" element={<ItineraryBuilder />} />
              <Route path="cities" element={<CitySearch />} />
              <Route path="activities" element={<ActivitySearch />} />
              <Route path="budget" element={<BudgetBreakdown />} />
              <Route path="calendar" element={<TripCalendar />} />
              <Route path="profile" element={<UserProfile />} />
              <Route path="admin" element={<AdminAnalytics />} />
            </Route>

            {/* Shared/Public Routes */}
            <Route path="/shared/:shareId" element={<SharedItinerary />} />

            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
