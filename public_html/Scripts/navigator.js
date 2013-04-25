/*
 * Author:  Glavin Wiechert
 * Date:    Tuesday, March 19, 2013
 * 
 */

(function(navigator, undefined) {
  // Public Events
  $(document).ready(function() {

    $('div.all_pages').live('pageshow', function(event, ui) {
      console.log('This page was just hidden: ' + ui.prevPage);
      //$("#menu").show();
    });

    $('div.all_pages').live('pagehide', function(event, ui) {
      console.log('This page was just shown: ' + ui.nextPage);
      //$("#menu").hide();
    });

    $('div.all_pages').live('pagebeforecreate', function(event) {
      console.log('This page was just inserted into the dom!');
      //$("#menu").show();
    });

    $('div.all_pages').live('pagecreate', function(event) {
      console.log('This page was just enhanced by jQuery Mobile!');
      $("div.smuToolsPanel").show();
    });

    $(document).on('pagebeforechange', function(e, data) {
      var toPage = (typeof data.toPage === "string") ? data.toPage : data.toPage.jqmData("url") || "";
      console.log('Page before change: ' + toPage);

      // Module On Before Leave Event
      if (window[ navigator.getModuleName() ] && window[ navigator.getModuleName() ].onBeforeLeave)
        window[ navigator.getModuleName() ].onBeforeLeave();

      // Hide the menu
      $("#menu").hide();
      $("#menu").css({
        height: 0
      });
      $("div.smuToolsPanel").css({
        height: 0
      });
      // Go to the Module
      if (toPage.indexOf("/m/") !== 0 && $(toPage).length === 0) {
        // Is not already loaded into DOM.
        console.log(toPage + " is not already loaded.");
        navigator.goToModule(toPage);
      } else {
        // Is already loaded into DOM
        console.log(toPage + " is already loaded.");
      }
    });

    $(document).on('pagechangefailed', function(data) {
      console.log('Page change failed:' + data.toPage);
      $("#menu").show();
      $("#menu").css({
        height: $("div.smuToolsPanel [data-role='footer']").height()
      });
      $("div.smuToolsPanel").css({
        height: $("div.smuToolsPanel [data-role='footer']").height()
      });
    });

    $(document).on('pagechange', function() {
      console.log('Page change: ' + $.mobile.activePage.attr("id"));
      $("#menu").show();
      $("#menu").css({
        height: $("div.smuToolsPanel [data-role='footer']").height()
      });
      $("div.smuToolsPanel").css({
        height: $("div.smuToolsPanel [data-role='footer']").height()
      });
      if ($.mobile.activePage.attr("id") == "splash" || $.mobile.activePage.attr("id") == "login")
      {
        $("#menu").hide();
        $("#menu").css({
          height: 0
        });
      }
      if ($.mobile.activePage.attr("id") == "splash")
      {
        $("div.smuToolsPanel").css({
          height: 0
        });

        $.mobile.changePage("/m/home", {
          transition: 'fade'
        });
      }

      console.log("Finished Loading Module:", navigator.getModuleName());
      // Load CSS files 
      // Check if there are scripts to be loaded.
      if (apps && apps[navigator.getModuleName()] && apps[navigator.getModuleName()].styles) {
        $.each(apps[navigator.getModuleName()].styles, function(i, styleHref) {
          if (document.createStyleSheet) {
            document.createStyleSheet(styleHref);
          }
          else {
            $("head").append($("<link rel='stylesheet' href='" + styleHref + "' type='text/css' media='screen' />"));
          }
        });
      }

      //  Load scripts
      // Check if there are scripts to be loaded.
      if (apps && apps[navigator.getModuleName()] && apps[navigator.getModuleName()].scripts) {
        navigator.loadScriptCount = 0;
        $.each(apps[navigator.getModuleName()].scripts, function(i, scriptSrc) {
          navigator.loadScriptCount++;
          $.getScript(scriptSrc, function(data, textStatus, jqxhr) {
            navigator.loadScriptCount--;
            //console.log(data); //data returned
            console.log(textStatus); //success
            console.log(jqxhr.status); //200
            console.log('Load was performed.');

            if (navigator.loadScriptCount === 0) {
              // Only when last script loaded === onLoad event
              console.log("Module onLoad event");
              // Module On Load Event
              if (window[ navigator.getModuleName() ] && window[ navigator.getModuleName() ].onLoad)
                window[ navigator.getModuleName() ].onLoad();

            }

          });
        });
      } else
      {
        // The necessary scripts may already be loaded. 
        // Module On Load Event
        if (window[ navigator.getModuleName() ] && window[ navigator.getModuleName() ].onLoad)
          window[ navigator.getModuleName() ].onLoad();
      }


    });

    if ($.mobile.activePage.attr("id") == "splash")
    {
      $("#menu").hide();
      $("#menu").css({
        height: 0
      });

      $("div.smuToolsPanel").css({
        height: 0
      });

      $.mobile.changePage("/m/home", {
        transition: 'fade'
      });
    }

    $('div.smuToolsPanel input.view_select').click(function() {
      selectAppView(this);
    });

    $(".all_pages").css({
      paddingBottom: $("div.smuToolsPanel").height()
    });

  });


  // Public methods 
  navigator.goToModule = function(toPage) {
    console.log("GoToModule(" + toPage + ")");
    // Check if the module is already loaded
    //$.mobile.changePage("/m/" + moduleAddress); // , {data:{param1:'value1'}}
    //var url = $.url(document.location);
    //var param1 = url.param("param1"); 
    //document.location.hash = moduleAddress;

    // We only want to handle changePage() calls where the caller is
    // asking us to load a page by URL.
    var href = "";
    if (typeof toPage === "string") {
      href = toPage;
      // location.hash = pageName;

      if (href.search("#") != -1) {// Check if it is a module
        href = href.replace(/[^#]*#/, "");
        if (!href) {
          //link was an empty hash meant purely
          //for interaction, so we ignore it.
          event.preventDefault();
          return;
        }
        else
        {
          console.log("Inserting " + href + " into DOM");
          $.mobile.changePage("/m/" + href, {changeHash: false});
          document.location.hash = href;

          //$.mobile.loadPage("/m/" + href);
          //setPageUrl = setPage.hash == "" ? setPage.pathname : setPage.hash.replace('#', '');
          //page.attr({'data-url': setPageUrl});
        }
      }
      console.log(href);
    }
  };

  navigator.getModuleName = function( ) {
    // return $.mobile.activePage.attr('data-url').split('/').pop();
    return $.mobile.activePage.attr("id");
  };

})(window.navigator = window.navigator || {});  