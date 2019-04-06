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
        return <form>
            <label htmlFor="hFovRange">Horizontal FOV</label>
            <input type="range" className="custom-range" min={-90} max={90} step={1} id="hFovRange"
                name="changeHFov" value={this.props.hFov} onChange={this.onChange} />
        </form>;
    }
}