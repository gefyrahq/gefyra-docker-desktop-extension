import { useMemo, useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { setActiveStep, setMode, setView } from '../store/ui';
import { GefyraRoute } from '../types';

const useNavigation = (previousRoute: GefyraRoute, nextRoute: GefyraRoute) => {
  const dispatch = useDispatch();
  const back = useCallback(() => {
    if (previousRoute.resetMode) {
      dispatch(setMode(''));
    }
    dispatch(setView(previousRoute.view));
    dispatch(setActiveStep(previousRoute.step));
  }, [dispatch, previousRoute]);

  const next = useCallback(() => {
    if (nextRoute.resetMode) {
      dispatch(setMode(''));
    }
    dispatch(setView(nextRoute.view));
    dispatch(setActiveStep(nextRoute.step));
  }, [nextRoute, dispatch]);

  const values = useMemo(() => {
    return [back, next];
  }, [next, back]);

  return values;
};

export default useNavigation;
