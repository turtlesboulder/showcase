
import Camera from "./Camera.mjs"
import boards from "../data/boards.mjs";
import Sprite from "./Sprite.mjs";
import Character from "./Character.mjs";
import settings from "../data/settings.mjs";

export default class Game{
    constructor(ctx, panel){

        // Size the game according to the user's screen
        this.BOARDWIDTH = 0.75;
        this.PANELWIDTH = 0.25;

        // set in adjustSizes method
        this.lastWindowX = null;
        this.lastWindowY = null;

        this.ctx = ctx;
        this.settings = settings;
        
        this.panel = panel;
        this.allies = [];

        this.currentState = "mainMenu";
        this.paused = false;
        this.boardIndex = 0;
        /* States:
        mainMenu
        onBoard
        */

    }
    pause(){
        if (this.paused){
            return;
        }
        this.removeControls();
        this.paused = true;
    }
    unpause(){
        if (!this.paused){
            return;
        }
        this.addControls();
        this.paused = false;
    }
    start(){
        document.querySelector("#menu").classList.add("hidden");
        
        this.camera = new Camera(this.ctx);
        this.board = boards[0](this.ctx, this.camera, "./images/dummy.png", this);
        this.adjustSizes();
        this.addControls();
        this.addEventListeners();

        // testing measures ===================================
        let image1 = new Image();
        image1.src = "./images/square2.png";

        let sprite = new Sprite(this.ctx, this.camera, [image1]);
        let char = new Character(sprite, "Hero", 1);
        char.isAlly = true;
        let char2 = new Character(sprite, "Sorcerer", 10);
        char2.isAlly = true;
        let char3 = new Character(sprite, "Alchemist", 2);
        char3.isAlly = true;

        this.allies.push(char);
        this.allies.push(char2);
        this.allies.push(char3);

        
        this.board.addCharacter(this.allies[0], 1, 4);
        this.board.addCharacter(this.allies[1], 3, 4);
        this.board.addCharacter(this.allies[2], 2, 3);
        // testing measures ===================================

        this.startBoard();

    }
    // Separated for possible await for images to load
    startBoard(){
        this.currentState = "onBoard";
        console.log("Starting!");
        this.board.startMatch();
        let step = this.step.bind(this);
        setInterval(step, settings.GameSpeed);
    }
    next(){
        // Code here
        this.boardIndex ++;
        this.board = boards[this.boardIndex](this.ctx, this.camera, "./images/dummy.png", this);

        this.board.addCharacter(this.allies[0], 1, 4);
        this.board.addCharacter(this.allies[1], 3, 4);
        this.board.addCharacter(this.allies[2], 2, 3);

        this.board.startMatch();

    }
    draw(){
        this.camera.step();
        //this.board.drawGrid(); in board.step
    }
    step(){
        if (this.paused){
            return;
        }
        this.draw(); // This will cause the camera to paint a grey square over everything, so it has to be first
        this.board.step();
        this.adjustSizes();
    }
    
    adjustSizes(){
        if (this.lastWindowX != window.innerWidth || this.lastWindowY != window.innerHeight){
            this.ctx.canvas.width = this.BOARDWIDTH * window.innerWidth;
            this.ctx.canvas.height = window.innerHeight;
            this.ctx.width = this.ctx.canvas.width;
            this.ctx.height = this.ctx.canvas.height;

            let panel = document.querySelector("#side-panel");
            panel.style.width = this.PANELWIDTH*window.innerWidth + 'px';

            this.lastWindowX = window.innerWidth;
            this.lastWindowY = window.innerHeight;
        }
    }
    addEventListeners(){
        document.addEventListener("keydown", (e)=>{
            if (e.key == "Escape"){
                if (this.paused){
                    //this.unpause();
                }else{
                    this.board.sidePanel.pausingMessage(["Paused!"]);
                    return;
                }
            }
            if (e.key == " " || e.key == "Escape"){
                this.board.sidePanel.keySpace();
                
            }
        })
    }

    addControls(){
        let canvas = this.ctx.canvas;
        this.camera.endMovement();
  
        document.onkeydown = (e)=>{
            this.camera.keyStartMove(e);
            this.board.keyDown(e);
        };
        document.onkeyup = (e)=>{
            this.camera.keyEndMove(e);
        };
        canvas.onwheel = (e)=>{
            this.camera.keyZoom(e);
        };
        canvas.onmousemove = (e)=>{
            this.board.mouseMove(e)
        };
        canvas.onclick = (e)=>{
            this.board.keyClick(e);
        }
    }
    removeControls(){
        let canvas = this.ctx.canvas;
        document.onkeydown = null;
        document.onkeyup = null;
        canvas.onwheel = null;
        canvas.onmousemoove = null;
        canvas.onclick = null;
    }
}