import * as React from 'react';

interface Props {
    hFov: number;

    changeHFov(hFov: number): void;
}

export class ModelControls extends React.PureComponent<Props> {
    constructor(props) {
        super(props);

        this.onChange = this.onChange.bind(this);
    }

    private onChange(e: React.ChangeEvent<HTMLInputElement>) {
        const controlName = e.target.name;
        (this.props[controlName] as (value: number) => void)(e.target.valueAsNumber);
    }

    render() {
        return <form className="pb-3">
            <label htmlFor="hFovRange">Horizontal FOV {this.props.hFov}°</label>
            <input type="range" className="custom-range" min={1} max={90} step={0.1} id="hFovRange"
                name="changeHFov" value={this.props.hFov} onChange={this.onChange} />
        </form>;
    }
}