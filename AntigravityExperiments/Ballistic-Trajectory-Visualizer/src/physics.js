
/**
 * Calculates the trajectory of a projectile.
 * @param {Object} params
 * @param {number} params.velocity - Initial velocity in m/s
 * @param {number} params.angle - Launch angle in degrees
 * @param {number} params.gravity - Gravity in m/s^2 (positive value, acting down)
 * @param {number} params.mass - Mass in kg
 * @param {number} params.dragCoefficient - Drag coefficient (dimensionless)
 * @param {number} params.airDensity - Air density in kg/m^3
 * @param {number} params.area - Cross-sectional area in m^2
 * @param {number} params.timeStep - Simulation time step in seconds
 * @param {boolean} params.variableDensity - Whether to use altitude-dependent air density
 * @returns {Object} Result containing points and stats
 */
export function calculateTrajectory({
    velocity,
    angle,
    gravity = 9.81,
    mass = 1,
    dragCoefficient = 0.47, // Sphere
    airDensity = 1.225, // Sea level
    area = 0.01, // Radius ~5.6cm
    timeStep = 0.01,
    variableDensity = false
}) {
    const points = [];
    const rad = (angle * Math.PI) / 180;

    let x = 0;
    let y = 0;
    let vx = velocity * Math.cos(rad);
    let vy = velocity * Math.sin(rad);
    let t = 0;

    let maxHeight = 0;

    points.push({ x, y, t });

    // Safety limit to prevent infinite loops
    const MAX_STEPS = 100000; // Increased for long range
    let steps = 0;

    while (y >= 0 && steps < MAX_STEPS) {
        // Calculate velocity magnitude
        const v = Math.sqrt(vx * vx + vy * vy);

        // Determine current air density
        let currentDensity = airDensity;
        if (variableDensity) {
            // Barometric formula: rho = rho0 * exp(-h / H)
            // Scale height H approx 8500m
            const H = 8500;
            currentDensity = airDensity * Math.exp(-y / H);
        }

        // Drag force magnitude: Fd = 0.5 * rho * v^2 * Cd * A
        const Fd = 0.5 * currentDensity * v * v * dragCoefficient * area;

        // Drag components (opposite to velocity)
        // Fdx = -Fd * (vx / v)
        // Fdy = -Fd * (vy / v)
        const ax = -(Fd * (vx / v)) / mass;
        const ay = -gravity - (Fd * (vy / v)) / mass;

        // Update velocity
        vx += ax * timeStep;
        vy += ay * timeStep;

        // Update position
        x += vx * timeStep;
        y += vy * timeStep;
        t += timeStep;

        if (y > maxHeight) maxHeight = y;

        points.push({ x, y, t });
        steps++;
    }

    // Linear interpolation for precise landing point
    if (points.length > 1) {
        const last = points[points.length - 1];
        const prev = points[points.length - 2];

        if (last.y < 0) {
            // Find fraction of time step where y=0
            // y = prev.y + (last.y - prev.y) * fraction = 0
            // fraction = -prev.y / (last.y - prev.y)
            const fraction = -prev.y / (last.y - prev.y);

            last.x = prev.x + (last.x - prev.x) * fraction;
            last.y = 0;
            last.t = prev.t + (last.t - prev.t) * fraction;
        }
    }

    return {
        points,
        maxHeight,
        totalDistance: points[points.length - 1].x,
        flightTime: points[points.length - 1].t
    };
}
