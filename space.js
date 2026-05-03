/* space.js — Three.js Weltraum-Szene */
(function initSpace() {
  const canvas = document.getElementById('bg-canvas');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);

  const scene  = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 1.5;

  /* ── Sterne Layer 1: viele kleine ferne Sterne ── */
  const COUNT = 4000;
  const geo   = new THREE.BufferGeometry();
  const pos   = new Float32Array(COUNT * 3);
  const sizes = new Float32Array(COUNT);
  const cols  = new Float32Array(COUNT * 3);

  for (let i = 0; i < COUNT; i++) {
    const phi   = Math.acos(2 * Math.random() - 1);
    const theta = Math.random() * Math.PI * 2;
    const r     = 80 + Math.random() * 120;
    pos[i*3]   = r * Math.sin(phi) * Math.cos(theta);
    pos[i*3+1] = r * Math.sin(phi) * Math.sin(theta);
    pos[i*3+2] = r * Math.cos(phi);
    sizes[i]   = Math.random() * 1.8 + 0.3;
    const t = Math.random();
    if      (t < 0.12) { cols[i*3]=0.6; cols[i*3+1]=1.0; cols[i*3+2]=0.95; } // türkis-weiß
    else if (t < 0.22) { cols[i*3]=0.7; cols[i*3+1]=0.8; cols[i*3+2]=1.0;  } // blau-weiß
    else               { cols[i*3]=0.95;cols[i*3+1]=0.95;cols[i*3+2]=1.0;  } // weiß
  }
  geo.setAttribute('position', new THREE.BufferAttribute(pos,   3));
  geo.setAttribute('size',     new THREE.BufferAttribute(sizes, 1));
  geo.setAttribute('color',    new THREE.BufferAttribute(cols,  3));

  const starMat = new THREE.ShaderMaterial({
    uniforms: { time: { value: 0 } },
    vertexShader: `
      attribute float size; attribute vec3 color;
      varying vec3 vColor; uniform float time;
      void main() {
        vColor = color;
        float tw = sin(time * 1.5 + position.x * 0.3 + position.y * 0.2) * 0.4 + 0.6;
        gl_PointSize = size * tw;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }`,
    fragmentShader: `
      varying vec3 vColor;
      void main() {
        vec2 xy = gl_PointCoord * 2.0 - 1.0;
        float r = dot(xy, xy); if (r > 1.0) discard;
        gl_FragColor = vec4(vColor, (1.0 - r) * 0.9);
      }`,
    transparent: true, depthWrite: false,
    blending: THREE.AdditiveBlending, vertexColors: true
  });
  scene.add(new THREE.Points(geo, starMat));

  /* ── Sterne Layer 2: hellere Nahsterne ── */
  const CLOSE = 300;
  const cgeo  = new THREE.BufferGeometry();
  const cpos  = new Float32Array(CLOSE * 3);
  const csiz  = new Float32Array(CLOSE);
  for (let i = 0; i < CLOSE; i++) {
    const phi   = Math.acos(2 * Math.random() - 1);
    const theta = Math.random() * Math.PI * 2;
    const r     = 30 + Math.random() * 50;
    cpos[i*3]   = r * Math.sin(phi) * Math.cos(theta);
    cpos[i*3+1] = r * Math.sin(phi) * Math.sin(theta);
    cpos[i*3+2] = r * Math.cos(phi);
    csiz[i]     = Math.random() * 3.5 + 1.2;
  }
  cgeo.setAttribute('position', new THREE.BufferAttribute(cpos, 3));
  cgeo.setAttribute('size',     new THREE.BufferAttribute(csiz, 1));

  const closeMat = new THREE.ShaderMaterial({
    uniforms: { time: { value: 0 } },
    vertexShader: `
      attribute float size; uniform float time;
      void main() {
        float tw = sin(time * 0.8 + position.z * 0.5 + position.x * 0.4) * 0.5 + 0.5;
        gl_PointSize = size * (0.6 + tw * 0.8);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }`,
    fragmentShader: `
      void main() {
        vec2 xy = gl_PointCoord * 2.0 - 1.0;
        float r = dot(xy, xy); if (r > 1.0) discard;
        gl_FragColor = vec4(0.85, 1.0, 0.98, (1.0 - r*r) * 0.95);
      }`,
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending
  });
  const closeStars = new THREE.Points(cgeo, closeMat);
  scene.add(closeStars);

  /* ── Nebel ── */
  const NEBCOUNT = 1200;
  const ngeo = new THREE.BufferGeometry();
  const npos = new Float32Array(NEBCOUNT * 3);
  const ncol = new Float32Array(NEBCOUNT * 3);
  for (let i = 0; i < NEBCOUNT; i++) {
    npos[i*3]   = (Math.random()-.5)*150;
    npos[i*3+1] = (Math.random()-.5)*60;
    npos[i*3+2] = (Math.random()-.5)*60 + 20;
    const p = Math.random();
    if      (p < 0.4) { ncol[i*3]=0.0;  ncol[i*3+1]=0.6;  ncol[i*3+2]=0.55; } // türkis
    else if (p < 0.7) { ncol[i*3]=0.15; ncol[i*3+1]=0.4;  ncol[i*3+2]=0.6;  } // blau-grün
    else               { ncol[i*3]=0.1;  ncol[i*3+1]=0.2;  ncol[i*3+2]=0.5;  } // tiefblau
  }
  ngeo.setAttribute('position', new THREE.BufferAttribute(npos, 3));
  ngeo.setAttribute('color',    new THREE.BufferAttribute(ncol, 3));
  const nebula = new THREE.Points(ngeo, new THREE.PointsMaterial({
    size: 2.2, transparent: true, opacity: 0.12,
    vertexColors: true, blending: THREE.AdditiveBlending, depthWrite: false
  }));
  scene.add(nebula);

  /* ── Maus-Parallax ── */
  let tRX = 0, tRY = 0, cRX = 0, cRY = 0;
  document.addEventListener('mousemove', e => {
    tRY = ((e.clientX / window.innerWidth)  - 0.5) * 0.3;
    tRX = ((e.clientY / window.innerHeight) - 0.5) * 0.15;
  });

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  /* ── Render Loop ── */
  const stars = scene.children[0];
  let t = 0;
  (function animate() {
    requestAnimationFrame(animate);
    t += 0.008;
    starMat.uniforms.time.value  = t;
    closeMat.uniforms.time.value = t;
    stars.rotation.y      = t * 0.006;
    stars.rotation.x      = Math.sin(t * 0.003) * 0.04;
    closeStars.rotation.y = t * 0.004;
    nebula.rotation.y     = t * 0.003;
    cRX += (tRX - cRX) * 0.04;
    cRY += (tRY - cRY) * 0.04;
    scene.rotation.x = cRX;
    scene.rotation.y = cRY;
    renderer.render(scene, camera);
  })();
})();
