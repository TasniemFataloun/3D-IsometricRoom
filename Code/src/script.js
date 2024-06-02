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
  title: "Debug Panel",
  closeFolders: true,
});
gui.close();
gui.hide();

if (window.location.hash === "#debug") {
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
);

// Canvas
const canvas = document.querySelector("canvas.webgl");


// Scene
const scene = new THREE.Scene();

//light 1
const light1 = new THREE.AmbientLight(0xffffff, 1);
scene.add(light1);

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
const bakedTexture1 = textureLoader.load("/textures/baked12.jpg");
bakedTexture1.flipY = false;
bakedTexture1.colorSpace = THREE.SRGBColorSpace;

const globeTexture = textureLoader.load("/textures/sunTexture2.png");
const saturnTexture = textureLoader.load("/textures/Saturn2.jpeg");

const video = document.createElement("video");

video.src = "/textures/video.mp4";
video.crossOrigin = "anonymous";
video.loop = true;
video.muted = true;

video.play();

const screen = new THREE.VideoTexture(video);
screen.minFilter = THREE.LinearFilter;
screen.magFilter = THREE.LinearFilter;
screen.format = THREE.RGBFormat;

screen.center.set(0.5, 0.5);
screen.rotation = Math.PI / -2;
//move the video texturre to the bottom a bit
screen.offset.set(0.1, 0.3);
//make the video texture smaller
screen.repeat.set(0.9, 0.9);
// Apply the video texture to the screen material
const screenMaterial = new THREE.MeshBasicMaterial({
  map: screen,
});

// Emissions
const halfmoonMaterial = new THREE.MeshBasicMaterial({
  color: 0xffffff,
  roughness: 0.5,
  emissive: 0xffffff,
  emissiveIntensity: 10, // Adjust the intensity as needed
});

const lampMaterial = new THREE.MeshBasicMaterial({
  color: 0xFFDDA1,
});

const ledlightoffMaterial = new THREE.MeshBasicMaterial({
  color: 0xa8aab1,
  emissive: 0xa8aab1,
  emissiveIntensity: 0.5, // Adjust the intensity as needed
  toneMapped: false,
});

const ledlightEmission = new THREE.MeshBasicMaterial({
  color: 0xADB0E7,
  emissive: 0xADB0E7,
  emissiveIntensity: 20, // Adjust the intensity as needed
  toneMapped: false,
});

const circle = new THREE.MeshBasicMaterial({
  emissive: 0xC083E7,
  color: 0xC083E7,
  emissiveIntensity: 40, // Adjust the intensity as needed
});

const windowTardis = new THREE.MeshStandardMaterial({
  color: 0x94969c, // Adjust the color as needed
  emissive: 0x94969c,
  emissiveIntensity: 50, // Adjust the intensity as needed
});

/**
 * Materials
 */

// Baked Material
const material1 = new THREE.MeshBasicMaterial({
  map: bakedTexture1,
});

let mixer;
gltfLoader.load("/models/bedroom25.glb", (gltf) => {
  // Traverse the scene
  gltf.scene.traverse((child) => {
    console.log(child);

    // Apply material1 to all meshes
    if (child.isMesh) {
      child.material = material1;
    }

    // Apply specific materials to specific meshes
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

    if (child.isMesh && child.name === "screen") {
      child.material = screenMaterial;
      // Rotate the screen by 90 degrees around the x-axis
    }

    if (child.isMesh && child.name === "halfmoon") {
      child.material = halfmoonMaterial;
    }

    console.log(child.name);

    if (child.isMesh && child.name === "ledLightLeft") {
      child.material = ledlightEmission;
    }

    if (child.isMesh && child.name === "ledLightLeft001") {
      child.material = ledlightEmission;
    }

    if (child.isMesh && child.name === "lightTop002") {
      child.material = ledlightoffMaterial;
    }
    if (child.isGroup && child.name === "tardiswindows") {
      console.log("Found tardiswindows Group!"); // Log if "tardiswindows" Group is found
      // Traverse the children of the "tardiswindows" Group
      child.traverse((meshChild) => {
        if (meshChild.isMesh) {
          meshChild.material = windowTardis;
        }
      });
    }

    if (child.isMesh && child.name === "cirlcleBuiten_002") {
      child.material = circle;
    }

    if (child.isMesh && child.name === "cirlcleBuiten_001") {
      child.material = circle;
    }

    if (child.isMesh && child.name === "Cylinder026") {
      child.material = lampMaterial;
    }
  });

  // Initialize mixer and play animations
  if (gltf.animations && gltf.animations.length > 0) {
    mixer = new THREE.AnimationMixer(gltf.scene);
    gltf.animations.forEach((clip) => {
      mixer.clipAction(clip).play();
    });
  } else {
    console.log("No animations found in the gltf file.");
  }

  scene.add(gltf.scene);
});

/* Lights*/
const ambientLight = new THREE.AmbientLight(0xffffff, 2);
scene.add(ambientLight);
//light 1
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(9, 10, 4);
scene.add(directionalLight);

const directionalLightHelper = new THREE.DirectionalLightHelper(
  directionalLight,
  0.2
);
scene.add(directionalLightHelper);
directionalLightHelper.visible = false;

const directionalLight2 = new THREE.DirectionalLight(0x1f51ff, 2);
directionalLight2.position.set(1, 4, 3);
scene.add(directionalLight2);

const directionalLightHelper2 = new THREE.DirectionalLightHelper(
  directionalLight2,
  0.2
);
scene.add(directionalLightHelper2);
directionalLightHelper2.visible = false;

//lightshelper in gui  and group lights
const lightsFolder = gui.addFolder("Lights");
lightsFolder.open();
lightsFolder
  .add(directionalLight, "intensity")
  .min(0)
  .max(10)
  .step(0.001)
  .name("Light 1 Intensity");
lightsFolder
  .add(directionalLight.position, "x")
  .min(-10)
  .max(10)
  .step(0.001)
  .name("Light 1 X");
lightsFolder
  .add(directionalLight.position, "y")
  .min(-10)
  .max(10)
  .step(0.001)
  .name("Light 1 Y");
lightsFolder
  .add(directionalLight.position, "z")
  .min(-10)
  .max(10)
  .step(0.001)
  .name("Light 1 Z");
lightsFolder.add(directionalLight, "visible").name("Light 1 Visible");
lightsFolder
  .add(directionalLightHelper, "visible")
  .name("Light 1 Helper Visible");
lightsFolder
  .add(directionalLight2, "intensity")
  .min(0)
  .max(10)
  .step(0.001)
  .name("Light 2 Intensity");
lightsFolder
  .add(directionalLight2.position, "x")
  .min(-10)
  .max(10)
  .step(0.001)
  .name("Light 2 X");
lightsFolder
  .add(directionalLight2.position, "y")
  .min(-10)
  .max(10)
  .step(0.001)
  .name("Light 2 Y");
lightsFolder
  .add(directionalLight2.position, "z")
  .min(-10)
  .max(10)
  .step(0.001)
  .name("Light 2 Z");
lightsFolder.add(directionalLight2, "visible").name("Light 2 Visible");
lightsFolder
  .add(directionalLightHelper2, "visible")
  .name("Light 2 Helper Visible");

/**
 * POI
 */

const points = [
  {
    position: new THREE.Vector3(4, 7, -5),
    element: document.querySelector(".point-0"),
  },
  {
    position: new THREE.Vector3(6, 4, 6),
    element: document.querySelector(".point-1"),
  },
  {
    position: new THREE.Vector3(6.5, 3, -2),
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
  45, //45
  sizes.width / sizes.height,
  0.1,
  100
);

const camPosition = 18;
const camLookAt = new THREE.Vector3(0, 3, 0);
camera.position.set(camPosition, camPosition + 3, camPosition);
camera.lookAt(camLookAt);
scene.add(camera);

//camera in gui
const cameraFolder = gui.addFolder("Camera");
cameraFolder.open();
cameraFolder
  .add(camera.position, "x")
  .min(-50)
  .max(50)
  .step(0.001)
  .name("Camera X");
cameraFolder
  .add(camera.position, "y")
  .min(-50)
  .max(50)
  .step(0.001)
  .name("Camera Y");
cameraFolder
  .add(camera.position, "z")
  .min(-50)
  .max(50)
  .step(0.001)
  .name("Camera Z");
//camera look at

/**
 * Orbit Controls
 */
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.maxPolarAngle = Math.PI / 2;
controls.minDistance = 10;
controls.maxDistance = 1000;

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
  const deltaTime = clock.getDelta();

  // Update mixer
  if (mixer) {
    mixer.update(deltaTime);
  }

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
