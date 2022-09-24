import { createSlice } from '@reduxjs/toolkit'

export const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    mode: '',
    view: 'mode'
  },
  reducers: {
    setMode: (state, action) => {
      state.mode = action.payload
    },
    setView: (state, action) => {
      state.view = action.payload
    },
  }
})

export const { setMode, setView } = uiSlice.actions

export default uiSlice.reducer
