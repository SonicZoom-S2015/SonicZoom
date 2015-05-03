QUnit.test("Template Level - initial variables",function(assert){
    var doc = $(document);
    doc.trigger( $.Event( "keydown", { keyCode: 27 } ) );
    assert.equal( paused, true, "paused==true after esc key pressed" );
    assert.ok( t<0.002, "Initial time < .002" );
    assert.equal( minSpeed,.00025, "min speed == .00025" );
    assert.ok( speed<.00002, "initial speed < .00002" );
    assert.equal( restart, true, "restart==true initially after pause" );
    assert.equal( exit, true, "exit == true initially after pause" );
    assert.equal( lives, 3, "3 lives initially" );
    assert.equal( Score, 0, "score == 0 initially" );
    assert.equal( timetoWait, 0, "timetoWait == 0 initially" );
    assert.equal( divisions, 450, "450 divisions of track" );
    assert.equal( width, 2950/(divisions-1), "width calculated correctly" );
    assert.equal( CameraLane, 1, "CameraLane==1 initially " );
    assert.equal( animation, true, "animation==true initially " );
    assert.equal( scale, 4, "scale==4 initially " );
    assert.equal( coin1.volume , 0, "coin1.volume==0 when paused " );
    assert.equal( coin2.volume , 0, "coin2.volume==0 when paused " );
    assert.equal( coin3.volume , 0, "coin3.volume==0 when paused " );
    assert.equal( obstacle1.volume , 0, "obstacle1.volume==0 when paused " );
    assert.equal( obstacle2.volume , 0, "obstacle2.volume==0 when paused " );
    assert.equal( obstacle3.volume , 0, "obstacle3.volume==0 when paused " );
});

QUnit.test("Template Level - initial HTML divs",function(assert){
    assert.equal( PauseDIV.innerHTML , "Paused", "'Paused' is displayed when game is paused" );
    assert.equal( SpeedDIV.innerHTML , parseFloat(speed * 100000).toFixed(1) + " mph", "correct speed is displayed" );
    assert.equal( ScoreDIV.innerHTML, "Score: " + parseInt(Score), "correct score is displayed" );
    assert.equal( LivesDIV.innerHTML, "Lives: " + lives, "correct number of lives is displayed" );
});

QUnit.test("Template Level - key presses",function(assert){
    var doc = $(document);
    doc.trigger( $.Event( "keydown", { keyCode: 32 } ) );
    assert.equal( paused, false, "paused==false after pressing space" );
    assert.equal( restart, false, "restart==false after resume" );
    assert.equal( exit, false, "exit==false after resume" );
    //Left, right arrows
    doc.trigger( $.Event( "keydown", { keyCode: 37 } ) );
    assert.equal( CameraLane, 0, "cameraLane==0 after moving left" );
    doc.trigger( $.Event( "keydown", { keyCode: 39 } ) );
    assert.equal( CameraLane, 1, "cameraLane==1 after moving right" );
    doc.trigger( $.Event( "keydown", { keyCode: 39 } ) );
    assert.equal( CameraLane, 2, "cameraLane==2 after moving right" );
    doc.trigger( $.Event( "keydown", { keyCode: 37 } ) );
    assert.equal( CameraLane, 1, "cameraLane==1 after moving left" );
    doc.trigger( $.Event( "keydown", { keyCode: 27 } ) );
});

QUnit.test("Template Level - collect coin and hit obstacle functions",function(assert){
    hitObstacle();
    assert.equal( lives, 2, "2 lives after hitting obstacle" );
    assert.equal( speed, 0, "speed==0 after hitting obstacle" );
    var tempScore = Score;
    var tempT = t;
    collectCoin();
    assert.ok( Score>=tempScore+4000*tempT, "score increase after collecting coin" );
});