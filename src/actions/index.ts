import * as Redux from 'redux';
import { action, ActionType } from 'typesafe-actions';

export enum Action {
    MODEL_HFOV_SET = 'model.hfov.set'
}

export const changeHFov = (hFov: number) => action(Action.MODEL_HFOV_SET, hFov);
