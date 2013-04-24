/* 
 * News module script
 */


(function(news, undefined) {

    news.onLoad = function() {
        // Anything you want to run onLoad
        // When all page resources (styles, scripts, markup, etc) are finished loading this is called. 
        init_rotator();
        loadNewsFeed();
        resizeNewsFeed();
    };

    news.onBeforeLeave = function() {
        // Anything you want to run onBeforeLeave
        // Before Leave = Before going from this module to another module this is called.
        
        // console.log("Thank you for letting me know that you're leaving the news app.");
        clearInterval(rotatorId);
    };

    news.onResize = function() {
        // Anything you want to run onResize
        // Event is called on every pixel sized resize movement. 
        // High accuracy / low latency; low performance (CPU intensive because possibly many, many events are called).

    };

    news.onSmartResize = function() {
        // Anything you want to run onSmartResize
        // Smart resize will not execute on every pixel increment of the resize action.
        // Low accuracy / High latency; High performance (Not CPU intensive because there are less events called).
        stopScroll();
        resizeNewsFeed();
    };
    
    news.onOrientationChange = function() {
        // Anything you want to run onOrientationchange
        stopScroll();
        resizeNewsFeed();
    };

})(window.news = window.news || {});  