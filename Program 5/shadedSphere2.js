

var canvas;
var gl;

var numTimesToSubdivide = 4;
 
var index = 0;

var pointsArray = [];
var normalsArray = [];
var planePts = [];
var colors = [];
var planeClrs = [];

var x_translate = 0.0;
var y_translate = 0.0;
var z_translate = 0.0;

var x_rotate = 0.0;
var y_rotate = 0.0;
var z_rotate = 0.0;

var camera_x = 0.0;
var camera_y = 0.0;
var camera_z = -5.0;

var lookAt_x = 0.0;
var lookAt_y = 0;
var lookAt_z = 5.0;

var light_x = -0.4;
var light_y = -0.4;
var light_z = 3.8;

var near = -10;
var far = 10;
var radius = 1.5;
var theta  = 0.0;
var phi    = 0.0;
var dr = 5.0 * Math.PI/180.0;
var fieldOfView = 50;

var mouseDown = false;
var freeTranslate = false;

var rotateX = false;
var rotateY = false;
var rotateZ = false;

var newX;
var newY;

var speed = 100;

var left = -3.0;
var right = 3.0;
var ytop =3.0;
var bottom = -3.0;

var va = vec4(0.0, 0.0, -1.0,1);
var vb = vec4(0.0, 0.942809, 0.333333, 1);
var vc = vec4(-0.816497, -0.471405, 0.333333, 1);
var vd = vec4(0.816497, -0.471405, 0.333333,1);
    
var lightPosition = vec4(light_x, light_y, light_z, 0.0 );
var lightAmbient = vec4(0.0, 0.0, 0.0, 1.0 );
var lightDiffuse = vec4( 1.0, 1.0, 1.0, 1.0 );
var lightSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );

var materialAmbient = vec4( 1.0, 1.0, 1.0, 1.0 );
var materialDiffuse = vec4( 1.0, 1.0, 1.0, 1.0 );
var materialSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );
var materialShininess = 100.0;

var ctm;
var ambientColor, diffuseColor, specularColor;


var modelViewMatrix, projectionMatrix, transformMatrix;
var modelViewMatrixLoc, projectionMatrixLoc, transformLoc, lightLoc, shadingLoc;
transformMatrix = mat4();

var eye;
var at = vec3(0.0, 0.0, 0.0);
var up = vec3(0.0, 1.0, 0.0);

var shading = 1.0;
    
function triangle(a, b, c) {

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
	 colors.push( baseColors[0] );
	 colors.push( baseColors[0] );
	 
     pointsArray.push(a);
     pointsArray.push(b);      
     pointsArray.push(c);

     index += 3;
}


function divideTriangle(a, b, c, count) {
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
        triangle( a, b, c );
    }
}


function tetrahedron(a, b, c, d, n) {
    divideTriangle(a, b, c, n);
    divideTriangle(d, c, b, n);
    divideTriangle(a, d, b, n);
    divideTriangle(a, c, d, n);
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
            planeClrs.push( vec3(0.0, 0.0, 0.0));
			planeClrs.push( vec3(0.0, 0.0, 0.0));
			planeClrs.push( vec3(0.0, 0.0, 0.0));
			planeClrs.push( vec3(0.0, 0.0, 0.0));
			planeClrs.push( vec3(0.0, 0.0, 0.0));
			planeClrs.push( vec3(0.0, 0.0, 0.0));
			}
			else 
			{
            planeClrs.push( vec3(1.0, 1.0, 1.0));
			planeClrs.push( vec3(1.0, 1.0, 1.0));
			planeClrs.push( vec3(1.0, 1.0, 1.0));
			planeClrs.push( vec3(1.0, 1.0, 1.0));
			planeClrs.push( vec3(1.0, 1.0, 1.0));
			planeClrs.push( vec3(1.0, 1.0, 1.0));
			}
			
			planePts.push(vec4(x, -1, z, 1));
			planePts.push(vec4(x-5, -1, z, 1));
			planePts.push(vec4(x, -1, z-5, 1));
			planePts.push(vec4(x, -1, z-5,1));
			planePts.push(vec4(x-5, -1, z-5, 1));
			planePts.push(vec4(x-5, -1, z, 1));
        ++i;
		}
    ++i;
	}

}

window.onload = function init() {

    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
      gl.clearColor( .23, .32, .62, 1.0 );
    
    gl.enable(gl.DEPTH_TEST);

    //
    //  Load shaders and initialize attribute buffers
    //
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    

    ambientProduct = mult(lightAmbient, materialAmbient);
    diffuseProduct = mult(lightDiffuse, materialDiffuse);
    specularProduct = mult(lightSpecular, materialSpecular);

    
    tetrahedron(va, vb, vc, vd, numTimesToSubdivide);
	subdividePlane();

    var nBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, nBuffer);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW );
    
    var vNormal = gl.getAttribLocation( program, "vNormal" );
    gl.vertexAttribPointer( vNormal, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vNormal);
	
    var cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW );
	
    var vColor = gl.getAttribLocation( program, "vColor" );
    gl.vertexAttribPointer( vColor, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor );

    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);
    
    var vPosition = gl.getAttribLocation( program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);
    
    modelViewMatrixLoc = gl.getUniformLocation( program, "modelViewMatrix" );
    projectionMatrixLoc = gl.getUniformLocation( program, "projectionMatrix" );
	transformLoc = gl.getUniformLocation( program, "transformMatrix");
	lightLoc = gl.getUniformLocation( program, 'lightPosition');
	shadingLoc = gl.getUniformLocation(program,"shading");

	document.getElementById("fov").onchange = function(event) { fieldOfView = 50 + event.target.value*10; };
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
	document.getElementById("subdivs").onchange = function(event) {
        numTimesToSubdivide = event.target.value;
		pointsArray = [];
		normalsArray = [];
		colors = [];
		tetrahedron(va, vb, vc, vd, numTimesToSubdivide);
		gl.bufferData( gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW );
    };

	window.onmouseup = function(event) { mouseDown = false; };
	window.onmousedown = function(event) { mouseDown = true; };
	window.onmousemove = function(event) {
		if(mouseDown)
		{
			if(rotateX)
			{
			transformMatrix = mult(transformMatrix, rotate(0.25, 1, 0, 0));
			gl.uniformMatrix4fv(transformLoc, false, flatten(transformMatrix) );
			}
			if(rotateY)
			{
			transformMatrix = mult(transformMatrix, rotate(0.25, 0, 1, 0));
			gl.uniformMatrix4fv(transformLoc, false, flatten(transformMatrix) );
			}
			if(rotateZ)
			{
			transformMatrix = mult(transformMatrix, rotate(0.25, 0, 0, 1));
			gl.uniformMatrix4fv(transformLoc, false, flatten(transformMatrix) );
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
					if(newX > .50 && newX < .95) {camera_x -= 0.01; lookAt_x -= 0.01;}
					if(newY > .50 && newY < .95) {camera_y -= 0.01; lookAt_y -= 0.01; }
					if(newX < -.50 && newX > -.95) {camera_x += 0.01; lookAt_x += 0.01; }
					if(newY < -.50 && newY > -.95) {camera_y += 0.01; lookAt_y += 0.01; }
				}
			
			}
		}
	
	}
	window.onkeydown = function( event ) {
		var key = event.keyCode;
        switch( key ) {
			case 87: //w
			 camera_z += 0.2;
			 lookAt_z += 0.2;
            break;
			
            case 65: //a
			 camera_x -= 0.2;
			 lookAt_x -= 0.2;
            break;
			
		    case 83: //s
			 camera_z -=0.2;
			 lookAt_z -=0.2;
            break;
		
		    case 68: //d 
			 camera_x += 0.2;
			 lookAt_x += 0.2;
            break;
			
			case 67: //c
			shading = shading*-1;
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
			
			case 38: //UP arrow -- w is 87
			transformMatrix = mult(transformMatrix, translate(0,0.1,0));
			gl.uniformMatrix4fv(transformLoc, false, flatten(transformMatrix) );
            break;

            case 40: //DOWN arrow -- s is 83awd
		  	transformMatrix = mult(transformMatrix, translate(0,-0.1,0));
			gl.uniformMatrix4fv(transformLoc, false, flatten(transformMatrix) );
            break;

            case 37: //LEFT arrow -- a is 65
		  	transformMatrix = mult(transformMatrix, translate(0.1,0,0));
			gl.uniformMatrix4fv(transformLoc, false, flatten(transformMatrix) );
            break;
		
		    case 39: //RIGHT arrow -- d is 68
			transformMatrix = mult(transformMatrix, translate(-0.1,0,0));
			gl.uniformMatrix4fv(transformLoc, false, flatten(transformMatrix) );
            break;
		}
	};


    gl.uniform4fv( gl.getUniformLocation(program, 
       "ambientProduct"),flatten(ambientProduct) );
    gl.uniform4fv( gl.getUniformLocation(program, 
       "diffuseProduct"),flatten(diffuseProduct) );
    gl.uniform4fv( gl.getUniformLocation(program, 
       "specularProduct"),flatten(specularProduct) );	
    gl.uniform4fv( gl.getUniformLocation(program, 
       "lightPosition"),flatten(lightPosition) );
    gl.uniform1f( gl.getUniformLocation(program, 
       "shininess"),materialShininess );

    render();
}


function render() {
    
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  

	/* Update Matricies with currrent values */
    modelViewMatrix = lookAt(vec3(camera_x, camera_y, camera_z), vec3(lookAt_x, lookAt_y, lookAt_z), up);
	projectionMatrix = perspective(fieldOfView, 1, 0.1, 1000);
	
	
    lightPosition = vec4(light_x, light_y, light_z, 0.0 );
    gl.uniform4fv( lightLoc,flatten(lightPosition) );
	
	/* Link uniform variables and matricies */
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix) );
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix) );
	gl.uniformMatrix4fv(transformLoc, false, flatten(transformMatrix) );
	
	gl.uniform1f(shadingLoc, shading);
     
	/* Draw the array */
    //for( var i=0; i<index; i+=3) 
        //gl.drawArrays( gl.TRIANGLES, i, 3 );
	gl.drawArrays( gl.TRIANGLES, 0, pointsArray.length );
	
		//Update and draw plane first
	gl.bufferData( gl.ARRAY_BUFFER, flatten(planePts), gl.STATIC_DRAW );
    gl.drawArrays( gl.TRIANGLES, 0, planePts.length );
		

     setTimeout(
        function () {requestAnimFrame( render );},
        speed
    );
}
