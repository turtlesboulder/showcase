import Sprite from "./Sprite.mjs";
import { isSamePoint, makeli } from "./helpers.mjs";
import Weapon from "./Weapon.mjs";
import Magic from "./Magic.mjs";
import characterClasses from "../data/classes.mjs";
import effect from "../data/effects.mjs";
import Point from "./Point.mjs";


export default class Character{
    constructor(sprite, characterClass = "Unset", level = 1){
        this.board = null;
        this.sprite = sprite;
        this.gridX = -1;
        this.gridY = -1;
        this.point = new Point(-1, -1);
        this.MARGIN = 10;
        this.sprite.MARGIN = this.MARGIN;
        this.movement = 6;
        this.hp = 5;
        this.hpMax = 5;
        // Spells can only be cast with sufficient mp
        this.mp = 1;
        this.mpMax = 1;
        // Damage dealt when attacking
        this.attack = 1;
        // Regenerates block every turn
        this.defense = 1;
        // Reduces damage by 1 per block and is removed first instead of hp
        this.block = 1;
        // How many turns this character gets
        this.speed = 1;
        this.accumulatedSpeed = 0;
        this.callback = null;

        this.name = characterClass;
        this.equipped = new Weapon("Flaming Sword", this);
        this.magicEquipped = null;
        this.inventory = [this.equipped, new Weapon("Pike", this), null];
        this.isAlly = false;
        this.className = characterClass;
        this.class = null;
        this.magic = [];
        this.level = level;
        this.exp = 0;
        this.effects = [];
        this.lastDamagedBy = null;
        this.expMultiplier = 1;
        this.ready = false;


        for (let c of characterClasses){
            if (c.Name == this.className){
                this.generateStats(c);
                this.class = c;

                this.learnSpells(c);
            }
        }

    }
    draw(gridSize){
        // Sprite should be square
        let scale = (gridSize-this.MARGIN)/(this.sprite.width);
        this.sprite.draw(this.x, this.y, scale, 0, false);
    }
    move(x, y, gridSize){
        this.gridX = x;
        this.gridY = y;
        this.x = x*gridSize;
        this.y = y*gridSize;
    }


    rotation(){
        const HPREGENMULT = 2;
        const MPREGENDIV = 8;
        const BLOCKREGENDIV = 4;

        // This filter function updates the effects for each cycle as well as removes the old ones
        this.effects = this.effects.filter((statusEffect)=>{
            statusEffect.rotation();
            if (statusEffect.intensity <= 0){
                return false;
            }
            return true;
        })

        // Regenerate MP and block every rotation
        this.mp += Math.floor(this.mpMax/MPREGENDIV);
        this.restoreBlock(this.defense/BLOCKREGENDIV);

        if (this.mp > this.mpMax){
            let overflow = this.mp - this.mpMax;
            this.heal(overflow*HPREGENMULT);
            this.mp = this.mpMax;
        }
    }

    reset(){
        this.hp = this.hpMax;
        this.mp = this.mpMax;
        this.block = this.defense;
        for (let e of this.effects){
            if (e != null){
                e.clear();
            }
        }
        this.effects = [];
        this.equipFirstWeapon();
        this.equipFirstMagic();
        this.gridX = -1;
        this.gridY = -1;
        this.board = null;
        this.accumulatedSpeed = 0;
    }



    damage(amount, statusEffect, effectPower, source=null){
        // Takes block into account
        if (source !=null){
            this.lastDamagedBy = source;
        }
        let power = amount - this.block
        if (power > 0){
            let overflow = power - this.block;
            if (overflow > 0){
                this.hurt(overflow);
                this.block = 0;
            }else{
                this.block = this.block - power;
            }
            // Add status
            if (statusEffect != null){
                statusEffect = new effect(statusEffect, power*effectPower, this);
                this.effects.push(statusEffect);
            }
        }
    }  
    defeat(){
        this.board.destroyCharacter(this);
        this.reset();
    }

    hurt(amount){
        // Take damage through block
        this.hp -= amount;
        // Destroy this if it is dead
        if (this.hp <= 0){ 
            if(!this.isAlly){
                if (this.lastDamagedBy != null && this.lastDamagedBy.isAlly){
                    this.lastDamagedBy.awardExp(this.level, this.expMultiplier, this);
                }
            }
            this.defeat();
        }
    }

    heal(amount){
        this.hp += Math.floor(amount);
        if (this.hp > this.hpMax){
            this.hp = this.hpMax;
        }
    }

    restoreBlock(amount){
        this.block += Math.floor(amount);
        if (this.block > this.defense){
            this.block = this.defense;
        }
    }

    doAttack(){
        let target = this.board.target;
        let power = (this.attack + this.equipped.damage);
        this.pushAnimation(this.equipped, target.gridX, target.gridY)
        this.board.pausingMessageQueue.push(`${this.name} attacks ${target.name} with ${this.equipped.name}! Deals ${power-target.block} damage!`);
        target.damage(power, this.equipped.effect, this.equipped.effectPower, this)
        
        
        this.turnTaken();
    }
    doAttackOrMagic(item, character){
        if (item.cost != null){
            this.board.selectedTile.x = character.gridX;
            this.board.selectedTile.y = character.gridY;
            this.magicEquipped = item;
            this.doMagic();
        }else{
            this.board.target = character;
            this.equipped = item;
            this.doAttack();
        }
    }
    doMagic(){
        let x = this.board.selectedTile.x;
        let y = this.board.selectedTile.y;
        let targets = this.board.getValidLocations(x, y, this.magicEquipped.radius-1, ()=>{return 1;}, false);
        let characters = [];
        for (let target of targets){
            let char = this.board.characters[this.board.getIndexXY(target.x, target.y)];
            if (char != null){
                characters.push(char);
            }
        }
        this.pushAnimation(this.magicEquipped, x, y)
        for (let char of characters){
            // Failsafe, these should have already been filtered out
            if (char == null){
                continue;
            }
            if (this.magicEquipped.category == "Heal"){
                char.heal(this.attack + this.magicEquipped.damage);
            }
            if(this.magicEquipped.category == "Attack"){
                let power = (this.attack + this.magicEquipped.damage);
                this.board.pausingMessageQueue.push(`${this.name} casts ${this.magicEquipped.name}! Hurts ${char.name} for ${power-char.block} damage!`);
                char.damage(power, this.magicEquipped.effect, this.magicEquipped.effectPower, this);
            }
            if (this.magicEquipped.category == "Buff"){
                char.effects.push(new effect(this.magicEquipped.effect, this.magicEquipped.effectPower * this.attack, char))
            }
        }
        
        this.useMp(this.magicEquipped.cost);
        this.turnTaken();
    }
    pushAnimation(item, x, y){
        item.attackAnimation.reset();
        item.attackAnimation.setXY(x, y)
        this.board.addAttackAnimation(item.attackAnimation);
    }
    doWait(){
        this.turnTaken();
    }

    turnTaken(){
        this.callback = null;
        this.accumulatedSpeed -= 1;
        this.board.changeState("stepDone");
    }

    getTarget(callback){
        // Move this function somewhere, especially the sidepanel code


        if (this.board.currentState == "targetChosen"){
            // This is a failsafe, it shouldn't need to run
            callback();
        }
        if (this.callback != callback){
            this.callback = callback;
            let range = this.equipped.range;
            let isMagic = false;
            if (this.callback == this.doMagic){
                range = this.magicEquipped.range;
                isMagic = true;
            }
            this.board.chooseTarget(range, this, isMagic);

            const panelTitle = document.querySelector("#name");

            if (isMagic){
                this.board.sidePanel.showMagic();
                this.board.sidePanel.displayCharacter(this, "displayMagic");
            }else{
                this.board.sidePanel.showEquipment();
                this.board.sidePanel.displayCharacter(this, "displayEquipment");
            }
        }
    }
    doBack(){
        this.callback = null;
        this.board.back();
    }
    doAction(){
        // The user has chosen the target through the board class
        this.callback();
    }

    hasWeapon(){
        for (let item of this.inventory){
            // Add logic in future for non weapon items
            if (item != null){
                return true;
            }
        }
        return false;
    }
    hasMagic(){
        for (let spell of this.magic){
            if (spell != null){
                if (spell.cost <= this.mp){
                    return true;
                }
            }
        }
        return false;
    }
    useMp(amount){
        // Only use this after a spell is finished
        if (amount <= this.mp){
            this.mp -= amount;
            if (amount > this.mp){
                this.equipFirstMagic();
            }
            return true;
        }
        return false;
    }
    equipFirstWeapon(){
        this.equipped = null;
        for (let item of this.inventory){
            // Add functionality for non weapons later
            if (item != null){
                this.equipped = item;
                break;
            }
        }
    }
    equipFirstMagic(){
        this.magicEquipped = null;
        for (let spell of this.magic){
            if (spell != null){
                if (spell.cost <= this.mp){
                    this.magicEquipped = spell;
                    break;
                }
            }
        }
    }



    generateStats(characterClass){
        this.hpMax += characterClass.BaseHP
        this.mpMax += characterClass.BaseMP
        this.attack += characterClass.BaseAtk
        this.defense += characterClass.BaseDef
        this.speed += characterClass.BaseSpd
        this.movement = characterClass.Movement;
        for (let i = 1; i < this.level; i ++){
            this.levelUp(characterClass);
        }
        this.reset();
        this.ready = true;
    }

    levelUp(characterClass){
        const baseToLevelRatio = 5;
        let hpIncrease = characterClass.BaseHP/baseToLevelRatio
        let mpIncrease = characterClass.BaseMP/baseToLevelRatio
        let attackIncrease = characterClass.BaseAtk/baseToLevelRatio
        let defenseIncrease = characterClass.BaseDef/baseToLevelRatio
        let speedIncrease = characterClass.BaseSpd/baseToLevelRatio

        if ((hpIncrease) - Math.floor(hpIncrease) > Math.random()){
            hpIncrease = Math.ceil(hpIncrease);
        }
        if ((mpIncrease) - Math.floor(mpIncrease) > Math.random()){
            mpIncrease = Math.ceil(mpIncrease);
        }
        if ((attackIncrease) - Math.floor(attackIncrease) > Math.random()){
            attackIncrease = Math.ceil(attackIncrease);
        }
        if ((defenseIncrease) - Math.floor(defenseIncrease) > Math.random()){
            defenseIncrease = Math.ceil(defenseIncrease);
        }
        if ((speedIncrease) - Math.floor(speedIncrease) > Math.random()){
            speedIncrease = Math.ceil(speedIncrease);
        }
        hpIncrease = Math.floor(hpIncrease);
        mpIncrease = Math.floor(mpIncrease);
        attackIncrease = Math.floor(attackIncrease);
        defenseIncrease = Math.floor(defenseIncrease);
        speedIncrease = Math.floor(speedIncrease);

        this.hpMax += hpIncrease;
        this.mpMax += mpIncrease;
        this.attack += attackIncrease;
        this.defense += defenseIncrease;
        this.speed += speedIncrease;

        this.learnSpells(characterClass);
        if (this.isAlly && this.ready){
            this.board.pausingMessageQueue.push(`${this.name} leveled up!`);
            this.board.pausingMessageQueue.push(`HP+${hpIncrease}\tMP+${mpIncrease}\nAtk+${attackIncrease}\tDef+${defenseIncrease}\nSpd+${speedIncrease}`);
        }
    }

    learnSpells(characterClass){
        for (let spell of characterClass.SpellList){
            if (this.level >= spell.Level){
                let alreadyKnowIt = false;
                for (let knownSpell of this.magic){
                    if (spell.Name == knownSpell.name){
                        alreadyKnowIt = true;
                    }
                }
                if (!alreadyKnowIt){
                    let newSpell = new Magic(spell.Name, this)
                    this.magic.push(newSpell);
                    if (this.magicEquipped == null){
                        this.equipFirstMagic();
                    }
                }
            }
        }
    }

    awardExp(enemyLevel, expMultiplier, source){
        const BASE = 90;
        const LEVELTOLERANCE = 4;
        let gainedExp = Math.floor(BASE*((enemyLevel+LEVELTOLERANCE)/(this.level+LEVELTOLERANCE))*expMultiplier)
        this.exp += gainedExp;
        this.board.pausingMessageQueue.push(`${this.name} defeats ${source.name}! Gains ${gainedExp} exp!`)
        while (this.exp >= 100){
            this.exp -= 100;
            this.levelUp(this.class);
        }
    }

    getStrongestAttack(){
        let strongest = 0;
        let strongestItem = null;
        for (let weapon of this.inventory){
            if (weapon != null && weapon.damage > strongest){
                strongest = weapon.damage;
                strongestItem = weapon;
            }
        }
        for (let spell of this.magic){
            if (spell != null && spell.damage > strongest && spell.cost <= this.mp){
                strongest = spell.damage;
                strongestItem = spell;
            }
        }
        return strongestItem;
    }
    getLongestRangeAttack(){
        let biggestRange = 0;
        let biggestRangeItem = null;
        for (let item of this.inventory){
            if (item != null && item.range > biggestRange){
                biggestRange = item.range;
                biggestRangeItem = item;
            }
        }
        for (let item of this.magic){
            if (item != null && item.range > biggestRange && item.cost <= this.mp){
                biggestRange = item.range;
                biggestRangeItem = item;
            }
        }
        return biggestRangeItem;
    }
    getStrongestAttackWithinRange(range){
        let strongest = 0;
        let strongestItem = null;
        for (let weapon of this.inventory){
            if (weapon != null && weapon.damage > strongest && weapon.range >= range){
                strongest = weapon.damage;
                strongestItem = weapon;
            }
        }
        for (let spell of this.magic){
            if (spell != null && spell.damage > strongest && spell.cost <= this.mp && spell.range >= range){
                strongest = spell.damage;
                strongestItem = spell;
            }
        }
        return strongestItem;
    }

    enemyAction(){
        // Check to see if this can attack someone in range
        // If not, use shortest path algorithm to path toward the hero
        if (this.isAlly){
            return;
        }

        let validMoves = this.board.getValidMovement(this);
        let longestRange = this.getLongestRangeAttack();
        let enemiesInRange = this.board.getEnemiesInRange(this, longestRange.range, validMoves);
        let lowestBlock = 999;
        let lowestBlockCharacterAndTile = null;
        for (let obj of enemiesInRange){
            if (obj.character.block < lowestBlock){
                lowestBlock = obj.character.block;
                lowestBlockCharacterAndTile = obj
            }
        }
        if (lowestBlockCharacterAndTile != null){ // Move and attack
            let distance = 1;
            let tile = lowestBlockCharacterAndTile.tile;
            tile = tile.parent; // Enemy cannot ever stand on the same space as an ally so start checking one square away
            while (distance <= longestRange.range){ 
                for (let validMove of validMoves){
                    if (isSamePoint(tile, validMove)){
                        this.board.moveCharacter(this, tile.x, tile.y);
                        let attack = this.getStrongestAttackWithinRange(distance);
                        this.doAttackOrMagic(attack, lowestBlockCharacterAndTile.character)
                        distance = 999; // Break out of the while loop
                        break;
                    }
                }
                tile = tile.parent;
                distance ++;
            }
        }else{ // Move toward the hero
            let tile = this.board.getSquareToMoveTowardGoal(this, validMoves);
            this.board.moveCharacter(this, tile.x, tile.y);
        }

        this.board.currentState = "stepDone";
        this.board.enemyTurnDelayCounter = this.board.ENEMYTURNDELAY;
        this.turnTaken();
    }

    
    
}