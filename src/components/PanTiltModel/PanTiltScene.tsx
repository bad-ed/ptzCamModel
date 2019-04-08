import * as THREE from 'three';
import { Vector3, Matrix4, Float32BufferAttribute } from 'three';

// This json generated here http://gero3.github.io/facetype.js/
// Restricted character set: OABCDαβφ'
const fontData = require('../../../assets/Latin Modern Math_Regular.json');

const BG_MERIDIANS_COLOR = 0xdddddd;
const ANGLES_COLOR = 0x000000;
const SPHERE_CENTER = new THREE.Vector3(0,0,0);

const enum PointIndex {
    O = 0,
    C = 1,
    A = 2,
    D = 3,
    B = 4,
    AS = 5, // A on Sphere,
    DS = 6, // D on Sphere (D')
    BS = 7, // B on Sphere
}

function createPointCoords(radius: number, dx: number, dy: number) {
    const dyAngle = Math.atan2(dy, radius);
    const dxAngle = Math.atan2(dx, radius);
    const dxdyAngle = Math.atan2(dy, Math.sqrt(dx * dx + radius * radius));

    return [
        // x, y, z
        0, 0, 0,
        0, 0, radius,   // C
        dx, 0, radius,  // A
        dx, dy, radius, // D
        0, dy, radius,  // B

        // A projection on sphere
        radius * Math.sin(dxAngle), 0, radius * Math.cos(dxAngle),

        // D projection on sphere (D')
        radius * Math.sin(dxAngle) * Math.cos(dxdyAngle),
        radius * Math.sin(dxdyAngle), radius * Math.cos(dxAngle) * Math.cos(dxdyAngle),

        // B projection on sphere
        0, radius * Math.sin(dyAngle), radius * Math.cos(dyAngle)
    ];
}

const pointIndices = [
    // Red rectangle plane
    PointIndex.C, PointIndex.A,
    PointIndex.A, PointIndex.D,
    PointIndex.D, PointIndex.B,
    PointIndex.B, PointIndex.C,

    // External rays, from plane to sphere
    PointIndex.A, PointIndex.AS,
    PointIndex.B, PointIndex.BS,
    PointIndex.D, PointIndex.DS,

    // Internal rays from sphere center to sphere surface
    PointIndex.C, PointIndex.O,
    PointIndex.AS, PointIndex.O,
    PointIndex.DS, PointIndex.O,
    PointIndex.BS, PointIndex.O,
];

function createParallel(radius: number, theta: number) {
    const circleRadius = radius * Math.cos(theta);

    const curve = new THREE.EllipseCurve(
        0, 0,            // ax, aY
        circleRadius, circleRadius,   // xRadius, yRadius
        0, Math.PI * 2,  // aStartAngle, aEndAngle
        false,           // aClockwise
        0                // aRotation
    );

    const z = radius * Math.sin(theta);
    return curve.getPoints(60).map(v2 => new THREE.Vector3(v2.x, z, v2.y));
}

function createParallels(radius: number, additionalParallels = 0) {
    let result: THREE.Vector3[][] = [];
    result.push(createParallel(radius, 0));

    for (let i = 0; i < additionalParallels; ++i) {
        const theta = Math.asin((radius * (i + 1)) / (radius * (additionalParallels + 1)));

        result.push(createParallel(radius, theta));
        result.push(createParallel(radius, -theta));
    }

    return result;
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

    let finalPoints: THREE.Vector3[] = [];
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

    return finalPoints;
}

function createSphereGrid(radius: number, meridians = 1, additionalParallels = 0) {
    interface Group {
        startVertex: number;
        count: number;
    }

    let allPoints = createMeridians(radius, meridians);
    const parallelsPoints = createParallels(radius, additionalParallels);

    let groups: Group[] = [];

    groups.push({startVertex: 0, count: allPoints.length});
    let lastVertex = allPoints.length;

    for (let i = 0, len = parallelsPoints.length; i < len; ++i) {
        const count = parallelsPoints[i].length;
        allPoints = allPoints.concat(parallelsPoints[i]);

        groups.push({startVertex: lastVertex, count});
        lastVertex += count;
    }

    const materials = [
        new THREE.LineBasicMaterial({ color : BG_MERIDIANS_COLOR }),
        new THREE.LineBasicMaterial({ color : 0x999999 })
    ];
    const geometry = (new THREE.BufferGeometry()).setFromPoints(allPoints);

    // Meridians
    geometry.addGroup(groups[0].startVertex, groups[0].count, 0);
    // Parallel 0
    geometry.addGroup(groups[1].startVertex, groups[1].count, 1);

    // Other parallels
    for (let i = 0, len = groups.length; i < len; ++i) {
        geometry.addGroup(groups[i].startVertex, groups[i].count, 0);
    }

    // Create the final object to add to the scene
    return new THREE.Line(geometry, materials);
}

function translateToPlane(v0: THREE.Vector3, v1: THREE.Vector3) {
    // Assume that v0 is new x axis
    let newX = v0.clone().normalize();
    // Cross product of v0 and v1 gives new Z axis
    let newZ = v0.clone().cross(v1).normalize();
    // Cross product of newZ and newX gives newY
    let newY = newZ.clone().cross(newX).normalize();

    return new THREE.Matrix4().makeBasis(newX, newY, newZ);
}

function ellipticCurveBetweenVectors(radius: number, divisions: number, v0: THREE.Vector3, v1: THREE.Vector3) {
    let mat = translateToPlane(v0, v1);

    const angle = v0.angleTo(v1);

    let curve = new THREE.EllipseCurve(
        0,  0,            // ax, aY
        radius, radius,   // xRadius, yRadius
        0, angle,  // aStartAngle, aEndAngle
        false,            // aClockwise
        0             // aRotation
    );

    return curve.getPoints(divisions)
        .map(point => new THREE.Vector3(point.x, point.y, 0).applyMatrix4(mat));
}

interface Labels {
    labels: {
        [label: string]: {
            mesh: THREE.Mesh;
        }
    }
}

function createLabels() {
    let result: Labels = {
        labels: {}
    };

    const letters = ['O', 'C', 'A', 'D', 'B', 'D\'', 'α', 'β', 'β\''];

    const font = new THREE.Font(fontData);
    const material = new THREE.MeshBasicMaterial({color: 0x000000, fog: false});

    for (let letter of letters) {
        const geometry = new THREE.TextBufferGeometry(letter, {
            font: font,
            size: 1,
            height: 0
        });

        result.labels[letter] = {
            mesh: new THREE.Mesh(geometry, material)
        };
    }

    return result;
}

// Create labels meshes
function adjustLabels(labels: Labels, pointPositions: Float32BufferAttribute, radius: number) {
    interface PointInfo {
        text: string;
        position: THREE.Vector3;
        plane?: THREE.Matrix4;
    };

    const getPointPos = (index: number) =>
        new THREE.Vector3().fromBufferAttribute(pointPositions, index);

    const letterSize = 1;

    const bissecPlane = (v0: THREE.Vector3, v1: THREE.Vector3) => translateToPlane(v0.add(v1), v1);

    const letters: PointInfo[] = [
        { text: 'O', position: getPointPos(PointIndex.O) },
        { text: 'C', position: getPointPos(PointIndex.C) },
        { text: 'A', position: getPointPos(PointIndex.A) },
        { text: 'D', position: getPointPos(PointIndex.D) },
        { text: 'B', position: getPointPos(PointIndex.B) },
        { text: 'D\'', position: getPointPos(PointIndex.DS) },
        { text: 'α', position: new Vector3(radius / 4, -letterSize*2/5, 0),
            plane: bissecPlane(getPointPos(PointIndex.C), getPointPos(PointIndex.A)) },
        { text: 'β', position: new Vector3(radius / 4, -letterSize*2/5, 0),
            plane: bissecPlane(getPointPos(PointIndex.C), getPointPos(PointIndex.B)) },
        { text: 'β\'', position: new Vector3(radius / 4, -letterSize*2/5, 0),
            plane: bissecPlane(getPointPos(PointIndex.A), getPointPos(PointIndex.D)) }
    ];

    for (let letter of letters) {
        const mesh = labels.labels[letter.text].mesh;

        if (letter.plane) {
            mesh.matrix.identity();

            letter.position.applyMatrix4(letter.plane);
            mesh.applyMatrix(letter.plane);
        }

        mesh.position.copy(letter.position);
    }
}

function createPlane(radius: number, pointPositions: THREE.Float32BufferAttribute) {
    const geometry = new THREE.BufferGeometry();
    geometry.setIndex(pointIndices);
    geometry.addAttribute('position', pointPositions);

    let lineDistances = new Float32Array(pointPositions.count);
    for (let i = 0; i < pointPositions.count; ++i) lineDistances[i] = i == 0 ? 0 : radius;

    geometry.addAttribute('lineDistance', new THREE.BufferAttribute(lineDistances, 1));

    geometry.addGroup(0, 7 * 2, 0);
    geometry.addGroup(7 * 2, 4 * 2, 1);

    const materials = [
        new THREE.LineBasicMaterial({color : 0xff0000}),
        new THREE.LineDashedMaterial({color: 0x000000,
            linewidth: 1, scale: 2, dashSize: 1, gapSize: 0.5})
    ];

    return new THREE.LineSegments(geometry, materials);
}

function createAngleArcs(radius: number, pointPositions: THREE.Float32BufferAttribute) {
    const getPointPos = (index: number) =>
        new THREE.Vector3().fromBufferAttribute(pointPositions, index);

    const betaAngle = ellipticCurveBetweenVectors(radius / 3, 20,
        getPointPos(PointIndex.B), getPointPos(PointIndex.C));
    const alphaAngle = ellipticCurveBetweenVectors(radius / 3, 20,
        getPointPos(PointIndex.C), getPointPos(PointIndex.A));
    const betasAngle = ellipticCurveBetweenVectors(radius / 3, 20,
        getPointPos(PointIndex.A), getPointPos(PointIndex.D));

    const points = betaAngle.concat(alphaAngle).concat(betasAngle);

    let material = new THREE.LineBasicMaterial({ color : ANGLES_COLOR });
    let geometry = (new THREE.BufferGeometry()).setFromPoints(points);

    // Create the final object to add to the scene
    return new THREE.Line(geometry, material);
}

export class Scene {
    private scene: THREE.Scene;
    private radius: number;

    private pan: number;
    private tilt: number;

    private width: number;
    private height: number;

    private x: number;
    private y: number;

    private hFov: number;

    private pointPositions: THREE.Float32BufferAttribute;
    private labels: Labels;
    private plane: THREE.Object3D;
    private angles: THREE.Object3D;

    constructor(radius: number, width: number, height: number, hFov: number, pan: number, tilt: number, x: number, y: number) {
        this.scene = new THREE.Scene();
        this.radius = radius;

        this.width = width;
        this.height = height;
        this.hFov = hFov / 180 * Math.PI;
        this.pan = pan / 180 * Math.PI;
        this.tilt = tilt / 180 * Math.PI;
        this.x = x;
        this.y = y;

        const {dx, dy} = this.calcDxDy();
        this.pointPositions = new THREE.Float32BufferAttribute(createPointCoords(this.radius, dx, dy), 3);

        this.scene.add(createSphereGrid(radius, 18, 6));
        this.plane = this.createPlane();

        this.labels = createLabels();
        adjustLabels(this.labels, this.pointPositions, this.radius);

        Object.keys(this.labels.labels).forEach(label => {
            this.plane.add(this.labels.labels[label].mesh);
        });

        this.angles = createAngleArcs(this.radius, this.pointPositions);
        this.plane.add(this.angles);

        this.plane.rotateOnWorldAxis(new THREE.Vector3(1,0,0), this.tilt);
        this.plane.rotateOnWorldAxis(new THREE.Vector3(0,1,0), this.pan);

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

    updateSceneProps(hFov: number, width: number, height: number, x: number, y: number, pan: number, tilt: number) {
        hFov = hFov / 180 * Math.PI;
        pan = pan / 180 * Math.PI;
        tilt = tilt / 180 * Math.PI;

        let recreatePlane = false;
        let rotatePlane = false;

        if (this.hFov !== hFov ||
            this.width !== width ||
            this.height !== height ||
            this.x !== x ||
            this.y !== y)
        {
            this.hFov = hFov;
            this.width = width;
            this.height = height;
            this.x = x;
            this.y = y;

            recreatePlane = true;
            rotatePlane = true;
        }

        if (this.pan !== pan || this.tilt !== tilt) {
            this.pan = pan;
            this.tilt = tilt;

            rotatePlane = true;
        }

        if (recreatePlane === true) {
            const {dx, dy} = this.calcDxDy();
            const pointCoords = createPointCoords(this.radius, dx, dy);

            this.pointPositions.copyArray(pointCoords);
            this.pointPositions.needsUpdate = true;

            adjustLabels(this.labels, this.pointPositions, this.radius);

            this.plane.remove(this.angles);

            this.angles = createAngleArcs(this.radius, this.pointPositions);
            this.plane.add(this.angles);
        }

        if (rotatePlane === true) {
            this.plane.rotation.x = 0;
            this.plane.rotation.y = 0;
            this.plane.rotation.z = 0;

            this.plane.rotateOnWorldAxis(new THREE.Vector3(1,0,0), tilt);
            this.plane.rotateOnWorldAxis(new THREE.Vector3(0,1,0), pan);
        }
    }

    private calcDxDy() {
        const tanHfovHalf = Math.tan(this.hFov / 2);
        const tanAlpha = tanHfovHalf * (2 * this.x - this.width) / this.width;
        const tanBeta = tanHfovHalf * (2 * this.y - this.height) / this.width;

        const dx = this.radius * tanAlpha;
        const dy = this.radius * tanBeta;

        return {dx, dy};
    }

    private createPlane() {
        return createPlane(this.radius, this.pointPositions);
    }
}
