(g => { var h, a, k, p = "The Google Maps JavaScript API", c = "google", l = "importLibrary", q = "__ib__", m = document, b = window; b = b[c] || (b[c] = {}); var d = b.maps || (b.maps = {}), r = new Set, e = new URLSearchParams, u = () => h || (h = new Promise(async (f, n) => { await (a = m.createElement("script")); e.set("libraries", [...r] + ""); for (k in g) e.set(k.replace(/[A-Z]/g, t => "_" + t[0].toLowerCase()), g[k]); e.set("callback", c + ".maps." + q); a.src = `https://maps.${c}apis.com/maps/api/js?` + e; d[q] = f; a.onerror = () => h = n(Error(p + " could not load.")); a.nonce = m.querySelector("script[nonce]")?.nonce || ""; m.head.append(a) })); d[l] ? console.warn(p + " only loads once. Ignoring:", g) : d[l] = (f, ...n) => r.add(f) && u().then(() => d[l](f, ...n)) })({
  key: "AIzaSyCbslAH8fUvbb6O544Xyq0iJBzK50vvX08",
  // Add other bootstrap parameters as needed, using camel case.
  // Use the 'v' parameter to indicate the version to load (alpha, beta, weekly, etc.)
});

const JSON_PATH = 'assets/data/geo-guess-locations.json'
const MAX_STREET_VIEW_RADIUS = 50;
let streetPosition;
let userGuessResult;
let map;
let score = 0;
let roundNumber = 0;
let data;
let panorama;

// FETCH ATTRACTION DATA FROM FAILTE IRELAND CSV attractions.json
async function fetchData() {
    const getData = await fetch(JSON_PATH);
    data = await getData.json();
    console.log(data);
    return data;
}

// CODE FROM GOOGLE MAPS API DOCUMENTATION
async function initMap() {
    const { Map } = await google.maps.importLibrary("maps")
    const { spherical } = await google.maps.importLibrary("geometry")

    const position = { lat: 53.4152431, lng: -7.9559668 };
    map = new google.maps.Map(document.getElementById("game-map-container"), {
        center: position,
        zoom: 7,
        streetViewControl: false,
        mapId: "47f8f1437cc57452", // PERSONAL GMAPS ID WITH CUSTOM STYLES
        clickableIcons: false //DISABLES NATIVE CLICKABLE PLACE ICONS
    });

    map.addListener('click', (event) => {
        // console.log(event)
        let userClick = event.latLng
        let lat = userClick.lat();
        let lng = userClick.lng();
        userGuessResult = { lat: lat, lng: lng }
        // console.log(userGuessResult)
        google.maps.event.clearInstanceListeners(map);
        roundNumber++
        console.log(roundNumber)
        getDistance();

    })
}

// CALC DISTANCE BETWEEN GUESS AND STREET VIEW LOCATIONS
const getDistance = async() => {
    const calcDistance = google.maps.geometry.spherical.computeDistanceBetween(userGuessResult, streetPosition)
    // console.log(calcDistance)
    // console.log(userGuessResult, streetPosition)
    const lineIcons = [
        {
            fixedRotation: false,
            offset: '0%',
            icon: {
                path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
                scale: 4,
                fillOpacity: 1,
                fillColor: '#ffffff',
                strokeOpacity: 1,
                strokeColor: '#000000',
                strokeWeight: 1
            },
        },
        {
            fixedRotation: true,
            offset: '100%',
            icon: {
                path: google.maps.SymbolPath.CIRCLE,
                scale: 6,
                fillOpacity: 1,
                fillColor: '#ffffff',
                strokeOpacity: 1,
                strokeColor: '#000000',
                strokeWeight: 1
            },
        }
    ]
    const drawLine = new google.maps.Polyline(
        {
            path: [userGuessResult, streetPosition],
            visible: true,
            map: map,
            strokeWeight: 5,
            strokeColor: "#008080",
            icons: lineIcons
        }
    )

    const calcScore = async () => {
        if (calcDistance < 200) {
            score = score += 1000;
            // console.log(score)
        }
        else if (calcDistance < 1000) {
            score = score += 900;
            // console.log(score)
        }
        else if (calcDistance < 5000) {
            score = score += 700;
            // console.log(score)
        }
        else if (calcDistance < 10000) {
            score = score += 500;
            // console.log(score)
        }
        else if (calcDistance < 25000) {
            score = score += 350;
            // console.log(score)
        }
        else if (calcDistance < 50000) {
            score = score += 200;
            // console.log(score)
        }
        else if (calcDistance < 100000) {
            score = score += 100;
            // console.log(score)
        }
        else score = score += 0;

        // ADD SCORE AND LOCATION TO SCOREBOARD
        document.querySelector('.game-scoreboard .game-text-content-header').innerText = `Score: ${score}/5000`;
        document.querySelector('.game-scoreboard .game-text-content-paragraph').innerHTML = `Place: ${data[streetLocationIndex].Name}, ${data[streetLocationIndex].AddressRegion} <br> Your guess was within ${(calcDistance/1000).toFixed(1)}km`;
        document.querySelector('.game-round-number').innerText = `Round ${roundNumber} of 5`

        // REMOVE CURRENT LOCATION FROM LOCATIONS ARRAY SO NOT REPEATED
        data.splice(streetLocationIndex, 1);

        // RESTART LOCATIONS LIST IF ALL EXHAUSTED
        if (data.length === 0) {
            data = await fetchData();
        }

        // SHOW SCOREBOARD
        let scoreboard = document.querySelector('.game-scoreboard')
        scoreboard.classList.remove('hidden')
        let btn = document.querySelector('.game-scoreboard .game-play-button')
        await changeStreetView();

        // RESTART WHEN BUTTON CLICK
        btn.addEventListener('click', () => {
            scoreboard.classList.add('hidden')
            drawLine.setMap(null);
            initMap();
        })

        if(roundNumber === 5){
            document.querySelector('.game-scoreboard .game-text-content-header').innerText = `Final Score: ${score}/5000`;
            document.querySelector('.game-scoreboard .game-text-content-header').style.color = '#fff'
            document.querySelector('.game-round-number').style.color = '#fff'
            document.querySelector('.game-scoreboard .game-text-content-paragraph').style.color = '#fff'
            btn.innerText = 'Play again'
            btn.classList.remove('game-play-button')
            btn.classList.add('game-play-again-button')
            scoreboard.style.backgroundColor = '#008080'
            roundNumber = 0;
            score = 0;

            btn.addEventListener('click', () => {
                scoreboard.style.backgroundColor = '#fff'
                document.querySelector('.game-scoreboard .game-text-content-header').style.color = '#008080'
                document.querySelector('.game-round-number').style.color = '#008080'
                document.querySelector('.game-scoreboard .game-text-content-paragraph').style.color = '#000'
                btn.innerText = 'Next round'
                btn.classList.add('game-play-button')
                btn.classList.remove('game-play-again-button')    
            })
        }
    }
    calcScore();
}

const changeStreetView = async () => {
    streetLocationIndex = Math.floor(Math.random() * data.length);
    const { Name, Latitude, Longitude } = data[streetLocationIndex];

    // DEFINE LATLNG OBJ FOR STREET VIEW POSITION
    streetPosition = { lat: Latitude, lng: Longitude }
    panorama.setPosition(streetPosition)
}

let newStreetViewPano;
let streetLocationIndex;

async function initStreetView () {
    const {StreetViewPanorama} = await google.maps.importLibrary("streetView")
    panorama = new StreetViewPanorama(
      document.querySelector('#game-street-container'), {
            addressControl: false, // REMOVES OVERLAY SHOWING STREET VIEW LOCATION
            showRoadLabels: false, // HIDES ROAD LABELS
            disableDefaultUI: true, // TURNS OFF STREET VIEW UI
            clickToGo: false, // DISABLES ABILITY TO MOVE
            fullscreenControl: true,
            fullscreenControlOptions: true
      })
  }

// DEFINE PLAY BUTTON
let playBtn = document.querySelector('.game-play-button')
let gameIntroHeader = document.querySelector('.game-text-content-header')
let gameIntroText = document.querySelector('.game-text-content-paragraph')
let gameIntroOverlay = document.querySelector('.game-container-overlay')

let isClicked = false;

// LISTEN FOR PLAY BUTTON CLICK
playBtn.addEventListener('click', () => {
    isClicked = !isClicked;
    if (isClicked) {
        gameIntroHeader.innerText = 'How to play'
        gameIntroText.innerText = 'You are dropped at a random attraction on the island of Ireland. Guess the location by clicking the map - the closer you are, the more points you get!'
        playBtn.innerText = 'Play'
    }
    else {
        gameIntroHeader.classList.add('hidden')
        gameIntroText.classList.add('hidden')
        playBtn.classList.add('hidden')
        gameIntroOverlay.classList.add('hidden')
    }
})

async function main() {
    await fetchData();
    await initMap();
    await initStreetView();
    changeStreetView();
}

main();