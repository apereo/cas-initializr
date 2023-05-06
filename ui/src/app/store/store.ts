import { configureStore } from "@reduxjs/toolkit";

import rootReducer from "./RootReducer";
import { propertyApi } from "./PropertyApi";

export const store = configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().prepend().concat(propertyApi.middleware),
});

export type AppDispatch = typeof store.dispatch;
