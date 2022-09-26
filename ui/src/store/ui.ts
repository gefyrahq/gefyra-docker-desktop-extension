import { createSlice } from '@reduxjs/toolkit'


const initialSteps = [
    { label: 'Choose Mode' },
    { label: 'Kubernetes Settings' },
    { label: 'Container Settings' },
];

export const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    mode: '',
    view: 'mode',
    steps: initialSteps,
    activeStep: 0
  },
  reducers: {
    setMode: (state, action) => {
      state.mode = action.payload
    },
    setView: (state, action) => {
      state.view = action.payload
    },
    setSteps: (state, action) => {
      state.steps = action.payload
    },
    resetSteps: (state) => {
      state.steps = initialSteps
      state.activeStep = 0
    },
    setActiveStep: (state, action) => {
      state.activeStep = action.payload
    },
  }
})

export const { setMode, setView, setSteps, resetSteps, setActiveStep } = uiSlice.actions

export default uiSlice.reducer
