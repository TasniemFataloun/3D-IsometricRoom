import GUI from 'lil-gui'
import * as THREE from 'three'
import { gsap } from 'gsap'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import firefliesVertexShader from './shaders/fireflies/vertex.glsl'
import firefliesFragmentShader from './shaders/fireflies/fragment.glsl'
import portalVertexShader from './shaders/portal/vertex.glsl'
import portalFragmentShader from './shaders/portal/fragment.glsl'
import flagVertexShader from './shaders/flag/vertex.glsl'
import flagFragmentShader from './shaders/flag/fragment.glsl'
import waterVertexShader from './shaders/water/vertex.glsl'
import waterFragmentShader from './shaders/water/fragment.glsl'
import smokeVertexShader from './shaders/smoke/vertex.glsl'
import smokeFragmentShader from './shaders/smoke/fragment.glsl'
import overlayFragmentShader from './shaders/overlay/fragment.glsl'
import overlayVertexShader from './shaders/overlay/vertex.glsl'

/**
 * Base
 */
// Debug
const gui = new GUI({
    width: 400
})
gui.close();
gui.hide();

if(window,location.hash === '#debug'){
    gui.show()
}

const shaderTweaks = gui.addFolder('Shader');
const wellTweaks = shaderTweaks.addFolder('Well');
wellTweaks.close();
const waveTweaks = shaderTweaks.addFolder('Wave');
waveTweaks.close();
const flagTweaks = shaderTweaks.addFolder('Flag');
flagTweaks.close();
const fireflyTweaks = shaderTweaks.addFolder('Firefly');
fireflyTweaks.close();

shaderTweaks.close();

const cameraTweaks = gui.addFolder('Camera');
cameraTweaks.close();

const emissionTweaks = gui.addFolder('Emission');
emissionTweaks.close();

const debugObject = {};

const loadingBarBackground = document.querySelector('.loading-background')
const loadingBarElement = document.querySelector('.loading-bar')
const percentage = document.querySelector('.percentage')
let sceneReady = false
const loadingManager = new THREE.LoadingManager(
    // Loaded
    () =>
    {
        // ...
        window.setTimeout(() =>
        {
            loadingBarBackground.classList.add('ended')
            loadingBarBackground.style.transform = ''
            loadingBarElement.classList.add('ended')
            percentage.classList.add('ended')
            loadingBarElement.style.transform = ''
            percentage.style.transform = ''
        }, 500);
        window.setTimeout(() =>
        {
            sceneReady = true
        }, 3500)
    },
    (itemUrl, itemsLoaded, itemsTotal) =>
        {
            const progressRatio = itemsLoaded / itemsTotal
            loadingBarElement.style.transform = `scaleX(${progressRatio})`
            percentage.innerText = (progressRatio * 100).toFixed(0) + ' %'
        }

    // ...
)


// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Loaders
 */
// Texture loader
const textureLoader = new THREE.TextureLoader(loadingManager)

// Draco loader
const dracoLoader = new DRACOLoader()
dracoLoader.setDecoderPath('draco/')

// GLTF loader
const gltfLoader = new GLTFLoader(loadingManager)
gltfLoader.setDRACOLoader(dracoLoader)





/**
 * Object
 */

/**
 * Textures
 */
const bakedTexture1 = textureLoader.load('textures/baked_1.jpg');
bakedTexture1.flipY = false;
bakedTexture1.colorSpace = THREE.SRGBColorSpace;

const bakedTexture2 = textureLoader.load('textures/baked_2.jpg');
bakedTexture2.flipY = false;
bakedTexture2.colorSpace = THREE.SRGBColorSpace;

const bakedGrassTexture = textureLoader.load('textures/baked_grass.jpg');
bakedGrassTexture.flipY = false;
bakedGrassTexture.colorSpace = THREE.SRGBColorSpace;

const bakedFlagAndMapTexture = textureLoader.load('textures/baked_flags.jpg');
bakedFlagAndMapTexture.flipY = false;
bakedFlagAndMapTexture.colorSpace = THREE.SRGBColorSpace;

const plantRedTexture = textureLoader.load('textures/plant_red.png');
plantRedTexture.flipY = false;
plantRedTexture.colorSpace = THREE.SRGBColorSpace;

const plantBlueTexture = textureLoader.load('textures/plant_blue.png');
plantBlueTexture.flipY = false;
plantBlueTexture.colorSpace = THREE.SRGBColorSpace;

const crateTexture = textureLoader.load('textures/baked_crates.jpg');
crateTexture.flipY = false;
crateTexture.colorSpace = THREE.SRGBColorSpace;

const perlinTexture = textureLoader.load('textures/perlin.png');
perlinTexture.wrapS = THREE.RepeatWrapping;
perlinTexture.wrapT = THREE.RepeatWrapping;
/**
 * Materials
 */

//Baked Material

const bakedMaterial1 = new THREE.MeshBasicMaterial({
    map: bakedTexture1
})

const bakedMaterial2 = new THREE.MeshBasicMaterial({
    map: bakedTexture2
})

const bakedGrassMaterial = new THREE.MeshBasicMaterial({
    map: bakedGrassTexture
})

const bakedFlagAndMapMaterial = new THREE.MeshBasicMaterial({
    map: bakedFlagAndMapTexture
})

const bakedCrateMaterial = new THREE.MeshBasicMaterial({
    map: crateTexture
})

debugObject.windowRed = '#FFB573'
const windowRedMaterial = new THREE.MeshBasicMaterial({
    color: '#FFB573'
})

emissionTweaks.addColor(debugObject, 'windowRed').onChange(() => {
    windowRedMaterial.color.set(debugObject.windowRed);
}).name('Window Red Color');

debugObject.windowBlue = '#66CCFA'
const windowBlueMaterial = new THREE.MeshBasicMaterial({
    color: '#66CCFA'
})

emissionTweaks.addColor(debugObject, 'windowBlue').onChange(() => {
    windowBlueMaterial.color.set(debugObject.windowBlue);
}).name('Window Blue Color');

const yellowDrinkMaterial = new THREE.MeshBasicMaterial({
    color: '#FFD711'
})

const redDrinkMaterial = new THREE.MeshBasicMaterial({
    color: '#FF4400'
})

debugObject.portalColorStart = '#8ff9ff'
debugObject.portalColorEnd = '#ffffff'

wellTweaks.addColor(debugObject, 'portalColorStart').onChange(() => {
    wellMaterial.uniforms.uColorStart.value.set(debugObject.portalColorStart);
}).name('Portal Color Start');

wellTweaks.addColor(debugObject, 'portalColorEnd').onChange(() => {
    wellMaterial.uniforms.uColorEnd.value.set(debugObject.portalColorEnd);
}).name('Portal Color End');

const wellMaterial = new THREE.ShaderMaterial({
    uniforms: {
        uTime: {value: 0},
        uColorStart: {value: new THREE.Color(debugObject.portalColorStart)},
        uColorEnd: {value: new THREE.Color(debugObject.portalColorEnd)},
    },
    vertexShader: portalVertexShader,
    fragmentShader: portalFragmentShader
})

debugObject.infernalDragonColor = '#FF2200'
const infernalDragonMaterial = new THREE.MeshBasicMaterial({
    color: '#FF2200'
})

emissionTweaks.addColor(debugObject, 'infernalDragonColor').onChange(() => {
    infernalDragonMaterial.color.set(debugObject.infernalDragonColor);
}).name('Infernal Dragon Color')

debugObject.earthDragonColor = '#cc3300'
const EarthDragonMaterial = new THREE.MeshBasicMaterial({
    color: '#cc3300'
})

emissionTweaks.addColor(debugObject, 'earthDragonColor').onChange(() => {
    EarthDragonMaterial.color.set(debugObject.earthDragonColor);
}).name('Earth Dragon Color')

debugObject.depthColor = '#186691';
debugObject.surfaceColor = '#9bd8ff';
const waterMaterial = new THREE.ShaderMaterial({
    vertexShader: waterVertexShader,
    fragmentShader: waterFragmentShader,
    uniforms: {
        uTime: {value: 0},

        uBigWavesElevation: {value: 0.01},
        uBigWavesFrequency: {value: new THREE.Vector2(3.5, 6)},
        uBigWavesSpeed: {value: 0.6},

        uDepthColor: {value: new THREE.Color(debugObject.depthColor)},
        uSurfaceColor: {value: new THREE.Color(debugObject.surfaceColor)},
        uColorOffset: {value: 0.79},
        uColorMultiplier: {value: 1.5},
    }
});

waveTweaks.add(waterMaterial.uniforms.uBigWavesFrequency.value, 'x').min(0).max(10).step(0.01).name('Waves Frequency X')
waveTweaks.add(waterMaterial.uniforms.uBigWavesFrequency.value, 'y').min(0).max(10).step(0.01).name('Waves Frequency Y')
waveTweaks.add(waterMaterial.uniforms.uBigWavesElevation, 'value').min(0).max(1).step(0.01).name('Waves Elevation')
waveTweaks.add(waterMaterial.uniforms.uBigWavesSpeed, 'value').min(0).max(5).step(0.01).name('Waves Speed')
waveTweaks.addColor(debugObject, 'depthColor').onChange(() => {
    waterMaterial.uniforms.uDepthColor.value.set(debugObject.depthColor);
}).name('Waves Depth Color');
waveTweaks.addColor(debugObject, 'surfaceColor').onChange(() => {
    waterMaterial.uniforms.uSurfaceColor.value.set(debugObject.surfaceColor);
}).name('Waves Surface Color');
waveTweaks.add(waterMaterial.uniforms.uColorOffset, 'value').min(0).max(1).step(0.01).name('Waves Color Offset')
waveTweaks.add(waterMaterial.uniforms.uColorMultiplier, 'value').min(0).max(10).step(0.01).name('Waves Color Multiplier')

const candleWickMaterial = new THREE.MeshBasicMaterial({
    color: '#FFff00'
})

const redPlantMaterial = new THREE.MeshBasicMaterial({
    map: plantRedTexture,
    alphaTest: 0.5
})

const bluePlantMaterial = new THREE.MeshBasicMaterial({
    map: plantBlueTexture,
    alphaTest: 0.5
})
/**
 * Model
 */
const flagMaterial = new THREE.ShaderMaterial({
    vertexShader: flagVertexShader,
    fragmentShader: flagFragmentShader,
    uniforms: {
        uFrequency: {value: new THREE.Vector2(8.5, 3.5)},
        uTime: {value: 0},
        uColor: {value: new THREE.Color('orange')},
        uTexture: {value: bakedFlagAndMapTexture},
        uFlagSpeed: {value: 1.0}
    }
})

flagTweaks.add(flagMaterial.uniforms.uFrequency.value, 'x').min(0).max(20).step(0.01).name('Flag Frequency X')
flagTweaks.add(flagMaterial.uniforms.uFrequency.value, 'y').min(0).max(20).step(0.01).name('Flag Frequency Y')
flagTweaks.add(flagMaterial.uniforms.uFlagSpeed, 'value').min(0).max(5).step(0.01).name('Flag Speed')


/**
 * Smoke
 */

const smokeGeometry = new THREE.PlaneGeometry(1, 1, 16, 64)
smokeGeometry.scale(1.5,6,1.5)

const smokeMaterial = new THREE.ShaderMaterial({
    // wireframe: true,
    side: THREE.DoubleSide,
    vertexShader: smokeVertexShader,
    fragmentShader: smokeFragmentShader,
    transparent: true,
    depthWrite: false,
    uniforms: {
        uTime: new THREE.Uniform(0),
        uPerlinTexture: new THREE.Uniform(perlinTexture),
    }
})

const smokeMaterial2 = new THREE.ShaderMaterial({
    // wireframe: true,
    side: THREE.DoubleSide,
    vertexShader: smokeVertexShader,
    fragmentShader: smokeFragmentShader,
    transparent: true,
    depthWrite: false,
    uniforms: {
        uTime: new THREE.Uniform(0),
        uPerlinTexture: new THREE.Uniform(perlinTexture),
    }
})

const smoke1 = new THREE.Mesh(smokeGeometry, smokeMaterial)
smoke1.position.set(3.85, 1.05, -2.77)
smoke1.scale.set(0.08, 0.12, 0.08)
scene.add(smoke1)

const smoke2 = new THREE.Mesh(smokeGeometry, smokeMaterial2)
smoke2.position.set(5.4, 1.05, -3.23)
smoke2.scale.set(0.08, 0.12, 0.08)
scene.add(smoke2)


const group = new THREE.Group();
scene.add(group);

let mixer = null;
gltfLoader.load(
    'models/room_part_1.glb',
    (gltf) =>
    {
        mixer = new THREE.AnimationMixer(gltf.scene);
        const action = mixer.clipAction(gltf.animations[0])
        action.play();

        gltf.scene.traverse((child) =>
        {
            if(child.isMesh){
                child.material = bakedMaterial1;
            }
        });

        //find the child named water
        gltf.scene.children.find(child => child.name === 'water').material = waterMaterial
        group.add(gltf.scene);
    }
)

let mixerPoro = null;
gltfLoader.load(
    'models/room_part_2.glb',
    (gltf) =>
    {
        mixerPoro = new THREE.AnimationMixer(gltf.scene);
        const action = mixerPoro.clipAction(gltf.animations[0])
        action.play();
        gltf.scene.traverse((child) =>
        {
            if(child.isMesh){
                child.material = bakedMaterial2;
            }
        });
   

        group.add(gltf.scene)
    }
)

gltfLoader.load(
    'models/room_part_3.glb',
    (gltf) =>
    {
        gltf.scene.traverse((child) =>
        {
            if(child.isMesh){
                child.material = bakedFlagAndMapMaterial;
            }
        });

        //if it includes the name banner add a shadermaterial 
        gltf.scene.children.forEach((child) => {
            if(child.name.includes('banner')){
                child.material = flagMaterial
            }
        })

        

        group.add(gltf.scene)
    }
)

gltfLoader.load(
    'models/room_part_4.glb',
    (gltf) =>
    {
        gltf.scene.children.find((child) => child.name === 'bush_left').material = redPlantMaterial
        gltf.scene.children.find((child) => child.name === 'bush_right').material = bluePlantMaterial

        group.add(gltf.scene)
    }
)

let mixerGrass = null;
gltfLoader.load(
    'models/room_part_5.glb',
    (gltf) =>
    {
        mixerGrass = new THREE.AnimationMixer(gltf.scene);
        const action = mixerGrass.clipAction(gltf.animations[0])

        action.play();
        gltf.scene.traverse((child) =>
        {
            if(child.isMesh){
                child.material = bakedGrassMaterial;
            }
        });

        group.add(gltf.scene)
    }
)

gltfLoader.load(
    'models/room_emissions.glb',
    (gltf) =>
    {
        gltf.scene.traverse((child) =>
        {
            if(child.isMesh){
                child.material = waterMaterial;
            }
        });

        gltf.scene.children.find((child) => child.name === 'red_light').material = windowRedMaterial
        gltf.scene.children.find((child) => child.name === 'blue_light').material = windowBlueMaterial
        gltf.scene.children.find((child) => child.name === 'drink_yellow').material = yellowDrinkMaterial
        gltf.scene.children.find((child) => child.name === 'drink_red').material = redDrinkMaterial
        gltf.scene.children.find((child) => child.name === 'earth_dragon').material = EarthDragonMaterial
        gltf.scene.children.find((child) => child.name === 'fire_dragon').material = infernalDragonMaterial
        gltf.scene.children.find((child) => child.name === 'well_light').material = wellMaterial

        gltf.scene.children.forEach((child) => {
            if(child.name.includes('candle')){
                child.material = candleWickMaterial
            }
        })


        group.add(gltf.scene)
    }
)

gltfLoader.load(
    'models/room_crates.glb',
    (gltf) =>
    {
        gltf.scene.traverse((child) =>
        {
            if(child.isMesh){
                child.material = bakedCrateMaterial;
            }
        });
        group.add(gltf.scene)
    }
)

group.position.y = -1.5

/**
 * Fireflies
 */

//Geometry
const firefliesGeometry = new THREE.BufferGeometry()
const firefliesCount = 20
const positionArray = new Float32Array(firefliesCount * 3);
const scaleArray = new Float32Array(firefliesCount);

for(let i = 0; i < firefliesCount; i++){
    positionArray[i * 3 + 0] = (Math.random() + .7) * 3.5
    positionArray[i * 3 + 1] = (Math.random() -.5) * 1
    positionArray[i * 3 + 2] = (Math.random() + .7) * 3.5

    scaleArray[i] = Math.random()
}

firefliesGeometry.setAttribute('position', new THREE.BufferAttribute(positionArray, 3))
firefliesGeometry.setAttribute('aScale', new THREE.BufferAttribute(scaleArray, 1))

//Material
const firefliesMaterial = new THREE.ShaderMaterial({
    uniforms: {
        uPixelRatio: {value: Math.min(window.devicePixelRatio, 2)},
        uSize: {value: 250},
        uTime: {value: 0}
    },
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    vertexShader: firefliesVertexShader,
    fragmentShader: firefliesFragmentShader
})

fireflyTweaks.add(firefliesMaterial.uniforms.uSize, 'value').min(0).max(500).step(1).name('Fireflies Size')

//Points
const fireflies = new THREE.Points(firefliesGeometry, firefliesMaterial)
scene.add(fireflies)



/**
 * POI
 */

const points = [
    {
        position: new THREE.Vector3(4.7, 0.7, - 2.9),
        element: document.querySelector('.point-0')
    },
    {
        position: new THREE.Vector3(-1.8, 0.6, 5.4),
        element: document.querySelector('.point-1')
    },
    {
        position: new THREE.Vector3(-3.5, 1.6, -3.6),
        element: document.querySelector('.point-2')
    }
]

debugObject.poi = true;
gui.add(debugObject, 'poi').onChange((val) => {
        for(const point of points) {
            if(!val){
                point.element.classList.remove('visible')
            }
            else{
                point.element.classList.add('visible')
            }
        }
}).name('Points of Interest')


/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

    //update fireflies
    firefliesMaterial.uniforms.uPixelRatio.value = Math.min(window.devicePixelRatio, 2)
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(45, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 4
camera.position.y = 17
camera.position.z = 4
camera.lookAt(new THREE.Vector3(0, 1, 0))
scene.add(camera)
//restrict camera from going below y  = 0

cameraTweaks.add(camera.position, 'y').min(0).max(20).step(1).name('Camera Height')
cameraTweaks.add(camera.position, 'x').min(- 10).max(10).step(1).name('Camera Width')
cameraTweaks.add(camera.position, 'z').min(- 10).max(10).step(1).name('Camera Depth')

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true
controls.minDistance = 16
//set zoom to 15
controls.maxDistance = 25

controls.minPolarAngle = Math.PI / 2.7
controls.maxPolarAngle = Math.PI / 2.7

cameraTweaks.add(controls, 'minPolarAngle').min(0).max(1.6).step(0.01).name('Min Polar Angle')
cameraTweaks.add(controls, 'maxPolarAngle').min(0).max(1.6).step(0.01).name('Max Polar Angle')
cameraTweaks.add(controls, 'minDistance').min(0).max(20).step(1).name('Min Distance')
cameraTweaks.add(controls, 'maxDistance').min(10).max(40).step(1).name('Max Distance')


/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.setClearColor(0x555555)


/**
 * Animate
 */

const raycaster = new THREE.Raycaster()

const clock = new THREE.Clock()
let time = Date.now();
const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()
    const currentTime = Date.now();
    const deltaTime = currentTime - time;
    time = currentTime;

    //update fireflies
    firefliesMaterial.uniforms.uTime.value = elapsedTime
    wellMaterial.uniforms.uTime.value = elapsedTime
    flagMaterial.uniforms.uTime.value = elapsedTime
    waterMaterial.uniforms.uTime.value = elapsedTime
    smokeMaterial.uniforms.uTime.value = elapsedTime
    smokeMaterial2.uniforms.uTime.value = elapsedTime * 1.2


    // Update controls
    controls.update()

    if(sceneReady){
        for(const point of points)
            {
                const screenPosition = point.position.clone()
                screenPosition.project(camera)
    
                raycaster.setFromCamera(screenPosition, camera)
                const intersects = raycaster.intersectObjects(scene.children, true)
    
                if(intersects.length === 0 && debugObject.poi)
                    {
                        point.element.classList.add('visible')
                    }
                    else
                    {
                        const intersectionDistance = intersects[0].distance
                        const pointDistance = point.position.distanceTo(camera.position)
            
                        if(intersectionDistance < pointDistance)
                        {
                            point.element.classList.remove('visible')
                        }
                        else if(intersectionDistance > pointDistance && debugObject.poi)
                        {
                            point.element.classList.add('visible')
                        }
                    }
        
                const translateX = screenPosition.x * sizes.width * 0.5
                const translateY = - screenPosition.y * sizes.height * 0.5
                point.element.style.transform = `translateX(${translateX}px) translateY(${translateY}px)`
            }
    }
    


    if(mixer){
        mixer.update(deltaTime * 0.001);
    }

    mixerGrass && mixerGrass.update(deltaTime * 0.0014);
    mixerPoro && mixerPoro.update(deltaTime * 0.0009);
    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()