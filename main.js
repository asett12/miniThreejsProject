import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

const animationBtn = document.getElementById("animation-style");
const colorBtn = document.getElementById("colorBtn");
const shapeBtn = document.getElementById("shapeBtn");
const textureBtn = document.getElementById("textureBtn");

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / (window.innerHeight * 0.9),
    0.1,
    1000
);

const canvasContainer = document.getElementById("canvas-container");
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(canvasContainer.clientWidth, canvasContainer.clientHeight);
canvasContainer.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.enableZoom = true;
controls.enablePan = true;   


const textureLoader = new THREE.TextureLoader();
const textures = [
  'assets/textures/Grass.jpg',
  'assets/textures/Brick.jpg',
  'assets/textures/Tile.jpg',
  'assets/textures/Tile2.jpg',
  'assets/textures/Leather.jpg',
];

let material = new THREE.MeshStandardMaterial({color: 0x920C0C});
const geometries = {
    cube: new THREE.BoxGeometry(1.5, 1.5, 1.5), 
    sphere: new THREE.SphereGeometry(0.75, 32, 32), 
    cone: new THREE.ConeGeometry(0.75, 1.5, 32), 
    torus: new THREE.TorusGeometry(0.75, 0.25, 16, 64), 
    capsule: new THREE.CapsuleGeometry(0.6, 1.2, 8, 16), 
    torusKnot: new THREE.TorusKnotGeometry(0.7, 0.25, 128, 32) 
};


let currentMesh = new THREE.Mesh(geometries.cube, material);
scene.add(currentMesh);

camera.position.z = 3;

const light = new THREE.DirectionalLight(0xffffff, 2);
light.position.set(2, 2, 5);
scene.add(light);

const animationNames = ["None", "Rotate", "Bounce", "Orbit", "360-Rotate"];
let animationStyle = 0;

let isRotating = false;
let clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);
  const t = clock.getElapsedTime();
  switch (animationStyle){
    case 1:
      currentMesh.rotation.x += 0.01;
      currentMesh.rotation.y += 0.01;
      break;
    case 2: // bounce
      currentMesh.position.y = Math.sin(t * 2) * 1;
      break;

    case 3: // orbit
      currentMesh.position.x = Math.cos(t * 3) * 1;
      currentMesh.position.y = Math.sin(t * 3) * 1;
      break;

    case 4: // cube rotate
      currentMesh.rotation.x = Math.sin(t * 3) * 1;
      currentMesh.rotation.y = Math.cos(t * 3) * 1;

    default: 
      currentMesh.position.set(0, 0, 0);
      break;
  }
  controls.update();
  renderer.render(scene, camera);
}
animate();

colorBtn.addEventListener("click", () => {
    currentMesh.material.color.set(Math.random() * 0xffffff);
});

shapeBtn.addEventListener("click", () => {
    const currentMaterial = currentMesh.material;
    scene.remove(currentMesh);

    const keys = Object.keys(geometries);
    const randomKey = keys[Math.floor(Math.random() * keys.length)];
    currentMesh = new THREE.Mesh(geometries[randomKey], currentMaterial);
    currentMesh.rotation.set(0, 0, 0);

    scene.add(currentMesh);
});

textureBtn.addEventListener("click", () => {
  const randomTexturePath = textures[Math.floor(Math.random() * textures.length)];
  textureLoader.load(randomTexturePath, (texture) => {
    currentMesh.material.map = texture;
    currentMesh.material.needsUpdate = true;
  });
});


animationBtn.addEventListener("click", () => {
  animationStyle = animationStyle + 1;  
  if (animationStyle >= animationNames.length) {
    animationStyle = 0;  
  }
  animationBtn.textContent = "Style: " + animationNames[animationStyle];
});

function onWindowResize(){
  const w = canvasContainer.offsetWidth;
  const h = canvasContainer.offsetHeight;
  camera.aspect = w/h;
  camera.updateProjectionMatrix();
  renderer.setSize(w,h);
}
onWindowResize();

window.addEventListener("resize", onWindowResize);
