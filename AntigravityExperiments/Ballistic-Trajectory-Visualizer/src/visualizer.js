
/**
 * Draws the trajectory and axes on the canvas.
 * @param {HTMLCanvasElement} canvas
 * @param {Array} points - Array of {x, y} objects
 */
export function drawTrajectory(canvas, points) {
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    if (!points || points.length === 0) return;

    // Determine bounds
    let maxX = 0;
    let maxY = 0;
    for (const p of points) {
        if (p.x > maxX) maxX = p.x;
        if (p.y > maxY) maxY = p.y;
    }

    // Add padding (10%)
    const padding = Math.min(width, height) * 0.1;
    const plotWidth = width - 2 * padding;
    const plotHeight = height - 2 * padding;

    // Determine scale
    // We want to fit the trajectory in the plot area
    // Scale = pixels / meter
    // If maxX is 0 (start), default to something
    if (maxX === 0) maxX = 10;
    if (maxY === 0) maxY = 10;

    const scaleX = plotWidth / maxX;
    const scaleY = plotHeight / maxY;

    // Use the smaller scale to maintain aspect ratio if desired, 
    // but usually for plots we might want to fill the space.
    // However, for physical trajectories, aspect ratio 1:1 is best to see the true shape.
    const scale = Math.min(scaleX, scaleY);

    // Origin position (bottom-left of plot area)
    const originX = padding;
    const originY = height - padding;

    // Helper to transform coordinates
    const toCanvasX = (x) => originX + x * scale;
    const toCanvasY = (y) => originY - y * scale;

    // Draw Grid/Axes
    ctx.strokeStyle = '#444';
    ctx.lineWidth = 1;
    ctx.beginPath();

    // Y Axis
    ctx.moveTo(originX, originY);
    ctx.lineTo(originX, originY - maxY * scale);

    // X Axis
    ctx.moveTo(originX, originY);
    ctx.lineTo(originX + maxX * scale, originY);
    ctx.stroke();

    // Draw Labels
    ctx.fillStyle = '#aaa';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';

    // X Axis Labels (5 ticks)
    const xSteps = 5;
    for (let i = 0; i <= xSteps; i++) {
        const val = (maxX * i) / xSteps;
        const cx = toCanvasX(val);
        const cy = originY + 5;
        ctx.fillText(val.toFixed(1) + 'm', cx, cy);

        // Tick
        ctx.beginPath();
        ctx.moveTo(cx, originY);
        ctx.lineTo(cx, originY + 5);
        ctx.stroke();
    }

    // Y Axis Labels (5 ticks)
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    const ySteps = 5;
    for (let i = 0; i <= ySteps; i++) {
        const val = (maxY * i) / ySteps;
        const cx = originX - 5;
        const cy = toCanvasY(val);
        ctx.fillText(val.toFixed(1) + 'm', cx, cy);

        // Tick
        ctx.beginPath();
        ctx.moveTo(originX, cy);
        ctx.lineTo(originX - 5, cy);
        ctx.stroke();
    }

    // Draw Trajectory
    ctx.strokeStyle = '#00ffcc'; // Cyan/Teal
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(toCanvasX(points[0].x), toCanvasY(points[0].y));

    for (let i = 1; i < points.length; i++) {
        ctx.lineTo(toCanvasX(points[i].x), toCanvasY(points[i].y));
    }
    ctx.stroke();

    // Draw Ground
    ctx.strokeStyle = '#666';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, originY);
    ctx.lineTo(width, originY);
    ctx.stroke();
}
