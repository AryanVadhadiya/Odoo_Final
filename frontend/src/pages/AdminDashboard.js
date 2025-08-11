import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);
  const [popularCities, setPopularCities] = useState([]);
  const [popularActivities, setPopularActivities] = useState([]);
  const [popularPlaces, setPopularPlaces] = useState([]);
  const [durationByBudget, setDurationByBudget] = useState([]);
  const [budgetByDuration, setBudgetByDuration] = useState([]);
  const [budgetDistribution, setBudgetDistribution] = useState([]);
  const [monthlyTrends, setMonthlyTrends] = useState([]);

  useEffect(() => {
    // Fetch data immediately when component mounts
    fetchData();
  }, []);



  const fetchData = async () => {
    try {
      const [
        statsData,
        citiesData,
        activitiesData,
        placesData,
        durationData,
        budgetData,
        distributionData,
        trendsData
      ] = await Promise.all([
        adminAPI.getStats(),
        adminAPI.getPopularCities(),
        adminAPI.getPopularActivities(),
        adminAPI.getPopularPlaces(),
        adminAPI.getDurationByBudget(),
        adminAPI.getBudgetByDuration(),
        adminAPI.getBudgetDistribution(),
        adminAPI.getMonthlyTrends()
      ]);

      setStats(statsData.data);
      setPopularCities(citiesData.data);
      setPopularActivities(activitiesData.data);
      setPopularPlaces(placesData.data);
      setDurationByBudget(durationData.data);
      setBudgetByDuration(budgetData.data);
      setBudgetDistribution(distributionData.data);
      setMonthlyTrends(trendsData.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleExport = async (type) => {
    try {
      const response = await adminAPI.exportCSV(type);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${type}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error exporting data:', error);
    }
  };

  const goToDashboard = () => {
    navigate('/dashboard');
  };



  if (!stats) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <div className="flex space-x-4">
              <button
                onClick={() => handleExport('users')}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
              >
                Export Users CSV
              </button>
              <button
                onClick={() => handleExport('trips')}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Export Trips CSV
              </button>
              <button
                onClick={() => handleExport('activities')}
                className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700"
              >
                Export Activities CSV
              </button>
              <button
                onClick={goToDashboard}
                className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900">Total Users</h3>
            <p className="text-3xl font-bold text-indigo-600">{stats.users.total}</p>
            <p className="text-sm text-gray-500">
              {stats.users.newThisMonth} new this month
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900">Active Users</h3>
            <p className="text-3xl font-bold text-green-600">{stats.users.active}</p>
            <p className="text-sm text-gray-500">
              {((stats.users.active / stats.users.total) * 100).toFixed(1)}% of total
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900">Total Trips</h3>
            <p className="text-3xl font-bold text-blue-600">{stats.trips.total}</p>
            <p className="text-sm text-gray-500">
              {stats.trips.thisMonth} this month
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900">Month over Month</h3>
            <p className={`text-3xl font-bold ${stats.trips.monthOverMonthChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {stats.trips.monthOverMonthChange >= 0 ? '+' : ''}{stats.trips.monthOverMonthChange}%
            </p>
            <p className="text-sm text-gray-500">Trip growth</p>
          </div>
        </div>

        {/* Trip Status Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Trip Status</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Ongoing</span>
                <span className="font-semibold text-blue-600">{stats.trips.ongoing}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Upcoming</span>
                <span className="font-semibold text-yellow-600">{stats.trips.upcoming}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Completed</span>
                <span className="font-semibold text-green-600">{stats.trips.completed}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Popular Cities Chart */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Most Frequently Visited Cities</h3>
          <div className="space-y-3">
            {popularCities.slice(0, 10).map((city, index) => (
              <div key={index} className="flex items-center">
                <div className="w-8 text-sm text-gray-500">{index + 1}</div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">
                    {city._id.city}, {city._id.country}
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${(city.count / popularCities[0].count) * 100}%` }}
                    ></div>
                  </div>
                </div>
                <div className="w-16 text-right text-sm text-gray-500">{city.count}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Popular Activities Chart */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Most Frequently Visited Activities</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {popularActivities.map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-900 capitalize">{activity._id}</span>
                <span className="text-lg font-bold text-indigo-600">{activity.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Popular Places Chart */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Most Frequently Visited Places</h3>
          <div className="space-y-3">
            {popularPlaces.slice(0, 10).map((place, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="text-sm font-medium text-gray-900">{place._id}</div>
                  <div className="text-xs text-gray-500">{place.city}, {place.country}</div>
                </div>
                <span className="text-lg font-bold text-purple-600">{place.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Trip Duration by Budget */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Average Trip Duration by Budget Range</h3>
          <div className="space-y-3">
            {durationByBudget.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-900">{item._id}</span>
                <div className="text-right">
                  <div className="text-lg font-bold text-green-600">{item.avgDuration.toFixed(1)} days</div>
                  <div className="text-xs text-gray-500">{item.count} trips</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Trip Budget by Duration */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Average Budget by Trip Duration</h3>
          <div className="space-y-3">
            {budgetByDuration.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-900">{item._id}</span>
                <div className="text-right">
                  <div className="text-lg font-bold text-orange-600">${item.avgBudget.toFixed(0)}</div>
                  <div className="text-xs text-gray-500">{item.count} trips</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Budget Distribution */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Cumulative Budget Distribution</h3>
          <div className="space-y-3">
            {budgetDistribution.map((item, index) => (
              <div key={index} className="flex items-center">
                <div className="w-24 text-sm text-gray-500">{item._id}</div>
                <div className="flex-1">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-red-600 h-2 rounded-full"
                      style={{ width: `${item.percentage}%` }}
                    ></div>
                  </div>
                </div>
                <div className="w-20 text-right text-sm text-gray-500">{item.percentage}%</div>
                <div className="w-16 text-right text-sm text-gray-500">{item.count}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly Trends */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Monthly Trip Trends</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {monthlyTrends.map((trend, index) => (
              <div key={index} className="p-3 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-500">
                  {new Date(0, trend._id.month - 1).toLocaleString('default', { month: 'short' })} {trend._id.year}
                </div>
                <div className="text-lg font-bold text-blue-600">{trend.count}</div>
                <div className="text-xs text-gray-500">
                  Avg: ${trend.avgBudget.toFixed(0)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
