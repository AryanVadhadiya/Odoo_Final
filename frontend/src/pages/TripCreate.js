import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, MapPin, Calendar, Compass, DollarSign, Image as ImageIcon, AlignLeft, Globe, X, Star, Sparkles, Heart, Camera, Users, TrendingUp, Clock } from 'lucide-react';
import Select from 'react-select';
import { useDispatch, useSelector } from 'react-redux';
import { createTrip } from '../store/slices/tripSlice';
import { itineraryAPI, activityAPI, suggestionsAPI } from '../services/api';
import { toast } from 'react-hot-toast';

const TripCreate = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { createLoading } = useSelector((state) => state.trips);

  const [tripName, setTripName] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [coverPhoto, setCoverPhoto] = useState('');
  const [budgetTotal, setBudgetTotal] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [isPublic, setIsPublic] = useState(false);

  const canSubmit = Boolean(tripName.trim() && startDate && endDate);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    
    try {
      // Store trip data in localStorage for the city search page
      const tripData = {
        name: tripName.trim(),
        description: description.trim() || undefined,
        startDate,
        endDate,
        coverPhoto: coverPhoto || undefined,
        isPublic,
        budget: {
          total: budgetTotal ? Number(budgetTotal) : 0,
          currency,
        },
      };
      
      localStorage.setItem('pendingTripData', JSON.stringify(tripData));
      
      // Redirect to city search page
      navigate('/city-search', { 
        state: { 
          tripData,
          step: 'city-selection'
        }
      });
      
    } catch (e) {
      toast.error('Failed to proceed to city selection');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-8">
          <Link
            to="/trips"
            className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Create New Trip</h1>
            <p className="text-gray-600">Start by setting up your trip details, then we'll help you discover amazing destinations</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Trip Information */}
          <div className="card">
            <div className="card-header">
              <h2 className="text-xl font-semibold text-gray-900">Trip Details</h2>
            </div>
            <div className="card-body space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Trip Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={tripName}
                    onChange={(e) => setTripName(e.target.value)}
                    placeholder="e.g., European Adventure 2024"
                    className="input w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Currency
                  </label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="input w-full"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="JPY">JPY (¥)</option>
                    <option value="CAD">CAD (C$)</option>
                    <option value="AUD">AUD (A$)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your trip, what you're looking forward to, or any special requirements..."
                  rows={3}
                  className="input w-full"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="input w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    min={startDate || new Date().toISOString().split('T')[0]}
                    className="input w-full"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Total Budget
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="number"
                      value={budgetTotal}
                      onChange={(e) => setBudgetTotal(e.target.value)}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      className="input pl-10 w-full"
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={isPublic}
                      onChange={(e) => setIsPublic(e.target.checked)}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Make this trip public</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Next Steps Info */}
          <div className="card bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200">
            <div className="card-body">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-xl flex items-center justify-center text-white">
                  <Sparkles className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">What's Next?</h3>
                  <p className="text-gray-700 mb-3">
                    After you submit this form, you'll be taken to our AI-powered destination discovery page where you can:
                  </p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Get AI recommendations based on your preferences</li>
                    <li>• Discover amazing cities and attractions</li>
                    <li>• Plan your itinerary with detailed cost estimates</li>
                    <li>• Get travel tips and local insights</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <Link
              to="/trips"
              className="btn-secondary px-6 py-3"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={!canSubmit || createLoading}
              className="btn-primary px-6 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {createLoading ? 'Processing...' : 'Continue to Destination Discovery'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TripCreate; 