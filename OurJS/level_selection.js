meSpeak.loadConfig("JSON/mespeak_config.json");
meSpeak.loadVoice("JSON/en.json");
meSpeak.speak('Level One')
/**
 * Initialize the scene
 * @type {THREE.Scene}
 */
var scene = new THREE.Scene();
/**
 * Initialize the camera
 * @type {THREE.PerspectiveCamera}
 */
var camera = new THREE.PerspectiveCamera(120, window.innerWidth/window.innerHeight, 0.1, 1000 );
/**
 * Initalize the Render
 * @type {THREE.WebGLRenderer}
 */
var renderer = new THREE.WebGLRenderer();
//Set the size of the render and add it to the HTML Doc
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );
/**
 * Create an HTML h2 tag to place values in
 * @type {Element}
 */
var text = document.createElement('h2');
//Set text of HTML h2 tag and add it to the doc
text.innerHTML = "Choose Level";
document.body.appendChild(text);
/**
 * Start with the level select value being 1
 * @type {number}
 */
var lv_num = 1;
/**
 * Create an HTML Button Element
 * @type {Element}
 */
var btn = document.createElement("BUTTON");
/**
 * Create var to pass in text to HTML element
 * @type {Text}
 */
var t = document.createTextNode(lv_num);
//Setting the attributes of the button and then appending it to the doc
btn.setAttribute("class", "lv_btn");
btn.setAttribute("id", "say_lv");
btn.appendChild(t);
document.body.appendChild(btn);
//Add keypress listener to the document
document.onkeydown = keyListener;

/**
 * Function which keeps track of keypress events. It only listens for up and down arrows as well as Space and ESC
 * @param e {Event} Keypress event
 */
function keyListener(e){
    var x = e.keyCode;
    // Up arrow: Increase level
    if (x == 38) {
        lv_num++;
        if (lv_num == 21) lv_num = 1;
        t.nodeValue = lv_num;
        btn.appendChild(t);
        document.body.appendChild(btn);
        var s = lv_num.toString();
        meSpeak.speak("Level"+s);
    }
    // Down arrow: Decrease level
    else if (x == 40){
        lv_num--;
        if (lv_num == 0) lv_num = 20;
        t.nodeValue = lv_num;
        btn.appendChild(t);
        document.body.appendChild(btn);
        var n = lv_num.toString();
        meSpeak.speak("Level"+n);
    }
    // Space: select level
    else if (x == 32){
        localStorage.setItem("level", lv_num);
        localStorage.setItem("lives", 3);
        localStorage.setItem("highScore", 0);
        window.open("./TheTemplateLevel.html", "_self");
    }
    // ESC key: Return to main menu
    else if (x  == 27) {
        window.open("./index.html", "_self");
    }
}
/**
 * Loading the texture that will be the background of the scene
 * @type {THREE.ImageUtils}
 */
var texture = THREE.ImageUtils.loadTexture( 'Textures/menu.jpg' );
/**
 * Creating the texture to put in the background of our THREE.JS scene
 * @type {THREE.Mesh}
 */
var backgroundMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(2, 2, 0),
    new THREE.MeshBasicMaterial({
        map: texture
    }));
/**
 * Creating the geometry for the cube object that will be used for the selector
 * @type {THREE.BoxGeometry}
 */
var geometry = new THREE.BoxGeometry( 1.5, 1.5, 1.5 );
/**
 * Loading the texture that will be the coin texture
 * @type {THREE.MeshBasicMaterial}
 */
var material = new THREE.MeshBasicMaterial(
    { map: THREE.ImageUtils.loadTexture( 'Textures/minetex.bmp' ) }
);
/**
 * Creating the cube object with proper geometry and texture
 * @type {THREE.Mesh}
 */
var cube = new THREE.Mesh( geometry, material );
//Move and add the cube to the scene
cube.position.y = -3;
scene.add( cube );
//Move the starting camera position
camera.position.z = 5;
//Remove depth from background
backgroundMesh.material.depthTest = false;
backgroundMesh.material.depthWrite = false;
/**
 * Create the scene for the THREE.JS objects to be placed
 * @type {THREE.Scene}
 */
var backgroundScene = new THREE.Scene();
/**
 * Create the camera that will be looking at the scene
 * @type {THREE.Camera}
 */
var backgroundCamera = new THREE.Camera();
//Adding the camera and background to the scene
backgroundScene.add(backgroundCamera );
backgroundScene.add(backgroundMesh );

//This function will animate the spinning cube on the webpage
var render = function () {
    //Update the scene
    requestAnimationFrame( render );
    //Rotate the cube
    cube.rotation.x += 0.1;
    cube.rotation.y += 0.1;
    //Setting up renderer
    renderer.autoClear = false;
    renderer.clear();
    renderer.render(backgroundScene, backgroundCamera);
    renderer.render(scene, camera);
};
render();
//Allow for the THREE.JS objects to be resized with window
THREEx.WindowResize(renderer, camera);