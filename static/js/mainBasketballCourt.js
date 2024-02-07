import * as THREE from 'three';
import { GLTFLoader } from '/static/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from '/static/jsm/controls/OrbitControls.js';

// Scene, camera, and renderer setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Lighting
const light = new THREE.HemisphereLight(0xffffff, 0x444444);
light.position.set(1, 3, 1);
scene.add(light);

// Orbit controls to navigate the scene
const controls = new OrbitControls(camera, renderer.domElement);

// Instantiate a loader
const loader = new GLTFLoader();

// Load a GLTF resource
loader.load(
    // resource URL
    '/static/models/004_Backetball_court_.glb',
    // called when the resource is loaded
    function (gltf) {
        scene.add(gltf.scene);
        
        // You might want to do any adjustments or animations here

        // Update the camera position if needed
        camera.position.z = 5;
        controls.update();
    },
    // called while loading is progressing
    function (xhr) {
        console.log((xhr.loaded / xhr.total * 100) + '% loaded');
    },
    // called when loading has errors
    function (error) {
        console.error('An error happened', error);
    }
);

// Animation loop
const animate = function () {
    requestAnimationFrame(animate);
    controls.update(); // only required if controls.enableDamping = true, or if controls.autoRotate = true
    renderer.render(scene, camera);
};

animate();