import magic from "../data/magic.mjs";
import TemporarySprite from "./TemporarySprite.mjs";

export default class Magic{
    constructor(name, owner){
        this.name = name;
        this.damage = null;
        this.range = null;
        this.radius = null;
        this.cost = null;
        this.effect = null;
        this.effectPower = null;
        this.category = null;
        this.description = null;
        this.attackAnimation = null;
        this.owner = owner;

        for (let i = 0; i < magic.length; i++){
            if (magic[i].Name == name){
                this.damage = magic[i].Damage;
                this.range = magic[i].Range;
                this.radius = magic[i].Radius;
                this.cost = magic[i].Cost;
                this.effect = magic[i].Effect;
                this.effectPower = magic[i].EffectPower;
                this.category = magic[i].Category;
                this.description = magic[i].Description;
                this.attackAnimation = new TemporarySprite(magic[i].Animation, 0.3, this.owner)
            }
        }
        if (this.category == null){
            console.log("Created null spell!");
        }
        if (this.damage == null){
            this.damage = 0;
        }
    }
}