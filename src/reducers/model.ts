import * as Redux from 'redux';
import { ActionType } from 'typesafe-actions';

import * as Actions from '../actions';
import { Action } from '../actions';

interface State {
    pan: number;
    tilt: number;
    hFov: number;
    width: number;
    height: number;
    x: number;
    y: number;
}

const defaultState: State = {
    pan: 0,
    tilt: 0,
    hFov: 75,
    width: 1920,
    height: 1080,
    x: 1920,
    y: 1080
};

type ModelActions =
    | ActionType<typeof Actions.changeHFov>
    | ActionType<typeof Actions.changeWidth>
    | ActionType<typeof Actions.changeHeight>
    | ActionType<typeof Actions.changeX>
    | ActionType<typeof Actions.changeY>;

const reducer: Redux.Reducer<Readonly<State>, ModelActions> = (state = defaultState, action) => {
    switch (action.type) {
    case Action.MODEL_HFOV_SET:
        return {...state, hFov: action.payload};
    case Action.MODEL_WIDTH_SET:
        return {...state, width: action.payload, x: Math.min(state.x, action.payload)};
    case Action.MODEL_HEIGHT_SET:
        return {...state, height: action.payload, y: Math.min(state.y, action.payload)};
    case Action.MODEL_X_SET:
        return {...state, x: action.payload};
    case Action.MODEL_Y_SET:
        return {...state, y: action.payload};
    }

    return state;
}

export default reducer;
