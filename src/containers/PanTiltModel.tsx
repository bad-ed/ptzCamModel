import * as React from 'react';
import { connect, Omit } from 'react-redux';

import { RootState } from '../reducers';
import { PanTiltModel as PanTiltModelComponent } from '../components/PanTiltModel';

type ModelState = RootState['model'];
type ComponentProps = React.ComponentProps<typeof PanTiltModelComponent>;
type OwnProps = Pick<ComponentProps, Exclude<keyof ComponentProps, keyof ModelState>>;

export const PanTiltModel = connect<ComponentProps, {}, OwnProps>(
    (state: RootState, ownProps) => ({...state.model, ...ownProps})
)(PanTiltModelComponent);
