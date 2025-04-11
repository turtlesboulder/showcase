// Meant to be used in character.mjs
// Effects are applied after combat, and update every rotation

/*
Types:
Burn - Deal damage every turn
Freeze - Lower defense
Shock - Lower attack
*/
export default class effect{
    constructor(type, intensity, character){
        this.type = type;
        this.intensity = Math.floor(intensity);
        this.character = character;
        this.apply();
    }

    rotation(){
        switch(this.type){
            case "Burn":
                this.character.hurt(this.intensity);
                this.intensity = Math.ceil(this.intensity/2);
                break;
            case "Freeze":
                this.character.defense += this.intensity; // Reset
                break;
            case "Shock":
                this.character.attack += this.intensity; // Reset
                break;
            case "Empower":
                this.character.attack -= this.intensity; // Reset
                break;
            default:
                break;
        }
        this.intensity -= 1;
        this.apply();
        
    }

    // This allows negative numbers. I should rework this later but I don't think there is a way around it for now.
    apply(){
        switch(this.type){
            case "Burn":
                // Nothing
                break;
            case "Freeze":
                this.character.defense -= this.intensity;
                if (this.character.block > this.character.defense){
                    this.character.block = this.character.defense;
                }
                break;
            case "Shock":
                this.character.attack -= this.intensity;
                break;
            case "Empower":
                this.character.attack += this.intensity;
                break;
            default:
                break;
        }
    }

    clear(){
        switch(this.type){
            case "Burn":
                break;
            case "Freeze":
                this.character.defense += this.intensity; // Reset
                break;
            case "Shock":
                this.character.attack += this.intensity; // Reset
                break;
            case "Empower":
                this.character.attack -= this.intensity; // Reset
                break;
            default:
                break;
        }
        this.intensity = 0;
    }
}