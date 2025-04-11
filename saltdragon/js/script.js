import Game from "./Game.mjs"

let canvas = document.querySelector("canvas");
canvas.width = 0.75*window.innerWidth;
canvas.height = window.innerHeight;

let ctx = canvas.getContext("2d");

ctx.width = canvas.width;
ctx.height = canvas.height;

let panel = document.querySelector("#side-panel");
let game = new Game(ctx, panel);
let start = game.start.bind(game);
document.querySelector("#start").addEventListener("click", start);