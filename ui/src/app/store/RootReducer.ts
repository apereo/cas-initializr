import { combineReducers } from "@reduxjs/toolkit";

import OverlayReducer from "./OverlayReducer";
import OptionReducer from "./OptionReducer";
import AppReducer from "./AppReducer";

const reducer = combineReducers({
    app: AppReducer.reducer,
    overlay: OverlayReducer.reducer,
    option: OptionReducer.reducer
});

export type RootState = ReturnType<typeof reducer>;

export default reducer;
