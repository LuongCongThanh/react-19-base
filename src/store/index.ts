import { combineReducers } from '@reduxjs/toolkit';

import authReducer from '../pages/auth/slices/authSlice';

const rootReducer = combineReducers({
  auth: authReducer,
  // add your slices here
});

export type RootState = ReturnType<typeof rootReducer>;
export default rootReducer;
