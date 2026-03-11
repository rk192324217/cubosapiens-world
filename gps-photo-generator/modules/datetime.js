// DATETIME MODULE
// Handles date, time, and timezone formatting


const dateInput = document.getElementById("date")
const timeInput = document.getElementById("time")



// initialize current date and time

function initDateTime()
{

const now = new Date()

// set date
dateInput.value =
now.toISOString().split("T")[0]

// set time
timeInput.value =
now.toTimeString().slice(0,5)

updateDateTimeOverlay()

}



// format date for overlay

function formatDate(dateStr)
{

if(!dateStr) return ""

const d = new Date(dateStr)

return d.toLocaleDateString(undefined,{
weekday:"long",
day:"2-digit",
month:"2-digit",
year:"numeric"
})

}



// format time for overlay

function formatTime(timeStr)
{

if(!timeStr) return ""

const [h,m] = timeStr.split(":")

const date = new Date()

date.setHours(h)
date.setMinutes(m)

return date.toLocaleTimeString([],{
hour:"2-digit",
minute:"2-digit"
})

}



// get timezone

function getTimezone()
{

return Intl.DateTimeFormat()
.resolvedOptions()
.timeZone

}



// update overlay

function updateDateTimeOverlay()
{

const dateVal = dateInput.value
const timeVal = timeInput.value

const dateText = formatDate(dateVal)
const timeText = formatTime(timeVal)

document.getElementById("ovDate").innerText =
dateText

document.getElementById("ovTime").innerText =
timeText

}



// event listeners

document.addEventListener("DOMContentLoaded",()=>{

initDateTime()

dateInput.addEventListener(
"change",
updateDateTimeOverlay
)

timeInput.addEventListener(
"change",
updateDateTimeOverlay
)

})