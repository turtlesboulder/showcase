import './style.css';
import { calculateTrajectory } from './physics.js';
import { drawTrajectory } from './visualizer.js';

// DOM Elements
const canvas = document.getElementById('simulationCanvas');
const inputs = {
  velocity: document.getElementById('velocity'),
  angle: document.getElementById('angle'),
  mass: document.getElementById('mass'),
  gravity: document.getElementById('gravity'),
  drag: document.getElementById('drag'),
  density: document.getElementById('density'),
  variableDensity: document.getElementById('variable-density'),
};

const displays = {
  velocity: document.getElementById('val-velocity'),
  angle: document.getElementById('val-angle'),
  mass: document.getElementById('val-mass'),
};

const stats = {
  height: document.getElementById('stat-height'),
  distance: document.getElementById('stat-distance'),
  time: document.getElementById('stat-time'),
};

// State
let animationFrameId;

function resizeCanvas() {
  const container = canvas.parentElement;
  canvas.width = container.clientWidth;
  canvas.height = container.clientHeight;
  update();
}

function update() {
  // Read values
  const params = {
    velocity: parseFloat(inputs.velocity.value),
    angle: parseFloat(inputs.angle.value),
    mass: parseFloat(inputs.mass.value),
    gravity: parseFloat(inputs.gravity.value),
    dragCoefficient: parseFloat(inputs.drag.value),
    airDensity: parseFloat(inputs.density.value),
    variableDensity: inputs.variableDensity.checked,
    // Assume standard area for now or derive from mass if we wanted to be fancy
    // For this sim, we'll keep area constant or maybe add it later if needed.
    // Using default from physics.js if not passed, but let's pass a reasonable default.
    area: 0.01
  };

  // Update value displays
  displays.velocity.textContent = params.velocity;
  displays.angle.textContent = params.angle;
  displays.mass.textContent = params.mass;

  // Calculate
  const result = calculateTrajectory(params);

  // Update Stats
  stats.height.textContent = result.maxHeight.toFixed(1) + ' m';
  stats.distance.textContent = result.totalDistance.toFixed(1) + ' m';
  stats.time.textContent = result.flightTime.toFixed(1) + ' s';

  // Draw
  drawTrajectory(canvas, result.points);
}

// Event Listeners
Object.values(inputs).forEach(input => {
  input.addEventListener('input', update);
  input.addEventListener('change', update); // For checkbox
});

window.addEventListener('resize', resizeCanvas);

// Initial call
resizeCanvas();
