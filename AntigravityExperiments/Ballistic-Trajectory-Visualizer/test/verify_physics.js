
import { calculateTrajectory } from '../src/physics.js';

console.log('Verifying Physics Engine...');

// Test 1: Simple projectile motion (no drag)
// Range R = (v^2 * sin(2*theta)) / g
// v = 10, theta = 45, g = 9.81
// R = (100 * 1) / 9.81 = 10.1936...
const test1 = calculateTrajectory({
    velocity: 10,
    angle: 45,
    gravity: 9.81,
    mass: 1,
    dragCoefficient: 0, // No drag
    airDensity: 0,
    area: 0.01
});

console.log('Test 1 (No Drag):');
console.log('Expected Distance: ~10.19 m');
console.log('Actual Distance:  ', test1.totalDistance.toFixed(2) + ' m');

if (Math.abs(test1.totalDistance - 10.19) < 0.1) {
    console.log('PASS');
} else {
    console.log('FAIL');
}

// Test 2: Vertical launch (no drag)
// Max Height H = v^2 / (2g)
// v = 10, theta = 90
// H = 100 / 19.62 = 5.096...
const test2 = calculateTrajectory({
    velocity: 10,
    angle: 90,
    gravity: 9.81,
    mass: 1,
    dragCoefficient: 0,
    airDensity: 0,
    area: 0.01
});

console.log('\nTest 2 (Vertical):');
console.log('Expected Height: ~5.10 m');
console.log('Actual Height:  ', test2.maxHeight.toFixed(2) + ' m');

if (Math.abs(test2.maxHeight - 5.10) < 0.1) {
    console.log('PASS');
} else {
    console.log('FAIL');
}

// Test 3: With Drag (Qualitative)
// Distance should be less than Test 1
const test3 = calculateTrajectory({
    velocity: 10,
    angle: 45,
    gravity: 9.81,
    mass: 1,
    dragCoefficient: 0.47,
    airDensity: 1.225,
    area: 0.01
});

console.log('\nTest 3 (With Drag):');
console.log('No Drag Distance: ', test1.totalDistance.toFixed(2) + ' m');
console.log('With Drag Distance:', test3.totalDistance.toFixed(2) + ' m');

if (test3.totalDistance < test1.totalDistance) {
    console.log('PASS (Drag reduced distance)');
} else {
    console.log('FAIL (Drag did not reduce distance)');
}

// Test 4: Variable Density (High Altitude)
// Should travel further than constant sea-level density (Test 3)
const test4 = calculateTrajectory({
    velocity: 300, // High velocity to reach altitude
    angle: 45,
    gravity: 9.81,
    mass: 50,
    dragCoefficient: 0.47,
    airDensity: 1.225,
    area: 0.01,
    variableDensity: true
});

const test4_constant = calculateTrajectory({
    velocity: 300,
    angle: 45,
    gravity: 9.81,
    mass: 50,
    dragCoefficient: 0.47,
    airDensity: 1.225,
    area: 0.01,
    variableDensity: false
});

console.log('\nTest 4 (Variable Density):');
console.log('Constant Density Distance: ', test4_constant.totalDistance.toFixed(2) + ' m');
console.log('Variable Density Distance: ', test4.totalDistance.toFixed(2) + ' m');

if (test4.totalDistance > test4_constant.totalDistance) {
    console.log('PASS (Variable density increased range)');
} else {
    console.log('FAIL (Variable density did not increase range)');
}
