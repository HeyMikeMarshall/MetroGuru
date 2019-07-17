var rb='<a href="https://regionbound.com">RegionBound</a> | ';
var cc='<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>';
var attr1=rb+'Map data © <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, '+cc;
var tileLayer1Options={attribution:attr1};
var tileLayer1=L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png',tileLayer1Options);
var attr2=rb+'Tiles © <a target="attr" href="http://esri.com">Esri</a>';
var tileLayer2Options={attribution:attr2};
var tileLayer2=L.tileLayer('https://services.arcgisonline.com/ArcGIS/rest/services/world_topo_map/MapServer/tile/{z}/{y}/{x}.png',tileLayer2Options);
var flyMap;
function flyTo(lat,lon,name){
    flyMap.flyTo([lat,lon],11);
    L.marker([lat,lon])
        .addTo(flyMap)
        .bindPopup(name+"<br/>International Airport<br/>["+lat+", "+lon+"]")}


var mapOptions={};
flyMap=L.map('map-with-flyto',mapOptions).locate({setView:true,maxZoom:16});tileLayer2.addTo(flyMap);var layers={'OSM':tileLayer1,'Esri Topo':tileLayer2};L.control.layers(layers,{}).addTo(flyMap);flyMap.on('locationfound',function(e){var radius=(e.accuracy/2).toFixed();L.circle(e.latlng,radius).addTo(flyMap).bindPopup("You are within this circle");L.marker(e.latlng).addTo(flyMap).bindPopup("You are within "+radius+" meters of this marker.");});flyMap.on('locationerror',function(e){alert(e.message);});