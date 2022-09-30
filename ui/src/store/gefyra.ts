import { createSlice } from '@reduxjs/toolkit'

export const gefyraSlice = createSlice({
    name: 'gefyra',
    initialState: {
      mode: '',
      kubeconfig: '',
      context: '',
      namespace: '',
      environmentVariables: []
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
      }
    }
})


export const { setMode, setKubeconfig, setContext, setNamespace, addEnvironmentVariable, removeEnvironmentVariable } = gefyraSlice.actions

export default gefyraSlice.reducer
