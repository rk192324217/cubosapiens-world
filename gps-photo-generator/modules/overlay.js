// OVERLAY MODULE
// Handles overlay data and rendering

const overlayData =
{
location:"",
address:"",
lat:"",
lon:"",
date:"",
time:""
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



// render overlay DOM labels + re-render canvas preview

function renderOverlay()
{

document.getElementById("ovLocation").innerText =
overlayData.location

document.getElementById("ovLat").innerText =
overlayData.lat ? "Lat " + overlayData.lat : ""

document.getElementById("ovLon").innerText =
overlayData.lon ? "Lon " + overlayData.lon : ""

document.getElementById("ovDate").innerText =
overlayData.date

document.getElementById("ovTime").innerText =
overlayData.time

// FIX: trigger canvas re-render whenever overlay data changes
const img = document.getElementById("img")

if(img && img.src && img.naturalWidth > 0)
{
updatePreview()
}

}