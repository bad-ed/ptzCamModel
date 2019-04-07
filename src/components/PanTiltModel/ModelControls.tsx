import * as React from 'react';
import { v4 as genUuid } from 'uuid';
import { changeX } from '../../actions';

interface Props {
    hFov: number;
    width: number;
    height: number;
    x: number;
    y: number;

    changeHFov(hFov: number): void;
    changeWidth(width: number): void;
    changeHeight(height: number): void;
    changeX(x: number): void;
    changeY(y: number): void;
}

interface ControlProps {
    min: number;
    max: number;
    value: number;
    step: number;
    children: string | number | (string | number)[];
    onChange(value: number): void;
}

class Control extends React.PureComponent<ControlProps> {
    private id: string;

    constructor(props : ControlProps) {
        super(props);

        this.id = `${genUuid}`;
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
    constructor(props) {
        super(props);

        this.changeX = this.changeX.bind(this);
        this.changeY = this.changeY.bind(this);
    }

    changeX(value: number) { return this.props.changeX(Math.min(value, this.props.width)); }
    changeY(value: number) { return this.props.changeY(Math.min(value, this.props.height)); }

    render() {
        const {hFov, width, height, x, y} = this.props;

        return <form className="pb-3">
            <Control min={1} max={90} step={0.1} onChange={this.props.changeHFov}
                value={hFov}>Horizontal FOV {hFov}°</Control>
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
        </form>;
    }
}
