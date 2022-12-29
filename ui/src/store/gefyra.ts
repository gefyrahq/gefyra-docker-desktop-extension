import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { EnvironmentVariable, VolumeMount, VolumeMountUpdate } from '../types'

interface GefyraState {
  kubeconfig: string
  context: string
  image: string
  namespace: string
  availableNamespaces: Array<string>
  containerName: string
  environmentVariables: Array<EnvironmentVariable>
  volumeMounts: Array<VolumeMount>
  command: string
}

const initialState: GefyraState = {
  kubeconfig: localStorage.getItem("kubeconfig") || "",
  context: localStorage.getItem("kubectx") || "",
  image: localStorage.getItem("runImage") || "",
  namespace: localStorage.getItem("namespace") || "",
  availableNamespaces: [],
  containerName: localStorage.getItem("containerName") || "",
  environmentVariables: [],
  volumeMounts: JSON.parse(localStorage.getItem("volumeMounts")) || [],
  command: JSON.parse(localStorage.getItem("command")) || "",
}

export const gefyraSlice = createSlice({
    name: 'gefyra',
    initialState: initialState,
    reducers: {
      setKubeconfig: (state, action: PayloadAction<string>) => {
        state.kubeconfig = action.payload
        localStorage.setItem("kubeconfig", action.payload)
      },
      setContext: (state, action: PayloadAction<string>) => {
        state.context = action.payload
        localStorage.setItem("kubectx", action.payload)
      },
      setNamespace: (state, action: PayloadAction<string>) => {
        state.namespace = action.payload
        localStorage.setItem("namespace", action.payload)
      },
      setContainerName: (state, action: PayloadAction<string>) => {
        state.containerName = action.payload
        localStorage.setItem("containerName", action.payload)
      },
      setImage: (state, action: PayloadAction<string>) => {
	      state.image = action.payload
        localStorage.setItem("runImage", action.payload)
      },
      setEnvironmentVariables: (state, action: PayloadAction<Array<EnvironmentVariable>>) => {
        state.environmentVariables = action.payload
        localStorage.setItem("environmentVariables", JSON.stringify(state.environmentVariables))
      },
      addEnvironmentVariable: (state, action: PayloadAction<EnvironmentVariable>) => {
        state.environmentVariables.push(action.payload)
        localStorage.setItem("environmentVariables", JSON.stringify(state.environmentVariables))
      },
      removeEnvironmentVariable: (state, action: PayloadAction<number>) => {
        state.environmentVariables = state.environmentVariables.filter((e, index) => index !== action.payload)
        localStorage.setItem("environmentVariables", JSON.stringify(state.environmentVariables))
      },  
      addVolumeMount: (state, action: PayloadAction<VolumeMount>) => {
        state.volumeMounts.push(action.payload)
        localStorage.setItem("volumeMounts", JSON.stringify(state.volumeMounts))
      },
      setVolumeMount: (state, action: PayloadAction<VolumeMountUpdate>) => {
        state.volumeMounts[action.payload.index] = action.payload.volumeMount
        localStorage.setItem("volumeMounts", JSON.stringify(state.volumeMounts))
      },
      removeVolumeMount: (state, action: PayloadAction<number>) => {
        state.volumeMounts = state.volumeMounts.filter((e, index) => index !== action.payload)
        localStorage.setItem("volumeMounts", JSON.stringify(state.volumeMounts))
      },
      setCommand: (state, action: PayloadAction<string>) => {
        state.command = action.payload
        localStorage.setItem("command", JSON.stringify(state.command))
      },
      setAvailableNamespaces: (state, action: PayloadAction<Array<string>>) => {
        state.availableNamespaces = action.payload
      }
    }
})


export const { setKubeconfig, setContext, setNamespace, addEnvironmentVariable, removeEnvironmentVariable, addVolumeMount, removeVolumeMount, setVolumeMount, setImage, setEnvironmentVariables, setContainerName, setCommand, setAvailableNamespaces } = gefyraSlice.actions

export default gefyraSlice.reducer
