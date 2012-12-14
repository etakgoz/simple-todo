(function(w, undefined){
    var MVC = w.MVC,
        App = w.App || {},
        document = w.document;
    
    /**
     * Creates a new Todo item, stores permanently, and returns the Todo Model
     * The Todo has the following attributes with the following valid values: 
     * note (string), completed (""| "completed")
     * 
     * settings Object Holds the necessary information for Todo. settings.guid (Optional) and settings.attributes 
     * todoController MV.Controller application controller
     */    
    App.createTodoAppModel = function (settings, todoController) {
        var app = new MVC.Model({
            guid: settings.guid,
            attributes: settings.attributes
        }, todoController);
   
        return app;
          
    };
        
    w.App = App;
})(window);


