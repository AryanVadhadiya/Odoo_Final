import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import tripReducer from './slices/tripSlice';
import uiReducer from './slices/uiSlice';
import cityReducer from './slices/citySlice';
import plannerReducer from './slices/plannerSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    trips: tripReducer,
    ui: uiReducer,
    cities: cityReducer,
    planner: plannerReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
}); 