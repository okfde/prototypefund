/**
 * Author: CReich
 * Company: Rainbow Unicorn
 * Date: 07.06.2016
 * Created: 11:44
 **/
(function(window){

    PaperView.prototype.constructor = PaperView;
    PaperView.prototype = {
        char_move_ease: 15,
        char_move_offset: 35,
        p_path_red_outer : 'M52.6-189.9l43.8,5.6l53.6,90.8L96.6,2C96.6,2,37,17.7,14,23.3l-52.5,0l0,134.7l53,17.4l-1.1,14.6l-86-1.1l-75.8,1.1l-1.6-14.6l42.8-17.4l0-318.5l-42.8-14.8l1.6-14.6L52.6-189.9z',
        p_path_red_inner : 'M-38.5-4l39,7.8l75.9-50.7l19-40.8l-19-39.2l-71-39.4l-43.8,3.8L-38.5-4z',
        p_path_yellow_outer : 'M66.8-172l43.8,5.6l53.6,90.8L110.7,20c0,0-59.6,15.7-82.5,21.2h-52.5v146.1l23.2,9.5L27.8,208l-86.1-1.1l-75.8,1.1l20.8-10.3l20.3-10.3l0.3-316.7l-20.7-22l-20.8-20.7H66.8z',
        p_path_yellow_inner : 'M-24.3,21.8h39l75.9-50.6l18.9-40.8l-18.9-39.3l-71-47.3l-43.9,3.8L-24.3,21.8z'
    };
    
    var ref, controller, tools, $canvas, tl_outer_yellow, tl_inner_yellow, tl_outer_red, tl_inner_red,
        layer_1, path_y_outer, path_y_inner, path_y_outer_segments, path_y_inner_segments,
        path_r_outer, path_r_inner, path_r_outer_segments, path_r_inner_segments,
        groupY, groupR, container, type, containerInitX, containerInitY, speed,
        mousePercX, mousePercY, mouseMoveActive,hitOptions, clicked_segment;
    function PaperView(pController){
        ref = this;
        controller = pController;

        hitOptions = {
            segments: true,
            stroke: true,
            fill: true,
            tolerance: 25
        };

        //setup paper to global scope
        paper.install(window);

        mousePercX = mousePercY = 0;

    };

    PaperView.prototype.init = function(){

        paper.setup('paperCanvas');

        $canvas = $('#paperCanvas');

        layer_1 = new Layer();
        layer_1.name = 'layer_1';
        layer_1.activate();

        //yellow
        var pathData = ref.p_path_yellow_outer;
        path_y_outer = new Path(pathData);
        path_y_outer.fillColor = '#d6ff00';

        pathData = ref.p_path_yellow_inner;
        path_y_inner = new Path(pathData);
        path_y_inner.fillColor = 'white';

        //red
        pathData = ref.p_path_red_outer;
        path_r_outer = new Path(pathData);
        path_r_outer.fillColor = 'red';

        pathData = ref.p_path_red_inner;
        path_r_inner = new Path(pathData);
        path_r_inner.fillColor = 'white';



        // Create a group from the two paths:
        groupY = new Group([path_y_outer, path_y_inner]);
        groupY.name = 'groupY';
        groupY.nativeX = 0;
        groupY.nativeY = 0;

        groupR = new Group([path_r_outer, path_r_inner]);
        groupR.name = 'groupR';
        groupR.nativeX = -20;
        groupR.nativeY = 18;
        groupR.position.x = groupR.nativeX;
        groupR.position.y = groupR.nativeY;
        groupR.blendMode = 'multiply';
        groupR.opacity = 0.85;

        container = new Group([groupY, groupR]);
        container.position.x = $(window).width()/2;
        container.position.y = $(window).height()/2;
        container.scale(1.5);

        containerInitX = container.position.x;
        containerInitY = container.position.y;

        //Logger.log("containerInitX -> " + containerInitX);
        //Logger.log("containerInitY -> " + containerInitY);

        //clone segments outer
        path_y_outer_segments = [];
        for(var a=0; a< path_y_outer.segments.length; ++a){
            var s = new Segment();
            s.point = new Point(path_y_outer.segments[a].point.x,path_y_outer.segments[a].point.y)
            s.handleIn = new Point(path_y_outer.segments[a].handleIn.x,path_y_outer.segments[a].handleIn.y)
            path_y_outer_segments.push(s);
        }

        //clone segments inner
        path_y_inner_segments = [];
        for(var a=0; a< path_y_inner.segments.length; ++a){
            var s = new Segment();
            s.point = new Point(path_y_inner.segments[a].point.x,path_y_inner.segments[a].point.y)
            s.handleIn = new Point(path_y_inner.segments[a].handleIn.x,path_y_inner.segments[a].handleIn.y)
            path_y_inner_segments.push(s);
        }

        //clone segments outer
        path_r_outer_segments = [];
        for(a=0; a< path_r_outer.segments.length; ++a){
            s = new Segment();
            s.point = new Point(path_r_outer.segments[a].point.x,path_r_outer.segments[a].point.y)
            s.handleIn = new Point(path_r_outer.segments[a].handleIn.x,path_r_outer.segments[a].handleIn.y)
            path_r_outer_segments.push(s);
        }

        //clone segments inner
        path_r_inner_segments = [];
        for(var a=0; a< path_r_inner.segments.length; ++a){
            var s = new Segment();
            s.point = new Point(path_r_inner.segments[a].point.x,path_r_inner.segments[a].point.y)
            s.handleIn = new Point(path_r_inner.segments[a].handleIn.x,path_r_inner.segments[a].handleIn.y)
            path_r_inner_segments.push(s);
        }

        Logger.log("path_y_outer_segments -> " + path_y_outer_segments.length);
        Logger.log("path_y_inner_segments -> " + path_y_inner_segments.length);
        Logger.log("path_r_outer_segments -> " + path_r_outer_segments.length);
        Logger.log("path_r_inner_segments -> " + path_r_inner_segments.length);

        //expand outer yellow to full window size
        var area = Math.floor(path_y_outer.segments.length/4);
        Logger.log("area -> " + area);
        var index = 0;
        var block = 0;

        for(var a=0; a< path_y_outer.segments.length; ++a){
            if(index < area){

                var seg = path_y_outer.segments[a];

                //Logger.log("a -> " + a + ", index -> " + index + ", block -> " + block);

                if(block == 0){
                    //top
                    seg.point = new Point(index*(view.bounds.width/4),0);

                    //Logger.log(seg.point + ", top");

                } else if(block == 1){
                    //right
                    seg.point = new Point(view.bounds.width,index*(view.bounds.height/4));

                    //Logger.log(seg.point + ", right");

                } else if(block == 2){
                    //bottom
                    seg.point = new Point((area-index)*(view.bounds.width/4),view.bounds.height);

                    //Logger.log(seg.point + ", bottom");

                } else if(block == 3){
                    //left
                    //Logger.log("left " + a);
                    seg.point = new Point(0,(area-index)*(view.bounds.height/4));


                } else {
                    //offet
                    Logger.log("offset " + a);
                }


                index++;
                if(index==area){
                    block++;
                    index=0;
                }

            }

        }

        //shrink inner yellow to center
        for(a=0; a< path_y_inner.segments.length; ++a){
            seg = path_y_inner.segments[a];
            seg.point = view.center;
        }

        //shrink inner red to center
        for(a=0; a< path_r_inner.segments.length; ++a){
            seg = path_r_inner.segments[a];
            seg.point = view.center;
        }

        //expand outer red to full window size
        area = Math.floor(path_r_outer.segments.length/4);
        index = 0;
        block = 0;

        for(a=0; a< path_r_outer.segments.length; ++a){
            if(index < area){

                var seg = path_r_outer.segments[a];

                //Logger.log("a -> " + a + ", index -> " + index + ", block -> " + block);

                if(block == 0){
                    //top
                    seg.point = new Point(index*(view.bounds.width/4),0);

                    //Logger.log(seg.point + ", top");

                } else if(block == 1){
                    //right
                    seg.point = new Point(view.bounds.width,index*(view.bounds.height/4));

                    //Logger.log(seg.point + ", right");

                } else if(block == 2){
                    //bottom
                    seg.point = new Point((area-index)*(view.bounds.width/4),view.bounds.height);

                    //Logger.log(seg.point + ", bottom");

                } else if(block == 3){
                    //left
                    //Logger.log("left " + a);
                    seg.point = new Point(0,(area-index)*(view.bounds.height/4));


                } else {
                    //offet
                    Logger.log("offset " + a);
                }


                index++;
                if(index==area){
                    block++;
                    index=0;
                }

            }

        }

        //need to be added manually in JS
        view.onFrame = function(event) {
            if(mouseMoveActive){

                var yellow_endX = (containerInitX + groupY.nativeX) + (mousePercX*ref.char_move_offset);
                var yellow_endY = (containerInitY + groupY.nativeY) + (mousePercY*ref.char_move_offset);

                var red_endX = (containerInitX + groupR.nativeX) + (mousePercX*ref.char_move_offset)*-1;
                var red_endY = (containerInitY + groupR.nativeY) + (mousePercY*ref.char_move_offset)*-1;

                groupY.position.x += (yellow_endX-groupY.position.x)/ref.char_move_ease;
                groupY.position.y += (yellow_endY-groupY.position.y)/ref.char_move_ease;

                groupR.position.x += (red_endX-groupR.position.x)/ref.char_move_ease;
                groupR.position.y += (red_endY-groupR.position.y)/ref.char_move_ease;

            }
        };

        //need to be added that shit works
        view.onResize = function(event) {
            container.position.x = $(window).width()/2;
            container.position.y = $(window).height()/2;
        };

        speed = 0.2;
        tl_outer_yellow = new TimelineMax({delay:0.25, paused:true, onComplete:ref.onPathYellowOuterComplete})
            .to(path_y_outer.segments[0].point, speed, {x:path_y_outer_segments[0].point.x, y:path_y_outer_segments[0].point.y, ease:Sine.easeOut})
            .to(path_y_outer.segments[1].point, speed, {x:path_y_outer_segments[1].point.x, y:path_y_outer_segments[1].point.y, ease:Sine.easeOut},'-=0.1')
            .to(path_y_outer.segments[2].point, speed, {x:path_y_outer_segments[2].point.x, y:path_y_outer_segments[2].point.y, ease:Sine.easeOut},'-=0.1')
            .to(path_y_outer.segments[3].point, speed, {x:path_y_outer_segments[3].point.x, y:path_y_outer_segments[3].point.y, ease:Sine.easeOut},'-=0.1')
            .to(path_y_outer.segments[4].point, speed, {x:path_y_outer_segments[4].point.x, y:path_y_outer_segments[4].point.y, ease:Sine.easeOut},'-=0.1')
            .to(path_y_outer.segments[5].point, speed, {x:path_y_outer_segments[5].point.x, y:path_y_outer_segments[5].point.y, ease:Sine.easeOut},'-=0.1')
            .to(path_y_outer.segments[6].point, speed, {x:path_y_outer_segments[6].point.x, y:path_y_outer_segments[6].point.y, ease:Sine.easeOut},'-=0.1')
            .to(path_y_outer.segments[7].point, speed, {x:path_y_outer_segments[7].point.x, y:path_y_outer_segments[7].point.y, ease:Sine.easeOut},'-=0.1')
            .to(path_y_outer.segments[8].point, speed, {x:path_y_outer_segments[8].point.x, y:path_y_outer_segments[8].point.y, ease:Sine.easeOut},'-=0.1')
            .to(path_y_outer.segments[9].point, speed, {x:path_y_outer_segments[9].point.x, y:path_y_outer_segments[9].point.y, ease:Sine.easeOut},'-=0.1')
            .to(path_y_outer.segments[10].point, speed, {x:path_y_outer_segments[10].point.x, y:path_y_outer_segments[10].point.y, ease:Sine.easeOut},'-=0.1')
            .to(path_y_outer.segments[11].point, speed, {x:path_y_outer_segments[11].point.x, y:path_y_outer_segments[11].point.y, ease:Sine.easeOut},'-=0.1')
            .to(path_y_outer.segments[12].point, speed, {x:path_y_outer_segments[12].point.x, y:path_y_outer_segments[12].point.y, ease:Sine.easeOut},'-=0.1')
            .to(path_y_outer.segments[13].point, speed, {x:path_y_outer_segments[13].point.x, y:path_y_outer_segments[13].point.y, ease:Sine.easeOut},'-=0.1')
            .to(path_y_outer.segments[14].point, speed, {x:path_y_outer_segments[14].point.x, y:path_y_outer_segments[14].point.y, ease:Sine.easeOut},'-=0.1')
            .to(path_y_outer.segments[15].point, speed, {x:path_y_outer_segments[15].point.x, y:path_y_outer_segments[15].point.y, ease:Sine.easeOut},'-=0.1')

        tl_inner_yellow = new TimelineMax({delay:0, paused:true, onComplete:ref.onPathYellowInnerComplete})
            .set($canvas,{autoAlpha:0})
            .to($canvas, 0.25, {autoAlpha:1, ease:Sine.easeOut})
            .to(path_y_inner.segments[0].point, speed, {delay:0.5, x:path_y_inner_segments[0].point.x, y:path_y_inner_segments[0].point.y, ease:Sine.easeOut})
            .to(path_y_inner.segments[1].point, speed, {x:path_y_inner_segments[1].point.x, y:path_y_inner_segments[1].point.y, ease:Sine.easeOut},'-=0.1')
            .to(path_y_inner.segments[2].point, speed, {x:path_y_inner_segments[2].point.x, y:path_y_inner_segments[2].point.y, ease:Sine.easeOut},'-=0.1')
            .to(path_y_inner.segments[3].point, speed, {x:path_y_inner_segments[3].point.x, y:path_y_inner_segments[3].point.y, ease:Sine.easeOut},'-=0.1')
            .to(path_y_inner.segments[4].point, speed, {x:path_y_inner_segments[4].point.x, y:path_y_inner_segments[4].point.y, ease:Sine.easeOut},'-=0.1')
            .to(path_y_inner.segments[5].point, speed, {x:path_y_inner_segments[5].point.x, y:path_y_inner_segments[5].point.y, ease:Sine.easeOut},'-=0.1')
            .to(path_y_inner.segments[6].point, speed, {x:path_y_inner_segments[6].point.x, y:path_y_inner_segments[6].point.y, ease:Sine.easeOut},'-=0.1')

        tl_outer_red = new TimelineMax({delay:0, paused:true, onComplete:ref.onPathRedOuterComplete})
            .to(path_r_outer.segments[0].point, speed, {x:path_r_outer_segments[0].point.x, y:path_r_outer_segments[0].point.y, ease:Sine.easeOut})
            .to(path_r_outer.segments[1].point, speed, {x:path_r_outer_segments[1].point.x, y:path_r_outer_segments[1].point.y, ease:Sine.easeOut},'-=0.1')
            .to(path_r_outer.segments[2].point, speed, {x:path_r_outer_segments[2].point.x, y:path_r_outer_segments[2].point.y, ease:Sine.easeOut},'-=0.1')
            .to(path_r_outer.segments[3].point, speed, {x:path_r_outer_segments[3].point.x, y:path_r_outer_segments[3].point.y, ease:Sine.easeOut},'-=0.1')
            .to(path_r_outer.segments[4].point, speed, {x:path_r_outer_segments[4].point.x, y:path_r_outer_segments[4].point.y, ease:Sine.easeOut},'-=0.1')
            .to(path_r_outer.segments[5].point, speed, {x:path_r_outer_segments[5].point.x, y:path_r_outer_segments[5].point.y, ease:Sine.easeOut},'-=0.1')
            .to(path_r_outer.segments[6].point, speed, {x:path_r_outer_segments[6].point.x, y:path_r_outer_segments[6].point.y, ease:Sine.easeOut},'-=0.1')
            .to(path_r_outer.segments[7].point, speed, {x:path_r_outer_segments[7].point.x, y:path_r_outer_segments[7].point.y, ease:Sine.easeOut},'-=0.1')
            .to(path_r_outer.segments[8].point, speed, {x:path_r_outer_segments[8].point.x, y:path_r_outer_segments[8].point.y, ease:Sine.easeOut},'-=0.1')
            .to(path_r_outer.segments[9].point, speed, {x:path_r_outer_segments[9].point.x, y:path_r_outer_segments[9].point.y, ease:Sine.easeOut},'-=0.1')
            .to(path_r_outer.segments[10].point, speed, {x:path_r_outer_segments[10].point.x, y:path_r_outer_segments[10].point.y, ease:Sine.easeOut},'-=0.1')
            .to(path_r_outer.segments[11].point, speed, {x:path_r_outer_segments[11].point.x, y:path_r_outer_segments[11].point.y, ease:Sine.easeOut},'-=0.1')
            .to(path_r_outer.segments[12].point, speed, {x:path_r_outer_segments[12].point.x, y:path_r_outer_segments[12].point.y, ease:Sine.easeOut},'-=0.1')
            .to(path_r_outer.segments[13].point, speed, {x:path_r_outer_segments[13].point.x, y:path_r_outer_segments[13].point.y, ease:Sine.easeOut},'-=0.1')
            .to(path_r_outer.segments[14].point, speed, {x:path_r_outer_segments[14].point.x, y:path_r_outer_segments[14].point.y, ease:Sine.easeOut},'-=0.1')
            .to(path_r_outer.segments[15].point, speed, {x:path_r_outer_segments[15].point.x, y:path_r_outer_segments[15].point.y, ease:Sine.easeOut},'-=0.1')

        tl_inner_red = new TimelineMax({delay:0, paused:true, onComplete:ref.onPathRedInnerComplete})
            .set($canvas,{autoAlpha:0})
            .to($canvas, 1, {autoAlpha:1, ease:Sine.easeOut})
            .to(path_r_inner.segments[0].point, speed, {delay:0.5, x:path_r_inner_segments[0].point.x, y:path_r_inner_segments[0].point.y, ease:Sine.easeOut})
            .to(path_r_inner.segments[1].point, speed, {x:path_r_inner_segments[1].point.x, y:path_r_inner_segments[1].point.y, ease:Sine.easeOut},'-=0.1')
            .to(path_r_inner.segments[2].point, speed, {x:path_r_inner_segments[2].point.x, y:path_r_inner_segments[2].point.y, ease:Sine.easeOut},'-=0.1')
            .to(path_r_inner.segments[3].point, speed, {x:path_r_inner_segments[3].point.x, y:path_r_inner_segments[3].point.y, ease:Sine.easeOut},'-=0.1')
            .to(path_r_inner.segments[4].point, speed, {x:path_r_inner_segments[4].point.x, y:path_r_inner_segments[4].point.y, ease:Sine.easeOut},'-=0.1')
            .to(path_r_inner.segments[5].point, speed, {x:path_r_inner_segments[5].point.x, y:path_r_inner_segments[5].point.y, ease:Sine.easeOut},'-=0.1')
            .to(path_r_inner.segments[6].point, speed, {x:path_r_inner_segments[6].point.x, y:path_r_inner_segments[6].point.y, ease:Sine.easeOut},'-=0.1')
        
        tl_inner_yellow.play();
        tl_inner_red.play();

        //type = 'outer';
        //segment_index = path_1_outer.segments.length-1;
        //ref.animatePointToDestination(path_1_outer.segments[segment_index].point, path_y_outer_segments[segment_index].point);



    };

    PaperView.prototype.onPathYellowOuterComplete = function(){
        Logger.log("onPathYellowOuterComplete");
        ref.createMouseEventListeners();
    };

    PaperView.prototype.onPathYellowInnerComplete = function(){
        Logger.log("onPathYellowInnerComplete");

    };

    PaperView.prototype.onPathRedOuterComplete = function(){
        Logger.log("onPathRedOuterComplete");
    };

    PaperView.prototype.onPathRedInnerComplete = function(){
        Logger.log("onPathRedInnerComplete");
        tl_outer_red.play();
        tl_outer_yellow.play();
    };

    PaperView.prototype.onMouseDrag = function(event){
        Logger.log("onMouseDrag");
        if (clicked_segment) {

            Logger.log("clicked_segment.point -> " + clicked_segment.point + ", event.delta -> " + event.delta);

            clicked_segment.point.x += event.delta.x;
            clicked_segment.point.y += event.delta.y;
        }
    };

    PaperView.prototype.createMouseEventListeners = function(){
        Logger.log("createMouseEventListeners");

        //we select red P on startup
        groupR.selected = true;

        //add mouse events for Red
        groupR.onMouseDown = function(event){
            var hitResult = groupR.hitTest(event.point, hitOptions);
            Logger.log("hitResul Red -> " + hitResult);
            if (!hitResult) return;
            if (hitResult.type == 'segment') {
                clicked_segment = hitResult.segment;
            }

            groupY.selected = false;
            groupY.sendToBack();
            groupY.blendMode = 'normal';

            groupR.selected = true;
            groupR.opacity = 0.85;
            groupR.blendMode = 'multiply';
            groupR.bringToFront();

        };
        groupR.onMouseDrag = ref.onMouseDrag;

        //add mouse events for Yellow
        groupY.onMouseDown = function(event){
            var hitResult = groupY.hitTest(event.point, hitOptions);
            //Logger.log("hitResult Yellow -> " + hitResult);
            if (!hitResult) return;

            if (hitResult.type == 'segment') {
                clicked_segment = hitResult.segment;
            }

            groupR.sendToBack();
            groupR.selected = false;
            groupR.blendMode = 'normal';
            groupR.opacity = 1;

            groupY.bringToFront();
            groupY.selected = true;
            groupY.blendMode = 'multiply';


        };
        groupY.onMouseDrag = ref.onMouseDrag;

        view.onMouseMove = function(event) {

            var x = event.point.x;
            var y = event.point.y;

            var centerX = view.center.x;
            var centerY = view.center.y;

            var diffX = centerX - x;
            var diffY = centerY - y;

            mousePercX = diffX/view.center.x;
            mousePercY = diffY/view.center.y;

            //Logger.log("mousePercX -> " + mousePercX + ", mousePercX -> " + mousePercX );

        };

        mouseMoveActive = true;

    };

    PaperView.prototype.resetToDefault = function(){

        tl_outer_yellow = new TimelineMax({delay:0.25, paused:true})
            .to(path_y_outer.segments[0].point, speed, {x:path_y_outer_segments[0].point.x, y:path_y_outer_segments[0].point.y, ease:Sine.easeOut})
            .to(path_y_outer.segments[1].point, speed, {x:path_y_outer_segments[1].point.x, y:path_y_outer_segments[1].point.y, ease:Sine.easeOut},'-=0.1')
            .to(path_y_outer.segments[2].point, speed, {x:path_y_outer_segments[2].point.x, y:path_y_outer_segments[2].point.y, ease:Sine.easeOut},'-=0.1')
            .to(path_y_outer.segments[3].point, speed, {x:path_y_outer_segments[3].point.x, y:path_y_outer_segments[3].point.y, ease:Sine.easeOut},'-=0.1')
            .to(path_y_outer.segments[4].point, speed, {x:path_y_outer_segments[4].point.x, y:path_y_outer_segments[4].point.y, ease:Sine.easeOut},'-=0.1')
            .to(path_y_outer.segments[5].point, speed, {x:path_y_outer_segments[5].point.x, y:path_y_outer_segments[5].point.y, ease:Sine.easeOut},'-=0.1')
            .to(path_y_outer.segments[6].point, speed, {x:path_y_outer_segments[6].point.x, y:path_y_outer_segments[6].point.y, ease:Sine.easeOut},'-=0.1')
            .to(path_y_outer.segments[7].point, speed, {x:path_y_outer_segments[7].point.x, y:path_y_outer_segments[7].point.y, ease:Sine.easeOut},'-=0.1')
            .to(path_y_outer.segments[8].point, speed, {x:path_y_outer_segments[8].point.x, y:path_y_outer_segments[8].point.y, ease:Sine.easeOut},'-=0.1')
            .to(path_y_outer.segments[9].point, speed, {x:path_y_outer_segments[9].point.x, y:path_y_outer_segments[9].point.y, ease:Sine.easeOut},'-=0.1')
            .to(path_y_outer.segments[10].point, speed, {x:path_y_outer_segments[10].point.x, y:path_y_outer_segments[10].point.y, ease:Sine.easeOut},'-=0.1')
            .to(path_y_outer.segments[11].point, speed, {x:path_y_outer_segments[11].point.x, y:path_y_outer_segments[11].point.y, ease:Sine.easeOut},'-=0.1')
            .to(path_y_outer.segments[12].point, speed, {x:path_y_outer_segments[12].point.x, y:path_y_outer_segments[12].point.y, ease:Sine.easeOut},'-=0.1')
            .to(path_y_outer.segments[13].point, speed, {x:path_y_outer_segments[13].point.x, y:path_y_outer_segments[13].point.y, ease:Sine.easeOut},'-=0.1')
            .to(path_y_outer.segments[14].point, speed, {x:path_y_outer_segments[14].point.x, y:path_y_outer_segments[14].point.y, ease:Sine.easeOut},'-=0.1')
            .to(path_y_outer.segments[15].point, speed, {x:path_y_outer_segments[15].point.x, y:path_y_outer_segments[15].point.y, ease:Sine.easeOut},'-=0.1')

        tl_inner_yellow = new TimelineMax({delay:0, paused:true})
            .to(path_y_inner.segments[0].point, speed, {delay:0.5, x:path_y_inner_segments[0].point.x, y:path_y_inner_segments[0].point.y, ease:Sine.easeOut})
            .to(path_y_inner.segments[1].point, speed, {x:path_y_inner_segments[1].point.x, y:path_y_inner_segments[1].point.y, ease:Sine.easeOut},'-=0.1')
            .to(path_y_inner.segments[2].point, speed, {x:path_y_inner_segments[2].point.x, y:path_y_inner_segments[2].point.y, ease:Sine.easeOut},'-=0.1')
            .to(path_y_inner.segments[3].point, speed, {x:path_y_inner_segments[3].point.x, y:path_y_inner_segments[3].point.y, ease:Sine.easeOut},'-=0.1')
            .to(path_y_inner.segments[4].point, speed, {x:path_y_inner_segments[4].point.x, y:path_y_inner_segments[4].point.y, ease:Sine.easeOut},'-=0.1')
            .to(path_y_inner.segments[5].point, speed, {x:path_y_inner_segments[5].point.x, y:path_y_inner_segments[5].point.y, ease:Sine.easeOut},'-=0.1')
            .to(path_y_inner.segments[6].point, speed, {x:path_y_inner_segments[6].point.x, y:path_y_inner_segments[6].point.y, ease:Sine.easeOut},'-=0.1')

        tl_outer_red = new TimelineMax({delay:0, paused:true})
            .to(path_r_outer.segments[0].point, speed, {x:path_r_outer_segments[0].point.x, y:path_r_outer_segments[0].point.y, ease:Sine.easeOut})
            .to(path_r_outer.segments[1].point, speed, {x:path_r_outer_segments[1].point.x, y:path_r_outer_segments[1].point.y, ease:Sine.easeOut},'-=0.1')
            .to(path_r_outer.segments[2].point, speed, {x:path_r_outer_segments[2].point.x, y:path_r_outer_segments[2].point.y, ease:Sine.easeOut},'-=0.1')
            .to(path_r_outer.segments[3].point, speed, {x:path_r_outer_segments[3].point.x, y:path_r_outer_segments[3].point.y, ease:Sine.easeOut},'-=0.1')
            .to(path_r_outer.segments[4].point, speed, {x:path_r_outer_segments[4].point.x, y:path_r_outer_segments[4].point.y, ease:Sine.easeOut},'-=0.1')
            .to(path_r_outer.segments[5].point, speed, {x:path_r_outer_segments[5].point.x, y:path_r_outer_segments[5].point.y, ease:Sine.easeOut},'-=0.1')
            .to(path_r_outer.segments[6].point, speed, {x:path_r_outer_segments[6].point.x, y:path_r_outer_segments[6].point.y, ease:Sine.easeOut},'-=0.1')
            .to(path_r_outer.segments[7].point, speed, {x:path_r_outer_segments[7].point.x, y:path_r_outer_segments[7].point.y, ease:Sine.easeOut},'-=0.1')
            .to(path_r_outer.segments[8].point, speed, {x:path_r_outer_segments[8].point.x, y:path_r_outer_segments[8].point.y, ease:Sine.easeOut},'-=0.1')
            .to(path_r_outer.segments[9].point, speed, {x:path_r_outer_segments[9].point.x, y:path_r_outer_segments[9].point.y, ease:Sine.easeOut},'-=0.1')
            .to(path_r_outer.segments[10].point, speed, {x:path_r_outer_segments[10].point.x, y:path_r_outer_segments[10].point.y, ease:Sine.easeOut},'-=0.1')
            .to(path_r_outer.segments[11].point, speed, {x:path_r_outer_segments[11].point.x, y:path_r_outer_segments[11].point.y, ease:Sine.easeOut},'-=0.1')
            .to(path_r_outer.segments[12].point, speed, {x:path_r_outer_segments[12].point.x, y:path_r_outer_segments[12].point.y, ease:Sine.easeOut},'-=0.1')
            .to(path_r_outer.segments[13].point, speed, {x:path_r_outer_segments[13].point.x, y:path_r_outer_segments[13].point.y, ease:Sine.easeOut},'-=0.1')
            .to(path_r_outer.segments[14].point, speed, {x:path_r_outer_segments[14].point.x, y:path_r_outer_segments[14].point.y, ease:Sine.easeOut},'-=0.1')
            .to(path_r_outer.segments[15].point, speed, {x:path_r_outer_segments[15].point.x, y:path_r_outer_segments[15].point.y, ease:Sine.easeOut},'-=0.1')

        tl_inner_red = new TimelineMax({delay:0, paused:true})
            .set($canvas,{autoAlpha:0})
            .to($canvas, 1, {autoAlpha:1, ease:Sine.easeOut})
            .to(path_r_inner.segments[0].point, speed, {delay:0.5, x:path_r_inner_segments[0].point.x, y:path_r_inner_segments[0].point.y, ease:Sine.easeOut})
            .to(path_r_inner.segments[1].point, speed, {x:path_r_inner_segments[1].point.x, y:path_r_inner_segments[1].point.y, ease:Sine.easeOut},'-=0.1')
            .to(path_r_inner.segments[2].point, speed, {x:path_r_inner_segments[2].point.x, y:path_r_inner_segments[2].point.y, ease:Sine.easeOut},'-=0.1')
            .to(path_r_inner.segments[3].point, speed, {x:path_r_inner_segments[3].point.x, y:path_r_inner_segments[3].point.y, ease:Sine.easeOut},'-=0.1')
            .to(path_r_inner.segments[4].point, speed, {x:path_r_inner_segments[4].point.x, y:path_r_inner_segments[4].point.y, ease:Sine.easeOut},'-=0.1')
            .to(path_r_inner.segments[5].point, speed, {x:path_r_inner_segments[5].point.x, y:path_r_inner_segments[5].point.y, ease:Sine.easeOut},'-=0.1')
            .to(path_r_inner.segments[6].point, speed, {x:path_r_inner_segments[6].point.x, y:path_r_inner_segments[6].point.y, ease:Sine.easeOut},'-=0.1')

        tl_outer_yellow.play();
        tl_inner_yellow.play();
        tl_outer_red.play();
        tl_inner_red.play();
    };


    window.PaperView = PaperView;

}(window));
