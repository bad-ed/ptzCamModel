import * as React from 'react';
import { connect, Omit } from 'react-redux';

import { RootState } from '../reducers';
import { changeHFov, changeWidth, changeHeight, changeX, changeY, changePan, changeTilt } from '../actions';

import { ModelControls as ModelControlsComponent } from '../components/PanTiltModel/ModelControls';

type ComponentProps = React.ComponentProps<typeof ModelControlsComponent>;
type DispatchProps = Pick<ComponentProps, 'changeHFov' | 'changeWidth' | 'changeHeight' | 'changeX' | 'changeY' | 'changePan' | 'changeTilt'>;
type StateProps = Omit<ComponentProps, keyof DispatchProps>;

export const ModelControls = connect<StateProps, DispatchProps>(
    (state: RootState) => ({...state.model}),
    {
        changeHFov,
        changeWidth,
        changeHeight,
        changeX,
        changeY,
        changeTilt,
        changePan
    }
)(ModelControlsComponent);
