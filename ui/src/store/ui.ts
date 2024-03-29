import { AlertColor } from '@mui/material';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

const initialSteps = [
  { label: 'Kubernetes Settings' },
  { label: 'Container Settings' },
  { label: 'Start Container' }
];

interface UIState {
  mode: string;
  view: string;
  steps: Array<{ label: string }>;
  activeStep: number;
  snackbarText: string;
  snackbarVisible: boolean;
  snackbarType: AlertColor;
  trackingId: string;
  fresh: boolean; // Indicates the app just started
}

const initialState: UIState = {
  mode: localStorage.getItem('mode') || '',
  view: localStorage.getItem('view') || 'home',
  steps: initialSteps,
  activeStep: parseInt(localStorage.getItem('activeStep') || '0') || 0,
  snackbarText: '',
  snackbarVisible: false,
  snackbarType: 'success',
  trackingId: '',
  fresh: true
};

export const uiSlice = createSlice({
  name: 'ui',
  initialState: initialState,
  reducers: {
    notFresh: (state) => {
      state.fresh = false;
    },
    setMode: (state, action) => {
      state.mode = action.payload;
      localStorage.setItem('mode', action.payload);
    },
    setView: (state, action) => {
      state.view = action.payload;
      localStorage.setItem('view', action.payload);
    },
    setSteps: (state, action) => {
      state.steps = action.payload;
    },
    resetSteps: (state) => {
      state.steps = initialSteps;
      state.activeStep = 0;
    },
    setActiveStep: (state, action) => {
      state.activeStep = action.payload;
      localStorage.setItem('activeStep', action.payload);
    },
    setSnackbar: (state, action: PayloadAction<{ text: string; type: AlertColor }>) => {
      state.snackbarText = action.payload.text;
      state.snackbarType = action.payload.type;
      state.snackbarVisible = true;
    },
    closeSnackbar: (state) => {
      state.snackbarVisible = false;
    },
    setTrackingId: (state) => {
      state.trackingId = localStorage.getItem('trackingId') || '';
      if (!state.trackingId) {
        state.trackingId = window.crypto.randomUUID();
        localStorage.setItem('trackingId', state.trackingId);
      }
    }
  }
});

export const {
  setMode,
  setView,
  setSteps,
  resetSteps,
  setActiveStep,
  setSnackbar,
  closeSnackbar,
  setTrackingId,
  notFresh
} = uiSlice.actions;

export default uiSlice.reducer;
