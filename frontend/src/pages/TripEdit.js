import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTrip, updateTrip } from '../store/slices/tripSlice';
import { toast } from 'react-hot-toast';

const TripEdit = () => {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { currentTrip, updateLoading, updateError } = useSelector((state) => state.trips);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    budget: {
      total: 0,
      currency: 'USD'
    },
    status: 'planning',
    isPublic: false
  });

  useEffect(() => {
    if (tripId) {
      dispatch(fetchTrip(tripId));
    }
  }, [dispatch, tripId]);

  useEffect(() => {
    if (currentTrip) {
      setFormData({
        name: currentTrip.name || '',
        description: currentTrip.description || '',
        startDate: currentTrip.startDate ? new Date(currentTrip.startDate).toISOString().split('T')[0] : '',
        endDate: currentTrip.endDate ? new Date(currentTrip.endDate).toISOString().split('T')[0] : '',
        budget: {
          total: currentTrip.budget?.total || 0,
          currency: currentTrip.budget?.currency || 'USD'
        },
        status: currentTrip.status || 'planning',
        isPublic: currentTrip.isPublic || false
      });
    }
  }, [currentTrip]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name === 'budget.total') {
      setFormData(prev => ({
        ...prev,
        budget: {
          ...prev.budget,
          total: Number(value) || 0
        }
      }));
    } else if (name === 'budget.currency') {
      setFormData(prev => ({
        ...prev,
        budget: {
          ...prev.budget,
          currency: value
        }
      }));
    } else if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name.trim()) {
      toast.error('Trip name is required');
      return;
    }
    
    if (!formData.startDate || !formData.endDate) {
      toast.error('Start and end dates are required');
      return;
    }
    
    if (new Date(formData.startDate) >= new Date(formData.endDate)) {
      toast.error('End date must be after start date');
      return;
    }

    try {
      const updateData = {
        ...formData,
        startDate: new Date(formData.startDate),
        endDate: new Date(formData.endDate)
      };

      await dispatch(updateTrip({ tripId, tripData: updateData })).unwrap();
      toast.success('Trip updated successfully!');
      navigate(`/trips/${tripId}`);
    } catch (error) {
      toast.error(error || 'Failed to update trip');
    }
  };

  if (!currentTrip && !updateLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Trip Not Found</h1>
          <p className="text-gray-600 mb-4">The trip you're looking for doesn't exist.</p>
          <Link to="/trips" className="btn-primary">Go Back to Trips</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            to={`/trips/${tripId}`}
            className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Trip</h1>
            <p className="text-gray-600">Update your trip details</p>
          </div>
        </div>
      </div>

      {/* Edit form */}
      <div className="card">
        <div className="card-body">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Trip name */}
            <div>
              <label htmlFor="tripName" className="block text-sm font-medium text-gray-700 mb-2">
                Trip Name *
              </label>
              <input
                type="text"
                id="tripName"
                name="name"
                className="input"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>

            {/* Trip description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={3}
                className="input"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe your trip..."
              />
            </div>

            {/* Trip dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date *
                </label>
                <input
                  type="date"
                  id="startDate"
                  name="startDate"
                  className="input"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-2">
                  End Date *
                </label>
                <input
                  type="date"
                  id="endDate"
                  name="endDate"
                  className="input"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  min={formData.startDate}
                  required
                />
              </div>
            </div>

            {/* Budget */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="budgetTotal" className="block text-sm font-medium text-gray-700 mb-2">
                  Budget Amount
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    id="budgetTotal"
                    name="budget.total"
                    className="input pl-8"
                    value={formData.budget.total}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="budgetCurrency" className="block text-sm font-medium text-gray-700 mb-2">
                  Currency
                </label>
                <select 
                  id="budgetCurrency" 
                  name="budget.currency"
                  className="input"
                  value={formData.budget.currency}
                  onChange={handleInputChange}
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

            {/* Status */}
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select 
                id="status" 
                name="status"
                className="input"
                value={formData.status}
                onChange={handleInputChange}
              >
                <option value="planning">Planning</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {/* Public sharing */}
            <div className="flex items-center">
              <input
                id="isPublic"
                name="isPublic"
                type="checkbox"
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                checked={formData.isPublic}
                onChange={handleInputChange}
              />
              <label htmlFor="isPublic" className="ml-2 block text-sm text-gray-900">
                Make this trip public (shareable link)
              </label>
            </div>

            {/* Error display */}
            {updateError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {updateError}
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <Link
                to={`/trips/${tripId}`}
                className="btn-secondary"
              >
                Cancel
              </Link>
              <button
                type="submit"
                className="btn-primary inline-flex items-center"
                disabled={updateLoading}
              >
                {updateLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TripEdit; 