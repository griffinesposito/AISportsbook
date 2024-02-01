import { openLiveData, openTeamsData, openPlayersData } from './openTabs.js';
import { addCurrentEventsContent, toggleContent, formatHumanReadableDate } from './addCurrentEventsContent.js';


document.addEventListener('DOMContentLoaded', () => {
    document.querySelector('[data-action="openLiveDataNFL"]').addEventListener('click', () => openLiveData('NFL'));
    document.querySelector('[data-action="openTeamsDataNFL"]').addEventListener('click', () => openTeamsData('NFL'));
    document.querySelector('[data-action="openPlayersDataNFL"]').addEventListener('click', () => openPlayersData('NFL'));
    document.querySelector('[data-action="openLiveDataNBA"]').addEventListener('click', () => openLiveData('NBA'));
    document.querySelector('[data-action="openTeamsDataNBA"]').addEventListener('click', () => openTeamsData('NBA'));
    document.querySelector('[data-action="openPlayersDataNBA"]').addEventListener('click', () => openPlayersData('NBA'));
    document.querySelector('[data-action="openLiveDataMLB"]').addEventListener('click', () => openLiveData('MLB'));
    document.querySelector('[data-action="openTeamsDataMLB"]').addEventListener('click', () => openTeamsData('MLB'));
    document.querySelector('[data-action="openPlayersDataMLB"]').addEventListener('click', () => openPlayersData('MLB'));
});




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
import { OrbitControls } from '/static/jsm/controls/OrbitControls.js';

import TWEEN from '/static/jsm/libs/tween.module.js';
import { CSS3DRenderer, CSS3DObject } from '/static/jsm/renderers/CSS3DRenderer.js';

const gridRows = 3; // Number of rows in the grid
const gridColumns = 1; // Number of columns in the grid
const newWidth = window.innerWidth * 1.1;
const newHeight = window.innerHeight * 1.1;
// Recalculate cell sizes and grid positions
// This may depend on how you want to scale or adapt the grid
var cellWidth = newWidth / gridColumns;
var cellHeight = newHeight / gridRows;


const teamgridRows = 4; // Number of rows in the grid
const teamgridColumns = 8; // Number of columns in the grid
const teamnewWidth = window.innerWidth * 1.1;
const teamnewHeight = window.innerHeight * 1.1;
// Recalculate cell sizes and grid positions
// This may depend on how you want to scale or adapt the grid
var teamcellWidth = teamnewWidth / teamgridColumns;
var teamcellHeight = teamnewHeight / teamgridRows;

// ---------------------------------------------------------------------------------
// ------------------------ Constant definitions -----------------------------------
// ---------------------------------------------------------------------------------
const objects = [];
const targets = { liveDataTargets: [], teamCardTargets: []};
const particlesData = [];
const r = 800;
const rHalf = r / 2;
const effectController = {
    showDots: true,
    showLines: true,
    minDistance: 70,
    limitConnections: false,
    maxConnections: 30,
    particleCount: 1000
};
const originalCameraPosition = [0,0,500];

// ---------------------------------------------------------------------------------
// ------------------ Global scope variable definitions ----------------------------
// ---------------------------------------------------------------------------------
let group;
let container, stats;
let camera, scene, renderer, css3DRenderer;
let positions, colors;
let pointCloud;
let particlePositions;
let linesMesh;
let geometryB;
let materialP;
let textMaterial;
let textMesh;
let outlineMaterial;
let outlineMesh;
let cameraDirection;
let minXCoordinateOfMesh = -100;
let maxXCoordinateOfMesh = 1000;
let originalWindowWidth;
let textScalar = 35;
let translateAttribute;
let envMap;
let controls;
let font;
let maxParticleCount = 1000;
let particleCount = 1000;


// ---------------------------------------------------------------------------------
// ------------------------------- vertexShader ------------------------------------
// ---------------------------------------------------------------------------------
const vertexShader = `
varying float vWavePosition;
varying vec3 vNormal;
varying vec3 vPosition;

void main() {
    vNormal = normal;
    vPosition = position;
    vWavePosition = position.x; // 

    vec3 transformed = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed, 1.0);
}
`;

// ---------------------------------------------------------------------------------
// ------------------------------- fragmentShader ----------------------------------
// ---------------------------------------------------------------------------------
const fragmentShader = `
varying vec3 vNormal;
varying vec3 vPosition;
uniform vec3 viewDirection;
uniform float lightWaveProgress;
uniform float darkWaveProgress;
varying float vWavePosition; // Represents the x-coordinate of each vertex

void main() {
    float edgeFactor = dot(normalize(vNormal), viewDirection);
    float edgeIntensity = 1.0 - smoothstep(0.8, 1.0, edgeFactor);

    // Light wave effect
    float lightEffect = smoothstep(lightWaveProgress - 100.0, lightWaveProgress, vWavePosition);

    // Dark wave effect
    float darkEffect = smoothstep(darkWaveProgress - 100.0, darkWaveProgress, vWavePosition);

    // Combine light and dark effects
    float combinedEffect = 0.5*lightEffect + 0.5*(1.0 - darkEffect) + 0.5;

    vec3 glowColor = vec3(0.0, 1.0, 0.0); // Green color for the edges
    gl_FragColor = vec4(glowColor * edgeIntensity * combinedEffect, edgeIntensity * combinedEffect);
}
`;

// ---------------------------------------------------------------------------------
// ----------- Customize for mobile devices (performance reasons) ------------------
// ---------------------------------------------------------------------------------
if (isMobileDevice())
{
    textScalar = 70;
    maxParticleCount = 100;
    particleCount = 100;
    effectController.minDistance= 100;
    effectController.maxConnections=  40;
    effectController.particleCount=  100;
}


// ---------------------------------------------------------------------------------
// --------------------- HIDE BACKGROUND TEXT FUNCTION -----------------------------
// ---------------------------------------------------------------------------------
export function hideTextMesh() {
    new TWEEN.Tween({ opacity: 1 }) // Start with an object that has the opacity property
        .to({ opacity: 0 }, 1000) // Animate to transparent over 1000 milliseconds
        .onUpdate((obj) => {
            // Update the material opacity
            textMaterial.opacity = obj.opacity;
        })
        .start();
}

// ---------------------------------------------------------------------------------
// --------------------- SHOW BACKGROUND TEXT FUNCTION -----------------------------
// ---------------------------------------------------------------------------------
export function showText() {
    new TWEEN.Tween(textMaterial)
        .to({ opacity: 1 }, 1000) // Animate to transparent over 1000 milliseconds
        .onUpdate(() => {
            // Update the material opacity
            textMaterial.opacity = this.opacity;
        })
        .start();
}

// ---------------------------------------------------------------------------------
// --------------------- HIDE LOADER OUTLINE TEXT FUNCTION -----------------------------
// ---------------------------------------------------------------------------------
export function hideOutlineTextMesh() {
    new TWEEN.Tween({ opacity: 1 }) // Start with an object that has the opacity property
        .to({ opacity: 0 }, 500) // Animate to transparent over 1000 milliseconds
        .onUpdate((obj) => {
            // Update the material opacity
            outlineMaterial.opacity = obj.opacity;
        })
        .start();
}

// ---------------------------------------------------------------------------------
// --------------------- SHOW LOADER OUTLINE TEXT FUNCTION -----------------------------
// ---------------------------------------------------------------------------------
export function showOutlineText() {
    new TWEEN.Tween(textMaterial)
        .to({ opacity: 1 }, 500) // Animate to transparent over 1000 milliseconds
        .onUpdate(() => {
            // Update the material opacity
            outlineMaterial.opacity = this.opacity;
        })
        .start();
}


// ---------------------------------------------------------------------------------
// --------------------------- SHOW Loading Circle ---------------------------------
// ---------------------------------------------------------------------------------
function showLoader(parentElement) {
    if (!document.getElementById('loader-overlay')) {
        const overlay = document.createElement('div');
        overlay.className = 'loader-overlay';
        overlay.id = 'loader-overlay'; // Adding an ID for easy removal

        const loader = document.createElement('div');
        loader.className = 'loader';

        overlay.appendChild(loader);
        parentElement.appendChild(overlay);

        // Make sure newDiv is positioned relatively if it's not already
        if (getComputedStyle(parentElement).position === 'static') {
            parentElement.style.position = 'relative';
        }
    }
}
  

// ---------------------------------------------------------------------------------
// --------------------------- HIDE Loading Circle ---------------------------------
// ---------------------------------------------------------------------------------
function hideLoader() {
    const overlay = document.getElementById('loader-overlay');
    if (overlay) {
        overlay.remove();
    }
}


// ---------------------------------------------------------------------------------
// ---------- DISABLE INTERFERENCE FROM CONTROLS ON HOVER OVER ELEMENT -------------
// ---------------------------------------------------------------------------------
function disableControlsOnHover(element){
    element.addEventListener('mouseenter', () => {
        controls.enabled = false;
    });

    element.addEventListener('mouseleave', () => {
        controls.enabled = true;
    });
}


// ---------------------------------------------------------------------------------
// ---------- ANIMATE CAMERA BACK TO ORIGINAL POSITION -------------
// ---------------------------------------------------------------------------------
function animateCameraToOriginalPosition() {
    // Create a new TWEEN.Tween object for the camera's current position
    const tween = new TWEEN.Tween(camera.position)
        .to({ 
            x: originalCameraPosition[0], 
            y: originalCameraPosition[1], 
            z: originalCameraPosition[2]
        }, 2000) // 2000 milliseconds for the animation duration
        .easing(TWEEN.Easing.Quadratic.Out) // Easing function for smooth animation
        .start(); // Start the tween animation

    // Create a new TWEEN.Tween object for the camera's current position
    const tweenRotation = new TWEEN.Tween(camera.rotation)
        .to({ 
            x: 0, 
            y: 0, 
            z: 0
        }, 2000) // 2000 milliseconds for the animation duration
        .easing(TWEEN.Easing.Quadratic.Out) // Easing function for smooth animation
        .start(); // Start the tween animation

    // Create a new TWEEN.Tween object for the camera's current position
    const tweenControls = new TWEEN.Tween(controls.target)
        .to({ 
            x: 0, 
            y: 0, 
            z: 0
        }, 2000) // 2000 milliseconds for the animation duration
        .easing(TWEEN.Easing.Quadratic.Out) // Easing function for smooth animation
        .start(); // Start the tween animation
}

// ---------------------------------------------------------------------------------
// ------------------------ CALL INIT AND ANIMATE LOOPS ----------------------------
// ---------------------------------------------------------------------------------
init();
animate();



// ---------------------------------------------------------------------------------
// --------------------------- CALL INIT OF THE SCENE ------------------------------
// ---------------------------------------------------------------------------------
function init() {               
    container = document.getElementById( 'container' );

    // Initialize the camera
    camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 4000 );
    camera.position.x = originalCameraPosition[0];
    camera.position.y = originalCameraPosition[1];
    camera.position.z = originalCameraPosition[2];

    // Initialize the renderers
    scene = new THREE.Scene();
    renderer = new THREE.WebGLRenderer( { antialias: true  } ); //, alpha: true
    css3DRenderer = new CSS3DRenderer();
    //renderer.setClearColor(0x000000, 0); // The second parameter is the alpha value (0 = fully transparent)

    // Setup node material
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

    // Setup the environment lighting
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

    // Add node geometry to the scene
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

    // Add node line connector mesh geometry for the background
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

    cameraDirection = new THREE.Vector3();
    camera.getWorldDirection(cameraDirection);

    outlineMaterial = new THREE.ShaderMaterial({
        uniforms: {
            time: { value: 0 },
            viewDirection: { value: new THREE.Vector3() },
            lightWaveProgress: { value: -1.0 },
            darkWaveProgress: { value: 1.0 } // Start a bit later than light wave
        },
        vertexShader: vertexShader,
        fragmentShader: fragmentShader,
        side: THREE.BackSide,
        transparent: true
    });

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
        textMaterial = new THREE.MeshPhysicalMaterial({
            // Physical material properties
            color: 0x1111FF,
            metalness: 1.0,
            roughness: 0.005,
            clearcoat: 0.1,
            transparent: true,
            opacity: 1 // Start fully opaque
        }); 
        textMaterial.onBeforeCompile = function(shader) {
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
        textMesh = new THREE.Mesh(textGeometry, textMaterial);
        // Create outline text mesh
        outlineMesh = new THREE.Mesh(textGeometry.clone(), outlineMaterial);
        outlineMesh.scale.multiplyScalar(1.015); // Slightly larger to create an outline

        textGeometry.computeBoundingBox();
        const centerOffsetX = - 0.5 * (textGeometry.boundingBox.max.x - textGeometry.boundingBox.min.x);
        const centerOffsetY = - 0.5 * (textGeometry.boundingBox.max.y - textGeometry.boundingBox.min.y);
        outlineMesh.position.set(centerOffsetX*1.015, centerOffsetY*1.015, -1); // Slightly behind the original text

        

        textMesh.position.x = centerOffsetX;
        textMesh.position.y = centerOffsetY;
        scene.add(textMesh);
        scene.add(outlineMesh);
    });

    // Live, Upcoming, Recent events target pos
    for (let i = 0; i < gridRows; i++) {
        for (let j = 0; j < gridColumns; j++) {
            // ... setup your target ...
            const object = new THREE.Object3D();
    
            // Calculate position
            object.position.x = (j - gridColumns / 2) * cellWidth + cellWidth / 2;
            object.position.y = (i - gridRows / 2) * cellHeight + cellHeight / 2;
            object.position.z = -950;
    
            targets.liveDataTargets.push( object );
        }
    }


    // Team and player card target positions
    for (let i = 0; i < teamgridRows; i++) {
        for (let j = 0; j < teamgridColumns; j++) {
            // ... setup your target ...
            const object = new THREE.Object3D();
    
            // Calculate position
            object.position.x = (j - teamgridColumns / 2) * teamcellWidth + teamcellWidth / 2;
            object.position.y = (i - teamgridRows / 2) * teamcellHeight + teamcellHeight / 2;
            object.position.z = -950;
    
            targets.teamCardTargets.push( object );
        }
    }

    // Set outlineMaterialprogress
    outlineMaterial.uniforms.lightWaveProgress.value = 500;
    outlineMaterial.uniforms.darkWaveProgress.value  = 300;
    hideOutlineTextMesh();

    // Set renderer attributes
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    css3DRenderer.setSize(window.innerWidth, window.innerHeight);
    css3DRenderer.domElement.style.position = 'absolute';
    css3DRenderer.domElement.style.top = 0;

    // Add camera controls
    controls = new OrbitControls(camera, css3DRenderer.domElement);
    // Disable rotation
    controls.enableRotate = false;
    // Disable panning
    controls.enablePan = true;
    // Enable zoom
    controls.enableZoom = true;

    // Append Renderers to the main container
    container.appendChild( renderer.domElement );
    container.appendChild( css3DRenderer.domElement );

    // Add resize event listener to dynamically resize elements
    window.addEventListener( 'resize', onWindowResize );

}


// ---------------------------------------------------------------------------------
// --------------------------- WINDOW RESIZE CALLBACK ------------------------------
// ---------------------------------------------------------------------------------
function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    // Recalculate cell sizes and grid positions
    // This may depend on how you want to scale or adapt the grid
    cellWidth = window.innerWidth * 1.1 / gridColumns;
    cellHeight = window.innerHeight * 1.1 / gridRows;

    // Update positions of all CSS3D objects
    objects.forEach((objectCSS, index) => {
        const row = Math.floor(index / gridColumns);
        const col = index % gridColumns;

        const posX = (col - gridColumns / 2) * cellWidth + cellWidth / 2;
        const posY = (row - gridRows / 2) * cellHeight + cellHeight / 2;
        objectCSS.position.set(posX, posY, -950);
    });

    // Optional: Adjust text mesh
    // Calculate the scale factor
    const scaleFactor = window.innerWidth / originalWindowWidth;
    textMesh.scale.set(scaleFactor, scaleFactor, scaleFactor);
    outlineMesh.scale.set(scaleFactor*1.015, scaleFactor*1.015, scaleFactor*1.015); // Slightly larger to create an outline
    // Recompute the bounding box and adjust the position
    textMesh.geometry.computeBoundingBox();
    const boundingBox = textMesh.geometry.boundingBox;
    const centerOffsetX = -0.5 * (boundingBox.max.x - boundingBox.min.x) * scaleFactor;
    const centerOffsetY = -0.5 * (boundingBox.max.y - boundingBox.min.y) * scaleFactor;
    outlineMesh.position.set(centerOffsetX*1.015, centerOffsetY*1.015, -1); // Slightly behind the original text
    textMesh.position.x = centerOffsetX;
    textMesh.position.y = centerOffsetY;
    // Apply the scale factor to the text mesh
    renderer.setSize( window.innerWidth, window.innerHeight );
    css3DRenderer.setSize( window.innerWidth, window.innerHeight );

}


// ---------------------------------------------------------------------------------
// -------------------------- ANIMATION LOOP FUNCTION ------------------------------
// ---------------------------------------------------------------------------------
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

    // Increment the light wave progress
    outlineMaterial.uniforms.lightWaveProgress.value += 5;

    // Ensure the dark wave follows the light wave at a set distance
    const waveSeparation = 200; // Distance between light and dark waves
    outlineMaterial.uniforms.darkWaveProgress.value = outlineMaterial.uniforms.lightWaveProgress.value - waveSeparation;

    // Reset the wave progress if necessary
    if (outlineMaterial.uniforms.lightWaveProgress.value > maxXCoordinateOfMesh) {
        outlineMaterial.uniforms.lightWaveProgress.value = minXCoordinateOfMesh;
        outlineMaterial.uniforms.darkWaveProgress.value = minXCoordinateOfMesh - waveSeparation;
    }
    // Update the camera direction
    camera.getWorldDirection(cameraDirection);
    outlineMaterial.uniforms.viewDirection.value = cameraDirection;
    outlineMaterial.uniforms.time.value += 0.05; // Update time for animation

    // Mark the attribute as needing an update
    translateAttribute.needsUpdate = true;

    requestAnimationFrame( animate );

    TWEEN.update();

    render();

}


// ---------------------------------------------------------------------------------
// ------------------------------ RENDER FUNCTION ----------------------------------
// ---------------------------------------------------------------------------------
function render() {

    const time = Date.now() * 0.001;
    group.rotation.y = time * 0.01;
    renderer.render( scene, camera );
    css3DRenderer.render(scene, camera);

}


// ---------------------------------------------------------------------------------
// ------------------- REMOVE ALL CSS3DObjects IN objects ARRAY --------------------
// ---------------------------------------------------------------------------------
export function removeCSSElements() {
    while (objects.length > 0) {
        const objectCSS = objects.pop(); // Remove the last element from the array
        scene.remove(objectCSS); // Remove it from the Three.js scene

        if (objectCSS.element && objectCSS.element.parentElement) {
            objectCSS.element.parentElement.removeChild(objectCSS.element); // Remove the DOM element
        }
    }
}

// ---------------------------------------------------------------------------------
// ------------------- ADD CSS3DObjects FROM fetchLeagueEvents ---------------------
// ---------------------------------------------------------------------------------
export function addCSSElements(data) {
    // table
    removeCSSElements();

    const liveContainer = document.createElement( 'div' );
    liveContainer.style.display = 'flex';
    liveContainer.style.flexDirection = 'column'; // Change to column for vertical layout
    const liveHeader = document.createElement('div');
    liveHeader.textContent = 'Live Events'; // Set the header text
    liveHeader.className = 'live-events-header'; // Apply the CSS class
    liveContainer.appendChild(liveHeader);
    const liveHorizontalContainer = document.createElement('div');
    liveHorizontalContainer.className = 'live-events-flex';
    liveHorizontalContainer.setAttribute('data-event-type', "live");
    disableControlsOnHover(liveHorizontalContainer);
    liveContainer.appendChild(liveHorizontalContainer);
    const liveObjectCSS = new CSS3DObject( liveContainer );
    liveObjectCSS.position.x = targets.liveDataTargets[2].position.x + 2000;
    liveObjectCSS.position.y = targets.liveDataTargets[2].position.y;
    liveObjectCSS.rotation.x = 2*3.14159;
    liveObjectCSS.position.z = targets.liveDataTargets[2].position.z;
    scene.add( liveObjectCSS );

    const upcomingContainer = document.createElement( 'div' );
    upcomingContainer.style.display = 'flex';
    upcomingContainer.style.flexDirection = 'column'; // Change to column for vertical layout
    const upcomingHeader = document.createElement('div');
    upcomingHeader.textContent = 'Upcoming Events'; // Set the header text
    upcomingHeader.className = 'live-events-header'; // Apply the CSS class
    upcomingContainer.appendChild(upcomingHeader);
    const upcomingHorizontalContainer = document.createElement('div');
    upcomingHorizontalContainer.className = 'live-events-flex';
    upcomingHorizontalContainer.setAttribute('data-event-type', "upcoming");
    disableControlsOnHover(upcomingHorizontalContainer);
    upcomingContainer.appendChild(upcomingHorizontalContainer);
    const upcomingObjectCSS = new CSS3DObject( upcomingContainer );
    upcomingObjectCSS.position.x = targets.liveDataTargets[1].position.x - 2000;
    upcomingObjectCSS.position.y = targets.liveDataTargets[1].position.y;
    upcomingObjectCSS.rotation.x = 2*3.14159;
    upcomingObjectCSS.position.z = targets.liveDataTargets[1].position.z;
    scene.add( upcomingObjectCSS );

    const recentContainer = document.createElement( 'div' );
    recentContainer.style.display = 'flex';
    recentContainer.style.flexDirection = 'column'; // Change to column for vertical layout
    const recentHeader = document.createElement('div');
    recentHeader.textContent = 'Recent Events'; // Set the header text
    recentHeader.className = 'live-events-header'; // Apply the CSS class
    recentContainer.appendChild(recentHeader);
    const recentHorizontalContainer = document.createElement('div');
    recentHorizontalContainer.className = 'live-events-flex';
    recentHorizontalContainer.setAttribute('data-event-type', "recent");
    disableControlsOnHover(recentHorizontalContainer);
    recentContainer.appendChild(recentHorizontalContainer);
    const recentObjectCSS = new CSS3DObject( recentContainer );
    recentObjectCSS.position.x = targets.liveDataTargets[0].position.x + 2000;
    recentObjectCSS.position.y = targets.liveDataTargets[0].position.y;
    recentObjectCSS.rotation.x = -2*3.14159;
    recentObjectCSS.position.z = targets.liveDataTargets[0].position.z;
    scene.add( recentObjectCSS );


    objects.push( recentObjectCSS );
    objects.push( upcomingObjectCSS );
    objects.push( liveObjectCSS );

    let dateArray = [];
    let dateArrayReverse = [];
    // Loop through the elements and add new divs
    for (const key in data.events) {
        if (data.events.hasOwnProperty(key)) {
            const item = data.events[key];
            const newDiv = document.createElement('div');
            newDiv.setAttribute('data-date', item.date);
            newDiv.setAttribute('data-event', key);
            dateArray.push(item.date);
            dateArrayReverse.push(item.date);
            newDiv.className = 'interactive-div'; // Set the class
            // Add click event listener to newDiv
            newDiv.addEventListener('click', function() {
                // Show loader inside newDiv or another element
                showLoader(newDiv);
            
                // Example: Hide loader after 3 seconds (replace this with your actual logic)
                setTimeout(hideLoader, 3000);
            });
            addCurrentEventsContent(item,key,newDiv);
            if (item.status.type.id === '1') // scheduled, upcoming
            {
                upcomingHorizontalContainer.appendChild(newDiv); // Append the new div to the container
            }
            else if (item.status.type.id === '3') //final, over
            {
                recentHorizontalContainer.appendChild(newDiv); // Append the new div to the container
            }
            else
            {
                
                liveHorizontalContainer.appendChild(newDiv); // Append the new div to the container
            }
        }
    }
    dateArray.sort((a, b) => new Date(b) - new Date(a));
    dateArrayReverse.sort((a, b) => new Date(a) - new Date(b));
    // Sort the divs based on the sorted date strings
    dateArray.forEach(date => {
        // Find the div that has the matching data-date attribute
        let livedivs = Array.from(liveHorizontalContainer.children).filter(div => div.getAttribute('data-date') === date);
        livedivs.forEach(div => {
            // Append the div to the container
            liveHorizontalContainer.appendChild(div);
        });
        let recentdivs = Array.from(recentHorizontalContainer.children).filter(div => div.getAttribute('data-date') === date);
        recentdivs.forEach(div => {
            // Append the div to the container
            recentHorizontalContainer.appendChild(div);
        });
    });
    // Sort the divs based on the sorted date strings
    dateArrayReverse.forEach(date => {
        // Find the div that has the matching data-date attribute
        let upcomingdivs = Array.from(upcomingHorizontalContainer.children).filter(div => div.getAttribute('data-date') === date);
        upcomingdivs.forEach(div => {
            // Append the div to the container
            upcomingHorizontalContainer.appendChild(div);
        });
    });

    transform( targets.liveDataTargets, 2000 );
    hideTextMesh();
    animateCameraToOriginalPosition();

}



// ---------------------------------------------------------------------------------
// ----------- TRANSFORM THE OBJECTS TO THE TARGET POSITIONS IN THE SCENE ----------
// ---------------------------------------------------------------------------------
function transform( targets, duration ) {

    TWEEN.removeAll();

    for ( let i = 0; i < objects.length; i ++ ) {

        const object = objects[ i ];
        const target = targets[ i ];
        var randDuration = Math.random();
        new TWEEN.Tween( object.position )
            .to( { x: target.position.x, y: target.position.y, z: target.position.z }, randDuration * duration + duration )
            .easing( TWEEN.Easing.Exponential.InOut )
            .start();

        new TWEEN.Tween( object.rotation )
            .to( { x: target.rotation.x, y: target.rotation.y, z: target.rotation.z }, randDuration * duration + duration )
            .easing( TWEEN.Easing.Exponential.InOut )
            .start();

    }

    new TWEEN.Tween( this )
        .to( {}, duration * 2 )
        .onUpdate( render )
        .start();

}


// ---------------------------------------------------------------------------------
// ------------------- ADD CSS3DObjects FROM fetchTeams ---------------------
// ---------------------------------------------------------------------------------
export function addTeamCards(data) {
    // table
    removeCSSElements();

    for (let i = 0; i < data.length; i ++ ) {
        var teamData = data[i];
        var teamid = teamData.teamid;
        var href   = teamData.href;
        var teamname = teamData.teamname;

        const newDiv = document.createElement( 'div' );
        newDiv.setAttribute('data-team', teamData.teamid);
        newDiv.className = 'team-card';

        const teamName = document.createElement( 'div' );
        teamName.className = 'team-name';
        teamName.textContent = teamname;
        newDiv.appendChild( teamName );

        const teamLogo = document.createElement('img'); // Change this to 'img' element
        teamLogo.className = 'team-logo';
        teamLogo.src = href; // 
        newDiv.appendChild(teamLogo);



        disableControlsOnHover(newDiv);
        const teamCardObjectCSS = new CSS3DObject( newDiv );
        teamCardObjectCSS.position.x = Math.random() * 4000 - 2000;
        teamCardObjectCSS.position.y = Math.random() * 4000 - 2000;
        teamCardObjectCSS.rotation.y = -2*3.14159;
        teamCardObjectCSS.position.z = Math.random() * 4000 - 2000;

        newDiv.addEventListener('click', function() {
            // Show loader inside newDiv or another element
            showLoader(newDiv);
        
            // Example: Hide loader after 3 seconds (replace this with your actual logic)
            setTimeout(hideLoader, 3000);
        });

        // Assume 'teamCardObjectCSS' is your CSS3DObject and 'newDiv' is the associated DOM element
        newDiv.onmouseover = function() {
            // Move the object forward on hover
            new TWEEN.Tween(teamCardObjectCSS.position)
                .to({ z: -850 }, 500) // Move closer to the camera
                .easing(TWEEN.Easing.Quadratic.Out) // Easing function for smooth animation
                .onUpdate(() => {
                    // You might need to manually re-render the scene in the update function
                    // renderer.render(scene, camera);
                })
                .start(); // Start the tween animation
        };

        newDiv.onmouseout = function() {
            // Move the object back to its original position when the mouse leaves
            new TWEEN.Tween(teamCardObjectCSS.position)
                .to({ z: -950 }, 500) // Move away from the camera
                .easing(TWEEN.Easing.Quadratic.Out) // Easing function for smooth animation
                .onUpdate(() => {
                    // You might need to manually re-render the scene in the update function
                    // renderer.render(scene, camera);
                })
                .start(); // Start the tween animation
        };

        scene.add( teamCardObjectCSS );


        objects.push( teamCardObjectCSS );
    }
    transform( targets.teamCardTargets , 2000 );
    hideTextMesh();
    hideOutlineTextMesh();
    animateCameraToOriginalPosition();
}

