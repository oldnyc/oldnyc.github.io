/**
 * This module supports address search and the current location button.
 */

import { map } from './viewer';

let locationMarker: google.maps.Marker | null = null;

function setLocation(latLng: google.maps.LatLng | google.maps.LatLngLiteral, title: string) {
  map!.panTo(latLng);
  map!.setZoom(17);

  if (locationMarker) {
    locationMarker.setMap(null);
  }
  locationMarker = new google.maps.Marker({
    position: latLng,
    map,
    title
  });
}

$(() => {
  $('#location-search').on('keypress', function(e) {
    if (e.which !== 13) return;

    const address = $(this).val();
    $.getJSON('https://maps.googleapis.com/maps/api/geocode/json', {
      address,
      key: 'AIzaSyClCA1LViYi4KLQfgMlfr3PS0tyxwqzYjA',
      bounds: '40.490856,-74.260895|41.030091,-73.578699'
    }).done(response => {
      const latLng = response.results[0].geometry.location;
      setLocation(latLng, address);
      ga('send', 'event', 'link', 'address-search');
    }).fail(e => {
      console.error(e);
      ga('send', 'event', 'link', 'address-search-fail');
    })
  });

  $('#current-location').on('click', () => {
    navigator.geolocation.getCurrentPosition(position => {
      const { latitude, longitude } = position.coords;
      setLocation({lat: latitude, lng: longitude}, 'Current Location');
      ga('send', 'event', 'link', 'current-location');
    }, e => {
      console.error(e);
      ga('send', 'event', 'link', 'current-location-error');
    });
  });
});
