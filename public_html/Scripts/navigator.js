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

    $(document).on('pagechange', function() {
      console.log('Page change:' + $.mobile.activePage.attr("id"));
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

        $.mobile.showPageLoadingMsg();
        setTimeout(function() {
          $.mobile.showPageLoadingMsg(true);
          $.mobile.changePage("#home", {transition: 'pop'});
        }, 2000);
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

      $.mobile.showPageLoadingMsg();
      setTimeout(function() {
        $.mobile.showPageLoadingMsg(true);
        $.mobile.changePage("#home", {transition: 'pop'});
      }, 2000);
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



})(window.navigator = window.navigator || {});  