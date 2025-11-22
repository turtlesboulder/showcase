package com.example.breakout

import java.lang.Math.random
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.gestures.*
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.offset
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.tooling.preview.Preview
import com.example.breakout.ui.theme.BreakoutTheme
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.drawscope.DrawScope
import androidx.compose.runtime.*
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.text.TextMeasurer
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.drawText
import androidx.compose.ui.text.rememberTextMeasurer
import androidx.compose.ui.unit.TextUnit
import androidx.compose.ui.unit.TextUnitType
import kotlinx.coroutines.delay

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            BreakoutTheme {
                Scaffold(modifier = Modifier.fillMaxSize()) { innerPadding ->
                    Breakout(
                        modifier = Modifier.padding(innerPadding)
                    )
                }
            }
        }
    }
}

@Composable
fun Breakout(modifier: Modifier = Modifier) {
    // Remember keyword lets information survive recomposition
    var tapPosition by remember { mutableStateOf<Offset?>(null) }
    var dragOffset by remember { mutableStateOf(Offset(0f, 0f)) }
    var circlePosition by remember { mutableFloatStateOf(0f) }
    // Start game with 8x8 blocks
    var game by remember { mutableStateOf<Game>(Game(8, 8, Size(1000f, 2000f))) }
    // Textmeasurer is required for text on a canvas
    val textMeasurer = rememberTextMeasurer()
    val modifier = Modifier
        .fillMaxSize()
        // User input
        .pointerInput(Unit) {
            detectTapGestures { offset ->
                // Detect the tap
                // TODO: Make the ball go faster if the user taps the screen with good timing
                tapPosition = offset
            }
        }
        .pointerInput("dragging"){
            detectDragGestures { change, dragAmount ->
                // Detect the drag
                dragOffset = dragAmount
                game.paddle.x += dragAmount.x

                // Prevent paddle from going offscreen
                if (game.paddle.x + game.paddle.width > game.size.width){
                    game.paddle.x = game.size.width - game.paddle.width
                }
                if (game.paddle.x < 0){
                    game.paddle.x = 0f
                }
            }
        }

    // LaunchedEffect to update the position periodically
    LaunchedEffect(Unit) {
        while (true) {

            // Application doesn't get recomposed unless this ball is
            // moving about
            circlePosition += 5f
            if (circlePosition > 1000f) circlePosition = 0f

            upDateBallPosition(game, dragOffset.x)
            // Delay to control the speed of movement
            delay(16L) // ~60fps

            if (game.gameOver){
                // Stop the loop if the game is over
                break
            }
        }
    }

    Surface(color = Color.Black) {
        // Draw invisible text so that the app gets recomposed
        Text(
            color = Color.Black,
            text = "I am a space hamster!",
            modifier = modifier.padding(24.dp).offset(0.dp, 800.dp)
        )
        Canvas(modifier = Modifier.fillMaxWidth().fillMaxHeight(0.9f),
            onDraw = {
                // Reset the game if the screen is flipped or something like it
                if (game.size != this.size){
                    game.size = this.size
                    game.reset()
                }
                drawScore(this, game, textMeasurer)
                drawBoxes(this, game)
                drawBall(this, game.ball)
                drawPaddle(this, game)
                // This circle is required for recomposition along with the text above
                // TODO: Learn why
                drawCircle(radius = 10f, color = Color.Blue, center = Offset(circlePosition, 0f))
            }
        )
    }
}
fun drawScore(drawScope: DrawScope, game:Game, textMeasurer: TextMeasurer){
    // TODO: Show game over with score and a button that can restart the game
    var txtStyle: TextStyle = TextStyle(color = Color.Yellow, TextUnit(5f, TextUnitType.Em))
    var text = "";
    if (game.gameOver){
        text = "Game over! Score: ${game.score}"
    }else{
        text = "Score: ${game.score}"
    }

    drawScope.drawText(text = text, textMeasurer = textMeasurer,
        topLeft = Offset(50f, game.size.height - 100), style = txtStyle)
}
fun drawPaddle(drawScope: DrawScope, game:Game){
    drawScope.drawRect(color = Color.White,
        topLeft = Offset(game.paddle.x,
            game.size.height - game.paddle.height),
        size = Size(game.paddle.width, game.paddle.height))
}
fun upDateBallPosition(game: Game, paddleVelocity: Float){
    // Update position by velocity
    game.ball.x += game.ball.dx
    game.ball.y += game.ball.dy
    var ball = game.ball

    // Check left and right edges
    if (ball.x - ball.radius < 0 || ball.x + ball.radius > game.size.width){
        game.ball.x += (-1*game.ball.dx)
        game.ball.dx *= -0.95f
    }
    // Check top edge
    if (ball.y - ball.radius < 0){
        game.ball.y += (-1*game.ball.dy)
        game.ball.dy *= -0.95f
    }

    // Check bottom edge
    if (ball.y + ball.radius > game.size.height - 30){
        // Bounce off paddle
        if (ball.x + ball.radius > game.paddle.x &&
            ball.x - ball.radius < game.paddle.x + game.paddle.width){
            game.ball.y += (-1*game.ball.dy)
            game.ball.dy *= -1.2f
            game.ball.dx += (paddleVelocity * 0.2f)
        }else{
            // Game over man!
            game.ball.dx = 0f
            game.ball.dy = 0f
            game.gameOver = true
        }
    }
    // I don't know if kotlin passes objects by reference or value
    ball = game.ball

    // TODO Shorten this section
    if (ball.y - ball.radius*2 < (game.blockSize.height * (game.numBlocksTall+1))){
        var topIndex = game.getIndexOfOffset(Offset(ball.x, ball.y - ball.radius))
        var leftIndex = game.getIndexOfOffset(Offset(ball.x - ball.radius, ball.y))
        var rightIndex = game.getIndexOfOffset(Offset(ball.x + ball.radius, ball.y))
        var bottomIndex = game.getIndexOfOffset(Offset(ball.x, ball.y + ball.radius))

        // Check the top of the ball for block collision
        if (topIndex >= 0 && !game.blocksBroken[topIndex]){
            game.blocksBroken[topIndex] = true
            game.ball.y -= ball.dy
            game.ball.dy *= -0.9f
        }
        // Check the left side of the ball for block collision
        if (leftIndex >= 0 && !game.blocksBroken[leftIndex]){
            game.blocksBroken[leftIndex] = true
            game.ball.x -= ball.dx
            game.ball.dx *= -0.9f
        }
        // Check the right side of the ball for block collision
        if (rightIndex >= 0 && !game.blocksBroken[rightIndex]){
            game.blocksBroken[rightIndex] = true
            game.ball.x -= ball.dx
            game.ball.dx *= -0.9f
        }
        // Check the bottom of the ball for block collision
        if (bottomIndex >= 0 && !game.blocksBroken[bottomIndex]){
            game.blocksBroken[bottomIndex] = true
            game.ball.y -= ball.dy
            game.ball.dy *= -0.9f
        }
        game.updateScore()
    }
}

fun drawBall(drawScope: DrawScope, ball:Ball) {
    drawScope.drawCircle(
        color = Color.Yellow,
        radius = ball.radius,
        center = Offset(x = ball.x, y = ball.y)
    )
}

fun drawBoxes(drawScope: DrawScope, game: Game){
    // TODO: Draw the boxes more performant
    var i = 0;
    for (box in game.blocksBroken){
        if (!box){
            drawScope.drawRect(
                color = Color.Red,
                size = game.blockSize,
                topLeft = game.getOffsetOfBlock(i)
            )
        }
        i ++
    }
}

@Preview(showBackground = true)
@Composable
fun GreetingPreview() {
    BreakoutTheme {
        Breakout()
    }
}

// TODO: Refactor code for performance
// TODO: Add a timer, game over when timer is up
class Game(val numBlocksLong:Int, val numBlocksTall:Int, var size:Size,
           var blocksBroken: BooleanArray = BooleanArray(numBlocksLong*numBlocksTall),
           var blockSize: Size = Size(0f, 0f),
           var gapSize: Size = Size(0f, 0f),
           var ball: Ball = Ball(0f, 0f, 0f, 0f, 0f),
           var paddle: Paddle = Paddle(0f, 0f, 0f),
           var score:Int = 0,
           var gameOver: Boolean = false
){

    init {
        reset()
    }

    fun reset(){
        var x = size.width / (numBlocksLong + 1)
        var y = size.height / 35f
        blockSize = Size(x, y)

        x = blockSize.width / (numBlocksLong + 1)
        y = 12f
        gapSize = Size(x, y)

        ball.x = size.width/2
        ball.y = size.height/2
        ball.dx = ((random()-0.5)*4).toFloat()
        ball.dy = -10f
        ball.radius = 30f

        paddle.width = 200f
        paddle.x = (size.width-paddle.width)/2
        paddle.height = 30f

        blocksBroken = BooleanArray(numBlocksLong*numBlocksTall)
        score = 0
        gameOver = false
    }

    fun getOffsetOfBlock(index: Int): Offset{
        // This is called to draw the boxes
        var row = (index / numBlocksLong).toInt()
        var column = index % numBlocksLong
        var x = (blockSize.width * column) + ((column + 1) * gapSize.width)
        var y = (blockSize.height * row) + ((row + 1) * gapSize.height)
        return androidx.compose.ui.geometry.Offset(x.toFloat(), y.toFloat())
    }

    fun getIndexOfOffset(position: Offset): Int{
        // This is called for ball collision
        var x = position.x - gapSize.width
        var y = position.y - gapSize.height
        var index:Int = 0
        index += (x/(blockSize.width + gapSize.width)).toInt()
        index += ((y/(blockSize.height + gapSize.height)).toInt()*numBlocksLong)
        if (index >= blocksBroken.size){
            return -1
        }
        return index
    }
    fun updateScore(){
        score = 0
        for (block in blocksBroken){
            if (block){
                score ++
            }
        }
    }
}
class Paddle(var x:Float, var width:Float, var height:Float)
class Ball(var x:Float, var y:Float, var dx:Float, var dy:Float, var radius:Float)