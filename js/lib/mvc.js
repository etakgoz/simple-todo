(function(w, undefined){
    var MVC = w.MVC || {},
        document = w.document;
    
    MVC.KEYCODE_ENTER = 13,
    MVC.KEYCODE_ESC = 27;
    
    // Global Object Cache Object
    // It will enable us to retrieve models/view via guid
    MVC.objectCache = {cache: {}};
    
    /**
     * Fetches an item from Global Object Cache (or Permemnant Store)
     *
     * guid string Guid of item to fetch 
     */
    MVC.objectCache.get = function (guid) {
        if (this.cache[guid] === undefined) {
            return MVC.Store.get(guid);
        } else {
            return this.cache[guid];
        }
    };
    
    /**
     * Sets an item at Global Object Cache
     * 
     * guid string Guid of item to set
     * value Object Reference to object
     * 
     */
    MVC.objectCache.set = function (guid, value) {
        this.cache[guid] = value;
    };
    
    /**
     * Model constructor
     * 
     * settings.guid string Optional parameter, should be a unique identifier, automatically set if not provided
     * settings.attributes Object An object that contains model attributes
     * controller MVC.Controller Controller object for the application
     */
    MVC.Model = function (settings, controller) {
        if (settings.guid === undefined) {
            this.guid = MVC.Store.getID();            
        } else {
            this.guid = settings.guid;
        }

        this.attributes = settings.attributes;
        this.controller = controller;
        
        MVC.objectCache.set(this.guid, this);
    };

    /**
     * Saves model permanently via MVC.Store. Fires this_guid+'_save' event. Returns itself to enable chaining
     */
    MVC.Model.prototype.save = function () {
        MVC.Store.set(this.guid, {guid: this.guid, attributes: this.attributes});
        this.controller.publish(this.guid + '_save', this);
        return this;
    };

    /**
     * Deletes model permanently from MVC.Store. Fires this_guid+'_destroy' event
     */
    MVC.Model.prototype.destroy = function () {
        MVC.Store.remove(this.guid); 
        this.controller.publish(this.guid + '_destroy', this);        
    };

    /**
     * Returns Models' attribute "attr". null if it does not exist
     */
    MVC.Model.prototype.get = function (attr) {
        return this.attributes[attr];
    };

    /**
     * Sets Models' attribute "attr" to value. Returns itself to enable chaining
     */
    MVC.Model.prototype.set = function (attr, value) {
        this.attributes[attr] = value;          
        return this;
    };

    /**
     * View Constructor
     * 
     * settings.guid string Optional parameter, should be a unique identifier, automatically set if not provided
     * settings.id string DOM id of the view, guid used if no id provided
     * settings.el string type of HTML element that is going to hold this view
     * settings.defaultTemplate MVC.Template Template object to render the View accordingly
     * settings.model MVC.Model (Optional) Model object that is assoicated with this view
     */
    MVC.View = function (settings) {
        if (settings.guid === undefined) {
            this.guid = MVC.Store.getID();            
        } else {
            this.guid = settings.guid;
        }
        
        this.el = settings.el;
        this.defaultTemplate = settings.template;
        this.model = settings.model;

        // Create HTML Element that is going to hold this view
        this.node = document.createElement(this.el);
        if (settings.id !== undefined) {
            this.node.id = settings.id;           
        } else {
            this.node.id = this.guid;
        }
        
        MVC.objectCache[this.guid] = this;

    };

    /**
     * Adds a new DOM event listener to View's node property.
     * 
     * eventName string Name of the DOM event (click, keypress, mouseover)
     * selector string Selector Expression to filter out the actual element that handles the event. The bubbled event is filtered by this selector expression and the callback function runs accordingly.
     * callback function Callback function to run
     */
    MVC.View.prototype.addDOMEventListener = function (eventName, selector, callback) {

        var node = this.node;
        this.node.addEventListener(eventName, function (event) {
            if (selector === '') {
                callback(event);
            } else {
                var nodeList = node.querySelectorAll(selector);
                for (var i = 0, len = nodeList.length; i < len; i += 1) {
                    if(nodeList[i] == event.target) {
                        callback(event);
                    }
                }
            }    
        }, false);
    };

    /**
     * Renders the view by updating the View's node element's innerHTML
     * 
     * template MVC.Template (Optional) Template object to render the View accordingly. Otherwise defaultTemplate is used
     */
    MVC.View.prototype.render = function (template) {
        var renderedHTML = '';
        
        if (template === undefined) {
            template = this.defaultTemplate;
        } 

        if (this.model !== undefined) {
            renderedHTML = template.render(this.model.attributes);             
        } else {
            renderedHTML = template.render({});                
        }
        
        // Only modify DOM if there is a change!
        if (this.node.innerHTML !== renderedHTML) {
            this.node.innerHTML = renderedHTML; 
        }

        return this.node;
    };

    /**
     * Controller object to facilitate communication between models and views.
     */
    MVC.Controller = function (settings) {
        this.eventHandlers = {};
    };

    /**
     * Subscribe to an event that is going to be fired by controller. Not DOM!
     * 
     * eventName string Name of the event
     * callback function Callback function to run
     * once boolean If set to true, the function is unsubscribed after receiving the event once 
     */
    MVC.Controller.prototype.subscribe = function (eventName, callback, once) {
        if (this.eventHandlers[eventName] === undefined) {
            this.eventHandlers[eventName] = [];
        }

        if (once === undefined) {
            once = false;
        }

        this.eventHandlers[eventName].push({"callback": callback, "once": once}); 
    };

    /**
     * Publishes a new event via controller
     * 
     * eventName string Name of the evet
     * data mixed Data to provide to callback function
     */
    MVC.Controller.prototype.publish = function (eventName, data) {
        if (this.eventHandlers[eventName] !== undefined) {
            var eventHandlers = this.eventHandlers[eventName];
            for (var i = 0, len = eventHandlers.length; i < len; i += 1) {
                eventHandlers[i].callback(data);
                if (eventHandlers[i].once === true) {
                    eventHandlers.splice(i, 1);
                }
            }             
        }         
    };     

    /**
     * Unsubscribes a callback function from a specific event
     * 
     * eventName string Name of the event
     * callback function Callback function
     */
    MVC.Controller.prototype.unsubscribe = function (eventName, callback) {
    if (this.eventHandlers[eventName] !== undefined) {
            var eventHandlers = this.eventHandlers[eventName];
            for (var i = 0, len = eventHandlers.length; i < len; i += 1) {
                if (eventHandlers[i].callback === callback) {
                    eventHandlers.splice(i, 1);
                    break;
                }
            }
        }          
    };

    /**
     * DOM namespace for DOM helper functions
     */
    MVC.DOM = MVC.DOM || {};

    /**
     * Toggles the className attribute for a specific element
     * 
     * el DOMElement DOM Element to toggle the class
     * className string Class Name
     */
    MVC.DOM.toggleClass = function (el, className) {
        var classNames = el.className ? el.className.split(" ") : [],
            exists = false,
            newClassString = "";

        for (var i = 0, len = classNames.length; i < len; i += 1) {
            if (classNames[i] === className) {
                exists = true;
            } else {
                newClassString += classNames[i] + " ";
            }
        }

        if (!exists) {
            newClassString += className; 
        }

        el.className = newClassString;

    };
    
    /**
     * Adds a class to the className attribute of a specific element
     * 
     * el DOMElement DOM Element to add the class
     * className string Class Name
     */    
    MVC.DOM.addClass = function (el, className) {
        var classNames = el.className ? el.className.split(" ") : [],
            exists = false,
            newClassString = "";

        for (var i = 0, len = classNames.length; i < len; i += 1) {
            if (classNames[i] === className) {
                exists = true;
            } else {
                newClassString += classNames[i] + " ";
            }
        }

        if (!exists) {
            newClassString += className; 
        }

        el.className = newClassString;

    };

    /**
     * Remove a class from the className attribute of a specific element
     * 
     * el DOMElement DOM Element to add the class
     * className string Class Name
     */ 
    MVC.DOM.removeClass = function (el, className) {        
        var classNames = el.className ? el.className.split(" ") : [],
            exists = false,
            newClassString = "";

        for (var i = 0, len = classNames.length; i < len; i += 1) {
            if (classNames[i] !== className) {
                newClassString += classNames[i] + " ";
            }
        }

        el.className = newClassString;
    };    

    w.MVC = MVC;
        
})(window);




