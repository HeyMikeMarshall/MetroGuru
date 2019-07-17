var map;

function flyTo(lat,lon){
    map.flyTo([lat,lon],17);
    L.marker([lat,lon])
        .addTo(map)
        .bindPopup("Test")}




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
        .text(function (d) { return d.value; });
    return table;
    };

function initMap() {
        var lat = "38.898303"
        var lng = "-77.028099"
        map = L.map("map", {
            center: [lat, lng],
            zoom: 17
            });
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
        d3.select("#trains1").html("");
        d3.select("#trains2").html("");
        var trns1 = response['trains1'].sort(function(a,b) { return a.Group - b.Group; });
        tabulate(trns1, ['Line', 'Car', 'Destination','Min'], "#trains1");
        var trns2 = response['trains2']
        if (trns2.hasOwnProperty("0")) {
            tabulate(trns2, ['Line', 'Car', 'Destination','Min'], "#trains2");
        };
        var lat = response.lat
        var lng = response.lng
        flyTo(lat,lng)
    });};




function optionChanged(newStation) {
    // Fetch new data each time a new sample is selected
    buildStationInfo(newStation);
    }




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
initMap();
init();