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
