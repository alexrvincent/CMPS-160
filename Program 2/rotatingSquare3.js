
var gl;
var canvas;

var theta = 0.0;
var thetaLoc;

var speed = 100;
var direction = true;

var points = [];
var NumTimesToSubDivide = 5;

var backRed = 1.0;
var backGreen = 1.0;
var backBlue = 1.0;

var gasRed = 1.0;
var gasGreen = 0.0;
var gasBlue = 0.0;

var gasRedLoc;
var gasGreenLoc;
var gasBlueLoc;

var heightOffset = 0.5;

var mouseDown = false;
var follow = false;
var gameOn = false;
var timer = 100;
var timer2 = 50;
var score = 0;
var gasketSpeed = 0.005;

var newX = 0;
var newY = 0;

var gasketXPos1 = -.85;
var gasketXPos2 = 0;
var gasketXPos3 = .85;

var gasketYPos1 = -.5;
var gasketYPos2 = .5;
var gasketYPos3 = -.5;

var scale_gasketXPos1 = -.85;
var scale_gasketXPos2 = 0;
var scale_gasketXPos3 = .85;

var scale_gasketYPos1 = -.5;
var scale_gasketYPos2 = .5;
var scale_gasketYPos3 = -.5;

window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    //
    //  Configure WebGL
    //
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( backRed, backGreen, backBlue, 1.0 );

    //  Load shaders and initialize attribute buffers
    
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    var vertices = [
        vec2( gasketXPos1, gasketYPos1 ),
        vec2(  gasketXPos2,  gasketYPos2),
        vec2( gasketXPos3, gasketYPos3 )
    ];
	
	divideTriangle(vertices[0], vertices[1], vertices[2], NumTimesToSubDivide);

    // Load the data into the GPU    
    
    var bufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);

    // Associate out shader variables with our data buffer
    
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray(vPosition);
    
    thetaLoc = gl.getUniformLocation(program, "theta");
	gasRedLoc = gl.getUniformLocation(program, "gasRed");
	gasGreenLoc = gl.getUniformLocation(program, "gasGreen");
	gasBlueLoc = gl.getUniformLocation(program, "gasBlue");
    
    // Initialize event handlers
    
	// Sub Division Slider
    document.getElementById("subdivs").onchange = function(event) {
        speed = 100 - event.target.value;
		NumTimesToSubDivide = (event.target.value)/10;
		while (points.length != 0) { points.pop() };
		init();
    };
	
	//  Scale Slider
	document.getElementById("scale").onchange = function(event) {
		gasketXPos1 = -0.85 + event.target.value/80;
		gasketXPos2 = 0;
		gasketXPos3 = 0.85 - event.target.value/80;

		gasketYPos1 = -0.5 + event.target.value/100;
		gasketYPos2 = 0.5 - event.target.value/100;
		gasketYPos3 = -0.5 + event.target.value/100;
		
		scale_gasketXPos1 = gasketXPos1;
		scale_gasketXPos2 = gasketXPos2;
		scale_gasketXPos3 = gasketXPos3;

		scale_gasketYPos1 = gasketYPos1;
		scale_gasketYPos2 = gasketYPos2; 
		scale_gasketYPos3 = gasketYPos3;
		
		
		while (points.length != 0) { points.pop() };
		init();
    };
	
	// Straighten Slider
	document.getElementById("heightoff").onchange = function(event) {
		heightOffset = 0.5 + (event.target.value)/100;
		while (points.length != 0) { points.pop() };
		init();
    };
	
	// Gasket Color Button
	document.getElementById("Color").onclick = function () {
		gasRed = Math.random();
		gasBlue = Math.random();
		gasGreen = Math.random();
	};
	
	//Refresh Page
	document.getElementById("Refresh").onclick = function () {
		location.reload(true);
	};
	
	// Background Color Button
	document.getElementById("BackColor").onclick = function () {
		backRed = Math.random();
		backBlue = Math.random();
		backGreen = Math.random();
		while (points.length != 0) { points.pop() };
		init();
	};
	
	// Reset Button 
	document.getElementById("Clear").onclick = function () {
		gasRed = 1.0;
		gasBlue = 0.0;
		gasGreen = 0.0;
		backRed = 1.0;
		backBlue = 1.0;
		backGreen = 1.0;
		heightOffset = 0.5
		gasketXPos1 = -.85;
		gasketXPos2 = 0;
		gasketXPos3 = .85;
		gasketYPos1 = -.5;
		gasketYPos2 = .5;
		gasketYPos3 = -.5;
		scale_gasketXPos1 = -.85;
		scale_gasketXPos2 = 0;
		scale_gasketXPos3 = .85;
		scale_gasketYPos1 = -.5;
		scale_gasketYPos2 = .5;
		scale_gasketYPos3 = -.5;
		follow = false;
		gameOn = false;
		while (points.length != 0) { points.pop() };
		init();
	};
	
	// Follow Button
	document.getElementById("follow").onclick = function ()
	{
		follow = true;
	}
	
	// Game Button
	document.getElementById("GameOn").onclick = function ()
	{
		gasRed = 1.0;
		gasBlue = 0.0;
		gasGreen = 0.0;
		backRed = 1.0;
		backBlue = 1.0;
		backGreen = 1.0;
		gameOn = true;
		init();
	}
	
    
    /*document.getElementById("Controls").onclick = function( event) {
		switch(event.target.index) {
          case 0:
            direction = !direction;
            break;

         case 1:
            speed /= 2.0;
            break;

         case 2:
            speed *= 2.0;
            break;
       }
    };*/
	
	// Mouse Handling Interaction

	window.onmousedown = function(event) 
	{
		mouseDown = true;
	
		if(gameOn)
		{
			if(timer == 0)
				score -= 5;
			else 
				score++;
				
			document.getElementById("score").innerHTML = score;
		}
	}	
	
	window.onmouseup = function(event)
	{
		mouseDown = false;
	}
	
	window.onmousemove = function(event) 
	{
	
		if(mouseDown && !follow && !gameOn)
		{
			var x = event.clientX;
			var y = event.clientY;
			var rect = event.target.getBoundingClientRect();
	
			newX = ((x - rect.left) - canvas.height / 2) / (canvas.height / 2);
			newY = (canvas.width / 2 - (y - rect.top)) / (canvas.width / 2);
			
			if(newX > .90 || newY > .90 || newX < -.90 || newY < -.90)
			{
				//Do nothing
			}
			else
			{
				while (points.length != 0) { points.pop() };
				
				gasketXPos1 = scale_gasketXPos1 + newX;
				gasketXPos2 = scale_gasketXPos2 + newX;
				gasketXPos3 = scale_gasketXPos3 + newX;
	
				gasketYPos1 = scale_gasketYPos1 + newY;
				gasketYPos2 = scale_gasketYPos2 + newY;
				gasketYPos3 = scale_gasketYPos3 + newY;
				
			
				init();
			}
		}
		
		if(follow && !gameOn)
		{
			var x = event.clientX;
			var y = event.clientY;
			var rect = event.target.getBoundingClientRect();
	
			newX = ((x - rect.left) - canvas.height / 2) / (canvas.height / 2);
			newY = (canvas.width / 2 - (y - rect.top)) / (canvas.width / 2);
			
			if(newX > .90 || newY > .90 || newX < -.90 || newY < -.90)
			{
				//Do nothing, outside of border!
			}
			else
			{
				while (points.length != 0) { points.pop() };
				
				var dx1 = (newX + 0.1);
				var dx2 = (newX + 0.1);
				var dx3 = (newX + 0.1);
			
				var dy1 = (newY + 0.1);
				var dy2 = (newY + 0.1);
				var dy3 = (newY + 0.1);
	
				var length1 = Math.sqrt((dx1 * dx1) + (dy1 * dy1));
				var length2 = Math.sqrt((dx2 * dx2) + (dy2 * dy2));
				var length3 = Math.sqrt((dx3 * dx3) + (dy3 * dy3));
				
				gasketXPos1 += (gasketSpeed / length1) * dx1;
				gasketXPos2 += (gasketSpeed / length2) * dx2;
				gasketXPos3 += (gasketSpeed / length3) * dx3;
				
				gasketYPos1 += (gasketSpeed / length1) * dy1;
				gasketYPos2 += (gasketSpeed / length2) * dy2;
				gasketYPos3 += (gasketSpeed / length3) * dy3;
				init();
			}
			
			
		}
		
	
	}

	// 'R, G, B' Keyboard Handling
    window.onkeydown = function( event ) {
		var key = event.keyCode;
        switch( key ) {
          case 82:
			gasRed = 1.0;
			gasGreen = 0.0;
			gasBlue = 0.0;
            break;

          case 71:
			gasRed = 0.0;
			gasGreen = 1.0;
			gasBlue = 0.0;
            break;

          case 66:
			gasRed = 0.0;
			gasGreen = 0.0;
			gasBlue = 1.0;
            break;
        }
    };
	
	
    render();
};


function triangle( a, b, c)
{
	points.push(a, b, c);
}

function line ( a, b )
{
	points.push( a, b );
}


function divideTriangle( a, b, c, count )
{
	// check for end of recursion
    
    if ( count === 0 ) {
        //triangle( a, b, c );
		line(a, b);
		line(b, a);
		line(b, c);
		line(a, c);
		line(c, b);
		line(c, a);
    }
    else {
    
        //bisect the sides
        
        var ab = mix( a, b, heightOffset );
        var ac = mix( a, c, heightOffset );
        var bc = mix( b, c, heightOffset );
		
		for(var i = 0; i < 2; i++)
		{
			ab[i] += 0.01428;
			ac[i] += 0.01428;
			bc[i] += 0.01428;
		}

        --count;

        // three new triangles
        
        divideTriangle( a, ab, ac, count );
        divideTriangle( c, ac, bc, count );
        divideTriangle( b, bc, ab, count );
    }

}

function controlTime()
{
	if(gameOn)
	{
		if(timer <= 0 && timer2 > 0)
		{
			gasRed = 1.0;
			gasGreen = 0.0;
			timer2--;
		}
		else if (timer <= 0 && timer2 <= 0)
		{
			timer = 50;
			timer2 = 20;
		}
		else 
		{
			gasRed = 0.0;
			gasGreen = 1.0;
			timer--;
		}
	}
}

function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT );

    //theta += (direction ? 0.1 : -0.1);
    //gl.uniform1f(thetaLoc, theta);
	
	gl.uniform1f(gasRedLoc, gasRed);
	gl.uniform1f(gasGreenLoc, gasGreen);
	gl.uniform1f(gasBlueLoc, gasBlue);
	

	gl.drawArrays( gl.LINES, 0, points.length );
	
	controlTime();
	
	console.log(score);
	console.log("Timer:" + timer);
	console.log("Timer2:" + timer2);
	
    setTimeout(
        function () {requestAnimFrame( render );},
        speed
    );
}
