/* 
 * Author:
 * Glavin Wiechert
 * Feb 21, 2013
 * 
 * Description:
 * This file handles the SMU Rotating News Feed.
 *  
 */


function loadNewsFeed() {
    // Require Node.JS support for crawling SMU homepage.
    
}

function displayNewsFeed() {
    // Displays the HTML form of the NewsFeed
    // Requires loadNewsFeed() be called prior.
    
}


// 
var manuallyRotating = false;
var newsSelected = 0; // 0=Has not started, 1=First item, etc.
var rotatePosition = 0;
var rotatorId = null;
var rotationInterval = 3000; // milliseconds
var startingOffset = 0;

function autoRotate() {
    //console.log("Rotating News Feed");
    if (!manuallyRotating)
    {

        // Calculate new position
        //var newRotatePosition = rotatePosition;
        //newRotatePosition -= $("#newsFeed ul.newsList li.newsItem").width();
        newsSelected++;
        if ( newsSelected > $("#newsFeed ul.newsList li.newsItem").length )
            newsSelected = 1; // Reset position
        var newRotatePosition 
                = newsSelected 
                * ( $("#newsFeed ul.newsList li.newsItem").width() 
                + parseInt($("#newsFeed ul.newsList li.newsItem").css('margin-left'))
                + parseInt($("#newsFeed ul.newsList li.newsItem").css('margin-right')) );

        /*
        if ( -1*(newRotatePosition) > $("#newsFeed ul.newsList").width() )
            newRotatePosition = 0; // Reset position
        */

        // Rotate
        $("#newsFeed ul.newsList li.newsItem").animate({
            left: ( -1*newRotatePosition + startingOffset )
        }, rotationInterval/5);
        // Save new position
        rotatePosition = newRotatePosition;
        console.log("Rotating News Feed: pos:"+rotatePosition+", n:"+newsSelected);
    }
}

function resizeNewsFeed() {
    /*
    var maxWidth = ($.mobile.activePage).find("div[data-role='content']").width();
    var maxHeight = ($.mobile.activePage).find("div[data-role='content']").height();
     */
    var maxWidth = $(window).width() 
            - parseInt($("#newsFeed ul.newsList li.newsItem").css('margin-left')) 
            - parseInt($("#newsFeed ul.newsList li.newsItem").css('margin-right'));
    var maxHeight = ( window.innerHeight ? window.innerHeight : $(window).height() )
            - $("div.smuToolsPanel [data-role='footer']").height() 
            - ($.mobile.activePage).find("div[data-role='header']").height() 
            - parseInt(($.mobile.activePage).find("div[data-role='content']").css('padding-top'))
            - parseInt(($.mobile.activePage).find("div[data-role='content']").css('padding-bottom'));
    
    var boxSize = (maxWidth < maxHeight)?maxWidth:maxHeight;
    $('#newsFeed ul.newsList li.newsItem').width(boxSize).height(boxSize);
    startingOffset = (maxWidth / 2) + (boxSize / 2);
    
    autoRotate(); // Start off with first position.
}

$(document).ready( function () {

    rotatorId = setInterval( function () { autoRotate(); }, rotationInterval);

    /*
    $(document).on('vmousedown', "", function(event) {
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
        //console.log("scrollY:"+scrollY);
        //console.log("pageY:"+event.pageY+", startPosition:"+startPosition);
        pagePosition = startPosition - scrollY + event.pageY;
        //console.log("pagePosition:"+pagePosition);
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


$(document).on("click", "div.smuToolsPanel .app_view a", function(){
    console.log("Clicked app view link");
    pagePosition = 0;
    menuSlide();
});
    
*/

/*
$(document).on("click", "div[data-role='page']", function(){
    console.log("Clicked page");
    pagePosition = 0;
    menuSlide();
});
*/


  
});
