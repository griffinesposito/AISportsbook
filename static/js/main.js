import { openLiveData, openTeamsData, openPlayersData } from './openTabs.js';

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
let textMaterial;
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

function hideTextMesh() {
    new TWEEN.Tween(textMaterial)
        .to({ opacity: 0 }, 1000) // Animate to transparent over 1000 milliseconds
        .onUpdate(() => {
            // Update the material opacity
            textMaterial.opacity = this.opacity;
            render();
        })
        .start();
}

function showText() {
    new TWEEN.Tween(textMaterial)
        .to({ opacity: 1 }, 1000) // Animate to transparent over 1000 milliseconds
        .onUpdate(() => {
            // Update the material opacity
            textMaterial.opacity = this.opacity;
        })
        .start();
}

init();
animate();

function init() {               
    container = document.getElementById( 'container' );

    camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 4000 );
    camera.position.z = 500;

    scene = new THREE.Scene();
    renderer = new THREE.WebGLRenderer( { antialias: true  } ); //, alpha: true
    css3DRenderer = new CSS3DRenderer();
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

    TWEEN.update();

    render();

}

function render() {

    const time = Date.now() * 0.001;
    group.rotation.y = time * 0.01;
    renderer.render( scene, camera );
    css3DRenderer.render(scene, camera);

}



const objects = [];
const targets = { table: [], sphere: [], helix: [], grid: [] };
const table = [
    'H', 'Hydrogen', '1.00794', 1, 1,
    'He', 'Helium', '4.002602', 18, 1,
    'Li', 'Lithium', '6.941', 1, 2,
    'Be', 'Beryllium', '9.012182', 2, 2,
    'B', 'Boron', '10.811', 13, 2,
    'C', 'Carbon', '12.0107', 14, 2,
    'N', 'Nitrogen', '14.0067', 15, 2,
    'O', 'Oxygen', '15.9994', 16, 2,
    'F', 'Fluorine', '18.9984032', 17, 2,
    'Ne', 'Neon', '20.1797', 18, 2,
    'Na', 'Sodium', '22.98976...', 1, 3,
    'Mg', 'Magnesium', '24.305', 2, 3,
    'Al', 'Aluminium', '26.9815386', 13, 3,
    'Si', 'Silicon', '28.0855', 14, 3,
    'P', 'Phosphorus', '30.973762', 15, 3,
    'S', 'Sulfur', '32.065', 16, 3,
    'Cl', 'Chlorine', '35.453', 17, 3,
    'Ar', 'Argon', '39.948', 18, 3,
    'K', 'Potassium', '39.948', 1, 4,
    'Ca', 'Calcium', '40.078', 2, 4,
    'Sc', 'Scandium', '44.955912', 3, 4,
    'Ti', 'Titanium', '47.867', 4, 4,
    'V', 'Vanadium', '50.9415', 5, 4,
    'Cr', 'Chromium', '51.9961', 6, 4,
    'Mn', 'Manganese', '54.938045', 7, 4,
    'Fe', 'Iron', '55.845', 8, 4,
    'Co', 'Cobalt', '58.933195', 9, 4,
    'Ni', 'Nickel', '58.6934', 10, 4,
    'Cu', 'Copper', '63.546', 11, 4,
    'Zn', 'Zinc', '65.38', 12, 4,
    'Ga', 'Gallium', '69.723', 13, 4,
    'Ge', 'Germanium', '72.63', 14, 4,
    'As', 'Arsenic', '74.9216', 15, 4,
    'Se', 'Selenium', '78.96', 16, 4,
    'Br', 'Bromine', '79.904', 17, 4,
    'Kr', 'Krypton', '83.798', 18, 4,
    'Rb', 'Rubidium', '85.4678', 1, 5,
    'Sr', 'Strontium', '87.62', 2, 5,
    'Y', 'Yttrium', '88.90585', 3, 5,
    'Zr', 'Zirconium', '91.224', 4, 5,
    'Nb', 'Niobium', '92.90628', 5, 5,
    'Mo', 'Molybdenum', '95.96', 6, 5,
    'Tc', 'Technetium', '(98)', 7, 5,
    'Ru', 'Ruthenium', '101.07', 8, 5,
    'Rh', 'Rhodium', '102.9055', 9, 5,
    'Pd', 'Palladium', '106.42', 10, 5,
    'Ag', 'Silver', '107.8682', 11, 5,
    'Cd', 'Cadmium', '112.411', 12, 5,
    'In', 'Indium', '114.818', 13, 5,
    'Sn', 'Tin', '118.71', 14, 5,
    'Sb', 'Antimony', '121.76', 15, 5,
    'Te', 'Tellurium', '127.6', 16, 5,
    'I', 'Iodine', '126.90447', 17, 5,
    'Xe', 'Xenon', '131.293', 18, 5,
    'Cs', 'Caesium', '132.9054', 1, 6,
    'Ba', 'Barium', '132.9054', 2, 6,
    'La', 'Lanthanum', '138.90547', 4, 9,
    'Ce', 'Cerium', '140.116', 5, 9,
    'Pr', 'Praseodymium', '140.90765', 6, 9,
    'Nd', 'Neodymium', '144.242', 7, 9,
    'Pm', 'Promethium', '(145)', 8, 9,
    'Sm', 'Samarium', '150.36', 9, 9,
    'Eu', 'Europium', '151.964', 10, 9,
    'Gd', 'Gadolinium', '157.25', 11, 9,
    'Tb', 'Terbium', '158.92535', 12, 9,
    'Dy', 'Dysprosium', '162.5', 13, 9,
    'Ho', 'Holmium', '164.93032', 14, 9,
    'Er', 'Erbium', '167.259', 15, 9,
    'Tm', 'Thulium', '168.93421', 16, 9,
    'Yb', 'Ytterbium', '173.054', 17, 9,
    'Lu', 'Lutetium', '174.9668', 18, 9,
    'Hf', 'Hafnium', '178.49', 4, 6,
    'Ta', 'Tantalum', '180.94788', 5, 6,
    'W', 'Tungsten', '183.84', 6, 6,
    'Re', 'Rhenium', '186.207', 7, 6,
    'Os', 'Osmium', '190.23', 8, 6,
    'Ir', 'Iridium', '192.217', 9, 6,
    'Pt', 'Platinum', '195.084', 10, 6,
    'Au', 'Gold', '196.966569', 11, 6,
    'Hg', 'Mercury', '200.59', 12, 6,
    'Tl', 'Thallium', '204.3833', 13, 6,
    'Pb', 'Lead', '207.2', 14, 6,
    'Bi', 'Bismuth', '208.9804', 15, 6,
    'Po', 'Polonium', '(209)', 16, 6,
    'At', 'Astatine', '(210)', 17, 6,
    'Rn', 'Radon', '(222)', 18, 6,
    'Fr', 'Francium', '(223)', 1, 7,
    'Ra', 'Radium', '(226)', 2, 7,
    'Ac', 'Actinium', '(227)', 4, 10,
    'Th', 'Thorium', '232.03806', 5, 10,
    'Pa', 'Protactinium', '231.0588', 6, 10,
    'U', 'Uranium', '238.02891', 7, 10,
    'Np', 'Neptunium', '(237)', 8, 10,
    'Pu', 'Plutonium', '(244)', 9, 10,
    'Am', 'Americium', '(243)', 10, 10,
    'Cm', 'Curium', '(247)', 11, 10,
    'Bk', 'Berkelium', '(247)', 12, 10,
    'Cf', 'Californium', '(251)', 13, 10,
    'Es', 'Einstenium', '(252)', 14, 10,
    'Fm', 'Fermium', '(257)', 15, 10,
    'Md', 'Mendelevium', '(258)', 16, 10,
    'No', 'Nobelium', '(259)', 17, 10,
    'Lr', 'Lawrencium', '(262)', 18, 10,
    'Rf', 'Rutherfordium', '(267)', 4, 7,
    'Db', 'Dubnium', '(268)', 5, 7,
    'Sg', 'Seaborgium', '(271)', 6, 7,
    'Bh', 'Bohrium', '(272)', 7, 7,
    'Hs', 'Hassium', '(270)', 8, 7,
    'Mt', 'Meitnerium', '(276)', 9, 7,
    'Ds', 'Darmstadium', '(281)', 10, 7,
    'Rg', 'Roentgenium', '(280)', 11, 7,
    'Cn', 'Copernicium', '(285)', 12, 7,
    'Nh', 'Nihonium', '(286)', 13, 7,
    'Fl', 'Flerovium', '(289)', 14, 7,
    'Mc', 'Moscovium', '(290)', 15, 7,
    'Lv', 'Livermorium', '(293)', 16, 7,
    'Ts', 'Tennessine', '(294)', 17, 7,
    'Og', 'Oganesson', '(294)', 18, 7
];

export function removeCSSElements() {
    while (objects.length > 0) {
        const objectCSS = objects.pop(); // Remove the last element from the array
        scene.remove(objectCSS); // Remove it from the Three.js scene

        if (objectCSS.element && objectCSS.element.parentElement) {
            objectCSS.element.parentElement.removeChild(objectCSS.element); // Remove the DOM element
        }
    }
}

export function addCSSElements() {
    // table
    removeCSSElements();
    hideTextMesh();

    for ( let i = 0; i < table.length; i += 5 ) {

        const element = document.createElement( 'div' );
        element.className = 'element';
        element.style.backgroundColor = 'rgba(0,127,127,' + ( Math.random() * 0.5 + 0.25 ) + ')';

        const number = document.createElement( 'div' );
        number.className = 'number';
        number.textContent = ( i / 5 ) + 1;
        element.appendChild( number );

        const symbol = document.createElement( 'div' );
        symbol.className = 'symbol';
        symbol.textContent = table[ i ];
        element.appendChild( symbol );

        const details = document.createElement( 'div' );
        details.className = 'details';
        details.innerHTML = table[ i + 1 ] + '<br>' + table[ i + 2 ];
        element.appendChild( details );

        const objectCSS = new CSS3DObject( element );
        objectCSS.position.x = Math.random() * 4000 - 2000;
        objectCSS.position.y = Math.random() * 4000 - 2000;
        objectCSS.position.z = Math.random() * 4000 - 2000;
        scene.add( objectCSS );

        objects.push( objectCSS );

        //

        const object = new THREE.Object3D();
        object.position.x = ( table[ i + 3 ] * 140 ) - 1330;
        object.position.y = - ( table[ i + 4 ] * 180 ) + 990;
        object.position.z = - 500;

        targets.table.push( object );

    }

    transform( targets.table, 2000 );

}

function transform( targets, duration ) {

    TWEEN.removeAll();

    for ( let i = 0; i < objects.length; i ++ ) {

        const object = objects[ i ];
        const target = targets[ i ];

        new TWEEN.Tween( object.position )
            .to( { x: target.position.x, y: target.position.y, z: target.position.z }, Math.random() * duration + duration )
            .easing( TWEEN.Easing.Exponential.InOut )
            .start();

        new TWEEN.Tween( object.rotation )
            .to( { x: target.rotation.x, y: target.rotation.y, z: target.rotation.z }, Math.random() * duration + duration )
            .easing( TWEEN.Easing.Exponential.InOut )
            .start();

    }

    new TWEEN.Tween( this )
        .to( {}, duration * 2 )
        .onUpdate( render )
        .start();

}