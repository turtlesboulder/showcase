import temporarySprites from "../data/temporarySprites.mjs";
import Sprite from "./Sprite.mjs";

export default class TemporarySprite{
    constructor(name, scale, owner){
        this.name = name;
        this.sprite = null;
        this.timer = 1; // Timer counts down
        this.maxTimer = 1;
        this.scale = scale;
        this.owner = owner;
        this.x = -1; 
        this.y = -1; 

        for (let i = 0; i < temporarySprites.length; i++){
            if (temporarySprites[i].Name == name){
                this.timer = temporarySprites[i].TotalDuration;
                this.maxTimer = this.timer;
                let images = [];
                for (let imageSource of temporarySprites[i].Images){
                    let image = new Image();
                    image.src = imageSource;
                    images.push(image);
                }
                this.sprite = new Sprite(owner.sprite.ctx, owner.sprite.camera, images, temporarySprites[i].ImageDuration);
            }
        }
    }
    draw(gridSize){
        if (this.timer <= 0){
            return;
        }
        this.sprite.draw(this.x*gridSize, this.y*gridSize, this.scale, 0, true)
        this.timer --;
    }
    reset(){
        this.timer = this.maxTimer;
        this.sprite.animationState = 0;
    }
    setXY(x, y){
        this.x = x;
        this.y = y;
    }
}