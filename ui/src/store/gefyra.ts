import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  EnvironmentVariable,
  GefyraBridge,
  PortMapping,
  PortMappingUpdate,
  VolumeMount,
  VolumeMountUpdate
} from '../types';

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
  containerPortMappings: Array<PortMapping>;
  bridgePortMappings: Array<PortMapping>;
  availableWorkloads: Array<string>;
  envFrom: string;
  activeBridges: Array<GefyraBridge>;
  target: string;
  timeout: string;
  bridgeContainer: string;
  bridgeNamespace: string;
}

const initialState: GefyraState = {
  kubeconfig: localStorage.getItem('kubeconfig') || '',
  context: localStorage.getItem('kubectx') || '',
  host: localStorage.getItem('host') || '',
  port: parseInt(localStorage.getItem('port') || '31820'),
  image: localStorage.getItem('runImage') || '',
  namespace: localStorage.getItem('namespace') || '',
  availableNamespaces: [],
  containerName: localStorage.getItem('containerName') || '',
  environmentVariables: [],
  volumeMounts: JSON.parse(localStorage.getItem('volumeMounts') || '[]'),
  command: JSON.parse(localStorage.getItem('command') || 'null') || '',
  containerPortMappings: JSON.parse(localStorage.getItem('portMappings') || '[]'),
  bridgePortMappings: JSON.parse(localStorage.getItem('bridgePortMappings') || '[]'),
  availableWorkloads: [],
  envFrom: JSON.parse(localStorage.getItem('envFrom') || 'null') || '',
  activeBridges: [],
  target: localStorage.getItem('target') || '',
  timeout: localStorage.getItem('timeout') || '',
  bridgeContainer: localStorage.getItem('bridgeContainer') || '',
  bridgeNamespace: localStorage.getItem('bridgeNamespace') || ''
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
    unsetPort(state) {
      state.port = 0;
      localStorage.removeItem('port');
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
    },
    addContainerPortMapping(state, action: PayloadAction<PortMapping>) {
      state.containerPortMappings.push(action.payload);
      localStorage.setItem('portMappings', JSON.stringify(state.containerPortMappings));
    },
    removeContainerPortMapping(state, action: PayloadAction<number>) {
      state.containerPortMappings = state.containerPortMappings.filter(
        (e, index) => index !== action.payload
      );
      localStorage.setItem('portMappings', JSON.stringify(state.containerPortMappings));
    },
    setContainerPortMapping(state, action: PayloadAction<PortMappingUpdate>) {
      state.containerPortMappings[action.payload.index] = action.payload.ports;
      localStorage.setItem('portMappings', JSON.stringify(state.containerPortMappings));
    },
    addBridgePortMapping(state, action: PayloadAction<PortMapping>) {
      state.bridgePortMappings.push(action.payload);
      localStorage.setItem('bridgePortMappings', JSON.stringify(state.bridgePortMappings));
    },
    removeBridgePortMapping(state, action: PayloadAction<number>) {
      state.bridgePortMappings = state.bridgePortMappings.filter(
        (e, index) => index !== action.payload
      );
      localStorage.setItem('bridgePortMappings', JSON.stringify(state.bridgePortMappings));
    },
    setBridgePortMapping(state, action: PayloadAction<PortMappingUpdate>) {
      state.bridgePortMappings[action.payload.index] = action.payload.ports;
      localStorage.setItem('bridgePortMappings', JSON.stringify(state.bridgePortMappings));
    },
    setActiveBridges(state, action: PayloadAction<Array<GefyraBridge>>) {
      state.activeBridges = action.payload;
    },
    setTarget(state, action: PayloadAction<string>) {
      state.target = action.payload;
      localStorage.setItem('target', action.payload);
    },
    setBridgeTimeout(state, action: PayloadAction<string>) {
      state.timeout = action.payload;
      localStorage.setItem('timeout', action.payload);
    },
    setBridgeContainer(state, action: PayloadAction<string>) {
      state.bridgeContainer = action.payload;
      localStorage.setItem('bridgeContainer', action.payload);
    },
    setBridgeNamespace(state, action: PayloadAction<string>) {
      state.bridgeNamespace = action.payload;
      localStorage.setItem('bridgeNamespace', action.payload);
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
  setPort,
  setContainerPortMapping,
  addContainerPortMapping,
  removeContainerPortMapping,
  addBridgePortMapping,
  removeBridgePortMapping,
  setBridgePortMapping,
  setActiveBridges,
  setBridgeTimeout,
  setTarget,
  setBridgeContainer,
  setBridgeNamespace,
  unsetPort
} = gefyraSlice.actions;

export default gefyraSlice.reducer;
