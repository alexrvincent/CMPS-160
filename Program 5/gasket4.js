var canvas;
var gl;

var numTimesToSubdivide = 4;

var objPoints = [];
var planePts = [];
var colors = [];
var planeClrs = [];
var normalsArray = [];
var face_normalsArray = [];

var ModelViewMatrix = mat4();
var ProjectionMatrix = mat4();
var PerspectiveMatrix = mat4();
var ModelViewMatrix_location;
var ProjectionMatrix_location;
var PerspectiveMatrix_location;
var lightPosition_location;

var camera_x = 0.0;
var camera_y = 0.0;
var camera_z = 2.0;

var lookAt_x = 0.0;
var lookAt_y = 0;
var lookAt_z = -5.0;

var light_x = -0.8;
var light_y = -0.8; 
var light_z = -1.40;

var eye;

var up = vec3(0.0, 1.0, 0.0);

var fieldOfView = 60;

var mouseDown = false;
var freeTranslate = false;

var rotateX = false;
var rotateY = false;
var rotateZ = false;

var newX;
var newY;

var speed = 1000/60;

var shading = 1.0;
var shading_mode = 4;
var shading_name = "Phong";
var gouraud = false;
var shadingLoc;

var index = 0;

var va = vec4(0.0, 0.0, -1.0,1);
var vb = vec4(0.0, 0.942809, 0.333333, 1);
var vc = vec4(-0.816497, -0.471405, 0.333333, 1);
var vd = vec4(0.816497, -0.471405, 0.333333,1);
    
var lightPosition = vec4(light_x, light_y, light_z, 0.0 );
var lightAmbient = vec4(0.3, 0.3, 0.3, 1.0 );
var lightDiffuse = vec4( 1.0, 1.0, 1.0, 1.0 );
var lightSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );

var materialAmbient = vec4( 1.0, 1.0, 1.0, 1.0 );
var materialDiffuse = vec4( 1.0, 1.0, 1.0, 1.0 );
var materialSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );
var materialShininess = 100.0;

var ctm;
var ambientColor, diffuseColor, specularColor;



window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    var vertices = [
        vec3(  0.0000,  0.0000, -1.0000 ),
        vec3(  0.0000,  0.9428,  0.3333 ),
        vec3( -0.8165, -0.4714,  0.3333 ),
        vec3(  0.8165, -0.4714,  0.3333 )
    ];
	
    //divideTetra( vertices[0], vertices[1], vertices[2], vertices[3], NumTimesToSubdivide);
	tetrahedron(va, vb, vc, vd, numTimesToSubdivide);	
	subdividePlane();
	 

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
    
	ambientProduct = mult(lightAmbient, materialAmbient);
    diffuseProduct = mult(lightDiffuse, materialDiffuse);
    specularProduct = mult(lightSpecular, materialSpecular);


	var nBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, nBuffer);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW );
    
    //var vNormal = gl.getAttribLocation( program, "vNormal" );
    //gl.vertexAttribPointer( vNormal, shading_mode, gl.FLOAT, false, 0, 0 );
    //gl.enableVertexAttribArray( vNormal);

	
    var cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW );
	
	
    var vColor = gl.getAttribLocation( program, "vColor" );
    gl.vertexAttribPointer( vColor, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor );
	

    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(objPoints), gl.STATIC_DRAW );

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );
	
	
	
	// User Interface Elements
	
	document.getElementById("subdivs").onchange = function(event) {
        numTimesToSubdivide = event.target.value;
		objPoints = [];
		normalsArray = [];
		colors = [];
		tetrahedron(va, vb, vc, vd, numTimesToSubdivide);
		//gl.bufferData( gl.ARRAY_BUFFER, flatten(objPoints), gl.STATIC_DRAW );
    };
	document.getElementById("Gouraud").onclick = function(event) {
	 
	gouraud = true;
    var vNormal = gl.getAttribLocation( program, "vNormal" );
    gl.vertexAttribPointer( vNormal, shading_mode, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray(vNormal);
	
	shading += 1.0;
	if(shading > 3.0) shading = 0.0;
	if(shading === 0.0) shading_name = "No Light";
	if(shading === 1.0 && gouraud) shading_name = "Gouraud";
	if(shading === 1.0 && !gouraud) shading_name = "Phong";
	if(shading === 2.0) shading_name = "Perlin Noise";
	if(shading === 3.0) shading_name = "Cartoon";
	}
	document.getElementById("toggle").onclick = function () {
		 if(shading != 0)
			{
				shading = 0.0;
				shading_name = "No Light";
			}
			else 
			{
				shading = 1.0;
				if(gouraud) shading_name = "Gouraud";
			    else shading_name = "Phong";
			}
	};
	document.getElementById("fov").onchange = function(event) { fieldOfView = 50 + event.target.value*10;};
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
	document.getElementById("reset").onclick = function () { location.reload(true);};
	
	window.onmouseup = function(event){ mouseDown = false;}
	window.onmousedown = function(event) {
	
		mouseDown = true;
		if(!freeTranslate && !rotateX && !rotateY && !rotateZ)
			{
				var x = event.clientX;
				var y = event.clientY;
				var rect = event.target.getBoundingClientRect();
	
				newX = ((x - rect.left) - canvas.height / 2) / (canvas.height / 2);
				newY = (canvas.width / 2 - (y - rect.top)) / (canvas.width / 2);
				
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
	window.onmousemove = function(event) {
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
					//objPoints = [];
					//colors = [];
					//divideTetra( vertices[0], vertices[1], vertices[2], vertices[3],
								//NumTimesToSubdivide);
					//gl.bufferData( gl.ARRAY_BUFFER, flatten(objPoints), gl.STATIC_DRAW );
				
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
			
			case 73: // i
			light_z += 0.1;
			break;
			
			case 74: // j
			light_x += 0.1;
			break;
			
			case 75: //k
			light_z -= 0.1;
			break;
			
			case 76: // l
			light_x -= 0.1;
			break;
			
			case 85: // u
			light_y += 0.1;
			break;
			
			case 79: // o
			light_y -= 0.1;
			break;
			
			case 82: // r
			location.reload(true)
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
			
		  case 67: //c
		    if(shading != 0)
			{
				shading = 0.0;
				shading_name = "No Light";
			}
			else 
			{
				shading = 1.0;
				if(gouraud) shading_name = "Gouraud";
			    else shading_name = "Phong";
			}
			
            break;
        }
    };
	
	
	//Set up Camera, lookAt functions with default values. Correct Gasket orientation
	var temp = lookAt(vec3(camera_x, camera_y, camera_z), vec3(lookAt_x, lookAt_y, lookAt_z), up);					  
	ModelViewMatrix = mult(temp, ModelViewMatrix);
	ModelViewMatrix = mult(ModelViewMatrix, rotate(180, 0, 1, 0));
	
	
	// Create and link Perspective Matrix
	PerspectiveMatrix = mult(PerspectiveMatrix, perspective(fieldOfView, 1, 0.1, 1000));
	PerspectiveMatrix_location = gl.getUniformLocation(program, "PerspectiveMatrix");
	gl.uniformMatrix4fv( PerspectiveMatrix_location,  false, flatten(PerspectiveMatrix) );
	
	
	// Link ModelView/Projection Matrix
	ProjectionMatrix_location = gl.getUniformLocation(program,"ProjectionMatrix");
	ModelViewMatrix_location = gl.getUniformLocation(program, "ModelViewMatrix");
	gl.uniformMatrix4fv( ProjectionMatrix_location,  false, flatten(ProjectionMatrix) );
	gl.uniformMatrix4fv( ModelViewMatrix_location, false, flatten(ModelViewMatrix));
	
	//Link Lighting Matricies
	gl.uniform4fv( gl.getUniformLocation(program, 
       "ambientProduct"),flatten(ambientProduct) );
    gl.uniform4fv( gl.getUniformLocation(program, 
       "diffuseProduct"),flatten(diffuseProduct) );
    gl.uniform4fv( gl.getUniformLocation(program, 
       "specularProduct"),flatten(specularProduct) );
	lightPosition_location = gl.getUniformLocation(program, "lightPosition");
    gl.uniform4fv( lightPosition_location,flatten(lightPosition) );
    gl.uniform1f( gl.getUniformLocation(program, 
       "shininess"),materialShininess );
	   
	shadingLoc = gl.getUniformLocation(program,"shading");
	
	//console.log(PerlinNoise_1D());
	
    render();
};


function triangle( a, b, c, color )
{
    var baseColors = [
        vec3(1.0, 0.0, 0.0),
        vec3(0.0, 1.0, 0.0),
        vec3(0.0, 0.0, 1.0),
        vec3(1.0, 1.0, 1.0)
    ];
	
    colors.push( baseColors[color] );
    objPoints.push( a );
    colors.push( baseColors[color] );
    objPoints.push( b );
    colors.push( baseColors[color] );
    objPoints.push( c );
}

function sphereTriangle(a, b, c){ //
	var baseColors = [
        vec3(0.5, 0.0, 0.0),
        vec3(0.0, 0.5, 0.0),
        vec3(0.0, 0.0, 0.5),
        vec3(1.0, 1.0, 1.0)
    ];
	

	 normalsArray.push(a);
     normalsArray.push(b);
     normalsArray.push(c);
     
	 colors.push( baseColors[0] );
     objPoints.push(a);
	 colors.push( baseColors[0] );
     objPoints.push(b); 
	 colors.push( baseColors[0] );
     objPoints.push(c);

     index += 3;
}

function divideTriangle(a, b, c, count) { //
    if ( count > 0 ) {
                
        var ab = mix( a, b, 0.5);
        var ac = mix( a, c, 0.5);
        var bc = mix( b, c, 0.5);
                
        ab = normalize(ab, true);
        ac = normalize(ac, true);
        bc = normalize(bc, true);
                                
        divideTriangle( a, ab, ac, count - 1 );
        divideTriangle( ab, b, bc, count - 1 );
        divideTriangle( bc, c, ac, count - 1 );
        divideTriangle( ab, bc, ac, count - 1 );
    }
    else { 
        sphereTriangle( a, b, c );
    }
}

function tetrahedron(a, b, c, d, n) { //
    divideTriangle(a, b, c, n);
    divideTriangle(d, c, b, n);
    divideTriangle(a, d, b, n);
    divideTriangle(a, c, d, n);
}

function tetra( a, b, c, d )
{
    triangle( a, c, b, 0 );
    triangle( a, c, d, 1 );
    triangle( a, b, d, 2 );
    triangle( b, c, d, 3 );
}

function divideTetra( a, b, c, d, count )
{
    if ( count === 0 ) {
        tetra( a, b, c, d );
    }
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


function subdividePlane()
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
			
			normalsArray.push(-1);
			normalsArray.push(-1);
			normalsArray.push(-1);
			normalsArray.push(-1);
			normalsArray.push(-1);
			normalsArray.push(-1);
			
			
			planePts.push(vec4(x, -1, z));
			planePts.push(vec4(x-5, -1, z));
			planePts.push(vec4(x, -1, z-5));
			planePts.push(vec4(x, -1, z-5));
			planePts.push(vec4(x-5, -1, z-5));
			planePts.push(vec4(x-5, -1, z));
        ++i;
		}
    ++i;
	}

}



function render()
{	   
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	document.getElementById("shading_name").innerHTML = shading_name;
    /* Save ModelView Data */	
	var temp = ModelViewMatrix;
	ModelViewMatrix = mat4();
	gl.uniformMatrix4fv(ModelViewMatrix_location, false, flatten(ModelViewMatrix));
	
	
	/* Update the Projection Matrix with current lookAt values */
	ProjectionMatrix = lookAt(vec3(camera_x, camera_y, camera_z), vec3(lookAt_x, lookAt_y, lookAt_z), up);
	gl.uniformMatrix4fv( ProjectionMatrix_location,  false, flatten(ProjectionMatrix) );
	
	/* Update uniform variables */
	lightPosition = vec4(light_x, light_y, light_z, 0.0 );
	gl.uniform4fv( lightPosition_location,flatten(lightPosition) );
	gl.uniform1f(shadingLoc, shading);
	
	/* Update Perspective Matrix */
	PerspectiveMatrix = perspective(fieldOfView, 1, 0.1, 1000);
	gl.uniformMatrix4fv( PerspectiveMatrix_location,  false, flatten(PerspectiveMatrix) );				  
	
	//Update and draw plane first
	gl.bufferData( gl.ARRAY_BUFFER, flatten(planePts), gl.STATIC_DRAW );
    gl.drawArrays( gl.TRIANGLES, 0, planePts.length );
	
	//Restore ModelView Data and draw its updated form
	ModelViewMatrix = temp;
	gl.uniformMatrix4fv(ModelViewMatrix_location, false, flatten(ModelViewMatrix));
	gl.bufferData( gl.ARRAY_BUFFER, flatten(objPoints), gl.STATIC_DRAW );
	for( var i=0; i<index; i+=3) 
		gl.drawArrays( gl.TRIANGLES, i, 3 );
    //gl.drawArrays( gl.TRIANGLES, 0, objPoints.length );
	
	 setTimeout(
        function () {requestAnimFrame( render );},
        speed
    );
	
}

