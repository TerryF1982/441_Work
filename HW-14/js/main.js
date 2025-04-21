let scene, camera, renderer;
let die12, die20, modelObject;
let orbitGroup;

init();
animate();

function init() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);

  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 0, 120);

  const pointLight = new THREE.PointLight(0xffffff, 1);
  pointLight.position.set(50, 50, 50);
  scene.add(pointLight);

  const ambientLight = new THREE.AmbientLight(0x222222);
  scene.add(ambientLight);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  document.body.appendChild(renderer.domElement);

  orbitGroup = new THREE.Group();
  scene.add(orbitGroup);

  const geometry12 = new THREE.DodecahedronGeometry(5);
  const material12 = new THREE.MeshStandardMaterial({ color: 0xff0000, flatShading: true });
  die12 = new THREE.Mesh(geometry12, material12);
  die12.position.x = -30;
  orbitGroup.add(die12);

  const geometry20 = new THREE.IcosahedronGeometry(5);
  const material20 = new THREE.MeshStandardMaterial({ color: 0x00ffff, flatShading: true });
  die20 = new THREE.Mesh(geometry20, material20);
  die20.position.x = 30;
  orbitGroup.add(die20);

  loadBearModel();
}

function animate() {
  requestAnimationFrame(animate);

  die12.rotation.x += 0.01;
  die12.rotation.y += 0.01;

  die20.rotation.x += 0.01;
  die20.rotation.y += 0.01;

  orbitGroup.rotation.y += 0.005;

  if (modelObject) {
    modelObject.rotation.y += 0.005;
  }

  renderer.render(scene, camera);
}

function loadBearModel() {
  const loader = new THREE.GLTFLoader();
  loader.load('bear.glb', function (gltf) {
    modelObject = gltf.scene;
    modelObject.position.set(0, 0, 0);
    modelObject.scale.set(200, 200, 200);
    scene.add(modelObject);
  }, undefined, function (error) {
    console.error('Error loading bear.glb:', error);
  });
}

