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
    pan: 33.5,
    tilt: 44,
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
    | ActionType<typeof Actions.changeY>
    | ActionType<typeof Actions.changePan>
    | ActionType<typeof Actions.changeTilt>;

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
    case Action.MODEL_PAN_SET:
        return {...state, pan: action.payload};
    case Action.MODEL_TILT_SET:
        return {...state, tilt: action.payload};
    }

    return state;
}

export default reducer;
