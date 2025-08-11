import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Plus, MapPin, Calendar, Compass } from 'lucide-react';
import Select from 'react-select';

const TripCreate = () => {
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

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

  const canSubmit = Boolean(selectedPlace && startDate && endDate);

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
          <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
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

            {/* Actions */}
            <div className="flex justify-end space-x-4 pt-4">
              <Link to="/trips" className="btn-secondary">Cancel</Link>
              <button type="submit" disabled={!canSubmit} className={`btn-primary inline-flex items-center ${!canSubmit ? 'opacity-60 cursor-not-allowed' : ''}`}>
                <Plus className="h-4 w-4 mr-2" />
                Create Trip
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