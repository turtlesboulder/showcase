import { degToRad } from "./helpers.mjs";
export default class Sprite{
    constructor(ctx, camera, images, animationTime = 15){
        this.ctx = ctx;
        this.camera = camera;
        this.animationList = [];
        for (let i = 0; i < images.length; i++){
            this.animationList.push(images[i]);
        }
        // Old code, send in a bunch of strings instead of images
        /*for (let i = 0; i < filenames.length; i++){
            let image = new Image();
            image.src = filenames[i];
            image.classList.add("taco");
            this.animationList.push(image);
        }*/
        this.animationState = 0;
        this.width = this.animationList[0].width;
        this.height = this.animationList[0].height;
        this.timer  = 0; // Timer counts up
        this.animationTime = animationTime;

        this.MARGIN = 0;
        // this.MARGIN is set externally by character class
    }
    draw(x, y, scale, rotation, nextAnimation=true) {
        // Assuming 0, 0 is the top-left hand corner of the screen

        let windowWidth = this.ctx.canvas.width;
        let windowHeight = this.ctx.canvas.height;
        let image = this.animationList[this.animationState];
    
        // Apply camera zoom
        scale *= this.camera.zoom;
        let width = image.width * scale;
        let height = image.height * scale;

    
        // Adjust to the camera's position and zoom
        x = (x - this.camera.x) * this.camera.zoom + (this.camera.width / 2) * (1 - this.camera.zoom);
        y = (y - this.camera.y) * this.camera.zoom + (this.camera.height / 2) * (1 - this.camera.zoom);

    
        // Draw the center of the object over its position
        x += this.MARGIN*this.camera.zoom / 2;
        y += this.MARGIN*this.camera.zoom / 2;
    
        // Don't draw if off screen
        if (x > windowWidth || y > windowHeight){
            return;
        }
        if (x + width < 0 || y + height < 0){
            return;
        }
        this.ctx.save();
        // Translate to the center of the object so that rotation works
        this.ctx.translate(x + (width / 2), y + (height / 2));
        this.ctx.rotate(degToRad(rotation));
        // Draw the image with negative half width and height
        this.ctx.drawImage(this.animationList[this.animationState], -width / 2, -height / 2, width, height);
    
        this.ctx.restore();

        if (nextAnimation){
            this.timer ++;
            if (this.timer >= this.animationTime){
                this.timer = 0;
                this.animationState ++;
                if (this.animationState >= this.animationList.length){
                    this.animationState = 0;
                }
            }
        }
    }
}