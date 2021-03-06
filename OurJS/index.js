    meSpeak.loadConfig("JSON/mespeak_config.json");
    meSpeak.loadVoice('JSON/en.json');
    /**
	 * To actually be able to display anything with Three.js, we need three things:
	 * A scene, a camera, and a renderer so we can render the scene with the camera.
	 */
	var scene = new THREE.Scene();
	/**
	 * PerspectiveCamera( fov, aspect, near, far )
	 * @param fov — Camera frustum vertical field of view.
	 * @param aspect — Camera frustum aspect ratio.
	 * @param near — Camera frustum near plane.
	 * @param far — Camera frustum far plane.
	 */	
    var camera = new THREE.PerspectiveCamera(120, window.innerWidth/window.innerHeight, 0.1, 1000 );

	// Initialize FinalScore which will keep the high score
    if(localStorage.getItem("FinalScore") == null){
        localStorage.setItem("FinalScore", 0);
    }
	
	// Initialize sounds
    var menuinstructions = new Audio("Audio/menuinstructions.wav");
    var soniczoom = new Audio("Audio/soniczoom.wav");
    var training = new Audio("Audio/training.wav");
    var play = new Audio("Audio/startgame.wav");
    var highscores = new Audio("Audio/highscores.wav");
	
    var renderer = new THREE.WebGLRenderer();
	/**
	 * Resizes the output canvas to (width, height), and also sets the viewport to fit that size, starting in (0, 0)
	 *
	 * .setSize ( width, height )
	 * @param width — Width of the output canvas.
	 * @param height — Height of the output canvas.
	 */
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( renderer.domElement );

	/**
	 * Div for displaying the text, 'Training'
	 * @type {Element}
	 */    
	var Training = document.createElement('div');
    Training.style.position = 'absolute';
    Training.style.width = 100;
    Training.style.height = 100;
    Training.innerHTML = "Training";
    Training.style.top = window.innerHeight*.36 + 'px';
    Training.style.left = window.innerWidth*.62 + 'px';
    Training.style.color = "Yellow";
    Training.style.fontSize = 50 + 'px';
    document.body.appendChild(Training);

	/**
	 * Div for displaying the text, 'Start Game'
	 * @type {Element}
	 */    
	var Start_Game = document.createElement('div');
    Start_Game.style.position = 'absolute';
    Start_Game.style.width = 500;
    Start_Game.style.height = 100;
    Start_Game.innerHTML = "Start Game";
    Start_Game.style.top = window.innerHeight*.46 + 'px';
    Start_Game.style.left = window.innerWidth*.62 + 'px';
    Start_Game.style.color = "Red";
    Start_Game.style.fontSize = 50 + 'px';
    document.body.appendChild(Start_Game);

	/**
	 * Div for displaying the text, 'High Scores'
	 * @type {Element}
	 */    
    var High_Score = document.createElement('div');
    High_Score.style.position = 'absolute';
    High_Score.style.width = 500;
    High_Score.style.height = 100;
    High_Score.innerHTML = "High Scores";
    High_Score.style.top = window.innerHeight*.56 + 'px';
    High_Score.style.left = window.innerWidth*.62 + 'px';
    High_Score.style.color = "Red";
    High_Score.style.fontSize = 50 + 'px';
    document.body.appendChild(High_Score);

 	/**
	 * Div for displaying the text, 'Restart High score'
	 * @type {Element}
	 */    
	var Restart = document.createElement('div');
    Restart.style.position = 'absolute';
    Restart.style.width = 400;
    Restart.style.height = 100;
    Restart.innerHTML = "Restart High Score";
    Restart.style.top = window.innerHeight*.66 + 'px';
    Restart.style.left = window.innerWidth*.62 + 'px';
    Restart.style.color = "Red";
    Restart.style.fontSize = 50 + 'px';
    document.body.appendChild(Restart);

	/**
	 * BoxGeometry(width, height, depth)
	 * @param width — Width of the sides on the X axis.
	 * @param height — Height of the sides on the Y axis.
	 * @param depth — Depth of the sides on the Z axis.
	 */
    var geometry = new THREE.BoxGeometry( 1, 1, 1 );
	/**
	 * MeshBasicMaterial( parameters )
	 * @param map — Sets the texture map. Default is null 
	 */
    var material = new THREE.MeshBasicMaterial({
        map: THREE.ImageUtils.loadTexture('Textures/cointex.bmp')
    });
	/**
	 * Mesh( geometry, material )
	 * @param geometry — An instance of Geometry.
	 * @param material — An instance of Material (optional). 
	 */
    var cube = new THREE.Mesh( geometry, material );
    scene.add( cube );

    // set camera position
	camera.position.z = 5;
	
	/**
	 * .loadTexture (url)
	 * @param url -- the url of the texture
	 */
    var texture = THREE.ImageUtils.loadTexture( 'Textures/menu.jpg' );
	
	/**
	 * Mesh( geometry, material )
	 * @param geometry - PlaneGeometry(width, height, widthSegments)
	 *				    @param width — Width along the X axis.
	 *				    @param height — Height along the Y axis.
	 *				    @param widthSegments — Optional. Default is 1. 
	 * @param material - MeshBasicMaterial( parameters )
	 *				    @param map — Sets the texture map. Default is null 
	 */
    var backgroundMesh = new THREE.Mesh(
            new THREE.PlaneGeometry(2, 2, 0),
            new THREE.MeshBasicMaterial({
                map: texture
            }));

    backgroundMesh.material.depthTest = false;
    backgroundMesh.material.depthWrite = false;

    // Create your background scene
    var backgroundScene = new THREE.Scene();
    var backgroundCamera = new THREE.Camera();
    backgroundScene.add(backgroundCamera );
    backgroundScene.add(backgroundMesh );

	/**
	 * .setViewOffset ( fullWidth, fullHeight, x, y, width, height )
	 * @param fullWidth — full width of multiview setup
	 * @param fullHeight — full height of multiview setup
	 * @param x — horizontal offset of subcamera
	 * @param y — vertical offset of subcamera
	 * @param width — width of subcamera
	 * @param height — height of subcamera
	 */
    camera.setViewOffset(window.innerWidth, window.innerHeight, window.innerWidth * -.06, window.innerHeight *.1, window.innerWidth, window.innerHeight);
    
	// Declare arrow direction as 0
	var arrowDir = 0;

	// call key listener whenever key is pressed 
    document.onkeydown = checkKey;

	// play "soniczoom.wav" located in Audio folder
    soniczoom.play();
    var currentrunning = menuinstructions;
	// play "menuinstructions.wav" located in Audio folder
    currentrunning.play();

	/**
	 * called when window is resized, and re-arrange the location of texts
	 *
	 * function()
	 * no parameter
	 */
    var callback = function(){
        Training.style.top = window.innerHeight*.36 + 'px';
        Training.style.left = window.innerWidth*.62 + 'px';

        Start_Game.style.top = window.innerHeight*.46 + 'px';
        Start_Game.style.left = window.innerWidth*.62 + 'px';

        High_Score.style.top = window.innerHeight*.56 + 'px';
        High_Score.style.left = window.innerWidth*.62 + 'px';

        Restart.style.top = window.innerHeight*.56 + 'px';
        Restart.style.left = window.innerWidth*.62 + 'px';
    };
	/**
	 * .addEventListener(event, function, useCapture);
	 * @param event - A String that specifies the name of the event.
	 * @param function - Specifies the function to run when the event occurs.
	 * @param useCapture - A Boolean value that specifies whether the event should be executed in the capturing or in the bubbling phase. 
	 */
    window.addEventListener('resize', callback, false);
	/**
	 * Update renderer and camera when the window is resized
	 * 
	 * .WindowResize(renderer, camera);
	 * @param renderer - The renderer to update
	 * @param camera - The camera to update
	 */    
	THREEx.WindowResize(renderer, camera);

	/**
	 * Called when a key has been pressed (pre-condition)
	 * 
	 * checkKey(e);
	  @param e - Event 
	 */
    function checkKey(e){
        if(e.keyCode == '38') {
			// pre-condition: Up Arrow key has been pressed 
            if (arrowDir == 0) {
                camera.setViewOffset(window.innerWidth, window.innerHeight, window.innerWidth * -.06, window.innerHeight * -.2, window.innerWidth, window.innerHeight);
                camera.updateProjectionMatrix();
                Training.style.color = "Red";
                Restart.style.color = "Yellow";
                arrowDir = 3;
                currentrunning.pause();
                currentrunning.currentTime = 0;

				/**
				 * Generate sound from text parameter 
				 *
				 * meSpeak.speak(text);
				 * @param text - The string of text to be spoken.
				 */
                meSpeak.speak("Restart high score");
            } else if (arrowDir == 1) {
                camera.setViewOffset(window.innerWidth, window.innerHeight, window.innerWidth * -.06, window.innerHeight * .1, window.innerWidth, window.innerHeight);
                camera.updateProjectionMatrix();
                Start_Game.style.color = "Red";
                Training.style.color = "Yellow";
                arrowDir = 0;
                currentrunning.pause();
                currentrunning.currentTime = 0;
                currentrunning = training;
                currentrunning.play();
            } else if (arrowDir == 2) {
                camera.setViewOffset(window.innerWidth, window.innerHeight, window.innerWidth * -.06, window.innerHeight * -.0001, window.innerWidth, window.innerHeight);
                camera.updateProjectionMatrix();
                High_Score.style.color = "Red";
                Start_Game.style.color = "Yellow";
                arrowDir = 1;
                currentrunning.pause();
                currentrunning.currentTime = 0;
                currentrunning = play;
                currentrunning.play();
            } else if (arrowDir == 3) {
                camera.setViewOffset(window.innerWidth, window.innerHeight, window.innerWidth * -.06, window.innerHeight * -.1, window.innerWidth, window.innerHeight);
                camera.updateProjectionMatrix();
                Restart.style.color = "Red";
                High_Score.style.color = "Yellow";
                arrowDir = 2;
                currentrunning.pause();
                meSpeak.stop();
                currentrunning.currentTime = 0;
                currentrunning = highscores;
                currentrunning.play();
            }
        }
        else if (e.keyCode == '40') {
			// pre-condition: Down Arrow key has been pressed 
			if (arrowDir == 0) {
                    camera.setViewOffset(window.innerWidth, window.innerHeight, window.innerWidth * -.06, window.innerHeight * -.0001, window.innerWidth, window.innerHeight);
                    camera.updateProjectionMatrix();
                    Training.style.color = "Red";
                    Start_Game.style.color = "Yellow";
                    arrowDir = 1;
                    currentrunning.pause();
                    currentrunning.currentTime = 0;
                    currentrunning = play;
                    currentrunning.play();
                } else if (arrowDir == 1) {
                    camera.setViewOffset(window.innerWidth, window.innerHeight, window.innerWidth * -.06, window.innerHeight * -.1, window.innerWidth, window.innerHeight);
                    camera.updateProjectionMatrix();
                    Start_Game.style.color = "Red";
                    High_Score.style.color = "Yellow";
                    arrowDir = 2;
                    currentrunning.pause();
                    currentrunning.currentTime = 0;
                    currentrunning = highscores;
                    currentrunning.play();
                } else if (arrowDir == 2) {
                    camera.setViewOffset(window.innerWidth, window.innerHeight, window.innerWidth * -.06, window.innerHeight * -.2, window.innerWidth, window.innerHeight);
                    camera.updateProjectionMatrix();
                    High_Score.style.color = "Red";
                    Restart.style.color = "Yellow";
                    arrowDir = 3;
                    currentrunning.pause();
                    currentrunning.currentTime = 0;
                    meSpeak.speak("Restart high score");
                } else if (arrowDir == 3) {
                    camera.setViewOffset(window.innerWidth, window.innerHeight, window.innerWidth * -.06, window.innerHeight * .1, window.innerWidth, window.innerHeight);
                    camera.updateProjectionMatrix();
                    Restart.style.color = "Red";
                    Training.style.color = "Yellow";
                    arrowDir = 0;
                    currentrunning.pause();
                    meSpeak.stop();
                    currentrunning.currentTime = 0;
                    currentrunning = training;
                    currentrunning.play();
                }
        } else if (e.keyCode == '32'){
            // pre-condition: Space Bar has been pressed 
            if(arrowDir == 0){
                window.open("./tutorial.html","_self");
            } else if (arrowDir == 1){
                window.open("./level_selection.html", "_self");
            }else if (arrowDir == 2) {
                var score = localStorage.getItem("FinalScore");
                var score = parseInt(score);
				// pre-condition: Player choose the high-score 
                if(score == 0){
                    meSpeak.speak(0);
                }else {
                    meSpeak.speak(score.toString());
                }
            } else if (arrowDir == 3){
                localStorage.setItem("FinalScore", 0);
            }
        }
    }

	/**
	 * called whenever it is necessary to re-render scene and camera
	 *
	 * function()
	 * no parameter
	 */
    var render = function () {
		// the browser that you wish to perform an animation and requests
		// that the browser call a specified function to update an animation before the next repaint.
        requestAnimationFrame( render );

        cube.rotation.x += 0.1;
        cube.rotation.y += 0.1;

        renderer.autoClear = false;
        renderer.clear();
        renderer.render(backgroundScene, backgroundCamera);
        renderer.render(scene, camera);
    };

    render();