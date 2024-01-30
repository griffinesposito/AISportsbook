

function isMobileDevice() {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;

    // Check for iOS and Android platforms
    if (/android/i.test(userAgent)) {
        return true; // Android-based device
    }

    if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
        return true; // iOS-based device
    }

    return false; // Not a mobile device
}

// Your existing Three.js code
import * as THREE from 'three';

import { RGBELoader } from '/static/jsm/loaders/RGBELoader.js';
import { PMREMGenerator } from '/static/src/extras/PMREMGenerator.js';
import { TTFLoader } from '/static/jsm/loaders/TTFLoader.js';
import { Font } from '/static/jsm/loaders/FontLoader.js';
import { TextGeometry } from '/static/jsm/geometries/TextGeometry.js';

import TWEEN from '/static/jsm/libs/tween.module.js';
import { CSS3DRenderer, CSS3DObject } from '/static/jsm/renderers/CSS3DRenderer.js';


let group;
let container, stats;
const particlesData = [];
let camera, scene, renderer, css3DRenderer;
let positions, colors;
let pointCloud;
let particlePositions;
let linesMesh;
let geometryB;
let materialP;
let textMesh;
let originalWindowWidth;
let textScalar = 35;
let translateAttribute;
let envMap;
const r = 800;
let font;
const rHalf = r / 2;
let maxParticleCount = 1000;
let particleCount = 1000;
const effectController = {
    showDots: true,
    showLines: true,
    minDistance: 70,
    limitConnections: false,
    maxConnections: 30,
    particleCount: 1000
};
if (isMobileDevice())
{
    textScalar = 70;
    maxParticleCount = 100;
    particleCount = 100;
    effectController.minDistance= 100;
    effectController.maxConnections=  40;
    effectController.particleCount=  100;
}

init();
animate();

function init() {               
    container = document.getElementById( 'container' );

    camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 4000 );
    camera.position.z = 500;

    scene = new THREE.Scene();
    renderer = new THREE.WebGLRenderer( { antialias: true  } ); //, alpha: true
    css3DRenderer = new THREE.CSS3DRenderer();
    //renderer.setClearColor(0x000000, 0); // The second parameter is the alpha value (0 = fully transparent)


    materialP = new THREE.MeshPhysicalMaterial({
        // Physical material properties
        color: 0x1111FF,
        metalness: 1.0,
        roughness: 0.005,
        clearcoat: 0.1
    }); 
    materialP.onBeforeCompile = function(shader) {
        // Add the custom attribute for translation
        shader.vertexShader = 'attribute vec3 translate;\n' + shader.vertexShader;

        // Replace the `#include <begin_vertex>` section with custom position translation
        shader.vertexShader = shader.vertexShader.replace(
            '#include <begin_vertex>',
            [
                'vec3 transformed = vec3(position);', // Original begin_vertex logic
                'transformed += translate;'           // Add the translation
            ].join('\n')
        );
    };

    const rgbeLoader = new RGBELoader();
    rgbeLoader.load('/static/textures/rural_landscape_1k.hdr', function (texture) {
        texture.mapping = THREE.EquirectangularReflectionMapping;
        //scene.environment = texture; // Apply it as the environment of the scene
        const pmremGenerator = new PMREMGenerator(renderer);
        pmremGenerator.compileEquirectangularShader();

        envMap = pmremGenerator.fromEquirectangular(texture).texture;

        scene.environment = envMap; // Apply the processed environment map to the scene
        materialP.envMap  = envMap;
    });



    group = new THREE.Group();
    scene.add( group );

    const circleGeometry = new THREE.SphereGeometry(1, 32, 32); // Parameters: radius, widthSegments, heightSegments
    geometryB = new THREE.InstancedBufferGeometry().copy(circleGeometry);

    const segments = maxParticleCount * maxParticleCount;

    positions = new Float32Array( segments * 3 );
    colors = new Float32Array( segments * 3 );

    particlePositions = new Float32Array( maxParticleCount * 3 );

    for ( let i = 0; i < maxParticleCount; i ++ ) {

        const x = Math.random() * r - r / 2;
        const y = Math.random() * r - r / 2;
        const z = Math.random() * r - r / 2;

        particlePositions[ i * 3 ] = x;
        particlePositions[ i * 3 + 1 ] = y;
        particlePositions[ i * 3 + 2 ] = z;

        // add it to the geometry
        particlesData.push( {
            velocity: new THREE.Vector3( - 0.1 + Math.random() * 0.2, - 0.1 + Math.random() * 0.2, - 0.1 + Math.random() * 0.2 ),
            numConnections: 0
        } );

    }
    translateAttribute = new THREE.InstancedBufferAttribute(particlePositions, 3);
    geometryB.setAttribute('translate', translateAttribute);

    
    pointCloud = new THREE.InstancedMesh( geometryB, materialP, maxParticleCount );
    group.add( pointCloud );

    const geometry = new THREE.BufferGeometry();

    geometry.setAttribute( 'position', new THREE.BufferAttribute( positions, 3 ).setUsage( THREE.DynamicDrawUsage ) );
    geometry.setAttribute( 'color', new THREE.BufferAttribute( colors, 3 ).setUsage( THREE.DynamicDrawUsage ) );

    geometry.computeBoundingSphere();

    geometry.setDrawRange( 0, 0 );

    const material = new THREE.LineBasicMaterial( {
        vertexColors: true,
        blending: THREE.AdditiveBlending,
        transparent: true
    } );

    linesMesh = new THREE.LineSegments( geometry, material );
    group.add( linesMesh );

    //
    originalWindowWidth = window.innerWidth;
    const loader = new TTFLoader();
    loader.load('/static/images/AquireBold.ttf', function (json) {
        font = new Font(json);
        const textGeometry = new TextGeometry('AI SPORTSBOOK', {
            font: font,
            size: originalWindowWidth / textScalar,
            height: 10,
            curveSegments: 12,
            // ... other parameters ...
        });
        const textMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        textMesh = new THREE.Mesh(textGeometry, materialP);

        textGeometry.computeBoundingBox();
        const centerOffsetX = - 0.5 * (textGeometry.boundingBox.max.x - textGeometry.boundingBox.min.x);
        const centerOffsetY = - 0.5 * (textGeometry.boundingBox.max.y - textGeometry.boundingBox.min.y);

        textMesh.position.x = centerOffsetX;
        textMesh.position.y = centerOffsetY;
        scene.add(textMesh);
        // Use the font...
    });


    

    //
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    css3DRenderer.setSize(window.innerWidth, window.innerHeight);
    css3DRenderer.domElement.style.position = 'absolute';
    css3DRenderer.domElement.style.top = 0;

    container.appendChild( renderer.domElement );
    container.appendChild( css3DRenderer.domElement );

    //
    window.addEventListener( 'resize', onWindowResize );

}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    // Optional: Adjust text mesh
    // Calculate the scale factor
    const scaleFactor = window.innerWidth / originalWindowWidth;
    textMesh.scale.set(scaleFactor, scaleFactor, scaleFactor);
    // Recompute the bounding box and adjust the position
    textMesh.geometry.computeBoundingBox();
    const boundingBox = textMesh.geometry.boundingBox;
    const centerOffsetX = -0.5 * (boundingBox.max.x - boundingBox.min.x) * scaleFactor;
    const centerOffsetY = -0.5 * (boundingBox.max.y - boundingBox.min.y) * scaleFactor;
    textMesh.position.x = centerOffsetX;
    textMesh.position.y = centerOffsetY;
    // Apply the scale factor to the text mesh
    renderer.setSize( window.innerWidth, window.innerHeight );

}

function animate() {

    let vertexpos = 0;
    let colorpos = 0;
    let numConnected = 0;

    for ( let i = 0; i < particleCount; i ++ )
        particlesData[ i ].numConnections = 0;

    for ( let i = 0; i < particleCount; i ++ ) {

        // get the particle
        const particleData = particlesData[ i ];

        particlePositions[ i * 3 ] += particleData.velocity.x;
        particlePositions[ i * 3 + 1 ] += particleData.velocity.y;
        particlePositions[ i * 3 + 2 ] += particleData.velocity.z;

        if ( particlePositions[ i * 3 + 1 ] < - rHalf || particlePositions[ i * 3 + 1 ] > rHalf )
            particleData.velocity.y = - particleData.velocity.y;

        if ( particlePositions[ i * 3 ] < - rHalf || particlePositions[ i * 3 ] > rHalf )
            particleData.velocity.x = - particleData.velocity.x;

        if ( particlePositions[ i * 3 + 2 ] < - rHalf || particlePositions[ i * 3 + 2 ] > rHalf )
            particleData.velocity.z = - particleData.velocity.z;

        if ( effectController.limitConnections && particleData.numConnections >= effectController.maxConnections )
            continue;

        // Check collision
        for ( let j = i + 1; j < particleCount; j ++ ) {

            const particleDataB = particlesData[ j ];
            if ( effectController.limitConnections && particleDataB.numConnections >= effectController.maxConnections )
                continue;

            const dx = particlePositions[ i * 3 ] - particlePositions[ j * 3 ];
            const dy = particlePositions[ i * 3 + 1 ] - particlePositions[ j * 3 + 1 ];
            const dz = particlePositions[ i * 3 + 2 ] - particlePositions[ j * 3 + 2 ];
            const dist = Math.sqrt( dx * dx + dy * dy + dz * dz );

            if ( dist < effectController.minDistance ) {

                particleData.numConnections ++;
                particleDataB.numConnections ++;

                const alpha = 1.0 - dist / effectController.minDistance;

                positions[ vertexpos ++ ] = particlePositions[ i * 3 ];
                positions[ vertexpos ++ ] = particlePositions[ i * 3 + 1 ];
                positions[ vertexpos ++ ] = particlePositions[ i * 3 + 2 ];

                positions[ vertexpos ++ ] = particlePositions[ j * 3 ];
                positions[ vertexpos ++ ] = particlePositions[ j * 3 + 1 ];
                positions[ vertexpos ++ ] = particlePositions[ j * 3 + 2 ];

                colors[ colorpos ++ ] = alpha;
                colors[ colorpos ++ ] = alpha;
                colors[ colorpos ++ ] = alpha;

                colors[ colorpos ++ ] = alpha;
                colors[ colorpos ++ ] = alpha;
                colors[ colorpos ++ ] = alpha;

                numConnected ++;

            }

        }

    }


    linesMesh.geometry.setDrawRange( 0, numConnected * 2 );
    linesMesh.geometry.attributes.position.needsUpdate = true;
    linesMesh.geometry.attributes.color.needsUpdate = true;

    // Mark the attribute as needing an update
    translateAttribute.needsUpdate = true;

    requestAnimationFrame( animate );

    render();

}

function render() {

    const time = Date.now() * 0.001;
    group.rotation.y = time * 0.01;
    renderer.render( scene, camera );
    css3DRenderer.render(scene, camera);

}
// ...
// Make sure it appends the canvas to the '#container' div
//container.appendChild(renderer.domElement);
// ...