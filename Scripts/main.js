
var startPosition = 0;
var pagePosition = 0;
var scrollY = 0;
var scrollPrevented = false;
var animationId = null;

/* === Event Listeners === */
window.addEventListener("load", function(){ if(!window.pageYOffset){ hideAddressBar(); } } );
window.addEventListener("orientationchange", function() { hideAddressBar(); loadAppGrid(); stopScroll();  } )
window.addEventListener("resize", function() { loadAppGrid(); stopScroll(); } )


$(document).ready(function() {
//$(document).on('pageinit', function() {

// Move the slider to the default closed position.
menuSlide();
loadAppGrid();

$('div.all_pages').live('pageshow',function(event, ui){
  console.log('This page was just hidden: '+ ui.prevPage);
  //$("#menu").show();
});

$('div.all_pages').live('pagehide',function(event, ui){
  console.log('This page was just shown: '+ ui.nextPage);
  //$("#menu").hide();
});

$('div.all_pages').live('pagebeforecreate',function(event){
  console.log('This page was just inserted into the dom!');
  //$("#menu").show();
});

$('div.all_pages').live('pagecreate',function(event){
  console.log('This page was just enhanced by jQuery Mobile!');  
  $("div.smuToolsPanel").show();
});

$(document).on('pagebeforechange', function() {
  console.log('Page before change');
  $("#menu").hide();
  $("#menu").css({
    height: 0
  });
  
  $("div.smuToolsPanel").css({
    height: 0
  });
    
});

$(document).on('pagechange', function() {
  console.log('Page change:'+$.mobile.activePage.attr("id"));
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
    setTimeout( function () {
      $.mobile.showPageLoadingMsg(true);
      $.mobile.changePage("#home", { transition: 'pop' });
    },2000);
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
    setTimeout( function () {
      $.mobile.showPageLoadingMsg(true);
      $.mobile.changePage("#home", { transition: 'pop' });
    },2000);
  }
    
  $('div.smuToolsPanel input.view_select').click( function () {
    selectAppView(this);
  });
  
  $(".all_pages").css({
    paddingBottom: $("div.smuToolsPanel").height()
  });
  

$(document).on('vmousedown', "div.smuToolsPanel [data-role='footer']", function(event) {
    //alert("vmousedown");
    
    var startPosition = pagePosition;
    
    var minToolsHeight = $("div.smuToolsPanel [data-role='footer']").height();
    
    //var maxToolsHeight = $(window).height() - $("div.smuToolsPanel .smu_tools_button").height();
    var windowHeight = window.innerHeight ? window.innerHeight : $(window).height();
    var maxToolsHeight = windowHeight - ($.mobile.activePage).find("div[data-role='header']").height();
    
    
    $("div.smuToolsPanel").css({
      'z-index': '1500'
    });
    
    $(document).on('vmousemove', function(event2) {
        scrollY = event2.pageY;
        console.log("scrollY:"+scrollY);
        console.log("pageY:"+event.pageY+", startPosition:"+startPosition);
        pagePosition = startPosition - scrollY + event.pageY;
        console.log("pagePosition:"+pagePosition);
        if (pagePosition > $("div.smuToolsPanel").height()) {
            pagePosition = $("div.smuToolsPanel").height();
        } else if (pagePosition < 0) {
            pagePosition = 0;
        }
        if (scrollPrevented == false) {
            scrollPrevented = true;
            $(document).on('touchmove', function(ev) {
                //alert("bet you can't scroll!");
                if (scrollPrevented == true)
                  ev.preventDefault();
            });
        }
        menuSlide();
        
    });
    
});


$(document).on('vmouseup', function() {
    console.log("vmouseup");
    if (scrollPrevented == true) {
        //alert("should be able to scroll now!");
        $('body').unbind('touchmove');
        //$(document).off('touchmove');
        scrollPrevented = false;
    }
    $(document).off('vmousemove', stopScroll());
});


function menuSlide() {
    console.log("menuSlide");
    var minToolsHeight = $("div.smuToolsPanel [data-role='footer']").height();
    var windowHeight = window.innerHeight ? window.innerHeight : $(window).height();
    var maxToolsHeight = windowHeight-($.mobile.activePage).find("div[data-role='header']").height();
    var newHeight = pagePosition + $("div.smuToolsPanel [data-role='footer']").height();
    if (newHeight < minToolsHeight) newHeight = minToolsHeight;
    if (newHeight > maxToolsHeight) newHeight = maxToolsHeight;
    console.log("pagePosition:"+pagePosition+", newHeight:"+newHeight);
    
    console.log("scrollTop:"+$(document).scrollTop());
    animateSlider(newHeight);
    /*
    $("div.smuToolsPanel").css({
        height: newHeight
    });
    
    $(".all_pages").css({
      paddingBottom: $("div.smuToolsPanel").height()
    });
    */
}


function stopScroll() {
  console.log("stopScroll");
  console.log("pagePosition:"+pagePosition+", smuToolsPanel.height:"+$("div.smuToolsPanel").height());
  
  var minToolsHeight = $("div.smuToolsPanel [data-role='footer']").height();
  //var maxToolsHeight = $(window).height()-$("div.smuToolsPanel .smu_tools_button").height();
  var windowHeight = window.innerHeight ? window.innerHeight : $(window).height();
  var maxToolsHeight = windowHeight - ($.mobile.activePage).find("div[data-role='header']").height();
  
  if (pagePosition > $(window).height() / 2) {
      console.log("Auto-Slide to Top");
    /*
      $("div.smuToolsPanel").animate({
        height: maxToolsHeight
      },{speed: "50ms", easing: "linear"}); 
      
      $(".all_pages").animate({
        paddingBottom: maxToolsHeight
      },{speed: "50ms", easing: "linear"});
    */  
      pagePosition = maxToolsHeight;
      loadAppGrid();
  
  } else {
      console.log("Auto-Slide to Bottom");
      console.log("pagePosition:"+pagePosition);
      
  /*  
      $("div.smuToolsPanel").animate({
        height: minToolsHeight
      },{speed: "50ms", easing: "linear"}); 
      
      $(".all_pages").animate({
        paddingBottom: 0
      },{speed: "50ms", easing: "linear"});
  */    
      pagePosition = 0;
      
  }
  menuSlide();
}

$(document).on("click", "div.smuToolsPanel .app_view a", function(){
    console.log("Clicked app view link");
    pagePosition = 0;
    menuSlide();
});


/*
$(document).on("click", "div[data-role='page']", function(){
    console.log("Clicked page");
    pagePosition = 0;
    menuSlide();
});
*/


  
});

function animateSlider(newHeight)
{
/*
  console.log("animationId:"+animationId); 
  window.clearTimeout(animationId);
  animationId = null;
  animationId = window.setTimeout(function() { 
    $("div.smuToolsPanel").css({
        height: newHeight
    }); 
    
    $(".all_pages").css({
      paddingBottom: $("div.smuToolsPanel").height()
    });
   console.log("newHeight:"+newHeight); 
  },0); 
  */
  $("div.smuToolsPanel").css({
      height: newHeight
  }); 
  
  /*
  $(".all_pages").css({
    paddingBottom: $("div.smuToolsPanel").height()
  });
  */ 
}

function selectAppView(viewInput)
{
  console.log($(viewInput).attr('value'));
  $("div.smuToolsPanel .view_select").removeClass('ui-btn-active');
  $(viewInput).addClass('ui-btn-active');
  $("label[for='"+$(viewInput).attr("id")+"']").addClass('ui-btn-active');
  $('div.app_view').hide();
  $('div.' + $(viewInput).attr('value')).show();
}


function closeSmuTools(redirect)
{
  //console.log("Closing SMU Tools Panel");
  /*
  var panel = $(".smuToolsPanel");
  panel.removeClass("open");
  panel.addClass("close");
  var button = $(".smu_tools_button");
  button.attr("onClick","openSmuTools();");
  button.attr("href","javascript:");
  //console.log("Redirect:"+redirect);
  */
  
  if (redirect != undefined) 
  {
    $("#menu").hide();
    
    $.mobile.changePage(redirect, {transition: 'flow'});  
    //$("#menu").show();
  }
  
}

function openSmuTools()
{
  /*
  //console.log("Opening SMU Tools Panel");
  var panel = $(".smuToolsPanel");
  panel.removeClass("close");
  panel.addClass("open");
  var button = $(".smu_tools_button");
  button.attr("onClick","closeSmuTools();");
  button.attr("href","javascript:");
  */
}

function hideAddressBar()
{
  if(!window.location.hash)
  {
      if(document.height < window.outerHeight)
      {
          document.body.style.height = (window.outerHeight + 50) + 'px';
      }
 
      setTimeout( function(){ window.scrollTo(0, 1); }, 50 );
  }
}


/*
$("a").attr("data-transition", "flow");
*/


/* ===== App Grid ===== */
function loadAppGrid()
{
  var n2a = new Array('a','b','c','d','e');
  var max_apps_row = 5;
  var app_width = 128;
  var grid_view = $('.app_grid_view');
  max_apps_row = Math.floor((grid_view.width()-40) / app_width);
  if (max_apps_row > 5) max_apps_row = 5;
  var apps = new Array();
  apps.push( {'title':'News', 'link':'#news', 'icon':'http://aux.iconpedia.net/uploads/1572305589167805283.png'} );
  apps.push( {'title':'Register', 'link':'#register', 'icon':'http://nuno-icons.com/wp-content/uploads/2008/05/register.png'} );
  apps.push( {'title':'Map', 'link':'#map', 'icon':'http://chriscarey.com/wordpress/wp-content/uploads/2012/07/google_maps_icon.png'} );
  apps.push( {'title':'Grades', 'link':'#grades', 'icon':'http://atkins.caddo.k12.la.us/files/igradesim_icon.png'} );
  //console.log(apps);
  //console.log(grid_view);
  
  // Create new grid element
  var app_grid = $( "<div />" , { "class": "app_grid ui-grid-"+n2a[max_apps_row-2] } );
  
  // Fill grid elelement with apps
  for (var i=0; i<apps.length; i++)
  {
    var inner_app = "";
    var current_app = $( "<div />" , { "class": "app_block ui-block-"+n2a[i%max_apps_row] } );
    
    current_app.append(
      $(
      "<a />", 
      { 
        "data-role":"", 
        "href": apps[i].link,
        "data-transition":"flow",
        "data-corners":"true",
        "data-shadow":"true",
        "data-iconshadow":"true",
        "data-wrapperels":"span", 
        "data-theme":"a"
      } 
      ).append(
        $( 
        "<span />",
        {
          "class":"ui-btn-text"
        }
        ).append(
          $( "<img />",
          {
            "alt": apps[i].title,
            "src": apps[i].icon
          }
          )
        ).append(
        apps[i].title
        )
      )
    ); 
    app_grid.append( current_app );
  }
  
  // Replace original element with new app grid element
  $(".app_grid_view div.ui-grid-a").replaceWith(app_grid);
  
  // Finished
  console.log( app_grid.html() );
}

/* OS Detection Code from http://www.abeautifulsite.net/blog/2011/11/detecting-mobile-devices-with-javascript/ */
var isMobile = {
    Android: function() {
        return navigator.userAgent.match(/Android/i);
    },
    BlackBerry: function() {
        return navigator.userAgent.match(/BlackBerry/i);
    },
    iOS: function() {
        return navigator.userAgent.match(/iPhone|iPad|iPod/i);
    },
    Opera: function() {
        return navigator.userAgent.match(/Opera Mini/i);
    },
    Windows: function() {
        return navigator.userAgent.match(/IEMobile/i);
    },
    any: function() {
        return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows());
    }
};

/* Additional features by Glavin Wiechert */
var isDesktop = {
    Mac: function() {
        return navigator.userAgent.match(/Mac/i);
    },
    Windows: function() {
        return navigator.userAgent.match(/Windows/i);
    },
    any: function() {
        return (isDesktop.Mac() || isDesktop.Windows() );
    }
};


// Theming for Mobile OS
if ( isMobile.any() )
{ 
  if( isMobile.iOS() )
  {
   $("#mobile-theme").attr("href","Styles/iOS.css");
  }
  else if( isMobile.Android() )
  {
   $("#mobile-theme").attr("href","Styles/Android.css");
  }
  else if( isMobile.BlackBerry() )
  {
   $("#mobile-theme").attr("href","Styles/Blackberry.css");
  }
  else if( isMobile.Windows() )
  {
   $("#mobile-theme").attr("href","Styles/Windows.css");
  }
}
else if ( isDesktop.any() )
{
  
  if( isDesktop.Mac() )
  {
   $("#mobile-theme").attr("href","Styles/iOS.css");
  }
  else if( isDesktop.Windows() )
  {
   $("#mobile-theme").attr("href","Styles/Android.css");
  }
}