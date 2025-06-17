import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  type: '',
  message: '',
};

export const SnackbarSlice = createSlice({
  name: "Snackbar",
  initialState,
  reducers: {
    updateSnackbar: (state, action) => {
      state.type = action.payload.type;
      state.message = action.payload.message;
    },
  },
});

export const { updateSnackbar } = SnackbarSlice.actions;

export default SnackbarSlice.reducer;
