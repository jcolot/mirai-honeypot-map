$(window).load(function() {

var theme = Timeline.ClassicTheme.create();
theme.event.track.offset = 0;
theme.event.track.height = 20;
theme.event.tape.height = 0;
// These are for the default stand-alone icon
theme.event.instant.iconWidth = 31; 
theme.event.instant.iconHeight = 31; 

var mapOptions = {
    zoomControl: true,
    zoomControlOptions: { 
        style: google.maps.ZoomControlStyle.LARGE,
        position: google.maps.ControlPosition.LEFT_CENTER
    },
    panControl: false,
    streetViewControl: false,
    mapTypeControl: false,
    //select the mapTypeId selected in html
    mapTypeId: $(".map-type-id.selected").attr("name"),
    zoom: 3,
    center: new google.maps.LatLng(0,0)
};


window.tm = new TimeMap({
    mapId: "map",               // Id of map div element (required)
    timelineId: "timeline",     // Id of timeline div element (required)
    classicTape: true,
    mapOptions: mapOptions,
    eventIconPath: "",
    centerOnItems: true,
    iconAnchor: [42, 42],
    openInfoWindow: function() {},
    mapFilter: 'none',
    bandInfo: [
        {
        theme: theme,
        trackHeight: 12.0,
        trackGap: 0.5,
        timeZone: - new Date().getTimezoneOffset()/60,
        width:          "85",
        eventPainter:   Timeline.CompactEventPainter,
        eventPainterParams: 
            {clusterEvents: true},
        zoomIndex:      9,
        zoomSteps:      new Array(
          {pixelsPerInterval: 140,  unit: Timeline.DateTime.MINUTE},
          {pixelsPerInterval:  70,  unit: Timeline.DateTime.MINUTE},
          {pixelsPerInterval:  35,  unit: Timeline.DateTime.MINUTE},
          {pixelsPerInterval: 140,  unit: Timeline.DateTime.QUARTERHOUR},
          {pixelsPerInterval:  70,  unit: Timeline.DateTime.QUARTERHOUR},
          {pixelsPerInterval:  35,  unit: Timeline.DateTime.QUARTERHOUR},
          {pixelsPerInterval:  70,  unit: Timeline.DateTime.HOUR},
          {pixelsPerInterval:  35,  unit: Timeline.DateTime.HOUR},
          {pixelsPerInterval: 400,  unit: Timeline.DateTime.DAY},
          {pixelsPerInterval: 200,  unit: Timeline.DateTime.DAY},
          {pixelsPerInterval: 100,  unit: Timeline.DateTime.DAY},
          {pixelsPerInterval:  50,  unit: Timeline.DateTime.DAY},
          {pixelsPerInterval: 400,  unit: Timeline.DateTime.MONTH},
          {pixelsPerInterval: 200,  unit: Timeline.DateTime.MONTH},
          {pixelsPerInterval: 100,  unit: Timeline.DateTime.MONTH},
          {pixelsPerInterval: 300,  unit: Timeline.DateTime.YEAR}, 
          {pixelsPerInterval: 200,  unit: Timeline.DateTime.YEAR}, 
          {pixelsPerInterval: 100,  unit: Timeline.DateTime.YEAR} 
        )
        }
    ]
});


google.maps.event.addListener(tm.map.markerClusterer, "click", 
        function(cluster, marker) {cluster.openInfoWindow(marker);});

$(window).bind(
    "resize",
    function(){
        var tlWidth = tm.timeline.getBand(0).getViewWidth(); 
        $("#tl-height-handle").css("top", 
                window.innerHeight - 65 - tlWidth + "px");
        if (window.innerHeight - 1.6 * tlWidth < 270) {
            tm.map.setOptions({zoomControl: false});
        } else if (window.innerHeight - 1.6 * tlWidth < 370) {
            tm.map.setOptions({
                zoomControl:true,
                zoomControlOptions: {
                    style: google.maps.ZoomControlStyle.SMALL,
                    position: google.maps.ControlPosition.LEFT_CENTER
                    }
                }   
            );
        } else {
            tm.map.setOptions({
                zoomControl:true,
                zoomControlOptions: {
                    style: google.maps.ZoomControlStyle.LARGE,
                    position: google.maps.ControlPosition.LEFT_CENTER
                    }
                }   
            );
        }
    }
);

$(window).trigger("resize");

tm.timeline.getBand(0).centerOnEvents(true);

$("#tl-zoom-in").click(
    function(e){
        e.preventDefault();
        e.stopPropagation();
        tm.timeline.getBand(0).zoom(true);
        tm.filter("map");
        tm.timeline.paint();
    }
);   

$("#tl-zoom-out").click(
    function(e){
        e.preventDefault();
        e.stopPropagation();
        tm.timeline.getBand(0).zoom(false);
        tm.filter("map");
        tm.timeline.paint();
    }
); 


var client = new WebSocket('ws://nas.synlexia.org:8080/', 'echo-protocol');

client.onerror = function() {
    console.log('Connection Error');
};

client.onopen = function() {
    console.log('WebSocket Client Connected');
    
    function sendNumber() {
        if (client.readyState === client.OPEN) {
            var number = Math.round(Math.random() * 0xFFFFFF);
            client.send(number.toString());
            setTimeout(sendNumber, 10000);
         }
    }
    sendNumber();
};

client.onclose = function() {
    console.log('echo-protocol Client Closed');
};

window.attacks = [];

client.onmessage = function(e) {
    if (typeof e.data === 'string') {
        console.log("Received: '" + e.data + "'");
        window.attacks.push(JSON.parse(e.data));
        ds.setDataCache(attacks);
        ds.loadItemsFromDataCache();
        tm.timeline.paint();
    }
};

var ds = tm.createDataset('test', {title: 'test', eventSource: tm.eventSource});

});
