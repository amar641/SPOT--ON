// ================ Google Maps JS API (markers) ===============
// Initialize and add the map
let map;

async function initMap(latitude, longitude) {
  //  destination 
  const position = { lat: latitude, lng: longitude};

  // Request needed libraries.
  const { Map } = await google.maps.importLibrary("maps");
  const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");

  // The map   
  map = new Map(document.getElementById("map"), {
    zoom: 18,
    center: position,
    mapId: "DEMO_MAP_ID",
  });

  // The marker
  const marker = new AdvancedMarkerElement({
    map: map,
    position: position,
    title: "Destination",
  });

  // =============== To display the route ==============
  let directionsService = new google.maps.DirectionsService();
  let directionsRenderer = new google.maps.DirectionsRenderer();
  directionsRenderer.setMap(map);
  
  try{
    let userLocation = await fetchLocation();

    if(userLocation){
      await calculateAndDisplayRoute(directionsService,directionsRenderer,userLocation, position);
      
    } else{
        alert("The algorithm might face some inaccuracies as location access was denied");
    }
  }
  catch(err){
    console.log(err);
  }
}
// initMap();

// =======================================================


// ================== Browser Geolocation API ===================

function fetchLocation(){
    // the following method triggers a popup requesting for location permission
    // it has three parameters which we treat as 3 functions
    // navigator.geolocation.getCurrentPosition(successCallback, errorCallback, options);

    return new Promise((resolve, reject) => {
        // we return the location val as a promise
        navigator.geolocation.getCurrentPosition(

          // function 1
          (position) => {
            const userLocation = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            };
            resolve(userLocation);
          },

          //  function 2 
          (error) => {
            switch (error.code) {
              case error.PERMISSION_DENIED:
                console.error("Location access denied by user");
                break;
              case error.POSITION_UNAVAILABLE:
                console.error("Location information is unavailable");
                break;
              case error.TIMEOUT:
                console.error("Location request timed out");
                break;
            }
            reject(error);
          },

          // function 3 (options)  
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0,
          }
        );
      });
}

// =========================================================



// ============== Google Maps JS API (directions service) =======
// use DirectionsService to calculate directions and directionsRenderer to showcase it

async function calculateAndDisplayRoute(directionsService,directionsRenderer, userLocation, destinationLocation){
    // the method directionsService.route() contains 
    // 1. the directionsRequest object
    // 2. the directionsResult function which we will use to call the directionsRenderer to showcase route

    try{
        const response = await directionsService.route({
            origin: userLocation,
            destination: destinationLocation,
            travelMode: google.maps.TravelMode.DRIVING
        });

        if(response.status ===  "OK"){
            directionsRenderer.setDirections(response);

            // extract distance and duration from the response
            const route = response.routes[0].legs[0];
            const distance = route.distance.text;
            const duration = route.duration.text;

            console.log(`distance is ${distance} and time taken would be ${duration}`);

        } else{
            throw new Error(`Directions request failed with status: ${response.status}`);
        }
    } catch(err){
        console.log(err);
    }

}