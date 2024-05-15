void main() {
    // Set position in front of the camera in view space
    gl_Position = projectionMatrix * viewMatrix * vec4(position, 1.0);
}