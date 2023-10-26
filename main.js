// In case you need a hacky solution because some directories end up breaking...
// import { OrbitControls } from 'https://threejsfundamentals.org/threejs/resources/threejs/r110/examples/jsm/controls/OrbitControls.js';
// import { FBXLoader } from 'https://threejsfundamentals.org/threejs/resources/threejs/r110/examples/jsm/loaders/FBXLoader.js';
// import { FBXLoader } from '../node_modules/three/examples/jsm/loaders/FBXLoader.js';
// import { OBJLoader } from 'https://threejsfundamentals.org/threejs/resources/threejs/r110/examples/jsm/loaders/OBJLoader.js';

// Initializing all necessary build libraries
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import { ObjectLoader } from 'three/examples/jsm/loaders/OBJLoader.js';

console.log("Made it here!");

// -----------------------------------------------------------------//
// Initiatlizing a scene and camera

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xe1f6ff)
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 100000);

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );


// Adding an orbital camera (one that can move)
// const controls = new OrbitControls( camera, renderer.domElement );

camera.position.z = 1000;

// display camera coordinates in console
// console.log("Camera Position:", camera.position.x, camera.position.y, camera.position.z);

// -----------------------------------------------------------------//
// Helpers for scaling objects in the game environment
function addAxesHelper(){
    const size = 1000
    const axesHelper = new THREE.AxesHelper( size );
    scene.add( axesHelper );
}

function addGridHelper(){
    const size = 10000;
    const divisions = 50;
    const gridHelper = new THREE.GridHelper( size, divisions );
    scene.add( gridHelper );

    const floorGeometry = new THREE.PlaneGeometry(10, 10);

    const floorMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide }); // white material
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);

    // Rotate the plane to make it horizontal
    floor.rotation.x = Math.PI / 2;

    scene.add(floor);
}

function addCubeHelper(){
    // //Add a cube to the scene of size 1x1x1
    const geometry = new THREE.BoxGeometry( 200, 200, 200 );
    const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
    const cube = new THREE.Mesh( geometry, material );
    scene.add( cube );
}
addAxesHelper();
addGridHelper();
// addCubeHelper();

// -----------------------------------------------------------------//
// Add lighting to the scene
function addLight(){
    // Add Ambient light to the scene for soft white light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);  // Color, Intensity
    scene.add(ambientLight);

    // Add Directional light for shadows and direction-based light
    const dirLight = new THREE.DirectionalLight(0xffffff, 1); // Color, Intensity
    dirLight.position.set(1, 2, 3); // Position the light to shine onto the scene
    scene.add(dirLight);
}
addLight();

// -----------------------------------------------------------------//

// Loading a .FBX file to the game
function loadfbx(fbx_dir) {
    const fbxLoader = new FBXLoader();
    fbxLoader.load(fbx_dir, (fbx) => {
        scene.add(fbx);
        console.log("FBX Loaded.");
        // Access the FBX's position here because it's available in this scope.
        console.log(fbx.position);
        const box = new THREE.Box3().setFromObject(fbx);
        console.log(box.min, box.max);
        const center = box.getCenter(new THREE.Vector3());

        // Center the FBX file
        fbx.position.sub(center);  // This will center the FBX to the origin of the scene.
        fbx.position.x -= center.x;
        fbx.position.z -= center.z;

        // Set ground to be the x and z positions
        const height = box.max.y - box.min.y;
        fbx.position.y += height / 2;

        // Scale the FBX file
        fbx.scale.setScalar(1.3);  // scale down by a factor of 10 for instance
        fbx.rotation.y = Math.PI / 2;  // Rotate 90 degrees about the Y axis, for example
    });
}

const fbx_file = './resources/park_aligned.fbx';
loadfbx(fbx_file);

// -----------------------------------------------------------------//

let agent;
let direction = 'SOUTH';

function basicAgent(){
    // Simple cube agent
    const geometry = new THREE.BoxGeometry( 200, 200, 200 );
    const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
    agent = new THREE.Mesh(geometry, material);
    scene.add( agent );

     // Attach the camera to the agent
     agent.add(camera);
     //updateCameraPosition();

     // Set camera's position relative to the agent
     camera.position.set(0, 1000, -500);

     // Display agent position and camera position
     console.log("Agent Position", agent.position.x, agent.position.y, agent.position.z);
     console.log("Camera Position:", camera.position.x, camera.position.y, camera.position.z);
     
}

document.addEventListener('keydown', function(event) {
    if(!agent) {
        console.error("Agent is not initialized");
        return;
    }

    var step = 200; // This determines how much the agent will move with each key press.
  
    switch (event.code) {
        case 'ArrowUp':
            agent.position.z -= step;
            break;
        case 'ArrowDown':
            agent.position.z += step;
            direction = "SOUTH";
            break;
        case 'ArrowLeft':
            agent.position.x -= step;
            direction = "WEST";
            break;
        case 'ArrowRight':
            agent.position.x += step;
            direction = "EAST";
            break;
    }
    
    console.log(`Agent moved to position: ${agent.position.x}, ${agent.position.y}, ${agent.position.z}`);
    // updateCameraPosition();
});


function updateCameraPosition() {
    if(!agent) return;

    const distanceBehind = 500;
    const distanceAbove = 400;

    // Always position the camera behind and above the agent
    const offset = new THREE.Vector3(0, distanceAbove, distanceBehind);
    
    // Depending on the direction, we rotate this offset
    let rotationMatrix = new THREE.Matrix4();
    switch (direction) {
        case "NORTH":
            // No need for rotation, because we already have the desired offset
            break;
        case "SOUTH":
            rotationMatrix.makeRotationY(Math.PI); // 180 degrees rotation around Y axis
            offset.applyMatrix4(rotationMatrix);
            break;
        case "WEST":
            rotationMatrix.makeRotationY(-Math.PI / 2); // -90 degrees rotation around Y axis
            offset.applyMatrix4(rotationMatrix);
            break;
        case "EAST":
            rotationMatrix.makeRotationY(Math.PI / 2); // 90 degrees rotation around Y axis
            offset.applyMatrix4(rotationMatrix);
            break;
    }

    // Apply the offset to the agent's position to get the camera's position
    camera.position.copy(agent.position).add(offset);

    console.log(`Direction: ${direction}, Offset after rotation: ${offset.x}, ${offset.y}, ${offset.z}`);

    camera.lookAt(agent.position);
}


// Initiate the agent
basicAgent();


// -----------------------------------------------------------------//

function animate() {
	requestAnimationFrame( animate );
    // animation rendering from a given scene
	renderer.render( scene, camera );

    // display coordinates of camera angle
    console.log("Camera Position:", camera.position.x, camera.position.y, camera.position.z);
}
animate();
// -----------------------------------------------------------------//