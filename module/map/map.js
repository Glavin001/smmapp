/* 
 * Map module script
 */


(function(map, undefined) {

    // Private functions
    function initMap() {
        map.mapOL = new OpenLayers.Map("campusMap");
        var mapnik = new OpenLayers.Layer.OSM();
        var fromProjection = new OpenLayers.Projection("EPSG:4326");   // Transform from WGS 1984
        var toProjection = new OpenLayers.Projection("EPSG:900913"); // to Spherical Mercator Projection
        var position = new OpenLayers.LonLat(13.41, 52.52).transform(fromProjection, toProjection);
        var zoom = 15;

        map.mapOL.addLayer(mapnik);
        map.mapOL.setCenter(position, zoom);
        map.isFullScreen = false;
    }

    // Get rid of address bar on iphone/ipod
    var fixSize = function() {
        window.scrollTo(0, 0);
        document.body.style.height = '100%';
        if (!(/(iphone|ipod)/.test(navigator.userAgent.toLowerCase()))) {
            // Is iOS
            if (document.body.parentNode) {
                document.body.parentNode.style.height = '100%';
            }
            
        }
    };

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
        $(".overflow_view").css({"width": 3 * viewWidth, "height": 2 * viewHeight});
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
        
        // Resize Full Screen if neccessary
        if ( map.isFullScreen ) {
            $("#fullScreenMapContainer").css({ 
                "height": (window.innerHeight ? window.innerHeight : $(window).height())
            });
        }

        // Resize Map
        console.log("TODO: Resize map itself.");

    }

    // Public functions
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

    map.fullScreen = function(isFullScreen) {

        map.isFullScreen = isFullScreen;
        // Check if switching to full screen mode
        if (isFullScreen) {
            // Hide main map
            $(".map_view").hide();

            // Make Full screen map
            var contEl = $("<div/>").attr('id', "fullScreenMapContainer");
            var mapEl = $("<div/>").attr('id', "fullScreenMap");
            var exitFSEl = $("<a />").text("Exit Full Screen")
                    .attr('class', "fullScreenBtn")
                    .attr('onclick', "map.fullScreen(false);")
                    .attr('href', "#")
                    .attr('data-role', "button")
                    .attr('data-inline', "true")
                    .attr('data-theme', "b");
            var gpsEnableEl = $("<a />").text("GPS")
                    .attr('class', "gpsBtn")
                    .attr('onclick', "map.centerGPS();")
                    .attr('href', "#")
                    .attr('data-role', "button")
                    .attr('data-inline', "true")
                    .attr('data-theme', "b");

            $(contEl).append($(gpsEnableEl));
            $(contEl).append($(exitFSEl));
            $(contEl).append($(mapEl));
            $(contEl).appendTo($('body'));
            $("#fullScreenMapContainer").trigger('create');

            // Create full screen mobile map
            map.mapFS = new OpenLayers.Map({
                div: "fullScreenMap",
                theme: null,
                controls: [
                    new OpenLayers.Control.Attribution(),
                    new OpenLayers.Control.TouchNavigation({
                        dragPanOptions: {
                            enableKinetic: true
                        }
                    }),
                    new OpenLayers.Control.Zoom()
                ],
                layers: [
                    new OpenLayers.Layer.OSM("OpenStreetMap", null, {
                        transitionEffect: 'resize'
                    })
                ],
                center: map.mapOL.getCenter(),
                zoom: map.mapOL.zoom
            });

        } else {
            // Sync main map with center of full screen map
            map.mapOL.setCenter(map.mapFS.getCenter());
            map.mapOL.zoomTo(map.mapFS.zoom);

            // Show main map
            $(".map_view").show();

            // Remove fullscreen if exists
            $("#fullScreenMapContainer").remove();
        }
        
        resize();
        setTimeout(function( ) {
            // Get rid of address bar on iphone/ipod
            fixSize();
            resize();
        }, 100);
        
    };

    map.centerGPS = function( ) {
        navigator.geolocation.getCurrentPosition(locationSuccess, locationFail);
        function locationSuccess(position) {
            latitude = position.coords.latitude;
            longitude = position.coords.longitude;
            console.log(latitude, longitude);
            var coor_from = new OpenLayers.Projection("EPSG:4326");
            var coor_to = new OpenLayers.Projection("EPSG:900913");
            var center = new OpenLayers.LonLat(longitude, latitude);
            center.transform(coor_from, coor_to);
            //map.mapOL.addLayer(new OpenLayers.Layer.OSM());
            if (map.isFullScreen)
                map.mapFS.setCenter(center, 15);
            else
                map.mapOL.setCenter(center, 15);
        }
        function locationFail() {
            console.log("Oops, could not find you.");
        }
    };

    // Events
    map.onLoad = function() {
        // Anything you want to run onLoad
        // When all page resources (styles, scripts, markup, etc) are finished loading this is called. 
        resize();
        initMap();
        map.selectView("Map");
    };

    map.onBeforeLeave = function() {
        // Anything you want to run onBeforeLeave
        // Before Leave = Before going from this module to another module this is called.

        // Be sure to cleanup and remove Full Screen Map
        map.fullScreen(false);

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