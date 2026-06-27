/* Hero sphere - clean matte black circle */
(function () {
  if (!window.THREE) return;

  const wrap = document.getElementById('hero-sphere-wrap');
  const canvas = document.getElementById('hero-sphere-canvas');
  if (!wrap || !canvas) return;

  const W = wrap.clientWidth;
  const H = wrap.clientHeight;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(W, H);
  renderer.setClearColor(0x000000, 0);
  renderer.outputEncoding = THREE.sRGBEncoding;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(44, W / H, 0.1, 100);
  camera.position.set(0, 0.85, 3.3);
  camera.lookAt(0, 0, 0);

  window._bhCam = camera;

  const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(0.92, 64, 64),
    new THREE.MeshBasicMaterial({ color: 0x030303, side: THREE.DoubleSide })
  );
  scene.add(sphere);

  function animate() {
    requestAnimationFrame(animate);
    camera.lookAt(0, 0, 0);
    renderer.render(scene, camera);
  }
  animate();

  window.addEventListener('resize', () => {
    const nw = wrap.clientWidth;
    const nh = wrap.clientHeight;
    camera.aspect = nw / nh;
    camera.updateProjectionMatrix();
    renderer.setSize(nw, nh);
  });
})();
