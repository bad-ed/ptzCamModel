import * as Redux from 'redux';
import { ActionType } from 'typesafe-actions';

import * as Actions from '../actions';
import { Action } from '../actions';

interface State {
    pan: number;
    tilt: number;
    hFov: number;
}

const defaultState: State = {
    pan: 0,
    tilt: 0,
    hFov: 75
};

type ModelActions =
    | ActionType<typeof Actions.changeHFov>;

const reducer: Redux.Reducer<Readonly<State>, ModelActions> = (state = defaultState, action) => {
    switch (action.type) {
    case Action.MODEL_HFOV_SET:
        return {...state, hFov: action.payload};
    }

    return state;
}

export default reducer;
