import { createSlice } from '@reduxjs/toolkit'

export const gefyraSlice = createSlice({
    name: 'gefyra',
    initialState: {
      mode: '',
      kubeconfig: localStorage.getItem("kubeconfig") || "",
      context: localStorage.getItem("kubectx") || "",
      image: localStorage.getItem("runImage") || "",
      namespace: localStorage.getItem("namespace") || "",
      containerName: localStorage.getItem("containerName") || "",
      environmentVariables: [],
      volumeMounts: JSON.parse(localStorage.getItem("volumeMounts")) || [],
    },
    reducers: {
      setMode: (state, action) => {
        state.mode = action.payload
      },
      setKubeconfig: (state, action) => {
        state.kubeconfig = action.payload
        localStorage.setItem("kubeconfig", action.payload)
      },
      setContext: (state, action) => {
        state.context = action.payload
        localStorage.setItem("kubectx", action.payload)
      },
      setNamespace: (state, action) => {
        state.namespace = action.payload
        localStorage.setItem("namespace", action.payload)
      },
      setContainerName: (state, action) => {
        state.containerName = action.payload
        localStorage.setItem("containerName", action.payload)
      },
      setImage: (state, action) => {
	      state.image = action.payload
        localStorage.setItem("runImage", action.payload)
      },
      setEnvironmentVariables: (state, action) => {
        state.environmentVariables = action.payload
        localStorage.setItem("environmentVariables", JSON.stringify(state.environmentVariables))
      },
      addEnvironmentVariable: (state, action) => {
        state.environmentVariables.push(action.payload)
        localStorage.setItem("environmentVariables", JSON.stringify(state.environmentVariables))
      },
      removeEnvironmentVariable: (state, action) => {
        state.environmentVariables = state.environmentVariables.filter((e, index) => index !== action.payload)
        localStorage.setItem("environmentVariables", JSON.stringify(state.environmentVariables))
      },  
      addVolumeMount: (state, action) => {
        state.volumeMounts.push(action.payload)
        localStorage.setItem("volumeMounts", JSON.stringify(state.volumeMounts))
      },
      setVolumeMount: (state, action) => {
        state.volumeMounts[action.payload.index] = action.payload.volumeMount
        localStorage.setItem("volumeMounts", JSON.stringify(state.volumeMounts))
      },
      removeVolumeMount: (state, action) => {
        state.volumeMounts = state.volumeMounts.filter((e, index) => index !== action.payload)
        localStorage.setItem("volumeMounts", JSON.stringify(state.volumeMounts))
      }
    }
})


export const { setMode, setKubeconfig, setContext, setNamespace, addEnvironmentVariable, removeEnvironmentVariable, addVolumeMount, removeVolumeMount, setVolumeMount, setImage, setEnvironmentVariables, setContainerName } = gefyraSlice.actions

export default gefyraSlice.reducer
