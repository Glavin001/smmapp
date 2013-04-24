/* 
 * Map module script
 */


(function(map, undefined) {

    map.selectView = function(selection) {
        if (selection === "Map") {

            $('.map_view').animate({
                'left': 0
            });
            $('.locate_view').show().animate({
                'left': 0 * $('.all_map_views').width()
            });

        }
        else if (selection === "Locate") {

            $('.map_view').animate({
                'left': -1 * $('.all_map_views').width()
            });
            $('.locate_view').show().animate({
                'left': -1 * $('.all_map_views').width()
            });

        }

    };

    function init_map() {
        map = new OpenLayers.Map("basicMap");
        var mapnik = new OpenLayers.Layer.OSM();
        var fromProjection = new OpenLayers.Projection("EPSG:4326");   // Transform from WGS 1984
        var toProjection = new OpenLayers.Projection("EPSG:900913"); // to Spherical Mercator Projection
        var position = new OpenLayers.LonLat(13.41, 52.52).transform(fromProjection, toProjection);
        var zoom = 15;

        map.addLayer(mapnik);
        map.setCenter(position, zoom);
    }

    function resize() {
        var viewWidth = parseInt($(".all_map_views").css('width')); //parseInt($.mobile.activePage.css('width'));
        //var viewHeight = parseInt($.mobile.activePage.css('height'));
        var viewHeight = (window.innerHeight ? window.innerHeight : $(window).height())
                - $("div.smuToolsPanel [data-role='footer']").height()
                - ($.mobile.activePage).find("div.map_view_select").height()
                - ($.mobile.activePage).find("div[data-role='header']").height()
                - parseInt(($.mobile.activePage).find("div[data-role='content']").css('padding-top'))
                - parseInt(($.mobile.activePage).find("div[data-role='content']").css('padding-bottom'));

        // Resize main container
        $(".overflow_view").css({"width": 3 * viewWidth, "height": 3 * viewHeight});
        // Resize map views
        $(".map_view").css(
                {
                    "width": viewWidth
                            - parseInt($(".map_view").css('padding-left'))
                            - parseInt($(".map_view").css('padding-right')),
                    "height": viewHeight
                });
        $(".locate_view").css({
            "width": 1 * viewWidth
                    - parseInt($(".locate_view").css('padding-left'))
                    - parseInt($(".locate_view").css('padding-right')),
            "height": viewHeight
        });


        // Resize Map
        console.log("TODO: Resize map itself.");

    }

    map.onLoad = function() {
        // Anything you want to run onLoad
        // When all page resources (styles, scripts, markup, etc) are finished loading this is called. 
        resize();
        init_map();
        map.selectView("Map");
    };

    map.onBeforeLeave = function() {
        // Anything you want to run onBeforeLeave
        // Before Leave = Before going from this module to another module this is called.

    };

    map.onResize = function() {
        // Anything you want to run onResize
        // Event is called on every pixel sized resize movement. 
        // High accuracy / low latency; low performance (CPU intensive because possibly many, many events are called).
        resize();
    };

    map.onSmartResize = function() {
        // Anything you want to run onSmartResize
        // Smart resize will not execute on every pixel increment of the resize action.
        // Low accuracy / High latency; High performance (Not CPU intensive because there are less events called).
    };

    map.onOrientationChange = function() {
        // Anything you want to run onOrientationchange
        resize();
    };

})(window.map = window.map || {});      