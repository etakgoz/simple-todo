(function(w, undefined){
    var MVC = w.MVC || {},
        document = w.document;
    
    /**
     * Template object
     * 
     * settings.id string Id of the template DOM id to fetch the template content
     */
    MVC.Template = function (settings) {
        this.id = settings.id;
    };
    
    /**
     * Renders the template using the attributes and the guid
     *
     * attributes Object Each property will be inserted to places on the template having the name %property% or escaped version %propertyEscaped%
     * guid string guid, can be accessed via %guid%
     */
    MVC.Template.prototype.render = function (attributes, guid) {
        var templateStr = document.getElementById(this.id).textContent,
            div = document.createElement("div"),
            escapedStr = '',
            re = '';
        
        for (var i in attributes) {
            if (attributes.hasOwnProperty(i)) {
                re = new RegExp("%" + i + "%", "g");
                templateStr = templateStr.replace(re, attributes[i]);
                
                // Create an escaped version of the propert by escaping single and double quotes
                re = new RegExp("%" + i + "Escaped%", "g");
                escapedStr = attributes[i].toString().replace(/'/g, "&#39;");
                escapedStr = attributes[i].toString().replace(/"/g, "&#34;");
                
                templateStr = templateStr.replace(re, escapedStr);                
            }
        }
        
       templateStr = templateStr.replace(/%guid%/g, guid);                                 
       return templateStr;
    };
   
   
    w.MVC = MVC;
})(window);


