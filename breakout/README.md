# Overview

This is a basic version of the classic arcade game "Breakout" made in Jetpack Compose (It runs on Android phones).
The game is quite unfinished due to the limited time I have had. There are a lot of features I want to add. I've spent a long time on this, I can't spend any more!

The game consists of a ball that moves between blocks and a paddle. The paddle may be moved by dragging the
finger along the phone screen. Missing the ball results in a game over. The ball's trajectory can be
altered by how the paddle was moving when the ball strikes it.

I did this project because I wanted to learn about creating apps, and have used React before and wanted to try something new.
I don't think I used Compose the way it wants to be used, but I learned a lot about it because of that.

[Software Demo Video](https://youtu.be/hlSHeHE9Vss)

# Development Environment

This was made in Android Studio. I tested using the default emulator on it (Medium phone API 35).
I was unable to test this on a physical phone.

Compose uses the Kotlin programming language.

# Useful Websites

I used the initial "Hello Android" tutorial for setting up the environment, and used the 'guides' tab on their website after that. I didn't find the other tutorials or quick guides to be very helpful.
* [Hello Android](https://developer.android.com/codelabs/basic-android-kotlin-compose-first-app)
* [Get started with Jetpack Compose](https://developer.android.com/develop/ui/compose/documentation)

# Future Work

There are a lot of features I still want to get to, and I've marked some of them with a //TODO in the code.
The most important ones, though are...
* Add a timer. Make the game end when the time runs out.
* Register taps. If the user taps with good timing the ball with move faster.
* Proper game over with a reset button.
* Save high score into storage later.
* Add some consistency for different screen sizes! Right now the game plays very different depending on what orientation the phone is in.
* Clean up all the elements into proper containers and figure out how to recompose the right way!