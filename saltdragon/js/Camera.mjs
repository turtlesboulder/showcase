import { computeDistance } from "./helpers.mjs";

export default class Camera{
    constructor(ctx, board){
        this.ctx = ctx;
        this.x = 0;
        this.y = 0;
        this.zoom = 1;
        this.moving = false;
        this.desX = null;
        this.desY = null;
        this.dx = 0;
        this.dy = 0;
        this.timer = 0;
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.KEYSPEED = 10;
        this.SPEEDUP = 0.25;
        this.FRICTION = 1.2;
        this.CATCHUP = 5; // Lower number is faster
        this.right = false;
        this.left = false;
        this.up = false;
        this.down = false;
        this.MINZOOM = 0.5;
        this.MAXZOOM = 3;
        this.ZOOMSPEED = 0.05;
        this.board = null; // This is set in the board constructor to avoid a circular refrence

        this.addEventListeners();
    }

    focus(x, y, speed){
        x = x - this.width/(2);
        y = y - this.height/(2);
        // Make it appear slightly more centered due to the canvas not touching the top of the computer's screen
        y+= 30/this.zoom;
        // Speed value of about 1 is reasonable, the bigger the longer it takes
        let dist = Math.pow(computeDistance(x, y, this.x, this.y), 0.5);
        speed = speed * dist;
        this.moving = true;
        this.desX = x;
        this.desY = y;
        this.timer = speed;
        this.dx = (x - this.x)/speed;
        this.dy = (y - this.y)/speed;
    }

    focusCharacter(character){
        let x = character.gridX * this.board.gridSize;
        let y = character.gridY * this.board.gridSize;

        // I think it looks a little better with these adjustments
        x += character.sprite.width * 0.15;
        y += character.sprite.width * 0.2;

        let speed = 0.5;
        this.focus(x, y, speed);
    }

    step(){
        // Wipe everything
        this.ctx.fillStyle = "rgb(100, 100, 100)";
        this.ctx.fillRect(0, 0, this.ctx.width, this.ctx.height);

        if (!this.moving){
            this.x += this.dx;
            this.y += this.dy;
        }else{
            this.x += this.dx;
            this.y += this.dy;
        }
        

        if (this.moving){
            this.timer --;
            if (this.timer <= 0){
                this.moving = false;
                this.x = this.desX;
                this.y = this.desY;
                this.dx = 0;
                this.dy = 0;
                this.timer = 0;
                this.desX = null;
                this.desY = null;
            }
        }else{
            if (this.dx > 0 && !this.right){
                this.dx /= this.FRICTION;
            }
            if (this.dy > 0 && !this.down){
                this.dy /= this.FRICTION;
            }
            if (this.dx < 0 && !this.left){
                this.dx /= this.FRICTION;
            }
            if (this.dy < 0 && !this.up){
                this.dy /=this.FRICTION;
            }
            if (Math.abs(this.dx) < 0.5){
                this.dx = 0;
            }
            if (Math.abs(this.dy) < 0.5){
                this.dy = 0;
            }
        }

        this.applyControls();
    }

    applyControls(){
        if (this.moving){
            return;
        }
        if (this.right){
            if (this.dx < this.KEYSPEED){
                this.dx += this.KEYSPEED/this.CATCHUP;
            }else{
                this.dx += this.SPEEDUP;
            }
        }
        if (this.down){
            if (this.dy < this.KEYSPEED){
                this.dy += this.KEYSPEED/this.CATCHUP;
            }else{
                this.dy += this.SPEEDUP;
            }
        }
        if (this.left){
            if (this.dx > -this.KEYSPEED){
                this.dx += -this.KEYSPEED/this.CATCHUP;
            }else{
                this.dx -= this.SPEEDUP;
            }
        }
        if (this.up){
            if (this.dy > -this.KEYSPEED){
                this.dy += -this.KEYSPEED/this.CATCHUP;
            }else{
                this.dy -= this.SPEEDUP;
            }
        }
    }

    instantMove(x, y){
        this.x = x;
        this.y = y;
    }
    keyStartMove(e){
        // Move the camera. WASD by default.
        if (this.moving){
            return;
        }
        if (e.key == "d"){
            e.preventDefault();
            this.right = true;
        }
        if (e.key == "a"){
            e.preventDefault();
            this.left = true;
        }
        if (e.key == "w"){
            e.preventDefault();
            this.up = true;
        }
        if (e.key == "s"){
            e.preventDefault();
            this.down = true;
        }
    }
    keyEndMove(e){
        // Move the camera. WASD by default.
        if (e.key == "d"){
            e.preventDefault();
            this.right = false;
        }
        if (e.key == "a"){
            e.preventDefault();
            this.left = false;
        }
        if (e.key == "w"){
            e.preventDefault();
            this.up = false;
        }
        if (e.key == "s"){
            e.preventDefault();
            this.down = false;
        }
    }
    endMovement(){
        this.right = false;
        this.left = false;
        this.up = false;
        this.down = false;
    }
    keyZoom(e){
        const wheelDelta = e.deltaY;
        if (wheelDelta > 0) {
            // Zoom out
            this.zoom -= this.ZOOMSPEED*this.zoom;
        } else {
            // Zoom in
            this.zoom += this.ZOOMSPEED*this.zoom;
        }

        this.zoom = Math.min(Math.max(this.zoom, this.MINZOOM), this.MAXZOOM);
    }

    addEventListeners(){
        let canvas = this.ctx.canvas;

        // Adjust where the center of the screen is based on the size of the side panel
        const resizeObserver = new ResizeObserver(entries => {
            for (let entry of entries) {
                // Should only ever be an array of 1 at most
                this.width = window.innerWidth - entry.contentRect.width;
                this.board.sidePanel.resizeText();
            }
        });   
        resizeObserver.observe(document.querySelector("#side-panel"));
    }

}