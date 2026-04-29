    const GAME_VERSION = 'v4.1';

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x121a27);
    scene.fog = new THREE.Fog(0x121a27, 22, 118);

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 300);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.xr.enabled = true;
    document.body.appendChild(renderer.domElement);

    function makeVrStatusLabel() {
      const canvas = document.createElement('canvas');
      canvas.width = 1024;
      canvas.height = 128;
      const ctx = canvas.getContext('2d');
      const texture = new THREE.CanvasTexture(canvas);
      texture.colorSpace = THREE.SRGBColorSpace;
      const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false }));
      sprite.scale.set(1.65, 0.2, 1);
      sprite.position.set(0, -0.12, -1.1);
      sprite.visible = false;
      camera.add(sprite);
      scene.add(camera);
      return { sprite, canvas, ctx, texture };
    }
    const vrStatusLabel = makeVrStatusLabel();

    const hemi = new THREE.HemisphereLight(0xffffff, 0x1b1b2d, 1.25);
    scene.add(hemi);
    const dir = new THREE.DirectionalLight(0xffffff, 1.15);
    dir.position.set(12, 20, 10);
    scene.add(dir);
    const ambientPulse = new THREE.PointLight(0xff4568, 0.58, 40, 2);
    ambientPulse.position.set(0, 8, 0);
    scene.add(ambientPulse);

    const WORLD_SIZE = 180;
    const WORLD_HALF = WORLD_SIZE / 2;
    const WALL_LINE = WORLD_HALF - 2;

    function makeCheckerTexture() {
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 512;
      const ctx = canvas.getContext('2d');
      const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      grad.addColorStop(0, '#101824');
      grad.addColorStop(0.45, '#1a2636');
      grad.addColorStop(1, '#111a28');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const tile = 64;
      for (let x = 0; x < canvas.width; x += tile) {
        for (let y = 0; y < canvas.height; y += tile) {
          const lit = ((x / tile) + (y / tile)) % 2 === 0;
          ctx.fillStyle = lit ? 'rgba(122, 188, 255, 0.07)' : 'rgba(255, 86, 121, 0.04)';
          ctx.fillRect(x, y, tile, tile);
        }
      }

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.lineWidth = 1.8;
      for (let x = 0; x <= canvas.width; x += tile) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y <= canvas.height; y += tile) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      ctx.strokeStyle = 'rgba(255, 198, 48, 0.22)';
      ctx.lineWidth = 5;
      for (let i = -canvas.height; i < canvas.width; i += 128) {
        ctx.beginPath();
        ctx.moveTo(i, canvas.height);
        ctx.lineTo(i + canvas.height, 0);
        ctx.stroke();
      }

      for (let i = 0; i < 34; i++) {
        const w = 28 + Math.random() * 64;
        const h = 8 + Math.random() * 18;
        ctx.fillStyle = 'rgba(15, 20, 28, 0.32)';
        ctx.fillRect(Math.random() * (canvas.width - w), Math.random() * (canvas.height - h), w, h);
      }

      ctx.fillStyle = 'rgba(255,255,255,0.05)';
      for (let i = 0; i < 130; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const size = 1 + Math.random() * 1.6;
        ctx.fillRect(x, y, size, size);
      }
      const texture = new THREE.CanvasTexture(canvas);
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(11, 11);
      texture.colorSpace = THREE.SRGBColorSpace;
      return texture;
    }

    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(WORLD_SIZE, WORLD_SIZE),
      new THREE.MeshStandardMaterial({ map: makeCheckerTexture(), roughness: 0.92, metalness: 0.14, color: 0xb6c4d7 })
    );
    floor.rotation.x = -Math.PI / 2;
    scene.add(floor);

    const skyCanvas = document.createElement('canvas');
    skyCanvas.width = 1024;
    skyCanvas.height = 512;
    const skyCtx = skyCanvas.getContext('2d');
    const skyGrad = skyCtx.createLinearGradient(0, 0, 0, skyCanvas.height);
    skyGrad.addColorStop(0, '#121e32');
    skyGrad.addColorStop(0.36, '#243755');
    skyGrad.addColorStop(0.68, '#4a2c3c');
    skyGrad.addColorStop(1, '#1d1416');
    skyCtx.fillStyle = skyGrad;
    skyCtx.fillRect(0, 0, skyCanvas.width, skyCanvas.height);
    for (let i = 0; i < 280; i++) {
      skyCtx.fillStyle = `rgba(255,233,196,${0.04 + Math.random() * 0.2})`;
      const size = Math.random() * 2.2;
      skyCtx.fillRect(Math.random() * skyCanvas.width, Math.random() * skyCanvas.height * 0.6, size, size);
    }
    skyCtx.fillStyle = 'rgba(22, 28, 41, 0.86)';
    for (let i = 0; i < 22; i++) {
      const w = 26 + Math.random() * 60;
      const h = 48 + Math.random() * 120;
      const x = i * 48 + Math.random() * 12;
      skyCtx.fillRect(x, 260 - h, w, h);
    }
    skyCtx.fillStyle = 'rgba(255, 205, 110, 0.2)';
    skyCtx.fillRect(0, 258, skyCanvas.width, 3);
    skyCtx.strokeStyle = 'rgba(255, 92, 120, 0.22)';
    skyCtx.lineWidth = 14;
    skyCtx.beginPath();
    skyCtx.moveTo(0, 182);
    skyCtx.bezierCurveTo(170, 130, 330, 242, 500, 176);
    skyCtx.bezierCurveTo(700, 104, 860, 244, 1024, 166);
    skyCtx.stroke();
    const skyTexture = new THREE.CanvasTexture(skyCanvas);
    skyTexture.colorSpace = THREE.SRGBColorSpace;
    const skyDome = new THREE.Mesh(
      new THREE.SphereGeometry(210, 40, 24),
      new THREE.MeshBasicMaterial({ map: skyTexture, side: THREE.BackSide, fog: false })
    );
    scene.add(skyDome);

    const horizonRing = new THREE.Mesh(
      new THREE.TorusGeometry(110, 3.8, 10, 80),
      new THREE.MeshBasicMaterial({ color: 0xff537a, transparent: true, opacity: 0.12 })
    );
    horizonRing.rotation.x = Math.PI / 2;
    horizonRing.position.y = 2.8;
    scene.add(horizonRing);

    const floorGlow = new THREE.Mesh(
      new THREE.CircleGeometry(72, 48),
      new THREE.MeshBasicMaterial({ color: 0xff5f6b, transparent: true, opacity: 0.06 })
    );
    floorGlow.rotation.x = -Math.PI / 2;
    floorGlow.position.y = 0.03;
    scene.add(floorGlow);

    const stars = new THREE.Group();
    const starMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    for (let i = 0; i < 230; i++) {
      const m = new THREE.Mesh(new THREE.SphereGeometry(0.08, 6, 6), starMat);
      m.position.set((Math.random() - 0.5) * 220, 15 + Math.random() * 35, (Math.random() - 0.5) * 220);
      stars.add(m);
    }
    scene.add(stars);

    const colliders = [];
    const gates = [];
    const entities = [];
    const props = [];
    const flickerLights = [];
    const donuts = [];
    const chests = [];
    const corruptionPatches = [];
    const stairways = [];
    const platforms = [];
    const PLAYER_EYE_HEIGHT = 1.6;
    const GRAVITY = 0.026;
    const MAX_FALL_SPEED = 0.75;
    const MAX_STEP_UP = 0.95;
    const GROUND_SMOOTHING = 0.28;
    const JUMP_SPEED = 0.42;
    const DAY_NIGHT_MS = 180000;

    function addCollider(x, z, w, d, meta = {}) {
      colliders.push({ x, z, w, d, ...meta });
    }

    function addWall(x, z, w = 2, h = 3, d = 2, color = 0x2e2e44) {
      const m = new THREE.Mesh(
        new THREE.BoxGeometry(w, h, d),
        new THREE.MeshStandardMaterial({ color, roughness: 0.72 })
      );
      m.position.set(x, h / 2, z);
      scene.add(m);

      const longWall = Math.max(w, d) > 5;
      if (longWall) {
        const horizontal = w >= d;
        const trimColor = color === 0x6f0909 || color === 0x5a0808 ? 0xff4a1c : 0x7c7ca8;
        const topTrim = new THREE.Mesh(
          new THREE.BoxGeometry(horizontal ? w + 0.16 : 0.34, 0.14, horizontal ? 0.34 : d + 0.16),
          new THREE.MeshBasicMaterial({ color: trimColor, transparent: true, opacity: 0.55 })
        );
        topTrim.position.set(x, h + 0.09, z);
        scene.add(topTrim);

        const baseTrim = new THREE.Mesh(
          new THREE.BoxGeometry(horizontal ? w + 0.08 : 0.24, 0.18, horizontal ? 0.24 : d + 0.08),
          new THREE.MeshStandardMaterial({ color: 0x151522, roughness: 0.8 })
        );
        baseTrim.position.set(x, 0.13, z);
        scene.add(baseTrim);

        const endMat = new THREE.MeshStandardMaterial({ color: trimColor, roughness: 0.55 });
        for (const side of [-1, 1]) {
          const endCap = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, h + 0.2, 12), endMat);
          endCap.position.set(x + (horizontal ? side * w / 2 : 0), (h + 0.2) / 2, z + (horizontal ? 0 : side * d / 2));
          scene.add(endCap);
        }
      }
      addCollider(x, z, w, d);
      return m;
    }

    function addPillar(x, z, color = 0x3e3e58) {
      const g = new THREE.Group();
      const base = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 1.1, 3, 8), new THREE.MeshStandardMaterial({ color }));
      base.position.y = 1.5;
      g.add(base);
      const top = new THREE.Mesh(new THREE.SphereGeometry(0.35, 10, 10), new THREE.MeshBasicMaterial({ color: 0xffffff }));
      top.position.y = 3.3;
      g.add(top);
      g.position.set(x, 0, z);
      scene.add(g);
      addCollider(x, z, 1.8, 1.8);
      props.push(g);
    }

    function addZonePlate(x, z, color) {
      const m = new THREE.Mesh(
        new THREE.CircleGeometry(2.8, 24),
        new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.16 })
      );
      m.rotation.x = -Math.PI / 2;
      m.position.set(x, 0.02, z);
      scene.add(m);
    }

    function addLavaPool(x, z, radius = 3.2) {
      const pool = new THREE.Mesh(
        new THREE.CircleGeometry(radius, 32),
        new THREE.MeshBasicMaterial({ color: 0xff3b00, transparent: true, opacity: 0.32 })
      );
      pool.rotation.x = -Math.PI / 2;
      pool.position.set(x, 0.05, z);
      scene.add(pool);

      const core = new THREE.Mesh(
        new THREE.CircleGeometry(radius * 0.58, 24),
        new THREE.MeshBasicMaterial({ color: 0xffd166, transparent: true, opacity: 0.28 })
      );
      core.rotation.x = -Math.PI / 2;
      core.position.set(x, 0.06, z);
      scene.add(core);
      return { pool, core };
    }

    function addFlame(x, z, scale = 1) {
      const flame = new THREE.Group();
      const outer = new THREE.Mesh(
        new THREE.ConeGeometry(0.5 * scale, 1.7 * scale, 12),
        new THREE.MeshBasicMaterial({ color: 0xff3300, transparent: true, opacity: 0.75 })
      );
      outer.position.y = 0.85 * scale;
      flame.add(outer);

      const inner = new THREE.Mesh(
        new THREE.ConeGeometry(0.28 * scale, 1.15 * scale, 10),
        new THREE.MeshBasicMaterial({ color: 0xffd166, transparent: true, opacity: 0.85 })
      );
      inner.position.y = 0.65 * scale;
      flame.add(inner);

      flame.position.set(x, 0, z);
      scene.add(flame);
      props.push(flame);
      return flame;
    }

    function addPlatform(x, y, z, w, h, d, color = 0x2f2f46) {
      const mesh = new THREE.Mesh(
        new THREE.BoxGeometry(w, h, d),
        new THREE.MeshStandardMaterial({ color })
      );
      mesh.position.set(x, y - h / 2, z);
      mesh.userData.walkSurface = { x, z, w, d, top: y, visibleMesh: mesh };
      scene.add(mesh);
      platforms.push(mesh);
      return mesh;
    }

    function addStairway(name, x, z, steps, stepW, stepH, stepD, color, targetText) {
      const meshes = [];
      for (let i = 0; i < steps; i++) {
        const m = new THREE.Mesh(
          new THREE.BoxGeometry(stepW, stepH, stepD),
          new THREE.MeshStandardMaterial({ color })
        );
        m.position.set(x, (i * stepH) + stepH / 2, z + (i * stepD));
        m.userData.walkSurface = { x, z: z + (i * stepD), w: stepW, d: stepD, top: (i + 1) * stepH, visibleMesh: m };
        m.visible = false;
        scene.add(m);
        meshes.push(m);
      }
      const pad = new THREE.Mesh(
        new THREE.BoxGeometry(stepW + 2, 0.8, stepD + 4),
        new THREE.MeshStandardMaterial({ color: 0x4d1738 })
      );
      pad.position.set(x, steps * stepH + 0.4, z + (steps * stepD) + 1.2);
      pad.userData.walkSurface = { x, z: z + (steps * stepD) + 1.2, w: stepW + 2, d: stepD + 4, top: steps * stepH + 0.8, visibleMesh: pad };
      pad.visible = false;
      scene.add(pad);
      const sign = makeNameSprite(name);
      sign.position.set(x, steps * stepH + 2.2, z + (steps * stepD) + 1.2);
      sign.visible = false;
      scene.add(sign);
      const stair = {
        name,
        x,
        z,
        steps,
        stepW,
        stepH,
        stepD,
        meshes,
        pad,
        sign,
        visible: false,
        unlocked: false,
        targetText
      };
      stairways.push(stair);
      return stair;
    }

    function setStairVisible(stair, visible) {
      stair.visible = visible;
      stair.unlocked = visible;
      stair.meshes.forEach(m => m.visible = visible);
      stair.pad.visible = visible;
      stair.sign.visible = visible;
    }

    // Indoor play-lab facility map: colorful, creepy and route-based.
    for (let i = -WALL_LINE; i <= WALL_LINE; i += 2) {
      addWall(i, -WALL_LINE, 2, 7, 2, 0x2d3f5f);
      addWall(i, WALL_LINE, 2, 7, 2, 0x2d3f5f);
      addWall(-WALL_LINE, i, 2, 7, 2, 0x2d3f5f);
      addWall(WALL_LINE, i, 2, 7, 2, 0x2d3f5f);
    }

    // Central lobby and four colored wings.
    addWall(0, -62, 86, 6, 2, 0x345c78);
    addWall(0, 62, 86, 6, 2, 0x345c78);
    addWall(-84, 0, 2, 6, 126, 0x345c78);
    addWall(84, 0, 2, 6, 126, 0x345c78);

    addWall(0, -38, 2, 6, 48, 0x3f5174);
    addWall(0, 22, 2, 6, 52, 0x3f5174);
    addWall(-46, 0, 18, 6, 2, 0x3f5174);
    addWall(-10, 0, 18, 6, 2, 0x3f5174);
    addWall(16, 0, 18, 6, 2, 0x3f5174);
    addWall(48, 0, 18, 6, 2, 0x3f5174);
    addWall(52, -30, 2, 6, 34, 0x3f5174);
    addWall(52, 30, 2, 6, 38, 0x3f5174);
    addWall(-54, -30, 2, 6, 34, 0x3f5174);
    addWall(-54, 30, 2, 6, 38, 0x3f5174);

    // Entrance plaza / intro wing.
    addWall(-64, -32, 34, 6, 2, 0x5f4b7a);
    addWall(-64, 14, 34, 6, 2, 0x5f4b7a);
    addWall(-74, -8, 2, 6, 48, 0x5f4b7a);
    addWall(-50, -24, 2, 6, 16, 0x5f4b7a);
    addWall(-50, 8, 2, 6, 16, 0x5f4b7a);
    addWall(-38, -44, 2, 6, 22, 0x6d5d2f);
    addWall(-28, -44, 8, 6, 2, 0x6d5d2f);
    addWall(-12, -44, 8, 6, 2, 0x6d5d2f);

    // East security wing / bosses.
    addWall(58, -52, 36, 6, 2, 0x6b4040);
    addWall(58, 52, 36, 6, 2, 0x6b4040);
    addWall(72, 0, 2, 6, 106, 0x6b4040);
    addWall(40, -34, 2, 6, 38, 0x6b4040);
    addWall(40, 34, 2, 6, 38, 0x6b4040);
    addWall(58, -4, 20, 6, 2, 0x874f4f);

    // North archive / finale hall.
    addWall(-12, 36, 24, 6, 2, 0x2d6b5b);
    addWall(28, 36, 24, 6, 2, 0x2d6b5b);
    addWall(8, 74, 64, 6, 2, 0x2d6b5b);
    addWall(-22, 54, 2, 6, 40, 0x2d6b5b);
    addWall(38, 54, 2, 6, 40, 0x2d6b5b);
    addWall(-4, 52, 10, 6, 2, 0x4b9d86);
    addWall(20, 52, 10, 6, 2, 0x4b9d86);

    // South funhouse hall leading to circus stair.
    addWall(8, -18, 14, 6, 2, 0x5b2e63);
    addWall(32, -18, 14, 6, 2, 0x5b2e63);
    addWall(20, -58, 42, 6, 2, 0x5b2e63);
    addWall(0, -38, 2, 6, 40, 0x5b2e63);
    addWall(40, -38, 2, 6, 40, 0x5b2e63);
    addWall(12, -28, 6, 6, 2, 0xa53ea2);
    addWall(28, -28, 6, 6, 2, 0xa53ea2);

    // Extra maze partitions for denser navigation.
    addWall(-62, -20, 2, 5, 10, 0x516b8b);
    addWall(-62, 2, 2, 5, 10, 0x516b8b);
    addWall(-70, -16, 10, 5, 2, 0x516b8b);
    addWall(-58, 10, 10, 5, 2, 0x516b8b);

    addWall(-30, -24, 2, 5, 14, 0x5f557d);
    addWall(-18, -12, 14, 5, 2, 0x5f557d);
    addWall(-6, 12, 14, 5, 2, 0x5f557d);
    addWall(-18, 26, 2, 5, 12, 0x5f557d);

    addWall(24, -46, 2, 5, 10, 0x74406a);
    addWall(34, -46, 2, 5, 10, 0x74406a);
    addWall(30, -50, 12, 5, 2, 0x74406a);
    addWall(10, -30, 12, 5, 2, 0x74406a);

    addWall(48, -18, 12, 5, 2, 0x864f4f);
    addWall(64, -18, 12, 5, 2, 0x864f4f);
    addWall(58, 18, 12, 5, 2, 0x864f4f);
    addWall(46, 14, 2, 5, 12, 0x864f4f);
    addWall(68, 14, 2, 5, 12, 0x864f4f);

    addWall(2, 40, 12, 5, 2, 0x3d7a68);
    addWall(16, 40, 12, 5, 2, 0x3d7a68);
    addWall(-8, 66, 12, 5, 2, 0x3d7a68);
    addWall(24, 66, 12, 5, 2, 0x3d7a68);

    // Colorful route strips.
    addFloorStripe(-64, -8, 20, 2.8, 0x58d8ff);
    addFloorStripe(-10, -44, 28, 1.8, 0xffd166);
    addFloorStripe(20, -38, 28, 1.8, 0xff5cd6);
    addFloorStripe(56, 0, 2.2, 82, 0xff7b59);
    addFloorStripe(8, 55, 50, 2.2, 0x72ffc1);
    addFloorStripe(0, -8, 2.4, 106, 0x92a4ff);

    for (const p of [[-74,-48],[-74,30],[-52,-48],[-52,30],[-22,-54],[38,-54],[38,74],[-22,74],[72,-52],[72,52]]) {
      addPillar(p[0], p[1], 0x324a63);
    }
    for (const p of [[-70,-4],[-20,-44],[20,-38],[44,-4],[44,36],[8,68],[24,68],[58,-48],[58,48],[-66,18]]) {
      addStreetLamp(p[0], p[1], 0xcdf8ff);
    }

    function makeNameSprite(text) {
      const canvas = document.createElement('canvas');
      canvas.width = 256;
      canvas.height = 64;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = 'rgba(0,0,0,0.62)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = 'rgba(255,255,255,0.35)';
      ctx.strokeRect(2, 2, canvas.width - 4, canvas.height - 4);
      ctx.fillStyle = 'white';
      ctx.font = 'bold 28px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, canvas.width / 2, canvas.height / 2);
      const texture = new THREE.CanvasTexture(canvas);
      const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, transparent: true }));
      sprite.scale.set(3, 0.75, 1);
      return sprite;
    }

    function addBuilding({ name, x, z, w, d, wallColor, floorColor, trimColor, doorSide = 'south', doorWidth = 5 }) {
      addPlatform(x, 0.08, z, w, 0.16, d, floorColor);

      const wallH = 4.2;
      const t = 1.1;
      const addDoorWall = (side) => {
        const horizontal = side === 'north' || side === 'south';
        const length = horizontal ? w : d;
        const segment = (length - doorWidth) / 2;
        if (segment <= 0) return;
        const offset = doorWidth / 2 + segment / 2;
        if (horizontal) {
          const wz = z + (side === 'north' ? d / 2 : -d / 2);
          addWall(x - offset, wz, segment, wallH, t, wallColor);
          addWall(x + offset, wz, segment, wallH, t, wallColor);
        } else {
          const wx = x + (side === 'east' ? w / 2 : -w / 2);
          addWall(wx, z - offset, t, wallH, segment, wallColor);
          addWall(wx, z + offset, t, wallH, segment, wallColor);
        }
      };

      if (doorSide === 'north') addDoorWall('north'); else addWall(x, z + d / 2, w, wallH, t, wallColor);
      if (doorSide === 'south') addDoorWall('south'); else addWall(x, z - d / 2, w, wallH, t, wallColor);
      if (doorSide === 'east') addDoorWall('east'); else addWall(x + w / 2, z, t, wallH, d, wallColor);
      if (doorSide === 'west') addDoorWall('west'); else addWall(x - w / 2, z, t, wallH, d, wallColor);

      const columnMat = new THREE.MeshStandardMaterial({ color: trimColor });
      for (const corner of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
        const column = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.48, wallH + 0.2, 16), columnMat);
        column.position.set(x + corner[0] * w / 2, (wallH + 0.2) / 2, z + corner[1] * d / 2);
        scene.add(column);
      }

      const roof = new THREE.Mesh(
        new THREE.BoxGeometry(w + 1.2, 0.35, d + 1.2),
        new THREE.MeshStandardMaterial({ color: trimColor, transparent: true, opacity: 0.42 })
      );
      roof.position.set(x, 4.45, z);
      scene.add(roof);

      const sign = makeNameSprite(name);
      const signOffset = Math.max(w, d) / 2 + 0.9;
      if (doorSide === 'north') sign.position.set(x, 3.35, z + signOffset);
      else if (doorSide === 'south') sign.position.set(x, 3.35, z - signOffset);
      else if (doorSide === 'east') sign.position.set(x + signOffset, 3.35, z);
      else sign.position.set(x - signOffset, 3.35, z);
      sign.scale.set(4.4, 0.9, 1);
      scene.add(sign);

      return { x, z, w, d, sign, roof };
    }

    function addCounter(x, z, w, d, color) {
      const counter = new THREE.Mesh(
        new THREE.BoxGeometry(w, 1, d),
        new THREE.MeshStandardMaterial({ color })
      );
      counter.position.set(x, 0.5, z);
      scene.add(counter);
      addCollider(x, z, w, d);
      return counter;
    }

    function addTableSet(x, z, color = 0xffd166) {
      const top = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.1, 0.18, 20), new THREE.MeshStandardMaterial({ color }));
      top.position.set(x, 0.82, z);
      scene.add(top);
      const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.2, 0.76, 12), new THREE.MeshStandardMaterial({ color: 0x2b2b38 }));
      stem.position.set(x, 0.4, z);
      scene.add(stem);
      for (const p of [[1.6, 0], [-1.6, 0], [0, 1.6], [0, -1.6]]) {
        const seat = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.22, 16), new THREE.MeshStandardMaterial({ color: 0xff2d2d }));
        seat.position.set(x + p[0], 0.52, z + p[1]);
        scene.add(seat);
      }
      addCollider(x, z, 2.4, 2.4);
    }

    function addStreetLamp(x, z, color = 0xfff0a8) {
      const lamp = new THREE.Group();
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.14, 3.2, 10), new THREE.MeshStandardMaterial({ color: 0x2a3343, roughness: 0.85 }));
      pole.position.y = 1.55;
      lamp.add(pole);
      const arm = new THREE.Mesh(new THREE.BoxGeometry(0.66, 0.08, 0.08), new THREE.MeshStandardMaterial({ color: 0x2a3343 }));
      arm.position.set(0.32, 2.95, 0);
      lamp.add(arm);
      const cage = new THREE.Mesh(new THREE.CylinderGeometry(0.27, 0.27, 0.58, 8, 1, true), new THREE.MeshStandardMaterial({ color: 0x101721, metalness: 0.35, roughness: 0.6 }));
      cage.position.set(0.62, 2.94, 0);
      cage.rotation.z = Math.PI / 2;
      lamp.add(cage);
      const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.3, 14, 10), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.84 }));
      bulb.position.set(0.62, 3.25, 0);
      lamp.add(bulb);
      const glow = new THREE.Mesh(new THREE.SphereGeometry(0.72, 16, 10), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.14 }));
      glow.position.set(0.62, 3.25, 0);
      lamp.add(glow);
      const point = new THREE.PointLight(color, 0.52, 9, 2);
      point.position.set(0.62, 3.25, 0);
      lamp.add(point);
      lamp.position.set(x, 0, z);
      scene.add(lamp);
      props.push(lamp);
      flickerLights.push({ light: point, glow, bulb, phase: Math.random() * Math.PI * 2, base: 0.48 + Math.random() * 0.12 });
    }

    function addBarrel(x, z, color = 0x7b1111) {
      const barrel = new THREE.Group();
      const body = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.5, 1.1, 16), new THREE.MeshStandardMaterial({ color, roughness: 0.7 }));
      body.position.y = 0.55;
      barrel.add(body);
      const bandMat = new THREE.MeshBasicMaterial({ color: 0xffd166 });
      for (const y of [0.25, 0.85]) {
        const band = new THREE.Mesh(new THREE.TorusGeometry(0.47, 0.035, 8, 18), bandMat);
        band.rotation.x = Math.PI / 2;
        band.position.y = y;
        barrel.add(band);
      }
      barrel.position.set(x, 0, z);
      scene.add(barrel);
      addCollider(x, z, 0.9, 0.9);
    }

    function addFloorStripe(x, z, w, d, color = 0xffd166) {
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 96;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#121212';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = 'rgba(255,197,45,0.8)';
      for (let i = -canvas.height; i < canvas.width; i += 48) {
        ctx.beginPath();
        ctx.moveTo(i, canvas.height);
        ctx.lineTo(i + 28, canvas.height);
        ctx.lineTo(i + canvas.height + 28, 0);
        ctx.lineTo(i + canvas.height, 0);
        ctx.closePath();
        ctx.fill();
      }
      ctx.fillStyle = 'rgba(255,255,255,0.16)';
      for (let i = 0; i < 160; i++) {
        const dot = 0.6 + Math.random() * 1.1;
        ctx.fillRect(Math.random() * canvas.width, Math.random() * canvas.height, dot, dot);
      }
      const stripeTexture = new THREE.CanvasTexture(canvas);
      stripeTexture.wrapS = THREE.RepeatWrapping;
      stripeTexture.wrapT = THREE.RepeatWrapping;
      stripeTexture.repeat.set(Math.max(1, w / 5), Math.max(1, d / 2.2));
      stripeTexture.colorSpace = THREE.SRGBColorSpace;
      const stripe = new THREE.Mesh(
        new THREE.PlaneGeometry(w, d),
        new THREE.MeshStandardMaterial({
          map: stripeTexture,
          color,
          roughness: 0.74,
          metalness: 0.08,
          emissive: new THREE.Color(color).multiplyScalar(0.11),
          emissiveIntensity: 0.45,
          transparent: true,
          opacity: 0.52,
          side: THREE.DoubleSide
        })
      );
      stripe.rotation.x = -Math.PI / 2;
      stripe.position.set(x, 0.065, z);
      scene.add(stripe);
      return stripe;
    }

    function addPoster(text, x, y, z, side = 'south', bgColor = '#ff2d2d') {
      const canvas = document.createElement('canvas');
      canvas.width = 256;
      canvas.height = 160;
      const ctx = canvas.getContext('2d');
      const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
      grad.addColorStop(0, bgColor);
      grad.addColorStop(1, '#1b2230');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = 'rgba(255,255,255,0.09)';
      for (let i = 0; i < 24; i++) {
        const h = 2 + Math.random() * 6;
        ctx.fillRect(0, Math.random() * canvas.height, canvas.width, h);
      }
      ctx.fillStyle = '#ffd45a';
      ctx.beginPath();
      ctx.arc(128, 60, 30, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#1f1f1f';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(116, 60);
      ctx.lineTo(122, 60);
      ctx.moveTo(134, 60);
      ctx.lineTo(140, 60);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(128, 70, 10, 0.15, Math.PI - 0.15);
      ctx.stroke();
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 22px Impact';
      ctx.textAlign = 'center';
      ctx.fillText('PLAYCARE', 128, 110);
      ctx.fillStyle = '#ffebc2';
      ctx.font = '700 18px Arial';
      ctx.fillText(text, 128, 136);
      ctx.strokeStyle = 'rgba(255,255,255,0.85)';
      ctx.lineWidth = 6;
      ctx.strokeRect(6, 6, 244, 148);
      ctx.strokeStyle = 'rgba(18,22,32,0.9)';
      ctx.lineWidth = 2;
      ctx.strokeRect(12, 12, 232, 136);

      const texture = new THREE.CanvasTexture(canvas);
      texture.colorSpace = THREE.SRGBColorSpace;
      const poster = new THREE.Mesh(
        new THREE.PlaneGeometry(3.2, 2),
        new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide })
      );
      poster.position.set(x, y, z);
      if (side === 'north') poster.rotation.y = Math.PI;
      if (side === 'east') poster.rotation.y = -Math.PI / 2;
      if (side === 'west') poster.rotation.y = Math.PI / 2;
      scene.add(poster);
      return poster;
    }

    function addDonut(x, z, y = 0.75, flavor = 0xff9bd2) {
      const donut = new THREE.Group();
      const dough = new THREE.Mesh(
        new THREE.TorusGeometry(0.42, 0.14, 10, 24),
        new THREE.MeshStandardMaterial({ color: 0xc47a28, roughness: 0.55 })
      );
      dough.rotation.x = Math.PI / 2;
      donut.add(dough);

      const icing = new THREE.Mesh(
        new THREE.TorusGeometry(0.43, 0.045, 8, 24),
        new THREE.MeshBasicMaterial({ color: flavor })
      );
      icing.rotation.x = Math.PI / 2;
      icing.position.y = 0.06;
      donut.add(icing);

      const sparkle = new THREE.Mesh(
        new THREE.SphereGeometry(0.08, 8, 8),
        new THREE.MeshBasicMaterial({ color: 0xffffff })
      );
      sparkle.position.set(0.26, 0.16, 0.04);
      donut.add(sparkle);

      donut.position.set(x, y, z);
      donut.userData.baseY = y;
      scene.add(donut);
      donuts.push({ mesh: donut, x, z, collected: false });
      return donut;
    }

    function addChest(x, z, rewardShards = 12, rewardXp = 18) {
      const chest = new THREE.Group();
      const base = new THREE.Mesh(
        new THREE.BoxGeometry(1.2, 0.65, 0.85),
        new THREE.MeshStandardMaterial({ color: 0x5b3417, roughness: 0.6 })
      );
      base.position.y = 0.34;
      chest.add(base);
      const lid = new THREE.Mesh(
        new THREE.BoxGeometry(1.22, 0.28, 0.88),
        new THREE.MeshStandardMaterial({ color: 0xa86628, roughness: 0.45 })
      );
      lid.position.y = 0.84;
      chest.add(lid);
      const band = new THREE.Mesh(
        new THREE.BoxGeometry(0.18, 0.94, 0.92),
        new THREE.MeshBasicMaterial({ color: 0xffd166 })
      );
      band.position.y = 0.5;
      chest.add(band);
      const glow = new THREE.Mesh(
        new THREE.CircleGeometry(1.2, 18),
        new THREE.MeshBasicMaterial({ color: 0x58d8ff, transparent: true, opacity: 0.16 })
      );
      glow.rotation.x = -Math.PI / 2;
      glow.position.y = 0.03;
      chest.add(glow);
      chest.position.set(x, 0, z);
      scene.add(chest);
      chests.push({ mesh: chest, x, z, opened: false, rewardShards, rewardXp });
      return chest;
    }

    function makeHellPortal(label, x, z, color = 0xff2a00) {
      const g = new THREE.Group();
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(1.55, 0.16, 12, 36),
        new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.9 })
      );
      ring.position.y = 2.2;
      g.add(ring);

      const core = new THREE.Mesh(
        new THREE.CircleGeometry(1.28, 32),
        new THREE.MeshBasicMaterial({ color: 0x2b0000, transparent: true, opacity: 0.62, side: THREE.DoubleSide })
      );
      core.position.y = 2.2;
      g.add(core);

      const innerRing = new THREE.Mesh(
        new THREE.TorusGeometry(0.92, 0.045, 8, 28),
        new THREE.MeshBasicMaterial({ color: 0xffd166, transparent: true, opacity: 0.75 })
      );
      innerRing.position.y = 2.2;
      g.add(innerRing);

      const sparks = new THREE.Group();
      const sparkMat = new THREE.MeshBasicMaterial({ color: 0xffd166 });
      for (let i = 0; i < 18; i++) {
        const spark = new THREE.Mesh(new THREE.SphereGeometry(0.055, 6, 6), sparkMat);
        const angle = (i / 18) * Math.PI * 2;
        spark.position.set(Math.cos(angle) * 1.9, 2.2 + Math.sin(i * 1.7) * 0.9, Math.sin(angle) * 0.18);
        sparks.add(spark);
      }
      g.add(sparks);

      const base = new THREE.Mesh(
        new THREE.CircleGeometry(2.4, 32),
        new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.18 })
      );
      base.rotation.x = -Math.PI / 2;
      base.position.y = 0.04;
      g.add(base);

      const sign = makeNameSprite(label);
      sign.position.set(0, 4.15, 0);
      sign.scale.set(4.2, 0.8, 1);
      g.add(sign);

      g.position.set(x, 0, z);
      g.visible = false;
      g.userData.portalParts = { ring, core, innerRing, sparks, sign };
      scene.add(g);
      return g;
    }

    function makeCharacter(label, bodyColor, eyeColor = 0xffffff, extra = {}) {
      const g = new THREE.Group();
      const rig = { arms: [], legs: [], hands: [], feet: [], baseRotZ: [] };
      const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.48, 0.85, 5, 12), new THREE.MeshStandardMaterial({ color: bodyColor }));
      body.position.y = 1.42;
      if (extra.bodyScale) body.scale.set(extra.bodyScale.x ?? 1, extra.bodyScale.y ?? 1, extra.bodyScale.z ?? 1);
      g.add(body);
      const head = new THREE.Mesh(new THREE.SphereGeometry(0.58, 18, 14), new THREE.MeshStandardMaterial({ color: extra.headColor || 0xe8e8f0 }));
      head.position.y = 2.52;
      if (extra.headScale) head.scale.set(extra.headScale.x ?? 1, extra.headScale.y ?? 1, extra.headScale.z ?? 1);
      g.add(head);
      const eye1 = new THREE.Mesh(new THREE.SphereGeometry(0.09, 10, 8), new THREE.MeshBasicMaterial({ color: eyeColor }));
      eye1.position.set(-0.18, 2.58, 0.53);
      g.add(eye1);
      const eye2 = eye1.clone(); eye2.position.x = 0.18; g.add(eye2);
      const pupilMat = new THREE.MeshBasicMaterial({ color: 0x050505 });
      const pupil1 = new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 6), pupilMat);
      pupil1.position.set(-0.18, 2.58, 0.6);
      g.add(pupil1);
      const pupil2 = pupil1.clone(); pupil2.position.x = 0.18; g.add(pupil2);
      const nose = new THREE.Mesh(new THREE.SphereGeometry(0.08, 10, 8), new THREE.MeshStandardMaterial({ color: extra.headColor || 0xe8e8f0 }));
      nose.scale.set(0.9, 0.75, 1.35);
      nose.position.set(0, 2.44, 0.58);
      g.add(nose);
      const mouth = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.035, 0.035), new THREE.MeshBasicMaterial({ color: 0x111111 }));
      mouth.position.set(0, 2.27, 0.58);
      g.add(mouth);
      if (extra.mouthColor) mouth.material.color.set(extra.mouthColor);

      const earMat = new THREE.MeshStandardMaterial({ color: extra.headColor || 0xe8e8f0 });
      for (const side of [-1, 1]) {
        const ear = new THREE.Mesh(new THREE.SphereGeometry(0.11, 10, 8), earMat);
        ear.scale.set(0.7, 0.95, 0.5);
        ear.position.set(side * 0.53, 2.5, 0);
        g.add(ear);
      }

      const limbMat = new THREE.MeshStandardMaterial({ color: extra.limbColor || bodyColor, roughness: 0.62 });
      for (const side of [-1, 1]) {
        const arm = new THREE.Mesh(new THREE.CapsuleGeometry(0.11, 0.76, 4, 8), limbMat);
        arm.position.set(side * 0.58, 1.55, 0.02);
        arm.rotation.z = side * 0.26;
        g.add(arm);
        rig.arms.push(arm);
        rig.baseRotZ.push(arm.rotation.z);
        const hand = new THREE.Mesh(new THREE.SphereGeometry(0.14, 10, 8), new THREE.MeshStandardMaterial({ color: extra.headColor || 0xe8e8f0 }));
        hand.position.set(side * 0.7, 1.08, 0.05);
        g.add(hand);
        rig.hands.push(hand);
        const leg = new THREE.Mesh(new THREE.CapsuleGeometry(0.13, 0.62, 4, 8), new THREE.MeshStandardMaterial({ color: extra.legColor || 0x252535 }));
        leg.position.set(side * 0.22, 0.55, 0);
        g.add(leg);
        rig.legs.push(leg);
        const foot = new THREE.Mesh(new THREE.SphereGeometry(0.18, 10, 8), new THREE.MeshStandardMaterial({ color: extra.shoeColor || 0x111111 }));
        foot.scale.set(1.35, 0.5, 1.8);
        foot.position.set(side * 0.24, 0.16, 0.16);
        g.add(foot);
        rig.feet.push(foot);
      }
      if (extra.belly) {
        const belly = new THREE.Mesh(new THREE.SphereGeometry(0.34, 14, 10), new THREE.MeshStandardMaterial({ color: extra.bellyColor || 0xf5f5f5 }));
        belly.scale.set(1.12, 0.96, 0.7);
        belly.position.set(0, 1.25, 0.28);
        g.add(belly);
      }
      if (extra.shirtBand) {
        const band = new THREE.Mesh(new THREE.CylinderGeometry(0.52, 0.52, 0.42, 18, 1, true), new THREE.MeshStandardMaterial({ color: extra.shirtBandColor || 0xffffff }));
        band.rotation.z = Math.PI / 2;
        band.position.set(0, 1.52, 0);
        g.add(band);
      }
      if (extra.dress) {
        const dress = new THREE.Mesh(new THREE.ConeGeometry(0.56, 1.05, 18), new THREE.MeshStandardMaterial({ color: extra.dressColor || bodyColor }));
        dress.position.set(0, 1.02, 0);
        g.add(dress);
      }
      if (extra.pearls) {
        const pearlMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
        for (let i = 0; i < 7; i++) {
          const angle = -0.95 + i * 0.32;
          const pearl = new THREE.Mesh(new THREE.SphereGeometry(0.055, 8, 6), pearlMat);
          pearl.position.set(Math.sin(angle) * 0.3, 2.02 + Math.cos(angle) * 0.08, 0.42);
          g.add(pearl);
        }
      }
      if (extra.bow) {
        const bowMat = new THREE.MeshStandardMaterial({ color: extra.bowColor || 0x7cc7ff });
        for (const side of [-1, 1]) {
          const wing = new THREE.Mesh(new THREE.SphereGeometry(0.13, 10, 8), bowMat);
          wing.scale.set(1.1, 0.7, 0.45);
          wing.position.set(side * 0.16, 3.02, 0.42);
          g.add(wing);
        }
        const knot = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 6), bowMat);
        knot.position.set(0, 3.02, 0.44);
        g.add(knot);
      }
      if (extra.mustache) {
        const mustacheMat = new THREE.MeshStandardMaterial({ color: extra.mustacheColor || 0x111111 });
        for (const side of [-1, 1]) {
          const tuft = new THREE.Mesh(new THREE.SphereGeometry(0.09, 10, 8), mustacheMat);
          tuft.scale.set(1.35, 0.42, 0.55);
          tuft.position.set(side * 0.1, 2.36, 0.6);
          tuft.rotation.z = side * 0.4;
          g.add(tuft);
        }
      }
      if (extra.stubble) {
        const stubble = new THREE.Mesh(new THREE.SphereGeometry(0.4, 16, 10), new THREE.MeshStandardMaterial({ color: extra.stubbleColor || 0x7d7d7d, transparent: true, opacity: 0.42 }));
        stubble.scale.set(1.05, 0.48, 0.88);
        stubble.position.set(0, 2.24, 0.18);
        g.add(stubble);
      }
      if (extra.redNose) {
        const clownNose = new THREE.Mesh(new THREE.SphereGeometry(0.1, 12, 10), new THREE.MeshBasicMaterial({ color: 0xff3333 }));
        clownNose.position.set(0, 2.42, 0.68);
        g.add(clownNose);
      }
      if (extra.policeHat) {
        const hatMat = new THREE.MeshStandardMaterial({ color: extra.hatColor || 0x214caa });
        const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.52, 0.08, 18), hatMat);
        brim.position.set(0, 3.08, 0);
        g.add(brim);
        const crown = new THREE.Mesh(new THREE.CylinderGeometry(0.33, 0.39, 0.24, 18), hatMat);
        crown.position.set(0, 3.24, -0.02);
        g.add(crown);
        const badge = new THREE.Mesh(new THREE.CircleGeometry(0.08, 12), new THREE.MeshBasicMaterial({ color: 0xffd166 }));
        badge.position.set(0, 3.23, 0.33);
        g.add(badge);
      }
      if (extra.wings) {
        const wingMat = new THREE.MeshStandardMaterial({ color: extra.wingColor || bodyColor, transparent: true, opacity: 0.85 });
        const w1 = new THREE.Mesh(new THREE.CapsuleGeometry(0.12, 1.25, 4, 8), wingMat);
        w1.position.set(-0.8, 1.9, -0.2); w1.rotation.z = 0.35; g.add(w1);
        const w2 = w1.clone(); w2.position.x = 0.8; w2.rotation.z = -0.35; g.add(w2);
        const featherMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.42 });
        for (const side of [-1, 1]) {
          for (let i = 0; i < 3; i++) {
            const feather = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.42, 6), featherMat);
            feather.position.set(side * (0.86 + i * 0.1), 1.55 - i * 0.18, -0.34);
            feather.rotation.z = side * -0.45;
            g.add(feather);
          }
        }
      }
      if (extra.hair) {
        const hair = new THREE.Mesh(new THREE.SphereGeometry(0.5, 14, 8), new THREE.MeshStandardMaterial({ color: extra.hairColor || 0x111111 }));
        hair.scale.set(1, 0.32, 0.9);
        hair.position.y = 3.03; g.add(hair);
      }
      if (extra.tallHair) {
        const tallHair = new THREE.Mesh(new THREE.ConeGeometry(0.48, 1.35, 10), new THREE.MeshStandardMaterial({ color: extra.hairColor || 0x214caa }));
        tallHair.position.y = 3.55; g.add(tallHair);
      }
      if (extra.spikes) {
        const spikeMat = new THREE.MeshStandardMaterial({ color: extra.hairColor || bodyColor });
        for (let i = 0; i < 5; i++) {
          const spike = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.46, 6), spikeMat);
          spike.position.set(-0.42 + i * 0.21, 3.25, 0);
          g.add(spike);
        }
      }
      if (extra.clownHair) {
        const clownMat = new THREE.MeshStandardMaterial({ color: extra.hairColor || 0x2dd36f });
        for (const side of [-1, 1]) {
          const puff = new THREE.Mesh(new THREE.SphereGeometry(0.34, 14, 10), clownMat);
          puff.position.set(side * 0.62, 2.78, 0);
          g.add(puff);
          const puff2 = puff.clone();
          puff2.position.set(side * 0.5, 3.06, -0.08);
          puff2.scale.setScalar(0.82);
          g.add(puff2);
        }
      }
      if (extra.bobHair) {
        const bobMat = new THREE.MeshStandardMaterial({ color: extra.hairColor || 0xbf3b2f });
        for (let i = 0; i < 9; i++) {
          const angle = (i / 9) * Math.PI * 2;
          const dread = new THREE.Mesh(new THREE.CapsuleGeometry(0.1, 0.78, 4, 8), bobMat);
          dread.position.set(Math.cos(angle) * 0.48, 3.02 + Math.sin(i * 1.3) * 0.08, Math.sin(angle) * 0.34);
          dread.rotation.z = Math.cos(angle) * 0.55;
          dread.rotation.x = Math.sin(angle) * 0.35;
          g.add(dread);
        }
      }
      if (extra.homerHair) {
        const hairMat = new THREE.MeshBasicMaterial({ color: extra.hairColor || 0x2c1a10 });
        const arc = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.018, 4, 18, Math.PI * 0.9), hairMat);
        arc.position.set(0.12, 3.0, 0.08);
        arc.rotation.set(0.5, 0.3, 1.1);
        g.add(arc);
        for (const side of [-1, 1]) {
          const strand = new THREE.Mesh(new THREE.CapsuleGeometry(0.016, 0.28, 3, 6), hairMat);
          strand.position.set(side * 0.18, 2.88, -0.2);
          strand.rotation.z = side * 0.2;
          g.add(strand);
        }
      }
      if (extra.burnsHair) {
        const hairMat = new THREE.MeshBasicMaterial({ color: extra.hairColor || 0xd9d9d9 });
        for (const side of [-1, 1]) {
          const strand = new THREE.Mesh(new THREE.CapsuleGeometry(0.018, 0.22, 3, 6), hairMat);
          strand.position.set(side * 0.16, 2.95, -0.18);
          strand.rotation.z = side * 0.35;
          g.add(strand);
        }
      }
      const tag = makeNameSprite(label); tag.position.set(0, 3.75, 0); g.add(tag);
      g.userData.characterRig = rig;
      return g;
    }

    function spawnEntity(config) {
      const mesh = makeCharacter(config.name, config.color, config.eyeColor, config.visual || {});
      mesh.position.set(config.x, 0, config.z);
      if (config.scale) mesh.scale.setScalar(config.scale);
      scene.add(mesh);
      const defaultWanderRadius =
        config.wanderRadius ??
        (config.type === 'npc' ? 1.6 :
        config.type === 'unit' ? 1.2 :
        config.type === 'enemy' ? 1.05 :
        config.type === 'boss' || config.type === 'finalBoss' ? 0.85 : 0.9);
      const defaultWanderSpeed =
        config.wanderSpeed ??
        (config.type === 'npc' ? 0.55 :
        config.type === 'unit' ? 0.75 :
        config.type === 'enemy' ? 0.6 :
        config.type === 'boss' || config.type === 'finalBoss' ? 0.4 : 0.5);
      const entity = {
        ...config,
        mesh,
        baseY: 0,
        homeX: config.x,
        homeZ: config.z,
        wanderRadius: defaultWanderRadius,
        wanderSpeed: defaultWanderSpeed,
        wanderPhase: config.wanderPhase ?? Math.random() * Math.PI * 2,
        captured: false,
        defeated: false,
        talked: false,
        challengeRecruit: config.challengeRecruit ?? config.type === 'npc'
      };
      entities.push(entity);
      addZonePlate(config.x, config.z, config.zoneColor || 0xffffff);
      return entity;
    }

    function spawnSimpsonNpc(name, x, z, bodyColor, dialog, visual = {}, scale = 1) {
      const simpsonPresets = {
        'Homer Simpson': { belly: true, bodyScale: { x: 1.08, y: 1.05, z: 1.02 }, homerHair: true, stubble: true, legColor: 0x4b67c9, shoeColor: 0x3b3b3b },
        'Hell Homer': { belly: true, bodyScale: { x: 1.08, y: 1.05, z: 1.02 }, homerHair: true, stubble: true, legColor: 0x3b3b3b, shoeColor: 0x1b1b1b, mouthColor: 0xffd166 },
        'Bart Simpson': { bodyScale: { x: 0.94, y: 0.92, z: 0.92 }, spikes: true, legColor: 0x3c69d1, shoeColor: 0x2f6fff },
        'Lisa Simpson': { bodyScale: { x: 0.9, y: 0.9, z: 0.9 }, dress: true, dressColor: 0xff4d4d, pearls: true, spikes: true, legColor: 0xffd90f, shoeColor: 0xff5a1f },
        'Marge Simpson': { bodyScale: { x: 0.96, y: 1.06, z: 0.96 }, dress: true, dressColor: 0x77d8a6, pearls: true, tallHair: true, legColor: 0xffd90f, shoeColor: 0xff5a1f },
        'Maggie Simpson': { bodyScale: { x: 0.82, y: 0.76, z: 0.82 }, dress: true, dressColor: 0x8fd3ff, bow: true, bowColor: 0x8fd3ff, shoeColor: 0x7cc7ff, legColor: 0x8fd3ff },
        'Mr. Burns': { bodyScale: { x: 0.78, y: 1.02, z: 0.78 }, burnsHair: true, headScale: { x: 0.92, y: 0.96, z: 0.92 }, legColor: 0x1c4328, shoeColor: 0x111111 },
        'Krusty': { clownHair: true, redNose: true, bodyScale: { x: 1.02, y: 1.0, z: 1.0 }, shirtBand: true, shirtBandColor: 0x7dd9ff, legColor: 0xb56bca, shoeColor: 0x5b2d16 },
        'Chief Wiggum': { policeHat: true, belly: true, bellyColor: 0x6699ff, bodyScale: { x: 1.08, y: 1.04, z: 1.02 }, legColor: 0x234089, shoeColor: 0x1b1b1b },
        'Sideshow Bob': { bobHair: true, mustache: true, mustacheColor: 0x6a1c14, bodyScale: { x: 0.92, y: 1.06, z: 0.92 }, legColor: 0x224422, shoeColor: 0x2d1810 },
        'Moe': { mustache: true, mustacheColor: 0x333333, hair: true, bodyScale: { x: 0.96, y: 0.96, z: 0.96 }, legColor: 0x4f6c96, shoeColor: 0x2a1c16 },
        'Devil Flanders': { mustache: true, mustacheColor: 0x111111, bodyScale: { x: 0.95, y: 1.0, z: 0.95 }, legColor: 0x8a0f0f, shoeColor: 0x2a0a0a },
        'Itchy': { headScale: { x: 0.92, y: 0.96, z: 0.92 }, spikes: true, shoeColor: 0xffffff, legColor: 0x6fd6ff },
        'Scratchy': { headScale: { x: 1.02, y: 1.0, z: 0.92 }, hair: true, shoeColor: 0x666666, legColor: 0x222222 }
      };
      return spawnEntity({
        name,
        x,
        z,
        color: bodyColor,
        eyeColor: 0x111111,
        type: 'npc',
        zoneColor: 0xffd90f,
        scale,
        visual: { headColor: 0xffd90f, hairColor: 0x214caa, ...(simpsonPresets[name] || {}), ...visual },
        dialog
      });
    }

    function addGate(name, x, z, w, d, color, requirementText) {
      const mesh = new THREE.Mesh(
        new THREE.BoxGeometry(w, 4, d),
        new THREE.MeshStandardMaterial({ color, transparent: true, opacity: 0.7 })
      );
      mesh.position.set(x, 2, z);
      scene.add(mesh);
      const horizontal = w >= d;
      const frameMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.32 });
      for (const side of [-1, 1]) {
        const frame = new THREE.Mesh(
          new THREE.BoxGeometry(horizontal ? 0.18 : 0.42, 4.35, horizontal ? d + 0.5 : 0.18),
          frameMat
        );
        frame.position.set(x + (horizontal ? side * w / 2 : 0), 2.15, z + (horizontal ? 0 : side * d / 2));
        scene.add(frame);
      }
      const gate = { name, x, z, w, d, mesh, open: false, requirementText };
      gates.push(gate);
      colliders.push({ x, z, w, d, gate });
      return gate;
    }

    const gate1 = addGate('Blue Gate', 0, -8, 2, 12, 0x58d8ff, 'Vang Uzi en Cyn om de blauwe security gate te openen.');
    const gate2 = addGate('Orange Gate', 52, 0, 12, 2, 0xff9d22, 'Versla J om de oranje wing te openen.');
    const gate3 = addGate('Green Gate', 8, 52, 14, 2, 0x72ffc1, 'Versla de Sentinel en open de eindhal.');

    const uziEntity = spawnEntity({ name: 'Uzi', x: -56, z: -48, color: 0x7a2cff, eyeColor: 0xffffff, type: 'unit', zoneColor: 0x7a2cff, dialog: ['Dus jij bent de nieuwkomer.', 'Deze playplace voelt niet veilig.', 'Vang me dan als je durft.'] });
    const cynEntity = spawnEntity({ name: 'Cyn', x: -20, z: -48, color: 0xffa126, eyeColor: 0x111111, type: 'unit', zoneColor: 0xffa126, dialog: ['Oh.', 'Deze hal ademt foute plannen.', 'Dat is mijn soort sfeer.'] });
    const workerEntity = spawnEntity({ name: 'Worker Drone', x: -42, z: 4, color: 0x78d9ff, eyeColor: 0x0f0f0f, type: 'enemy', zoneColor: 0x78d9ff, battleUnit: 'Worker Drone', dialog: ['Geen toegang.', 'Speelgebied gesloten.', 'Geen toegang.'] });
    const vEntity = spawnEntity({ name: 'V', x: 20, z: -2, color: 0xff5b84, eyeColor: 0xffffff, type: 'unit', zoneColor: 0xff5b84, visual: { wings: true, wingColor: 0xff7aa1 }, dialog: ['Eindelijk iets interessants.', 'Deze zaal heeft tenminste stijl.', 'Maar vooruit, ik loop mee.'] });
    const jEntity = spawnEntity({ name: 'J', x: 60, z: -34, color: 0xd7d7d7, eyeColor: 0x111111, type: 'boss', zoneColor: 0xd7d7d7, battleUnit: 'J', visual: { wings: true, wingColor: 0xd7d7d7 }, dialog: ['Je bent ver gekomen in dit gebouw.', 'Dat stopt in mijn wing.'] });
    const sentinelEntity = spawnEntity({ name: 'Sentinel', x: 60, z: 34, color: 0x65ffb8, eyeColor: 0x111111, type: 'boss', zoneColor: 0x65ffb8, battleUnit: 'Sentinel', scale: 1.15, dialog: ['Target acquired.', 'Facility lockdown active.'] });
    const nEntity = spawnEntity({ name: 'N', x: 8, z: 60, color: 0xffeb69, eyeColor: 0x111111, type: 'finalBoss', zoneColor: 0xffeb69, scale: 1.18, visual: { wings: true, wingColor: 0xffeb69, hair: true, hairColor: 0x222222 }, battleUnit: 'N', dialog: ['You actually made it to the archive.', 'That means this ends one of two ways.', 'Try me.'] });
    const guideEntity = spawnEntity({ name: 'Signal', x: -68, z: -8, color: 0x99aaff, eyeColor: 0xffffff, type: 'npc', zoneColor: 0x99aaff, scale: 0.9, dialog: ['Welkom in het Play Lab Complex.', 'Vang Uzi en Cyn in de west wing.', 'Daarna gaat de eerste security gate open.'] });

    spawnSimpsonNpc('Homer Simpson', -70, -40, 0xf4f4f4, ['Doh.', 'Ik zocht snacks en kwam in een indoor nightmare terecht.', 'Als jij de exit vindt, ik ren mee.'], { hairColor: 0x4a2a10 }, 1.05);
    spawnSimpsonNpc('Bart Simpson', -28, -58, 0xff6a21, ['Ay caramba.', 'Deze gangen zien eruit alsof je er niet mag rennen.', 'Dus ik wil juist rennen.'], { hairColor: 0xffd90f }, 0.86);
    spawnSimpsonNpc('Lisa Simpson', 22, -58, 0xff4d4d, ['Deze faciliteit is ontworpen als een psychologische val.', 'Dat verklaart de kleuren.', 'En de glimlachende borden.'], { hairColor: 0xffd90f }, 0.82);
    spawnSimpsonNpc('Marge Simpson', -70, 18, 0x77d8a6, ['Hmmm.', 'Iedereen blijft bij elkaar in deze speelhal.', 'Daar vertrouw ik mezelf al amper mee.'], { hairColor: 0x214caa }, 1.12);
    spawnSimpsonNpc('Maggie Simpson', 66, 20, 0x8fd3ff, ['*speengeluid*', 'Ze wijst naar de groene eindhal.', 'Misschien weet zij meer dan wij.'], { hairColor: 0xffd90f }, 0.62);
    spawnSimpsonNpc('Mr. Burns', 62, -18, 0x2b8b57, ['Excellent.', 'Een kindercomplex met beveiliging en paniek.', 'Dat noem ik schaalbaar design.'], { hairColor: 0xd9d9d9 }, 0.9);
    spawnSimpsonNpc('Krusty', -68, 42, 0x7dd9ff, ['Hey hey.', 'Ik dacht dat dit mijn nieuwe indoor showplek was.', 'Blijkt het een nightmare maze. Ook goed.'], { hairColor: 0x2dd36f }, 1.02);
    spawnSimpsonNpc('Chief Wiggum', 10, 68, 0x6ea7ff, ['Dit archief is nu officieel politieterrein.', 'Tenzij het eng piept.', 'Dan wacht ik hier wel.'], { hairColor: 0x214caa }, 1);

    addBuilding({
      name: 'Snack Atrium',
      x: -68,
      z: 42,
      w: 18,
      d: 16,
      wallColor: 0xf0b62d,
      floorColor: 0x6a4330,
      trimColor: 0xff5e4d,
      doorSide: 'south',
      doorWidth: 6
    });
    addCounter(-68, 46, 10, 1.1, 0xff5e4d);
    addCounter(-74, 40.5, 2.2, 3.6, 0x2d74ff);
    addCounter(-62, 40.5, 2.2, 3.6, 0x2d74ff);
    addTableSet(-73, 47.5, 0xfff0a8);
    addTableSet(-63, 47.5, 0xfff0a8);
    addPoster('SNACK TIME', -68, 2.35, 34.45, 'south');
    addPoster('PLAY', -77.55, 2.35, 42, 'west', '#2d74ff');
    addPoster('SMILE', -58.45, 2.35, 42, 'east', '#2d74ff');

    const circusStair = addStairway('Show Deck', 20, -28, 7, 8, 0.8, 2.4, 0xb52c67, 'De show trap naar het upper deck staat klaar.');
    addBuilding({
      name: 'Show Hall',
      x: 20,
      z: -58,
      w: 24,
      d: 16,
      wallColor: 0xb52c67,
      floorColor: 0x3e1835,
      trimColor: 0xfff0a8,
      doorSide: 'north',
      doorWidth: 7
    });
    addCounter(20, -53.5, 12, 1.1, 0xfff0a8);
    addTableSet(14, -61, 0xb52c67);
    addTableSet(26, -61, 0xb52c67);
    addPoster('SHOW', 7.55, 2.35, -58, 'west', '#b52c67');
    addPoster('LAUGH', 32.45, 2.35, -58, 'east', '#b52c67');
    addFloorStripe(20, -46, 14, 1.1, 0xfff0a8);

    addPlatform(-6, 7.2, -10, 16, 1, 16, 0x3e1835);
    addPlatform(-20, 7.2, -10, 12, 1, 12, 0x1f3654);
    addPlatform(8, 7.2, -10, 12, 1, 12, 0x3f4b16);

    const gangleEntity = spawnEntity({ name: 'Gangle', x: -18, z: -10, color: 0xffffff, eyeColor: 0x111111, type: 'npc', zoneColor: 0xffffff, scale: 0.95, visual: { headColor: 0xf6f6f6, hair: true, hairColor: 0xd11f4f }, dialog: ['...oh.', 'Dus jij hebt het upper deck gevonden.', 'Ik hoopte dat niemand deze route kende.'] });
    gangleEntity.mesh.position.y = 7.2;
    gangleEntity.baseY = 7.2;

    const jaxEntity = spawnEntity({ name: 'Jax', x: 8, z: -10, color: 0x8b5cf6, eyeColor: 0x111111, type: 'npc', zoneColor: 0x8b5cf6, scale: 1.02, visual: { headColor: 0xe9e1ff, hair: true, hairColor: 0x6a35db }, dialog: ['Huh. Nog iemand.', 'Deze hele plek schreeuwt valstrik.', 'Best leuk eigenlijk.'] });
    jaxEntity.mesh.position.y = 7.2;
    jaxEntity.baseY = 7.2;

    const pomniEntity = spawnEntity({ name: 'Pomni', x: -6, z: -16, color: 0xd7263d, eyeColor: 0xffffff, type: 'unit', zoneColor: 0xd7263d, scale: 0.98, visual: { headColor: 0xfff0f0, hair: true, hairColor: 0x1b4fa5 }, dialog: ['Wacht, jij komt niet van hier.', 'Deze hele verdieping maakt me nerveus.', 'Maar goed... ik ga mee.'] });
    pomniEntity.mesh.position.y = 7.2;
    pomniEntity.baseY = 7.2;

    const itchyEntity = spawnSimpsonNpc('Itchy', -22, -2, 0x6fd6ff, ['Heh heh.', 'Een indoor doolhof met foute mascotte-vibes.', 'Perfect.'], { hairColor: 0x6fd6ff }, 0.68);
    itchyEntity.mesh.position.y = 7.2;
    itchyEntity.baseY = 7.2;
    const scratchyEntity = spawnSimpsonNpc('Scratchy', 10, -2, 0x222222, ['Miauw.', 'Deze verdieping voelt veel te vrolijk voor wat hier misgaat.', 'Dat maakt het erger.'], { hairColor: 0x222222 }, 0.92);
    scratchyEntity.mesh.position.y = 7.2;
    scratchyEntity.baseY = 7.2;

    const hellPortal = makeHellPortal('Portaal naar de Hel', 8, 70, 0xff2a00);
    const hellReturnPortal = makeHellPortal('Terug uit de Hel', 74, -68, 0xffb000);
    hellReturnPortal.visible = true;
    addPlatform(74, 0.16, -72, 22, 0.3, 22, 0x3a0505);
    addWall(74, -84, 26, 6, 2, 0x6f0909);
    addWall(74, -60, 26, 6, 2, 0x6f0909);
    addWall(62, -72, 2, 6, 26, 0x6f0909);
    addWall(86, -72, 2, 6, 26, 0x6f0909);
    addWall(64, -80, 2, 5, 8, 0x5a0808);
    addWall(84, -80, 2, 5, 8, 0x5a0808);
    addWall(58, -66, 8, 5, 2, 0x5a0808);
    addWall(90, -66, 8, 5, 2, 0x5a0808);
    for (const p of [[66, -74], [82, -74], [66, -62], [82, -62]]) addPillar(p[0], p[1], 0x7b1111);
    for (const p of [[60, -72], [88, -72], [74, -84], [74, -58]]) addLavaPool(p[0], p[1], 2.4);
    for (const p of [[62, -76], [86, -76], [62, -60], [86, -60], [70, -82], [78, -82]]) addFlame(p[0], p[1], 1.1);
    for (const p of [[66, -80], [82, -80], [66, -64], [82, -64]]) addBarrel(p[0], p[1], 0x4d1111);
    addFloorStripe(74, -72, 15, 1.1, 0xff3b00);
    addFloorStripe(74, -68, 12, 0.8, 0xffd166);
    addStreetLamp(63, -59, 0xff4a1c);
    addStreetLamp(85, -59, 0xff4a1c);
    spawnSimpsonNpc('Devil Flanders', 74, -62, 0xcc1f1f, ['Hi-diddly-ho, sinnerino.', 'Je hebt iedereen verzameld en verslagen.', 'Dat is netjes. Angstaanjagend netjes.'], { hairColor: 0x111111, wings: true, wingColor: 0x7a0000 }, 1.08);
    spawnSimpsonNpc('Hell Homer', 68, -72, 0x2b0000, ['Mmm... verboden donut.', 'De hel is warm, maar de snacks zijn verrassend goed.', 'Niet aan Marge vertellen.'], { headColor: 0xffd90f, hairColor: 0x4a2a10 }, 1.08);
    spawnSimpsonNpc('Sideshow Bob', 80, -72, 0x2e8b57, ['At last, a stage worthy of melodrama.', 'The rake budget here is unforgivable.', 'Still, the flames have presence.'], { hairColor: 0xbf3b2f }, 1.06);
    spawnSimpsonNpc('Moe', 74, -80, 0x8c7a5e, ['Welkom in Moe zijn Helbar.', 'We serveren alleen lauwe cola en spijt.', 'Dus ja, best druk.'], { hairColor: 0x333333 }, 0.94);
    addPoster('HELL DEAL', 74, 2.8, -59.45, 'south');
    addPoster('HOT BURGER', 61.45, 2.6, -72, 'west');
    addPoster('NO REFUNDS', 86.55, 2.6, -72, 'east');

    for (const d of [
      [-68, 34, 0.75, 0xff9bd2], [-58, -48, 0.75, 0xffd166], [-22, -58, 0.75, 0x9fffe0],
      [22, -58, 0.75, 0xff9bd2], [60, -34, 0.75, 0xffd166], [10, 68, 0.75, 0x9fffe0],
      [-6, -16, 8.0, 0xff9bd2], [-18, -10, 8.0, 0xffd166], [8, -10, 8.0, 0x9fffe0],
      [68, -72, 0.9, 0xff5a1f], [80, -72, 0.9, 0xffd166], [74, -80, 0.9, 0xff9bd2]
    ]) {
      addDonut(d[0], d[1], d[2], d[3]);
    }
    addChest(-64, 8, 10, 18);
    addChest(22, -52, 14, 22);
    addChest(56, 44, 18, 28);
    addChest(-14, -4, 20, 32);
    addChest(74, -60, 24, 36);

    const units = {
      Uzi: {
        name: 'Uzi', maxHp: 118, hp: 118, attack: 24, defense: 10, speed: 14,
        moves: [
          { name: 'Rail Shot', power: 28, text: 'Uzi vuurt een keiharde rail blast.' },
          { name: 'Glitch Slash', power: 20, text: 'Uzi snijdt door vervormde code.' },
          { name: 'Overclock', power: 0, heal: 18, text: 'Uzi forceert een snelle recalibratie.' }
        ]
      },
      Cyn: {
        name: 'Cyn', maxHp: 112, hp: 112, attack: 20, defense: 13, speed: 11,
        moves: [
          { name: 'Corrupt Touch', power: 24, text: 'Cyn injecteert corruptie.' },
          { name: 'Puppet String', power: 18, text: 'Cyn trekt de vijand uit balans.' },
          { name: 'Recompile', power: 0, heal: 22, text: 'Cyn herschrijft haar schade.' }
        ]
      },
      V: {
        name: 'V', maxHp: 124, hp: 124, attack: 26, defense: 11, speed: 15,
        moves: [
          { name: 'Wing Cut', power: 26, text: 'V duikt hard naar voren.' },
          { name: 'Rip Drive', power: 19, text: 'V scheurt met precisie door het doel.' },
          { name: 'Reboot Bite', power: 0, heal: 20, text: 'V bijt terug en stabiliseert.' }
        ]
      },
      Pomni: {
        name: 'Pomni', maxHp: 116, hp: 116, attack: 22, defense: 12, speed: 16,
        moves: [
          { name: 'Circus Dash', power: 24, text: 'Pomni rent in paniek recht door de vijand heen.' },
          { name: 'Jester Glitch', power: 20, text: 'Pomni laat het circus kort haperen.' },
          { name: 'Deep Breath', power: 0, heal: 20, text: 'Pomni ademt in en vindt net genoeg moed terug.' }
        ]
      },
      'Worker Drone': {
        name: 'Worker Drone', maxHp: 78, hp: 78, attack: 12, defense: 8, speed: 8,
        moves: [
          { name: 'Zap', power: 12, text: 'Een zwakke stroomstoot.' },
          { name: 'Panel Hit', power: 10, text: 'Een slordige mechanische klap.' },
          { name: 'Patch', power: 0, heal: 10, text: 'Een noodpatch herstelt wat HP.' }
        ]
      },
      J: {
        name: 'J', maxHp: 132, hp: 132, attack: 18, defense: 11, speed: 13,
        moves: [
          { name: 'Executive Strike', power: 22, text: 'J slaat strak en efficiënt toe.' },
          { name: 'Command Lash', power: 18, text: 'J dwingt controle af.' },
          { name: 'Polish', power: 0, heal: 16, text: 'J herstelt gecontroleerd schade.' }
        ]
      },
      Sentinel: {
        name: 'Sentinel', maxHp: 145, hp: 145, attack: 20, defense: 12, speed: 12,
        moves: [
          { name: 'Lock Jaw', power: 24, text: 'De Sentinel klapt toe.' },
          { name: 'Leap Bite', power: 20, text: 'Een agressieve sprongaanval.' },
          { name: 'Auto Repair', power: 0, heal: 18, text: 'Interne systemen herstellen schade.' }
        ]
      },
      N: {
        name: 'N', maxHp: 168, hp: 168, attack: 20, defense: 11, speed: 14,
        moves: [
          { name: 'Wing Rush', power: 20, text: 'N stormt direct naar voren.' },
          { name: 'Tail Sweep', power: 18, text: 'N maait de ruimte schoon.' },
          { name: 'Repair Loop', power: 0, heal: 16, text: 'N herstelt zichzelf gedeeltelijk.' }
        ]
      }
    };

    const game = {
      team: [],
      mode: 'creator',
      activeBattle: null,
      activeCatch: null,
      dialogLines: [],
      dialogSpeaker: '',
      dialogOnComplete: null,
      gate1Opened: false,
      gate2Opened: false,
      gate3Opened: false,
      workerDefeated: false,
      jDefeated: false,
      sentinelDefeated: false,
      circusUnlocked: false,
      inCircus: false,
      inHell: false,
      hellPortalUnlocked: false,
      donutsCollected: 0,
      donutsTotal: donuts.length,
      shards: 0,
      xp: 0,
      level: 1,
      winStreak: 0,
      finalDefeated: false,
      devGodMode: false,
      devNoClip: false,
      devFast: false
    };

    const player = { x: -68, y: PLAYER_EYE_HEIGHT, z: -8, yaw: Math.PI * 0.5, pitch: 0, speed: 0.13, stamina: 100, sprinting: false, vy: 0, grounded: true, dashCooldownMs: 0 };
    const playerProfile = {
      name: 'Glitch Runner',
      skin: 'light',
      outfit: 'violet',
      hairStyle: 'short',
      hairColor: 'black',
      extra: 'none'
    };
    const creatorPalette = {
      skin: { light: 0xf0d7c3, warm: 0xd8a07f, tan: 0xb87a57, deep: 0x6c4332 },
      outfit: { violet: 0x7a2cff, cyan: 0x44d7ff, crimson: 0xd7263d, gold: 0xe5b938, midnight: 0x2b3158 },
      hair: { black: 0x111111, brown: 0x4b2a17, blue: 0x3d6bff, pink: 0xff57b3, green: 0x2dd36f, white: 0xf4f4f4 }
    };
    const cameraState = { thirdPerson: false, worldZoom: 4.8, minZoom: 2.8, maxZoom: 9.5 };
    const creatorState = { yaw: Math.PI, zoom: 6.6 };
    const vrState = { supported: false, checked: false, active: false };
    const vrInput = {
      moveForward: 0,
      moveStrafe: 0,
      sprint: false,
      selectHeld: false,
      prevButtons: { anyTrigger: false, anyDash: false, anyJump: false },
      snapTurnCooldownMs: 0,
      debug: { sources: 0, gamepads: 0, stdPads: 0, activeAxes: 0, activeButtons: 0 }
    };
    const vrHands = { left: null, right: null };
    const xrWorldOffset = { enabled: false };
    let playerAvatar = null;
    const keys = {};
    const mouseMove = { forward: false, backward: false };
    let pointerLocked = false;

    const crosshairEl = document.getElementById('crosshair');
    const versionEl = document.getElementById('version');
    const vrStatusTopEl = document.getElementById('vrStatusTop');
    const messageEl = document.getElementById('message');
    const teamEl = document.getElementById('team');
    const progressEl = document.getElementById('progress');
    const donutsEl = document.getElementById('donuts');
    const statusEl = document.getElementById('status');
    const hintEl = document.getElementById('hint');
    const areaBannerEl = document.getElementById('areaBanner');
    const objectiveEl = document.getElementById('objective');
    const statsEl = document.getElementById('stats');
    const creatorUI = document.getElementById('creatorUI');
    const creatorNameInput = document.getElementById('creatorName');
    const creatorSkinInput = document.getElementById('creatorSkin');
    const creatorOutfitInput = document.getElementById('creatorOutfit');
    const creatorHairStyleInput = document.getElementById('creatorHairStyle');
    const creatorHairColorInput = document.getElementById('creatorHairColor');
    const creatorExtraInput = document.getElementById('creatorExtra');
    const creatorRotateLeftBtn = document.getElementById('creatorRotateLeft');
    const creatorRotateRightBtn = document.getElementById('creatorRotateRight');
    const creatorZoomOutBtn = document.getElementById('creatorZoomOut');
    const creatorZoomInBtn = document.getElementById('creatorZoomIn');
    const creatorStartBtn = document.getElementById('creatorStart');
    if (versionEl) versionEl.textContent = GAME_VERSION;
    document.title = 'Glitch Hunt 3D Extended ' + GAME_VERSION;
    const vrButtonEl = document.getElementById('vrButton');
    const dialogEl = document.getElementById('dialog');
    const dialogNameEl = document.getElementById('dialogName');
    const dialogTextEl = document.getElementById('dialogText');
    const catchUI = document.getElementById('catchUI');
    const catchTitleEl = document.getElementById('catchTitle');
    const catchRingEl = document.getElementById('catchRing');
    const catchBallEl = document.getElementById('catchBall');
    const catchTextEl = document.getElementById('catchText');
    const battleUI = document.getElementById('battleUI');
    const playerNameEl = document.getElementById('playerName');
    const enemyNameEl = document.getElementById('enemyName');
    const playerStatsEl = document.getElementById('playerStats');
    const enemyStatsEl = document.getElementById('enemyStats');
    const playerHpBar = document.getElementById('playerHpBar');
    const enemyHpBar = document.getElementById('enemyHpBar');
    const battleLog = document.getElementById('battleLog');
    const move1Btn = document.getElementById('move1');
    const move2Btn = document.getElementById('move2');
    const move3Btn = document.getElementById('move3');
    const reserveButtons = document.getElementById('reserveButtons');
    const devPanel = document.getElementById('devPanel');
    const devToggle = document.getElementById('devToggle');
    const devChecks = {
      teamUzi: document.getElementById('devTeamUzi'),
      teamCyn: document.getElementById('devTeamCyn'),
      teamV: document.getElementById('devTeamV'),
      teamPomni: document.getElementById('devTeamPomni'),
      worker: document.getElementById('devDefeatedWorker'),
      j: document.getElementById('devDefeatedJ'),
      sentinel: document.getElementById('devDefeatedSentinel'),
      n: document.getElementById('devDefeatedN'),
      godMode: document.getElementById('devGodMode'),
      noClip: document.getElementById('devNoClip'),
      fast: document.getElementById('devFast')
    };
    let lastAreaName = '';
    let areaBannerUntil = 0;
    let lastAnimateTime = 0;
    const worldCycle = {
      phase: 'day',
      cycleIndex: 0,
      dayCount: 1,
      worldTimeMs: 0,
      lastFrameTime: null,
      initialized: false
    };

    function cloneUnit(name) {
      return JSON.parse(JSON.stringify(units[name]));
    }

    function setMessage(text) { messageEl.textContent = text; }

    function getPlayerVisual() {
      const skinColor = creatorPalette.skin[playerProfile.skin] ?? creatorPalette.skin.light;
      const outfitColor = creatorPalette.outfit[playerProfile.outfit] ?? creatorPalette.outfit.violet;
      const hairColor = creatorPalette.hair[playerProfile.hairColor] ?? creatorPalette.hair.black;
      const visual = {
        headColor: skinColor,
        limbColor: skinColor,
        legColor: 0x252535,
        shoeColor: 0x111111,
        hairColor
      };

      if (playerProfile.hairStyle === 'short') visual.hair = true;
      else if (playerProfile.hairStyle === 'spikes') visual.spikes = true;
      else if (playerProfile.hairStyle === 'tall') visual.tallHair = true;
      else if (playerProfile.hairStyle === 'bob') visual.bobHair = true;

      if (playerProfile.extra === 'wings') {
        visual.wings = true;
        visual.wingColor = outfitColor;
      } else if (playerProfile.extra === 'bow') {
        visual.bow = true;
        visual.bowColor = hairColor;
      } else if (playerProfile.extra === 'hat') {
        visual.policeHat = true;
        visual.hatColor = outfitColor;
      } else if (playerProfile.extra === 'nose') {
        visual.redNose = true;
      }

      return { outfitColor, visual };
    }

    function rebuildPlayerAvatar() {
      if (playerAvatar) scene.remove(playerAvatar);
      const { outfitColor, visual } = getPlayerVisual();
      playerAvatar = makeCharacter((playerProfile.name || 'Glitch Runner').trim(), outfitColor, 0xffffff, visual);
      playerAvatar.position.set(player.x, getGroundHeightAt(player.x, player.z), player.z);
      playerAvatar.rotation.y = creatorState.yaw;
      playerAvatar.visible = game.mode === 'creator';
      scene.add(playerAvatar);
    }

    function syncCreatorInputs() {
      creatorNameInput.value = playerProfile.name;
      creatorSkinInput.value = playerProfile.skin;
      creatorOutfitInput.value = playerProfile.outfit;
      creatorHairStyleInput.value = playerProfile.hairStyle;
      creatorHairColorInput.value = playerProfile.hairColor;
      creatorExtraInput.value = playerProfile.extra;
    }

    function readCreatorInputs() {
      playerProfile.name = (creatorNameInput.value || 'Glitch Runner').trim().slice(0, 18) || 'Glitch Runner';
      playerProfile.skin = creatorSkinInput.value;
      playerProfile.outfit = creatorOutfitInput.value;
      playerProfile.hairStyle = creatorHairStyleInput.value;
      playerProfile.hairColor = creatorHairColorInput.value;
      playerProfile.extra = creatorExtraInput.value;
      rebuildPlayerAvatar();
    }

    function setCreatorMode(active) {
      creatorUI.style.display = active ? 'flex' : 'none';
      crosshairEl.style.display = active ? 'none' : 'block';
      hintEl.style.display = 'none';
      if (active) document.exitPointerLock();
      if (playerAvatar) playerAvatar.visible = active;
    }

    function finishCreator() {
      readCreatorInputs();
      game.mode = 'world';
      setCreatorMode(false);
      worldCycle.worldTimeMs = 0;
      worldCycle.lastFrameTime = null;
      worldCycle.cycleIndex = 0;
      worldCycle.phase = 'day';
      worldCycle.dayCount = 1;
      worldCycle.initialized = false;
      lastAnimateTime = 0;
      setMessage(playerProfile.name + ' is klaar. Klik in het scherm om te starten en praat eerst met Signal in de reception wing.');
    }

    function setupCreator() {
      syncCreatorInputs();
      rebuildPlayerAvatar();
      setCreatorMode(true);
      setMessage('Maak eerst je personage en druk daarna op Start avontuur.');
    }

    function ensureRecruitUnit(entity) {
      if (units[entity.name]) return;
      const hardBonus = entity.baseY > 3 || entity.name.includes('Hell') || entity.name.includes('Devil') ? 22 : 12;
      const namePower = Math.min(18, entity.name.length);
      units[entity.name] = {
        name: entity.name,
        maxHp: 142 + hardBonus + namePower,
        hp: 142 + hardBonus + namePower,
        attack: 24 + Math.floor(hardBonus / 5),
        defense: 13 + Math.floor(namePower / 5),
        speed: 11 + (namePower % 6),
        moves: [
          { name: 'Hard Hit', power: 27 + Math.floor(hardBonus / 4), text: entity.name + ' gaat er vol voor.' },
          { name: 'Chaos Move', power: 22 + Math.floor(namePower / 3), text: entity.name + ' gebruikt pure chaos.' },
          { name: 'Second Wind', power: 0, heal: 24, text: entity.name + ' weigert op te geven.' }
        ]
      };
    }

    function isRecruitableNpc(entity) {
      return entity.type === 'npc' && entity.challengeRecruit;
    }

    function getCaptureDifficulty(entity) {
      const captureMap = {
        Uzi: 0.58,
        Cyn: 0.6,
        V: 0.68,
        Pomni: 0.64
      };
      return captureMap[entity.name] ?? 0.62;
    }

    function hasFullTeam() {
      return ['Uzi', 'Cyn', 'V', 'Pomni'].every(name => game.team.includes(name));
    }

    function allEnemiesDefeated() {
      return game.workerDefeated && game.jDefeated && game.sentinelDefeated && game.finalDefeated;
    }

    function canOpenHellPortal() {
      return hasFullTeam() && allEnemiesDefeated();
    }

    function xpNeededForLevel(level = game.level) {
      return 60 + (level - 1) * 35;
    }

    function updateStatsHUD() {
      const dashReady = player.dashCooldownMs <= 0 ? 'Dash klaar' : 'Dash ' + (player.dashCooldownMs / 1000).toFixed(1) + 's';
      statsEl.textContent = 'Level ' + game.level + ' | XP ' + game.xp + ' / ' + xpNeededForLevel() + ' | Shards ' + game.shards + ' | Streak ' + game.winStreak + ' | ' + dashReady;
    }

    function awardProgress(xp, shards, reason) {
      game.xp += xp;
      game.shards += shards;
      let leveled = false;
      while (game.xp >= xpNeededForLevel()) {
        game.xp -= xpNeededForLevel();
        game.level += 1;
        player.speed += 0.006;
        player.stamina = Math.min(100, player.stamina + 20);
        leveled = true;
      }
      updateStatsHUD();
      if (leveled) setMessage(reason + ' Level up! Je bent nu level ' + game.level + '.');
    }

    function updateTeamUI() {
      teamEl.textContent = game.team.length ? 'Team: ' + game.team.join(', ') : 'Team: nog leeg';
    }

    function updateFunHUD() {
      donutsEl.textContent = 'Donuts: ' + game.donutsCollected + ' / ' + game.donutsTotal;
      const staminaText = Math.round(player.stamina);
      const mood = game.inHell ? 'Hel-hitte' : game.inCircus ? 'Circus-chaos' : game.hellPortalUnlocked ? 'Eindspel' : 'Verkennen';
      const speedText = player.sprinting ? 'Turbo' : 'Cruise';
      const camText = cameraState.thirdPerson ? 'Camera: third-person' : 'Camera: first-person';
      const vrText = vrState.active ? 'VR: aan' : 'VR: uit';
      statusEl.textContent = 'Stamina: ' + staminaText + '% | Status: ' + mood + ' | Tempo: ' + speedText + ' | ' + camText + ' | ' + vrText + ' | C = camera | Shift = sprint | F = dash' + getVrDebugSuffix();
      updateStatsHUD();
    }

    function getVrAvailabilityIssue() {
      if (!window.isSecureContext) return 'Geen secure context: gebruik HTTPS of localhost.';
      if (!navigator.xr) return 'WebXR API ontbreekt (navigator.xr is niet beschikbaar).';
      if (vrState.checked && !vrState.supported) return 'Headset/browser meldt nu geen immersive-vr support.';
      return '';
    }

    function updateVrButtonState() {
      if (!vrButtonEl) return;
      const issue = getVrAvailabilityIssue();
      vrButtonEl.disabled = false;
      if (issue) {
        vrButtonEl.textContent = 'VR probleem: tik voor uitleg';
        return;
      }
      vrButtonEl.disabled = false;
      vrButtonEl.textContent = vrState.active ? 'Verlaat VR' : 'Speel in VR';
    }

    async function setupVR() {
      updateVrButtonState();
      if (!navigator.xr) {
        setMessage('VR detectie: navigator.xr ontbreekt. Open de game in Quest Browser via een HTTPS-link.');
        return;
      }
      try {
        vrState.supported = await navigator.xr.isSessionSupported('immersive-vr');
        vrState.checked = true;
        if (!vrState.supported) setMessage('VR detectie: immersive-vr is niet bevestigd. Je kunt de VR-knop alsnog proberen.');
      } catch {
        vrState.supported = false;
        vrState.checked = true;
        setMessage('VR detectie gaf een fout. Je kunt de VR-knop alsnog proberen.');
      }
      updateVrButtonState();
    }

    async function toggleVR() {
      const issue = getVrAvailabilityIssue();
      if (issue) {
        const protocol = location.protocol || 'onbekend protocol';
        const host = location.host || 'onbekende host';
        setMessage('VR niet beschikbaar: ' + issue + ' (URL: ' + protocol + '//' + host + ')');
        return;
      }
      if (!navigator.xr) {
        setMessage('Deze browser heeft geen WebXR API.');
        return;
      }
      if (!window.isSecureContext) {
        setMessage('VR werkt alleen via HTTPS (of localhost), niet via een onveilige URL.');
        return;
      }
      if (renderer.xr.isPresenting) {
        const session = renderer.xr.getSession();
        if (session) await session.end();
        return;
      }
      try {
        if (game.mode === 'creator') finishCreator();
        const session = await navigator.xr.requestSession('immersive-vr', {
          optionalFeatures: ['local-floor', 'bounded-floor']
        });
        await renderer.xr.setSession(session);
      } catch (err) {
        const detail = err?.message || 'onbekende fout';
        setMessage('VR starten mislukt: ' + detail + '. Open de game in Quest Browser via een HTTPS-link.');
      }
    }

    function syncPlayerFromXR() {
      const xrCam = renderer.xr.getCamera(camera);
      if (!xrCam) return;
      const dir = new THREE.Vector3();
      xrCam.getWorldDirection(dir);
      player.yaw = Math.atan2(-dir.x, -dir.z);
      player.pitch = Math.asin(Math.max(-1, Math.min(1, dir.y)));
      // Some runtimes report y near 0 in immersive sessions; keep gameplay eye height stable.
      player.y = Math.max(PLAYER_EYE_HEIGHT, xrCam.position.y || 0);
    }

    function setupVrHands() {
      const makeHand = (color) => {
        const hand = new THREE.Group();
        const palm = new THREE.Mesh(
          new THREE.SphereGeometry(0.035, 10, 10),
          new THREE.MeshStandardMaterial({ color, roughness: 0.5, metalness: 0.15 })
        );
        const pointer = new THREE.Mesh(
          new THREE.CylinderGeometry(0.009, 0.012, 0.07, 8),
          new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4, metalness: 0.2 })
        );
        pointer.rotation.x = -Math.PI / 2;
        pointer.position.z = 0.045;
        hand.add(palm);
        hand.add(pointer);
        hand.visible = false;
        return hand;
      };

      const leftController = renderer.xr.getControllerGrip(0);
      const rightController = renderer.xr.getControllerGrip(1);
      vrHands.left = makeHand(0x59b7ff);
      vrHands.right = makeHand(0xff8fb1);
      leftController.add(vrHands.left);
      rightController.add(vrHands.right);
      scene.add(leftController);
      scene.add(rightController);
    }

    function axisWithDeadzone(value, deadzone = 0.08) {
      if (Math.abs(value) < deadzone) return 0;
      return value;
    }

    function getVrDebugSuffix() {
      if (!renderer.xr.isPresenting) return '';
      const d = vrInput.debug;
      return ' | VRin: src ' + d.sources + ' gp ' + d.gamepads + ' std ' + d.stdPads + ' ax ' + d.activeAxes + ' btn ' + d.activeButtons;
    }

    function updateVrStatusTop() {
      if (!vrStatusTopEl) return;
      if (!renderer.xr.isPresenting) {
        vrStatusTopEl.style.display = 'none';
        vrStatusLabel.sprite.visible = false;
        return;
      }
      vrStatusTopEl.style.display = 'block';
      const d = vrInput.debug;
      const moveX = vrInput.moveStrafe.toFixed(2);
      const moveY = vrInput.moveForward.toFixed(2);
      const text = 'VR input | src ' + d.sources + ' gp ' + d.gamepads + ' std ' + d.stdPads + ' ax ' + d.activeAxes + ' btn ' + d.activeButtons + ' | move X ' + moveX + ' Y ' + moveY + (vrInput.selectHeld ? ' | SELECT' : '');
      vrStatusTopEl.textContent = text;

      vrStatusLabel.sprite.visible = true;
      const ctx = vrStatusLabel.ctx;
      ctx.clearRect(0, 0, vrStatusLabel.canvas.width, vrStatusLabel.canvas.height);
      ctx.fillStyle = 'rgba(10,14,22,0.92)';
      ctx.fillRect(0, 0, vrStatusLabel.canvas.width, vrStatusLabel.canvas.height);
      ctx.strokeStyle = 'rgba(255,214,122,0.68)';
      ctx.lineWidth = 4;
      ctx.strokeRect(2, 2, vrStatusLabel.canvas.width - 4, vrStatusLabel.canvas.height - 4);
      ctx.fillStyle = '#ffe9c9';
      ctx.font = '700 42px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, vrStatusLabel.canvas.width / 2, vrStatusLabel.canvas.height / 2);
      vrStatusLabel.texture.needsUpdate = true;
    }

    function updateVrControllers(deltaMs) {
      vrInput.moveForward = 0;
      vrInput.moveStrafe = 0;
      vrInput.sprint = false;
      vrInput.snapTurnCooldownMs = Math.max(0, vrInput.snapTurnCooldownMs - deltaMs);
      vrInput.debug.sources = 0;
      vrInput.debug.gamepads = 0;
      vrInput.debug.stdPads = 0;
      vrInput.debug.activeAxes = 0;
      vrInput.debug.activeButtons = 0;

      const session = renderer.xr.getSession();
      if (!session) return;

      let moveFromLeft = null;
      let moveBest = null;
      let turnBestX = 0;
      let anyTriggerPressed = false;
      let anyDashPressed = false;
      let anyJumpPressed = false;
      const absorbPad = (gp, handed = 'none') => {
        if (!gp) return;
        const buttons = gp.buttons || [];
        const axes = gp.axes || [];
        const pair01 = { x: axisWithDeadzone(axes[0] ?? 0), y: axisWithDeadzone(axes[1] ?? 0) };
        const pair23 = { x: axisWithDeadzone(axes[2] ?? 0), y: axisWithDeadzone(axes[3] ?? 0) };
        const pair01Power = Math.abs(pair01.x) + Math.abs(pair01.y);
        const pair23Power = Math.abs(pair23.x) + Math.abs(pair23.y);
        const moveCandidate = pair23Power > pair01Power ? pair23 : pair01;
        const triggerPressed = !!buttons[0]?.pressed;
        const primaryPressed = !!buttons[4]?.pressed;
        const secondaryPressed = !!buttons[5]?.pressed;
        const stickPressed = !!buttons[3]?.pressed;
        const facePressed = !!buttons[2]?.pressed;
        const sprintPressed = !!buttons[1]?.pressed;
        const movePower = Math.abs(moveCandidate.x) + Math.abs(moveCandidate.y);
        if (movePower > 0.05) vrInput.debug.activeAxes += 1;
        for (const b of buttons) {
          if (b?.pressed) {
            vrInput.debug.activeButtons += 1;
            break;
          }
        }
        if (!moveBest || movePower > (Math.abs(moveBest.x) + Math.abs(moveBest.y))) moveBest = moveCandidate;
        if (handed === 'left') moveFromLeft = moveCandidate;
        if (handed === 'right' && Math.abs(moveCandidate.x) > Math.abs(turnBestX)) turnBestX = moveCandidate.x;
        anyTriggerPressed = anyTriggerPressed || triggerPressed;
        anyDashPressed = anyDashPressed || primaryPressed;
        anyJumpPressed = anyJumpPressed || secondaryPressed || stickPressed || facePressed;
        vrInput.sprint = vrInput.sprint || sprintPressed;
      };
      for (const source of session.inputSources) {
        if (!source) continue;
        vrInput.debug.sources += 1;
        if (!source.gamepad) continue;
        vrInput.debug.gamepads += 1;
        absorbPad(source.gamepad, source.handedness || 'none');
      }

      // Quest fallback: some browser paths expose controller input only via Gamepad API.
      if (!moveBest && navigator.getGamepads) {
        const pads = navigator.getGamepads();
        for (const gp of pads) {
          if (!gp || !gp.connected) continue;
          const id = (gp.id || '').toLowerCase();
          const likelyVrPad = id.includes('oculus') || id.includes('openxr') || id.includes('xr') || id.includes('touch');
          if (!likelyVrPad) continue;
          vrInput.debug.stdPads += 1;
          absorbPad(gp, 'none');
        }
      }

      const locomotion = moveFromLeft || moveBest || { x: 0, y: 0 };
      // Boost low analog ranges so subtle stick values still result in visible movement.
      vrInput.moveStrafe = Math.max(-1, Math.min(1, locomotion.x * 2.2));
      vrInput.moveForward = Math.max(-1, Math.min(1, locomotion.y * 2.2));
      if (Math.abs(locomotion.y) > 0.88) vrInput.sprint = true;

      if (!moveFromLeft && Math.abs(turnBestX) < 0.001 && moveBest) turnBestX = moveBest.x;
      if (Math.abs(turnBestX) > 0.7 && vrInput.snapTurnCooldownMs <= 0) {
        player.yaw -= Math.sign(turnBestX) * 0.45;
        vrInput.snapTurnCooldownMs = 220;
      }

      if (anyTriggerPressed && !vrInput.prevButtons.anyTrigger) interact();
      vrInput.prevButtons.anyTrigger = anyTriggerPressed;
      if (anyDashPressed && !vrInput.prevButtons.anyDash) activateDash();
      vrInput.prevButtons.anyDash = anyDashPressed;
      if (anyJumpPressed && !vrInput.prevButtons.anyJump) jumpPlayer();
      vrInput.prevButtons.anyJump = anyJumpPressed;
    }

    function updateProgress() {
      const parts = [];
      if (game.team.includes('Uzi')) parts.push('Uzi');
      if (game.team.includes('Cyn')) parts.push('Cyn');
      if (game.gate1Opened) parts.push('Gate A open');
      if (game.workerDefeated) parts.push('Worker verslagen');
      if (game.team.includes('V')) parts.push('V');
      if (game.circusUnlocked) parts.push('Circus trap');
      if (game.team.includes('Pomni')) parts.push('Pomni');
      if (game.jDefeated) parts.push('J verslagen');
      if (game.gate2Opened) parts.push('Gate B open');
      if (game.sentinelDefeated) parts.push('Sentinel verslagen');
      if (game.gate3Opened) parts.push('Core open');
      if (game.finalDefeated) parts.push('N verslagen');
      if (game.hellPortalUnlocked) parts.push(game.inHell ? 'In de Hel' : 'Hel-portaal open');
      progressEl.textContent = 'Voortgang: ' + (parts.length ? parts.join(' -> ') : 'Startgebied');
    }

    function isProtectedFromCorruption(entity) {
      return ['Signal', 'Uzi', 'Cyn', 'V', 'Pomni', 'Worker Drone', 'J', 'Sentinel', 'N'].includes(entity.name);
    }

    function addCorruptionPatch(x, z, radius) {
      const patch = new THREE.Group();
      const pool = new THREE.Mesh(
        new THREE.CircleGeometry(radius, 28),
        new THREE.MeshBasicMaterial({ color: 0x280038, transparent: true, opacity: 0.4 })
      );
      pool.rotation.x = -Math.PI / 2;
      patch.add(pool);

      const core = new THREE.Mesh(
        new THREE.CircleGeometry(radius * 0.55, 24),
        new THREE.MeshBasicMaterial({ color: 0x6a00ff, transparent: true, opacity: 0.34 })
      );
      core.rotation.x = -Math.PI / 2;
      core.position.y = 0.02;
      patch.add(core);

      for (let i = 0; i < 7; i++) {
        const spike = new THREE.Mesh(
          new THREE.ConeGeometry(0.16 + Math.random() * 0.12, 0.8 + Math.random() * 0.8, 6),
          new THREE.MeshStandardMaterial({ color: 0x0f0619, emissive: 0x4b00aa, emissiveIntensity: 0.7 })
        );
        const angle = (i / 7) * Math.PI * 2;
        const dist = radius * (0.35 + Math.random() * 0.4);
        spike.position.set(Math.cos(angle) * dist, 0.3, Math.sin(angle) * dist);
        patch.add(spike);
      }

      patch.position.set(x, 0.03, z);
      scene.add(patch);
      const entry = { x, z, radius, mesh: patch };
      corruptionPatches.push(entry);
      return entry;
    }

    function pointInCorruption(x, z) {
      return corruptionPatches.some((patch) => {
        const dx = x - patch.x;
        const dz = z - patch.z;
        return Math.sqrt(dx * dx + dz * dz) <= patch.radius;
      });
    }

    function deleteEntityByCorruption(entity) {
      if (!entity.mesh.visible || entity.captured || entity.defeated || entity.corruptedDeleted || isProtectedFromCorruption(entity)) return false;
      entity.corruptedDeleted = true;
      entity.defeated = true;
      entity.mesh.visible = false;
      setMessage('De corruptie slokt ' + entity.name + ' op.');
      return true;
    }

    function spawnDailyCorruption() {
      const radius = Math.min(8.5, 2.8 + worldCycle.dayCount * 0.55);
      let x = 0;
      let z = 0;
      for (let tries = 0; tries < 16; tries++) {
        x = -WORLD_HALF + 14 + Math.random() * (WORLD_SIZE - 28);
        z = -WORLD_HALF + 14 + Math.random() * (WORLD_SIZE - 28);
        if (Math.abs(z - 28) < 10) continue;
        if (Math.abs(x - 74) < 12 && Math.abs(z + 72) < 12) continue;
        break;
      }
      const patch = addCorruptionPatch(x, z, radius);
      let removedCount = 0;
      for (const entity of entities) {
        const dx = entity.mesh.position.x - patch.x;
        const dz = entity.mesh.position.z - patch.z;
        if (Math.sqrt(dx * dx + dz * dz) <= patch.radius + 0.4) {
          if (deleteEntityByCorruption(entity)) removedCount++;
        }
      }
      setMessage('Dag ' + worldCycle.dayCount + ': de wereld corrumpeert verder' + (removedCount ? ' en wist ' + removedCount + ' figuur' + (removedCount === 1 ? '' : 'en') + '.' : '.'));
    }

    function updateDayNightCycle(time) {
      if (game.mode !== 'world') {
        worldCycle.lastFrameTime = time;
        return;
      }
      if (worldCycle.lastFrameTime == null) worldCycle.lastFrameTime = time;
      const delta = Math.max(0, time - worldCycle.lastFrameTime);
      worldCycle.lastFrameTime = time;
      worldCycle.worldTimeMs += delta;

      if (!worldCycle.initialized) {
        worldCycle.initialized = true;
        spawnDailyCorruption();
      }

      const cycleIndex = Math.floor(worldCycle.worldTimeMs / DAY_NIGHT_MS);
      const phase = cycleIndex % 2 === 0 ? 'day' : 'night';
      if (cycleIndex !== worldCycle.cycleIndex) {
        worldCycle.cycleIndex = cycleIndex;
        if (phase === 'night') {
          worldCycle.phase = 'night';
          setMessage('De nacht valt. De wereld wordt onrustig.');
        } else {
          worldCycle.phase = 'day';
          worldCycle.dayCount += 1;
          spawnDailyCorruption();
        }
      } else {
        worldCycle.phase = phase;
      }
    }

    function getCurrentAreaName() {
      if (game.inHell) return 'Incinerator Depths';
      if (game.inCircus) return 'Toy Theater Deck';
      if (distanceToPoint(-68, -8) < 16) return 'Reception Tunnel';
      if (distanceToPoint(-40, -48) < 24) return 'Blue Maintenance Wing';
      if (distanceToPoint(20, -38) < 22) return 'Showroom Corridor';
      if (distanceToPoint(60, 0) < 26) return 'Security Processing';
      if (distanceToPoint(8, 58) < 24) return 'Archive Vault';
      if (distanceToPoint(-68, 42) < 20) return 'Cafeteria Atrium';
      return 'Playcare Facility';
    }

    function updateAreaBanner(time) {
      const areaName = getCurrentAreaName();
      if (areaName !== lastAreaName) {
        lastAreaName = areaName;
        areaBannerEl.textContent = areaName;
        areaBannerUntil = time + 2600;
      }
      areaBannerEl.classList.toggle('show', game.mode === 'world' && time < areaBannerUntil);
    }

    function updateObjective() {
      let objective = 'Praat met Signal om je route te leren';
      if (!game.team.includes('Uzi')) objective = 'Vang Uzi';
      else if (!game.team.includes('Cyn')) objective = 'Vang Cyn';
      else if (!game.team.includes('V')) objective = 'Versla de Worker Drone en pak V';
      else if (!game.team.includes('Pomni')) objective = game.inCircus ? 'Zoek en vang Pomni' : 'Ga via de circus-trap omhoog';
      else if (!game.jDefeated) objective = 'Versla J';
      else if (!game.sentinelDefeated) objective = 'Versla Sentinel';
      else if (!game.finalDefeated) objective = 'Daag N uit';
      else if (!game.hellPortalUnlocked) objective = 'Verzamel iedereen om de Hel te openen';
      else if (chests.some((chest) => !chest.opened)) objective = 'Zoek treasure caches en farm shards';
      else objective = game.inHell ? 'Overleef de Hel en verken alles' : 'Ga door het portaal naar de Hel';
      objectiveEl.textContent = 'Objective: ' + objective;
    }

    function maybeOpenGates() {
      if (!game.gate1Opened && game.team.includes('Uzi') && game.team.includes('Cyn')) openGate(gate1, 'Gate A opent. De volgende sector is nu bereikbaar.');
      if (!game.circusUnlocked && game.team.includes('Uzi') && game.team.includes('Cyn') && game.team.includes('V')) {
        game.circusUnlocked = true;
        setStairVisible(circusStair, true);
        setMessage('Er schuift een show trap open naar het upper deck.');
      }
      if (!game.gate2Opened && game.jDefeated) openGate(gate2, 'Gate B opent. Het kerngebied ligt nu open.');
      if (!game.gate3Opened && game.sentinelDefeated) openGate(gate3, 'De Core Gate opent. N wacht verderop.');
      if (!game.hellPortalUnlocked && canOpenHellPortal()) {
        game.hellPortalUnlocked = true;
        hellPortal.visible = true;
        setMessage('Alles is compleet. Er scheurt een portaal naar de Hel open bij N.');
      }
      updateProgress();
      syncDevMenu();
    }

    function setGateState(gate, open) {
      gate.open = open;
      gate.mesh.visible = !open;
    }

    function openGate(gate, text) {
      setGateState(gate, true);
      setMessage(text);
    }

    function syncWorldFromState() {
      uziEntity.captured = game.team.includes('Uzi');
      cynEntity.captured = game.team.includes('Cyn');
      vEntity.captured = game.team.includes('V');
      pomniEntity.captured = game.team.includes('Pomni');
      uziEntity.mesh.visible = !uziEntity.captured;
      cynEntity.mesh.visible = !cynEntity.captured;
      vEntity.mesh.visible = !vEntity.captured;
      pomniEntity.mesh.visible = !pomniEntity.captured;
      for (const entity of entities) {
        if (!isRecruitableNpc(entity)) continue;
        entity.captured = game.team.includes(entity.name);
        entity.mesh.visible = !entity.captured;
        if (entity.captured) ensureRecruitUnit(entity);
      }

      workerEntity.defeated = game.workerDefeated;
      jEntity.defeated = game.jDefeated;
      sentinelEntity.defeated = game.sentinelDefeated;
      nEntity.defeated = game.finalDefeated;
      workerEntity.mesh.visible = !workerEntity.defeated;
      jEntity.mesh.visible = !jEntity.defeated;
      sentinelEntity.mesh.visible = !sentinelEntity.defeated;
      nEntity.mesh.visible = !nEntity.defeated;

      game.gate1Opened = game.team.includes('Uzi') && game.team.includes('Cyn');
      game.circusUnlocked = game.team.includes('Uzi') && game.team.includes('Cyn') && game.team.includes('V');
      game.gate2Opened = game.jDefeated;
      game.gate3Opened = game.sentinelDefeated;
      game.hellPortalUnlocked = canOpenHellPortal();
      if (game.inCircus && !game.circusUnlocked) {
        game.inCircus = false;
        player.x = 18;
        player.y = PLAYER_EYE_HEIGHT;
        player.z = 26;
        resetVerticalMotion();
        player.pitch = 0;
      }
      setGateState(gate1, game.gate1Opened);
      setGateState(gate2, game.gate2Opened);
      setGateState(gate3, game.gate3Opened);
      setStairVisible(circusStair, game.circusUnlocked);
      hellPortal.visible = game.hellPortalUnlocked;
      hellReturnPortal.visible = true;
      player.speed = game.devFast ? 0.28 : 0.13;
      updateTeamUI();
      updateProgress();
      updateObjective();
      updateFunHUD();
      syncDevMenu();
    }

    function syncDevMenu() {
      devChecks.teamUzi.checked = game.team.includes('Uzi');
      devChecks.teamCyn.checked = game.team.includes('Cyn');
      devChecks.teamV.checked = game.team.includes('V');
      devChecks.teamPomni.checked = game.team.includes('Pomni');
      devChecks.worker.checked = game.workerDefeated;
      devChecks.j.checked = game.jDefeated;
      devChecks.sentinel.checked = game.sentinelDefeated;
      devChecks.n.checked = game.finalDefeated;
      devChecks.godMode.checked = game.devGodMode;
      devChecks.noClip.checked = game.devNoClip;
      devChecks.fast.checked = game.devFast;
    }

    function showDialog(name, lines, onComplete = null) {
      game.mode = 'dialog';
      dialogEl.style.display = 'block';
      dialogNameEl.textContent = name;
      game.dialogSpeaker = name;
      game.dialogLines = [...lines];
      game.dialogOnComplete = onComplete;
      dialogTextEl.textContent = game.dialogLines.shift() || '';
      document.exitPointerLock();
    }

    function advanceDialog() {
      if (game.mode !== 'dialog') return;
      if (game.dialogLines.length > 0) {
        dialogTextEl.textContent = game.dialogLines.shift();
      } else {
        dialogEl.style.display = 'none';
        game.mode = 'world';
        setMessage(game.dialogSpeaker + ' is klaar.');
        const done = game.dialogOnComplete;
        game.dialogOnComplete = null;
        if (done) done();
      }
    }

    function makeZoneGlow(x, z, color) {
      const m = new THREE.Mesh(new THREE.CircleGeometry(3, 24), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.13 }));
      m.rotation.x = -Math.PI / 2;
      m.position.set(x, 0.03, z);
      scene.add(m);
    }

    for (const e of entities) makeZoneGlow(e.x, e.z, e.zoneColor || 0xffffff);

    function collides(nx, nz) {
      if (game.devNoClip) return null;
      if (game.inCircus) return null;
      const playerSize = 0.45;
      for (const c of colliders) {
        if (c.gate && c.gate.open) continue;
        const halfW = c.w / 2 + playerSize;
        const halfD = c.d / 2 + playerSize;
        if (Math.abs(nx - c.x) < halfW && Math.abs(nz - c.z) < halfD) return c;
      }
      return null;
    }

    function containsSurfacePoint(surface, x, z) {
      const margin = 0.38;
      return Math.abs(x - surface.x) <= surface.w / 2 + margin && Math.abs(z - surface.z) <= surface.d / 2 + margin;
    }

    function getWalkableSurfaces() {
      const surfaces = [{ x: 0, z: 0, w: WORLD_SIZE, d: WORLD_SIZE, top: 0, visibleMesh: null }];
      for (const platform of platforms) surfaces.push(platform.userData.walkSurface);
      for (const stair of stairways) {
        for (const mesh of stair.meshes) surfaces.push(mesh.userData.walkSurface);
        surfaces.push(stair.pad.userData.walkSurface);
      }
      return surfaces.filter(surface => !surface.visibleMesh || surface.visibleMesh.visible);
    }

    function getGroundHeightAt(x, z, maxTop = Infinity) {
      let ground = 0;
      for (const surface of getWalkableSurfaces()) {
        if (surface.top <= maxTop && surface.top >= ground && containsSurfacePoint(surface, x, z)) ground = surface.top;
      }
      return ground;
    }

    function updatePlayerLayer() {
      game.inCircus = player.y > PLAYER_EYE_HEIGHT + 4;
    }

    function resetVerticalMotion() {
      player.vy = 0;
      player.grounded = true;
    }

    function clickedGameUI(target) {
      return !!target.closest('#creatorUI, #ui, #devToggle, #devPanel, #dialog, #battleUI, #catchUI');
    }

    function jumpPlayer() {
      if (!player.grounded || game.devNoClip) return;
      player.vy = JUMP_SPEED;
      player.grounded = false;
    }

    function enterCircus() {
      game.inCircus = true;
      player.x = -6;
      player.y = 8.8;
      player.z = -10;
      resetVerticalMotion();
      player.yaw = Math.PI;
      player.pitch = 0;
      setMessage('Je stapt de show trap op en landt op het upper deck.');
    }

    function leaveCircus() {
      game.inCircus = false;
      player.x = 20;
      player.y = PLAYER_EYE_HEIGHT;
      player.z = -22;
      resetVerticalMotion();
      player.yaw = Math.PI;
      player.pitch = 0;
      setMessage('Je bent terug in de hoofdhal van het Play Lab Complex.');
    }

    function lockPointer() { renderer.domElement.requestPointerLock(); }
    renderer.domElement.addEventListener('click', () => {
      if (game.mode === 'creator') return;
      if (game.mode === 'world' && !pointerLocked) lockPointer();
      else if (game.mode === 'dialog') advanceDialog();
      else if (game.mode === 'catch') throwCatchOrb();
    });
    renderer.domElement.addEventListener('contextmenu', (e) => e.preventDefault());

    document.addEventListener('mousedown', (e) => {
      if (clickedGameUI(e.target)) return;
      if (game.mode !== 'world') return;
      if (!pointerLocked) lockPointer();
      if (e.button === 0) mouseMove.forward = true;
      if (e.button === 2) mouseMove.backward = true;
    });

    document.addEventListener('mouseup', (e) => {
      if (e.button === 0) mouseMove.forward = false;
      if (e.button === 2) mouseMove.backward = false;
    });

    document.addEventListener('pointerlockchange', () => {
      pointerLocked = document.pointerLockElement === renderer.domElement;
      if (!pointerLocked) {
        mouseMove.forward = false;
        mouseMove.backward = false;
      }
    });

    document.addEventListener('mousemove', (e) => {
      if (!pointerLocked || game.mode !== 'world') return;
      player.yaw -= e.movementX * 0.0022;
      player.pitch -= e.movementY * 0.0018;
      player.pitch = Math.max(-1.2, Math.min(1.2, player.pitch));
    });

    document.addEventListener('keydown', (e) => {
      const k = e.key.toLowerCase();
      keys[k] = true;
      if (e.key === '`') { toggleDevPanel(); return; }
      if (game.mode === 'creator') {
        const activeTag = document.activeElement?.tagName || '';
        const typingInCreatorField = creatorUI.contains(document.activeElement) && ['INPUT', 'SELECT', 'TEXTAREA'].includes(activeTag);
        if (typingInCreatorField && k !== 'enter') return;
        if (k === 'enter') { finishCreator(); return; }
        if (k === 'a' || k === 'arrowleft') creatorState.yaw += 0.16;
        if (k === 'd' || k === 'arrowright') creatorState.yaw -= 0.16;
        if (k === 'q') creatorState.zoom = Math.min(9.5, creatorState.zoom + 0.35);
        if (k === 'e') creatorState.zoom = Math.max(3.4, creatorState.zoom - 0.35);
        return;
      }

      if (game.mode === 'dialog' && (k === 'e' || e.key === ' ' || e.key === 'enter')) { advanceDialog(); return; }
      if (game.mode === 'catch' && (e.key === ' ' || k === 'enter')) { e.preventDefault(); throwCatchOrb(); return; }
      if (game.mode === 'world' && k === 'e') interact();
      if (game.mode === 'world' && k === 'c') {
        if (renderer.xr.isPresenting) {
          setMessage('Camera wisselen is uitgeschakeld tijdens VR.');
          return;
        }
        cameraState.thirdPerson = !cameraState.thirdPerson;
        if (!cameraState.thirdPerson && !pointerLocked) lockPointer();
        setMessage(cameraState.thirdPerson ? 'Third-person camera actief. Gebruik muiswiel om te zoomen.' : 'First-person camera actief.');
        return;
      }
      if (game.mode === 'world' && k === 'f') { activateDash(); return; }
      if (game.mode === 'world' && e.key === ' ') { e.preventDefault(); jumpPlayer(); }
      if (game.mode === 'world' && k === 'v') { toggleVR(); return; }
      if (game.mode === 'world' && k === 'n') challengeN();
      if (game.mode === 'battle') {
        if (e.key === '1') playerAction(0);
        if (e.key === '2') playerAction(1);
        if (e.key === '3') playerAction(2);
      }
    });

    document.addEventListener('keyup', (e) => { keys[e.key.toLowerCase()] = false; });

    [creatorNameInput, creatorSkinInput, creatorOutfitInput, creatorHairStyleInput, creatorHairColorInput, creatorExtraInput].forEach((input) => {
      input.addEventListener(input.tagName === 'INPUT' ? 'input' : 'change', readCreatorInputs);
    });
    creatorRotateLeftBtn.addEventListener('click', () => { creatorState.yaw += 0.35; });
    creatorRotateRightBtn.addEventListener('click', () => { creatorState.yaw -= 0.35; });
    creatorZoomOutBtn.addEventListener('click', () => { creatorState.zoom = Math.min(9.5, creatorState.zoom + 0.55); });
    creatorZoomInBtn.addEventListener('click', () => { creatorState.zoom = Math.max(3.4, creatorState.zoom - 0.55); });
    let creatorStartHandled = false;
    function triggerCreatorStart() {
      if (creatorStartHandled || game.mode !== 'creator') return;
      creatorStartHandled = true;
      finishCreator();
      setTimeout(() => { creatorStartHandled = false; }, 300);
    }
    creatorStartBtn.addEventListener('click', triggerCreatorStart);
    creatorStartBtn.addEventListener('pointerup', triggerCreatorStart);
    creatorStartBtn.addEventListener('touchend', (e) => {
      e.preventDefault();
      triggerCreatorStart();
    }, { passive: false });
    if (vrButtonEl) vrButtonEl.addEventListener('click', toggleVR);
    renderer.xr.addEventListener('sessionstart', () => {
      vrState.active = true;
      vrInput.selectHeld = false;
      xrWorldOffset.enabled = true;
      cameraState.thirdPerson = false;
      document.exitPointerLock();
      mouseMove.forward = false;
      mouseMove.backward = false;
      if (vrHands.left) vrHands.left.visible = true;
      if (vrHands.right) vrHands.right.visible = true;
      crosshairEl.style.display = 'none';
      const session = renderer.xr.getSession();
      if (session) {
        session.addEventListener('selectstart', () => {
          vrInput.selectHeld = true;
          interact();
        });
        session.addEventListener('selectend', () => {
          vrInput.selectHeld = false;
        });
        session.addEventListener('squeezestart', () => {
          jumpPlayer();
        });
      }
      setMessage('VR actief. Linker stick = lopen, rechter stick = draaien, trigger = praten/interacten, A/X = springen.');
      updateFunHUD();
      updateVrButtonState();
    });
    renderer.xr.addEventListener('sessionend', () => {
      vrState.active = false;
      vrInput.selectHeld = false;
      xrWorldOffset.enabled = false;
      scene.position.set(0, 0, 0);
      if (vrHands.left) vrHands.left.visible = false;
      if (vrHands.right) vrHands.right.visible = false;
      vrStatusLabel.sprite.visible = false;
      if (game.mode !== 'creator') crosshairEl.style.display = 'block';
      setMessage('VR gestopt. Je bent terug in standaard browser-modus.');
      updateFunHUD();
      updateVrButtonState();
    });
    creatorUI.addEventListener('wheel', (e) => {
      if (game.mode !== 'creator') return;
      e.preventDefault();
      creatorState.zoom = Math.max(3.4, Math.min(9.5, creatorState.zoom + (e.deltaY > 0 ? 0.35 : -0.35)));
    }, { passive: false });
    document.addEventListener('wheel', (e) => {
      if (game.mode !== 'world' || !cameraState.thirdPerson) return;
      cameraState.worldZoom = Math.max(cameraState.minZoom, Math.min(cameraState.maxZoom, cameraState.worldZoom + (e.deltaY > 0 ? 0.35 : -0.35)));
    }, { passive: true });

    function movePlayer() {
      if (game.mode !== 'world') return;
      player.sprinting = false;
      let forward = 0, strafe = 0;
      if (keys['w']) forward -= 1;
      if (keys['s']) forward += 1;
      if (mouseMove.forward) forward -= 1;
      if (mouseMove.backward) forward += 1;
      if (keys['a']) strafe -= 1;
      if (keys['d']) strafe += 1;
      if (renderer.xr.isPresenting) {
        forward += vrInput.moveForward;
        strafe += vrInput.moveStrafe;
        if (Math.abs(vrInput.moveForward) < 0.01 && Math.abs(vrInput.moveStrafe) < 0.01 && vrInput.selectHeld) {
          forward -= 1;
        }
      }
      if (!forward && !strafe) return;
      const wantsSprintKeyboard = (keys['shift'] || keys['shiftleft'] || keys['shiftright']);
      const wantsSprint = (wantsSprintKeyboard || (renderer.xr.isPresenting && vrInput.sprint)) && player.stamina > 4;
      player.sprinting = wantsSprint;
      const moveSpeed = player.speed * (wantsSprint ? 1.75 : 1);
      const sin = Math.sin(player.yaw), cos = Math.cos(player.yaw);
      const dx = (sin * forward + cos * strafe) * moveSpeed;
      const dz = (cos * forward - sin * strafe) * moveSpeed;
      const nx = player.x + dx, nz = player.z + dz;
      const cx = collides(nx, player.z); const cz = collides(player.x, nz);
      const currentFeet = player.y - PLAYER_EYE_HEIGHT;
      const canMoveX = !cx && getGroundHeightAt(nx, player.z, currentFeet + MAX_STEP_UP) <= currentFeet + MAX_STEP_UP;
      const canMoveZ = !cz && getGroundHeightAt(player.x, nz, currentFeet + MAX_STEP_UP) <= currentFeet + MAX_STEP_UP;
      if (canMoveX) player.x = nx; else if (cx?.gate) setMessage(cx.gate.requirementText);
      if (canMoveZ) player.z = nz; else if (cz?.gate) setMessage(cz.gate.requirementText);
    }

    function updateStamina() {
      if (game.mode !== 'world') return;
      if (player.sprinting) player.stamina = Math.max(0, player.stamina - 0.55);
      else player.stamina = Math.min(100, player.stamina + 0.32);
      if (player.stamina <= 0) player.sprinting = false;
    }

    function updateAbilities(deltaMs) {
      if (player.dashCooldownMs > 0) {
        player.dashCooldownMs = Math.max(0, player.dashCooldownMs - deltaMs);
      }
    }

    function updateGravity() {
      if (game.mode !== 'world') return;
      if (game.devNoClip) {
        resetVerticalMotion();
        return;
      }

      const feet = player.y - PLAYER_EYE_HEIGHT;
      const ground = getGroundHeightAt(player.x, player.z, feet + (player.grounded ? MAX_STEP_UP : 0.15));
      const groundDelta = ground - feet;
      if (player.grounded && Math.abs(groundDelta) <= MAX_STEP_UP) {
        player.y += groundDelta * GROUND_SMOOTHING;
        if (Math.abs(groundDelta) < 0.02) player.y = ground + PLAYER_EYE_HEIGHT;
        resetVerticalMotion();
      } else if (feet <= ground && player.vy <= 0) {
        player.y = ground + PLAYER_EYE_HEIGHT;
        resetVerticalMotion();
      } else {
        player.grounded = false;
        player.vy = Math.max(player.vy - GRAVITY, -MAX_FALL_SPEED);
        player.y += player.vy;
      }

      if (player.y < PLAYER_EYE_HEIGHT) {
        player.y = PLAYER_EYE_HEIGHT;
        resetVerticalMotion();
      }
      updatePlayerLayer();
    }

    function updateCamera() {
      if (renderer.xr.isPresenting) return;
      if (game.mode === 'creator' && playerAvatar) {
        const previewHeight = 2.2;
        const camX = playerAvatar.position.x + Math.sin(creatorState.yaw + Math.PI * 0.08) * creatorState.zoom;
        const camZ = playerAvatar.position.z + Math.cos(creatorState.yaw + Math.PI * 0.08) * creatorState.zoom;
        camera.position.set(camX, previewHeight, camZ);
        camera.up.set(0, 1, 0);
        camera.lookAt(playerAvatar.position.x, 1.8, playerAvatar.position.z);
        return;
      }
      if (game.mode === 'world' && cameraState.thirdPerson) {
        const behindX = Math.sin(player.yaw) * cameraState.worldZoom;
        const behindZ = Math.cos(player.yaw) * cameraState.worldZoom;
        const camY = player.y + 1.35;
        camera.up.set(0, 1, 0);
        camera.position.set(player.x + behindX, camY, player.z + behindZ);
        const lookAhead = 7;
        const lookX = player.x - Math.sin(player.yaw) * lookAhead;
        const lookZ = player.z - Math.cos(player.yaw) * lookAhead;
        const lookY = (player.y - 0.35) + Math.tan(player.pitch) * 2.2;
        camera.lookAt(lookX, lookY, lookZ);
        return;
      }
      camera.up.set(0, 1, 0);
      camera.position.set(player.x, player.y, player.z);
      camera.rotation.order = 'YXZ';
      camera.rotation.y = player.yaw;
      const walkDrift = game.mode === 'world' ? Math.sin(performance.now() * (player.sprinting ? 0.018 : 0.012)) * (player.sprinting ? 0.025 : 0.012) : 0;
      camera.rotation.x = player.pitch + walkDrift;
      camera.rotation.z = 0;
    }

    function distanceToEntity(entity) {
      const dx = entity.mesh.position.x - player.x;
      const dz = entity.mesh.position.z - player.z;
      return Math.sqrt(dx * dx + dz * dz);
    }

    function distanceToPoint(x, z) {
      const dx = x - player.x;
      const dz = z - player.z;
      return Math.sqrt(dx * dx + dz * dz);
    }

    function nearestInterestingThing() {
      const options = [];
      for (const donut of donuts) {
        if (!donut.collected) options.push({ name: 'donut', dist: distanceToPoint(donut.x, donut.z) });
      }
      for (const chest of chests) {
        if (!chest.opened) options.push({ name: 'cache', dist: distanceToPoint(chest.x, chest.z) });
      }
      for (const entity of entities) {
        if (!entity.mesh.visible || entity.captured || entity.defeated || !isOnPlayerLayer(entity)) continue;
        options.push({ name: entity.name, dist: distanceToEntity(entity) });
      }
      if (game.hellPortalUnlocked && !game.inHell) options.push({ name: 'Hel-portaal', dist: distanceToPoint(hellPortal.position.x, hellPortal.position.z) });
      if (game.inHell) options.push({ name: 'terug-portaal', dist: distanceToPoint(hellReturnPortal.position.x, hellReturnPortal.position.z) });
      options.sort((a, b) => a.dist - b.dist);
      return options[0] || null;
    }

    function isOnPlayerLayer(entity) {
      if (entity.baseY > 3) return game.inCircus;
      return !game.inCircus;
    }

    function getLookTarget() {
      const dir = new THREE.Vector3();
      camera.getWorldDirection(dir);
      let best = null;
      let bestScore = 0.93;
      for (const entity of entities) {
        if (!isOnPlayerLayer(entity)) continue;
        if (entity.captured || ((entity.type === 'boss' || entity.type === 'enemy' || entity.type === 'finalBoss') && entity.defeated)) continue;
        const dist = distanceToEntity(entity);
        if (dist > 4.8) continue;
        const to = new THREE.Vector3(entity.mesh.position.x - player.x, entity.mesh.position.y + 1.6 - player.y, entity.mesh.position.z - player.z).normalize();
        const score = dir.dot(to);
        if (score > bestScore) { best = entity; bestScore = score; }
      }
      return best;
    }

    function getNearbyEntity(maxDistance = 3.2) {
      let best = null;
      let bestDistance = maxDistance;
      for (const entity of entities) {
        if (!isOnPlayerLayer(entity)) continue;
        if (entity.captured || ((entity.type === 'boss' || entity.type === 'enemy' || entity.type === 'finalBoss') && entity.defeated)) continue;
        const dist = distanceToEntity(entity);
        if (dist < bestDistance) {
          best = entity;
          bestDistance = dist;
        }
      }
      return best;
    }

    function getNearbyChest(maxDistance = 3.2) {
      let best = null;
      let bestDistance = maxDistance;
      for (const chest of chests) {
        if (chest.opened) continue;
        const dist = distanceToPoint(chest.x, chest.z);
        if (dist < bestDistance) {
          best = chest;
          bestDistance = dist;
        }
      }
      return best;
    }

    function openChest(chest) {
      if (!chest || chest.opened) return;
      chest.opened = true;
      chest.mesh.rotation.z = -0.2;
      chest.mesh.position.y = 0.08;
      awardProgress(chest.rewardXp, chest.rewardShards, 'Treasure cache geopend.');
      setMessage('Treasure cache open. +' + chest.rewardShards + ' shards en +' + chest.rewardXp + ' XP.');
    }

    function activateDash() {
      if (game.mode !== 'world' || player.dashCooldownMs > 0) return;
      player.dashCooldownMs = 4000;
      const dashDistance = 4.2;
      const sin = Math.sin(player.yaw);
      const cos = Math.cos(player.yaw);
      let moved = false;
      for (let i = 1; i <= 6; i++) {
        const step = (dashDistance / 6) * i;
        const nx = player.x - sin * step;
        const nz = player.z - cos * step;
        if (collides(nx, nz)) break;
        player.x = nx;
        player.z = nz;
        moved = true;
      }
      if (moved) {
        player.stamina = Math.max(0, player.stamina - 10);
        setMessage('Dash! Je schiet vooruit door de glitch-lucht.');
      }
      updateStatsHUD();
    }

    function interact() {
      if (nearHellPortal()) { enterHell(); return; }
      if (nearHellReturn()) { leaveHell(); return; }
      const nearbyChest = getNearbyChest();
      if (nearbyChest) {
        openChest(nearbyChest);
        return;
      }
      const target = getLookTarget() || getNearbyEntity();
      if (!target) return;
      if (target.type === 'npc') {
        if (!target.talked) {
          target.talked = true;
          showDialog(target.name, target.dialog);
          return;
        }
        if (isRecruitableNpc(target)) {
          ensureRecruitUnit(target);
          showDialog(target.name, ['Je hebt met me gepraat.', 'Nu wordt het serieus.', 'Win deze moeilijke battle en ik kom in je team.']);
          setTimeout(() => startBattle(getBestStartingUnit(), target.name, target), 50);
        }
        return;
      }
      if (target.type === 'unit') {
        if (!target.captured) {
          showDialog(target.name, target.dialog, () => {
            if (!target.captured) startCatchMode(target);
          });
        }
        return;
      }
      if (target.type === 'enemy') {
        if (!target.defeated) {
          showDialog(target.name, target.dialog);
          setTimeout(() => startBattle(getBestStartingUnit(), target.battleUnit, target), 50);
        }
        return;
      }
      if (target.type === 'boss') {
        if (target.name === 'J' && !game.team.includes('V')) {
          setMessage('J is geen beginbaas. Pak eerst V.');
          return;
        }
        showDialog(target.name, target.dialog);
        setTimeout(() => startBattle(getBestStartingUnit(), target.battleUnit, target), 50);
        return;
      }
      if (target.type === 'finalBoss') {
        if (!game.gate3Opened) {
          setMessage('N wacht, maar jij bent er nog niet klaar voor.');
          return;
        }
        showDialog(target.name, target.dialog);
        setTimeout(() => startBattle(getBestStartingUnit(), target.battleUnit, target), 50);
      }
    }

    function challengeN() {
      if (game.inCircus) return;
      if (nEntity.defeated || distanceToEntity(nEntity) > 6) return;
      if (!game.gate3Opened) {
        setMessage('N wacht, maar jij bent er nog niet klaar voor. Versla eerst de Sentinel.');
        return;
      }
      showDialog(nEntity.name, nEntity.dialog);
      setTimeout(() => startBattle(getBestStartingUnit(), nEntity.battleUnit, nEntity), 50);
    }

    function getBestStartingUnit() {
      const order = ['V', 'Uzi', 'Cyn'];
      for (const name of order) if (game.team.includes(name)) return name;
      return game.team[0] || 'Uzi';
    }

    function calcDamage(attacker, defender, move) {
      if (move.heal) return 0;
      const raw = move.power + attacker.attack - Math.floor(defender.defense / 2);
      return Math.max(6, raw + Math.floor(Math.random() * 5) - 2);
    }

    function updateReserveButtons() {
      reserveButtons.innerHTML = '';
      const battle = game.activeBattle;
      const reserve = battle.reserve.filter(u => !u.ko && u.name !== battle.player.name);
      for (const unit of reserve) {
        const btn = document.createElement('button');
        btn.className = 'ghostBtn';
        btn.textContent = 'Switch naar ' + unit.name + ' (' + unit.hp + ' HP)';
        btn.disabled = battle.turn !== 'player' || battle.winner;
        btn.onclick = () => switchUnit(unit.name);
        reserveButtons.appendChild(btn);
      }
      if (!reserve.length) {
        const filler = document.createElement('button');
        filler.className = 'ghostBtn';
        filler.textContent = 'Geen reserve units';
        filler.disabled = true;
        reserveButtons.appendChild(filler);
      }
    }

    function updateBattleUI() {
      const b = game.activeBattle;
      playerNameEl.textContent = b.player.name;
      enemyNameEl.textContent = b.enemy.name;
      playerStatsEl.textContent = 'HP ' + b.player.hp + ' / ' + b.player.maxHp;
      enemyStatsEl.textContent = 'HP ' + b.enemy.hp + ' / ' + b.enemy.maxHp;
      playerHpBar.style.width = ((b.player.hp / b.player.maxHp) * 100) + '%';
      enemyHpBar.style.width = ((b.enemy.hp / b.enemy.maxHp) * 100) + '%';
      move1Btn.textContent = '1. ' + b.player.moves[0].name;
      move2Btn.textContent = '2. ' + b.player.moves[1].name;
      move3Btn.textContent = '3. ' + b.player.moves[2].name;
      move1Btn.disabled = b.turn !== 'player' || !!b.winner;
      move2Btn.disabled = b.turn !== 'player' || !!b.winner;
      move3Btn.disabled = b.turn !== 'player' || !!b.winner;
      updateReserveButtons();
    }

    function startBattle(playerUnitName, enemyUnitName, sourceEntity) {
      game.mode = 'battle';
      document.exitPointerLock();
      dialogEl.style.display = 'none';
      battleUI.style.display = 'block';
      const reserve = game.team.map(name => cloneUnit(name));
      const playerUnit = reserve.find(u => u.name === playerUnitName) || reserve[0] || cloneUnit('Uzi');
      game.activeBattle = {
        player: playerUnit,
        reserve,
        enemy: cloneUnit(enemyUnitName),
        turn: playerUnit.speed >= units[enemyUnitName].speed ? 'player' : 'enemy',
        winner: null,
        sourceEntity
      };
      battleLog.textContent = playerUnit.name + ' staat tegenover ' + enemyUnitName + '.';
      updateBattleUI();
      if (game.activeBattle.turn === 'enemy') setTimeout(enemyTurn, 700);
    }

    function findReserveByName(name) {
      return game.activeBattle.reserve.find(u => u.name === name);
    }

    function markCurrentPlayerState() {
      const current = findReserveByName(game.activeBattle.player.name);
      current.hp = game.activeBattle.player.hp;
      current.ko = game.activeBattle.player.hp <= 0;
    }

    function switchUnit(name) {
      const b = game.activeBattle;
      if (!b || b.turn !== 'player' || b.winner) return;
      markCurrentPlayerState();
      const next = findReserveByName(name);
      if (!next || next.ko || next.hp <= 0) return;
      b.player = JSON.parse(JSON.stringify(next));
      battleLog.textContent = 'Je wisselt naar ' + name + '.';
      b.turn = 'enemy';
      updateBattleUI();
      setTimeout(enemyTurn, 700);
    }

    function applyMove(user, target, move) {
      if (move.heal) {
        user.hp = Math.min(user.maxHp, user.hp + move.heal);
        return { text: move.text + ' Herstel: ' + move.heal + '.', healed: move.heal };
      }
      const damage = calcDamage(user, target, move);
      target.hp = Math.max(0, target.hp - damage);
      return { text: move.text + ' Schade: ' + damage + '.', damage };
    }

    function playerAction(index) {
      const b = game.activeBattle;
      if (!b || b.turn !== 'player' || b.winner) return;
      const move = b.player.moves[index];
      const result = applyMove(b.player, b.enemy, move);
      battleLog.textContent = b.player.name + ' gebruikt ' + move.name + '. ' + result.text;
      if (b.enemy.hp <= 0) {
        b.winner = 'player';
        markCurrentPlayerState();
        updateBattleUI();
        return finishBattle(true);
      }
      markCurrentPlayerState();
      b.turn = 'enemy';
      updateBattleUI();
      setTimeout(enemyTurn, 750);
    }

    function enemyTurn() {
      const b = game.activeBattle;
      if (!b || b.winner) return;
      const choices = b.enemy.moves;
      const move = choices[Math.floor(Math.random() * choices.length)];
      if (game.devGodMode) {
        battleLog.textContent = 'God Mode blokkeert ' + b.enemy.name + '. Jij bent weer aan zet.';
        b.turn = 'player';
        updateBattleUI();
        return;
      }
      const result = applyMove(b.enemy, b.player, move);
      battleLog.textContent = b.enemy.name + ' gebruikt ' + move.name + '. ' + result.text;
      if (b.player.hp <= 0) {
        markCurrentPlayerState();
        const next = b.reserve.find(u => u.name !== b.player.name && !u.ko && u.hp > 0);
        if (next) {
          b.player = JSON.parse(JSON.stringify(next));
          battleLog.textContent += ' ' + next.name + ' springt automatisch in.';
          b.turn = 'player';
          updateBattleUI();
          return;
        }
        b.winner = 'enemy';
        updateBattleUI();
        return finishBattle(false);
      }
      markCurrentPlayerState();
      b.turn = 'player';
      updateBattleUI();
    }

    function finishBattle(win) {
      const b = game.activeBattle;
      if (win) {
        const source = b.sourceEntity;
        const rewardXp =
          source?.type === 'finalBoss' ? 70 :
          source?.type === 'boss' ? 48 :
          source?.type === 'enemy' ? 28 :
          source?.type === 'npc' ? 36 : 24;
        const rewardShards =
          source?.type === 'finalBoss' ? 45 :
          source?.type === 'boss' ? 26 :
          source?.type === 'enemy' ? 14 :
          source?.type === 'npc' ? 18 : 12;
        if (source) {
          if (isRecruitableNpc(source)) {
            source.captured = true;
            ensureRecruitUnit(source);
            if (!game.team.includes(source.name)) game.team.push(source.name);
          } else {
            source.defeated = true;
          }
          source.mesh.visible = false;
          if (source.name === 'Worker Drone') game.workerDefeated = true;
          if (source.name === 'J') game.jDefeated = true;
          if (source.name === 'Sentinel') game.sentinelDefeated = true;
          if (source.name === 'N') game.finalDefeated = true;
        }
        game.winStreak += 1;
        awardProgress(rewardXp + Math.min(20, game.winStreak * 2), rewardShards, 'Battle gewonnen.');
        maybeOpenGates();
        battleLog.textContent = 'Je wint van ' + b.enemy.name + '.';
        setTimeout(() => {
          battleUI.style.display = 'none';
          game.mode = 'world';
          game.activeBattle = null;
          if (source?.name === 'Worker Drone') setMessage('De Worker Drone is weg. Het gebied voelt veiliger.');
          else if (source?.name === 'J') setMessage('J is verslagen. Gate B opent.');
          else if (source?.name === 'Sentinel') setMessage('De Sentinel is kapot. De route naar N is open.');
          else if (source?.name === 'N') {
            setMessage(game.hellPortalUnlocked ? 'Je hebt N verslagen. Het portaal naar de Hel staat open.' : 'Je hebt N verslagen. Verzamel iedereen om het laatste portaal te openen.');
          }
          else if (isRecruitableNpc(source)) setMessage(source.name + ' is nu in je team.');
          else setMessage('Victory! +' + rewardShards + ' shards, +' + rewardXp + ' XP.');
          updateTeamUI();
          updateProgress();
          updateObjective();
        }, 1000);
      } else {
        game.winStreak = 0;
        battleLog.textContent = 'Je team is verslagen.';
        setTimeout(() => {
          battleUI.style.display = 'none';
          game.mode = 'world';
          game.activeBattle = null;
          player.x = -48; player.z = -2;
          setMessage('Je verloor. Terug naar het begin.');
        }, 1000);
      }
    }

    function toggleDevPanel(forceOpen = null) {
      const shouldOpen = forceOpen === null ? !devPanel.classList.contains('open') : forceOpen;
      devPanel.classList.toggle('open', shouldOpen);
      if (shouldOpen) document.exitPointerLock();
    }

    function setTeamMember(name, enabled) {
      if (enabled && !game.team.includes(name)) game.team.push(name);
      if (!enabled) game.team = game.team.filter(member => member !== name);
    }

    function closeActiveOverlay() {
      dialogEl.style.display = 'none';
      battleUI.style.display = 'none';
      game.activeBattle = null;
      game.mode = 'world';
    }

    function teleportTo(name) {
      closeActiveOverlay();
      const spots = {
        start: { x: -68, y: PLAYER_EYE_HEIGHT, z: -8, yaw: Math.PI * 0.5, inCircus: false },
        uzi: { x: -56, y: PLAYER_EYE_HEIGHT, z: -44, yaw: Math.PI, inCircus: false },
        cyn: { x: -20, y: PLAYER_EYE_HEIGHT, z: -44, yaw: Math.PI, inCircus: false },
        v: { x: 20, y: PLAYER_EYE_HEIGHT, z: -6, yaw: 0, inCircus: false },
        j: { x: 54, y: PLAYER_EYE_HEIGHT, z: -34, yaw: Math.PI / 2, inCircus: false },
        sentinel: { x: 54, y: PLAYER_EYE_HEIGHT, z: 34, yaw: Math.PI / 2, inCircus: false },
        n: { x: 8, y: PLAYER_EYE_HEIGHT, z: 54, yaw: 0, inCircus: false },
        circus: { x: -6, y: 8.8, z: -10, yaw: Math.PI, inCircus: true },
        hell: { x: 74, y: PLAYER_EYE_HEIGHT + 0.16, z: -72, yaw: 0, inCircus: false, inHell: true }
      };
      const spot = spots[name];
      if (!spot) return;
      game.inCircus = spot.inCircus;
      game.inHell = !!spot.inHell;
      player.x = spot.x;
      player.y = spot.y;
      player.z = spot.z;
      resetVerticalMotion();
      player.yaw = spot.yaw;
      player.pitch = 0;
      setMessage('Dev teleport: ' + name + '.');
    }

    function healTeam() {
      if (game.activeBattle) {
        for (const unit of game.activeBattle.reserve) {
          unit.hp = unit.maxHp;
          unit.ko = false;
        }
        game.activeBattle.player.hp = game.activeBattle.player.maxHp;
        updateBattleUI();
      }
      setMessage('Dev heal: je team is weer volledig opgeladen.');
    }

    function winCurrentBattle() {
      if (!game.activeBattle) {
        setMessage('Dev win: er is nu geen battle actief.');
        return;
      }
      game.activeBattle.enemy.hp = 0;
      updateBattleUI();
      finishBattle(true);
    }

    function unlockAllProgress() {
      game.team = ['Uzi', 'Cyn', 'V', 'Pomni'];
      game.workerDefeated = true;
      game.jDefeated = true;
      game.sentinelDefeated = true;
      game.finalDefeated = false;
      syncWorldFromState();
      setMessage('Dev unlock: team compleet, gates open, N staat klaar.');
    }

    function resetProgress() {
      closeActiveOverlay();
      game.team = [];
      game.shards = 0;
      game.xp = 0;
      game.level = 1;
      game.winStreak = 0;
      game.workerDefeated = false;
      game.jDefeated = false;
      game.sentinelDefeated = false;
      game.finalDefeated = false;
      game.inCircus = false;
      game.inHell = false;
      player.speed = 0.13;
      player.dashCooldownMs = 0;
      while (corruptionPatches.length) {
        const patch = corruptionPatches.pop();
        scene.remove(patch.mesh);
      }
      for (const chest of chests) {
        chest.opened = false;
        chest.mesh.rotation.z = 0;
        chest.mesh.position.y = 0;
      }
      worldCycle.worldTimeMs = 0;
      worldCycle.lastFrameTime = null;
      worldCycle.cycleIndex = 0;
      worldCycle.phase = 'day';
      worldCycle.dayCount = 1;
      worldCycle.initialized = false;
      lastAnimateTime = 0;
      teleportTo('start');
      syncWorldFromState();
      setMessage('Dev reset: progressie terug naar het begin.');
    }

    function setupDevMenu() {
      devToggle.onclick = () => toggleDevPanel();
      devChecks.teamUzi.onchange = () => { setTeamMember('Uzi', devChecks.teamUzi.checked); syncWorldFromState(); };
      devChecks.teamCyn.onchange = () => { setTeamMember('Cyn', devChecks.teamCyn.checked); syncWorldFromState(); };
      devChecks.teamV.onchange = () => { setTeamMember('V', devChecks.teamV.checked); syncWorldFromState(); };
      devChecks.teamPomni.onchange = () => { setTeamMember('Pomni', devChecks.teamPomni.checked); syncWorldFromState(); };
      devChecks.worker.onchange = () => { game.workerDefeated = devChecks.worker.checked; syncWorldFromState(); };
      devChecks.j.onchange = () => { game.jDefeated = devChecks.j.checked; syncWorldFromState(); };
      devChecks.sentinel.onchange = () => { game.sentinelDefeated = devChecks.sentinel.checked; syncWorldFromState(); };
      devChecks.n.onchange = () => { game.finalDefeated = devChecks.n.checked; syncWorldFromState(); };
      devChecks.godMode.onchange = () => { game.devGodMode = devChecks.godMode.checked; syncWorldFromState(); };
      devChecks.noClip.onchange = () => { game.devNoClip = devChecks.noClip.checked; syncWorldFromState(); };
      devChecks.fast.onchange = () => { game.devFast = devChecks.fast.checked; syncWorldFromState(); };
      document.getElementById('devHeal').onclick = healTeam;
      document.getElementById('devWinBattle').onclick = winCurrentBattle;
      document.getElementById('devUnlockAll').onclick = unlockAllProgress;
      document.getElementById('devReset').onclick = resetProgress;
      for (const btn of document.querySelectorAll('[data-teleport]')) {
        btn.onclick = () => teleportTo(btn.dataset.teleport);
      }
      syncDevMenu();
    }

    move1Btn.onclick = () => playerAction(0);
    move2Btn.onclick = () => playerAction(1);
    move3Btn.onclick = () => playerAction(2);

    function nearCircusStair() {
      if (!circusStair.unlocked || game.inCircus) return false;
      const dx = player.x - circusStair.x;
      const dz = player.z - circusStair.z;
      return Math.sqrt(dx * dx + dz * dz) < 5;
    }

    function nearCircusExit() {
      if (!game.inCircus) return false;
      const dx = player.x - (-6);
      const dz = player.z - 31;
      return Math.sqrt(dx * dx + dz * dz) < 5;
    }

    function nearHellPortal() {
      if (!game.hellPortalUnlocked || game.inCircus || game.inHell) return false;
      const dx = player.x - hellPortal.position.x;
      const dz = player.z - hellPortal.position.z;
      return Math.sqrt(dx * dx + dz * dz) < 4;
    }

    function nearHellReturn() {
      if (!game.inHell) return false;
      const dx = player.x - hellReturnPortal.position.x;
      const dz = player.z - hellReturnPortal.position.z;
      return Math.sqrt(dx * dx + dz * dz) < 4;
    }

    function enterHell() {
      game.inCircus = false;
      game.inHell = true;
      player.x = 74;
      player.y = PLAYER_EYE_HEIGHT + 0.16;
      player.z = -72;
      resetVerticalMotion();
      player.yaw = 0;
      player.pitch = 0;
      setMessage('Je stapt door het portaal. Welkom in de Hel.');
      updateProgress();
    }

    function startCatchMode(target) {
      game.mode = 'catch';
      game.activeCatch = {
        target,
        ringT: 0,
        ringSize: 1,
        direction: -1,
        throwsLeft: 3,
        thrown: false
      };
      catchUI.style.display = 'flex';
      catchTitleEl.textContent = 'Vang ' + target.name;
      catchRingEl.style.width = '150px';
      catchRingEl.style.height = '150px';
      catchBallEl.style.left = '50%';
      catchBallEl.style.bottom = '16px';
      catchBallEl.style.opacity = '1';
      catchBallEl.style.transform = 'translateX(-50%) scale(1)';
      catchTextEl.textContent = 'Klik of druk op spatie om een glitch-orb te gooien. Pogingen: 3';
      document.exitPointerLock();
    }

    function finishCatchMode(success, text) {
      const active = game.activeCatch;
      if (!active) return;
      const target = active.target;
      catchUI.style.display = 'none';
      game.activeCatch = null;
      game.mode = 'world';
      if (success) {
        target.captured = true;
        target.mesh.visible = false;
        if (!game.team.includes(target.name)) game.team.push(target.name);
        awardProgress(26, 10, target.name + ' gevangen.');
        updateTeamUI();
        const willOpenHellPortal = !game.hellPortalUnlocked && canOpenHellPortal();
        maybeOpenGates();
        if (!willOpenHellPortal) setMessage((text || (target.name + ' zit nu in je team.')) + ' +' + 10 + ' shards, +' + 26 + ' XP.');
      } else {
        setMessage(text || (target.name + ' ontsnapte net. Probeer het nog eens.'));
      }
      updateFunHUD();
    }

    function throwCatchOrb() {
      const active = game.activeCatch;
      if (!active || active.thrown) return;
      active.thrown = true;
      active.throwsLeft -= 1;
      catchBallEl.style.left = '50%';
      catchBallEl.style.bottom = '142px';
      catchBallEl.style.transform = 'translateX(-50%) scale(0.78)';

      const ringScore = 1 - active.ringSize;
      const difficulty = getCaptureDifficulty(active.target);
      const successChance = Math.max(0.15, Math.min(0.92, ringScore * 0.95 + (1 - difficulty) * 0.35));
      const success = Math.random() < successChance;

      setTimeout(() => {
        if (!game.activeCatch) return;
        if (success) {
          finishCatchMode(true, active.target.name + ' is geraakt. Mooie worp.');
          return;
        }
        catchBallEl.style.left = '50%';
        catchBallEl.style.bottom = '16px';
        catchBallEl.style.transform = 'translateX(-50%) scale(1)';
        active.thrown = false;
        if (active.throwsLeft <= 0) {
          finishCatchMode(false, active.target.name + ' brak uit alle drie de worpen.');
        } else {
          catchTextEl.textContent = 'Mis. Probeer opnieuw. Pogingen: ' + active.throwsLeft;
        }
      }, 380);
    }

    function leaveHell() {
      game.inHell = false;
      player.x = 0;
      player.y = PLAYER_EYE_HEIGHT;
      player.z = 54;
      resetVerticalMotion();
      player.yaw = Math.PI;
      player.pitch = 0;
      setMessage('Je kruipt terug uit de Hel. Het portaal blijft achter je branden.');
      updateProgress();
    }

    function updateHint() {
      if (game.mode !== 'world') { hintEl.style.display = 'none'; return; }
      const nearbyChest = getNearbyChest();
      if (nearbyChest) {
        hintEl.style.display = 'block';
        hintEl.textContent = 'Druk E om een treasure cache te openen';
        return;
      }
      if (nearHellPortal()) {
        hintEl.style.display = 'block';
        hintEl.textContent = 'Druk E om door het portaal naar de Hel te gaan';
        return;
      }
      if (nearHellReturn()) {
        hintEl.style.display = 'block';
        hintEl.textContent = 'Druk E om terug te keren uit de Hel';
        return;
      }
      if (nearCircusStair()) {
        hintEl.style.display = 'block';
        hintEl.textContent = 'Loop de trap op naar het upper deck';
        return;
      }
      if (nearCircusExit()) {
        hintEl.style.display = 'block';
        hintEl.textContent = 'Loop de trap af om terug te gaan naar de hoofdhal';
        return;
      }
      const target = getLookTarget();
      if (!target) { hintEl.style.display = 'none'; return; }
      hintEl.style.display = 'block';
      if (target.type === 'npc') hintEl.textContent = target.talked ? 'Druk E om ' + target.name + ' uit te dagen' : 'Druk E om te praten met ' + target.name;
      else if (target.type === 'unit') hintEl.textContent = 'Druk E om met ' + target.name + ' te praten en daarna te gooien';
      else if (target.type === 'finalBoss') hintEl.textContent = 'Druk E of N om ' + target.name + ' uit te dagen';
      else hintEl.textContent = 'Druk E om ' + target.name + ' uit te dagen';
    }

    function updateDonuts(time) {
      for (const donut of donuts) {
        if (donut.collected) continue;
        donut.mesh.rotation.y = time * 0.002;
        donut.mesh.position.y = donut.mesh.userData.baseY;
        donut.mesh.position.y += Math.sin(time * 0.004 + donut.x) * 0.015;
        if (Math.abs((donut.mesh.position.y || 0) - (player.y - PLAYER_EYE_HEIGHT)) > 10) continue;
        if (distanceToPoint(donut.x, donut.z) < 1.35) {
          donut.collected = true;
          donut.mesh.visible = false;
          game.donutsCollected += 1;
          player.stamina = Math.min(100, player.stamina + 28);
          awardProgress(8, 3, 'Donut gevonden.');
          setMessage('Donut gevonden. Stamina boost! (' + game.donutsCollected + '/' + game.donutsTotal + ') +3 shards, +8 XP.');
          updateFunHUD();
          if (game.donutsCollected === game.donutsTotal) setMessage('Alle donuts gevonden. Krusty zou trots zijn. Waarschijnlijk.');
        }
      }
    }

    function updateCatchMode() {
      const active = game.activeCatch;
      if (!active) return;
      active.ringT += 0.028 * active.direction;
      if (active.ringT <= 0) { active.ringT = 0; active.direction = 1; }
      if (active.ringT >= 1) { active.ringT = 1; active.direction = -1; }
      active.ringSize = 0.34 + active.ringT * 0.96;
      const px = 92 * active.ringSize;
      catchRingEl.style.width = px + 'px';
      catchRingEl.style.height = px + 'px';
      const quality = active.ringSize < 0.5 ? 'Perfect' : active.ringSize < 0.72 ? 'Goed' : 'Wild';
      catchTextEl.textContent = 'Timing: ' + quality + ' | Pogingen: ' + active.throwsLeft + ' | Klik of spatie om te gooien';
    }

    function updateRadar() {
      const cycleLabel = (worldCycle.phase === 'day' ? 'Dag ' : 'Nacht ') + worldCycle.dayCount;
      const remainingMs = Math.max(0, DAY_NIGHT_MS - (worldCycle.worldTimeMs % DAY_NIGHT_MS));
      const totalSeconds = Math.ceil(remainingMs / 1000);
      const timerText = Math.floor(totalSeconds / 60) + ':' + String(totalSeconds % 60).padStart(2, '0');
      const nearest = nearestInterestingThing();
      if (!nearest) {
        statusEl.textContent = 'Stamina: ' + Math.round(player.stamina) + '% | ' + cycleLabel + ' | Wissel in ' + timerText + ' | Radar: alles rustig' + getVrDebugSuffix();
        return;
      }
      const radar = nearest.name + ' op ' + Math.round(nearest.dist) + 'm';
      const mood = game.inHell ? 'Hel-hitte' : game.inCircus ? 'Circus-chaos' : player.sprinting ? 'Sprint' : 'Verkennen';
      statusEl.textContent = 'Stamina: ' + Math.round(player.stamina) + '% | ' + cycleLabel + ' | Wissel in ' + timerText + ' | ' + mood + ' | Radar: ' + radar + getVrDebugSuffix();
    }

    function bobAndFace(time) {
      if (playerAvatar) {
        playerAvatar.position.set(player.x, getGroundHeightAt(player.x, player.z), player.z);
        if (game.mode === 'creator') {
          playerAvatar.visible = true;
          playerAvatar.rotation.x = 0;
          playerAvatar.rotation.z = 0;
          playerAvatar.rotation.y = creatorState.yaw;
          playerAvatar.position.y += Math.sin(time * 0.0022) * 0.05;
          const rig = playerAvatar.userData.characterRig;
          if (rig) {
            const idleSwing = Math.sin(time * 0.0027) * 0.18;
            for (let i = 0; i < rig.arms.length; i++) {
              const side = i === 0 ? -1 : 1;
              rig.arms[i].rotation.x = idleSwing * side;
              rig.arms[i].rotation.z = rig.baseRotZ[i];
              rig.hands[i].position.y = 1.08;
              rig.legs[i].rotation.x = -idleSwing * 0.5 * side;
              rig.feet[i].position.y = 0.16;
            }
          }
        } else if (game.mode === 'world' && cameraState.thirdPerson) {
          playerAvatar.visible = true;
          playerAvatar.rotation.x = 0;
          playerAvatar.rotation.z = 0;
          playerAvatar.rotation.y = player.yaw + Math.PI;
          const moving = keys['w'] || keys['a'] || keys['s'] || keys['d'] || mouseMove.forward || mouseMove.backward;
          const rig = playerAvatar.userData.characterRig;
          if (rig) {
            const stride = moving ? Math.sin(time * (player.sprinting ? 0.018 : 0.012)) : 0;
            for (let i = 0; i < rig.arms.length; i++) {
              const side = i === 0 ? -1 : 1;
              const sideLift = Math.max(0, stride * side);
              rig.arms[i].rotation.x = -stride * 0.9 * side;
              rig.arms[i].rotation.z = rig.baseRotZ[i] + Math.abs(stride) * 0.09 * side;
              rig.hands[i].position.y = 1.08 + Math.max(0, -stride * side) * 0.11;
              rig.legs[i].rotation.x = stride * 1.0 * side;
              rig.feet[i].position.y = 0.16 + sideLift * 0.07;
            }
          }
        } else {
          playerAvatar.visible = false;
        }
      }
      for (const entity of entities) {
        if (!entity.mesh.visible) continue;
        const walkTime = time * 0.00055 * entity.wanderSpeed + entity.wanderPhase;
        const driftX = Math.cos(walkTime) * entity.wanderRadius;
        const driftZ = Math.sin(walkTime * 1.18) * entity.wanderRadius * 0.78;
        const nextWalkTime = walkTime + 0.018;
        const nextX = entity.homeX + Math.cos(nextWalkTime) * entity.wanderRadius;
        const nextZ = entity.homeZ + Math.sin(nextWalkTime * 1.18) * entity.wanderRadius * 0.78;
        entity.mesh.position.x = entity.homeX + driftX;
        entity.mesh.position.z = entity.homeZ + driftZ;
        entity.mesh.position.y = entity.baseY + Math.sin(time * 0.002 + entity.homeX * 0.3) * 0.08;
        if (pointInCorruption(entity.mesh.position.x, entity.mesh.position.z)) {
          deleteEntityByCorruption(entity);
          continue;
        }
        const dirX = nextX - entity.mesh.position.x;
        const dirZ = nextZ - entity.mesh.position.z;
        entity.mesh.rotation.x = 0;
        entity.mesh.rotation.z = 0;
        entity.mesh.rotation.y = Math.atan2(dirX, dirZ);

        const rig = entity.mesh.userData.characterRig;
        if (rig) {
          const stride = Math.sin(walkTime * 6.5);
          for (let i = 0; i < rig.arms.length; i++) {
            const side = i === 0 ? -1 : 1;
            const sideLift = Math.max(0, stride * side);
            rig.arms[i].rotation.x = -stride * 0.7 * side;
            rig.arms[i].rotation.z = rig.baseRotZ[i] + Math.abs(stride) * 0.08 * side;
            rig.hands[i].position.y = 1.08 + Math.max(0, -stride * side) * 0.1;
            rig.legs[i].rotation.x = stride * 0.9 * side;
            rig.feet[i].position.y = 0.16 + sideLift * 0.06;
          }
        }
      }
      for (let i = 0; i < props.length; i++) {
        props[i].rotation.y = time * 0.0004 * (i % 2 ? 1 : -1);
      }
      for (let i = 0; i < chests.length; i++) {
        if (chests[i].opened) continue;
        chests[i].mesh.position.y = Math.sin(time * 0.002 + i) * 0.04;
        chests[i].mesh.rotation.y = time * 0.0008 * (i % 2 ? 1 : -1);
      }
      for (let i = 0; i < corruptionPatches.length; i++) {
        const patch = corruptionPatches[i].mesh;
        patch.rotation.y = time * 0.0002 * (i % 2 ? 1 : -1);
        patch.position.y = 0.03 + Math.sin(time * 0.0018 + i) * 0.025;
      }
    }

    function animatePortal(portal, time) {
      if (!portal.visible) return;
      const parts = portal.userData.portalParts;
      parts.ring.rotation.z = time * 0.0018;
      parts.core.rotation.z = -time * 0.0011;
      parts.innerRing.rotation.z = -time * 0.0026;
      parts.core.material.opacity = 0.52 + Math.sin(time * 0.004) * 0.14;
      parts.sparks.rotation.z = -time * 0.0015;
      parts.sign.material.rotation = Math.sin(time * 0.001) * 0.03;
    }

    function animate(time = 0) {
      const deltaMs = lastAnimateTime ? Math.max(0, time - lastAnimateTime) : 16;
      lastAnimateTime = time;
      updateDayNightCycle(time);
      const isNight = worldCycle.phase === 'night';
      scene.background.set(game.inHell ? 0x190507 : isNight ? 0x080c16 : 0x121a27);
      scene.fog.color.set(game.inHell ? 0x1e0808 : isNight ? 0x0a101c : 0x121a27);
      scene.fog.near = game.inHell ? 12 : game.inCircus ? 17 : isNight ? 15 : 22;
      scene.fog.far = game.inHell ? 70 : game.inCircus ? 86 : isNight ? 80 : 118;
      hemi.intensity = game.inHell ? 0.56 : game.inCircus ? 1.1 : isNight ? 0.44 : 0.92;
      dir.intensity = game.inHell ? 0.62 : game.inCircus ? 0.92 : isNight ? 0.32 : 0.84;
      ambientPulse.color.set(game.inHell ? 0xff4a2f : game.inCircus ? 0xff3f8a : isNight ? 0x5b6fff : 0xff4568);
      ambientPulse.intensity = 0.46 + Math.sin(time * 0.0023) * 0.14;
      ambientPulse.position.set(player.x + Math.sin(time * 0.0013) * 4, game.inHell ? 5.4 : 8, player.z + Math.cos(time * 0.0016) * 4);
      skyDome.rotation.y = time * 0.00003;
      horizonRing.material.opacity = (game.inHell ? 0.05 : isNight ? 0.16 : 0.11) + Math.sin(time * 0.0011) * 0.02;
      horizonRing.material.color.set(game.inHell ? 0xff4a2f : game.inCircus ? 0xff4f9f : isNight ? 0x6e7fff : 0xff537a);
      floorGlow.material.opacity = game.inHell ? 0.07 : game.inCircus ? 0.1 : isNight ? 0.08 : 0.06;
      for (const lamp of flickerLights) {
        const spark = Math.sin(time * 0.013 + lamp.phase) * 0.08 + Math.sin(time * 0.0035 + lamp.phase * 1.7) * 0.06;
        const intensity = Math.max(0.18, lamp.base + spark);
        lamp.light.intensity = intensity;
        lamp.glow.material.opacity = 0.1 + intensity * 0.12;
        lamp.bulb.material.opacity = 0.72 + intensity * 0.18;
      }
      if (renderer.xr.isPresenting && game.mode === 'world') syncPlayerFromXR();
      if (renderer.xr.isPresenting) updateVrControllers(deltaMs);
      if (renderer.xr.isPresenting && xrWorldOffset.enabled) {
        scene.position.x = -player.x;
        scene.position.z = -player.z;
      } else if (scene.position.x !== 0 || scene.position.z !== 0) {
        scene.position.x = 0;
        scene.position.z = 0;
      }
      updateVrStatusTop();
      movePlayer();
      updateStamina();
      updateAbilities(deltaMs);
      updateGravity();
      updateCamera();
      updateHint();
      updateAreaBanner(time);
      updateObjective();
      updateCatchMode();
      updateDonuts(time);
      updateRadar();
      bobAndFace(time);
      if (circusStair.visible) {
        circusStair.sign.material.rotation = Math.sin(time * 0.001) * 0.03;
      }
      animatePortal(hellPortal, time);
      animatePortal(hellReturnPortal, time);
      renderer.render(scene, camera);
    }

    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });

    setupDevMenu();
    syncWorldFromState();
    setupCreator();
    setupVrHands();
    setupVR();
    renderer.setAnimationLoop(animate);
