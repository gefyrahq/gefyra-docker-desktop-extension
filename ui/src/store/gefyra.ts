import { createSlice } from '@reduxjs/toolkit'

export const gefyraSlice = createSlice({
    name: 'gefyra',
    initialState: {
      mode: '',
      kubeconfig: '',
      context: '',
      namespace: '',
      environmentVariables: [],
      volumeMounts: []
    },
    reducers: {
      setMode: (state, action) => {
        state.mode = action.payload
      },
      setKubeconfig: (state, action) => {
        state.kubeconfig = action.payload
      },
      setContext: (state, action) => {
        state.context = action.payload
      },
      setNamespace: (state, action) => {
        state.namespace = action.payload
      },
      addEnvironmentVariable: (state, action) => {
        state.environmentVariables.push(action.payload)
      },
      removeEnvironmentVariable: (state, action) => {
        state.environmentVariables = state.environmentVariables.filter((e, index) => index !== action.payload)
      },  
      addVolumeMount: (state, action) => {
        state.volumeMounts.push(action.payload)
      },
      setVolumeMount: (state, action) => {
        state.volumeMounts[action.payload.index] = action.payload.volumeMount
      },
      removeVolumeMount: (state, action) => {
        state.volumeMounts = state.volumeMounts.filter((e, index) => index !== action.payload)
      }
    }
})


export const { setMode, setKubeconfig, setContext, setNamespace, addEnvironmentVariable, removeEnvironmentVariable, addVolumeMount, removeVolumeMount, setVolumeMount } = gefyraSlice.actions

export default gefyraSlice.reducer
