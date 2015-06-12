
var canvas;
var gl;

var points = [];
var colors = [];
var points3 = [];

var NumTimesToSubdivide = 4;
var planeSubdivide = 3;
var groundNoise = 1;

var u_matrix = mat4();
var u_matrix_location;

var x_translate = 0.0;
var y_translate = 0.0;
var z_translate = 0.0;

var x_rotate = 0.0;
var y_rotate = 0.0;
var z_rotate = 0.0;

var mouseDown = false;

var rotateX = false;
var rotateY = false;
var rotateZ = false;
var freeTranslate = false;

var newX;
var newY;

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
				 
	subdividePlane(planeVerts[0], planeVerts[1], planeVerts[2], planeSubdivide);
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
		console.log(NumTimesToSubdivide);
		points = [];
		colors = [];
		divideTetra( vertices[0], vertices[1], vertices[2], vertices[3],
                 NumTimesToSubdivide);
		 gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );
    };
	
	document.getElementById("noise").onchange = function(event) {
        groundNoise = event.target.value;
		points3 = [];
		
		subdividePlane(planeVerts[0], planeVerts[1], planeVerts[2], planeSubdivide);
		subdividePlane(planeVerts[3], planeVerts[4], planeVerts[5], planeSubdivide);
		gl.bufferData( gl.ARRAY_BUFFER, flatten(points3), gl.STATIC_DRAW );
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
	}
	
	window.onmousemove = function(event) 
	{
		if(mouseDown)
		{
			if(rotateX)
			{
			u_matrix = mult(u_matrix, rotate(0.25, 1, 0, 0));
			gl.uniformMatrix4fv(u_matrix_location, false, flatten(u_matrix));
			}
			if(rotateY)
			{
			u_matrix = mult(u_matrix, rotate(0.25, 0, 1, 0));
			gl.uniformMatrix4fv(u_matrix_location, false, flatten(u_matrix));
			}
			if(rotateZ)
			{
			u_matrix = mult(u_matrix, rotate(0.25, 0, 0, 1));
			gl.uniformMatrix4fv(u_matrix_location, false, flatten(u_matrix));
			}
			
			if(freeTranslate)
			{
				var x = event.clientX;
				var y = event.clientY;
				var rect = event.target.getBoundingClientRect();
	
				newX = ((x - rect.left) - canvas.height / 2) / (canvas.height / 2);
				newY = (canvas.width / 2 - (y - rect.top)) / (canvas.width / 2);
			
				if(newX > .90 || newY > .90 || newX < -.90 || newY < -.90); // Do nothing
			
				else
				{
					points = [];
					colors = [];
					divideTetra( vertices[0], vertices[1], vertices[2], vertices[3],
								NumTimesToSubdivide);
					gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );
				
					u_matrix = mult(u_matrix, translate(newX/35,newY/35,0));
					gl.uniformMatrix4fv(u_matrix_location, false, flatten(u_matrix));
			
				}
			}
		}
	
	}
	
	// 'R, G, B' Keyboard Handling
    window.onkeydown = function( event ) {
		var key = event.keyCode;
        switch( key ) {
          case 87: //w
			u_matrix = mult(u_matrix, translate(0,0.1,0));
			gl.uniformMatrix4fv(u_matrix_location, false, flatten(u_matrix));
            break;

          case 83: //s
		  	u_matrix = mult(u_matrix, translate(0,-0.1,0));
			gl.uniformMatrix4fv(u_matrix_location, false, flatten(u_matrix));
            break;

          case 65: //a
		  	u_matrix = mult(u_matrix, translate(-0.1,0,0));
			gl.uniformMatrix4fv(u_matrix_location, false, flatten(u_matrix));
            break;
		
		  case 68: //d
			u_matrix = mult(u_matrix, translate(0.1,0,0));
			gl.uniformMatrix4fv(u_matrix_location, false, flatten(u_matrix));
            break;
		
		  case 69: //e 
		  	u_matrix = mult(u_matrix, translate(0,0,-0.1));
			gl.uniformMatrix4fv(u_matrix_location, false, flatten(u_matrix));
            break;
			
		  case 81: //q
		  	u_matrix = mult(u_matrix, translate(0,0,0.1));
			gl.uniformMatrix4fv(u_matrix_location, false, flatten(u_matrix));
            break;
        }
    };
	
	// Link Matrix
	u_matrix_location = gl.getUniformLocation(program, "u_matrix");
	gl.uniformMatrix4fv(u_matrix_location, false, flatten(u_matrix));
	
    render();
};

function triangle( a, b, c, color )
{

    // add colors and vertices for one triangle

    var baseColors = [
        vec3(1.0, 0.0, 0.0),
        vec3(0.0, 1.0, 0.0),
        vec3(0.0, 0.0, 1.0),
        vec3(1.0, 1.0, 1.0)
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
    if ( count === 0 ) 
	{
		line(a, b);
		line(b, a);
		line(b, c);
		line(a, c);
		line(c, b);
		line(c, a);
    }
    else 
	{
        var ab = mix( a, b, 0.5 );
        var ac = mix( a, c, 0.5);
        var bc = mix( b, c, 0.5 );
		
		for(var i = 0; i < 2; i++)
		{
			ab[i] += (Math.random()/80) * (1.5*groundNoise);
			ac[i] += (Math.random()/80) * (1.5*groundNoise);
			bc[i] += (Math.random()/80) * (1.5*groundNoise);
		}

        --count;

        // three new triangles
        
        subdividePlane( a, ab, ac, count );
        subdividePlane( c, ac, bc, count );
        subdividePlane( b, bc, ab, count );
    }

}

		
function render()
{	   
	
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	
	var temp = u_matrix;
	u_matrix = mat4();
	gl.uniformMatrix4fv(u_matrix_location, false, flatten(u_matrix));
	
	
	gl.bufferData( gl.ARRAY_BUFFER, flatten(points3), gl.STATIC_DRAW );
    gl.drawArrays( gl.TRIANGLES, 0, points3.length );
	
	
	u_matrix = temp;
	gl.uniformMatrix4fv(u_matrix_location, false, flatten(u_matrix));
	
	
	gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );
    gl.drawArrays( gl.TRIANGLES, 0, points.length );
	
	
	 setTimeout(
        function () {requestAnimFrame( render );},
        speed
    );
	
}

