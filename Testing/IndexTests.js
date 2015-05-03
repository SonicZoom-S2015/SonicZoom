QUnit.test( "Main Menu - arrow between the options",function(assert){
    var doc = $(document);
    assert.ok(arrowDir == 0, "Initial arrowDir == 0");
    doc.trigger( $.Event( "keydown", { keyCode: 38 } ) );
    assert.equal( arrowDir, 3, "Up arrow changes arrowDir to 3" );
    doc.trigger( $.Event( "keydown", { keyCode: 38 } ) );
    assert.equal( arrowDir, 2, "Up arrow changes arrowDir to 2" );
    doc.trigger( $.Event( "keydown", { keyCode: 38 } ) );
    assert.equal( arrowDir, 1, "Up arrow changes arrowDir to 1" );
    doc.trigger( $.Event( "keydown", { keyCode: 38 } ) );
    assert.equal( arrowDir, 0, "Up arrow changes arrowDir to 0" );
    doc.trigger( $.Event( "keydown", { keyCode: 40 } ) );
    assert.equal( arrowDir, 1, "Down arrow changes arrowDir to 1" );
    doc.trigger( $.Event( "keydown", { keyCode: 40 } ) );
    assert.equal( arrowDir, 2, "Down arrow changes arrowDir to 2" );
    doc.trigger( $.Event( "keydown", { keyCode: 40 } ) );
    assert.equal( arrowDir, 3, "Down arrow changes arrowDir to 3" );
    doc.trigger( $.Event( "keydown", { keyCode: 40 } ) );
    assert.equal( arrowDir, 0, "Down arrow changes arrowDir to 0" );

});