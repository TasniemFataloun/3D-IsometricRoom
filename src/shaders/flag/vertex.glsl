uniform vec2 uFrequency;
uniform float uTime;
uniform float uFlagSpeed;

varying vec2 vUv;
varying float vElevation;

void main()
{
    vec4 modelPosition = modelMatrix * vec4(position,1.0);

    float elevation = sin(modelPosition.x * uFrequency.x - uTime * uFlagSpeed) * 0.024;
    elevation += sin(modelPosition.y * uFrequency.y - uTime * uFlagSpeed) * 0.024;


    modelPosition.z += elevation;

    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;
    gl_Position = projectedPosition;
    vUv = uv;
    vElevation = elevation;
}