import * as THREE from 'three';

const BG_MERIDIANS_COLOR = 0xdddddd;
const SPHERE_CENTER = new THREE.Vector3(0,0,0);

function createParallel(radius: number, theta: number) {
    const circleRadius = radius * Math.cos(theta);

    var curve = new THREE.EllipseCurve(
        0, 0,            // ax, aY
        circleRadius, circleRadius,   // xRadius, yRadius
        0, Math.PI * 2,  // aStartAngle, aEndAngle
        false,           // aClockwise
        0                // aRotation
    );

    var z = radius * Math.sin(theta);
    var points = curve.getPoints(60).map(v2 => new THREE.Vector3(v2.x, z, v2.y));

    return (new THREE.BufferGeometry()).setFromPoints( points );
}

function createParallels(radius: number, additionalParallels = 0) {
    var material = new THREE.LineBasicMaterial( { color : BG_MERIDIANS_COLOR } );

    let result = [];

    for (let i = 0; i < additionalParallels; ++i) {
        const theta = Math.asin((radius * (i + 1)) / (radius * (additionalParallels + 1)));

        result.push(createParallel(radius, theta));
        result.push(createParallel(radius, -theta));
    }

    let group = new THREE.Group();
    group.add(...(result.map(geometry => new THREE.Line(geometry, material))));

    material = new THREE.LineBasicMaterial( { color : 0x999999 } );
    group.add(new THREE.Line(createParallel(radius, 0), material));

    // Create the final object to add to the scene
    return group;
}

function createMeridians(radius: number, meridians = 1) {
    let rotationStep = Math.PI / meridians;

    let curve = new THREE.EllipseCurve(
        0,  0,            // ax, aY
        radius, radius,   // xRadius, yRadius
        Math.PI / 2, Math.PI / 2 + Math.PI * 2,  // aStartAngle, aEndAngle
        false,            // aClockwise
        0             // aRotation
    );

    // Array of Vector2 of points
    let points = curve.getPoints(60).map(v2 => new THREE.Vector3(v2.x, v2.y, 0));

    let finalPoints = [];
    finalPoints.push(...points);

    // Remove first point, it is redundant since it equals to last point
    points.shift();

    // Rotate all points around Y-axis
    let rotationAxis = new THREE.Vector3(0, 1, 0);

    for (let i = 1; i < meridians; ++i) {
        for (let point of points) {
            let p = point.clone().applyAxisAngle(rotationAxis, rotationStep * i);
            finalPoints.push(p);
        }
    }

    let material = new THREE.LineBasicMaterial({ color : BG_MERIDIANS_COLOR });
    let geometry = (new THREE.BufferGeometry()).setFromPoints(finalPoints);

    // Create the final object to add to the scene
    return new THREE.Line(geometry, material);
}

export class Scene {
    private scene: THREE.Scene;
    private radius: number;

    constructor(radius: number) {
        this.scene = new THREE.Scene();
        this.radius = radius;

        this.scene.add(createMeridians(radius, 16));
        this.scene.add(createParallels(radius, 6));
    }

    getScene() {
        return this.scene;
    }

    getRadius() {
        return this.radius;
    }

    onBeforeRender(cameraPosition: THREE.Vector3) {
        const distanceToScene = cameraPosition.distanceTo(SPHERE_CENTER);

        if (this.scene.fog === null) {
            this.scene.fog = new THREE.Fog(0xeeeeee, distanceToScene, distanceToScene + this.radius);
        } else {
            (this.scene.fog as THREE.Fog).near = distanceToScene;
            (this.scene.fog as THREE.Fog).far = distanceToScene + this.radius;
        }
    }
}
