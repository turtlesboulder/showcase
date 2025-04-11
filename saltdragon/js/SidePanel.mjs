import { makeli } from "./helpers.mjs";
export default class SidePanel{
    constructor(board){
        this.elem = document.querySelector("#side-panel");
        this.board = board;
        this.infoPanel = document.querySelector("#info-panel");
        this.nextList = document.querySelector("#next-list");
        this.statistics = document.querySelector("#statistics");
        this.actionPanel = document.querySelector("#action-panel");
        this.characterNameDisplay = document.querySelector("#name");
        this.magicList = document.querySelector("#magic-list");
        this.equipmentList = document.querySelector("#equipment-list");
        this.statistics = document.querySelector("#statistics");
        this.actionList = document.querySelector("#action-list");
        this.messageTimer = 0;
        this.characterDisplayed = null;
        this.activeMenu = null;
        this.pausingMessages = [];
        this.currentPausingMessage = 0;
        this.blinkInterval = 0;

        //this.elem.classList.remove("hidden");
    }
    step(){
        if (this.board.characterHovered == null){
            if (this.characterDisplayed != this.board.characterSelected){
                if (this.board.currentState == "chooseAction"){
                    this.displayCharacter(this.board.characterSelected, "displayActions");
                }else{
                    this.displayCharacter(this.board.characterSelected, "displayInfo");
                }
            }
        }

        if (this.messageTimer > 0){
            this.messageTimer --;
            return;
        }
        if (this.messageTimer > -1){
            this.updateInfoPanel();
            this.messageTimer = -2;
        }

    }

    displayCharacter(character, type){
        // type is either displayInfo, displayActions, displayEquipment, or displayMagic
        this.characterDisplayed = character;
        if (character == null){
            return;
        }
        switch(type){
            case "displayInfo":
                this.displayInfo(character);
                this.activeMenu = null;
                break;
            case "displayActions":
                this.displayActions(character)
                this.activeMenu = this.actionList;
                break;
            case "displayEquipment":
                this.displayEquipment(character);
                this.activeMenu = this.equipmentList;
                break;
            case "displayMagic":
                this.displayMagic(character);
                this.activeMenu = this.magicList;
                break;
            default:
                return;
        }

    }

        displayInfo(character){
            const panelTitle = document.querySelector("#name");
    
            // TODO: move the methods from being tied to the object itself to this class
            this.showStatistics();

            let c = character;

            // Round up for HP, down for everything else. Hover lets the player see the exact number
            this.statistics.appendChild(makeli(`HP: ${Math.ceil(c.hp)}/${c.hpMax}`,`${c.hp}`));
            this.statistics.appendChild(makeli(`MP: ${Math.trunc(c.mp)}/${c.mpMax}`,`${c.mp}`));
            this.statistics.appendChild(makeli(`Attack: ${Math.trunc(c.attack)} (${Math.trunc(c.getStrongestAttack().damage + c.attack)})`,`${c.attack}`));
            this.statistics.appendChild(makeli(`Block: ${Math.trunc(c.block)}/${c.defense}`,`${c.block}`));
            this.statistics.appendChild(makeli(`Speed: ${Math.trunc(c.speed)}`,`${c.speed} (${Math.trunc(c.accumulatedSpeed*100)}/100)`));
            this.statistics.appendChild(makeli(`EXP: ${Math.trunc(c.exp)}/100`,`${c.exp}`));
            
            panelTitle.textContent = character.name;
            
        }

        displayItems(character, ulNode, list){
            ulNode.innerHTML = "";
            for(let item of list){
                if (item != null){
                    let li = makeli(item.name, item.description, true);
                    if (character.isAlly){
                        li.item = item;
                        if (item.cost != null && item.cost > character.mp){
                            li.classList.add("unavailable");
                        }else{
                            li.addEventListener("click", (e)=>{
                                for (let node of e.target.parentNode.childNodes){
                                    node.classList.remove("selected");
                                }
                                e.target.classList.add("selected");
                                let isMagic = false;
                                if (e.target.item.cost != null){
                                    // This is a hack. Is there a better way to do this?
                                    // Only magic has a cost, and all magic must have a cost
                                    character.magicEquipped = e.target.item;
                                    isMagic = true;
                                }else{
                                    character.equipped = e.target.item;
                                }
    
                                if (character.board.currentState == "choosingTarget" || character.board.currentState == "choosingTargetMagic"){
                                    character.board.chooseTarget(e.target.item.range, character, isMagic);
                                }
                            });
                        }
                    }   
                    if (item == character.equipped || item == character.magicEquipped){
                        li.classList.add("selected");
                    }
                    ulNode.appendChild(li);
                }
            }
        }
    
        // Merge this and displayMagic somehow, there is repeat code
        displayEquipment(character){
           let equipmentUl = document.querySelector("#equipment-list");
            this.displayItems(character, equipmentUl, character.inventory);
            
        }
        displayMagic(character){
            let magicUL = document.querySelector("#magic-list");
            this.displayItems(character, magicUL, character.magic);
        }

        displayActions(character){
            // I might want to display this sort of thing for enemies later, but not now
            if (!character.isAlly){
                return;
            }

            this.showActionList();
            let boundfunc = null;
    
            // Attack
            let li = makeli("Attack", "Use a weapon", true);
            if (character.hasWeapon()){
                boundfunc = character.getTarget.bind(character, character.doAttack);
                li.addEventListener('click', boundfunc);
            }else{
                li.classList.add("unavailable")
                li.classList.remove("selectable");
            }
            
            this.actionList.appendChild(li);
    
            // Magic
            li = makeli("Magic", "Use a spell this character knows", true);
            if (character.hasMagic()){
                boundfunc = character.getTarget.bind(character, character.doMagic);
                li.addEventListener('click', boundfunc);
            }else{
                li.classList.add("unavailable");
                li.classList.remove("selectable");
            }
            
            this.actionList.appendChild(li);
    
            // Wait
            li = makeli("Wait", "Do nothing this turn", true);
            boundfunc = character.doWait.bind(character);
            li.addEventListener('click', boundfunc);
            this.actionList.appendChild(li);
    
            // Back
            li = makeli("Back", "Return this character to where they started the turn", true);
            boundfunc = character.doBack.bind(character);
            li.addEventListener('click', boundfunc);
            this.actionList.appendChild(li)
    
            this.characterNameDisplay.textContent = character.name;
        }

    start(){
        this.elem.classList.remove("hidden");
    }
    kill(){
        this.elem.classList.add("hidden");
    }
    keySpace(){
        this.currentPausingMessage ++;
        if (this.currentPausingMessage < this.pausingMessages.length){
            this.infoPanel.textContent = this.pausingMessages[this.currentPausingMessage];
        }else{
            this.currentPausingMessage = 0
            this.pausingMessages = [];
            this.board.game.unpause();
            this.updateInfoPanel();
            clearInterval(this.blinkInterval);
            this.infoPanel.classList.remove("blink");
        }
        
    }

    resizeText(){
        let fontSize = 16;
        this.infoPanel.style.fontSize = fontSize + "px";

        // Decrease font size until text fits within the this.infoPanel width & height
        while ((this.infoPanel.scrollWidth > this.infoPanel.clientWidth && fontSize > 10) || (this.infoPanel.scrollHeight > this.infoPanel.clientHeight && fontSize > 10)) {
            fontSize--;
            this.infoPanel.style.fontSize = fontSize + "px";
        }
    }
    pausingMessage(messages){
        // Display a message that halts the game until the user provides input
        // messages is a list of strings
        this.board.game.pause();
        this.pausingMessages = messages;
        this.currentPausingMessage = 0;
        this.infoPanel.textContent = this.pausingMessages[0];
        this.blinkInterval = setInterval(this.blink, 500);
    }
    blink(){
        document.querySelector("#info-panel").classList.toggle("blink");
    }
    message(text, time){
        // Display a temporary message.
        // Possibly pause the game until player input? Have a visual effect?
        this.infoPanel.textContent = text;
        this.messageTimer = time;
        this.resizeText();
    }

    displayNextList(){
        // This will only ever display one rotation at a time... but that's probably okay.
        this.nextList.innerHTML = "";
        let nextRotation = this.board.numCharacters - this.board.turnsThisRotation;
        let lastIndexToDisplay = this.board.fastestCharacters.length-1;
        let li = null;
        // The top 5 accumulated speed should have been found by now, now we create a display for them
        for (let i = 1; i <= lastIndexToDisplay; i++){ // i=1 to skip the character whose turn it currently is
            if (i == nextRotation){
                li = makeli("Rotation");
                li.classList.add("unavailable");
                this.nextList.appendChild(li);
                lastIndexToDisplay -= 1;
                if (i > lastIndexToDisplay){
                    break;
                }
            }
            let char = this.board.fastestCharacters[i]
            if (char != null){
                li = makeli(`${char.name}`, null, true);
                li.character = char;
                li.addEventListener('click', (e)=>{
                    this.board.select(e.target.character);
                    this.board.camera.focusCharacter(e.target.character);
                });
                li.addEventListener('mouseover', (e)=>{
                    this.board.changeCharacterHovered(e.target.character);
                })
                li.addEventListener('mouseleave', (e)=>{
                    this.board.changeCharacterHovered(null);
                })
                this.nextList.appendChild(li);
            }
        }
    }

    updateInfoPanel(){
        /*selectedNextAlly- Indicates that the program is ready to recieve input as to where the next ally is to move.
        selectedAlly- Indicates that the user clicked on an ally other than the one that is to move.
        selectedEnemy- Indicates that the user has clicked on an enemy.
        enemyTurnCameraPan- Indicated that it is the enemy's tun, but the camera hasn't yet centered on them.
        enemyTurn- Indicates that the enemy is acting, and the user is to watch and see what happens.
        chooseAction- Indicates that the player has moved, and now they need to choose their action.
        choosingTarget- Indicates it is the players turn, and they are choosing a target to attack
        targetChosen- Indicates that the target is chosen, and the attack can be executed
        stepDone- Indicates that the current turn is done, and the next one can be started*/

        if (this.messageTimer > 0 || this.pausingMessages.length > 0){
            return;
        }

        let box = this.infoPanel;
        let char = this.board.characterNextTurn;
        switch(this.board.currentState){
            case "selectedNextAlly":
                box.textContent = `Click on a position for ${char.name} to move to.`;
                break;
            case "selectedAlly":
                box.textContent = `Click on ${char.name}, or manage this unit's equipment.`;
                break;
            case "selectedEnemy":
                box.textContent = `Click on ${char.name}.`;
                break;
            case "enemyTurnCameraPan":
            case "enemyTurn":
                box.textContent = "It is the enemy's turn.";
                break;
            case "chooseAction":
                box.textContent = `Please choose which action ${char.name} should take.`;
                break;
            case "choosingTarget":
                box.textContent = `Please choose a target.`;
                break;
            case "choosingTargetMagic":
                box.textContent = `Please choose a tile.`;
            case "targetChosen":
                box.textContent = `${char.name} will now attack.`;
                break;
            case "stepDone":
                // Don't do anything
                break;
            case "victory":
                box.textContent = "You won! Press <Space> to continue.";
                break;
            default:
                box.textContent = "ERROR!";
                break;
        }
        this.resizeText();
    }

    reset(){
        this.activeMenu = null;
        let children = this.actionPanel.children;
        for (let i = 0; i < children.length; i++){
            children[i].classList.add("hidden");
            children[i].innerHTML = "";
        }
    }
    showStatistics(){
        this.reset();
        this.characterNameDisplay.classList.remove("hidden");
        this.statistics.classList.remove("hidden");
    }
    showActionList(){
        this.reset();
        this.characterNameDisplay.classList.remove("hidden");
        this.actionList.classList.remove("hidden");
    }
    showEquipment(){
        this.equipmentList.classList.remove("hidden");
        this.magicList.classList.add("hidden");
    }
    showMagic(){
        this.magicList.classList.remove("hidden");
        this.equipmentList.classList.add("hidden");
    }
    showAll(){
        this.magicList.classList.remove("hidden");
        this.equipmentList.classList.remove("hidden");
    }
}