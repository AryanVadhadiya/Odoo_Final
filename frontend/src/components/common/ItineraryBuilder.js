import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, GripVertical, Plus, Save, ArrowLeft, Edit3, Trash2, Star, DollarSign, Users, Sparkles } from 'lucide-react';
import { toast } from 'react-hot-toast';

const ItineraryBuilder = ({ 
  tripData, 
  selectedPlaces, 
  onAddAnotherCity, 
  onSaveItinerary,
  onBackToPlaceSearch 
}) => {
  const [itineraryItems, setItineraryItems] = useState([]);
  const [editingItem, setEditingItem] = useState(null);
  const [showTimeSlots, setShowTimeSlots] = useState(true);

  useEffect(() => {
    if (selectedPlaces && selectedPlaces.length > 0) {
      // Initialize itinerary items with default time slots
      const items = selectedPlaces.map((place, index) => ({
        id: `item-${index}`,
        place,
        order: index + 1,
        date: tripData?.startDate || new Date().toISOString().split('T')[0],
        startTime: '09:00',
        endTime: '10:00',
        notes: '',
        estimatedCost: place.cost || 0,
        duration: place.duration || 60
      }));
      setItineraryItems(items);
    }
  }, [selectedPlaces, tripData]);

  const updateItem = (id, updates) => {
    setItineraryItems(prev => prev.map(item => 
      item.id === id ? { ...item, ...updates } : item
    ));
  };

  const removeItem = (id) => {
    setItineraryItems(prev => prev.filter(item => item.id !== id));
  };

  const reorderItems = (fromIndex, toIndex) => {
    const newItems = [...itineraryItems];
    const [movedItem] = newItems.splice(fromIndex, 1);
    newItems.splice(toIndex, 0, movedItem);
    
    // Update order numbers
    const reorderedItems = newItems.map((item, index) => ({
      ...item,
      order: index + 1
    }));
    
    setItineraryItems(reorderedItems);
  };

  const addTimeSlot = (itemId) => {
    const item = itineraryItems.find(i => i.id === itemId);
    if (!item) return;

    // Calculate next available time slot
    const currentEnd = new Date(`2000-01-01T${item.endTime}:00`);
    const nextStart = new Date(currentEnd.getTime() + 30 * 60000); // 30 min break
    const nextEnd = new Date(nextStart.getTime() + item.duration * 60000);

    const nextStartTime = nextStart.toTimeString().slice(0, 5);
    const nextEndTime = nextEnd.toTimeString().slice(0, 5);

    // Check if next time slot fits in the day
    if (nextEnd.getHours() < 18) { // Assume day ends at 6 PM
      updateItem(itemId, {
        startTime: nextStartTime,
        endTime: nextEndTime
      });
    } else {
      toast.error('This activity would extend beyond reasonable hours. Consider moving to another day.');
    }
  };

  const calculateTotalCost = () => {
    return itineraryItems.reduce((sum, item) => sum + item.estimatedCost, 0);
  };

  const calculateTotalDuration = () => {
    return itineraryItems.reduce((sum, item) => sum + item.duration, 0);
  };

  const handleSaveItinerary = () => {
    if (itineraryItems.length === 0) {
      toast.error('Please add at least one place to your itinerary');
      return;
    }

    const itineraryData = {
      tripId: tripData?.id,
      tripName: tripData?.name,
      startDate: tripData?.startDate,
      endDate: tripData?.endDate,
      items: itineraryItems.map(item => ({
        place: item.place,
        order: item.order,
        date: item.date,
        startTime: item.startTime,
        endTime: item.endTime,
        notes: item.notes,
        estimatedCost: item.estimatedCost,
        duration: item.duration
      })),
      totalCost: calculateTotalCost(),
      totalDuration: calculateTotalDuration()
    };

    onSaveItinerary(itineraryData);
  };

  const handleDragStart = (e, index) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', index);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, toIndex) => {
    e.preventDefault();
    const fromIndex = parseInt(e.dataTransfer.getData('text/html'));
    if (fromIndex !== toIndex) {
      reorderItems(fromIndex, toIndex);
    }
  };

  if (!tripData || !selectedPlaces) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Calendar className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No itinerary data</h3>
        <p className="text-gray-600">Please go back and select places for your trip</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Build Your Itinerary
        </h2>
        <p className="text-gray-600">
          Arrange your selected places, set time slots, and create the perfect travel plan
        </p>
      </div>

      {/* Trip Summary */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border border-blue-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-primary-600">{tripData.name}</div>
            <div className="text-sm text-gray-600">Trip Name</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-600">
              {itineraryItems.length} places
            </div>
            <div className="text-sm text-gray-600">Selected</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">
              ${calculateTotalCost().toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Total Cost</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-orange-600">
              {Math.round(calculateTotalDuration() / 60)}h {calculateTotalDuration() % 60}m
            </div>
            <div className="text-sm text-gray-600">Total Duration</div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBackToPlaceSearch}
            className="btn-secondary inline-flex items-center"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Place Search
          </button>
          
          <button
            onClick={() => setShowTimeSlots(!showTimeSlots)}
            className="btn-secondary inline-flex items-center"
          >
            <Clock className="h-4 w-4 mr-2" />
            {showTimeSlots ? 'Hide' : 'Show'} Time Slots
          </button>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={onAddAnotherCity}
            className="btn-secondary inline-flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Another City
          </button>
          
          <button
            onClick={handleSaveItinerary}
            className="btn-primary inline-flex items-center px-6 py-3"
          >
            <Save className="h-4 w-4 mr-2" />
            Save Itinerary
          </button>
        </div>
      </div>

      {/* Itinerary Items */}
      <div className="space-y-4">
        {itineraryItems.length > 0 ? (
          itineraryItems.map((item, index) => (
            <div
              key={item.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, index)}
            >
              <div className="flex items-start space-x-4">
                {/* Drag Handle */}
                <div className="flex-shrink-0 pt-2">
                  <GripVertical className="h-5 w-5 text-gray-400 cursor-grab" />
                </div>

                {/* Order Number */}
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                    {item.order}
                  </div>
                </div>

                {/* Place Info */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {item.place.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">
                        {item.place.description}
                      </p>
                      
                      {/* Place Stats */}
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span className="flex items-center">
                          <Star className="h-3 w-3 mr-1 text-yellow-400" />
                          {item.place.rating || 4.0}/5
                        </span>
                        <span className="flex items-center">
                          <DollarSign className="h-3 w-3 mr-1" />
                          ${item.estimatedCost}
                        </span>
                        <span className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {item.duration} min
                        </span>
                        <span className="flex items-center">
                          <MapPin className="h-3 w-3 mr-1" />
                          {item.place.type}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setEditingItem(editingItem === item.id ? null : item.id)}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Time and Date Controls */}
                  {showTimeSlots && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                        <input
                          type="date"
                          value={item.date}
                          onChange={(e) => updateItem(item.id, { date: e.target.value })}
                          min={tripData.startDate}
                          max={tripData.endDate}
                          className="input text-sm"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                        <input
                          type="time"
                          value={item.startTime}
                          onChange={(e) => updateItem(item.id, { startTime: e.target.value })}
                          className="input text-sm"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                        <input
                          type="time"
                          value={item.endTime}
                          onChange={(e) => updateItem(item.id, { endTime: e.target.value })}
                          className="input text-sm"
                        />
                      </div>
                      
                      <div className="flex items-end">
                        <button
                          onClick={() => addTimeSlot(item.id)}
                          className="btn-secondary text-sm py-2 w-full"
                        >
                          <Clock className="h-4 w-4 mr-1" />
                          Auto Time
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Notes */}
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                    <textarea
                      value={item.notes}
                      onChange={(e) => updateItem(item.id, { notes: e.target.value })}
                      placeholder="Add any special notes, tips, or requirements..."
                      rows={2}
                      className="input text-sm w-full"
                    />
                  </div>

                  {/* Highlights */}
                  {item.place.highlights && item.place.highlights.length > 0 && (
                    <div className="mt-3">
                      <span className="text-xs font-medium text-gray-700">Highlights:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {item.place.highlights.slice(0, 3).map((highlight, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800"
                          >
                            {highlight}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No places in itinerary</h3>
            <p className="text-gray-600 mb-4">
              Go back to place search to select destinations for your trip
            </p>
            <button
              onClick={onBackToPlaceSearch}
              className="btn-primary"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Place Search
            </button>
          </div>
        )}
      </div>

      {/* Final Summary */}
      {itineraryItems.length > 0 && (
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6 border border-green-200">
          <div className="text-center mb-4">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              🎉 Your Itinerary is Ready!
            </h3>
            <p className="text-gray-600">
              Review your plan and save it to start your adventure
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-600">{itineraryItems.length}</div>
              <div className="text-sm text-gray-600">Places to Visit</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {Math.round(calculateTotalDuration() / 60)}h {calculateTotalDuration() % 60}m
              </div>
              <div className="text-sm text-gray-600">Total Duration</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                ${calculateTotalCost().toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Estimated Cost</div>
            </div>
          </div>
          
          <div className="flex items-center justify-center space-x-4">
            <button
              onClick={onAddAnotherCity}
              className="btn-secondary px-6 py-3"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Another City
            </button>
            
            <button
              onClick={handleSaveItinerary}
              className="btn-primary px-8 py-3 text-lg"
            >
              <Save className="h-5 w-5 mr-2" />
              Save Itinerary
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ItineraryBuilder;
