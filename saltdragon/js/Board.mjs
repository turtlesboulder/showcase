import SidePanel from "./SidePanel.mjs";
import Character from "./Character.mjs";
import { arrayContains, makeli, getDistance, isSamePoint} from "./helpers.mjs";
import Point from "./Point.mjs";
export default class Board{
    constructor(ctx, camera, filename, grid=null, game=null){
        this.game = game;
        this.gridSize = 40;
        this.ctx = ctx;
        this.camera = camera;
        this.camera.board = this;
        this.image = new Image();
        this.image.src = filename;
        this.images = [];
        this.image2 = new Image();
        this.image2.src = "./images/grass1.png";
        this.characterSelected = null;
        this.characterHovered = null;
        this.grid = grid;
        this.protagonist = null;

        // Mouse handling
        this.hoverCellX = 0;
        this.hoverCellY = 0;

        //Possible moves
        this.validMoves = [];
        this.validMovesPreview = [];
        this.validMovesPreviewHover = [];
        this.moveCalc = [];

        // Values used for calculating position
        this.adjustedGridSize = null;
        this.topLeftX = null;
        this.topLeftY = null;
        this.updateValues();
        this.addEventListeners();

        this.victoryCondition = null;

        // Used for turns
        this.characterNextTurn = null;
        this.fastestCharacters = [];
        this.currentState = null;
        // Target is used for weapons
        this.target = null;
        // SelectedTile is used for magic
        this.selectedTile = {"x":-1, "y":-1};
        this.affectedTiles = [];
        this.state = "This is the wrong variable! Use this.currentState";
        this.ENEMYTURNDELAY = 20;
        this.enemyTurnDelayCounter = 0;
        this.totalSpeed = null;
        this.numCharacters = 0;
        this.turnsThisRotation = -1;

        // An animated effect on each square
        this.glowingTiles = [];
        this.glowColor = 0;
        this.glowDirection = 1;

        // For starting the match
        this.startPositions = [];

        this.sidePanel = new SidePanel(this);
        this.attackAnimations = [];
        this.aAnimationTimer = 0;
        this.pausingMessageQueue = [];
        this.moveTimer = -999;
        this.MOVEDURATION = 10;
        this.movement = {"character": null, "x": 0, "y": 0, "dx": 0, "dy": 0};

        /*
        States:
        selectedNextAlly- Indicates that the program is ready to recieve input as to where the next ally is to move.
        selectedAlly- Indicates that the user clicked on an ally other than the one that is to move.
        selectedEnemy- Indicates that the user has clicked on an enemy.
        enemyTurnCameraPan- Indicated that it is the enemy's tun, but the camera hasn't yet centered on them.
        enemyTurn- Indicates that the enemy is acting, and the user is to watch and see what happens.
        chooseAction- Indicates that the player has moved, and now they need to choose their action.
        choosingTarget- Indicates it is the players turn, and they are choosing a target to attack.
        choosingTargetMagic- Indicates it is the player's turn, and they are choosing a tile to effect with magic.
        targetChosen- Indicates that the target is chosen, and the attack can be executed
        stepDone- Indicates that the current turn is done, and the next one can be started
        victory- Indicates that the board has been completed.
        */
        
        this.images.push(this.image2);
        if (this.grid == null){
            this.grid = [
                [1, 1, 1, 0, 2, 0, 0, 1, 1, 0, 0],
                [1, 1, 0, 0, 2, 0, 1, 1, 1, 0, 0],
                [1, 0, 0, 0, 2, 0, 1, 1, 1, 1, 0],
                [1, 0, 0, 0, 2, 0, 0, 0, 1, 1, 0],
                [0, 0, 2, 2, 2, 2, 2, 2, 2, 2, 2],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 0],
                [1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [1, 0, 2, 0, 0, 0, 0, 1, 0, 0, 0],
                [0, 0, 2, 0, 0, 0, 1, 1, 1, 0, 0]
            ]
        }
        

        this.rows = this.grid.length;
        this.columns = this.grid[0].length;
        this.totalCells = this.rows * this.columns;

        // Memory for going back
        this.allyLastX = null;
        this.allyLastY = null;

        // Fill Characters array
        this.characters = [];
        this.charactersList = [];
        for (let i = 0; i < this.totalCells; i++){
            this.characters.push(null);
        }
        this.numCharacters = 0;

    }
    addAttackAnimation(aAnimation){
        if (aAnimation == null || aAnimation.sprite == null){
            return;
        }
        if (this.aAnimationTimer < aAnimation.timer){
            this.aAnimationTimer = aAnimation.timer;
        }
        this.attackAnimations.push(aAnimation);
    }
    startMatch(){
        // We will assume that some characters have been added by game
        document.querySelector("canvas").classList.remove("hidden");
        this.sidePanel.start();
        this.camera.width = window.innerWidth - document.querySelector("#side-panel").getBoundingClientRect().width;
        this.nextTurn();

    }
    endMatch(){
        for (let i = 0; i < this.charactersList.length; i++){
            if (this.charactersList[i] != null && this.charactersList[i].isAlly){
                // Only reset allies for now
                this.charactersList[i].reset();
            }
        }
        this.game.next();
    }
    step(){ 
        this.sidePanel.step();
        this.drawGrid();
        if (this.aAnimationTimer > 0){
            // Give the animation time to play out
            this.aAnimationTimer --;
            return;
        }
        if (this.moveTimer >= 0){
            this.movement.character.x += this.movement.dx;
            this.movement.character.y += this.movement.dy;
            if (this.moveTimer == 0){
                this.moveCharacter(this.movement.character, this.movement.x, this.movement.y);
                this.movement = {"character": null, "x": 0, "y": 0, "dx": 0, "dy":0};
            }
            this.moveTimer --;
        }
        if (this.currentState == "victory"){
            this.handleMessageQueue();
            return;
        }
        if (this.camera.moving){
            // Wait for the camera to move
            return;
        }
        if (this.enemyTurnDelayCounter > 0){
            // Give a small delay to see what the enemy did
            this.enemyTurnDelayCounter --;
            return;
        }
        
        if(this.currentState == "targetChosen"){
            this.characterNextTurn.doAction();
            return;
        }
        if (this.currentState == "enemyTurnCameraPan"){
            this.currentState = "enemyTurn";
            this.enemyTurnDelayCounter = this.ENEMYTURNDELAY;
            return;
        }
        if (this.currentState == "enemyTurn"){
            this.characterNextTurn.enemyAction();
            return;
        }
        if (this.currentState == "selectedNextAlly"){
            // It is the player's turn, wait for them to do something
        }
        if (this.currentState == "stepDone"){
            this.handleMessageQueue();
            this.nextTurn();
        }
    }
    nextTurn(){
        this.turnsThisRotation ++;
        if (this.turnsThisRotation >= this.numCharacters){
            this.rotation();
            // Depending on the bahavior I want, I could subtract the number of characters instead. The difference is if
            // an enemy is destroyed on the last turn of a rotation
            this.turnsThisRotation = 0;
        }
        this.updateSpeed();
        this.updateNextList();
        this.sidePanel.displayNextList();
        if (this.characterNextTurn.isAlly){
            this.changeState("selectedNextAlly");
            this.allyLastX = this.characterNextTurn.gridX;
            this.allyLastY = this.characterNextTurn.gridY;
            this.select(this.characterNextTurn);
            this.camera.focusCharacter(this.characterNextTurn);
        }else{
            this.changeState("enemyTurnCameraPan")
            this.camera.focusCharacter(this.characterNextTurn);   
        }

        this.glowingTiles = [];
        this.glowingTiles.push({"x": this.characterNextTurn.gridX,"y": this.characterNextTurn.gridY})
    }
    rotation(){
        for (let i = 0; i < this.charactersList.length; i++){
            if (this.charactersList[i] != null){
                this.charactersList[i].rotation();
            }
        }
    }
    handleMessageQueue(){
        if (this.pausingMessageQueue.length > 0){
            this.sidePanel.pausingMessage(this.pausingMessageQueue);
            this.pausingMessageQueue = [];
        }
    }
    addCharacter(character, x, y){
        character.board = this;
        character.move(x, y, this.gridSize);
        let index = this.getIndex(character);
        if (this.characters[index] != null){
            throw "Replace with error class later. Character added into an occupied space.";
        }
        this.characters[index] = character; 
        this.numCharacters += 1;
        this.charactersList.push(character);
        if (character.className == "Hero"){
            this.protagonist = character;
        }
    }

    drawCell(x, y){
        let code = this.grid[y][x];
        let image = this.getCell(code);
        let adjGrid = this.adjustedGridSize;
        // I'm not sure how this affects performance
        if (false){
            this.ctx.drawImage(image, this.topLeftX+(x*adjGrid), this.topLeftY+(y*adjGrid), adjGrid-0.5, adjGrid-0.5);
        }else{
            // -0.5 on the width and height to create the gridlines
            this.ctx.fillRect(this.topLeftX+(x*adjGrid), this.topLeftY+(y*adjGrid), adjGrid-0.5, adjGrid-0.5);
        }    
    }
    drawAttacks(){
        for (let i = 0; i < this.attackAnimations.length; i++){
            this.attackAnimations[i].draw(this.gridSize);
        }
        this.attackAnimations = this.attackAnimations.filter((anim)=>{
            return anim.timer > 0;
        })
    }

    drawGrid(){
        this.updateValues();

        let topLeftX = this.topLeftX;
        let topLeftY = this.topLeftY;
        let gridSize = this.adjustedGridSize;

        for (let i = 0; i < this.grid.length; i++){ // i = row
            for (let j = 0; j < this.grid[i].length; j++){ // j = column
                this.drawCell(j, i);
        
                // Highlight hovered cell
                if (j == this.hoverCellX && i == this.hoverCellY){
                    this.ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
                    this.ctx.fillRect(topLeftX+(j*gridSize), topLeftY+(i*gridSize), gridSize, gridSize);
                }
            }
        }

        if (this.game.settings.ValidMovesGlow){
            this.highlightGlowingCells(this.validMoves);
            this.highlightCells(this.glowingTiles, "rgba(0, 255, 255, 0.3)")
        }else{
            this.highlightCells(this.validMoves, "rgba(0, 255, 255, 0.7)");
            this.highlightGlowingCells(this.glowingTiles);
        }
        this.highlightCells(this.validMovesPreview, "rgba(255, 128, 0, 0.7)");
        this.highlightCells(this.validMovesPreviewHover, "rgba(255, 128, 0, 0.5)");
              
        if(this.currentState == "choosingTargetMagic"){
            this.highlightCells(this.affectedTiles, "rgba(255, 64, 64, 0.5)")
        }else{
            this.affectedTiles = [];
        }

        for (let i = 0; i < this.charactersList.length; i++){
            if (this.charactersList[i] != null){
                this.charactersList[i].draw(this.gridSize);
            }
        }
        this.drawAttacks();
    }
    highlightCells(cells, color="rgba(0, 255, 255, 0.4)"){
        // Each cell given has format {x, y}
        let topLeftX = this.topLeftX;
        let topLeftY = this.topLeftY;
        let gridSize = this.adjustedGridSize;

        this.ctx.fillStyle = color;
        for (let i = 0; i < cells.length; i++){
            this.ctx.fillRect(topLeftX+(cells[i].x*gridSize), topLeftY+(cells[i].y*gridSize), gridSize, gridSize)
        }
    }
    highlightGlowingCells(cells){ 
        if (cells.length == 0){
            return;
        }
        const CYCLESPEED = 0.01;
        if (this.glowColor > 0.12){
            this.glowDirection = -1;
        }
        if (this.glowColor < 0.01){
            this.glowDirection = 1
        }
        this.glowColor += CYCLESPEED * this.glowDirection;
        this.highlightCells(cells, `rgba(0, 0, 0, ${this.glowColor})`);
    }
    
    getCell(code){
        // Returns true if there is a sprite for the relevant cell, otherwise it sets the appropiate color and returns false
        switch(code){
            case 0:
                this.ctx.fillStyle = "rgb(10, 220, 0)";
                return this.image2
            case 1:
                this.ctx.fillStyle = "rgb(0, 150, 10)";
                break;
            case 2:
                this.ctx.fillStyle = "rgb(170, 210, 110)";
                break;
            case 3:
                this.ctx.fillStyle = "rgb(0, 0, 255)";
                break;
            case 4:
                this.ctx.fillStyle = "rgb(150, 100, 50)";
                break;
            case 5:
                this.ctx.fillStyle = "rgb(60, 60, 50)";
                break
            default:
                this.ctx.fillStyle = "rgb(255, 255, 255)";
        }
        return false;
    }
    distance(code){
        switch(code){
            case 0:
                return 1.1;
            case 1:
                return 2;
            case 2:
                return 1;
            case 3:
                return 999;
            case 4:
                return 1;
            case 5:
                return 999;
            default:
                return 999;
        }
    }
    weaponDistance(code){
        switch(code){
            case 0:
                return 1;
            case 1:
                return 1;
            case 2:
                return 1;
            case 3:
                return 1;
            case 4:
                return 1;
            case 5:
                return 999;
            default:
                return 999;
        }
    }
    validLocations(x, y, movement, callback=this.distance, blocking = true, checkingFor = this.characterSelected) {
        let skip = false;

        // Prevent all characters from opposite teams from moving through each other
        let characterAtPosition = this.characters[this.getIndexXY(x, y)];
        if (characterAtPosition != null){
            if (checkingFor != characterAtPosition && blocking){
                skip = true;
                if (checkingFor.isAlly != characterAtPosition.isAlly){
                    return;
                }
            }
        }
        // Add this square to the valid moves
        if (!skip && !arrayContains(this.moveCalc, {x, y})){
            this.moveCalc.push({x, y});
        }
        
        if (x < this.columns-1){
            // Move right
            if (movement >= callback(this.grid[y][x+1])){
                this.validLocations(x+1, y, movement - callback(this.grid[y][x+1]), callback, blocking, checkingFor)
            }
        }
        if (x > 0){
            // Move left
            if (movement >= callback(this.grid[y][x-1])){
                this.validLocations(x-1, y, movement - callback(this.grid[y][x-1]), callback, blocking, checkingFor)
            }
        }
        if (y < this.rows-1){
            // Move down
            if (movement >= callback(this.grid[y+1][x])){
                this.validLocations(x, y+1, movement - callback(this.grid[y+1][x]), callback, blocking, checkingFor)
            }
        }
        if (y > 0){
            // Move up
            if (movement >= callback(this.grid[y-1][x])){
                this.validLocations(x, y-1, movement - callback(this.grid[y-1][x]), callback, blocking, checkingFor)
            }
        }   
    }

    getValidLocations(x, y, movement, callback=this.distance, blocking = true, checkingFor = this.characterSelected){
        this.moveCalc = [];
        this.validLocations(x, y, movement, callback, blocking, checkingFor);
        return this.moveCalc;
    }
      
    // Called by Character.getTarget
    chooseTarget(weaponRange, character, isMagic){
        if (isMagic){
            this.changeState("choosingTargetMagic");
        }else{
            this.changeState("choosingTarget");
        }
        this.validMoves = [];
        this.validMoves = this.getValidWeaponTargets(character, isMagic, weaponRange)
    }

    // Used for magic targeting
    getSquaresWithinDistance(x2, y2, distance){
        let squares = [];
        
        for (let x = x2-distance; x <= x2+distance; x++){
            for (let y = y2-distance; y <= y2+distance; y++){
                if (x < 0 || y < 0){
                    continue;
                }
                if (x > this.columns-1 || y > this.rows-1){
                    continue;
                }
                if (getDistance(x, y, x2, y2) > distance){
                    continue;
                }
                squares.push({x, y})
            }
        }
        return squares;
    }
    getShortestPath(source, target, distanceCallback){
        // TODO
    }

    createForcast(){

    }
    select(character){
        if (this.currentState == "enemyTurn" || this.currentState == "enemyTurnCameraPan" || !this.characterNextTurn.isAlly){
            // Would change state and kill the enemy's turn
            return;
        }
        this.characterSelected = character;
        this.validMovesPreview = [];
        this.validMovesPreviewHover = [];
        if (character == this.characterNextTurn && this.characterNextTurn.isAlly){
            this.validMoves = this.getValidMovement(character, true);
            if (this.allyLastX == this.characterNextTurn.gridX && this.allyLastY == this.characterNextTurn.gridY){
                this.changeState("selectedNextAlly");
            }else{
                this.changeState("chooseAction");
            }
        }else{
            this.validMovesPreview = this.getValidMovement(character);
            if (character.isAlly){
                this.changeState("selectedAlly");
            }else{
                this.changeState("selectedEnemy");
            }
        }
    }
    deselect(){
        this.validMoves = [];
        this.validMovesPreview = [];
        this.affectedTiles = [];
        this.characterSelected = null;
        this.updateNextList();
    }
   

    updateSpeed(){
        let totalSpeed = 0;
        for (let i = 0; i < this.charactersList.length; i++){
            let char = this.charactersList[i];
            if (char != null){
                totalSpeed += char.speed;
            }
        }
        this.totalSpeed = totalSpeed;
        for (let i = 0; i < this.charactersList.length; i++){
            let char = this.charactersList[i];
            if (char != null){
                char.accumulatedSpeed += char.speed/totalSpeed;
            }
        }
    }

    updateNextList(){
        // TODO: Rewrite this to be less convoluted

        const LISTSIZE = 6;
        this.fastestCharacters = [];
        let speedObjects = [];
        for (let i = 0; i < this.characters.length; i++){
            if (this.characters[i] != null){
                speedObjects.push({"expectedSpeed":this.characters[i].accumulatedSpeed,
                 "speed":this.characters[i].speed, "index":i})
            }
        }
        let fastestIndexes = this.findHighestExpectedSpeed(speedObjects, LISTSIZE);
        for (let i = 0; i < fastestIndexes.length; i++){
            this.fastestCharacters.push(this.characters[fastestIndexes[i]]);
        }
        this.characterNextTurn = this.fastestCharacters[0];

    }
    findHighestExpectedSpeed(speedObjects, count){
        // Objects with notation {"expectedSpeed", "speed", "index"}
        // Returns a list of indexes of the fastest characters
        let fastestIndexes = []; // Index of this.characters

        for (let i = 0; i < count; i++){ // Repeat for each entry in the list
            let fastestSpeed = speedObjects[0].expectedSpeed;
            let fastestIndex = 0; // Confusing name, but this index is in speedObjects
            let totalSpeed = speedObjects[0].speed;
            for (let j = 1; j < speedObjects.length; j++){ // Repeat for each character
                if (speedObjects[j].expectedSpeed > fastestSpeed){
                    fastestSpeed = speedObjects[j].expectedSpeed;
                    fastestIndex = j;
                }
                totalSpeed += speedObjects[j].speed;
            }
            fastestIndexes.push(speedObjects[fastestIndex].index);
            speedObjects[fastestIndex].expectedSpeed -= 1;
            for (let j = 0; j < speedObjects.length; j++){
                speedObjects[j].expectedSpeed += speedObjects[j].speed/totalSpeed;
            }
        }  
        return fastestIndexes;
    }
    

    updateValues(){
        // Update values used for calculating the position of the board
        this.adjustedGridSize = this.gridSize * this.camera.zoom;
        this.topLeftX = - this.camera.x*this.camera.zoom - ((this.camera.zoom-1)*this.camera.width)/2;
        this.topLeftY = - this.camera.y*this.camera.zoom - ((this.camera.zoom-1)*this.camera.height)/2;
    }

    moveCharacter(character, x, y){
        let index = this.getIndexXY(x, y);
        // Only move if space is not occupied
        if (this.characters[index] == null){

            // Make the previous space empty
            this.characters[this.getIndex(character)] = null;
            character.move(x, y, this.gridSize);

            this.characters[index] = character;
        } 
        if (character.isAlly){
            this.changeState("chooseAction");
        }  
    }
    back(selectNextAlly=true){
        // Undo's the last movement
        let char = this.characterNextTurn;
        this.moveCharacter(this.characterNextTurn, this.allyLastX, this.allyLastY)
        if (selectNextAlly){
            this.select(this.characterNextTurn);
        }
    }

    mouseMove(e){
        // e is the mouse move event
        let x = Math.floor((e.clientX - this.topLeftX)/this.adjustedGridSize);
        let y = Math.floor((e.clientY - this.topLeftY)/this.adjustedGridSize);

        if (this.currentState == "choosingTargetMagic" && (x!=this.hoverCellX || y!=this.hoverCellY)){
            this.affectedTiles = this.getSquaresWithinDistance(x, y, this.characterNextTurn.magicEquipped.radius-1);
        }

        this.hoverCellX = x
        this.hoverCellY = y

        let newChH = this.characters[this.getIndexXY(this.hoverCellX, this.hoverCellY)];
        this.changeCharacterHovered(newChH);
    }
    keyNext(e){
        // Default q; Selects the character who needs orders.
        if (this.characterNextTurn != null){
            this.camera.focusCharacter(this.characterNextTurn);
            if (this.characterNextTurn.isAlly){
                this.select(this.characterNextTurn);
            }
        }
    }  
    keyWait(e){
        // Default enter; Selects the wait action.
        if (this.characterNextTurn.isAlly){
            this.characterNextTurn.doWait();
        }
    }
    keyBack(e){
        // Default backspace; Selects the back action.
        if (this.characterNextTurn.isAlly){
            this.characterNextTurn.doBack();
        }

    }
    keySpace(e){
        // Used for doing an action at the current position.
        if (this.characterNextTurn.isAlly && this.currentState == "selectedNextAlly"){
            this.changeState("chooseAction");
        }
        if(this.currentState == "victory"){
            this.endMatch();
        }
    }
    keySelectNthOptionInMenu(e){
        // Should have a selectable class and do a querySelectorAll for that class would be better
        let n = e.key*1;
        if (!this.characterNextTurn.isAlly){
            return;
        }
        const menu = this.sidePanel.activeMenu;
        if (menu == null){
            return;
        }
        const option = menu.children[n-1];
        if (option != null && option.click != null){
            option.click();
        }
    }
    keyDown(e){
        if (e.key == "q"){
            e.preventDefault();
            this.keyNext();
        }
        if (e.key == "Enter"){
            e.preventDefault();
            this.keyWait();
        }
        if (e.key == "Backspace"){
            e.preventDefault();
            this.keyBack();
        }
        if (e.key == "1" || e.key == "2" || e.key == "3" || e.key == "4" || e.key == "5"){
            e.preventDefault();
            this.keySelectNthOptionInMenu(e);
        }
        if (e.key == "ArrowUp" || e.key == "ArrowDown" || e.key == "ArrowLeft" || e.key == "ArrowRight"){
            e.preventDefault();
            this.keyMove(e);
        }
        if (e.key == " "){
            e.preventDefault();
            this.keySpace();
        }
    }
    keyMove(e){
        if (this.moveTimer > -1){
            return;
        }
        if(this.characterNextTurn.isAlly){
            let dx = 0;
            let dy = 0;
            switch(e.key){
                case "ArrowUp":
                    dy -= 1;
                    break;
                case "ArrowDown":
                    dy += 1;
                    break;
                case "ArrowLeft":
                    dx -= 1;
                    break;
                case "ArrowRight":
                    dx += 1;
                    break;
            }
            let x = this.characterNextTurn.gridX + dx;
            let y = this.characterNextTurn.gridY + dy;
            dx = (dx*this.gridSize)/this.MOVEDURATION;
            dy = (dy*this.gridSize)/this.MOVEDURATION;
            let tile = new Point(x, y);
            for (let move of this.validMoves){
                if (isSamePoint(move, tile)){
                    this.moveTimer = this.MOVEDURATION;
                    this.movement = {"character": this.characterNextTurn, "x": x, "y": y, "dx": dx, "dy": dy};
                }
            }
        }
    }
    keyClick(e){
        // Move the character whose turn it is
        if (this.currentState == "selectedNextAlly"){
            if (arrayContains(this.validMoves, {x:this.hoverCellX, y:this.hoverCellY})){
                this.moveCharacter(this.characterSelected, this.hoverCellX, this.hoverCellY);
                return;
            }
        }
        // This lets the player move somewhere else without clicking back first
        if (this.currentState == "chooseAction"){
            if (arrayContains(this.validMoves, {x:this.hoverCellX, y:this.hoverCellY})){
                this.back(false);
                this.moveCharacter(this.characterSelected, this.hoverCellX, this.hoverCellY);
                return;
            }
        }
        // Choose an enemy soldier
        if (this.currentState == "choosingTarget"){
            if (arrayContains(this.validMoves, {x:this.hoverCellX, y:this.hoverCellY})){
                // Assuming the array has been filtered correctly
                this.target = this.characters[this.getIndexXY(this.hoverCellX, this.hoverCellY)];
                this.changeState("targetChosen");
                return;
            }
            return;
        }
        // Choose a tile on the map
        if (this.currentState == "choosingTargetMagic"){
            if (arrayContains(this.validMoves, {x:this.hoverCellX, y:this.hoverCellY})){
                this.selectedTile = {"x": this.hoverCellX, "y": this.hoverCellY};
                this.changeState("targetChosen");
            }
            return;
        }
         //Select character
        let index = this.getIndexXY(this.hoverCellX, this.hoverCellY);
        if (this.characters[index] != null){
            this.select(this.characters[index]);
            return;
        }
    }

    addEventListeners(){

    }
    changeCharacterHovered(character){
        if (character != this.characterHovered){
            if (character != this.characterSelected && character != this.characterNextTurn && 
                this.currentState != "choosingTarget" && this.currentState != "choosingTargetMagic"
            ){
                this.validMovesPreviewHover = [];
                if (character != null){
                    this.validMovesPreviewHover = this.getValidMovement(character);
                    this.sidePanel.displayCharacter(character, "displayInfo");
                }
            }
        }
        this.characterHovered = character;
    }
    getRow(index){
        return Math.floor(index/this.columns);
    }
    getColumn(index){
        return index % this.columns;
    }
    getXYFromIndex(index){
        return new Point(this.getColumn(index), this.getRow(index));
    }
    getIndex(character){
        return character.gridY * this.rows + character.gridX
    }
    getIndexXY(x, y){
        if (y > this.grid.length || x > this.grid[0].length){
            return -1; // Will always be undefined; Undefined is an expected value in the characters array
        }
        return y * this.rows + x;
    }
    hasWon(){
        for(let i = 0; i < this.charactersList.length; i++){
            if (this.charactersList[i] != null){
                if (!this.charactersList[i].isAlly){
                    return false;
                }
            }
        }
        return true;
    }
    
    destroyCharacter(character){
        let index = this.getIndex(character);
        this.characters[index] = null;
        this.numCharacters -= 1;
        this.charactersList = this.charactersList.filter((char)=>{
            return char != character;
        })
        if (this.hasWon()){ // Add more victory conditions later
            this.changeState("victory");
        }
    }
    

    changeState(state){
        if (this.currentState == "victory"){
            this.sidePanel.updateInfoPanel();
            return;
        }
        this.currentState = state
        this.sidePanel.updateInfoPanel();

        if (this.characterSelected == null){
            return;
        }
        if (state == "selectedNextAlly" || state == "selectedAlly" || state == "selectedEnemy"){
            this.sidePanel.displayCharacter(this.characterSelected, "displayInfo")
        }
        if (state == "chooseAction"){
            this.sidePanel.displayCharacter(this.characterSelected, "displayActions")
        }
        if (state == "enemyTurnCameraPan"){
            this.sidePanel.reset();
            this.validMoves = [];
        }
    }

    reset(){
        // Reset all the characters
        for (let i = 0; i < this.charactersList.length; i++){
            if (this.charactersList[i] != null){
                this.charactersList[i].reset();
            }
        }
        this.sidePanel.reset();
        this.sidePanel = null;


    }
    getValidWeaponTargets(checkingFor, isMagic, weaponRange){
        let start = this.makeNode(checkingFor.gridX, checkingFor.gridY, null, 0, 0);
        let moves = this.aStar(start, new Point(-1, -1), ()=>{return 0}, weaponRange, checkingFor, false, false, this.weaponDistance);
        if (!isMagic){
            moves = moves.filter((node)=>{
                return !this.isPassable(node, checkingFor); // This is sort of a hack, make sure to change this if I change the function
            })
        }
        moves = moves.filter((node)=>{
            return node != null;
        })
        return moves;
        
    }

    getValidMovement(checkingFor, checkingLastPosition = false, distanceFunction = this.distance){
        let start;
        if (checkingLastPosition){
            start = this.makeNode(this.allyLastX, this.allyLastY, null, 0, 0);
        }else{
            start = this.makeNode(checkingFor.gridX, checkingFor.gridY, null, 0, 0);
        }
        let moves = this.aStar(start, new Point(-1, -1), ()=>{return 0}, checkingFor.movement, checkingFor, true, false, distanceFunction);
        moves = moves.filter((node)=>{
            return this.isStayable(node, checkingFor);
        })
        return moves;
    }
    getSquareToMoveTowardGoal(checkingFor, validMoves = null, goal= new Point(this.protagonist.gridX, this.protagonist.gridY), distanceFunction = this.distance){
        // To do this perfectly, would need to create a distance map of the entire game map
        // This is probably an acceptable solution
        // Search from the 'goal' to the source (the loacation of checkingfor) until it hits one of the validMoves
        if (validMoves == null){
            validMoves = this.getValidMovement(checkingFor, false, distanceFunction);
        }
        let start = this.makeNode(goal.x, goal.y, null, 0, 0);
        let indexedArray = this.makeIndexedArray(validMoves);
        let bestSquare = this.aStar(start, new Point(checkingFor.gridX, checkingFor.gridY), this.distanceEstimate,
         50, checkingFor, false, false, this.distance, indexedArray);
        return bestSquare; // The parents of this can be traced for an enemy moving animation
    }
    getEnemiesInRange(checkingFor, range, validMoves = null){
        // Returns a set of objects with 'character' and 'tile' properties that represent
        // what characters can be reached and where from. The tile can have its parents followed
        // until it reaches a valid movement space, and the enemy can move there

        if (validMoves == null){
            validMoves = this.getValidMovement(checkingFor, false, distanceFunction);
        }
        for (let move of validMoves){
            move.distance = 0;
        }
        let indexedArray = this.makeIndexedArray(validMoves);

        let start = this.makeNode(checkingFor.gridX, checkingFor.gridY, null, 0, 0);

        let allMovesWithWeaponRange = this.aStar(start, new Point(-1, -1), ()=>{return 0}, range,
         checkingFor, false, false, this.weaponDistance, [], indexedArray, validMoves.length);
        let charactersInRange = [];
        
        for (let i = 0; i < this.characters.length; i++){
            if (this.characters[i] != null && allMovesWithWeaponRange[i] != null){
                if (this.characters[i].isAlly != checkingFor.isAlly){
                    let obj = {"character":this.characters[i], "tile":allMovesWithWeaponRange[i]};
                    charactersInRange.push(obj);
                }
            }
        }
        return charactersInRange;   
    }

    aStar(start, goal=new Point(-1, -1), h=this.distanceEstimate, maxDistance = 50,
     checkingFor = this.characterNextTurn, blocking=true, findPath = true, distanceFunction=this.distance,
      acceptableGoals=[], startingSet = [], startingSetSize=1){
        // This is sort of bloated because it can do three different things:
        // 1. Generate validMoves
        // 2. Enemy pathfinding
        // 3. Find the shortest path (not used directly, but indirectly by #2)
        // Basically, don't call this directly. Call one of the wrapper functions.

        // start and goal are nodes
        // node = {x: y: f: parent: distance:}
        let openSet = startingSet; // Frontier of new squares to explore
        let closedSet = []; // Already explored squares
        let nonNullSize = startingSetSize;

        let size = this.rows*this.columns;
        // Use the same trick as the characters array, fill that thing up with nulls
        openSet.length = size; 
        closedSet.length = size; 
        openSet[this.getIndexXY(start.x, start.y)] = start;
        let n = openSet[this.getIndexXY(start.x, start.y)];
        


        while (nonNullSize > 0){
            n = this.findSmallest(openSet);
            if (findPath && isSamePoint(n, goal)){
                return n; // Follow the parents of this object to get to the shortest path
            }
            let nIndex = this.getNodeXY(n);
            if (acceptableGoals[nIndex] != null){
                return n; // Tries to calculate the closest of validMoves toward the goal
            }
            
            openSet[nIndex] = undefined; 
            nonNullSize --;
            closedSet[nIndex] = n;  

            let neighborUp = (n.y > 0) ? nIndex-this.columns : -1;
            let neighborDown = (n.y < this.rows-1) ? nIndex+this.columns : -1;
            let neighborRight = (n.x < this.columns-1) ? nIndex + 1 : -1;
            let neighborLeft = (n.x > 0) ? nIndex -1 : -1;
            let neighbors = [neighborUp, neighborDown, neighborRight, neighborLeft]
            neighbors = neighbors.filter((num)=>{return (num >= 0 && num < this.columns * this.rows)});
            for (let neighbor of neighbors){    // Check all the neighbors and add new ones to openSet
                let point = this.getXYFromIndex(neighbor)
                let newDistance = 0;
                if (blocking){
                    newDistance = n.distance + this.distanceWithBlocking(point, checkingFor, distanceFunction)
                }else{
                    newDistance = n.distance + distanceFunction(this.grid[point.y][point.x])
                }
                
                if (newDistance > maxDistance){
                    continue;
                }

                if (openSet[neighbor] == null && closedSet[neighbor] == null){
                    openSet[neighbor] = this.makeNode(point.x, point.y, n, newDistance + h(point, goal), newDistance);
                    nonNullSize ++;
                }
                if (closedSet[neighbor] != null && closedSet[neighbor].distance > newDistance ){ // Check closedSet for optimization
                    let m = closedSet[neighbor];
                    closedSet[neighbor] = null;
                    openSet[neighbor] = m;
                    openSet[neighbor].distance = newDistance;
                    openSet[neighbor].f = newDistance + h(point, goal)
                    openSet[neighbor].parent = n;
                    nonNullSize ++;
                }
                if (openSet[neighbor] != null && openSet[neighbor].distance > newDistance ){    // Check openset for optimization
                    openSet[neighbor].distance = newDistance;
                    openSet[neighbor].f = newDistance + h(point, goal)
                    openSet[neighbor].parent = n;
                }
            }
        }
        return closedSet;
    }
    findSmallest(list){
        let smallest = 999;
        let bestNode = null;
        for (let i = 0; i < list.length; i++){
            if (list[i] != null && list[i].f < smallest){
                bestNode = list[i];
                smallest = list[i].f;
            }
        }
        return bestNode;
    }

    distanceEstimate(start, goal){
        return getDistance(start.x, start.y, goal.x, goal.y) * 0.99;
    }

    isPassable(point, checkingFor = this.characterNextTurn){
        let char = this.characters[this.getIndexXY(point.x, point.y)]
        if (char == null || char.isAlly == checkingFor.isAlly){
            return true;
        }
        return false;
    }
    distanceWithBlocking(point, checkingFor, distanceFunction){
        if (this.isPassable(point, checkingFor)){
            return distanceFunction(this.grid[point.y][point.x])
        }
        return 999;
    }
    isStayable(point, checkingFor = this.characterNextTurn){
        let char = this.characters[this.getIndexXY(point.x, point.y)]
        if (char == checkingFor){ // Can stay in the same position they current are at
            return true;
        }
        return char == null;
    }
    

    makeNode(x, y, parent, score, distance){
        return {"x":x, "y":y, "parent":parent, "f":score, "distance":distance};
    }
    getNodeXY(n){
        return this.getIndexXY(n.x, n.y);
    }
    makeIndexedArray(array){
        let indexedArray = [];
        indexedArray.length = this.rows * this.columns;
        for (let item of array){
            indexedArray[this.getNodeXY(item)] = item;
        }
        return indexedArray;
    }
}