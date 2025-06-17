import { configureStore } from "@reduxjs/toolkit";
import AuthSliceReducer from "./_redux/AuthSlice.js";
import LoaderSliceReducer from "./_redux/LoaderSlice.js";
import SeletedJobCodeReducer from "./_redux/SeletedJobCodeSlice.js";
import SnackbarSliceReducer from "./_redux/SnackbarSlice.js";

export const store = configureStore({
  reducer: {
    SeletedJobCode: SeletedJobCodeReducer,
    Loader: LoaderSliceReducer,
    Snackbar: SnackbarSliceReducer,
    Auth: AuthSliceReducer
  },
});
