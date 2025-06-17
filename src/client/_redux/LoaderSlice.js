import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  value: false,
};

export const LoaderSlice = createSlice({
  name: "Loader",
  initialState,
  reducers: {
    updateLoader: (state, action) => {
      state.value = action.payload;
    },
  },
});

export const { updateLoader } = LoaderSlice.actions;

export default LoaderSlice.reducer;
