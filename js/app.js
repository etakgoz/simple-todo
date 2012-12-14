(function(w, undefined){    
    var MVC = w.MVC,
        App = w.App || {},
        document = w.document,
        todoController = App.todoController = new MVC.Controller(),
        user = App.getUserFromDataStore("user", todoController),
        todoAppModel = App.createTodoAppModel({
            guid: "app", 
            attributes: {
                author: "Tolga Akgoz", 
                authorEmail: "tolga.akgoz@gmail.com", 
                title: "My Todos"}
        }, todoController),
        todoAppView = App.createTodoAppView(todoAppModel, todoController);
        
    
    // Render the App
    todoAppView.renderApp(user, user.getTodos({}));
    
    
    // Define the Routes and create the navigator
    App.routes = {
        'all': {
            state: 'all',
            title: 'All Todos',
            relativeUrl: '',
            callback: function () {
                todoController.publish("app-statechange", "all");
            }
        },
        'completed': {
            state: 'completed',
            title: 'Completed Todos',
            relativeUrl: 'completed',
            callback: function () {                
                todoController.publish("app-statechange", "completed");                
            }            
        },
        'uncompleted': {
            state: 'uncompleted',
            title: 'Uncompleted Todos',
            relativeUrl: 'uncompleted',
            callback: function () {             
                todoController.publish("app-statechange", "uncompleted");                
            }            
        }
    };    
    
    // Create the navigator and we go!
    var navigator = new App.Navigation({id: "navigation", routes: App.routes});    
      
    
    w.App = App;
              
})(window);


