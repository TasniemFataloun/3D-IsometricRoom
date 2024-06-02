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
screen.offset.set(0.1, 0.3);
screen.repeat.set(0.9, 0.9);
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
  color: 0xffdda1,
});

const ledlightoffMaterial = new THREE.MeshBasicMaterial({
  color: 0xa8aab1,
  emissive: 0xa8aab1,
  emissiveIntensity: 0.5, // Adjust the intensity as needed
  toneMapped: false,
});

const ledlightEmission = new THREE.MeshBasicMaterial({
  color: 0xadb0e7,
  emissive: 0xadb0e7,
  emissiveIntensity: 20, // Adjust the intensity as needed
  toneMapped: false,
});

const circle = new THREE.MeshBasicMaterial({
  emissive: 0xc083e7,
  color: 0xc083e7,
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
let animations;
gltfLoader.load("/models/bedroom25.glb", (gltf) => {
  // Traverse the scene
  gltf.scene.traverse((child) => {
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

  if (gltf.animations && gltf.animations.length > 0) {
    mixer = new THREE.AnimationMixer(gltf.scene);
    gltf.animations.forEach((clip) => {
      mixer.clipAction(clip).play();
    });
    animations = gui.addFolder("Animations");

    // Pause animation
    animations
      .add(
        {
          pause: () => {
            if (mixer) {
              mixer.timeScale = 0; 
            }
          },
        },
        "pause"
      )
      .name("Pause animations");
    // Resume animation
    animations
      .add(
        {
          resume: () => {
            if (mixer) {
              mixer.timeScale = 1; 
            }
          },
        },
        "resume"
      )
      .name("Resume animations");

    // Restart animation
    animations
      .add(
        {
          restart: () => {
            if (mixer) {
              mixer.setTime(0);
              mixer.update(0);
              mixer.play();
            }
          },
        },
        "restart"
      )
      .name("Restart animations");

    // Stop animation (remove from scene)
    animations
      .add(
        {
          stop: () => {
            if (mixer) {
              mixer.stopAllAction();
            }
          },
        },
        "stop"
      )
      .name("Remove animations");
  } else {
    console.log("No animations found in the gltf file.");
  }

  scene.add(gltf.scene);
});

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

  window.requestAnimationFrame(tick);
};

tick();
