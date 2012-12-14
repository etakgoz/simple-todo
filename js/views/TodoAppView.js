(function(w, undefined){
    var MVC = w.MVC,
        App = w.App ||{},
        document = w.document;
        
    /**
     * Creates a new Todo View, which is responsible for viewing Todo items, and returns as a result
     * 
     * todo Todo A Todo Model
     * todoController Controller Controller for the application
     * 
     */                           
    App.createTodoAppView = function (app, todoController) {
        var todoAppView = new MVC.View({
            el: "div",
            id: "app",
            template: new MVC.Template({id: "app-template"}),
            model: app
        }, todoController);
        
        // Define DOM ID that is going to contain the todos that are going to hold todos created by this view. 
        // For simplicity it is currently just "todos", and can not be dynamically changed.
        todoAppView.todosContainerId = "todos";        
        
        /**
         * Renders todos
         * 
         * todos Array array of guids
         */
        todoAppView.renderTodos = function(todos) {
            var containerEl  = document.getElementById(todoAppView.todosContainerId),
                docFrag = document.createDocumentFragment();
            
            for (var i = 0, len = todos.length; i < len; i += 1) {
                var todoData = MVC.objectCache.get(todos[i]),
                    todo = null,
                    todoView = null;

                if (todoData !== null) {
                    todo = App.createTodoModel(todoData, todoController),
                    todoView = App.createTodoView(todo, todoController);
                    docFrag.appendChild(todoView.render());             
                } else {
                    todos.splice(i, 1);
                }          
            }
            
            containerEl.innerHTML = '';
            containerEl.appendChild(docFrag);
        };
        
        /*
         * Renders the whole app
         * 
         * user User    User Model
         * todos Array  Array of guids  
         */
        todoAppView.renderApp = function (user, todos) {
            var todoCreateView = App.createTodoCreateView(user, App.todoController);
            
            document.querySelector("body").appendChild(this.render()); // render the app
            this.renderTodos(todos);
            document.getElementById("controls").appendChild(todoCreateView.render());
        };
        
        // Subscribe to dragged-todo event, Fired when dragging completed succesfully
        todoController.subscribe("dragged-todo", function(data){
            
            var draggedView = document.getElementById(data.draggedView),
                droppedView = document.getElementById(data.droppedView);

            draggedView.parentNode.insertBefore(draggedView, droppedView);

        });          
        
        // Subscribe to the app-statechange event, which is fired when user navigates
        todoController.subscribe("app-statechange", function(state){
            var user = MVC.objectCache.get("user");
            
            // Render relevant todos
            if (state === 'all') {
                todoAppView.renderTodos(user.getTodos({}));               
            } else if (state === 'completed') {
                todoAppView.renderTodos(user.getTodos({completed: "completed"}));                
            } else if (state === 'uncompleted') {
                todoAppView.renderTodos(user.getTodos({completed: ""}));    
            }
            
            // Put the state information in className of the object that is at the top of the hierarchy
            MVC.DOM.removeClass(document.getElementById("app"), "state-" + todoAppView.appState); 
            todoAppView.appState = state;
            MVC.DOM.addClass(document.getElementById("app"), "state-" + state); 
            
            
             // TODO: Think of stroing it as a attribute in app and retrieving from locaStorage so the state is always saved

        });        
                    
        return todoAppView;
    }    
    
    w.App = App;
})(window);


