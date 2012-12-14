(function(w, undefined){
    var MVC = w.MVC || {},
        document = w.document;
     
    /**
     * Generate four random hex digits. 
     * NOTE: Taken from backbone-store
     */
    function S4() {
        return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
    };

    
    /**
     * Generate a pseudo-GUID by concatenating random hexadecimal.
     * NOTE: Taken from backbone-store
     */
    function guid() {
        return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
    };     
    
    /**
     * MVC.Stroe Object (not Constructor!)
     * 
     */
    MVC.Store = {
        storageNameSpace: "MVC"
    };
    
    /**
     * Sets the storageNameSpace, all the stored data will be prefixed by this string. (to avoid mixup)
     * 
     * str string Namespace
     */
    MVC.Store.setStorageNameSpace = function (str) {
        this.storageNameSpace = str;
    }
    
    /**
     * Return a newly generated globally unique identifier
     */
    MVC.Store.getID = function () {
        return guid();
    };

    /**
     * Sets to value of an item identified by id
     * 
     * id string guid of the item
     * value mixed value to be set (will be sotred as JSON and then parsed back during get)
     */
    MVC.Store.set = function (id, value) {
        w.localStorage.setItem(this.storageNameSpace + "-" + id, JSON.stringify(value));
    };
    
    
    /**
     * Returns the value of the item globally identified by id, otherwise null
     * 
     * id string guid of the item
     */
    MVC.Store.get = function (id) {
        return JSON.parse(w.localStorage.getItem(this.storageNameSpace + "-" + id));
    };
    
    /**
     * Removes an item from the storage
     * 
     * id string guid of the item
     */
    MVC.Store.remove = function (id) {
        return w.localStorage.removeItem(this.storageNameSpace + "-" + id);
    };
    
             
    w.MVC = MVC;
})(window);

