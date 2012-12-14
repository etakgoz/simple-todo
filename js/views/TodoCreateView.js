(function(w, undefined){
    var MVC = w.MVC,
        App = w.App || {},
        document = w.document;
        
    /**
     * Creates a new TodoCreate View, which is responsible for creating new Todo items, and returns as a result
     * 
     * user User A User Model
     * todoController Controller Controller for the application
     * 
     */                    
    App.createTodoCreateView = function (user, todoController) {
        var todoCreateView = new MVC.View({
            id: "todo-create",
            el: "article",
            template: new MVC.Template({id: "todo-create-template"}),
            model: user
        }, todoController);
        
        // Define DOM is that is going to contain the todos that are going to hold todos created by this view. 
        // For simplicity it is currently just "todos", and can not be dynamically changed.
        todoCreateView.todosContainerId = "todos";


        // Handles clicking on "create todo interface", swtiches the state and displays the input box
        todoCreateView.addDOMEventListener("click", "", function (event) {
            if (todoCreateView.editing !== true) { // only if we are not already editing
                var view = todoCreateView.node.querySelector(".view"),
                    input = todoCreateView.node.querySelector("input");

                // Hide the label, and display the input box (and focus on it)   
                MVC.DOM.toggleClass(view, "hidden");
                MVC.DOM.toggleClass(input, "hidden");
                input.focus();
                
                // Get in to the editing mode
                todoCreateView.editing = true;
                
                // Publish to the controller that this control is focused
                todoController.publish("focus", {guid: todoCreateView.guid});             

                // Call this function if an another view gets focus, and hide the input
                todoCreateView.onAnotherFocus = function (data) {
                    todoCreateView.editing = false;
                    todoCreateView.render();
                }; 

                // Subscribe to the focus event, so we can fire onAnotherFocus function, it will be a one-time subscription
                todoController.subscribe("focus", todoCreateView.onAnotherFocus, true);
            }

        });


        // Handles the keyup event while a user is editing the create todo input
        todoCreateView.addDOMEventListener("keyup", "input", function (event) {
        var view = todoCreateView.node.querySelector(".view"),
            input = todoCreateView.node.querySelector("input");

            if (event.keyCode === MVC.KEYCODE_ENTER && input.value != "") { // Run if the user hit the enter and the input is not empty
                // Create a new Todo and corresponding TodoView 
                var todo = App.createTodoModel({
                    attributes: {
                        note: input.value, 
                        completed: ""
                    }
                }, App.todoController),
                    todoView = App.createTodoView(todo, App.todoController);

                // Render the child and append to the list    
                document.getElementById(todoCreateView.todosContainerId).appendChild(todoView.render());            

                // Get out of editing mode, hide the input box and show the label
                todoCreateView.editing = false;
                MVC.DOM.toggleClass(view, "hidden");
                MVC.DOM.toggleClass(input, "hidden");
                input.value = "";
                
                // Stop listening other focus events
                todoController.unsubscribe("focus", todoCreateView.onAnotherFocus);
                
                // Publish a new-todo created event
                todoController.publish("new-todo", todo);

            } else if (event.keyCode === MVC.KEYCODE_ESC) { // Escape hit during editing, interpret as cancel
                // Get oput of editing mode without creating a new todo item
                todoCreateView.editing = false;
                MVC.DOM.toggleClass(view, "hidden");
                MVC.DOM.toggleClass(input, "hidden");
                input.value = ""; 
                todoController.unsubscribe("focus", todoCreateView.onAnotherFocus);

            }
        });
        
       // Subscribe to the user model update 
       todoController.subscribe(user.guid + "_save", function () {
           // Re-render since we might need to update the action label
           todoCreateView.render();
       });
        
        return todoCreateView;
    }
    
    
    w.App = App;
})(window);


