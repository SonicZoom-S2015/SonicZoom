meSpeak.loadConfig("JSON/mespeak_config.json");
meSpeak.loadVoice('JSON/en.json');
/**
 * Initialize vars from global storage
 * @type {Number}
 */
var lives = localStorage.getItem("lives");
/**
 * Get the previouisly saved score
 * @type {Number}
 */
var Score = parseInt(localStorage.getItem("highScore"));
if(Score == NaN){
    Score = 0;
}
if(lives == NaN){
    lives = 3
}
var start;
/**
 * For obstacle collision
 * @type {number}
 */
var timetoWait = 0;

/**
 * Div for displaying the speed
 * @type {Element}
 */
var SpeedDIV = document.createElement('div');
SpeedDIV.style.position = 'absolute';
SpeedDIV.style.width = 100;
SpeedDIV.style.height = 100;
SpeedDIV.innerHTML = 0;
SpeedDIV.style.top = window.innerHeight*.01 + 'px';
SpeedDIV.style.left = window.innerWidth*.8 + 'px';
SpeedDIV.style.fontSize = 50 + 'px';
SpeedDIV.style.color = "GreenYellow";
document.body.appendChild(SpeedDIV);

/**
 * Div for displaying score
 * @type {Element}
 */
var ScoreDIV = document.createElement('div');
ScoreDIV.style.position = 'absolute';
ScoreDIV.style.width = 100;
ScoreDIV.style.height = 100;
ScoreDIV.innerHTML = "Score: " + parseInt(Score);
ScoreDIV.style.top = window.innerHeight*.01 + 'px';
ScoreDIV.style.left = window.innerWidth*.075 + 'px';
ScoreDIV.style.fontSize = 50 + 'px';
ScoreDIV.style.color = "GreenYellow";
document.body.appendChild(ScoreDIV);

/**
 * Div for displaying lives
 * @type {Element}
 */
var LivesDIV = document.createElement('div');
LivesDIV.style.position = 'absolute';
LivesDIV.style.width = 100;
LivesDIV.style.height = 100;
LivesDIV.innerHTML = "Lives: " + lives;
LivesDIV.style.top = window.innerHeight*.90 + 'px';
LivesDIV.style.left = window.innerWidth*.075 + 'px';
LivesDIV.style.fontSize = 50 + 'px';
LivesDIV.style.color = "GreenYellow";
document.body.appendChild(LivesDIV);

/**
 * Div for displaying time
 * @type {Element}
 */
var TimerDIV = document.createElement('div');
TimerDIV.style.position = 'absolute';
TimerDIV.style.width = 100;
TimerDIV.style.height = 100;
TimerDIV.innerHTML = "Time: 0";
TimerDIV.style.top = window.innerHeight*.80 + 'px';
TimerDIV.style.left = window.innerWidth*.075 + 'px';
TimerDIV.style.fontSize = 50 + 'px';
TimerDIV.style.color = "GreenYellow";
document.body.appendChild(TimerDIV);

/**
 * For placing all the WebGL & THREE.JS objects
 * @type {Element}
 */
var container;

/**
 * THREE.JS elements for animation
 * @type {THREE}
 */
var camera, scene, renderer, splineCamera;

/**
 * THREE.JS camera look ahead
 * @type {THREE.Vector3}
 */
var binormal = new THREE.Vector3();
/**
 * THREE.JS camera look ahead
 * @type {THREE.Vector3}
 */
var normal = new THREE.Vector3();

/**
 * Array to hold points that splines will follow
 * @type {Array}
 */
var Middlepoints = [];
/**
 * Array to hold points that splines will follow
 * @type {Array}
 */
var Leftpoints = [];
/**
 * Array to hold points that splines will follow
 * @type {Array}
 */
var Rightpoints = [];

//
/**
 * Vector location for finish line
 * @type {THREE.Vector3}
 */
var finishVertex;

/**
 * Lowest speed that player can go
 * @type {number}
 */
var minSpeed = .00025;

/**
 * Camera speed on spline
 * @type {number}
 */
var t = .001;

/**
 * Starting speed of player
 * @type {number}
 */
var speed = .00000;

// for pause(ESC) - options: resume(ESC), restart(ESC again), resume(SPACE)
var id;
var paused = false;
var restart = false;
var exit = false;

/**
 * Div for Text Pause
 * @type {Element}
 */
var PauseDIV = document.createElement('div');
PauseDIV.style.position = 'absolute';
PauseDIV.style.width = 100;
PauseDIV.style.height = 100;
PauseDIV.innerHTML = "Paused";
PauseDIV.style.top = window.innerHeight*.1 + 'px';
PauseDIV.style.left = window.innerWidth*.4 + 'px';
PauseDIV.style.fontSize = 100 + 'px';

/**
 * Text Restart
 * @type {Element}
 */
var RestartDIV = document.createElement('div');

/**
 * Text Quit
 * @type {Element}
 */
var QuitDIV = document.createElement('div');


/**
 * Track divided into 450 divisions which can have coins or obstacles. Allows for easy collision detection based
 * on what division the user is in.
 * @type {number}
 */
var divisions = 450;
/**
 * Calculate the width of each division
 * @type {number}
 */
var width = 2950/(divisions-1);
/**
 * Keeps track of objects on level
 * @type {Array}
 */
var objArray = [];
for(i=0;i<divisions;i++){
    objArray.push([0,0,0]);
}

/**
 * Function places the objects in the animation based values in the objArray
 */
function makeCoinsObstacles(){
    var cubegeometry = new THREE.BoxGeometry( 1, 1, 1);
    var coinMaterial = new THREE.MeshBasicMaterial({
        map: THREE.ImageUtils.loadTexture('Textures/cointex.bmp')
    });
    var mineMaterial = new THREE.MeshBasicMaterial({
        map: THREE.ImageUtils.loadTexture('Textures/minetex.bmp')
    });
    for(i=0;i<divisions;i++){
        for(j=0;j<3;j++){
            if(objArray[i][j]==1) {
                aCoin = new THREE.Mesh(cubegeometry, coinMaterial);
                aCoin.position.x = -10;
                aCoin.position.y = i * width;
                aCoin.position.z = (i * width + (j - 1) * 20);
                aCoin.scale.set(scale, scale, scale);
                scene.add(aCoin);
            }else if(objArray[i][j]==2){
                aMine = new THREE.Mesh(cubegeometry, mineMaterial);
                aMine.position.x = -10;
                aMine.position.y = i * width;
                aMine.position.z = (i * width + (j - 1) * 20);
                aMine.scale.set(scale, scale, scale);
                scene.add(aMine);
            }
        }
    }
}
/**
 * Initialize starting previous point since previous point determines next point
 * @type {THREE.Vector3}
 */
var prevPoint = new THREE.Vector3(0, 0, 0);

//Creates the points that will be followed by the spline
for (var i = 0; i < 50; i++){
    var randomX = prevPoint.x + 15;// + Math.round(Math.random() * 1.5);
    var randomY = prevPoint.y + 15;// + Math.round(Math.random() * 1.5);
    var randomZ = prevPoint.z + 15;// + Math.round(Math.random() * 1.5);

    var midx = (randomX + prevPoint.x)/2;
    var midy = (randomY + prevPoint.y)/2;
    var midz = (randomZ + prevPoint.z)/2;

    //Used for creating the finsh line
    if(i == 49){
        finishVertex = new THREE.Vector3(0,randomY, randomZ);
    }

    prevPoint.x = randomX;
    prevPoint.y = randomY;
    prevPoint.z = randomZ;

    Middlepoints.push(new THREE.Vector3(0, midy, midz));
    Middlepoints.push(new THREE.Vector3(0, randomY, randomZ));
    Leftpoints.push(new THREE.Vector3(0, midy, midz-5));
    Leftpoints.push(new THREE.Vector3(0, randomY, randomZ-5));
    Rightpoints.push(new THREE.Vector3(0, midy, midz+5));
    Rightpoints.push(new THREE.Vector3(0, randomY, randomZ+5));
}

/**
 * Create the splines that follow the generated points
 * @type {THREE.SplineCurve3}
 */
var MiddleSpline = new THREE.SplineCurve3(Middlepoints);
/**
 * Create the splines that follow the generated points
 * @type {THREE.SplineCurve3}
 */
var LeftSpline = new THREE.SplineCurve3(Leftpoints);
/**
 * Create the splines that follow the generated points
 * @type {THREE.SplineCurve3}
 */
var RightSpline = new THREE.SplineCurve3(Rightpoints);

/**
 * Spline that each path will follow
 * @type {THREE.SplineCurve3}
 */
MiddlePath = MiddleSpline;
/**
 * Spline that each path will follow
 * @type {THREE.SplineCurve3}
 */
LeftPath = LeftSpline;
/**
 * Spline that each path will follow
 * @type {THREE.SplineCurve3}
 */
RightPath = RightSpline;
/**
 * Spline the tunnel will follow
 * @type {THREE.SplineCurve3}
 */
PipePath = MiddleSpline;

/**
 * Camera Position
 * @type {num}
 */
var pos;

/**
 * Current location of camera
 * Middle = 1
 * Left = 0
 * Right = 2
 * @type {number}
 */
var CameraLane = 1;

/**
 * All three paths
 */
var Middleparent, Leftparent, Rightparent;
var MiddleLaneMesh, LeftLaneMesh, RightLaneMesh;
var MiddleTube, LeftTube, RightTube;
/**
 * Initalize animation
 * @type {boolean}
 */
var animation = false;
/**
 * Set scaling factor
 * @type {number}
 */
var scale = 4;
/**
 * Check track of textures for each part of level
 * @type {String}
 */
var LeftLaneText, MiddleLaneText, RightLaneText, CeilingTexture;

//Place objects and load textures based on the current level. Current level is passed through localStorage.
if(localStorage.getItem("level") == 1){

    objArray[24][2] = 1;
    //objArray[45][2] = 1;
    objArray[73][1] = 1;
    objArray[110][0] = 1;
    //objArray[135][1] = 1;
    objArray[160][1] = 1;
    objArray[225][2] = 1;
    objArray[250][1] = 1;
    objArray[275][2] = 1;
    //objArray[300][2] = 1;
    objArray[315][0] = 1;
    //objArray[330][0] = 1;
    objArray[385][1] = 1;
    objArray[430][1] = 1;

    LeftLaneText = 'Textures/blue.jpg';
    MiddleLaneText = 'Textures/green.jpg';
    RightLaneText = 'Textures/red.jpg';
    CeilingTexture = 'Textures/cathroof.jpg';}

else if(localStorage.getItem("level") == 2){

    objArray[24][0] = 1;
    //objArray[45][2] = 1;
    objArray[73][1] = 1;
    objArray[110][2] = 1;
    //objArray[135][1] = 1;
    objArray[160][2] = 1;
    objArray[225][1] = 1;
    objArray[250][0] = 1;
    objArray[275][0] = 1;
    //objArray[300][2] = 1;
    objArray[315][1] = 1;
    //objArray[330][0] = 1;
    objArray[385][2] = 1;
    objArray[430][0] = 1;

    LeftLaneText = 'Textures/blue.jpg';
    MiddleLaneText = 'Textures/green.jpg';
    RightLaneText = 'Textures/red.jpg';
    CeilingTexture = 'Textures/cathroof.jpg';}

else if(localStorage.getItem("level") == 3){

    objArray[24][0] = 1;
    //objArray[45][2] = 1;
    objArray[73][0] = 1;
    objArray[110][0] = 1;
    //objArray[135][1] = 1;
    objArray[160][1] = 1;
    objArray[225][1] = 1;
    objArray[250][1] = 1;
    objArray[275][2] = 1;
    //objArray[300][2] = 1;
    objArray[315][2] = 1;
    //objArray[330][0] = 1;
    objArray[385][2] = 1;
    objArray[430][0] = 1;

    LeftLaneText = 'Textures/blue.jpg';
    MiddleLaneText = 'Textures/green.jpg';
    RightLaneText = 'Textures/red.jpg';
    CeilingTexture = 'Textures/cathroof.jpg';}

else if(localStorage.getItem("level") == 4){

    objArray[24][0] = 1;
    //objArray[45][2] = 1;
    objArray[73][2] = 1;
    objArray[110][0] = 1;
    //objArray[135][1] = 1;
    objArray[160][2] = 1;
    objArray[225][0] = 1;
    objArray[250][1] = 1;
    objArray[275][0] = 1;
    //objArray[300][2] = 1;
    objArray[315][2] = 1;
    //objArray[330][0] = 1;
    objArray[385][0] = 1;
    objArray[430][2] = 1;

    LeftLaneText = 'Textures/blue.jpg';
    MiddleLaneText = 'Textures/green.jpg';
    RightLaneText = 'Textures/red.jpg';
    CeilingTexture = 'Textures/cathroof.jpg';}

else if(localStorage.getItem("level") == 5){

    objArray[24][0] = 1;
    objArray[45][1] = 1;
    objArray[95][0] = 1;
    objArray[115][1] = 1;
    objArray[135][0] = 1;
    objArray[155][2] = 1;
    objArray[185][1] = 1;
    objArray[225][1] = 1;
    objArray[255][1] = 2;
    objArray[285][2] = 1;
    objArray[305][2] = 1;
    //objArray[315][0] = 1;
    objArray[330][1] = 1;
    objArray[360][0] = 1;
    objArray[400][2] = 1;
    objArray[430][0] = 1;

    LeftLaneText = 'Textures/coral.jpg';
    MiddleLaneText = null;
    RightLaneText = null;
    CeilingTexture = 'Textures/uw.jpg';}

else if(localStorage.getItem("level") == 6){

    objArray[24][2] = 1;
    objArray[45][0] = 1;
    objArray[95][0] = 1;
    objArray[115][0] = 2;
    objArray[135][1] = 1;
    objArray[185][2] = 1;
    objArray[225][1] = 1;
    objArray[255][1] = 1;
    objArray[285][2] = 1;
    objArray[305][2] = 1;
    //objArray[315][0] = 1;
    objArray[330][0] = 1;
    objArray[360][0] = 1;
    objArray[400][1] = 1;
    objArray[430][1] = 1;

    LeftLaneText = 'Textures/coral.jpg';
    MiddleLaneText = null;
    RightLaneText = null;
    CeilingTexture = 'Textures/uw.jpg';}

else if(localStorage.getItem("level") == 7){

    objArray[24][0] = 1;
    objArray[45][1] = 1;
    objArray[95][1] = 1;
    objArray[115][2] = 1;
    objArray[135][2] = 1;
    objArray[185][0] = 1;
    objArray[225][0] = 1;
    objArray[255][0] = 2;
    objArray[285][2] = 1;
    objArray[305][2] = 1;
    //objArray[315][0] = 1;
    objArray[330][0] = 1;
    objArray[360][0] = 1;
    objArray[400][1] = 1;
    objArray[430][1] = 1;

    LeftLaneText = 'Textures/coral.jpg';
    MiddleLaneText = null;
    RightLaneText = null;
    CeilingTexture = 'Textures/uw.jpg';}

else if(localStorage.getItem("level") == 8){

    objArray[24][1] = 1;
    objArray[45][2] = 1;
    objArray[95][0] = 1;
    objArray[115][1] = 1;
    objArray[135][2] = 1;
    objArray[185][0] = 1;
    objArray[225][0] = 1;
    objArray[255][1] = 1;
    objArray[285][2] = 1;
    objArray[305][2] = 2;
    //objArray[315][0] = 1;
    objArray[330][1] = 1;
    objArray[360][1] = 1;
    objArray[400][2] = 1;
    objArray[430][0] = 1;

    LeftLaneText = 'Textures/coral.jpg';
    MiddleLaneText = null;
    RightLaneText = null;
    CeilingTexture = 'Textures/uw.jpg';}

else if(localStorage.getItem("level") == 9){

    objArray[24][2] = 1;
    objArray[24][0] = 1;
    //objArray[45][2] = 1;
    objArray[54][0] = 1;
    objArray[54][1] = 1;
    objArray[95][0] = 1;
    objArray[125][0] = 1;
    objArray[125][2] = 2;
    objArray[150][1] = 1;
    //objArray[162][1] = 1;
    objArray[185][1] = 1;
    objArray[185][2] = 1;
    objArray[209][1] = 1;
    //objArray[225][1] = 1;
    objArray[252][1] = 1;
    objArray[285][2] = 1;
    objArray[285][1] = 2;
    objArray[305][2] = 1;
    objArray[335][0] = 1;
    objArray[355][0] = 1;
    objArray[355][2] = 1;
    objArray[385][1] = 1;
    //objArray[400][1] = 1;
    objArray[415][1] = 1;
    objArray[415][0] = 2;

    LeftLaneText = 'Textures/jungle_soil.jpg';
    MiddleLaneText = null;
    RightLaneText = null;
    CeilingTexture = 'Textures/green-world-roof.jpg';}

else if(localStorage.getItem("level") == 10){

    objArray[24][0] = 1;
    objArray[24][1] = 1;
    //objArray[45][2] = 1;
    objArray[54][1] = 1;
    objArray[54][2] = 1;
    objArray[95][0] = 2;
    objArray[125][2] = 1;
    objArray[125][0] = 2;
    objArray[150][1] = 1;
    //objArray[162][1] = 1;
    objArray[185][0] = 1;
    objArray[185][1] = 1;
    objArray[209][1] = 1;
    //objArray[225][1] = 1;
    objArray[252][2] = 1;
    objArray[285][1] = 1;
    objArray[285][2] = 2;
    objArray[305][0] = 1;
    objArray[335][1] = 1;
    objArray[355][2] = 1;
    objArray[355][0] = 1;
    objArray[385][1] = 1;
    //objArray[400][1] = 1;
    objArray[415][0] = 1;
    objArray[415][1] = 2;

    LeftLaneText = 'Textures/jungle_soil.jpg';
    MiddleLaneText = null;
    RightLaneText = null;
    CeilingTexture = 'Textures/green-world-roof.jpg';}

else if(localStorage.getItem("level") == 11){

    objArray[24][0] = 1;
    objArray[24][2] = 1;
    //objArray[45][2] = 1;
    objArray[54][2] = 1;
    objArray[54][1] = 1;
    objArray[95][1] = 2;
    objArray[125][2] = 1;
    objArray[125][1] = 2;
    objArray[150][0] = 1;
    //objArray[162][1] = 1;
    objArray[185][0] = 1;
    objArray[185][2] = 2;
    objArray[209][0] = 2;
    objArray[209][2] = 1;
    //objArray[225][1] = 1;
    objArray[252][1] = 1;
    objArray[285][1] = 1;
    objArray[285][2] = 2;
    objArray[305][0] = 1;
    objArray[335][2] = 1;
    objArray[355][2] = 1;
    objArray[355][0] = 1;
    objArray[385][1] = 1;
    objArray[385][2] = 1;
    //objArray[400][1] = 1;
    objArray[415][0] = 1;
    objArray[415][1] = 2;

    LeftLaneText = 'Textures/jungle_soil.jpg';
    MiddleLaneText = null;
    RightLaneText = null;
    CeilingTexture = 'Textures/green-world-roof.jpg';}

else if(localStorage.getItem("level") == 12){

    objArray[24][1] = 1;
    objArray[24][2] = 1;
    //objArray[45][2] = 1;
    objArray[54][1] = 1;
    objArray[54][2] = 2;
    objArray[95][0] = 2;
    objArray[125][0] = 1;
    objArray[125][1] = 2;
    objArray[150][2] = 1;
    //objArray[162][1] = 1;
    objArray[185][2] = 1;
    objArray[185][0] = 2;
    objArray[209][1] = 2;
    objArray[209][2] = 1;
    //objArray[225][1] = 1;
    objArray[252][0] = 1;
    objArray[285][1] = 1;
    objArray[285][2] = 2;
    objArray[305][2] = 1;
    objArray[335][1] = 1;
    objArray[355][2] = 1;
    objArray[355][0] = 2;
    objArray[385][1] = 2;
    objArray[385][2] = 1;
    //objArray[400][1] = 1;
    objArray[415][0] = 1;
    objArray[415][1] = 2;

    LeftLaneText = 'Textures/jungle_soil.jpg';
    MiddleLaneText = null;
    RightLaneText = null;
    CeilingTexture = 'Textures/green-world-roof.jpg';}

else if(localStorage.getItem("level") == 13){

    objArray[24][0] = 1;
    objArray[45][1] = 2;
    objArray[95][0] = 1;
    objArray[115][1] = 2;
    objArray[135][0] = 2;
    objArray[155][2] = 1;
    objArray[185][1] = 2;
    objArray[225][1] = 1;
    objArray[255][1] = 2;
    objArray[285][2] = 2;
    objArray[305][2] = 1;
    //objArray[315][0] = 1;
    objArray[330][1] = 1;
    objArray[360][0] = 2;
    objArray[400][2] = 1;
    objArray[430][0] = 2;

    LeftLaneText = 'Textures/lfloor.jpg';
    MiddleLaneText = null;
    RightLaneText = null;
    CeilingTexture = 'Textures/lava.jpg';}

else if(localStorage.getItem("level") == 14){

    objArray[24][2] = 2;
    objArray[45][0] = 2;
    objArray[95][0] = 1;
    objArray[115][0] = 2;
    objArray[135][1] = 1;
    objArray[185][2] = 2;
    objArray[225][1] = 1;
    objArray[255][1] = 2;
    objArray[285][2] = 2;
    objArray[305][2] = 1;
    //objArray[315][0] = 1;
    objArray[330][0] = 1;
    objArray[360][0] = 2;
    objArray[400][1] = 2;
    objArray[430][1] = 1;

    LeftLaneText = 'Textures/lfloor.jpg';
    MiddleLaneText = null;
    RightLaneText = null;
    CeilingTexture = 'Textures/lava.jpg';}
else if(localStorage.getItem("level") == 15){

    objArray[24][0] = 2;
    objArray[45][1] = 2;
    objArray[95][1] = 1;
    objArray[115][2] = 2;
    objArray[135][2] = 2;
    objArray[185][0] = 1;
    objArray[225][0] = 2;
    objArray[255][0] = 2;
    objArray[285][2] = 2;
    objArray[305][2] = 1;
    //objArray[315][0] = 1;
    objArray[330][0] = 2;
    objArray[360][0] = 2;
    objArray[400][1] = 1;
    objArray[430][1] = 2;

    LeftLaneText = 'Textures/lfloor.jpg';
    MiddleLaneText = null;
    RightLaneText = null;
    CeilingTexture = 'Textures/lava.jpg';}

else if(localStorage.getItem("level") == 16){

    objArray[24][1] = 2;
    objArray[45][2] = 2;
    objArray[95][0] = 2;
    objArray[115][1] = 1;
    objArray[135][2] = 2;
    objArray[185][0] = 2;
    objArray[225][0] = 2;
    objArray[255][1] = 1;
    objArray[285][2] = 2;
    objArray[305][2] = 2;
    //objArray[315][0] = 1;
    objArray[330][1] = 2;
    objArray[360][1] = 1;
    objArray[400][2] = 2;
    objArray[430][0] = 2;

    LeftLaneText = 'Textures/lfloor.jpg';
    MiddleLaneText = null;
    RightLaneText = null;
    CeilingTexture = 'Textures/lava.jpg';}

else if(localStorage.getItem("level") == 17){

    objArray[24][2] = 1;
    objArray[24][0] = 1;
    //objArray[45][2] = 1;
    objArray[54][0] = 2;
    objArray[54][1] = 2;
    objArray[95][0] = 1;
    objArray[125][0] = 1;
    objArray[125][2] = 2;
    objArray[150][1] = 1;
    //objArray[162][1] = 1;
    objArray[185][1] = 2;
    objArray[185][2] = 2;
    objArray[209][1] = 1;
    //objArray[225][1] = 1;
    objArray[252][1] = 1;
    objArray[285][2] = 2;
    objArray[285][1] = 2;
    objArray[305][2] = 1;
    objArray[335][0] = 1;
    objArray[355][0] = 2;
    objArray[355][2] = 2;
    objArray[385][1] = 1;
    //objArray[400][1] = 1;
    objArray[415][1] = 1;
    objArray[415][0] = 2;

    LeftLaneText = 'Textures/hyper.jpg';
    MiddleLaneText = null;
    RightLaneText = null;
    CeilingTexture = 'Textures/space.jpg';}

else if(localStorage.getItem("level") == 18){

    objArray[24][0] = 2;
    objArray[24][1] = 2;
    //objArray[45][2] = 1;
    objArray[54][1] = 1;
    objArray[54][2] = 1;
    objArray[95][0] = 2;
    objArray[125][2] = 1;
    objArray[125][0] = 2;
    objArray[150][1] = 2;
    //objArray[162][1] = 1;
    objArray[185][0] = 2;
    objArray[185][1] = 2;
    objArray[209][1] = 1;
    //objArray[225][1] = 1;
    objArray[252][2] = 2;
    objArray[285][1] = 1;
    objArray[285][2] = 2;
    objArray[305][0] = 1;
    objArray[335][1] = 2;
    objArray[355][2] = 1;
    objArray[355][0] = 2;
    objArray[385][1] = 1;
    //objArray[400][1] = 1;
    objArray[415][0] = 2;
    objArray[415][1] = 2;

    LeftLaneText = 'Textures/hyper.jpg';
    MiddleLaneText = null;
    RightLaneText = null;
    CeilingTexture = 'Textures/space.jpg';}

else if(localStorage.getItem("level") == 19){

    objArray[24][0] = 2;
    objArray[24][2] = 1;
    //objArray[45][2] = 1;
    objArray[54][2] = 1;
    objArray[54][1] = 2;
    objArray[95][1] = 2;
    objArray[125][2] = 1;
    objArray[125][1] = 2;
    objArray[150][0] = 1;
    //objArray[162][1] = 1;
    objArray[185][0] = 1;
    objArray[185][2] = 2;
    objArray[209][0] = 2;
    objArray[209][2] = 1;
    //objArray[225][1] = 1;
    objArray[252][1] = 1;
    objArray[285][1] = 1;
    objArray[285][2] = 2;
    objArray[305][0] = 1;
    objArray[335][2] = 2;
    objArray[355][2] = 1;
    objArray[355][0] = 2;
    objArray[385][1] = 1;
    objArray[385][2] = 2;
    //objArray[400][1] = 1;
    objArray[415][0] = 1;
    objArray[415][1] = 2;

    LeftLaneText = 'Textures/hyper.jpg';
    MiddleLaneText = null;
    RightLaneText = null;
    CeilingTexture = 'Textures/space.jpg';}

else if(localStorage.getItem("level") == 20){

    objArray[24][1] = 2;
    objArray[24][2] = 2;
    //objArray[45][2] = 1;
    objArray[54][1] = 2;
    objArray[54][2] = 2;
    objArray[95][0] = 2;
    objArray[125][0] = 2;
    objArray[125][1] = 2;
    objArray[150][2] = 2;
    //objArray[162][1] = 1;
    objArray[185][2] = 2;
    objArray[185][0] = 2;
    objArray[209][1] = 2;
    objArray[209][2] = 2;
    //objArray[225][1] = 1;
    objArray[252][0] = 2;
    objArray[285][1] = 2;
    objArray[285][2] = 2;
    objArray[305][2] = 2;
    objArray[335][1] = 2;
    objArray[355][2] = 2;
    objArray[355][0] = 2;
    objArray[385][1] = 2;
    objArray[385][2] = 2;
    //objArray[400][1] = 1;
    objArray[415][0] = 2;
    objArray[415][1] = 2;
    objArray[435][1] = 1;

    LeftLaneText = 'Textures/hyper.jpg';
    MiddleLaneText = null;
    RightLaneText = null;
    CeilingTexture = 'Textures/space.jpg';}

else {
    localStorage.setItem("level", 1);

    window.open("./index.html", "_self");

    objArray[24][2] = 1;
    //objArray[45][2] = 1;
    objArray[95][0] = 1;
    objArray[110][0] = 1;
    //objArray[135][1] = 1;
    objArray[160][1] = 1;
    objArray[225][1] = 1;
    objArray[250][1] = 1;
    objArray[275][2] = 1;
    //objArray[300][2] = 1;
    objArray[315][0] = 1;
    //objArray[330][0] = 1;
    objArray[385][1] = 1;
    objArray[430][1] = 1;

    LeftLaneText = 'Textures/blue.jpg';
    MiddleLaneText = 'Textures/green.jpg';
    RightLaneText = 'Textures/red.jpg';
    CeilingTexture = 'Textures/cathroof.jpg';
}

/**
 * This function creates the tubes that the camera will follow along. The three parameters are the textures that will
 * be placed on each one. If only texture2 is passed in with texture and texture3 being null, then only  the first
 * texture is used for all.
 * @param texture2 {String} If other values are null, this textures all tubes. The texture for the leftlane (since LanePos of 2 is leftlane) Must be a file location of .JPG or .BMP
 * @param texture {String} This value may be null if only texturing with one texture. The texture for the middle (since LanePos of 0 is middlelane) Must be a file location of .JPG or .BMP
 * @param texture3 {String} This value may be null if only texturing with one texture. The texture for the rightlane (since LanePos of 1 is rightlane) Must be a file location of .JPG or .BMP
 */
function addTube(texture2, texture, texture3) {
    var segments = 100;
    var radiusSegments = 3;

    MiddleTube = new THREE.TubeGeometry(MiddleSpline, segments, 2, radiusSegments, false);
    LeftTube = new THREE.TubeGeometry(LeftSpline, segments, 2, radiusSegments, false);
    RightTube = new THREE.TubeGeometry(RightSpline, segments, 2, radiusSegments, false);

    if(texture == null && texture3 == null){
        addGeometry(MiddleTube, texture2);

        addGeometry(LeftTube, texture2);

        addGeometry(RightTube, texture2);
    }
    else{
        addGeometry(MiddleTube, texture);

        addGeometry(LeftTube, texture2);

        addGeometry(RightTube, texture3);
    }


    setScale();
}

/**
 * Scale all splines to same size
 */
function setScale() {
    MiddleLaneMesh.scale.set( scale, scale, scale );
    LeftLaneMesh.scale.set( scale, scale, scale );
    RightLaneMesh.scale.set(scale, scale, scale);
}
/**
 * This function takes in a THREE.JS object along with a texture and places that texture on the object. This is used
 * exclusively for the splines that the camera will follow
 * @param geometry {THREE.TubeGeometry} This is the THREE.JS object which will be textured
 * @param texture {String} The texture for the specific geometry Must be a file location of .JPG or .BMP
 */
function addGeometry( geometry, texture) {
    // Add the textures to the THREE.JS geometry
    if(!MiddleLaneMesh){
        MiddleLaneMesh = THREE.SceneUtils.createMultiMaterialObject( geometry, [
            new THREE.MeshBasicMaterial({
                map: THREE.ImageUtils.loadTexture(texture)
            })]);
        Middleparent.add( MiddleLaneMesh );
    } else if(!LeftLaneMesh) {
        LeftLaneMesh = THREE.SceneUtils.createMultiMaterialObject( geometry, [
            new THREE.MeshBasicMaterial({
                map: THREE.ImageUtils.loadTexture(texture)
            })]);
        Leftparent.add( LeftLaneMesh );
    } else {
        RightLaneMesh = THREE.SceneUtils.createMultiMaterialObject( geometry, [
            new THREE.MeshBasicMaterial({
                map: THREE.ImageUtils.loadTexture(texture)
            })]);
        Rightparent.add( RightLaneMesh );
    }
}
/**
 * Pull the level from localStorage
 * @type {num}
 */
lv_num = localStorage.getItem("level");

//Start the game
init();
animate();
animation = true;

/**
 * This function setups all the THREE.JS for the page. This function adds the container to place the objects in. It also
 * initializes the scene and adds lighting, camera and all the game objects to the scene. It also adds all the
 * listeners to the webpage
 */
function init() {
    //Initialize and add the container
    container = document.createElement('div');
    document.body.appendChild(container);
    //Create the camera and give it a position
    camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.01, 1000);
    camera.position.set(0, 50, 500);
    //Initalize the scene
    scene = new THREE.Scene();
    //Create and add lighting to the scene
    var light = new THREE.DirectionalLight( 0xffffff );
    light.position.set( 0, 0, 1 );
    scene.add( light );

    var light2 = new THREE.DirectionalLight(0xffffff) ;
    light2.position.set(0, 1, 0);
    scene.add(light2);
    //Initialize all the spline parents and add those to the scene
    Middleparent = new THREE.Object3D();
    scene.add( Middleparent );

    Leftparent = new THREE.Object3D();
    scene.add( Leftparent );

    Rightparent = new THREE.Object3D();
    scene.add( Rightparent );

    //Creating the finish line box, texturing, positioning it at the end and then adding it the scene
    var Finishcubegeometry = new THREE.BoxGeometry( 20,2, 15 );
    var Finishcubematerial = new THREE.MeshBasicMaterial({
        map: THREE.ImageUtils.loadTexture('Textures/finish-line.jpg')
    });
    var Finishcube = new THREE.Mesh( Finishcubegeometry, Finishcubematerial );
    Finishcube.position.x = -13;
    Finishcube.position.y = finishVertex.y + 2185;
    Finishcube.position.z = finishVertex.z + 2185;
    Finishcube.rotation.x += Math.PI/4;
    Finishcube.rotation.y -= Math.PI/2;
    Finishcube.scale.set(scale, scale, scale);
    scene.add( Finishcube );
    //Creating, texturing and adding the the tunnel to the scene
    var TunnelGeometry = new THREE.TubeGeometry(PipePath, 256, 12, 6, false);
    var TunnelMaterials = [
        new THREE.MeshLambertMaterial({
            map: THREE.ImageUtils.loadTexture(CeilingTexture),
            side:THREE.DoubleSide
        })
    ];
    //Pass in new THREE.MeshFaceMaterial(tunnelmaterials)) instead of just TunnelMaterial
    var TunnelMesh = new THREE.Mesh( TunnelGeometry, new THREE.MeshFaceMaterial(TunnelMaterials));
    TunnelMesh.scale.set( scale, scale, scale );
    scene.add(TunnelMesh);

    //Add texturing to each lane
    addTube(LeftLaneText, MiddleLaneText, RightLaneText);
    //Generate the objects to be added to the scene
    makeCoinsObstacles();
    //Initialize the camera that follows the splines
    splineCamera = new THREE.PerspectiveCamera( 84, window.innerWidth / window.innerHeight, 0.01, 1000 );
    //Add the spline camera to the middle parent b/c the game starts in the middle lane
    Middleparent.add( splineCamera );
    //Final rendering and effects to the scene
    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setClearColor( 0xf0f0f0 );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    container.appendChild( renderer.domElement );

    /**
     * Function called when window is resized, makes sure divs are in right place
     */
    var callback = function(){
        SpeedDIV.style.top = window.innerHeight*.01 + 'px';
        SpeedDIV.style.left = window.innerWidth*.8 + 'px';

        ScoreDIV.style.top = window.innerHeight*.01 + 'px';
        ScoreDIV.style.left = window.innerWidth*.075 + 'px';

        LivesDIV.style.top = window.innerHeight*.01 + 'px';
        LivesDIV.style.left = window.innerWidth*.8 + 'px';

        TimerDIV.style.top = window.innerHeight*.01 + 'px';
        TimerDIV.style.left = window.innerWidth*.075 + 'px';
    };
    //Add window resize listener
    window.addEventListener('resize', callback, false);
    //Add on keypress to document
    document.onkeydown = checkKeyChangeLane;
    //Javascript for resizing THREE.JS objects
    THREEx.WindowResize(renderer, camera);
}
/**
 * Dictionary to keep track of keys being currently pressed.
 * @type {Dictionary}
 */
var keys = {};
//JQuery to constantly check when key is pressed and not pressed and to add or remove from Keys array
$(document).keydown(function (e) {
    keys[e.which] = true;
    checkKey();
});
$(document).keyup(function (e) {
    delete keys[e.which];
    checkKey();
});

/**
 * Keypress logic for lane change, pausing and exiting/continuing game.
 * @param e {event} Keypress event to determine what key was pressed and held
 */
function checkKeyChangeLane(e){
    //Left arrow - move left 1 lane
    if (e.keyCode == '37') {
        //Make sure player cannot change lanes if the game is paused or ended.
        if(!paused && !levelfinish){
            //Depending on lane position, switch to proper lane
            if (CameraLane == 1) {
                pos = LeftTube.parameters.path.getPointAt(t);
                CameraLane = 0;
                var LaneSound = new Audio("Audio/leftlane.wav");
                LaneSound.play();
            } else if (CameraLane == 2) {
                pos = MiddleTube.parameters.path.getPointAt(t);
                CameraLane = 1;
                var LaneSound = new Audio("Audio/centerlane.wav");
                LaneSound.play();
            }
        }
    }
    // Right arrow - move right 1 lane
    else if (e.keyCode == '39') {
        //Make sure player cannot change lanes if the game is paused or ended.
        if(!paused && !levelfinish){
            //Depending on lane position, switch to proper lane
            if (CameraLane == 1) {
                pos = RightTube.parameters.path.getPointAt(t);
                CameraLane = 2;
                var LaneSound = new Audio("Audio/rightlane.wav");
                LaneSound.play();
            } else if (CameraLane == 0) {
                pos = MiddleTube.parameters.path.getPointAt(t);
                CameraLane = 1;
                var LaneSound = new Audio("Audio/centerlane.wav");
                LaneSound.play();
            }
        }
    }
    // ESC - pause
    else if (e.keyCode == '27') {
        //If game is not paused, then pause all animation and sound
        if (!paused) {
            //Stop animation
            cancelAnimationFrame(id);
            //Add div to screen
            document.body.appendChild(PauseDIV);
            //Audio instructions
            Topaused = new Audio("Audio/pause.wav");
            Topaused.play();
            //Set variables
            paused = true;
            restart = true;
            exit = true;
            //Silence coins
            coin1.volume = 0;
            coin2.volume = 0;
            coin3.volume = 0;
            obstacle1.volume = 0;
            obstacle2.volume = 0;
            obstacle3.volume = 0;
        }
        //If game is paused, then end game.
        else {
            localStorage.setItem("level", 1);
            window.open("./index.html", "_self");
        }
    }
    // SPACE - Resume only if currently paused
    else if (paused == true && e.keyCode == '32') {
        //End audio instructions and remove divs
        Topaused.pause();
        Topaused.currentTime = 0;
        document.body.removeChild(PauseDIV);
        //Reset variables
        paused = false;
        restart = false;
        exit = false;
        //Restart sounds
        coin1.volume = .5;
        coin2.volume = .5;
        coin3.volume = .5;
        //Restart animation
        animate();
    }
    //SPACE - Load next level
    else if(e.keyCode == '32'){
        //Check if game is done, if so then load next level.
        if(levelfinish){
            location.reload();
        }
    }
}
/**
 * Var for paused audio
 * @type {Audio}
 */
var Topaused;
/**
 * Function to check changing speed. Needed b/c JS does not allow multiple keypress logic so increasing speed and lane change are different logic.
 */
function checkKey() {
    prevSpeed = (speed * 100000);

    //Run through the array of currently pressed keys
    for (var i in keys) {
        //If there are no keys pressed, then skip for loop
        if (!keys.hasOwnProperty(i)) continue;

        //Up arrow - increase speed
        if (i == '38') {
            //If the game is not puased or done, increase the speed
            if (!paused && !levelfinish) {
                if (speed < .00075) {
                    speed = speed + .000001;
                }
            }
            //Slow down speed up function b/c the call is made repeatedly when held down.
            setTimeout(function () {checkKey();}, 1000);
        }
        //Down arrow - slow down
        else if (i == '40') {
            //If the game is not paused or done, decrease the speed
            if (!paused && !levelfinish) {
                if (speed > minSpeed + 0.00005 && timetoWait == 0) {
                    speed = speed - .0000009;
                } else if (speed <= minSpeed + 0.00005 && speed > minSpeed) {
                    speed = minSpeed;
                }
            }
            //Slow down speed up function b/c the call is made repeatedly when held down.
            setTimeout(function() { checkKey(); }, 1000);

        }
        //Find new speed after speed incrementing
        checkSpeed = 100000 * speed;
        //Speak speed if player hits certain speeds
        if (i == '40' || i == '38') {
            if (checkSpeed > 10 && prevSpeed < 10) {
                meSpeak.speak(parseInt(checkSpeed).toString());
            } else if (checkSpeed > 25 && prevSpeed < 25) {
                meSpeak.speak(parseInt(checkSpeed).toString());
            } else if (checkSpeed > 50 && prevSpeed < 50) {
                meSpeak.speak(parseInt(checkSpeed).toString());
            } else if (checkSpeed > 75 && prevSpeed < 75) {
                meSpeak.speak(parseInt(checkSpeed).toString());
            }
        }
    }
}

/**
 * Global Var to check if player has finished level and can move on
 * @type {boolean}
 */
var levelfinish = false;

/**
 * Animate the scene
 */
function animate() {
    id = requestAnimationFrame( animate );
    render();
}
/**
 * Coin collection logic
 */
function collectCoin(){
    Score = Score + 4000*t;
    var temp = new Audio("Audio/smw_coin.wav");
    temp.play();
    objArray[Math.floor(splineCamera.position.y/width)][CameraLane]=0;
}
/**
 * Obstacle collision logic
 */
function hitObstacle(){
    var temp = new Audio("Audio/hitobstacle.wav");
    temp.play();
    objArray[Math.floor(splineCamera.position.y/width)][CameraLane]=0;
    speed = 0;
    lives--;

    timetoWait = 200;
}

/**
 * Create audio for coin in lane 1
 * @type {Audio}
 */
var coin1 = new Audio("Audio/coin3.wav");

/**
 * Create audio for coin in lane 2
 * @type {Audio}
 */
var coin2 = new Audio("Audio/coin2.wav");

/**
 * Create audio for coin in lane 3
 * @type {Audio}
 */
var coin3 = new Audio("Audio/coin1.wav");

/**
 * Create audio for obstacles in lane 1
 * @type {Audio}
 */
var obstacle1 = new Audio("Audio/obstacle3.wav");

/**
 * Create audio for obstacles in lane 2
 * @type {Audio}
 */
var obstacle2 = new Audio("Audio/obstacle2.wav");
obstacle2.defaultPlaybackRate = obstacle2.defaultPlaybackRate = 2;

/**
 * Create audio for obstacles in lane 3
 * @type {Audio}
 */
var obstacle3 = new Audio("Audio/obstacle1.wav");

//Check if first time running through render
var firsttime = true;

/**
 * Audio values for coin1 object. Audio cannot be incremented so var must be incremented and then set
 * @type {number}
 */
var c1 = 0;
/**
 * Audio values for coin2 object. Audio cannot be incremented so var must be incremented and then set
 * @type {number}
 */
var c2 = 0;
/**
 * Audio values for coin3 object. Audio cannot be incremented so var must be incremented and then set
 * @type {number}
 */
var c3 = 0;
/**
 * Audio values for obstacle1 object. Audio cannot be incremented so var must be incremented and then set
 * @type {number}
 */
var o1 = 0;
/**
 * Audio values for obstacle2 object. Audio cannot be incremented so var must be incremented and then set
 * @type {number}
 */
var o2 = 0;
/**
 * Audio values for obstacle3 object. Audio cannot be incremented so var must be incremented and then set
 * @type {number}
 */
var o3 = 0;

/**
 * This function is what updates the scene so that the image looks like it's moving. This function is repeatedly called
 * and updates camera position, view and when the level is done.
 */
function render() {
    //Incrementing audio sounds as player gets closer.
    c1+=.01;
    c2+=.01;
    c3+=.01;
    o1+=.01;
    o2+=.01;
    o3+=.01;

    //Get the time.
    if(firsttime){
        start = new Date().getTime();
        firsttime = false;
    }
    //Speed of player
    t = t + speed;
    //Obstacle collision logic. First is if player hits object and still ahs > 0 lives
    if(timetoWait == 70 && lives>0){
        if(lives==1){
            meSpeak.speak(lives.toString() + ' life remaining');
        }else if(lives==0) {
            var temp = new Audio("Audio/death.wav");
            temp.play();
        }else{
            meSpeak.speak(lives.toString() + ' lives remaining');
        }
    }//If player runs out of lives, game ends.
    else if(timetoWait == 130 && lives==0){
        var temp = new Audio("Audio/death.wav");
        temp.play();
    }
    //Incremental speed up after collision.
    if(timetoWait>0){
        timetoWait--;
        speed = 0;
    }else{
        if(lives==0){
            window.location = './index.html';
        }
        else if(speed < minSpeed){
            speed = speed + .000001;
        }
    }
    //Update texts
    SpeedDIV.innerHTML = parseFloat(speed * 100000).toFixed(1) + " mph";
    LivesDIV.innerHTML = "Lives: " + parseInt(lives);
    ScoreDIV.innerHTML = "Score: " + parseInt(Score);
    TimerDIV.innerHTML = "Timer: " + parseFloat((new Date().getTime() - start)/1000);

    //If player switched lanes, get the camera position to properly display that
    if(CameraLane == 1){
        pos = MiddleTube.parameters.path.getPointAt( t );
    } else if(CameraLane == 0){
        pos = LeftTube.parameters.path.getPointAt( t );
    } else if(CameraLane == 2){
        pos = RightTube.parameters.path.getPointAt( t );
    }
    //Current location of player on level
    tempP = Math.floor(splineCamera.position.y/width);
    //Create audio 19 spaces in from of players current location
    if(tempP + 19 < divisions){
        if (objArray[tempP + 19][0] == 1) {
            coin1.currentTime = 0;
            coin1.volume = 0.5;
            coin1.loop = true;
            coin1.play();
        }
        if (objArray[tempP + 19][1] == 1) {
            coin2.currentTime = 0;
            coin2.volume = 0.5;
            coin2.loop = true;
            coin2.play();
        }
        if (objArray[tempP + 19][2] == 1) {
            coin3.currentTime = 0;
            coin3.volume = 0.5;
            coin3.loop = true;
            coin3.play();
        }
        if (objArray[tempP + 19][0] == 2) {
            obstacle1.currentTime = 0;
            obstacle1.loop = true;
            obstacle1.play();
            obstacle1.volume = 0.5;
        }
        if (objArray[tempP + 19][1] == 2) {
            obstacle2.currentTime = 0;
            obstacle2.loop = true;
            obstacle2.play();
            obstacle2.volume = 0.5;
        }
        if (objArray[tempP + 19][2] == 2) {
            obstacle3.currentTime = 0;
            obstacle3.loop = true;
            obstacle3.play();
            obstacle3.volume = 0.5;
        }
    }


    //Increase the audio as player gets close to coin/obstacle
    if(coin1 != null && c1 <=1){
        coin1.volume = c1;
    }
    if(coin2 != null&& c2 <=1){
        coin2.volume = c2;
    }
    if(coin3 != null&& c3 <=1){
        coin3.volume = c3;
    }
    if(obstacle1 != null&& o1 <=1){
        obstacle1.volume = o1;
    }
    if(obstacle2 != null && o2 <=1){
        obstacle2.volume = o2;
    }
    if(obstacle3 != null && o3 <=1){
        obstacle3.volume = o3;
    }


    //Once player passes by/through coin location, pause the audio.
    if (objArray[tempP][0] == 1) {
        coin1.pause();
    }
    if (objArray[tempP][1] == 1) {
        coin2.pause();
    }
    if (objArray[tempP][2] == 1) {
        coin3.pause();
    }
    if (objArray[tempP][0] == 2) {
        obstacle1.volume = 0.0;
    }
    if (objArray[tempP][1] == 2) {
        obstacle2.pause();
    }
    if (objArray[tempP][2] == 2) {
        obstacle3.pause();
    }

    //Collision logic
    if(objArray[Math.floor(splineCamera.position.y/width)][CameraLane]==1){
        collectCoin();
    }else if(objArray[Math.floor(splineCamera.position.y/width)][CameraLane]==2){
        hitObstacle();
    }
    //Scale position to fit object scale
    pos.multiplyScalar( scale );

    // interpolation
    var segments = MiddleTube.tangents.length;
    var pickt = t * segments;
    var pick = Math.floor( pickt );
    var pickNext = ( pick + 1 ) % segments;

    binormal.subVectors( MiddleTube.binormals[ pickNext ], MiddleTube.binormals[ pick ] );
    binormal.multiplyScalar( pickt - pick ).add( MiddleTube.binormals[ pick ] );

    var dir = MiddleTube.parameters.path.getTangentAt( t );

    var offset = 15;

    normal.copy( binormal ).cross( dir );

    //We move on a offset on its binormal
    pos.add( normal.clone().multiplyScalar( offset ) );

    splineCamera.position.copy( pos );

    //Using arclength for stablization in look ahead.
    var lookAt = MiddleTube.parameters.path.getPointAt( ( t + 30 / MiddleTube.parameters.path.getLength() ) % 1 ).multiplyScalar( scale );

    splineCamera.matrix.lookAt(splineCamera.position, lookAt, normal);
    splineCamera.rotation.setFromRotationMatrix( splineCamera.matrix, splineCamera.rotation.order );

    Middleparent.rotation.y += ( Middleparent.rotation.y ) * 0.05;

    //End of level reached
    if(pickNext == 99){
        //Stop animation
        cancelAnimationFrame( id );

        //Start end of level logic.
        levelfinish = true;
        Score = Score + 100000/(new Date().getTime() - start);
        //Check if all levels are completed
        if(localStorage.getItem("level") == 20){
            if(localStorage.getItem("FinalScore") < Score){
                localStorage.setItem("FinalScore", Score);
            }
            localStorage.setItem("highScore", 0);
        }
        //If not end of all levels, pass values to load next level
        lv_num++;
        localStorage.setItem("level", lv_num);
        localStorage.setItem("highScore", Score);
        localStorage.setItem("lives", lives);
        ScoreDIV.innerHTML = "Score: " + parseInt(Score);
        //End of level audio
        var Finish = new Audio("Audio/levelend.wav");
        Finish.play();
        //Read score out
        setTimeout(setTimeout(function(){
            meSpeak.speak(parseInt(Score).toString());
        }, 3500));
        //Instructions for going to next level
        setTimeout(setTimeout(function(){
            var Next = new Audio("Audio/startnext.wav");
            Next.play();
        }, 7000));
        //Load text of level ended
        var Success = document.createElement('div');
        Success.style.position = 'absolute';
        Success.style.width = 500;
        Success.style.height = 100;
        Success.innerHTML = "Level Success!";
        Success.style.top = window.innerHeight*.4 + 'px';
        Success.style.left = window.innerWidth*.4 + 'px';
        Success.style.color = "yellow";
        Success.style.fontSize = 80 + 'px';
        document.body.appendChild(Success);
        //Load text of score
        var FinalScore = document.createElement('div');
        FinalScore.style.position = 'absolute';
        FinalScore.style.width = 500;
        FinalScore.style.height = 100;
        FinalScore.innerHTML = "Score: " + parseInt(Score);
        FinalScore.style.top = window.innerHeight*.5 + 'px';
        FinalScore.style.left = window.innerWidth*.4 + 'px';
        FinalScore.style.color = "red";
        FinalScore.style.fontSize = 80 + 'px';
        document.body.appendChild(FinalScore);
    }
    //Reload frame to make moving animatin
    renderer.render( scene, animation === true ? splineCamera : splineCamera );
}