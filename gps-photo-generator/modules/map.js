// MAP MODULE
// Handles map, coordinates, and location detection

let map
let marker


// initialize map

function initMap()
{

const defaultPos = [20.5937,78.9629]

map = L.map("map").setView(defaultPos,5)

L.tileLayer(
"https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
{
maxZoom:19,
attribution:"© OpenStreetMap"
}
).addTo(map)

map.on("click", onMapClick)

}


// handle map click

function onMapClick(e)
{

const lat = e.latlng.lat
const lon = e.latlng.lng

setMarker(lat,lon)

fetchAddress(lat,lon)

updateOverlay(lat,lon)

}


// place marker

function setMarker(lat,lon)
{

if(marker)
{
marker.remove()
}

marker = L.marker([lat,lon]).addTo(map)

map.setView([lat,lon],14)

}


// convert DMS → decimal

function dmsToDecimal(deg,min,sec,dir)
{

let dec =
Number(deg) +
Number(min)/60 +
Number(sec)/3600

if(dir==="S" || dir==="W")
{
dec *= -1
}

return dec

}


// parse coordinate string

function parseCoords(text)
{

// expected format: 13.125073, 80.251718

const parts = text.split(",")

if(parts.length !== 2)
{
alert("Invalid coordinate format")
return null
}

const lat = parseFloat(parts[0].trim())
const lon = parseFloat(parts[1].trim())

if(isNaN(lat) || isNaN(lon))
{
alert("Invalid coordinate numbers")
return null
}

return {lat,lon}

}


// locate from pasted coordinates

function locateFromInput()
{

const txt =
document.getElementById("coordInput").value

const res = parseCoords(txt)

if(!res) return

setMarker(res.lat,res.lon)

fetchAddress(res.lat,res.lon)

updateOverlay(res.lat,res.lon)

}


// reverse geocode coordinates → address

function fetchAddress(lat,lon)
{

const url =
"https://nominatim.openstreetmap.org/reverse?format=json&lat="
+ lat +
"&lon=" +
lon

fetch(url)
.then(r=>r.json())
.then(data=>{

if(data && data.display_name)
{
document.getElementById("locText").innerText =
data.display_name

document.getElementById("ovLocation").innerText =
data.display_name
}

})
.catch(err=>console.log(err))

}


// current GPS location

function useCurrentLocation()
{

if(!navigator.geolocation)
{
alert("GPS not supported")
return
}

navigator.geolocation.getCurrentPosition(pos=>{

const lat = pos.coords.latitude
const lon = pos.coords.longitude

setMarker(lat,lon)

fetchAddress(lat,lon)

updateOverlay(lat,lon)

})

}


// update overlay coordinate display

function updateOverlay(lat,lon)
{

document.getElementById("ovLat").innerText =
"Lat " + lat.toFixed(6)

document.getElementById("ovLon").innerText =
"Lon " + lon.toFixed(6)

}


// event listeners

document.addEventListener("DOMContentLoaded",()=>{

initMap()

document
.getElementById("locateBtn")
.addEventListener("click",locateFromInput)

document
.getElementById("useGPS")
.addEventListener("click",useCurrentLocation)

})