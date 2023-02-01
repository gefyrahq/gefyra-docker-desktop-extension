import { Grid, Step, StepButton, StepLabel, Stepper } from '@mui/material';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import { RootState } from './store';
import { resetSteps, setActiveStep, setMode, setView } from './store/ui';

export function Progress() {
  const dispatch = useDispatch();

  function handleStepClick(index) {
    if (index === 0) {
      dispatch(setMode(''));
      dispatch(setView('settings'));
      dispatch(resetSteps());
    }
    if (index === 1) {
      dispatch(setView('container'));
      dispatch(setActiveStep(1));
    }
  }

  const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

  const steps = useAppSelector((state) => state.ui.steps);
  const activeStep = useAppSelector((state) => state.ui.activeStep);

  return (
    <>
      <Grid item xs={12}>
        <Stepper activeStep={activeStep} alternativeLabel>
          {steps.map((step, index) => (
            <Step key={step.label}>
              {index < activeStep ? (
                <StepButton onClick={() => handleStepClick(index)}>{step.label}</StepButton>
              ) : (
                <StepLabel>{step.label}</StepLabel>
              )}
            </Step>
          ))}
        </Stepper>
      </Grid>
    </>
  );
}
