import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  active: false,
  details: null, // { name, description, startDate, endDate, budget, ... }
  cities: [], // [{ city, country, places: [ { name, notes } ] }]
  currentCity: null, // { city, country, places: [] }
};

const tripBuilderSlice = createSlice({
  name: 'tripBuilder',
  initialState,
  reducers: {
    startTripBuild: (state, action) => {
      state.active = true;
      state.details = action.payload; // basic trip details
      state.cities = [];
      state.currentCity = null;
    },
    setCurrentCity: (state, action) => {
      const { city, country } = action.payload;
      state.currentCity = { city, country, places: [] };
    },
    addPlaceToCurrentCity: (state, action) => {
      if (!state.currentCity) return;
      const place = action.payload; // { name, notes }
      state.currentCity.places.push(place);
    },
    removePlaceFromCurrentCity: (state, action) => {
      if (!state.currentCity) return;
      const index = action.payload; // index in places
      state.currentCity.places.splice(index, 1);
    },
    saveCurrentCity: (state) => {
      if (!state.currentCity) return;
      // if city already exists, replace it; else push
      const idx = state.cities.findIndex(
        c => c.city === state.currentCity.city && c.country === state.currentCity.country
      );
      if (idx >= 0) state.cities[idx] = state.currentCity;
      else state.cities.push(state.currentCity);
      state.currentCity = null;
    },
    clearBuilder: (state) => {
      state.active = false;
      state.details = null;
      state.cities = [];
      state.currentCity = null;
    },
  },
});

export const {
  startTripBuild,
  setCurrentCity,
  addPlaceToCurrentCity,
  removePlaceFromCurrentCity,
  saveCurrentCity,
  clearBuilder,
} = tripBuilderSlice.actions;

export default tripBuilderSlice.reducer;
