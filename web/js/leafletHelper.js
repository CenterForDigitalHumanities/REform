/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


        let popup = L.popup();
        
        function initializeMap(){
            
            L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoidGhlaGFiZXMiLCJhIjoiY2pyaTdmNGUzMzQwdDQzcGRwd21ieHF3NCJ9.SSflgKbI8tLQOo2DuzEgRQ', {
            attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
            maxZoom: 18,
            id: 'mapbox.satellite', //mapbox.streets
            accessToken: 'pk.eyJ1IjoidGhlaGFiZXMiLCJhIjoiY2pyaTdmNGUzMzQwdDQzcGRwd21ieHF3NCJ9.SSflgKbI8tLQOo2DuzEgRQ'
            }).addTo(mymap);
            
//            var circle = L.circle([39.41, -91.17], {
//                color: 'red',
//                fillColor: '#f03',
//                fillOpacity: 0.5,
//                radius: 500
//            }).addTo(mymap);
//            
//            var polygon = L.polygon([
//                [39.42, -91.17],
//                [39.41, -91.16],
//                [39.40, -91.33]
//            ]).addTo(mymap);
            
//            circle.bindPopup("I am a circle.");
//            polygon.bindPopup("I am a polygon.");
            
//            var popup = L.popup()
//                .setLatLng([39.406347, -91.145024])
//                .setContent("I am McElwee Cemetery.")
//                .openOn(mymap);
            
            let cemetery = {
                "type": "Feature",
                "properties": {
                    "name": "McElwee Cemetery",
                    "amenity": "Human Cemetery",
                    "popupContent": "This is where our people are buried!",
                    "openDataID" : "http://devstore.rerum.io/v1/id/5c100ecce4b05b14fb531ed0"
                },
                "geometry": {
                    "type": "Point",
                    "coordinates": [-91.145024, 39.406347]
                }
            }
            
             let cemetery2 = {
                "type": "FeatureCollection",
                "features":[
                    {
                        "properties": {
                            "name": "Claud H. B. Bland",
                            "amenity": "Buried Human",
                            "popupContent": "This is Claud, he is dead",
                            "openDataID" : "http://devstore.rerum.io/v1/id/5bc7f853e4b09992fca2220e"
                        },
                        "geometry": {
                            "type": "Point",
                            "coordinates": [-91.145024, 39.406347]
                        },
                        "type": "Feature",
                        id:1
                    },
                    {
                        "properties": {
                            "name": "Elizabeth C. Carr",
                            "amenity": "Buried Human",
                            "popupContent": "This is Elizabeth, she is a stationary zombie",
                            "openDataID" : "http://devstore.rerum.io/v1/id/5bc8075ae4b09992fca2221f"
                        },
                        "geometry": {
                            "type": "Point",
                            "coordinates": [-91.145024, 39.4068]
                        },
                        "type": "Feature",
                        id:2
                    }
                ]
            }
            
            L.geoJSON(cemetery2, {
		pointToLayer: function (feature, latlng) {
                    return L.circleMarker(latlng, {
                            radius: 8,
                            fillColor: "#ff7800",
                            color: "#000",
                            weight: 1,
                            opacity: 1,
                            fillOpacity: 0.8
                    });
                },
		onEachFeature: onEachFeature
            }).addTo(mymap)

            mymap.on('click', onMapClick)
        }
        
        function onEachFeature(feature, layer) {
            var popupContent = "<p>Person's Linked Open Data ID: <a target='_blank' href='"+feature.properties.openDataID+"'>"+feature.properties.openDataID+"</a></p>";
            if (feature.properties && feature.properties.popupContent) {
                popupContent += feature.properties.popupContent;
            }
            layer.bindPopup(popupContent);
	}
        
        function onMapClick(e) {
            popup
                .setLatLng(e.latlng)
                .setContent("You clicked the map at " + e.latlng.toString())
                .openOn(mymap);
        }