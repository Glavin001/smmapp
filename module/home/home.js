/* 
 * Home module script
 */


(function(home, undefined) {

    var resize = function() {
        console.log("Resize Home");
        $.each($(".home-grid img"), function(i, e) {
            $(e).css('height', $(e).css('width'));
        });
    };

    socket.on('response smads', function(smads) {
      console.log('On : response smads');
      
      console.log(JSON.stringify(smads, null, 2));
    });

    home.onLoad = function() {
        // Anything you want to run onLoad
        // When all page resources (styles, scripts, markup, etc) are finished loading this is called. 
        
       socket.emit('request smads'); 
    };

    home.onBeforeLeave = function() {
        // Anything you want to run onBeforeLeave
        // Before Leave = Before going from this module to another module this is called.

    };

    home.onResize = function() {
        // Anything you want to run onResize
        // Event is called on every pixel sized resize movement. 
        // High accuracy / low latency; low performance (CPU intensive because possibly many, many events are called).
    };

    home.onSmartResize = function() {
        // Anything you want to run onSmartResize
        // Smart resize will not execute on every pixel increment of the resize action.
        // Low accuracy / High latency; High performance (Not CPU intensive because there are less events called).
        resize();
    };

    home.onOrientationChange = function() {
        // Anything you want to run onOrientationchange
        resize();
    };

})(window.home = window.home || {});      