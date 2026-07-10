import * as THREE from 'three';
import { GLTFLoader } from './vendor/loaders/GLTFLoader.js';

const COIN_ROOT_NAME = '_rig_animation_origin';
const HOVER_DELAY = 120;
const HOVER_DURATION = 1.15;
const TAU = Math.PI * 2;

const clamp01 = (value) => Math.min(1, Math.max(0, Number(value) || 0));
const easeOutCubic = (value) => 1 - Math.pow(1 - value, 3);
const easeOutPower2 = (value) => 1 - Math.pow(1 - value, 2);

export function createHeroCoins({ root, modelUrl, onCoinHover } = {}) {
  let renderer = null;
  let destroyed = false;
  let available = false;
  let hoverTimer = 0;
  let hoverCandidate = null;
  const activeSpins = new Map();
  let lastTime = 0;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 120);
  const scrollGroup = new THREE.Group();
  const pointerGroup = new THREE.Group();
  const autoGroup = new THREE.Group();
  const coinGroup = new THREE.Group();
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  const pointerTarget = new THREE.Vector2();
  const scrollDirection = new THREE.Vector3();
  const coinRoots = new Set();
  const pickableMeshes = [];
  const motionQuery = typeof window === 'undefined'
    ? { matches: false }
    : window.matchMedia('(prefers-reduced-motion: reduce)');

  scrollGroup.add(pointerGroup);
  pointerGroup.add(autoGroup);
  autoGroup.add(coinGroup);
  scene.add(scrollGroup);

  camera.position.set(0, 14.5, 0.2);
  camera.up.set(0, 0, -1);
  camera.lookAt(0, 0, 0);

  scene.add(new THREE.HemisphereLight(0xc9d9ee, 0x182330, 1.45));

  const keyLight = new THREE.DirectionalLight(0xe9f2ff, 3.1);
  keyLight.position.set(-7, 10, 8);
  scene.add(keyLight);

  const fillLight = new THREE.DirectionalLight(0x9ab8d8, 2.25);
  fillLight.position.set(8, 3, -7);
  scene.add(fillLight);

  const rimLight = new THREE.PointLight(0xc7d8f0, 15, 30, 2);
  rimLight.position.set(0, 5, -8);
  scene.add(rimLight);

  const setStatic = () => {
    available = false;
    if (root && root.classList) root.classList.add('is-static');
  };

  const isMobile = () => {
    const rootWidth = root && root.clientWidth;
    const viewportWidth = typeof window === 'undefined' ? rootWidth || 0 : window.innerWidth;
    return viewportWidth < 860;
  };

  const clearHoverTimer = () => {
    if (hoverTimer) {
      clearTimeout(hoverTimer);
      hoverTimer = 0;
    }
  };

  const beginCoinSpin = (coin, time) => {
    if (destroyed || activeSpins.has(coin) || !coin) return;

    activeSpins.set(coin, {
      coin,
      startedAt: time,
      startY: coin.rotation.y
    });

    if (typeof onCoinHover === 'function') {
      try {
        onCoinHover(coin);
      } catch (_) {
        // A consumer callback must not break the rendering loop.
      }
    }
  };

  const scheduleCoinSpin = (coin) => {
    if (coin === hoverCandidate || activeSpins.has(coin)) return;

    clearHoverTimer();
    hoverCandidate = coin;
    if (!coin) return;

    hoverTimer = setTimeout(() => {
      hoverTimer = 0;
      if (hoverCandidate === coin && !activeSpins.has(coin)) beginCoinSpin(coin, lastTime);
    }, HOVER_DELAY);
  };

  const findCoinFromIntersection = () => {
    const intersections = raycaster.intersectObjects(pickableMeshes, false);
    if (!intersections.length) return null;

    let current = intersections[0].object;
    while (current) {
      if (coinRoots.has(current)) return current;
      current = current.parent;
    }
    return null;
  };

  const updateSpin = (time) => {
    activeSpins.forEach((spin, coin) => {
      const elapsed = Math.max(0, time - spin.startedAt);
      const progress = clamp01(elapsed / HOVER_DURATION);
      spin.coin.rotation.y = spin.startY + TAU * easeOutPower2(progress);
      if (progress === 1) {
        activeSpins.delete(coin);
        if (hoverCandidate === coin) hoverCandidate = null;
      }
    });
  };

  const resize = () => {
    if (!renderer || destroyed) return;

    const width = Math.max(1, (root && root.clientWidth) || window.innerWidth || 1);
    const height = Math.max(1, (root && root.clientHeight) || window.innerHeight || 1);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, height, false);
  };

  const pointerMove = (eventOrX, clientY) => {
    if (!available || destroyed || isMobile() || !root || coinGroup.visible === false) return;

    const rect = root.getBoundingClientRect();
    const clientX = typeof eventOrX === 'number' ? eventOrX : eventOrX && eventOrX.clientX;
    const y = typeof eventOrX === 'number' ? clientY : eventOrX && eventOrX.clientY;
    if (!Number.isFinite(clientX) || !Number.isFinite(y) || !rect.width || !rect.height) return;

    pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((y - rect.top) / rect.height) * 2 + 1;
    pointerTarget.copy(pointer);

    scene.updateMatrixWorld(true);
    raycaster.setFromCamera(pointer, camera);
    scheduleCoinSpin(findCoinFromIntersection());
  };

  const pointerLeave = () => {
    pointerTarget.set(0, 0);
    hoverCandidate = null;
    clearHoverTimer();
  };

  const disposeObject = (object) => {
    const materials = new Set();
    const textures = new Set();
    object.traverse((child) => {
      if (child.geometry) child.geometry.dispose();
      const childMaterials = Array.isArray(child.material) ? child.material : [child.material];
      childMaterials.filter(Boolean).forEach((material) => materials.add(material));
    });
    materials.forEach((material) => {
      Object.values(material).forEach((value) => {
        if (value && value.isTexture) textures.add(value);
      });
    });
    textures.forEach((texture) => texture.dispose());
    materials.forEach((material) => material.dispose());
    object.clear();
  };

  const destroy = () => {
    if (destroyed) return;
    destroyed = true;
    available = false;
    clearHoverTimer();
    hoverCandidate = null;
    activeSpins.clear();
    if (renderer) renderer.domElement.removeEventListener('webglcontextlost', onContextLost);
    disposeObject(coinGroup);
    coinRoots.clear();
    pickableMeshes.length = 0;
    if (renderer) {
      const canvas = renderer.domElement;
      renderer.dispose();
      if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
      renderer = null;
    }
  };

  const onContextLost = (event) => {
    event.preventDefault();
    setStatic();
  };

  let ready = Promise.resolve(false);

  try {
    if (!root || !root.appendChild) throw new Error('Hero coins root is unavailable.');

    const canvas = root.ownerDocument.createElement('canvas');
    canvas.style.pointerEvents = 'none';
    canvas.setAttribute('aria-hidden', 'true');

    renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      premultipliedAlpha: false,
      powerPreference: 'high-performance'
    });
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.18;
    root.appendChild(canvas);
    canvas.addEventListener('webglcontextlost', onContextLost, false);
    resize();
    available = true;
    if (root.classList) root.classList.remove('is-static');

    ready = Promise.resolve()
      .then(() => new GLTFLoader().loadAsync(modelUrl))
      .then((gltf) => {
        if (destroyed || !available) {
          disposeObject(gltf.scene);
          return false;
        }

        const coinNodes = gltf.scene.children.filter((child) => (
          !child.isLight
          && !child.isCamera
          && child.name.toLowerCase().includes(COIN_ROOT_NAME)
        ));
        if (coinNodes.length !== 10) {
          disposeObject(gltf.scene);
          setStatic();
          return false;
        }
        coinNodes.forEach((coin) => coinGroup.add(coin));

        const bounds = new THREE.Box3().setFromObject(coinGroup);
        if (!bounds.isEmpty()) coinGroup.position.sub(bounds.getCenter(new THREE.Vector3()));

        coinGroup.traverse((child) => {
          if (child.name.toLowerCase().includes(COIN_ROOT_NAME)) coinRoots.add(child);
        });
        coinRoots.forEach((coin) => {
          coin.traverse((child) => {
            if (child.isMesh) pickableMeshes.push(child);
          });
        });

        return true;
      })
      .catch(() => {
        setStatic();
        return false;
      });
  } catch (_) {
    setStatic();
  }

  const tick = (scrollProgress, time = performance.now() * 0.001) => {
    if (!available || destroyed || !renderer) return;

    try {
      const timeSeconds = Number.isFinite(time) ? time : lastTime;
      lastTime = Math.max(lastTime, timeSeconds);
      const reducedMotion = motionQuery.matches;
      const motionScale = reducedMotion ? 0.3 : 1;
      const easing = 0.08 * (reducedMotion ? 0.55 : 1);
      const progress = clamp01(scrollProgress);
      const scrollEase = easeOutCubic(progress);
      const scaleLimit = reducedMotion ? 4.5 : 21;
      const cameraAdvance = reducedMotion ? 6 : 20;
      const scale = (1 + (scaleLimit - 1) * scrollEase) * (isMobile() ? 0.7 : 1);

      coinGroup.visible = progress < 0.985;
      if (coinGroup.visible) {
        pointerGroup.rotation.x += ((-pointerTarget.y * 0.06 * motionScale) - pointerGroup.rotation.x) * easing;
        pointerGroup.rotation.z += ((pointerTarget.x * 0.06 * motionScale) - pointerGroup.rotation.z) * easing;
        pointerGroup.position.x += ((pointerTarget.x * 0.11 * motionScale) - pointerGroup.position.x) * easing;
        pointerGroup.position.z += ((-pointerTarget.y * 0.08 * motionScale) - pointerGroup.position.z) * easing;
        autoGroup.rotation.y = reducedMotion ? 0 : -timeSeconds * 0.11;
        scrollGroup.scale.setScalar(scale);
        camera.getWorldDirection(scrollDirection).negate();
        scrollGroup.position.copy(scrollDirection.multiplyScalar(cameraAdvance * scrollEase));
        updateSpin(timeSeconds);
      }

      renderer.render(scene, camera);
    } catch (_) {
      setStatic();
    }
  };

  return { ready, resize, pointerMove, pointerLeave, tick, destroy };
}
