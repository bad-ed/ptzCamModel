import * as React from 'react';
import * as katex from 'katex';

interface Props {
    children: string;
}

class Math extends React.Component<Props & {tag: 'div' | 'span'}> {
    private containerRef = React.createRef<HTMLElement>();

    shouldComponentUpdate(nextProps: Props) {
        return nextProps.children !== this.props.children;
    }

    componentDidMount() {
        this.renderFormula();
    }

    componentDidUpdate() {
        this.renderFormula();
    }

    render() {
        return React.createElement(this.props.tag, {
            ref: this.containerRef
        });
    }

    private renderFormula() {
        katex.render(this.props.children, this.containerRef.current, {
            displayMode: this.props.tag === 'div'
        });
    }
}

export const Inline: React.SFC<Props> = props => <Math tag="span" children={props.children} />;
export const Block: React.SFC<Props> = props => <Math tag="div" children={props.children} />;
