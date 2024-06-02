import GUI from "lil-gui";
import * as THREE from "three";
import { gsap } from "gsap";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";

/**
 * Base
 */
// Debug
const gui = new GUI({
  width: 400,
});

gui.close();
gui.hide();

if ((window, location.hash === "#debug")) {
  gui.show();
}

const debugObject = {};

const loadingBarBackground = document.querySelector(".loading-background");
const loadingBarElement = document.querySelector(".loading-bar");
const percentage = document.querySelector(".percentage");

let sceneReady = false;
const loadingManager = new THREE.LoadingManager(
  // Loaded
  () => {
    // ...
    window.setTimeout(() => {
      loadingBarBackground.classList.add("ended");
      loadingBarBackground.style.transform = "";
      loadingBarElement.classList.add("ended");
      percentage.classList.add("ended");
      loadingBarElement.style.transform = "";
      percentage.style.transform = "";
      window.setTimeout(() => {
        loadingBarBackground.remove();
        loadingBarElement.remove();
        percentage.remove();
      }, 5000);
    }, 500);
    window.setTimeout(() => {
      sceneReady = true;
    }, 3500);
  },
  (itemUrl, itemsLoaded, itemsTotal) => {
    const progressRatio = itemsLoaded / itemsTotal;
    loadingBarElement.style.transform = `scaleX(${progressRatio})`;
    percentage.innerText = (progressRatio * 100).toFixed(0) + " %";
  }

  // ...
);

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

/**
 * Loaders
 */
// Texture loader
const textureLoader = new THREE.TextureLoader(loadingManager);

// Draco loader
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath("draco/");

// GLTF loader
const gltfLoader = new GLTFLoader(loadingManager);
gltfLoader.setDRACOLoader(dracoLoader);

/**
 * Textures
 */
const bakedTexture1 = textureLoader.load("/textures/baked8.jpg"); //8
bakedTexture1.flipY = false;
bakedTexture1.colorSpace = THREE.SRGBColorSpace;

const globeTexture = textureLoader.load("/textures/sunTexture2.png");
const saturnTexture = textureLoader.load("/textures/Saturn.jpeg");

//emissions
const halfmoonMaterial = new THREE.MeshBasicMaterial({
  color: 0xffffff,
});

const lampMaterial = new THREE.MeshBasicMaterial({
  color: 0xff9d53,
});

const ledlightoffMaterial = new THREE.MeshBasicMaterial({
  color: 0xa8aab1,
});

const windowtopEmission = new THREE.MeshBasicMaterial({
  color: 0x94969c,
});

/**
 * Materials
 */

//Baked Material

const material1 = new THREE.MeshBasicMaterial({
  map: bakedTexture1,
});

gltfLoader.load("/models/bedroom7.glb", (gltf) => {
  //7
  gltf.scene.traverse((child) => {
    console.log(child);
    if (child.isMesh) {
      child.material = material1;
    }

    if (child.isMesh && child.name === "mars") {
      child.material = new THREE.MeshBasicMaterial({
        map: globeTexture,
      });
    }

    if (child.isMesh && child.name === "moon") {
      child.material = new THREE.MeshBasicMaterial({
        map: saturnTexture,
      });
    }

    if (child.isMesh && child.name === "halfmoon") {
      child.material = halfmoonMaterial;
    }

    if (child.isMesh && child.name === "lightTop002") {
      child.material = ledlightoffMaterial;
    }

    if (child.isMesh && child.name === "windowtop.002") {
      child.material = windowtopEmission;
    }
  });

  gltf.scene.children.find((child) => {});

  scene.add(gltf.scene); // Add a closing parenthesis here
});

/**
 * POI
 */

const points = [
  {
    position: new THREE.Vector3(2, 2, 2),
    element: document.querySelector(".point-0"),
  },
  {
    position: new THREE.Vector3(2, 2, 2),
    element: document.querySelector(".point-1"),
  },
  {
    position: new THREE.Vector3(2, 2, 2),
    element: document.querySelector(".point-2"),
  },
];

debugObject.poi = true;
gui
  .add(debugObject, "poi")
  .onChange((val) => {
    for (const point of points) {
      if (!val) {
        point.element.classList.remove("visible");
      } else {
        point.element.classList.add("visible");
      }
    }
  })
  .name("Points of Interest");

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
  45,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.x = 4;
camera.position.y = 5;
camera.position.z = 4;
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * Animate
 */
const raycaster = new THREE.Raycaster();

const clock = new THREE.Clock();
const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  // Update controls
  controls.update();

  if (sceneReady) {
    for (const point of points) {
      const screenPosition = point.position.clone();
      screenPosition.project(camera);

      raycaster.setFromCamera(screenPosition, camera);
      const intersects = raycaster.intersectObjects(scene.children, true);

      if (intersects.length === 0 && debugObject.poi) {
        point.element.classList.add("visible");
      } else {
        const intersectionDistance = intersects[0].distance;
        const pointDistance = point.position.distanceTo(camera.position);

        if (intersectionDistance < pointDistance) {
          point.element.classList.remove("visible");
        } else if (intersectionDistance > pointDistance && debugObject.poi) {
          point.element.classList.add("visible");
        }
      }

      const translateX = screenPosition.x * sizes.width * 0.5;
      const translateY = -screenPosition.y * sizes.height * 0.5;
      point.element.style.transform = `translateX(${translateX}px) translateY(${translateY}px)`;
    }
  }

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
