import { createSlice } from '@reduxjs/toolkit'


const initialSteps = [
    { label: 'Choose Mode' },
    { label: 'Kubernetes Settings' },
    { label: 'Container Settings' },
    { label: 'Execute' },
];

export const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    mode: localStorage.getItem("mode") || "",
    view: localStorage.getItem("view") || "mode",
    steps: initialSteps,
    activeStep: parseInt(localStorage.getItem("activeStep")) || 0,
  },
  reducers: {
    setMode: (state, action) => {
      state.mode = action.payload
      localStorage.setItem("mode", action.payload)
    },
    setView: (state, action) => {
      state.view = action.payload
      localStorage.setItem("view", action.payload)
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
      localStorage.setItem("activeStep", action.payload)
    },
  }
})

export const { setMode, setView, setSteps, resetSteps, setActiveStep } = uiSlice.actions

export default uiSlice.reducer
