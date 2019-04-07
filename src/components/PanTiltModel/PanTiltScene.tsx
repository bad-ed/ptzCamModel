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

function createPlane(radius: number, dx: number, dy: number) {
    // Plane
    const points = [
        new THREE.Vector3(0, 0, radius), // Center point
        new THREE.Vector3(dx, 0, radius),
        new THREE.Vector3(dx, dy, radius),
        new THREE.Vector3(0, dy, radius)
    ];

    var material = new THREE.LineBasicMaterial( { color : 0xff0000 } );
    var geometry = (new THREE.BufferGeometry()).setFromPoints(points);

    const plane = new THREE.LineLoop( geometry, material );

    // Rays from center (internal)
    const dyAngle = Math.atan2(dy, radius);
    const dxAngle = Math.atan2(dx, radius);
    const dxdyAngle = Math.atan2(dy, Math.sqrt(dx * dx + radius * radius));

    const internalRaysPoints = [
        // Ray from sphere center to the "center point" of plane
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, 0, radius),
        // Ray from sphere center to the (dx, 0) point (on sphere)
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(radius * Math.sin(dxAngle), 0, radius * Math.cos(dxAngle)),
        // Ray from sphere center to the (dx, dy) point (on sphere)
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(radius * Math.sin(dxAngle) * Math.cos(dxdyAngle),
            radius * Math.sin(dxdyAngle),
            radius * Math.cos(dxAngle) * Math.cos(dxdyAngle)),
        // Ray from sphere center to the (0, dy) point (on sphere)
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, radius * Math.sin(dyAngle), radius * Math.cos(dyAngle))
    ];

    const internalRaysMaterial = new THREE.LineDashedMaterial({color: 0x000000, linewidth: 1, scale: 2, dashSize: 1, gapSize: 0.5});
    geometry = (new THREE.BufferGeometry()).setFromPoints(internalRaysPoints);

    const internalRays = new THREE.LineSegments(geometry, internalRaysMaterial);
    internalRays.computeLineDistances();

    // Externals rays: from sphere surface to plane
    const externalRaysPoints = Array.prototype.concat(...(
        [1,2,3].map(pointIndex => [
            internalRaysPoints[pointIndex * 2 + 1].clone(),
            points[pointIndex].clone()
        ])
    ));

    geometry = (new THREE.BufferGeometry()).setFromPoints(externalRaysPoints);
    const externalRays = new THREE.LineSegments(geometry, material);

    ////////////////////////////////////////////////

    let result = new THREE.Group();
    result.add(plane, internalRays, externalRays);

    return result;
}

export class Scene {
    private scene: THREE.Scene;
    private radius: number;

    private pan = 0;
    private tilt = 0;

    private width: number;
    private height: number;

    private x: number;
    private y: number;

    private hFov: number;

    private plane: THREE.Object3D = null;

    constructor(radius: number, width: number, height: number, hFov: number, x: number, y: number) {
        this.scene = new THREE.Scene();
        this.radius = radius;

        this.width = width;
        this.height = height;
        this.hFov = hFov / 180 * Math.PI;
        this.x = x;
        this.y = y;

        this.scene.add(createMeridians(radius, 18));
        this.scene.add(createParallels(radius, 6));

        this.plane = this.createPlane();
        this.scene.add(this.plane);
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
            this.scene.fog = new THREE.Fog(0xf0f0f0, distanceToScene - this.radius, distanceToScene + this.radius);
        } else {
            (this.scene.fog as THREE.Fog).near = distanceToScene - this.radius;
            (this.scene.fog as THREE.Fog).far = distanceToScene + this.radius;
        }
    }

    updatePanTilt(pan: number, tilt: number) {

    }

    updateHFov(hFov: number) {
        this.hFov = hFov / 180 * Math.PI;

        if (this.plane !== null) {
            this.scene.remove(this.plane);
            this.plane = null;
        }

        this.plane = this.createPlane();
        this.scene.add(this.plane);
    }

    private createPlane() {
        const tanHfovHalf = Math.tan(this.hFov / 2);
        const tanAlpha = tanHfovHalf * (2 * this.x - this.width) / this.width;
        const tanBeta = tanHfovHalf * (2 * this.y - this.height) / this.width;

        const dx = this.radius * tanAlpha;
        const dy = this.radius * tanBeta;

        return createPlane(this.radius, dx, dy);
    }
}
