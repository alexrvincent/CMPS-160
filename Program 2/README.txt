Submitted is two files: rotatingSquare3.html and rotatingSquare3.js (I didn't change the name, as it would mess with the HTML loading)

Here is a live link: http://people.ucsc.edu/~avincent/CMPS%20160/Lab2/rotatingSquare3.html

I've implemented the full extent of the lab, including both stretch goals to reach the A level. The gasket has 3 sliders, 3 buttons, an RGB keyboard interaction, mouse dragging and instructions on how to interact with it all.

For the two strech goals, I implemented a "follow" physics based path system where the gasket follows the mouse cursor as well as a small game. The game is a reflex-testing game that tests the player's ability to click at the guidance of the gasket's color.

Note, there are performance issues at high levels of interaction. This is mostly due to the original set up of the file (with init as the update loop). If the interaction begins to slow down, I've provided a "Refresh Page" that should help. The code is also not completely bug free, but functions as expected.