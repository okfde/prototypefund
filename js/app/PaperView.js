/**
 * Author: CReich
 * Company: Rainbow Unicorn
 * Date: 07.06.2016
 * Created: 11:44
 **/
(function(window){

    PaperView.prototype.constructor = PaperView;
    PaperView.prototype = {
        val0 : '',
        val1 : ''
    };
    
    var ref, controller, pPath, pYellow, pRed;
    function PaperView(pController){
        ref = this;
        controller = pController;

        //setup paper to global scope
        paper.install(window);

    };

    PaperView.prototype.init = function(){

        paper.setup('paperCanvas');

        //fetch P path from and store it
        var options = { expandShapes: true };
        pPath = ref.fetchSvgItemFromDom(document.getElementById('svg-p'), options );

        pYellow = pPath.place();
        pYellow.name = 'yellow';
        pYellow.fillColor = '#ff0000';
        pYellow.scale(5);
        pYellow.position.x = $(window).width()/2;
        pYellow.position.y = $(window).height()/2;
        view.update();

        console.log(project.activeLayer.children)

        var len = 1;
        view.onFrame = function(event) {
            var item = project.activeLayer.children['yellow'];
            //console.log(item.segments);
            if(item) item.rotate(3);
        };


        /*
        var path = new Path();
        path.strokeColor = 'black';
        var start = new Point(100, 100);
        path.moveTo(start);
        path.lineTo(start.add([ 200, -50 ]));
        view.draw();*/

    };

    PaperView.prototype.fetchSvgItemFromDom = function(elem){
        var a = new Symbol(project.importSVG(elem));
        elem.parentNode.removeChild(elem);
        return a;
    };

    window.PaperView = PaperView;

}(window));
