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
    App.createTodoView = function (todo, todoController) {
        var todoView = new MVC.View({
            el: "article",
            template: new MVC.Template({id: "todo-template"}),
            model: todo
        }, todoController);
                
        // Handles click on the label, which triggers editing the todo item
        todoView.addDOMEventListener("click", "label", function (event) {
            if (todoView.editing !== true) {    // Only run if we are not already in editing mode
                var view = todoView.node.querySelector(".view"),
                    input = todoView.node.querySelector("input");

                // Hide the label, show the input, focus on input and get in editing mode    
                MVC.DOM.toggleClass(view, "hidden");
                MVC.DOM.toggleClass(input, "hidden");
                input.focus();                
                todoView.editing = true;
                
                // Run this function if an another view gets focus
                todoView.onAnotherFocus = function (data) {
                    // get out of editing mode
                    todoView.editing = false;
                    todoView.render(); 
                };                
                
                // Publish to the controller that this control is focused
                todoController.publish("focus", {guid: todoView.guid});  
                
                // Subscribe to the focus event, so we can fire onAnotherFocus function, it will be a one-time subscription                
                todoController.subscribe("focus", todoView.onAnotherFocus, true);
            }

        });
        
        // Handles the keyup event while a user is editing a todo item
        todoView.addDOMEventListener("keyup", "input", function (event) {
            var input = todoView.node.querySelector("input"); 
            
            if (event.keyCode === MVC.KEYCODE_ENTER && input.value != "") { // Run if the user hit the enter and the input is not empty           
                // Update the todo model
                todo.set("note", input.value);
                todo.save();
                
                // Get out of editing mode
                todoView.editing = false;
                
                // Unsusbcribe from listening focus events
                todoController.unsubscribe("focus", todoView.onAnotherFocus);
            } else if (event.keyCode === MVC.KEYCODE_ESC) { // Escape hit during editing, interpret as cancel
                // Get out of editing mode
                todoView.editing = false;
                todoView.render();
                
                // Unsubscribe from listening focus events
                todoController.unsubscribe("focus", todoView.onAnotherFocus);
            }
        });
        
        // Handles click on delete icon
        todoView.addDOMEventListener("click", ".delete", function (event) {
            // Publish generic delete-todo message
            todoController.publish("delete-todo", todo);
            
            // Destory todo on localStorage, it also publishes a message for this particualar todo item too
            todo.destroy();
            
        });        
        
        // Handles clicking on complete icon
        todoView.addDOMEventListener("click", ".complete", function (event) {
            //toggle completed state
            if (todo.get("completed") === "completed") {
                todo.set("completed", "");
            } else {
                todo.set("completed", "completed");
            }
           
            todo.save();
        });

        // Handles drag start on todo
        todoView.addDOMEventListener("dragstart", "", function (event) {
            MVC.DOM.addClass(document.getElementById("todos"), "dragging");
            
            // Store the guids of the todo and the todoView that are dragged on dataTransfer property
            event.dataTransfer.setData("text/plain", JSON.stringify({draggedGuid: todo.guid, draggedView: todoView.guid}));           
            MVC.DOM.toggleClass(todoView.node, "dragged");            
            todoController.publish("focus", {guid: todoView.guid});
        });
        
        todoView.addDOMEventListener("dragend", "", function (todo, event) {
            MVC.DOM.removeClass(todoView.node, "dragged");
        });          

        // Handle various mouse/drag cases and update node class accordingly
        if (/chrome/i.test(w.navigator.appVersion)) { // Firefox does not handling bubbling of drag event well
            todoView.addDOMEventListener("dragenter", ".view", function (event) {
                MVC.DOM.addClass(todoView.node, "drag-enter");
            }); 
            
            todoView.addDOMEventListener("dragleave", ".view", function (event) {           
                //console.log("dragleave");
                MVC.DOM.removeClass(todoView.node, "drag-enter");
            });            
            
        }
     
        // We need to handle mouseover and mouseout manually because the way dragenter intervenes with them
        todoView.addDOMEventListener("mouseover", "", function (event) {           
            MVC.DOM.addClass(todoView.node, "hovered");           
        });        
         
        todoView.addDOMEventListener("mouseout", "", function (event) {           
            MVC.DOM.removeClass(todoView.node, "hovered");           
        });    
 
        // Handles drag drop
        todoView.addDOMEventListener("drop", "", function (event) {
            event.preventDefault();
 
            // Fetch data from event.dataTransfer and publish a new dragged-todo event so both the AppView and the User can update itself
            var data = JSON.parse(event.dataTransfer.getData("text/plain"));
            
            if (/chrome/i.test(w.navigator.appVersion)) {
                MVC.DOM.toggleClass(todoView.node, "drag-enter");                  
            }

            
            todoController.publish("dragged-todo", {
                draggedGuid: data.draggedGuid,
                droppedGuid: todo.guid,
                draggedView: data.draggedView,
                droppedView: todoView.guid
            });

        });

        // Listen associated todo model's save event and render todo when needed
        todoController.subscribe(todo.guid + "_save", function () {
            todoView.render();
        });
        
        // Listen assoicated todo model's destroy event and remove todo from DOM when needed
        todoController.subscribe(todo.guid + "_destroy", function () {
           if (todoView.node !== null && todoView.node !== undefined) {          
               if (todoView.node.parentNode !== null && todoView.node.parentNode !== undefined) {
                   todoView.node.parentNode.removeChild(todoView.node);                    
               }      
           } 
        });
    
        return todoView;
    }    
    
    w.App = App;
})(window);


