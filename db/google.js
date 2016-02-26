        console.log('hello');

        var map;
        var infowindow;

        function initMap() {
          var newYork = {lat: 40.74002, lng: -73.989817};
          var request = {
            location: newYork,
            radius: 500,
            type: ['points_of_interest'],
          }





          map = new google.maps.Map(document.getElementById('map'), {
            center: {lat: 40.74002, lng: -73.989817},
            zoom: 14
          });

          var input = (document.getElementById('pac-input'));
          map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);
          var autocomplete = new google.maps.places.Autocomplete(input);
          autocomplete.bindTo('bounds', map);

          infowindow = new google.maps.InfoWindow();
          var service = new google.maps.places.PlacesService(map);
          service.nearbySearch(request, callback);
        }

        function callback(results, status) {

          if (status === google.maps.places.PlacesServiceStatus.OK) {
            for (var i = 0; i < results.length; i++) {
              createMarker(results[i]);
            }
          }
        }

        function createMarker(place) {
          var placeLoc = place.geometry.location;
          var marker = new google.maps.Marker({
            map: map,
            position: place.geometry.location
          });

          google.maps.event.addListener(marker, 'click', function() {
            infowindow.setContent(place.name);
            infowindow.open(map, this);
          });
        }