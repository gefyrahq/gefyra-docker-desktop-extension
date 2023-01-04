import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { EnvironmentVariable, VolumeMount, VolumeMountUpdate } from '../types';

interface GefyraState {
  kubeconfig: string;
  context: string;
  host: string;
  port: number;
  image: string;
  namespace: string;
  availableNamespaces: Array<string>;
  containerName: string;
  environmentVariables: Array<EnvironmentVariable>;
  volumeMounts: Array<VolumeMount>;
  command: string;
  availableWorkloads: Array<string>;
  envFrom: string;
}

const initialState: GefyraState = {
  kubeconfig: localStorage.getItem('kubeconfig') || '',
  context: localStorage.getItem('kubectx') || '',
  host: localStorage.getItem('host') || '',
  port: parseInt(localStorage.getItem('port')) || null,
  image: localStorage.getItem('runImage') || '',
  namespace: localStorage.getItem('namespace') || '',
  availableNamespaces: [],
  containerName: localStorage.getItem('containerName') || '',
  environmentVariables: [],
  volumeMounts: JSON.parse(localStorage.getItem('volumeMounts')) || [],
  command: JSON.parse(localStorage.getItem('command')) || '',
  availableWorkloads: [],
  envFrom: JSON.parse(localStorage.getItem('envFrom')) || ''
};

export const gefyraSlice = createSlice({
  name: 'gefyra',
  initialState: initialState,
  reducers: {
    setHost(state, action: PayloadAction<string>) {
      state.host = action.payload;
      localStorage.setItem('host', action.payload);
    },
    setPort(state, action: PayloadAction<number>) {
      state.port = action.payload;
      localStorage.setItem('port', action.payload.toString());
    },
    setKubeconfig: (state, action: PayloadAction<string>) => {
      state.kubeconfig = action.payload;
      localStorage.setItem('kubeconfig', action.payload);
    },
    setContext: (state, action: PayloadAction<string>) => {
      state.context = action.payload;
      localStorage.setItem('kubectx', action.payload);
    },
    setNamespace: (state, action: PayloadAction<string>) => {
      state.namespace = action.payload;
      localStorage.setItem('namespace', action.payload);
    },
    setContainerName: (state, action: PayloadAction<string>) => {
      state.containerName = action.payload;
      localStorage.setItem('containerName', action.payload);
    },
    setImage: (state, action: PayloadAction<string>) => {
      state.image = action.payload;
      localStorage.setItem('runImage', action.payload);
    },
    setEnvironmentVariables: (state, action: PayloadAction<Array<EnvironmentVariable>>) => {
      state.environmentVariables = action.payload;
      localStorage.setItem('environmentVariables', JSON.stringify(state.environmentVariables));
    },
    addEnvironmentVariable: (state, action: PayloadAction<EnvironmentVariable>) => {
      state.environmentVariables.push(action.payload);
      localStorage.setItem('environmentVariables', JSON.stringify(state.environmentVariables));
    },
    removeEnvironmentVariable: (state, action: PayloadAction<number>) => {
      state.environmentVariables = state.environmentVariables.filter(
        (e, index) => index !== action.payload
      );
      localStorage.setItem('environmentVariables', JSON.stringify(state.environmentVariables));
    },
    addVolumeMount: (state, action: PayloadAction<VolumeMount>) => {
      state.volumeMounts.push(action.payload);
      localStorage.setItem('volumeMounts', JSON.stringify(state.volumeMounts));
    },
    setVolumeMount: (state, action: PayloadAction<VolumeMountUpdate>) => {
      state.volumeMounts[action.payload.index] = action.payload.volumeMount;
      localStorage.setItem('volumeMounts', JSON.stringify(state.volumeMounts));
    },
    removeVolumeMount: (state, action: PayloadAction<number>) => {
      state.volumeMounts = state.volumeMounts.filter((e, index) => index !== action.payload);
      localStorage.setItem('volumeMounts', JSON.stringify(state.volumeMounts));
    },
    setCommand: (state, action: PayloadAction<string>) => {
      state.command = action.payload;
      localStorage.setItem('command', JSON.stringify(state.command));
    },
    setAvailableNamespaces: (state, action: PayloadAction<Array<string>>) => {
      state.availableNamespaces = action.payload;
    },
    setAvailableWorkloads: (state, action: PayloadAction<Array<string>>) => {
      state.availableWorkloads = action.payload;
    },
    setEnvFrom: (state, action: PayloadAction<string>) => {
      state.envFrom = action.payload;
      localStorage.setItem('envFrom', JSON.stringify(state.envFrom));
    }
  }
});

export const {
  setKubeconfig,
  setContext,
  setNamespace,
  addEnvironmentVariable,
  removeEnvironmentVariable,
  addVolumeMount,
  removeVolumeMount,
  setVolumeMount,
  setImage,
  setEnvironmentVariables,
  setContainerName,
  setCommand,
  setAvailableNamespaces,
  setAvailableWorkloads,
  setEnvFrom,
  setHost,
  setPort
} = gefyraSlice.actions;

export default gefyraSlice.reducer;
