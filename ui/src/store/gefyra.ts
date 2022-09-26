import { createSlice } from '@reduxjs/toolkit'

export const gefyraSlice = createSlice({
    name: 'gefyra',
    initialState: {
      mode: '',
      kubeconfig: '',
      context: '',
      namespace: '',
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
    }
})


export const { setMode, setKubeconfig, setContext, setNamespace } = gefyraSlice.actions

export default gefyraSlice.reducer
