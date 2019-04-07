import * as React from 'react';
import { connect, Omit } from 'react-redux';

import { RootState } from '../reducers';
import { changeHFov } from '../actions';

import { ModelControls as ModelControlsComponent } from '../components/PanTiltModel/ModelControls';

type ComponentProps = React.ComponentProps<typeof ModelControlsComponent>;
type DispatchProps = Pick<ComponentProps, 'changeHFov'>;
type StateProps = Omit<ComponentProps, keyof DispatchProps>;

export const ModelControls = connect<StateProps, DispatchProps>(
    (state: RootState) => ({...state.model}),
    {
        changeHFov
    }
)(ModelControlsComponent);
