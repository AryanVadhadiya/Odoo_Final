import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { 
  Users, 
  MapPin, 
  Calendar, 
  TrendingUp, 
  DollarSign, 
  Globe, 
  Download,
  BarChart3,
  PieChart,
  Activity,
  Building2,
  Plane
} from 'lucide-react';

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
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (type) => {
    try {
      const response = await adminAPI.exportCSV(type);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${type}_${new Date().toISOString().split('T')[0]}.csv`);
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

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!stats) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <Globe className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-gray-600">Platform analytics and insights</p>
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => handleExport('users')}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
              >
                <Download className="h-4 w-4 mr-2" />
                Export Users
              </button>
              <button
                onClick={() => handleExport('trips')}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                <Download className="h-4 w-4 mr-2" />
                Export Trips
              </button>
              <button
                onClick={goToDashboard}
                className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200"
              >
                <Plane className="h-4 w-4 mr-2" />
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Key Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{stats.users.total}</p>
                <p className="text-xs text-green-600">+{stats.users.newThisMonth} this month</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <MapPin className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Users</p>
                <p className="text-2xl font-bold text-gray-900">{stats.users.active}</p>
                <p className="text-xs text-gray-600">{((stats.users.active / stats.users.total) * 100).toFixed(1)}% of total</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Calendar className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Trips</p>
                <p className="text-2xl font-bold text-gray-900">{stats.trips.total}</p>
                <p className="text-xs text-blue-600">{stats.trips.thisMonth} this month</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-orange-500">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Growth</p>
                <p className={`text-2xl font-bold ${stats.trips.monthOverMonthChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {stats.trips.monthOverMonthChange >= 0 ? '+' : ''}{stats.trips.monthOverMonthChange}%
                </p>
                <p className="text-xs text-gray-600">vs last month</p>
              </div>
            </div>
          </div>
        </div>

        {/* Trip Status Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-blue-600" />
              Trip Status Distribution
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Planning</span>
                <span className="text-sm font-medium text-gray-900">{stats.trips.upcoming}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full" 
                  style={{ width: `${(stats.trips.upcoming / stats.trips.total) * 100}%` }}
                ></div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Active</span>
                <span className="text-sm font-medium text-gray-900">{stats.trips.ongoing}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full" 
                  style={{ width: `${(stats.trips.ongoing / stats.trips.total) * 100}%` }}
                ></div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Completed</span>
                <span className="text-sm font-medium text-gray-900">{stats.trips.completed}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-purple-600 h-2 rounded-full" 
                  style={{ width: `${(stats.trips.completed / stats.trips.total) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <BarChart3 className="h-5 w-5 mr-2 text-green-600" />
              Popular Cities
            </h3>
            <div className="space-y-3">
              {popularCities.slice(0, 5).map((city, index) => (
                <div key={city._id.city} className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">{city._id.city}</span>
                  <span className="text-sm font-medium text-gray-900">{city.count}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Activity className="h-5 w-5 mr-2 text-purple-600" />
              Popular Activities
            </h3>
            <div className="space-y-3">
              {popularActivities.slice(0, 5).map((activity, index) => (
                <div key={activity._id} className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">{activity._id}</span>
                  <span className="text-sm font-medium text-gray-900">{activity.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Budget Distribution Chart */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <PieChart className="h-5 w-5 mr-2 text-blue-600" />
              Budget Distribution
            </h3>
            <div className="h-64 flex items-center justify-center">
              {budgetDistribution.length > 0 ? (
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {budgetDistribution.length}
                  </div>
                  <div className="text-sm text-gray-600">Budget Categories</div>
                  <div className="mt-4 space-y-2">
                    {budgetDistribution.slice(0, 3).map((item, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span className="text-gray-600">{item._id}</span>
                        <span className="font-medium">{item.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-gray-500 text-center">
                  <BarChart3 className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p>No budget data available</p>
                </div>
              )}
            </div>
          </div>

          {/* Duration by Budget Chart */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
              Duration by Budget
            </h3>
            <div className="h-64 flex items-center justify-center">
              {durationByBudget.length > 0 ? (
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    {durationByBudget.length}
                  </div>
                  <div className="text-sm text-gray-600">Budget Groups</div>
                  <div className="mt-4 space-y-2">
                    {durationByBudget.slice(0, 3).map((item, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span className="text-gray-600">{item._id}</span>
                        <span className="font-medium">{item.avgDuration?.toFixed(1)} days</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-gray-500 text-center">
                  <TrendingUp className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p>No duration data available</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Monthly Trends */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-purple-600" />
            Monthly Trip Trends
          </h3>
          <div className="h-64 flex items-center justify-center">
            {monthlyTrends.length > 0 ? (
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  {monthlyTrends.length}
                </div>
                <div className="text-sm text-gray-600">Months of Data</div>
                <div className="mt-4 space-y-2">
                  {monthlyTrends.slice(0, 3).map((trend, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span className="text-gray-600">{trend.month}</span>
                      <span className="font-medium">{trend.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-gray-500 text-center">
                <TrendingUp className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p>No trend data available</p>
              </div>
            )}
          </div>
        </div>

        {/* Export Section */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Download className="h-5 w-5 mr-2 text-blue-600" />
            Data Export
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => handleExport('users')}
              className="flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              <Users className="h-4 w-4 mr-2" />
              Export Users
            </button>
            <button
              onClick={() => handleExport('trips')}
              className="flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
            >
              <Calendar className="h-4 w-4 mr-2" />
              Export Trips
            </button>
            <button
              onClick={() => handleExport('activities')}
              className="flex items-center justify-center px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200"
            >
              <Activity className="h-4 w-4 mr-2" />
              Export Activities
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
