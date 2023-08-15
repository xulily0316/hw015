// declare variables
var url = 'data/all_week.geojson'

// Store our API endpoint as queryUrl.
// selection based on all earthquakes for the last 7 days
var queryUrl = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson'

// change the color based on feature's earthquake depth
cats = ['-10-10','10-30','30-50','50-70','70-90','90+'];
colors = ['GreenYellow', 'Cyan', 'Tan', 'Salmon', 'Orange', 'Red', 'LightGreen']

function getColor(d) {
  // then passing the depth into the circle color function
  // my initial submission contained a ROOKIE mistake!!
     // the list index NOW starts with 0 not 1 as my original code did
  return  d > 90 ?  colors[5]:
          d > 70 ?  colors[4]:
          d > 50 ?  colors[3]:
          d > 30 ?  colors[2]:
          d > 10 ?  colors[1]:
          d > -10 ? colors[0]:
          colors[6];
}

// Perform a GET request to the query URL/
d3.json(queryUrl).then(function (data) {
  
  // console.log(data.features)
  createFeatures(data.features);
});

function createFeatures(earthquakeData) {
  console.log(earthquakeData);
  
  function doOnEachFeature(feature, layer) {
    layer.bindPopup(`<h3>${feature.properties.place}</h3><hr><p>${new Date(feature.properties.time)}</p><ul><li>Earthquake Magnitude: ${feature.properties.mag}</li><li>Earthquake Depth: ${feature.geometry.coordinates[2]}</li></ul>`);
  }

  // Create a GeoJSON layer that contains the features array on the earthquakeData object.
  
  var earthquakes = L.geoJSON(earthquakeData, {
    pointToLayer: function(feature, latlng) {
      return new L.CircleMarker(latlng, {  
        // data points scale with magnitude level
        radius:feature.properties.mag * 3,
        // data points colors change with depth level
        fillColor: getColor(feature.geometry.coordinates[2]),
        color: 'black',        //getColor(feature.geometry.coordinates[2]),
        weight: .2,
        opacity: .8,
        fillOpacity: 3   //0.35
      });
    },
    onEachFeature: doOnEachFeature
  });

  // Send our earthquakes layer to the createMap function/
  createMap(earthquakes);
}

function createMap(earthquakes) {

  // Create the base layers.
  var street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  })

  var topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
  });

  var dark = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
	subdomains: 'abcd',
	maxZoom: 20
  });

  // Create a baseMaps object.
  var baseMaps = {
    "Street Map": street,
    "Topographic Map": topo,
    "Dark Map":dark
  };

  // Create an overlay object to hold our overlay.
  var overlayMaps = {
    Earthquakes: earthquakes
  };

  // Create our map, giving it the streetmap and earthquakes layers to display on load.
  var map = L.map("map", {
    center: [
      37.09, -95.71
    ],
    zoom: 4,
    layers: [street, earthquakes]
  });
  
  // Create a legend to add to map
  var legend = L.control({position: 'bottomright'});
  legend.onAdd = function () {

  var div = L.DomUtil.create('div', 'info legend');

  for (var i = 0; i < cats.length; i++) {
    var item = `<li style='background: ${colors[i]} '></li>   ${cats[i]}<br>`
    // console.log(item);
    div.innerHTML += item
    }return div };legend.addTo(map);

  // Create a layer control.
  L.control.layers(
  // Pass it our baseMaps and overlayMaps. 
  baseMaps, overlayMaps, {
    collapsed: false
  // Add the layer control to the map.
  }).addTo(map);

}
