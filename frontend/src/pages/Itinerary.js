import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { MapPin, Calendar, Clock, Plus, Edit, Trash2 } from 'lucide-react';

const Itinerary = () => {
  const { tripId } = useParams();
  const [destinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    // TODO: Fetch itinerary data
    setLoading(false);
  }, [tripId]);

  const handleAddDestination = () => {
    setShowAddForm(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Itinerary</h1>
        <button
          onClick={handleAddDestination}
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Destination
        </button>
      </div>

      {destinations.length === 0 ? (
        <div className="text-center py-12">
          <MapPin className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No destinations</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by adding your first destination to your itinerary.
          </p>
          <div className="mt-6">
            <button
              onClick={handleAddDestination}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Destination
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {destinations.map((destination, index) => (
            <div
              key={destination.id}
              className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <span className="inline-flex items-center justify-center w-6 h-6 bg-indigo-100 text-indigo-600 text-xs font-medium rounded-full mr-3">
                      {index + 1}
                    </span>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {destination.city}, {destination.country}
                    </h3>
                  </div>
                  <div className="ml-9 space-y-2">
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="w-4 h-4 mr-2" />
                      {destination.startDate} - {destination.endDate}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="w-4 h-4 mr-2" />
                      {destination.duration} days
                    </div>
                    {destination.notes && (
                      <p className="text-sm text-gray-600">{destination.notes}</p>
                    )}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button className="p-2 text-gray-400 hover:text-gray-600">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-red-600">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Destination Modal would go here */}
      {showAddForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Add Destination
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                This feature is coming soon!
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Itinerary; 