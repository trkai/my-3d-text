
// Mã JavaScript tạo cảnh 3D, trái tim, chữ rơi và hiệu ứng pháo hoa
// Giả sử bạn đã thêm đoạn này vào cuối index.html: <script src="js/main.js"></script>
// Và font JSON đã được đặt trong thư mục fonts/BeVietnamPro-Regular.typeface.json

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 2000);
camera.position.set(0, 20, 60);

const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.minDistance = 20;
controls.maxDistance = 200;

const light = new THREE.PointLight(0xffffff, 2);
light.position.set(0, 50, 50);
scene.add(light);

const starGeo = new THREE.BufferGeometry();
const starCount = 2000;
const starPos = [];
for (let i = 0; i < starCount; i++) {
  starPos.push((Math.random() - 0.5) * 2000);
  starPos.push((Math.random() - 0.5) * 2000);
  starPos.push((Math.random() - 0.5) * 2000);
}
starGeo.setAttribute('position', new THREE.Float32BufferAttribute(starPos, 3));
const starMat = new THREE.PointsMaterial({ size: 1.2, color: 0xffffff });
const stars = new THREE.Points(starGeo, starMat);
scene.add(stars);

let heart;
const loader = new THREE.GLTFLoader();
loader.load('Heart.glb', function (gltf) {
  heart = gltf.scene;
  heart.scale.set(5, 5, 5);
  heart.position.y = 10;
  scene.add(heart);
});

const heartTex = new THREE.TextureLoader().load('https://cdn-icons-png.flaticon.com/512/833/833472.png');
const heartMat = new THREE.PointsMaterial({ size: 2, map: heartTex, transparent: true });
const heartGeo = new THREE.BufferGeometry();
const heartCount = 300;
const heartPositions = [];
for (let i = 0; i < heartCount; i++) {
  heartPositions.push((Math.random() - 0.5) * 200, Math.random() * 100 + 50, (Math.random() - 0.5) * 200);
}
heartGeo.setAttribute('position', new THREE.Float32BufferAttribute(heartPositions, 3));
const hearts = new THREE.Points(heartGeo, heartMat);
scene.add(hearts);

const fireworkParticles = [];
function fireworkBurst(position) {
  for (let i = 0; i < 60; i++) {
    const color = new THREE.Color(`hsl(${Math.random() * 360}, 100%, 70%)`);
    const mat = new THREE.MeshBasicMaterial({ color, transparent: true });
    const geo = new THREE.SphereGeometry(0.4, 8, 8);
    const p = new THREE.Mesh(geo, mat);
    p.position.copy(position);
    p.velocity = new THREE.Vector3(
      (Math.random() - 0.5) * 2,
      (Math.random() - 0.5) * 2,
      (Math.random() - 0.5) * 2
    ).multiplyScalar(10);
    p.life = 1.5;
    fireworkParticles.push(p);
    scene.add(p);
  }
}

const messages = ["Xin chào!", "Chúc mừng", "Yêu thương", "Việt Nam", "❤️"];
const textMeshes = [];
const fontLoader = new THREE.FontLoader();
fontLoader.load('fonts/BeVietnamPro-Regular.typeface.json', function (font) {
  function spawn3DText(message) {
    const geometry = new THREE.TextGeometry(message, {
      font: font,
      size: 4,
      height: 1,
      curveSegments: 4,
      bevelEnabled: false
    });
    const pinkMat = new THREE.MeshBasicMaterial({ color: 0xff69b4, transparent: true });
    const blackMat = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true });
    const textMesh = new THREE.Mesh(geometry, [pinkMat, blackMat]);
    textMesh.position.set(
      (Math.random() - 0.5) * 300,
      150 + Math.random() * 50,
      (Math.random() - 0.5) * 300
    );
    textMesh.rotation.y = Math.random() * Math.PI * 2;
    textMesh.userData = {
      velocity: Math.random() * 0.05 + 0.05,
      fading: false,
      fadeTime: 1.0
    };
    textMesh.frustumCulled = false;
    scene.add(textMesh);
    textMeshes.push(textMesh);
  }

  setInterval(() => {
    const msg = messages[Math.floor(Math.random() * messages.length)];
    spawn3DText(msg);
  }, 500);
});

let t = 0;
function animate() {
  requestAnimationFrame(animate);
  t += 0.01;

  if (heart) {
    heart.rotation.y += 0.01;
    heart.position.y = 10 + Math.sin(t) * 2;
  }

  stars.rotation.y += 0.001;
  stars.position.z = Math.sin(t * 0.2) * 50;

  const positions = hearts.geometry.attributes.position.array;
  for (let i = 1; i < positions.length; i += 3) {
    positions[i] -= 0.4;
    if (positions[i] < -10) positions[i] = 100;
  }
  hearts.geometry.attributes.position.needsUpdate = true;

  for (let i = fireworkParticles.length - 1; i >= 0; i--) {
    const p = fireworkParticles[i];
    p.position.add(p.velocity.clone().multiplyScalar(0.05));
    p.material.opacity = p.life / 1.5;
    p.life -= 0.02;
    if (p.life <= 0) {
      scene.remove(p);
      fireworkParticles.splice(i, 1);
    }
  }

  for (let i = textMeshes.length - 1; i >= 0; i--) {
    const mesh = textMeshes[i];
    if (!mesh.userData.fading) {
      mesh.position.y -= mesh.userData.velocity;
      mesh.rotation.y += 0.01;
      if (mesh.position.y < -30) {
        fireworkBurst(mesh.position);
        mesh.userData.fading = true;
      }
    } else {
      mesh.userData.fadeTime -= 0.02;
      mesh.scale.multiplyScalar(0.95);
      mesh.material.forEach(mat => mat.opacity = mesh.userData.fadeTime);
      if (mesh.userData.fadeTime <= 0) {
        scene.remove(mesh);
        textMeshes.splice(i, 1);
      }
    }
  }

  controls.update();
  renderer.render(scene, camera);
}
animate();

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
