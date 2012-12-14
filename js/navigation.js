(function(w, undefined){    
    var MVC = w.MVC,
        App = w.App || {}
        document = w.document;
    
    /**
     * Navigation class constructor
     * 
     * settings.id string DOM id of the navigation
     * settings.routes Object routes that our app going to navigate
     */
    App.Navigation = function (settings) {
        var navigation = this;
        this.id = settings.id;
        this.routes = settings.routes;

        // handle click event on navigator, seperate different elements via data-attribute
        document.getElementById(this.id).addEventListener("click", function (event) {
            event.preventDefault();
            var dataNavigation = event.target.getAttribute("data-navigation");
            if (settings.routes[dataNavigation] !== undefined) {
                var route = settings.routes[dataNavigation];
				// We need to check if the app is accessed as a local file, otherwise the site breaks
				if (!/^file:/i.test(window.location.href) && history && history.pushState) {
					// Push the state and run the route callback function, also update navigator's state itself				
					history.pushState(dataNavigation, route.title, "./" + route.relativeUrl);
				}
                route.callback();
                navigation.update(route.state);              
            }

            return false;
        }, false);
        
        // listen popstate event to handle back and forward cases
        w.addEventListener("popstate", function(event) {
            var dataNavigation = event.state,
                route = settings.routes[dataNavigation];
                
            if(route !== null &&  route != undefined && typeof route.callback === "function" ) {
                route.callback();
                navigation.update(route.state);
            }
        });
    };
    
    // Updates Navigator HTML
    App.Navigation.prototype.update =  function (state) {
        var currentNav = document.querySelector("#" + this.id + " .selected"),
            selectedNav = document.getElementById(this.id + "-" + state);

        MVC.DOM.removeClass(currentNav, "selected");
        MVC.DOM.addClass(selectedNav, "selected");        
    }
        
    w.App = App;
              
})(window);


