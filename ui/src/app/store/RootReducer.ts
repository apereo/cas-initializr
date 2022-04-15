import { combineReducers } from "@reduxjs/toolkit";

import DependencyReducer from "./DependencyReducer";

const reducer = combineReducers({
    dependencies: DependencyReducer.reducer,
});

export type RootState = ReturnType<typeof reducer>;

export default reducer;
