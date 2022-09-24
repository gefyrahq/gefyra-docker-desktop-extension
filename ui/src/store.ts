import { configureStore } from '@reduxjs/toolkit'
import uiReducer from './store/ui'

const store = configureStore({
    reducer: {
        ui: uiReducer
    }
})


export type RootState = ReturnType<typeof store.getState>
export default store