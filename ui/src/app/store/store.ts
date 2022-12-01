import { configureStore } from "@reduxjs/toolkit";

import rootReducer from "./RootReducer";

export const store = configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().prepend(),
});

export type AppDispatch = typeof store.dispatch;
