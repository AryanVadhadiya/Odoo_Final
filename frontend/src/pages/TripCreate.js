import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, MapPin, Calendar, Compass, DollarSign, Image as ImageIcon, AlignLeft, Globe } from 'lucide-react';
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
  const [selectedPlace, setSelectedPlace] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [coverPhoto, setCoverPhoto] = useState('');
  const [budgetTotal, setBudgetTotal] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [isPublic, setIsPublic] = useState(false);
  const [selectedActivityCards, setSelectedActivityCards] = useState([]); // indices

  const [suggestions, setSuggestions] = useState([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);

  const canSubmit = Boolean(tripName.trim() && startDate && endDate);

  const fetchSuggestions = async () => {
    if (!selectedPlace.trim()) return;
    try {
      setSuggestionsLoading(true);
      const list = await suggestionsAPI.getTopPlaces(selectedPlace.trim());
      setSuggestions(Array.isArray(list) ? list.slice(0, 15) : []);
    } catch (e) {
      setSuggestions([]);
    } finally {
      setSuggestionsLoading(false);
    }
  };

  // Auto-fetch suggestions when place changes (debounced)
  useEffect(() => {
    const id = setTimeout(() => {
      if (selectedPlace.trim()) fetchSuggestions();
    }, 500);
    return () => clearTimeout(id);
  }, [selectedPlace]);

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
      const newTripId = res.data?._id;
      // Seed initial destination if a place was selected
      if (newTripId && selectedPlace) {
        const [city, countryRaw] = selectedPlace.split(',');
        const country = (countryRaw || '').trim();
        try {
          await itineraryAPI.addDestination(newTripId, {
            city: city.trim(),
            country,
            arrivalDate: startDate,
            departureDate: endDate,
            budget: tripData.budget?.total || 0,
          });
          // If user selected activities suggestions, add them now
          if (selectedActivityCards.length > 0) {
            const activities = selectedActivityCards.map((idx, i) => ({
              trip: newTripId,
              title: suggestions[idx]?.title || `Suggested Activity #${idx + 1}`,
              description: suggestions[idx]?.details || `Auto-added from suggestions for ${selectedPlace}`,
              type: 'sightseeing',
              destination: { city: city.trim(), country },
              date: startDate,
              startTime: `${String(9 + i).padStart(2, '0')}:00`,
              endTime: `${String(10 + i).padStart(2, '0')}:30`,
              location: { name: selectedPlace },
              cost: { amount: Number(suggestions[idx]?.approxCost || 0), currency },
            }));
            try {
              await activityAPI.createBulkActivities(activities);
            } catch (e) {
              // ignore bulk errors
            }
          }
        } catch (e) {
          // non-blocking
        }
      }
      toast.success('Trip created successfully');
      if (newTripId) {
        navigate(`/trips/${newTripId}/itinerary`);
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Enter a place (City, Country)</label>
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary-600" />
                <input
                  className="input flex-1"
                  placeholder="e.g., Paris, France"
                  value={selectedPlace}
                  onChange={(e) => setSelectedPlace(e.target.value)}
                />
                {/* Suggestions auto-loads when place changes */}
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

      {/* Suggestions via Gemini */}
      {selectedPlace && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <div className="card-header">
              <h2 className="text-lg font-semibold text-gray-900">Suggested places and activities in {selectedPlace}</h2>
            </div>
            <div className="card-body">
              {!suggestionsLoading && suggestions.length === 0 && (
                <p className="text-sm text-gray-600 mb-4">Click "Get Suggestions" to fetch top places.</p>
              )}
              {suggestionsLoading && <div className="text-sm text-gray-600 mb-4">Loading suggestions...</div>}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {suggestions.map((s, i) => (
                  <SuggestionCard key={i} item={s} currency={currency} selected={selectedActivityCards.includes(i)} onToggle={() => setSelectedActivityCards(prev => prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i])} />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const SuggestionCard = ({ item, currency, selected, onToggle }) => {
  return (
    <button type="button" onClick={onToggle} className={`text-left border rounded-xl p-4 ${selected ? 'border-primary-400 bg-primary-50' : 'border-gray-200 bg-white'} hover:shadow-sm transition`}> 
      <div className="flex items-start justify-between">
        <div className="text-base font-semibold text-gray-900">{item.title}</div>
        <div className="text-sm text-gray-700">{currency} {(Number(item.approxCost || 0)).toLocaleString()}</div>
      </div>
      <div className="text-sm text-gray-600 mt-1">{item.details}</div>
      <div className="flex items-center justify-between text-xs text-gray-600 mt-2">
        <div>Rating: {Number(item.rating || 0).toFixed(1)}/5</div>
        <div>Timings: {item.timings || '-'}</div>
      </div>
      <div className={`mt-2 text-xs ${selected ? 'text-primary-700' : 'text-gray-500'}`}>{selected ? 'Selected (click to remove)' : 'Click to select'}</div>
    </button>
  );
};

export default TripCreate; 