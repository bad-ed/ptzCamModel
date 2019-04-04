import * as THREE from 'three';

const BG_MERIDIANS_COLOR = 0xdddddd;

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
    }

    getScene() {
        return this.scene;
    }

    getRadius() {
        return this.radius;
    }
}
