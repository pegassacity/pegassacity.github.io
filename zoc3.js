Map = {
    gmaps: google.maps,
    map: null,
    markers: [],
    circles: [],
    units: [],
    defaultLatLng: {
	latitude: 50.25,
	longitude: 6.10
    },
    mapOptions: {
        zoom: 9,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    },

    sideColor: {"German":"#FF0000", "Allied":"#00FF00"},
        
    getCoords: function(position) {
        return new google.maps.LatLng(
	    position.latitude, position.longitude);
    },
        
    setMapOptions: function() {
        this.mapOptions.center = this.getCoords(this.defaultLatLng);
    },
        
    createMarker: function(point) {
        var marker = new this.gmaps.Marker({
            position: point,
            map: Map.map,
            draggable: true,
	    title: "Div.",
	    side: ""
        });

	marker.title=$("#title").val();
	marker.side=$("#side").val();

        this.gmaps.event.addListener(marker, 'click', function(e) {
            var infowindow = new Map.gmaps.InfoWindow({
		content: marker.title+marker.side+'<br/><button class="destroy">Remove</button>'
            });

            infowindow.open(Map.map, marker);
            
            Map.gmaps.event.addListener(infowindow, 'domready', function() {
		$('.destroy').bind('click', function() {
                    for (var i=0; i<Map.markers.length; ++i) {
			if (Map.markers[i] == marker) {
			    marker.setMap(null);
			    Map.markers.splice(i, 1);
			    Map.circles[i].setMap(null);
			    Map.circles.splice(i, 1);
			    Map.units.splice(i, 1);
			    break;
			}
                    }
                    infowindow = null;
		    $("#markers").val(Map.jsnOut)
                    return false;
		});
              
		$('.cancel').bind('click', function() {
                    infowindow.close();
                    infowindow = null;
                    return false;
		});
            });
        });
          
        this.gmaps.event.addListener(marker, 'drag', function(e) {
	    $("#markers").val(Map.jsnOut);
        });
        return marker;
    },
        
    placeMarker: function(e) {
        if (e.latLng) {
            var marker = Map.createMarker(e.latLng);
            Map.markers.push(marker);
	    Map.addZOC(marker);
            marker= null;
        }
        e = null;
	$("#markers").val(Map.jsnOut)
    },

    addZOC: function(marker) {
	var c=new google.maps.Circle({
	    map: Map.map,
	    radius: 3000, strokeWeight: 2,
	    strokeColor: Map.sideColor[marker.side], strokeOpacity: 0.8,
	    fillColor: Map.sideColor[marker.side], fillOpacity: 0.35});
	c.bindTo('center', marker, 'position');
        Map.circles.push(c);
        marker= null;
    },

    jsnOut: function(){
	var u=[];
	for( var i=0; i< Map.markers.length; ++i){
	    var mk=Map.markers[i];
	    var unit={
		lat: mk.getPosition().lat(),
		lng: mk.getPosition().lng(),
		title: mk.title,
		side: mk.side,
	    }
	    u.push(unit);
	}
	var ujs={
	    units: u
	}
	return(JSON.stringify(ujs));
    },
        
    jsnLoad: function(){
	var successFunc= function(j){
	    Map.units=j.units;
	    $("#markers").val(JSON.stringify(j));
	    for(var i=0; i<j.units.length; ++i){
		var u=j.units[i];
		var m = Map.createMarker(new google.maps.LatLng(u.lat, u.lng));
		m.title=u.title;
		m.side=u.side;
		Map.markers.push(m);
		Map.addZOC(m);
	    }
	    return;
	};
	$.getJSON("./units.js",function(j){
	    successFunc(j);
	    return;
	});
    },

    drawHex: function(map){
	var i,j;
	var olat=49.50;
	var olng=5.0;
	var dlat=0.1;
	var dlng=0.2;
	var p=[];
	var polygon=[];
	var polygonOptions = {
	    strokeWeight: 2,
	    strokeColor: "#0000ff",
	    strokeOpacity: 0.2,
	    fillColor: "#008000",
	    fillOpacity: 0.1
	};
	for(i=0; i<10; ++i){
	    for(j=0; j<10; ++j){
		var points=[];
		points.push(new google.maps.LatLng(olat,olng));
		points.push(new google.maps.LatLng(olat,olng+dlng));
		points.push(new google.maps.LatLng(olat+dlat,olng+dlng));
		points.push(new google.maps.LatLng(olat+dlat,olng));
		points.push(new google.maps.LatLng(olat,olng));
		p.push(points);
		olng=olng+dlng;
		polygonOptions.path=p[i*20+j];
		var polygon = new google.maps.Polyline(polygonOptions);
		polygon.setMap(map);
	    }
	    olat+=dlat;
	    olng+=dlng/2;
	    for(j=0; j<10; ++j){
		var points=[];
		points.push(new google.maps.LatLng(olat,olng));
		points.push(new google.maps.LatLng(olat,olng-dlng));
		points.push(new google.maps.LatLng(olat+dlat,olng-dlng));
		points.push(new google.maps.LatLng(olat+dlat,olng));
		points.push(new google.maps.LatLng(olat,olng));
		p.push(points);
		olng=olng-dlng;
		polygonOptions.path=p[i*20+j+10];
		var polygon = new google.maps.Polyline(polygonOptions);
		polygon.setMap(map);
	  }
	  olat+=dlat;
	  olng-=dlng/2;
	}
	//var polygon = new google.maps.Polygon(polygonOptions);
	//polygon.setMap(map);
    },

    initMap: function(mapid) {
        mapid = mapid || 'map';
        this.setMapOptions();
        this.map = new this.gmaps.Map($('#'+mapid)[0], this.mapOptions);
        this.gmaps.event.addListener(this.map, 'click', this.placeMarker);
	this.jsnLoad();
		this.drawHex(this.map);
    }
};
      
$(function() {
    Map.initMap();
});
