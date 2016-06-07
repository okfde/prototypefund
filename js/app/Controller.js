(function(window){

    Controller.prototype.constructor = Controller;
    Controller.prototype = {
        val0 : '',
        val1 : ''
    };
    
    var ref, paperView;
    function Controller(){
        ref = this;

        Logger.useDefaults();
        //Logger.setLevel(Logger.OFF);

    };

    Controller.prototype.init = function(){

        paperView = new PaperView(this);
        paperView.init();


    };

    window.Controller = Controller;

}(window));
