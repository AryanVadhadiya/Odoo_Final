import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, MapPin, Calendar, Compass, DollarSign, Image as ImageIcon, AlignLeft, Globe } from 'lucide-react';
import Select from 'react-select';
import { useDispatch, useSelector } from 'react-redux';
import { createTrip } from '../store/slices/tripSlice';
import { toast } from 'react-hot-toast';

const TripCreate = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { createLoading } = useSelector((state) => state.trips);

  const [tripName, setTripName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [coverPhoto, setCoverPhoto] = useState('');
  const [budgetTotal, setBudgetTotal] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [isPublic, setIsPublic] = useState(false);

  const placeOptions = useMemo(
    () => [
      { value: 'delhi', label: 'Delhi, India' },
      { value: 'mumbai', label: 'Mumbai, India' },
      { value: 'bengaluru', label: 'Bengaluru, India' },
      { value: 'goa', label: 'Goa, India' },
      { value: 'hyderabad', label: 'Hyderabad, India' },
      { value: 'paris', label: 'Paris, France' },
      { value: 'tokyo', label: 'Tokyo, Japan' },
      { value: 'newyork', label: 'New York, USA' },
      { value: 'london', label: 'London, UK' },
    ],
    []
  );

  const canSubmit = Boolean(tripName.trim() && startDate && endDate);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    try {
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
        // Optionally seed first destination when selectedPlace present
        // destinations: selectedPlace ? [{ city: selectedPlace.label.split(',')[0], country: selectedPlace.label.split(',')[1]?.trim() || '', arrivalDate: startDate, departureDate: endDate, order: 1 }] : undefined,
      };
      const res = await dispatch(createTrip(tripData)).unwrap();
      toast.success('Trip created successfully');
      const newTripId = res.data?._id;
      if (newTripId) {
        navigate(`/trips/${newTripId}`);
      } else {
        navigate('/trips');
      }
    } catch (err) {
      toast.error(err || 'Failed to create trip');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            to="/trips"
            className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary-100 text-primary-700 text-xs font-medium mb-2">
              <Compass className="h-3.5 w-3.5 mr-1.5" />
              Plan a trip
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Let’s plan your next journey</h1>
            <p className="text-gray-600">Choose a destination and dates to get personalized suggestions</p>
          </div>
        </div>
      </div>

      {/* Trip planner form */}
      <div className="card">
        <div className="card-body">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Trip name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Trip name</label>
              <input
                className="input"
                placeholder="e.g., Paris Adventure"
                value={tripName}
                onChange={(e) => setTripName(e.target.value)}
                maxLength={100}
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <div className="relative">
                <AlignLeft className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <textarea
                  className="input pl-9"
                  rows={3}
                  placeholder="Add a short summary of your trip"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  maxLength={500}
                />
              </div>
            </div>
            {/* Select a place */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select a place</label>
              <div className="flex items-center">
                <MapPin className="h-5 w-5 text-primary-600 mr-2" />
                <div className="flex-1">
                  <Select
                    classNamePrefix="react-select"
                    options={placeOptions}
                    placeholder="Search or select a destination"
                    isClearable
                    value={selectedPlace}
                    onChange={(opt) => setSelectedPlace(opt)}
                  />
                </div>
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="date"
                    id="startDate"
                    className="input pl-9"
                    value={startDate}
                    onChange={(e) => {
                      setStartDate(e.target.value);
                      if (endDate && e.target.value && endDate < e.target.value) {
                        setEndDate('');
                      }
                    }}
                  />
                </div>
              </div>
              <div>
                <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-2">
                  End Date
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="date"
                    id="endDate"
                    className="input pl-9"
                    min={startDate || undefined}
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Cover photo (placeholder) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Cover photo</label>
              <div className="relative">
                <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="url"
                  className="input pl-9"
                  placeholder="Optional image URL (or keep empty to use placeholder)"
                  value={coverPhoto}
                  onChange={(e) => setCoverPhoto(e.target.value)}
                />
              </div>
              {!coverPhoto && (
                <p className="text-xs text-gray-500 mt-1">No image provided. A placeholder will be used.</p>
              )}
            </div>

            {/* Budget */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Budget</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="number"
                    className="input pl-9"
                    placeholder="0.00"
                    min="0"
                    value={budgetTotal}
                    onChange={(e) => setBudgetTotal(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                <select className="input" value={currency} onChange={(e) => setCurrency(e.target.value)}>
                  {['USD','EUR','GBP','JPY','CAD','AUD'].map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Visibility */}
            <div>
              <label className="inline-flex items-center space-x-2 cursor-pointer select-none">
                <input type="checkbox" className="mr-2" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} />
                <Globe className="h-4 w-4 text-gray-600" />
                <span className="text-sm text-gray-700">Make trip public</span>
              </label>
              <p className="text-xs text-gray-500 mt-1">Public trips can be shared via a link.</p>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-4 pt-4">
              <Link to="/trips" className="btn-secondary">Cancel</Link>
              <button type="submit" disabled={!canSubmit || createLoading} className={`btn-primary inline-flex items-center ${(!canSubmit || createLoading) ? 'opacity-60 cursor-not-allowed' : ''}`}>
                <Plus className="h-4 w-4 mr-2" />
                {createLoading ? 'Creating...' : 'Create Trip'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Suggestions – dummy containers for now */}
      {selectedPlace && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <div className="card-header">
              <h2 className="text-lg font-semibold text-gray-900">Suggested places to visit in {selectedPlace.label}</h2>
            </div>
            <div className="card-body">
              <p className="text-sm text-gray-600 mb-4">We’ll populate top sights based on your selection.</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-24 rounded-xl bg-primary-50 border border-primary-100 flex items-center justify-center text-primary-700 text-sm">
                    Placeholder
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h2 className="text-lg font-semibold text-gray-900">Suggested activities in {selectedPlace.label}</h2>
            </div>
            <div className="card-body">
              <p className="text-sm text-gray-600 mb-4">Activities will appear here once logic is added.</p>
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-12 rounded-lg bg-gradient-to-r from-primary-50 to-primary-100 border border-primary-100 flex items-center px-4 text-primary-800">
                    Activity placeholder #{i + 1}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TripCreate; 