QUnit.test( "Level Selection",function(assert){
    var doc = $(document);
    assert.equal(lv_num, 1, "Initial level == 1");
    doc.trigger( $.Event( "keydown", { keyCode: 38 } ) );
    assert.equal( lv_num, 2, "Up arrow changes level to 2" );
    doc.trigger( $.Event( "keydown", { keyCode: 38 } ) );
    assert.equal( lv_num, 3, "Up arrow changes level to 3" );
    doc.trigger( $.Event( "keydown", { keyCode: 40 } ) );
    assert.equal( lv_num, 2, "Down arrow changes level to 2" );
    doc.trigger( $.Event( "keydown", { keyCode: 40 } ) );
    assert.equal( lv_num, 1, "Down arrow changes level to 1" );
    doc.trigger( $.Event( "keydown", { keyCode: 40 } ) );
    assert.equal( lv_num, 20, "Down arrow changes level to 20" );
});