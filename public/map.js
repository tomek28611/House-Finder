mapboxgl.accessToken = '';
const map = new mapboxgl.Map({
container: 'map', // container ID
style: 'mapbox://styles/mapbox/streets-v11', // style URL
center: hfinder.geometry.coordinates, // starting position [lng, lat]
zoom: 9, // starting zoom
projection: 'globe' // display the map as a 3D globe
});
map.on('style.load', () => {
map.setFog({}); // Set the default atmosphere style
});

// Create a default Marker and add it to the map.
const marker1 = new mapboxgl.Marker({ color: 'blue', rotation: 45 })
.setLngLat(hfinder.geometry.coordinates)
.addTo(map);