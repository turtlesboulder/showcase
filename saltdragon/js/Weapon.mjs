import weapons from "../data/weapons.mjs"
import TemporarySprite from "./TemporarySprite.mjs";

export default class Weapon{
    constructor(name, owner){
        this.name = name;
        this.damage = null;
        this.range = null;
        this.effect = null;
        this.effectPower = null;
        this.description = null;
        this.attackAnimation = null;
        this.owner = owner;
        for (let i = 0; i < weapons.length; i++){
            if (weapons[i].Name == name){
                this.damage = weapons[i].Damage;
                this.range = weapons[i].Range;
                this.effect = weapons[i].Effect;
                this.effectPower = weapons[i].EffectPower;
                this.description = weapons[i].Description;
                this.attackAnimation = new TemporarySprite(weapons[i].Animation, 0.3, this.owner)
            }
        }

    }
}