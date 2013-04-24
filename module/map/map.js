/* 
 * Map module script
 */


(function(map, undefined) {

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

    map.onLoad = function() {
        // Anything you want to run onLoad
        // When all page resources (styles, scripts, markup, etc) are finished loading this is called. 
        init_map();
    };

    map.onBeforeLeave = function() {
        // Anything you want to run onBeforeLeave
        // Before Leave = Before going from this module to another module this is called.

    };

    map.onResize = function() {
        // Anything you want to run onResize
        // Event is called on every pixel sized resize movement. 
        // High accuracy / low latency; low performance (CPU intensive because possibly many, many events are called).

    };

    map.onSmartResize = function() {
        // Anything you want to run onSmartResize
        // Smart resize will not execute on every pixel increment of the resize action.
        // Low accuracy / High latency; High performance (Not CPU intensive because there are less events called).
    };

    map.onOrientationChange = function() {
        // Anything you want to run onOrientationchange
    };

})(window.map = window.map || {});      