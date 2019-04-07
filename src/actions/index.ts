import * as Redux from 'redux';
import { action, ActionType } from 'typesafe-actions';

export enum Action {
    MODEL_HFOV_SET = 'model.hfov.set',
    MODEL_WIDTH_SET = 'model.width.set',
    MODEL_HEIGHT_SET = 'model.height.set',
    MODEL_X_SET = 'model.x.set',
    MODEL_Y_SET = 'model.y.set',
}

export const changeHFov = (hFov: number) => action(Action.MODEL_HFOV_SET, hFov);
export const changeWidth = (width: number) => action(Action.MODEL_WIDTH_SET, width);
export const changeHeight = (height: number) => action(Action.MODEL_HEIGHT_SET, height);
export const changeX = (x: number) => action(Action.MODEL_X_SET, x);
export const changeY = (y: number) => action(Action.MODEL_Y_SET, y);
