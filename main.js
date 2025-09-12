import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { OBJLoader } from "three/addons/loaders/OBJLoader.js";
import { MTLLoader } from "three/addons/loaders/MTLLoader.js";

const animationBtn = document.getElementById("animation-style");
const colorBtn = document.getElementById("colorBtn");
const shapeBtn = document.getElementById("shapeBtn");
const textureBtn = document.getElementById("textureBtn");
const addObjBtn = document.getElementById("addObjBtn");


const scene = new THREE.Scene();
const loader = new THREE.TextureLoader();
  const texture = loader.load(
    'assets/images/bg.jpg',
    () => {
      texture.mapping = THREE.EquirectangularReflectionMapping;
      texture.colorSpace = THREE.SRGBColorSpace;
      scene.background = texture;
    });

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
  "assets/textures/Grass.jpg",
  "assets/textures/Brick.jpg",
  "assets/textures/Tile.jpg",
  "assets/textures/Tile2.jpg",
  "assets/textures/Leather.jpg"
];

let material = new THREE.MeshStandardMaterial({ color: 0x920c0c });
const geometries = {
  cube: new THREE.BoxGeometry(0.8, 0.8, 0.8),
  sphere: new THREE.SphereGeometry(0.4, 32, 32),
  cone: new THREE.ConeGeometry(0.4, 0.8, 32),
  torus: new THREE.TorusGeometry(0.4, 0.15, 16, 64),
  capsule: new THREE.CapsuleGeometry(0.3, 0.6, 8, 16),
  torusKnot: new THREE.TorusKnotGeometry(0.35, 0.15, 128, 32)
};

let currentMesh = new THREE.Mesh(geometries.cube, material);
scene.add(currentMesh);

camera.position.z = 3;

const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
dirLight.position.set(5, 8, 5);
scene.add(dirLight);

const hemi = new THREE.HemisphereLight(0xbddaff, 0x404040, 0.7);
scene.add(hemi);

const objLoader = new OBJLoader();
const mtlLoader = new MTLLoader();
const modelsGroup = new THREE.Group();
scene.add(modelsGroup);

function loadOBJWithMTL({ objUrl, mtlUrl, position = [0, 0, 0], targetSize = 1.2, rotateX = 0 }) {
  mtlLoader.load(
    mtlUrl,
    (materials) => {
      materials.preload();
      objLoader.setMaterials(materials);
      objLoader.load(
        objUrl,
        (obj) => {
          if (rotateX) obj.rotation.x = rotateX;
          const box = new THREE.Box3().setFromObject(obj);
          const size = new THREE.Vector3();
          box.getSize(size);
          const maxDim = Math.max(size.x, size.y, size.z) || 1;
          const s = targetSize / maxDim;
          obj.scale.setScalar(s);
          box.setFromObject(obj);
          const center = box.getCenter(new THREE.Vector3());
          obj.position.sub(center);
          obj.position.add(new THREE.Vector3().fromArray(position));
          obj.traverse((c) => {
            if (c.isMesh) {
              c.castShadow = true;
              c.receiveShadow = true;
            }
          });
          modelsGroup.add(obj);
        },
        undefined,
        () => {}
      );
    },
    undefined,
    () => {}
  );
}

const models = [
  { obj: "assets/models/male/male02.obj", mtl: "assets/models/male/male02.mtl" },
  { obj: "assets/models/female/female02.obj", mtl: "assets/models/female/female02.mtl" },
];

let modelIndex = 0;

function nextModel() {
  const current = models[modelIndex];
  modelIndex += 1;
  if (modelIndex >= models.length) modelIndex = 0;
  return current;
}
const baseX = -0.5;     
const spacing = 3;
const gridCols = 2;
let gridCol = 0, gridRow = 0;

function nextGridPosition() {
  const centeredCol = gridCol - (gridCols - 1) / 2;
  const x = baseX + centeredCol * spacing; 
  const y = -0.2;
  const z = -gridRow * spacing;

  gridCol += 1;
  if (gridCol >= gridCols) { gridCol = 0; gridRow += 1; }
  return [x, y, z];
}

addObjBtn.addEventListener("click", () => {
  const { obj, mtl } = nextModel();
  const position = nextGridPosition();
  loadOBJWithMTL({ objUrl: obj, mtlUrl: mtl, position, targetSize: 1.2, rotateX: 0 });
});

const animationNames = ["None", "Rotate", "Bounce", "Orbit", "360-Rotate"];
let animationStyle = 0;
let clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  const t = clock.getElapsedTime();
  switch (animationStyle) {
    case 1:
      currentMesh.rotation.x += 0.01;
      currentMesh.rotation.y += 0.01;
      break;
    case 2:
      currentMesh.position.y = Math.sin(t * 2) * 1;
      break;
    case 3:
      currentMesh.position.x = Math.cos(t * 3) * 1;
      currentMesh.position.y = Math.sin(t * 3) * 1;
      break;
    case 4:
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

function onWindowResize() {
  const w = canvasContainer.offsetWidth;
  const h = canvasContainer.offsetHeight;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);
}
onWindowResize();
window.addEventListener("resize", onWindowResize);
