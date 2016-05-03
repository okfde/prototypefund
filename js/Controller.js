(function(window){

    Controller.prototype.constructor = Controller;
    Controller.prototype = {
        val0 : '',
        val1 : ''
    };

    var ref, $, $headline, $lead1, $lead2, $footer;
    function Controller(jQuery){
        ref = this;
        $ = jQuery;
    };


    Controller.prototype.init = function($slide){
        $headline = $('.cover-heading').find('span');

        $lead1 = $('.lead').first();
        $lead2 = $('.lead').last();
        $footer = $('.mastfoot').find('.inner');

        TweenMax.set($headline,{visibility:'hidden'});
        TweenMax.set($lead1,{autoAlpha:0, y:'20%'});
        TweenMax.set($lead2,{autoAlpha:0, y:'20%'});
        TweenMax.set($footer,{autoAlpha:0, y:'20%'});

        var tl = new TimelineMax({delay:0, paused:false})
            .staggerTo($headline, 0.2, {delay: 0.1, visibility:'visible'},0.05,'fade')
            .to($lead1, 0.3, {y:'0%', autoAlpha:1, ease:Power1.easeOut},'fade+=0.75')
            .to($lead2, 0.3, {y:'0%', autoAlpha:1, ease:Power1.easeOut},'fade+=1')
            .to($footer, 0.3, {y:'0%', autoAlpha:1, ease:Power1.easeOut},'fade+=1.25')

    };

    window.Controller = Controller;

}(window));

