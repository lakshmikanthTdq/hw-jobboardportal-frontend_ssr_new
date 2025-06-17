import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    // id: 0,
    // email: "",
    // firstName: "",
    // lastName: "",
    // phoneNumber: "",
    // insertedAt: "",
    // count: 0,
    layoutStyleData : "",
    headerPreviewImg: "",
}

export const AuthSlice = createSlice({
    name: "Auth",
    initialState,
    reducers: {
        updateAuth: (state, action) => {
            if (action.payload) {
                // state.id = action.payload.id;
                // state.email = action.payload.email;
                // state.firstName = action.payload.firstName;
                // state.lastName = action.payload.lastName;
                // state.phoneNumber = action.payload.phoneNumber;
                // state.insertedAt = action.payload.insertedAt;
                // state.count = action.payload.count;
                state.layoutStyleData = action.payload.layoutStyleData;
                state.headerPreviewImg = action.payload.headerPreviewImg;
            } else {
                state = initialState
            }
        },
    },
});

export const { updateAuth } = AuthSlice.actions;

export default AuthSlice.reducer;
