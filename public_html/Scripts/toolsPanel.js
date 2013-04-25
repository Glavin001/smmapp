/* 
 * Author:
 * Glavin Wiechert
 * Feb 20, 2013
 * 
 * Description:
 * This file deals with all of the events associated with the SMU Tools Panel.
 *  
 */


if (window.socket) {
    socket.on('App List', function(data) {
        console.log("Received apps", data);
        // New empty apps array
        window.apps = data;
        displayAppGrid();
        displayAppList();
    });
}

function loadApps() {
    console.log("Loading apps.");

    /*
     // TEST
     apps.push({'title': 'News', 'link': '/m/news',
     'icon': 'http://aux.iconpedia.net/uploads/1572305589167805283.png',
     'description': 'The News view is transitioned to either through clicking the main news image or through opening the News SMMApp. This view provides the article associated to the image formatted to fit elegantly on a mobile device while still remaining readable. This application will also be used to push important notifications to the students, such as school cancellations. '});
     apps.push({'title': 'Register', 'link': '/m/register',
     'icon': 'http://nuno-icons.com/wp-content/uploads/2008/05/register.png',
     'description': 'A major functionality and one of the first things on our implementation path will be the ability for students to register for courses through SMMAPPS. The registration interface is currently planned to be sitting within the Current Grades SMMApp though depending on the scope of the SMMApp it may be decided to break this functionality off into its own SMMApp.'});
     apps.push({'title': 'Map', 'link': '/m/map',
     'icon': 'http://chriscarey.com/wordpress/wp-content/uploads/2012/07/google_maps_icon.png',
     'description': 'The Interactive Campus Map will be one of the main features of SMMAPPS. It will be designed to serve as a tool for students to locate useful on campus resources.'});
     apps.push({'title': 'Grades', 'link': '/m/grades',
     'icon': 'http://atkins.caddo.k12.la.us/files/igradesim_icon.png',
     'description': 'Student grades will of course be provided through the Current Grades SMMApp. Once clicked the student will be provided with a transcript by term ordered from most to least recent.'});
     */

    // 
    if (window.socket) {
        socket.emit('App List', {}); // Emits a request for the App List
        // Check if the receiving socket event is setup
        if (!(window.socket.$events && window.socket.$events['App List'])) {
            // If not, create the receiving socket event for 'App List'
            socket.on('App List', function(data) {
                console.log("Received apps", data);
                // New empty apps array
                window.apps = data;
                displayAppGrid();
                displayAppList();
            });
        }
    }

}

/* ===== App Grid ===== */
function displayAppGrid() {
    console.log("Loading App Grid");
    var n2a = new Array('a', 'b', 'c', 'd', 'e');
    var max_apps_row = 5;
    var app_width = 128;
    var grid_view = $('.app_grid_view');
    var grid_padding = 0;
    max_apps_row = Math.floor((grid_view.width() - grid_padding) / app_width);
    if (max_apps_row > 5)
        max_apps_row = 5;
    //console.log(apps);
    //console.log(grid_view);

    // Create new grid element
    var app_grid = $("<div />", {"class": "app_grid ui-grid-" + n2a[max_apps_row - 2]});

    // Fill grid elelement with apps
    // for (var i = 0; i < apps.length; i++) {
    var i = -1;
    for (var key in apps) {
        i++;
        var current_app = $("<div />", {"class": "app_block ui-block-" + n2a[i % max_apps_row]});
        //var clickEvent = function (link) { navigator.goToModule(link); };

        current_app.append(
                $(
                "<a />",
                {
                    "data-role": "",
                    "href": apps[key].path,
                    "data-transition": "flow",
                    "data-corners": "true",
                    "data-shadow": "true",
                    "data-iconshadow": "true",
                    "data-wrapperels": "span",
                    "data-theme": "a"
                }
        //).on('click', clickEvent(apps[i].path)  
        ).append(
                $(
                "<span />",
                {
                    "class": "ui-btn-text"
                }
        ).append(
                $("<img />",
                {
                    "alt": apps[key].title,
                    "src": apps[key].icon
                }
        )
                ).append(
                apps[key].title
                )
                )
                );
        app_grid.append(current_app);
    }

    // Replace original element with new app grid element
    $(app_grid).width((max_apps_row) * 128);
    $(".app_grid_view div.app_grid").replaceWith(app_grid);
    $(".app_grid_view").trigger('create');

    // Finished
    //console.log( app_grid.html() );
}

function displayAppList() {
    console.log("Loading App List");

    /*
     <ul data-role="listview" data-divider-theme="b" data-inset="true" class="ui-listview ui-listview-inset ui-corner-all ui-shadow">
     <li data-theme="c" data-corners="false" data-shadow="false" data-iconshadow="true" data-wrapperels="div" data-icon="arrow-r" data-iconpos="right" class="ui-btn ui-btn-up-c ui-btn-icon-right ui-li-has-arrow ui-li ui-corner-top">
     <div class="ui-btn-inner ui-li ui-corner-top">
     <div class="ui-btn-text">
     <a href="javascript:void(0)" onclick="closeSmuTools('#news');" class="ui-link-inherit">
     <img style="width:32px;height:32px;" alt="News" src="http://aux.iconpedia.net/uploads/1572305589167805283.png">
     News
     </a>
     </div>
     <span class="ui-icon ui-icon-arrow-r ui-icon-shadow">&nbsp;</span>
     </div>
     </li>
     </ul>
     */

    // Create new grid element
    var app_list = $("<ul />", {"data-role": "listview", "data-divder-theme": "b", "data-inset": "true", "class": "app_list"});

    // Fill grid elelement with apps
    // for (var i = 0; i < apps.length; i++) {
    for (var key in apps) {
        var current_app = $("<li />", {"data-theme": "c"});
        current_app.append(
                $("<a />", {"href": apps[key].path, "class": "", "data-transition": "flow"})
                .append(
                $("<img />",
                {
                    "alt": apps[key].title,
                    "src": apps[key].icon
                }
        )
                ).append(
                $('<h2 />')
                .append(
                apps[key].title
                )
                ).append(
                $('<p />')
                .append(
                apps[key].description
                )
                )
                );
        app_list.append(current_app);
    }

    // Replace original element with new app grid element
    $(".app_list_view ul.[data-role='listview']").replaceWith(app_list);
    $(".app_list_view").trigger('create');

    // Finished
    //console.log( app_list.html() );
}

function slideAppView(position, animate)
{
    /*
     * position == 0px : grid in full view
     */

    //
    var app_view_container = $('.all_app_views');
    var grid_view = $('.app_grid_view');
    var list_view = $('.app_list_view');
    var view_width = app_view_container.width();

    // Display both views
    grid_view.show();
    list_view.show();

    // Move views
    if (animate)
    {
        // Animate movement
        grid_view.css({left: position});
        list_view.css({left: position + view_width});
    }
    else
    {
        // Move instantly
        grid_view.css({left: position});
        list_view.css({left: position + view_width});
    }

}


// Working variables
var startPosition = 0;
var pagePosition = 0;
var scrollY = 0;
var scrollPrevented = false;
var animationId = null;


// Misc Functions
function menuSlide(animate) {
    //console.log("menuSlide");
    var minToolsHeight = $("div.smuToolsPanel [data-role='footer']").height();
    var windowHeight = window.innerHeight ? window.innerHeight : $(window).height();
    var maxToolsHeight = windowHeight - ($.mobile.activePage).find("div[data-role='header']").height();
    var newHeight = pagePosition + $("div.smuToolsPanel [data-role='footer']").height();
    if (newHeight < minToolsHeight)
        newHeight = minToolsHeight;
    if (newHeight > maxToolsHeight)
        newHeight = maxToolsHeight;
    //console.log("pagePosition:"+pagePosition+", newHeight:"+newHeight);

    //console.log("scrollTop:"+$(document).scrollTop());
    animateSlider(newHeight, animate);
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
    console.log("pagePosition:" + pagePosition + ", smuToolsPanel.height:" + $("div.smuToolsPanel").height());

    var minToolsHeight = $("div.smuToolsPanel [data-role='footer']").height();
    //var maxToolsHeight = $(window).height()-$("div.smuToolsPanel .smu_tools_button").height();
    var windowHeight = window.innerHeight ? window.innerHeight : $(window).height();
    var maxToolsHeight = windowHeight - ($.mobile.activePage).find("div[data-role='header']").height();

    if (startPosition == pagePosition && pagePosition == 0) // Click to open 
    {
        pagePosition = maxToolsHeight;
        displayAppGrid();
    }
    else if (startPosition == pagePosition && pagePosition != 0) // Click to close
    {
        pagePosition = 0;
    }
    else if (pagePosition > $(window).height() / 2) {
        //console.log("Auto-Slide to Top");
        /*
         $("div.smuToolsPanel").animate({
         height: maxToolsHeight
         },{speed: "50ms", easing: "linear"}); 
         
         $(".all_pages").animate({
         paddingBottom: maxToolsHeight
         },{speed: "50ms", easing: "linear"});
         */
        pagePosition = maxToolsHeight;
        displayAppGrid();
    } else {
        //console.log("Auto-Slide to Bottom");
        //console.log("pagePosition:"+pagePosition);

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
    menuSlide(true);
}

function animateSlider(newHeight, animate)
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
    if (animate === true)
    {
        $("div.smuToolsPanel").stop();
        $("div.smuToolsPanel").animate({
            "height": newHeight
        });
    }
    else
    {
        $("div.smuToolsPanel").css({
            height: newHeight
        });
    }

    /*
     $(".all_pages").css({
     paddingBottom: $("div.smuToolsPanel").height()
     });
     */
}

function selectAppView(viewInput)
{
    //console.log($(viewInput).attr('value'));
    $("div.smuToolsPanel .view_select").removeClass('ui-btn-active');
    $(viewInput).addClass('ui-btn-active');
    $("label[for='" + $(viewInput).attr("id") + "']").addClass('ui-btn-active');
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
    if (!window.location.hash)
    {
        if (document.height < window.outerHeight)
        {
            document.body.style.height = (window.outerHeight + 50) + 'px';
        }

        setTimeout(function() {
            window.scrollTo(0, 1);
        }, 50);
    }
}

$(document).ready(function() {
//$(document).on('pageinit', function() {

// Move the slider to the default closed position.
    pagePosition = 0;
    menuSlide();
    displayAppGrid();
    displayAppList();

    setTimeout(function( ) {
        // Force SMU Tools panel to close at start up
        $(document).ready(function() {
            pagePosition = 0;
            menuSlide();
            displayAppGrid();
            displayAppList();
        });
    }, 1000);

    $('#gription img').on('dragstart', function(event) {
        event.preventDefault();
    }); // Disable dragging gription image
    $(document).on('vmousedown', "div.smuToolsPanel [data-role='footer']", function(event) {
        //console.log("vmousedown");
        console.log(event.target);
        //alert("vmousedown");

        if (!$(event.target).hasClass("view_select_icons"))
        {

            startPosition = pagePosition;
            console.log("StartPosition:" + startPosition);

            var minToolsHeight = $("div.smuToolsPanel [data-role='footer']").height();

            //var maxToolsHeight = $(window).height() - $("div.smuToolsPanel .smu_tools_button").height();
            var windowHeight = window.innerHeight ? window.innerHeight : $(window).height();
            var maxToolsHeight = windowHeight - ($.mobile.activePage).find("div[data-role='header']").height();


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

            $(document).on('vmouseup', function() {
                console.log("vmouseup");
                if (scrollPrevented == true) {
                    //alert("should be able to scroll now!");
                    $('body').unbind('touchmove');
                    //$(document).off('touchmove');
                    scrollPrevented = false;
                }
                $(document).off('vmousemove', stopScroll());
                $(document).off('vmouseup' /*, stopScroll()*/);

            });

        }

    });


    $(document).on("click", "div.smuToolsPanel .app_view a", function() {
        //console.log("Clicked app view link");
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