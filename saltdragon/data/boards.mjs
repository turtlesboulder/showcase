import Board from "../js/Board.mjs"
import Sprite from "../js/Sprite.mjs";
import Character from "../js/Character.mjs";
import { loadAll } from "../js/helpers.mjs";

export default[
    board1,
    board2,
    board3
]
function board1(ctx, camera, filename, game){
    let grid = [
        [1, 1, 1, 0, 2, 5, 0, 1, 1, 0, 0],
        [1, 1, 0, 0, 2, 5, 1, 1, 0, 0, 1],
        [1, 0, 0, 0, 2, 5, 1, 1, 0, 1, 1],
        [1, 0, 0, 0, 2, 5, 0, 0, 0, 1, 1],
        [0, 0, 2, 2, 2, 2, 2, 2, 2, 2, 2],
        [0, 0, 2, 0, 1, 1, 1, 1, 1, 0, 0],
        [1, 0, 2, 0, 1, 1, 1, 1, 1, 0, 0],
        [1, 1, 2, 0, 1, 1, 1, 1, 1, 0, 0],
        [1, 0, 2, 0, 0, 1, 1, 0, 0, 0, 0],
        [1, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 2, 0, 0, 0, 1, 1, 1, 0, 0]
    ]
    let board = new Board(ctx, camera, filename, grid, game)
    let image2 = new Image();
    image2.src = "./images/square.png";
    let sprite2 = new Sprite(ctx, camera, [image2]);

    // Create characters
    
    let char3 = new Character(sprite2, "Grunt", 3);
    let char4 = new Character(sprite2, "Grunt", 3);
    let char5 = new Character(sprite2, "Sorcerer", 1);
    board.addCharacter(char3, 8, 7);
    board.addCharacter(char4, 9, 6);
    board.addCharacter(char5, 7, 9);

    return board;

}

function board2(ctx, camera, filename, game){
    let grid = [
        [0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1],
        [1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 1],
        [1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1],
        [1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1],
        [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
        [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
        [1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1],
        [1, 1, 1, 0, 1, 1, 0, 0, 0, 1, 1],
        [1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0],
        [0, 0, 1, 0, 0, 1, 1, 1, 0, 0, 0],
        [0, 0, 1, 0, 0, 0, 1, 1, 1, 0, 0]
    ]
    let board = new Board(ctx, camera, filename, grid, game)
    let image2 = new Image();
    image2.src = "./images/square.png";
    let sprite2 = new Sprite(ctx, camera, [image2]);

    // Create characters
    
    let char3 = new Character(sprite2, "Grunt", 3);
    let char4 = new Character(sprite2, "Grunt", 3);
    let char6 = new Character(sprite2, "Grunt", 3);
    let char5 = new Character(sprite2, "Sorcerer", 1);
    board.addCharacter(char3, 9, 4);
    board.addCharacter(char4, 10, 5);
    board.addCharacter(char5, 10, 7);
    board.addCharacter(char6, 8, 7);

    return board;

}

function board3(ctx, camera, filename, game){
    let grid = [
        [1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 3, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 3, 1, 0, 0, 0, 0, 0, 1, 1, 1, 1],
        [1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 3, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1],
        [1, 1, 0, 0, 0, 0, 0, 0, 1, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 3, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1],
        [1, 1, 0, 0, 2, 2, 2, 2, 2, 4, 4, 4, 2, 2, 2, 2, 2, 2, 2, 2, 2],
        [1, 1, 1, 2, 2, 2, 2, 2, 2, 4, 4, 4, 2, 2, 2, 2, 2, 2, 2, 2, 2],
        [0, 0, 2, 2, 2, 2, 2, 2, 2, 4, 4, 4, 2, 2, 2, 2, 2, 2, 2, 2, 2],
        [0, 2, 2, 2, 1, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 2, 0, 1, 1],
        [2, 2, 2, 1, 1, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 2, 1, 1, 1],
        [2, 2, 1, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 5, 5, 5, 2, 5, 5, 5],
        [2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 5, 2, 2, 2, 2, 2, 5],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 5, 2, 2, 2, 2, 2, 5],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 5, 2, 2, 2, 2, 2, 5],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 5, 2, 2, 2, 2, 2, 5],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 0, 0, 5, 5, 5, 5, 5, 5, 5],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 0, 0, 0, 0, 1, 1, 1, 0, 0],
        [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 0, 0, 0, 1, 1, 1, 0, 0, 0],
        [1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 3, 3, 0, 0, 1, 1, 1, 0, 0, 0, 0],
        [1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 3, 3, 0, 1, 1, 1, 0, 0, 0, 0, 0],
        [1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 3, 3, 1, 1, 1, 0, 0, 0, 0, 0, 0]
    ];
    let board = new Board(ctx, camera, filename, grid, game)

    let image2 = new Image();
    image2.src = "./images/square.png";
    let sprite2 = new Sprite(ctx, camera, [image2]);

    // Create characters
    
    let char3 = new Character(sprite2, "Grunt", 3);
    char3.name = "Enemy1";
    let char4 = new Character(sprite2, "Grunt", 3);
    char4.name = "Enemy2";
    board.addCharacter(char3, 6, 8);
    board.addCharacter(char4, 7, 7);

    return board;

}

