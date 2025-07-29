import { combineReducers } from '@reduxjs/toolkit';
// ...import slices here

const rootReducer = combineReducers({
  // add your slices here
});

export type RootState = ReturnType<typeof rootReducer>;
export default rootReducer;
