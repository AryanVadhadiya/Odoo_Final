import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Calendar, DollarSign, Plus, MapPin, GripVertical, X, Check, List, Clock, Eye, Edit, Trash2, Search } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
// Removed react-select dropdown for city input
import { toast } from 'react-hot-toast';
import { fetchTrip } from '../store/slices/tripSlice';
import { itineraryAPI, activityAPI, cityAPI } from '../services/api';
import CitySearch from '../components/common/CitySearch';
import ActivityDiscovery from '../components/common/ActivityDiscovery';

const Itinerary = () => {
  const dispatch = useDispatch();
  const { tripId } = useParams();
  const { currentTrip } = useSelector((state) => state.trips);
  const [destinations, setDestinations] = useState([]);
  const [activities, setActivities] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newCity, setNewCity] = useState('');
  const [arrival, setArrival] = useState('');
  const [departure, setDeparture] = useState('');
  const [sectionBudget, setSectionBudget] = useState('');
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'calendar'
  const [editingActivity, setEditingActivity] = useState(null);
  const [draggedActivity, setDraggedActivity] = useState(null);
  const [draggedOverDestination, setDraggedOverDestination] = useState(null);
  const [showActivityDiscovery, setShowActivityDiscovery] = useState(false);
  const [selectedDestinationForActivities, setSelectedDestinationForActivities] = useState(null);
  // no dropdown options
  const dragSrcId = useRef(null);

  useEffect(() => {
    if (tripId) dispatch(fetchTrip(tripId));
  }, [dispatch, tripId]);

  useEffect(() => {
    const load = async () => {
      if (!tripId) return;
      try {
        const res = await itineraryAPI.getItinerary(tripId);
        const data = res.data?.data;
        if (data?.trip?.destinations) {
          const sorted = [...data.trip.destinations].sort((a, b) => new Date(a.arrivalDate) - new Date(a.arrivalDate));
          setDestinations(sorted);
        }
        setActivities(data?.activities || []);
      } catch (e) {
        // ignore
      }
    };
    load();
  }, [tripId]);

  const totalSectionsBudget = useMemo(() => destinations.reduce((sum, d) => sum + (Number(d.budget) || 0), 0), [destinations]);
  const tripBudget = currentTrip?.budget?.total || 0;
  const overBudget = totalSectionsBudget > tripBudget;

  // Generate calendar days for calendar view
  const calendarDays = useMemo(() => {
    if (!currentTrip?.startDate || !currentTrip?.endDate) return [];
    
    const start = new Date(currentTrip.startDate);
    const end = new Date(currentTrip.endDate);
    const days = [];
    
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      const dayActivities = activities.filter(activity => 
        activity.date === dateStr
      ).sort((a, b) => {
        const timeA = new Date(`2000-01-01T${a.startTime}:00`);
        const timeB = new Date(`2000-01-01T${b.startTime}:00`);
        return timeA - timeB;
      });
      
      days.push({
        date: new Date(d),
        dateStr,
        activities: dayActivities,
        destination: destinations.find(dest => {
          const destStart = new Date(dest.arrivalDate);
          const destEnd = new Date(dest.departureDate);
          return d >= destStart && d <= destEnd;
        })
      });
    }
    
    return days;
  }, [currentTrip, activities, destinations]);

  const onSearchCities = async () => {};

  const handleCitySelect = (city) => {
    setNewCity(`${city.name}, ${city.country}`);
    setSectionBudget(city.avgDailyCost?.toString() || '');
  };

  const addDestination = async () => {
    if (!newCity || !arrival || !departure) return;
    const [city, countryRaw] = newCity.split(',');
    const country = (countryRaw || '').trim();
    const proposedBudget = sectionBudget ? Number(sectionBudget) : 0;
    if ((totalSectionsBudget + proposedBudget) > tripBudget) {
      return toast.error('Sections budget exceeds total trip budget');
    }
    try {
      const res = await itineraryAPI.addDestination(tripId, {
        city: city.trim(),
        country,
        arrivalDate: arrival,
        departureDate: departure,
        budget: proposedBudget,
      });
      setDestinations((prev) => [...prev, res.data.data].sort((a, b) => new Date(a.arrivalDate) - new Date(a.arrivalDate)));
      setIsAdding(false);
      setNewCity('');
      setArrival('');
      setDeparture('');
      setSectionBudget('');
      toast.success('Destination added');
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to add destination');
    }
  };

  const updateDestination = async (id, patch) => {
    // Budget guard
    if (patch && Object.prototype.hasOwnProperty.call(patch, 'budget')) {
      const proposed = Number(patch.budget) || 0;
      const newTotal = destinations.reduce((sum, d) => sum + (d._id === id ? proposed : (Number(d.budget) || 0)), 0);
      if (newTotal > tripBudget) {
        return toast.error('Sections budget exceeds total trip budget');
      }
    }
    try {
      const res = await itineraryAPI.updateDestination(tripId, id, patch);
      setDestinations((prev) => prev.map((d) => (d._id === id ? { ...d, ...res.data.data } : d)).sort((a, b) => new Date(a.arrivalDate) - new Date(a.arrivalDate)));
      toast.success('Section updated');
    } catch (e) {
      toast.error(e.response?.data?.message || 'Update failed');
    }
  };

  const deleteDestination = async (id) => {
    if (!window.confirm('Are you sure you want to delete this destination? All associated activities will also be deleted.')) {
      return;
    }
    try {
      await itineraryAPI.deleteDestination(tripId, id);
      setDestinations(prev => prev.filter(d => d._id !== id));
      // Also remove activities for this destination
      setActivities(prev => prev.filter(a => 
        !(a.destination?.city === destinations.find(d => d._id === id)?.city && 
          a.destination?.country === destinations.find(d => d._id === id)?.country)
      ));
      toast.success('Destination deleted');
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to delete destination');
    }
  };

  const onDragStart = (id) => {
    dragSrcId.current = id;
  };

  const onDrop = async (id) => {
    const srcId = dragSrcId.current;
    if (!srcId || srcId === id) return;
    const items = [...destinations];
    const fromIndex = items.findIndex((d) => d._id === srcId);
    const toIndex = items.findIndex((d) => d._id === id);
    const [moved] = items.splice(fromIndex, 1);
    items.splice(toIndex, 0, moved);
    setDestinations(items);
    try {
      await itineraryAPI.reorderDestinations(tripId, items.map((d) => d._id));
    } catch (e) {
      // revert on failure
      toast.error('Failed to reorder');
      setDestinations(destinations);
    }
  };

  // Activity drag and drop handlers
  const handleActivityDragStart = (e, activity) => {
    setDraggedActivity(activity);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleActivityDragOver = (e, destinationId) => {
    e.preventDefault();
    setDraggedOverDestination(destinationId);
  };

  const handleActivityDrop = async (e, destinationId) => {
    e.preventDefault();
    
    if (!draggedActivity) return;
    
    const targetDest = destinations.find(d => d._id === destinationId);
    if (!targetDest) return;
    
    try {
      // Update activity with new destination
      const updatedActivity = {
        ...draggedActivity,
        destination: { city: targetDest.city, country: targetDest.country }
      };
      
      await activityAPI.updateActivity(draggedActivity._id, updatedActivity);
      
      // Update local state
      setActivities(prev => prev.map(act => 
        act._id === draggedActivity._id ? updatedActivity : act
      ));
      
      toast.success('Activity moved successfully!');
    } catch (error) {
      toast.error('Failed to move activity');
    } finally {
      setDraggedActivity(null);
      setDraggedOverDestination(null);
    }
  };

  const addActivity = async (dest, newAct) => {
    try {
      const res = await activityAPI.createActivity({
        ...newAct,
        trip: tripId,
        destination: { city: dest.city, country: dest.country },
      });
      setActivities((prev) => [...prev, res.data.data]);
      toast.success('Activity added');
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to add activity');
    }
  };

  const updateActivity = async (activityId, updates) => {
    try {
      const res = await activityAPI.updateActivity(activityId, updates);
      setActivities(prev => prev.map(act => 
        act._id === activityId ? { ...act, ...res.data.data } : act
      ));
      setEditingActivity(null);
      toast.success('Activity updated');
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to update activity');
    }
  };

  const deleteActivity = async (activityId) => {
    if (!window.confirm('Are you sure you want to delete this activity?')) {
      return;
    }
    try {
      await activityAPI.deleteActivity(activityId);
      setActivities(prev => prev.filter(act => act._id !== activityId));
      toast.success('Activity deleted');
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to delete activity');
    }
  };

  const handleActivityDiscovery = (destination) => {
    setSelectedDestinationForActivities(destination);
    setShowActivityDiscovery(true);
  };

  const handleActivitySelect = (activity) => {
    if (selectedDestinationForActivities) {
      addActivity(selectedDestinationForActivities, {
        ...activity,
        date: selectedDestinationForActivities.arrivalDate,
        location: { name: activity.location || `${selectedDestinationForActivities.city}, ${selectedDestinationForActivities.country}` }
      });
    }
  };

  const activitiesForDest = (dest) => activities.filter((a) => a.destination?.city === dest.city && a.destination?.country === dest.country);

  // Calendar View Component
  const CalendarView = () => (
    <div className="space-y-6">
      {calendarDays.map((day, dayIndex) => (
        <div key={day.dateStr} className="card">
          <div className="card-header">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold text-primary-600">
                    {day.date.getDate()}
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {day.date.toLocaleDateString('en-US', { weekday: 'long' })}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {day.date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
              </div>
              
              {day.destination && (
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <MapPin className="h-4 w-4" />
                  <span>{day.destination.city}, {day.destination.country}</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="card-body">
            {day.activities.length > 0 ? (
              <div className="space-y-3">
                {day.activities.map((activity) => (
                  <div key={activity._id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <div>
                        <div className="font-medium text-gray-900">{activity.title}</div>
                        <div className="text-sm text-gray-600">
                          {activity.startTime} - {activity.endTime} • {activity.type}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {activity.cost?.amount > 0 && (
                        <span className="text-sm text-gray-700">
                          ${activity.cost.amount}
                        </span>
                      )}
                      <button
                        onClick={() => setEditingActivity(activity)}
                        className="p-1 text-gray-400 hover:text-gray-600"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => deleteActivity(activity._id)}
                        className="p-1 text-red-400 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No activities planned for this day
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary-100 text-primary-700 text-xs font-medium mb-2">
            <MapPin className="h-3.5 w-3.5 mr-1.5" />
            Itinerary
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{currentTrip?.name || 'Your Trip Itinerary'}</h1>
          <p className="text-gray-600">Organize your trip into sections (stops), assign dates and activities.</p>
        </div>
        <div className="text-right">
          <div className={`text-sm ${overBudget ? 'text-red-600' : 'text-gray-600'}`}>Sections Budget / Total</div>
          <div className={`text-xl font-semibold ${overBudget ? 'text-red-600' : 'text-primary-700'}`}>{(totalSectionsBudget || 0).toLocaleString()} / {(tripBudget || 0).toLocaleString()} {currentTrip?.budget?.currency || ''}</div>
        </div>
      </div>

      {/* View Mode Toggle */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center justify-center space-x-4">
          <button
            onClick={() => setViewMode('list')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              viewMode === 'list'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <List className="h-4 w-4 inline mr-2" />
            List View
          </button>
          <button
            onClick={() => setViewMode('calendar')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              viewMode === 'calendar'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Calendar className="h-4 w-4 inline mr-2" />
            Calendar View
          </button>
        </div>
      </div>

      {viewMode === 'calendar' ? (
        <CalendarView />
      ) : (
        <>
          {/* Add destination */}
          <div className="card">
            <div className="card-body">
              {!isAdding ? (
                <button className="btn-primary inline-flex items-center" onClick={() => setIsAdding(true)}>
                  <Plus className="h-4 w-4 mr-2" /> Add City (Stop)
                </button>
              ) : (
                <div className="space-y-4">
                  {/* City Search */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Search for City</label>
                    <CitySearch
                      onCitySelect={handleCitySelect}
                      placeholder="Search for cities to add to your itinerary..."
                      showFilters={true}
                      maxResults={6}
                    />
                  </div>
                  
                  {/* Manual Input Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">City (City, Country)</label>
                      <input className="input" placeholder="e.g., Rome, Italy" value={newCity} onChange={(e) => setNewCity(e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Arrival</label>
                      <input type="date" className="input" min={currentTrip?.startDate?.slice(0,10)} max={currentTrip?.endDate?.slice(0,10)} value={arrival} onChange={(e) => setArrival(e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Departure</label>
                      <input type="date" className="input" min={arrival || currentTrip?.startDate?.slice(0,10)} max={currentTrip?.endDate?.slice(0,10)} value={departure} onChange={(e) => setDeparture(e.target.value)} />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Section Budget</label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input type="number" className="input pl-9" min="0" value={sectionBudget} onChange={(e) => setSectionBudget(e.target.value)} />
                      </div>
                    </div>
                    <div className="flex gap-2 justify-end">
                      <button className="btn-secondary inline-flex items-center" onClick={() => { setIsAdding(false); setNewCity(null); }}><X className="h-4 w-4 mr-2"/>Cancel</button>
                      <button className="btn-primary inline-flex items-center" onClick={addDestination}><Check className="h-4 w-4 mr-2"/>Add</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Visual Timeline */}
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>
            
            {/* Sections list */}
            <div className="space-y-4">
              {destinations.map((d, index) => (
                <div key={d._id} className="card relative" draggable onDragStart={() => onDragStart(d._id)} onDragOver={(e) => e.preventDefault()} onDrop={() => onDrop(d._id)}>
                  {/* Timeline indicator */}
                  <div className="absolute left-6 top-1/2 -translate-y-1/2 w-3 h-3 bg-primary-500 rounded-full"></div>
                  
                  <div className="card-body ml-12">
                    <div className="flex items-start gap-3">
                      <GripVertical className="h-5 w-5 text-gray-400 mt-2 cursor-grab" />
                      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-4 items-start">
                        <div className="lg:col-span-2">
                          <div className="text-base font-semibold text-gray-900">{d.city}, {d.country}</div>
                          <div className="mt-1 text-sm text-gray-600">Order: {index + 1}</div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Arrival</label>
                          <input type="date" className="input" value={String(d.arrivalDate).slice(0,10)} min={currentTrip?.startDate?.slice(0,10)} max={String(d.departureDate).slice(0,10)} onChange={(e) => updateDestination(d._id, { arrivalDate: e.target.value })} />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Departure</label>
                          <input type="date" className="input" value={String(d.departureDate).slice(0,10)} min={String(d.arrivalDate).slice(0,10)} max={currentTrip?.endDate?.slice(0,10)} onChange={(e) => updateDestination(d._id, { departureDate: e.target.value })} />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Section Budget</label>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input type="number" className="input pl-9" min="0" value={d.budget || 0} onChange={(e) => updateDestination(d._id, { budget: Number(e.target.value) })} />
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => deleteDestination(d._id)}
                        className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Activities for this destination */}
                    <div className="mt-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-sm font-medium text-gray-900">Activities</div>
                        <button
                          onClick={() => handleActivityDiscovery(d)}
                          className="text-sm text-primary-600 hover:text-primary-500 flex items-center"
                        >
                          <Search className="h-4 w-4 mr-1" />
                          Discover Activities
                        </button>
                      </div>
                      <div className="space-y-2">
                        {activitiesForDest(d).map((a) => (
                          <div 
                            key={a._id} 
                            className={`flex items-center justify-between p-3 border rounded-lg text-sm ${
                              draggedOverDestination === d._id ? 'ring-2 ring-primary-300 bg-primary-50' : ''
                            }`}
                            draggable
                            onDragStart={(e) => handleActivityDragStart(e, a)}
                            onDragOver={(e) => handleActivityDragOver(e, d._id)}
                            onDrop={(e) => handleActivityDrop(e, d._id)}
                          >
                            <div className="flex items-center space-x-2">
                              <GripVertical className="h-3 w-3 text-gray-400 cursor-grab" />
                              <div>
                                <div className="font-medium text-gray-900">{a.title}</div>
                                <div className="text-gray-600">{new Date(a.date).toLocaleDateString()} • {a.startTime} - {a.endTime}</div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-gray-700">{a.cost?.currency} {(a.cost?.amount || 0).toLocaleString()}</span>
                              <button
                                onClick={() => setEditingActivity(a)}
                                className="p-1 text-gray-400 hover:text-gray-600"
                              >
                                <Edit className="h-3 w-3" />
                              </button>
                              <button
                                onClick={() => deleteActivity(a._id)}
                                className="p-1 text-red-400 hover:text-red-600"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Quick add activity */}
                      <QuickAddActivity dest={d} onAdd={addActivity} tripStart={currentTrip?.startDate} tripEnd={currentTrip?.endDate} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Activity Edit Modal */}
      {editingActivity && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Edit Activity</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={editingActivity.title}
                  onChange={(e) => setEditingActivity({...editingActivity, title: e.target.value})}
                  className="input w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  value={editingActivity.date}
                  onChange={(e) => setEditingActivity({...editingActivity, date: e.target.value})}
                  className="input w-full"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                  <input
                    type="time"
                    value={editingActivity.startTime}
                    onChange={(e) => setEditingActivity({...editingActivity, startTime: e.target.value})}
                    className="input w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                  <input
                    type="time"
                    value={editingActivity.endTime}
                    onChange={(e) => setEditingActivity({...editingActivity, endTime: e.target.value})}
                    className="input w-full"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cost</label>
                <input
                  type="number"
                  value={editingActivity.cost?.amount || ''}
                  onChange={(e) => setEditingActivity({
                    ...editingActivity, 
                    cost: { ...editingActivity.cost, amount: Number(e.target.value) }
                  })}
                  className="input w-full"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
            <div className="flex space-x-2 mt-6">
              <button
                onClick={() => setEditingActivity(null)}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                onClick={() => updateActivity(editingActivity._id, editingActivity)}
                className="btn-primary flex-1"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Activity Discovery Modal */}
      {showActivityDiscovery && selectedDestinationForActivities && (
        <ActivityDiscovery
          cityName={selectedDestinationForActivities.city}
          onActivitySelect={handleActivitySelect}
          onClose={() => {
            setShowActivityDiscovery(false);
            setSelectedDestinationForActivities(null);
          }}
        />
      )}
    </div>
  );
};

const QuickAddActivity = ({ dest, onAdd, tripStart, tripEnd }) => {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [cost, setCost] = useState('');

  const handleAdd = () => {
    if (!title || !date) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    if (new Date(date) < new Date(dest.arrivalDate) || new Date(date) > new Date(dest.departureDate)) {
      return toast.error('Activity date must be within the destination dates');
    }
    
    const start = new Date(`2000-01-01T${startTime}:00`);
    const end = new Date(`2000-01-01T${endTime}:00`);
    if (end <= start) {
      return toast.error('End time must be after start time');
    }
    
    onAdd(dest, {
      title,
      description: '',
      type: 'other',
      date,
      startTime,
      endTime,
      location: { name: `${dest.city}, ${dest.country}` },
      cost: { amount: Number(cost || 0), currency: 'USD' },
    });
    
    // Reset form
    setTitle('');
    setDate('');
    setStartTime('09:00');
    setEndTime('10:00');
    setCost('');
  };

  return (
    <div className="mt-3 grid grid-cols-1 md:grid-cols-6 gap-3">
      <input className="input md:col-span-2" placeholder="Activity title" value={title} onChange={(e) => setTitle(e.target.value)} />
      <input type="date" className="input" min={String(dest.arrivalDate).slice(0,10)} max={String(dest.departureDate).slice(0,10)} value={date} onChange={(e) => setDate(e.target.value)} />
      <input type="time" className="input" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
      <input type="time" className="input" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
      <input type="number" className="input" min="0" placeholder="Cost (USD)" value={cost} onChange={(e) => setCost(e.target.value)} />
      <div className="md:col-span-6 flex justify-end">
        <button className="btn-primary" onClick={handleAdd}>Add Activity</button>
      </div>
    </div>
  );
};

export default Itinerary;