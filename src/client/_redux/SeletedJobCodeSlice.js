import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  value: 0,
}

export const SeletedJobCodeSlice = createSlice({
  name: 'SeletedJobCode',
  initialState,
  reducers: {
    updateJobCode: (state, action) => {      
      state.value = action.payload.id;
    },
  },
})

export const { updateJobCode } = SeletedJobCodeSlice.actions

export default SeletedJobCodeSlice.reducer;