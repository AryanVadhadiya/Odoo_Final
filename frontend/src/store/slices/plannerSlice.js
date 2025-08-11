import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { itineraryAPI } from '../../services/api';

// Mock data for demonstration
const mockActivities = [
  {
    id: '1',
    title: 'Eiffel Tower',
    type: 'sightseeing',
    duration: 120, // minutes
    cost: 26,
    currency: 'EUR',
    description: 'Iconic iron lattice tower on the Champ de Mars in Paris',
    imageUrl: 'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?w=400'
  },
  {
    id: '2',
    title: 'Louvre Museum',
    type: 'culture',
    duration: 180,
    cost: 17,
    currency: 'EUR',
    description: 'World\'s largest art museum and a historic monument',
    imageUrl: 'https://images.unsplash.com/photo-1565967511849-76a60a516170?w=400'
  },
  {
    id: '3',
    title: 'Notre-Dame Cathedral',
    type: 'sightseeing',
    duration: 90,
    cost: 0,
    currency: 'EUR',
    description: 'Medieval Catholic cathedral on the Île de la Cité',
    imageUrl: 'https://images.unsplash.com/photo-1502602898536-47ad22581b52?w=400'
  },
  {
    id: '4',
    title: 'Arc de Triomphe',
    type: 'sightseeing',
    duration: 60,
    cost: 13,
    currency: 'EUR',
    description: 'Triumphal arch in the center of Place Charles de Gaulle',
    imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400'
  },
  {
    id: '5',
    title: 'Seine River Cruise',
    type: 'sightseeing',
    duration: 75,
    cost: 15,
    currency: 'EUR',
    description: 'Scenic boat tour along the Seine River',
    imageUrl: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=400'
  }
];

// Helper function to check time conflicts
const hasTimeConflict = (newActivity, existingActivities) => {
  const newStart = new Date(newActivity.scheduledDate + 'T' + newActivity.startTime);
  const newEnd = new Date(newStart.getTime() + newActivity.duration * 60000);
  
  return existingActivities.some(activity => {
    if (activity.scheduledDate !== newActivity.scheduledDate) return false;
    
    const existingStart = new Date(activity.scheduledDate + 'T' + activity.startTime);
    const existingEnd = new Date(existingStart.getTime() + activity.duration * 60000);
    
    return (newStart < existingEnd && newEnd > existingStart);
  });
};

// Helper function to format time
const formatTime = (timeString) => {
  const [hours, minutes] = timeString.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
};

// Helper function to add minutes to time
const addMinutesToTime = (timeString, minutes) => {
  const [hours, mins] = timeString.split(':').map(Number);
  const totalMinutes = hours * 60 + mins + minutes;
  const newHours = Math.floor(totalMinutes / 60);
  const newMins = totalMinutes % 60;
  return `${newHours.toString().padStart(2, '0')}:${newMins.toString().padStart(2, '0')}`;
};

const initialState = {
  basket: [], // Activities available to add to timeline
  timeline: [], // Scheduled activities with date/time
  availableActivities: mockActivities,
  cityAttractions: {},
  loading: false,
  error: null,
  lastSuggestedTime: null
};

const plannerSlice = createSlice({
  name: 'planner',
  initialState,
  reducers: {
    addToBasket: (state, action) => {
      const activityId = action.payload;
      if (!state.basket) state.basket = [];
      if (!state.basket.includes(activityId)) {
        state.basket.push(activityId);
      }
    },
    removeFromBasket: (state, action) => {
      if (!state.basket) state.basket = [];
      state.basket = state.basket.filter(id => id !== action.payload);
    },
    addCityAttractions: (state, action) => {
      const { cityName, attractions } = action.payload;
      if (!state.cityAttractions) state.cityAttractions = {};
      if (!state.availableActivities) state.availableActivities = [];
      
      state.cityAttractions[cityName] = attractions;
      
      // Convert attractions to activities and add to available activities
      attractions.forEach((attraction, index) => {
        const activityId = `city-${cityName}-attraction-${index}`;
        const activity = {
          id: activityId,
          title: attraction.name,
          type: attraction.type || 'sightseeing',
          duration: attraction.visitDuration ? parseInt(attraction.visitDuration) * 60 : 120,
          cost: attraction.cost || 0,
          currency: attraction.costCurrency || 'USD',
          description: attraction.description || attraction.highlights?.join(', ') || '',
          imageUrl: attraction.imageUrl || 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400'
        };
        
        const existingIndex = state.availableActivities.findIndex(a => a.id === activityId);
        if (existingIndex === -1) {
          state.availableActivities.push(activity);
        } else {
          state.availableActivities[existingIndex] = activity;
        }
      });
    },
    addToTimeline: (state, action) => {
      const { activityId, date, startTime } = action.payload;
      const availableActivities = state.availableActivities || [];
      const activity = availableActivities.find(a => a.id === activityId);
      
      if (!activity) {
        state.error = 'Selected activity not found';
        return;
      }
      
      const newTimelineItem = {
        id: `${activityId}-${Date.now()}`,
        activityId,
        scheduledDate: date,
        startTime,
        duration: activity.duration,
        title: activity.title,
        type: activity.type,
        cost: activity.cost,
        currency: activity.currency,
        description: activity.description,
        imageUrl: activity.imageUrl
      };
      
      // Check for time conflicts
      const timeline = state.timeline || [];
      if (hasTimeConflict(newTimelineItem, timeline)) {
        throw new Error('Time conflict detected! This time slot is already occupied.');
      }
      
      if (!state.timeline) state.timeline = [];
      state.timeline.push(newTimelineItem);
      // Sort timeline by date and time
      state.timeline.sort((a, b) => {
        const dateA = new Date(a.scheduledDate + 'T' + a.startTime);
        const dateB = new Date(b.scheduledDate + 'T' + b.startTime);
        return dateA - dateB;
      });
  },
    removeFromTimeline: (state, action) => {
      const timelineId = action.payload;
      if (!state.timeline) state.timeline = [];
      state.timeline = state.timeline.filter(item => item.id !== timelineId);
    },
    reorderTimeline: (state, action) => {
      const { sourceIndex, destinationIndex } = action.payload;
      if (!state.timeline) state.timeline = [];
      const [removed] = state.timeline.splice(sourceIndex, 1);
      state.timeline.splice(destinationIndex, 0, removed);
    },
    updateTimelineItem: (state, action) => {
      const { timelineId, updates } = action.payload;
      if (!state.timeline) state.timeline = [];
      const itemIndex = state.timeline.findIndex(item => item.id === timelineId);
      
      if (itemIndex !== -1) {
        const updatedItem = { ...state.timeline[itemIndex], ...updates };
        
        // Check for time conflicts with other items
        const otherItems = state.timeline.filter(item => item.id !== timelineId);
        if (hasTimeConflict(updatedItem, otherItems)) {
          throw new Error('Time conflict detected! This time slot is already occupied.');
        }
        
        state.timeline[itemIndex] = updatedItem;
        
        // Re-sort timeline
        state.timeline.sort((a, b) => {
          const dateA = new Date(a.scheduledDate + 'T' + a.startTime);
          const dateB = new Date(b.scheduledDate + 'T' + b.startTime);
          return dateA - dateB;
        });
      }
  },
    suggestNextTimeSlot: (state, action) => {
      const { date, afterTime } = action.payload;
      const timeline = state.timeline || [];
      const dayActivities = timeline.filter(item => item.scheduledDate === date);

      // Compute next slot but do not return a value (avoid replacing state)
      let result = '09:00';
      if (dayActivities.length > 0) {
        let latestEndTime = '08:00';
        dayActivities.forEach(item => {
          const endTime = addMinutesToTime(item.startTime, item.duration);
          if (endTime > latestEndTime) {
            latestEndTime = endTime;
          }
        });
        result = addMinutesToTime(latestEndTime, 30);
      }
      // Optionally store it if needed later without altering API
      state.lastSuggestedTime = result;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBasket.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchBasket.fulfilled, (state, action) => {
        state.loading = false;
        state.basket = action.payload;
      })
      .addCase(fetchBasket.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateBasket.fulfilled, (state, action) => {
        state.basket = action.payload;
      });
  }
});

export const {
  addToBasket,
  removeFromBasket,
  addCityAttractions,
  addToTimeline,
  removeFromTimeline,
  reorderTimeline,
  updateTimelineItem,
  suggestNextTimeSlot,
  clearError
} = plannerSlice.actions;

// Selectors
export const selectBasket = (state) => state.planner.basket || [];
export const selectTimeline = (state) => state.planner.timeline || [];
export const selectAvailableActivities = (state) => state.planner.availableActivities || [];
export const selectBasketActivities = (state) => {
  const basketIds = state.planner.basket || [];
  const availableActivities = state.planner.availableActivities || [];
  return availableActivities.filter(activity => basketIds.includes(activity.id));
};

export const selectTimelineByDate = (state, date) => {
  const timeline = state.planner.timeline || [];
  return timeline.filter(item => item.scheduledDate === date);
};

export const selectTimelineTotals = (state) => {
  const timeline = state.planner.timeline || [];
  const totalActivities = timeline.length;
  const totalTime = timeline.reduce((sum, item) => sum + item.duration, 0);
  const totalCost = timeline.reduce((sum, item) => sum + item.cost, 0);
  
  return { totalActivities, totalTime, totalCost };
};

export const selectDayTotals = (state, date) => {
  const dayActivities = selectTimelineByDate(state, date);
  const totalTime = dayActivities.reduce((sum, item) => sum + item.duration, 0);
  const totalCost = dayActivities.reduce((sum, item) => sum + item.cost, 0);
  
  return { totalTime, totalCost, activityCount: dayActivities.length };
};

// Pure helper selector to compute next available time slot for a given date
// (helper removed; using reducer-state lastSuggestedTime if needed)

// Async thunks (keeping for future backend integration)
export const fetchBasket = createAsyncThunk(
  'planner/fetchBasket',
  async (tripId, { rejectWithValue }) => {
    try {
      const response = await itineraryAPI.getBasket(tripId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch basket');
    }
  }
);

export const updateBasket = createAsyncThunk(
  'planner/updateBasket',
  async ({ tripId, activityIds }, { rejectWithValue }) => {
    try {
      const response = await itineraryAPI.updateBasket(tripId, activityIds);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update basket');
    }
  }
);

export default plannerSlice.reducer; 