import { combineReducers } from "@reduxjs/toolkit";

import OverlayReducer from "./OverlayReducer";
import OptionReducer from "./OptionReducer";
import AppReducer from "./AppReducer";
import PreviewReducer from './PreviewReducer';
import { propertyApi } from "./PropertyApi";

const reducer = combineReducers({
    app: AppReducer.reducer,
    overlay: OverlayReducer.reducer,
    option: OptionReducer.reducer,
    preview: PreviewReducer.reducer,
    [propertyApi.reducerPath]: propertyApi.reducer,
});

export type RootState = ReturnType<typeof reducer>;

export default reducer;
