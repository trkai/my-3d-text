const fontLoader = new THREE.FontLoader();
fontLoader.load('fonts/BeVietnamPro-Regular.typeface.json', function (font) {
  const geometry = new THREE.TextGeometry("Xin chào Việt Nam", {
    font: font,
    size: 4,
    height: 1,
    curveSegments: 4,
    bevelEnabled: false
  });
  const material = new THREE.MeshBasicMaterial({ color: 0xff69b4 });
  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);
});
