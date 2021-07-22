/* eslint-disable */

export const displayMap = (location) => {
  mapboxgl.accessToken =
    'pk.eyJ1Ijoibmd1eWVubmdvY3BodTAxNjYiLCJhIjoiY2txZ3M5eGE4MHc2ajJvbnpoaTd0bXNkbCJ9.wggEURhqUvGgUecTxDteQA';
  var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/nguyenngocphu0166/ckqtpgfej54ew18o0bgw0fsd7/draft',
    //center: [-74.387161, 40.65034],
  });

  const bounds = new mapboxgl.LngLatBounds();

  location.forEach((loc) => {
    // Create marker
    const el = document.createElement('div');
    el.className = 'marker';

    // Add marker
    new mapboxgl.Marker({
      element: el,
      anchor: 'bottom',
    })
      .setLngLat(loc.coordinates)
      .addTo(map);

    // Add popup
    new mapboxgl.Popup({
      offset: 100,
    })
      .setLngLat(loc.coordinates)
      .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
      .addTo(map);

    // Extend map bounds to include current location
    bounds.extend(loc.coordinates);
  });

  map.fitBounds(bounds, {
    padding: {
      top: 200,
      bottom: 150,
      left: 100,
      right: 100,
    },
  });
};
