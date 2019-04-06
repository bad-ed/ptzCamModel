import { combineReducers } from 'redux';
import { StateType } from 'typesafe-actions';

import model from './model';

const rootReducer = combineReducers({
    model
});

export default rootReducer;
export type RootState = Readonly<StateType<typeof rootReducer>>;
