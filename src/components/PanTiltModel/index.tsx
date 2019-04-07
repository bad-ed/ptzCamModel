import * as React from 'react';
import * as THREE from 'three';

import { Scene } from './PanTiltScene';

const SPHERE_RADIUS = 16;

interface Props {
    style?: React.CSSProperties;
    className?: string;
    pan: number;
    tilt: number;
    hFov: number;
    width: number;
    height: number;
    x: number;
    y: number;
}

function createCamera(width: number, height: number) {
    let camera = new THREE.PerspectiveCamera(50, width / height);

    camera.position.x = 40;
    camera.position.y = -10;
    camera.position.z = 40;
    camera.lookAt(0,0,0);

    return camera;
}

function createRenderer(width: number, height: number) {
    let renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.setClearColor(0xffffff);
    renderer.setSize(width, height, false);

    return renderer;
}

export class PanTiltModel extends React.Component<Props> {
    private rootDiv = React.createRef<HTMLDivElement>();
    private scene: Scene = null;
    private camera: THREE.PerspectiveCamera = null;
    private renderer: THREE.Renderer = null;
    private rafId = 0;

    constructor(props: Props) {
        super(props);

        this.animate = this.animate.bind(this);
    }

    shouldComponentUpdate(nextProps: Props) {
        this.updateSceneProps(this.props, nextProps);
        return false;
    }

    // In case if forceUpdate() was called
    componentDidUpdate(prevProps: Props) {
        this.updateSceneProps(prevProps, this.props);
    }

    componentDidMount() {
        const viewPort = this.rootDiv.current;

        this.scene = new Scene(SPHERE_RADIUS, this.props.width, this.props.height,
            this.props.hFov, this.props.x, this.props.y);
        this.camera = createCamera(viewPort.clientWidth, viewPort.clientHeight);
        this.renderer = createRenderer(viewPort.clientWidth, viewPort.clientHeight);

        const canvas = this.renderer.domElement;
        canvas.style.width = '100%';
        canvas.style.height = '100%';

        viewPort.appendChild(canvas);
        this.animate();
    }

    componentWillUnmount() {
        if (this.rafId !== 0) {
            cancelAnimationFrame(this.rafId);
        }
    }

    render() {
        return <div style={{...(this.props.style || {}), position: 'relative'}} className={this.props.className || ''} ref={this.rootDiv} />
    }

    private animate() {
        this.rafId = requestAnimationFrame(this.animate);

        const renderer = this.renderer;
        const canvas = renderer.domElement;

        const {clientWidth, clientHeight} = this.rootDiv.current;
        if (clientWidth !== canvas.width ||
            clientHeight !== canvas.height)
        {
            this.camera.aspect = clientWidth / clientHeight;
            this.camera.updateProjectionMatrix();

            renderer.setSize(clientWidth, clientHeight, false);
        }

        this.scene.onBeforeRender(this.camera.position);
        renderer.render(this.scene.getScene(), this.camera);
    }

    private updateSceneProps(prevProps: Props, newProps: Props) {
        this.scene.updateSceneProps(
            newProps.hFov,
            newProps.width, newProps.height,
            newProps.x, newProps.y,
            newProps.pan, newProps.tilt
        );
    }
}
