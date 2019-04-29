import * as React from 'react';
import { v4 as genUuid } from 'uuid';
import memoizeOne from 'memoize-one';

import { Inline as IM } from '../Math';

interface DataProps {
    hFov: number;
    width: number;
    height: number;
    x: number;
    y: number;
    pan: number;
    tilt: number;
}

interface Props extends DataProps {
    changeHFov(hFov: number): void;
    changeWidth(width: number): void;
    changeHeight(height: number): void;
    changeX(x: number): void;
    changeY(y: number): void;
    changePan(pan: number): void;
    changeTilt(tilt: number): void;
}

interface ControlProps {
    min: number;
    max: number;
    value: number;
    step: number;
    children: string | number | (string | number)[];
    onChange(value: number): void;
}

const calculateAngles = (props: DataProps) => {
    const tiltRad = props.tilt * Math.PI / 180;

    const tanHalfHfov = Math.tan(props.hFov * Math.PI / 360);
    const tanAlpha = tanHalfHfov * (2 * props.x - props.width) / props.width;
    const tanBeta = tanHalfHfov * (2 * props.y - props.height) / props.width;
    const cosAlpha = 1 / Math.sqrt(1 + tanAlpha * tanAlpha);
    const tanBetaApos = tanBeta * cosAlpha;
    const cosBetaApos = 1 / Math.sqrt(1 + tanBetaApos * tanBetaApos);
    const cosPhi = Math.cos(tiltRad);
    const tanPhi = Math.tan(tiltRad);

    const newTilt = Math.asin(cosAlpha * cosBetaApos * cosPhi * (tanBeta + tanPhi));
    const panDelta = Math.atan2(tanAlpha, cosPhi * (1 - tanBeta * tanPhi));
    let newPan = props.pan + panDelta * 180 / Math.PI;
    if (newPan >= 360) newPan -= 360;
    else if (newPan < 0) newPan += 360;

    return {
        newTilt: newTilt * 180 / Math.PI,
        newPan
    };
}

class Control extends React.PureComponent<ControlProps> {
    private id: string;

    constructor(props : ControlProps) {
        super(props);

        this.id = `${genUuid()}`;
        this.onChange = this.onChange.bind(this);
    }

    private onChange(e: React.ChangeEvent<HTMLInputElement>) {
        this.props.onChange(e.target.valueAsNumber);
    }

    render() {
        return <>
            <label htmlFor={this.id}>{this.props.children}</label>
            <input type="range" className="custom-range" min={this.props.min} max={this.props.max}
                step={this.props.step} id={this.id} value={this.props.value} onChange={this.onChange} />
        </>;
    }
}

export class ModelControls extends React.PureComponent<Props> {
    private newAngles = memoizeOne(calculateAngles);

    constructor(props) {
        super(props);

        this.changeX = this.changeX.bind(this);
        this.changeY = this.changeY.bind(this);
    }

    changeX(value: number) { return this.props.changeX(Math.min(value, this.props.width)); }
    changeY(value: number) { return this.props.changeY(Math.min(value, this.props.height)); }

    render() {
        const {hFov, width, height, x, y, pan, tilt} = this.props;
        const {newTilt, newPan} = this.newAngles(this.props);

        return <form className="pb-3">
            <div className="row">
                <div className="col">
                    <Control min={1} max={90} step={0.1} onChange={this.props.changeHFov}
                        value={hFov}>Horizontal FOV {hFov}°</Control>
                </div>
                <div className="col">
                    <Control min={0} max={360} step={0.1} onChange={this.props.changePan}
                        value={pan}>Pan {pan}°</Control>
                </div>
                <div className="col">
                    <Control min={-90} max={90} step={0.1} onChange={this.props.changeTilt}
                        value={tilt}>Tilt {tilt}°</Control>
                </div>
            </div>
            <div className="row">
                <div className="col">
                    <Control min={1} max={2048} step={1} onChange={this.props.changeWidth}
                        value={width}>Width {width}px</Control>
                </div>
                <div className="col">
                    <Control min={1} max={2048} step={1} onChange={this.props.changeHeight}
                        value={height}>Height {height}px</Control>
                </div>
            </div>
            <div className="row">
                <div className="col">
                    <Control min={1} max={2048} step={1} onChange={this.changeX}
                        value={Math.min(x, width)}>X {x}px</Control>
                </div>
                <div className="col">
                    <Control min={1} max={2048} step={1} onChange={this.changeY}
                        value={Math.min(y, height)}>Y {y}px</Control>
                </div>
            </div>
            <div className="row">
                <div className="col"><IM>\theta^*</IM> {Number(newPan).toFixed(3)}°</div>
                <div className="col"><IM>\phi^*</IM> {Number(newTilt).toFixed(3)}°</div>
            </div>
        </form>;
    }
}
