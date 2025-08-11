import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Calendar, DollarSign, Plus, MapPin, GripVertical, X, Check } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
// Removed react-select dropdown for city input
import { toast } from 'react-hot-toast';
import { fetchTrip } from '../store/slices/tripSlice';
import { itineraryAPI, activityAPI, cityAPI } from '../services/api';

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
          const sorted = [...data.trip.destinations].sort((a, b) => new Date(a.arrivalDate) - new Date(b.arrivalDate));
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

  const onSearchCities = async () => {};

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
      setDestinations((prev) => [...prev, res.data.data].sort((a, b) => new Date(a.arrivalDate) - new Date(b.arrivalDate)));
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
      setDestinations((prev) => prev.map((d) => (d._id === id ? { ...d, ...res.data.data } : d)).sort((a, b) => new Date(a.arrivalDate) - new Date(b.arrivalDate)));
      toast.success('Section updated');
    } catch (e) {
      toast.error(e.response?.data?.message || 'Update failed');
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

  const activitiesForDest = (dest) => activities.filter((a) => a.destination?.city === dest.city && a.destination?.country === dest.country);

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

      {/* Add destination */}
      <div className="card">
        <div className="card-body">
          {!isAdding ? (
            <button className="btn-primary inline-flex items-center" onClick={() => setIsAdding(true)}>
              <Plus className="h-4 w-4 mr-2" /> Add City (Stop)
            </button>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div className="md:col-span-2">
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Section Budget</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input type="number" className="input pl-9" min="0" value={sectionBudget} onChange={(e) => setSectionBudget(e.target.value)} />
                </div>
              </div>
              <div className="flex gap-2 md:col-span-4 justify-end">
                <button className="btn-secondary inline-flex items-center" onClick={() => { setIsAdding(false); setNewCity(null); }}><X className="h-4 w-4 mr-2"/>Cancel</button>
                <button className="btn-primary inline-flex items-center" onClick={addDestination}><Check className="h-4 w-4 mr-2"/>Add</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sections list */}
      <div className="space-y-4">
        {destinations.map((d) => (
          <div key={d._id} className="card" draggable onDragStart={() => onDragStart(d._id)} onDragOver={(e) => e.preventDefault()} onDrop={() => onDrop(d._id)}>
            <div className="card-body">
              <div className="flex items-start gap-3">
                <GripVertical className="h-5 w-5 text-gray-400 mt-2" />
                <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-4 items-start">
                  <div className="lg:col-span-2">
                    <div className="text-base font-semibold text-gray-900">{d.city}, {d.country}</div>
                    <div className="mt-1 text-sm text-gray-600">Order: {d.order + 1}</div>
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
              </div>

              {/* Activities for this destination */}
              <div className="mt-4">
                <div className="text-sm font-medium text-gray-900 mb-2">Activities</div>
                <div className="space-y-2">
                  {activitiesForDest(d).map((a) => (
                    <div key={a._id} className="flex items-center justify-between p-3 border rounded-lg text-sm">
                      <div>
                        <div className="font-medium text-gray-900">{a.title}</div>
                        <div className="text-gray-600">{new Date(a.date).toLocaleDateString()} • {a.startTime} - {a.endTime}</div>
                      </div>
                      <div className="text-gray-700">{a.cost?.currency} {(a.cost?.amount || 0).toLocaleString()}</div>
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