// OVERLAY MODULE
// Handles overlay data and rendering


const overlayData =
{
location : "",
lat : "",
lon : "",
date : "",
time : ""
}



// update location

function setLocation(name)
{

overlayData.location = name

renderOverlay()

}



// update coordinates

function setCoords(lat,lon)
{

overlayData.lat = lat.toFixed(6)

overlayData.lon = lon.toFixed(6)

renderOverlay()

}



// update date

function setDate(date)
{

overlayData.date = date

renderOverlay()

}



// update time

function setTime(time)
{

overlayData.time = time

renderOverlay()

}



// render overlay on image

function renderOverlay()
{

document.getElementById("ovLocation").innerText =
overlayData.location

document.getElementById("ovLat").innerText =
"Lat " + overlayData.lat

document.getElementById("ovLon").innerText =
"Lon " + overlayData.lon

document.getElementById("ovDate").innerText =
overlayData.date

document.getElementById("ovTime").innerText =
overlayData.time

}