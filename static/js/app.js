var map;
var marker;
var tgtstn = "A01";
var linesurl = "static/js/Metro_Lines_Regional.geojson"
var stngeourl = "/stations/geo"


function flyTo(lat,lon){
    map.flyTo([lat,lon],15);
    marker = L.marker([lat,lon])
        .addTo(map)}

function mkSvg(line){
    var ccolor;
    var tcolor;
    if (line === "RD"){
        ccolor = "#BF0D3E"
        tcolor = "#fff"
    }
    if (line === "OR"){
        ccolor = "#ED8B00"
        tcolor = "#000"
    }
    if (line === "BL"){
        ccolor = "#009CDE"
        tcolor = "#fff"
    }
    if (line === "GR"){
        ccolor = "#00B140"
        tcolor = "#fff"
    }
    if (line === "YL"){
        ccolor = "#FFD100"
        tcolor = "#000"
    }
    if (line === "SV"){
        ccolor = "#919D9D"
        tcolor = "#000"
    }
    var svg =`<svg height="20" width="20">
    <circle cx="10" cy="10" r="10"fill=${ccolor} />
    <text text-anchor="middle" font-size="10px" fill=${tcolor}  x=10 y=14> ${line} </text>
    </svg>`

    return svg
}

function tabulate(data, columns, divid) {
    var table = d3.select(divid).append('table')
    var thead = table.append('thead')
    var	tbody = table.append('tbody');
    // append the header row
    thead.append('tr')
        .selectAll('th')
        .data(columns).enter()
        .append('th')
        .text(function (column) { return column; });
    // create a row for each object in the data
    var rows = tbody.selectAll('tr')
        .data(data)
        .enter()
        .append('tr');
    // create a cell in each row for each column
    var cells = rows.selectAll('td')
        .data(function (row) {
        return columns.map(function (column) {
            return {column: column, value: row[column]};
        });
        })
        .enter()
        .append('td')
        .html(function (d) { 
            if (d.column === "Line"){
                return mkSvg(d.value)
            }
            else 
                return d.value; });
        
    return table;
    };

function initMap(data) {
        var lat = "38.898303"
        var lng = "-77.028099"

        map = L.map("map", {
            center: [lat, lng],
            zoom: 15
            });
        
        L.geoJSON(data, {
            style: function(feature) {
                switch (feature.properties.NAME) {
                    case 'red': return {color: "#BF0D3E"};
                    case 'orange':   return {color: "#ED8B00"};
                    case 'orange - rush +': return {color:"#ED8B00"}
                    case 'blue':   return {color: "#009CDE"};
                    case 'green':   return {color: "#00B140"};
                    case 'yellow':   return {color: "#FFD100"};
                    case 'silver':   return {color: "#919D9D"};
                }}
        }).addTo(map);

        d3.json("/stations/geo").then(function(data){
            for (var i = 0; i < data.length; i++) {
                L.circle([data[i].lat, data[i].lng], {
                        color: "#000",
                        fillColor: "#fff",
                        fillOpacity: 1,
                        radius: 20
                    }).addTo(map);}
            
        })
        

        
        L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
            attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
            maxZoom: 20,
            id: "mapbox.streets",
            accessToken: MAP_KEY
            }).addTo(map);     
};


function buildStationInfo(station){
    d3.select("#station-info").html("");
    d3.json(`/stations/${station}`).then(function(response){
        d3.select("#station-name").html(`${response.name}`);    
        d3.select("#station-info")
            .append("p")
            .html(`<b>Address:</b><br>
                    ${response.address.Street} <br>
                    ${response.address.City}, ${response.address.State} ${response.address.Zip}`);
        buildTrainTable(response)
        var lat = response.lat
        var lng = response.lng
        if (marker != undefined) {
            map.removeLayer(marker);
         };
        flyTo(lat,lng)
        marker.bindPopup(`<b>${response.name}</b>`).openPopup()
    });
};

function clock() {
    var d = new Date();
    var time = d.toLocaleTimeString()
    d3.select("#clock").text(`current time is: ${time}`);
}


function buildTrainTable(response) {
    var d = new Date();
    var time = d.toLocaleTimeString()
    d3.select("#timer").text(`last updated at ${time}`);
    d3.select("#trains1").html("");
    d3.select("#trains2").html("");
    var trns1 = response['trains1'].sort(function(a,b) { return a.Group - b.Group; });
    tabulate(trns1, ['Line', 'Car', 'Destination','Min'], "#trains1");
    var trns2 = response['trains2']
    if (trns2.hasOwnProperty("0")) {
        trns2.sort(function(a,b) { return a.Group - b.Group; });
        tabulate(trns2, ['Line', 'Car', 'Destination','Min'], "#trains2");
    };
}

function updateTrainTable() {
    d3.json(`/stations/${tgtstn}`).then(function(response){
        buildTrainTable(response);
    });
};

function optionChanged(newStation) {
    tgtstn = newStation
    buildStationInfo(newStation);
};




function init(){
    var selector = d3.select("#selStation");
    d3.json("/stations").then((stationNames) => {
        stationNames.forEach((station) => {
          selector
            .append("option")
            .text(station.name)
            .property("value", station.code);
            });
        const firstStation = stationNames[0].code;
        buildStationInfo(firstStation)
        
    })
}

init();
d3.json(linesurl).then(function(data){
    initMap(data)
    });

d3.interval(function(){
    clock();
})
d3.interval(function(){
    updateTrainTable()
}, 20000)