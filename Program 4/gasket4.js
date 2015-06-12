
var canvas;
var gl;

var points = [];
var colors = [];
var points3 = [];

var NumTimesToSubdivide = 4;
var planeSubdivide = 3;
var groundNoise = 1;

var ModelViewMatrix = mat4();
var ProjectionMatrix = mat4();
var PerspectiveMatrix = mat4();
var ModelViewMatrix_location;
var ProjectionMatrix_location;
var PerspectiveMatrix_location;

var x_translate = 0.0;
var y_translate = 0.0;
var z_translate = 0.0;

var x_rotate = 0.0;
var y_rotate = 0.0;
var z_rotate = 0.0;

var camera_x = 0.0;
var camera_y = 0.0;
var camera_z = 1.0;

var lookAt_x = 0.0;
var lookAt_y = 0;
var lookAt_z = -5.0;

var color1 = 1.0;
var color2 = 0.0;
var color3 = 0.0;
var color4 = 1.0;


var mouseDown = false;

var rotateX = false;
var rotateY = false;
var rotateZ = false;
var freeTranslate = false;

var newX;
var newY;

var fieldOfView = 60;

var speed = 100;


window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    //
    //  Initialize our data for the Sierpinski Gasket
    //

    // First, initialize the vertices of our 3D gasket
    // Four vertices on unit circle
    // Intial tetrahedron with equal length sides
    
    var vertices = [
        vec3(  0.0000,  0.0000, -1.0000 ),
        vec3(  0.0000,  0.9428,  0.3333 ),
        vec3( -0.8165, -0.4714,  0.3333 ),
        vec3(  0.8165, -0.4714,  0.3333 )
    ];
	
	var vert2 = [
		vec3 ( 0.8, -0.4, 1.1),
		vec3 ( -0.8, -0.4, 1.1),
		vec3 ( -1, -0.7, -1),
		vec3( 1, -0.7, -1),
		vec3(0.8, -0.4, 1.1)
		];
		
	 
	 var planeVerts = [
		vec3(1.0,-1,-0.9), //top right
		vec3(-1.1,-1,-0.9), //top left
		vec3(-1.1,-0.4,1.0), //bottom left
		vec3(1.0,-1,-0.9), //top right
		vec3(1.0,-0.4,1.0), //bottom right
		vec3(-1.1,-0.4,1.0) //bottom left
		];
		
			
    divideTetra( vertices[0], vertices[1], vertices[2], vertices[3],
                 NumTimesToSubdivide);
				 
	subdividePlane(planeVerts[3], planeVerts[4], planeVerts[5], planeSubdivide);
	 

    //
    //  Configure WebGL
    //
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( .23, .32, .62, 1.0 );
    
    // enable hidden-surface removal
    
    gl.enable(gl.DEPTH_TEST);

    //  Load shaders and initialize attribute buffers
    
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    
    // Create a buffer object, initialize it, and associate it with the
    //  associated attribute variable in our vertex shader
    
    var cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW );
	
    
    var vColor = gl.getAttribLocation( program, "vColor" );
    gl.vertexAttribPointer( vColor, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor );

    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );
	
	
	// User Interface Elements
	
	document.getElementById("subdivs").onchange = function(event) {
        NumTimesToSubdivide = event.target.value;
		points = [];
		colors = [];
		divideTetra( vertices[0], vertices[1], vertices[2], vertices[3],
                 NumTimesToSubdivide);
		 gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );
    };
	
	document.getElementById("fov").onchange = function(event) {
        fieldOfView = 50 + event.target.value*10;
    };
	
	
	document.getElementById("rotX").onclick = function () {
		if(!rotateX)
			rotateX	= true;
		else
			rotateX = false;
	};
	
	document.getElementById("rotY").onclick = function () {
		if(!rotateY)
			rotateY	= true;
		else
			rotateY = false;
	};
	
	document.getElementById("rotZ").onclick = function () {
		if(!rotateZ)
			rotateZ	= true;
		else
			rotateZ = false;
	};
	document.getElementById("freeTrans").onclick = function () {
		if(!freeTranslate)
			freeTranslate = true;
		else
			freeTranslate = false;
	};
	
	document.getElementById("reset").onclick = function () {
		location.reload(true);
	};
	
	window.onmouseup = function(event)
	{
		mouseDown = false;
	}
	
	window.onmousedown = function(event) 
	{
	
		mouseDown = true;
		if(!freeTranslate && !rotateX && !rotateY && !rotateZ)
			{
				var x = event.clientX;
				var y = event.clientY;
				var rect = event.target.getBoundingClientRect();
	
				newX = ((x - rect.left) - canvas.height / 2) / (canvas.height / 2);
				newY = (canvas.width / 2 - (y - rect.top)) / (canvas.width / 2);
				
				console.log(newX);
				console.log(newY);
				
				if(newX > .94 || newY > .94 || newX < -.94 || newY < -.94); // Do nothing
				
				else 
				{
					if(newX > .50) {camera_x += 0.1; lookAt_x += 0.1; }
					if(newY > .50) {camera_y += 0.1; lookAt_y += 0.1; }
					if(newX < -.50) {camera_x -= 0.1; lookAt_x -= 0.1; }
					if(newY < -.50) {camera_y -= 0.1; lookAt_y -= 0.1; }
				}
			
			}
	}
	
	window.onmousemove = function(event) 
	{
		if(mouseDown)
		{
			if(rotateX)
			{
			ModelViewMatrix = mult(ModelViewMatrix, rotate(0.25, 1, 0, 0));
			gl.uniformMatrix4fv(ModelViewMatrix_location, false, flatten(ModelViewMatrix));
			}
			if(rotateY)
			{
			ModelViewMatrix = mult(ModelViewMatrix, rotate(0.25, 0, 1, 0));
			gl.uniformMatrix4fv(ModelViewMatrix_location, false, flatten(ModelViewMatrix));
			}
			if(rotateZ)
			{
			ModelViewMatrix = mult(ModelViewMatrix, rotate(0.25, 0, 0, 1));
			gl.uniformMatrix4fv(ModelViewMatrix_location, false, flatten(ModelViewMatrix));
			}
			
			if(freeTranslate)
			{
				var x = event.clientX;
				var y = event.clientY;
				var rect = event.target.getBoundingClientRect();
	
				newX = ((x - rect.left) - canvas.height / 2) / (canvas.height / 2);
				newY = (canvas.width / 2 - (y - rect.top)) / (canvas.width / 2);
			
				if(newX > .99 || newY > .99 || newX < -.99 || newY < -.99); // Do nothing
			
				else
				{
					//points = [];
					//colors = [];
					//divideTetra( vertices[0], vertices[1], vertices[2], vertices[3],
								//NumTimesToSubdivide);
					//gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );
				
					ModelViewMatrix= mult(ModelViewMatrix, translate(newX/2000,-newY/2000,0));
					//gl.uniformMatrix4fv(ModelViewMatrix_location, false, flatten(ModelViewMatrix));
			
				}
			}
			if(!freeTranslate && !rotateX && !rotateY && !rotateZ)
			{
				var x = event.clientX;
				var y = event.clientY;
				var rect = event.target.getBoundingClientRect();
	
				newX = ((x - rect.left) - canvas.height / 2) / (canvas.height / 2);
				newY = (canvas.width / 2 - (y - rect.top)) / (canvas.width / 2);
				
				if(newX > .90 || newY > .90 || newX < -.90 || newY < -.90); // Do nothing
				
				else 
				{
					if(newX > .50 && newX < .95) {camera_x += 0.01; lookAt_x += 0.01;}
					if(newY > .50 && newY < .95) {camera_y += 0.01; lookAt_y += 0.01; }
					if(newX < -.50 && newX > -.95) {camera_x -= 0.01; lookAt_x -= 0.01; }
					if(newY < -.50 && newY > -.95) {camera_y -= 0.01; lookAt_y -= 0.01; }
				}
			
			}
		}
	
	}
	
	// 'R, G, B' Keyboard Handling
    window.onkeydown = function( event ) {
		var key = event.keyCode;
        switch( key ) {
			case 87: //w
			 camera_z -= 0.2;
			 lookAt_z -= 0.2;
            break;
			
            case 65: //a
			 camera_x -= 0.2;
			 lookAt_x -= 0.2;
            break;
			
		    case 83: //s
			 camera_z +=0.2;
			 lookAt_z +=0.2;
            break;
		
		    case 68: //d 
			 camera_x += 0.2;
			 lookAt_x += 0.2;
            break;
			
			case 69: //e 
		  	 camera_y += 0.2;
			 lookAt_y += 0.2;
            break;
			
		    case 81: //q
		  	 camera_y -=0.2;
			 lookAt_y -=0.2;
            break;
			
          case 38: //UP arrow -- w is 87
			ModelViewMatrix = mult(ModelViewMatrix, translate(0,0.1,0));
			gl.uniformMatrix4fv(ModelViewMatrix_location, false, flatten(ModelViewMatrix));
            break;

          case 40: //DOWN arrow -- s is 83awd
		  	ModelViewMatrix = mult(ModelViewMatrix, translate(0,-0.1,0));
			gl.uniformMatrix4fv(ModelViewMatrix_location, false, flatten(ModelViewMatrix));
            break;

          case 37: //LEFT arrow -- a is 65
		  	ModelViewMatrix = mult(ModelViewMatrix, translate(0.1,0,0));
			gl.uniformMatrix4fv(ModelViewMatrix_location, false, flatten(ModelViewMatrix));
            break;
		
		  case 39: //RIGHT arrow -- d is 68
			ModelViewMatrix = mult(ModelViewMatrix, translate(-0.1,0,0));
			gl.uniformMatrix4fv(ModelViewMatrix_location, false, flatten(ModelViewMatrix));
            break;
		
		  case 16: //e 
		  	ModelViewMatrix = mult(ModelViewMatrix, translate(0,0,-0.1));
			gl.uniformMatrix4fv(ModelViewMatrix_location, false, flatten(ModelViewMatrix));
            break;
			
		  case 17: //q
		  	ModelViewMatrix = mult(ModelViewMatrix, translate(0,0,0.1));
			gl.uniformMatrix4fv(ModelViewMatrix_location, false, flatten(ModelViewMatrix));
            break;
        }
    };
	
	// Link Matrices
	
	//Set up Camera, lookAt functions with default values. Correct Gasket orientation
	var temp = lookAt(vec3(camera_x, camera_y, camera_z), 
					  vec3(lookAt_x, lookAt_y, lookAt_z), 
					  vec3(0.0, 1.0, 0.0));					  
	ModelViewMatrix = mult(temp, ModelViewMatrix);
	ModelViewMatrix = mult(ModelViewMatrix, rotate(180, 0, 1, 0));
	
	
	// Create and link Perspective Matrix
	PerspectiveMatrix = mult(PerspectiveMatrix, perspective(fieldOfView, 1, 0.1, 1000));
	PerspectiveMatrix_location = gl.getUniformLocation(program, "PerspectiveMatrix");
	gl.uniformMatrix4fv( PerspectiveMatrix_location,  false, flatten(PerspectiveMatrix) );
	//
	
	// Link ModelView/Projection Matrix
	ProjectionMatrix_location = gl.getUniformLocation(program,"ProjectionMatrix");
	ModelViewMatrix_location = gl.getUniformLocation(program, "ModelViewMatrix");
	gl.uniformMatrix4fv( ProjectionMatrix_location,  false, flatten(ProjectionMatrix) );
	gl.uniformMatrix4fv( ModelViewMatrix_location, false, flatten(ModelViewMatrix));
	
    render();
};


function triangle( a, b, c, color )
{

    // add colors and vertices for one triangle

    var baseColors = [
        vec3(color1, color2, color3),
        vec3(color2, color1, color3),
        vec3(color3, color2, color1),
        vec3(color1, color4, color1)
    ];

    colors.push( baseColors[color] );
    points.push( a );
    colors.push( baseColors[color] );
    points.push( b );
    colors.push( baseColors[color] );
    points.push( c );
	
	
}

function line ( a, b )
{
	points3.push( a, b );
}

function tetra( a, b, c, d )
{
    // tetrahedron with each side using
    // a different color
    
    triangle( a, c, b, 0 );
    triangle( a, c, d, 1 );
    triangle( a, b, d, 2 );
    triangle( b, c, d, 3 );
}

function divideTetra( a, b, c, d, count )
{
    // check for end of recursion
    
    if ( count === 0 ) {
        tetra( a, b, c, d );
    }
    
    // find midpoints of sides
    // divide four smaller tetrahedra
    
    else {
        var ab = mix( a, b, 0.5 );
        var ac = mix( a, c, 0.5 );
        var ad = mix( a, d, 0.5 );
        var bc = mix( b, c, 0.5);
        var bd = mix( b, d, 0.5 );
        var cd = mix( c, d, 0.5 );

        --count;
        
        divideTetra(  a, ab, ac, ad, count );
        divideTetra( ab,  b, bc, bd, count );
        divideTetra( ac, bc,  c, cd, count );
        divideTetra( ad, bd, cd,  d, count );
    }
}


function subdividePlane( a, b, c, count )
{	
	var i = 0;
	for (var z = 100.0; z > -100.0; z -= 5.0) 
	{
		for (var x = -100.0; x < 100.0; x += 5.0) 
		{
			if (i % 2) 
			{
            colors.push( vec3(0.0, 0.0, 0.0));
			colors.push( vec3(0.0, 0.0, 0.0));
			colors.push( vec3(0.0, 0.0, 0.0));
			colors.push( vec3(0.0, 0.0, 0.0));
			colors.push( vec3(0.0, 0.0, 0.0));
			colors.push( vec3(0.0, 0.0, 0.0));
			}
			else 
			{
            colors.push( vec3(1.0, 1.0, 1.0));
			colors.push( vec3(1.0, 1.0, 1.0));
			colors.push( vec3(1.0, 1.0, 1.0));
			colors.push( vec3(1.0, 1.0, 1.0));
			colors.push( vec3(1.0, 1.0, 1.0));
			colors.push( vec3(1.0, 1.0, 1.0));
			}
			
			points3.push(vec3(x, -1, z));
			points3.push(vec3(x-5, -1, z));
			points3.push(vec3(x, -1, z-5));
			points3.push(vec3(x, -1, z-5));
			points3.push(vec3(x-5, -1, z-5));
			points3.push(vec3(x-5, -1, z));
        ++i;
		}
    ++i;
	}

}

		
function render()
{	   
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	
    //Save ModelView Data	
	var temp = ModelViewMatrix;
	ModelViewMatrix = mat4();
	gl.uniformMatrix4fv(ModelViewMatrix_location, false, flatten(ModelViewMatrix));
	
	
	// Update the Projection Matrix with current lookAt values
	ProjectionMatrix = lookAt(vec3(camera_x, camera_y, camera_z), 
							  vec3(lookAt_x, lookAt_y, lookAt_z), 
							  vec3(0.0, 1.0, 0.0));
	gl.uniformMatrix4fv( ProjectionMatrix_location,  false, flatten(ProjectionMatrix) );
	
	//Update Perspective Matrix
	PerspectiveMatrix = perspective(fieldOfView, 1, 0.1, 1000);
	gl.uniformMatrix4fv( PerspectiveMatrix_location,  false, flatten(PerspectiveMatrix) );				  
	
	//Update and draw plane first
	gl.bufferData( gl.ARRAY_BUFFER, flatten(points3), gl.STATIC_DRAW );
    gl.drawArrays( gl.TRIANGLES, 0, points3.length );
	
	//Restore ModelView Data and draw its updated form
	ModelViewMatrix = temp;
	gl.uniformMatrix4fv(ModelViewMatrix_location, false, flatten(ModelViewMatrix));
	gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );
    gl.drawArrays( gl.TRIANGLES, 0, points.length );
	
	
	 setTimeout(
        function () {requestAnimFrame( render );},
        speed
    );
	
}

