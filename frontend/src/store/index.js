import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import tripReducer from './slices/tripSlice';
import uiReducer from './slices/uiSlice';
import cityReducer from './slices/citySlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    trips: tripReducer,
    ui: uiReducer,
    cities: cityReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
}); 