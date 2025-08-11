import React from 'react';
import TimelineBuilder from '../components/planner/TimelineBuilder';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { saveCurrentCity, clearBuilder } from '../store/slices/tripBuilderSlice';
import { createTrip } from '../store/slices/tripSlice';
import { toast } from 'react-hot-toast';

const Planner = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { details, cities } = useSelector((s) => s.tripBuilder || {});

  const handleAddAnotherCity = () => {
    dispatch(saveCurrentCity());
    toast.success('City itinerary saved. Add another city.');
    navigate('/cities');
  };

  const handleFinishAndSaveTrip = async () => {
    dispatch(saveCurrentCity());
    const payload = {
      name: details?.name || 'New Trip',
      description: details?.description || '',
      startDate: details?.startDate,
      endDate: details?.endDate,
    };
    const action = await dispatch(createTrip(payload));
    if (createTrip.fulfilled.match(action)) {
      toast.success('Trip created');
      dispatch(clearBuilder());
      navigate('/trips');
    } else {
      toast.error(action.payload || 'Failed to create trip');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Trip Planner</h1>
          <p className="mt-2 text-gray-600">Build your perfect trip timeline with date and time scheduling</p>
        </div>

        <TimelineBuilder />

        <div className="flex gap-4 mt-8 justify-end">
          <button
            className="px-6 py-3 rounded bg-gray-100 text-gray-800 font-semibold hover:bg-gray-200 transition"
            onClick={handleAddAnotherCity}
          >
            Add Another City
          </button>
          <button
            className="px-6 py-3 rounded bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition"
            onClick={handleFinishAndSaveTrip}
          >
            Finish and Save Trip
          </button>
        </div>
      </div>
    </div>
  );
};

export default Planner; 