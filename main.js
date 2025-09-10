const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / (window.innerHeight * 0.9),
    0.1,
    1000
);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById("canvas-container").appendChild(renderer.domElement);

const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(2, 2, 5);
scene.add(light);

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

let isRotating = false;
function animate() {
  requestAnimationFrame(animate);
  if (isRotating) {
        currentMesh.rotation.x += 0.01;
        currentMesh.rotation.y += 0.01;
  }
  renderer.render(scene, camera);
}
animate();

document.getElementById("playBtn").addEventListener("click", () => {
    isRotating = !isRotating;
    document.getElementById("playBtn").textContent = isRotating ? "Stop" : "Play";
});

document.getElementById("colorBtn").addEventListener("click", () => {
    currentMesh.material.color.set(Math.random() * 0xffffff);
});

document.getElementById("shapeBtn").addEventListener("click", () => {
    const currentMaterial = currentMesh.material;
    scene.remove(currentMesh);

    const keys = Object.keys(geometries);
    const randomKey = keys[Math.floor(Math.random() * keys.length)];
    currentMesh = new THREE.Mesh(geometries[randomKey], currentMaterial);
    currentMesh.rotation.set(0, 0, 0);

    scene.add(currentMesh);
});

window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
