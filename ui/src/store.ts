import { configureStore } from '@reduxjs/toolkit'
import uiReducer from './store/ui'
import gefyraReducer from './store/gefyra'

const store = configureStore({
    reducer: {
        ui: uiReducer,
        gefyra: gefyraReducer
    }
})


export type RootState = ReturnType<typeof store.getState>
export default store