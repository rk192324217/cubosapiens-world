// RENDERER MODULE
// Generates the GPS overlay image and updates preview

let isRendering = false



async function renderFinalImage()
{

// FIX: early return no longer leaves isRendering=true permanently
if(isRendering) return null

const originalImg = document.getElementById("img")

if(!originalImg || !originalImg.src || originalImg.naturalWidth === 0)
{
return null
}

isRendering = true

try
{

const canvas = document.createElement("canvas")
const ctx = canvas.getContext("2d")

const width = originalImg.naturalWidth
const height = originalImg.naturalHeight

canvas.width = width
canvas.height = height


// draw base image

ctx.drawImage(originalImg,0,0,width,height)



// overlay configuration

const margin = height * 0.03

const overlayWidth = width * 0.9
const overlayHeight = height * 0.18

const overlayX = (width - overlayWidth)/2
const overlayY = height - overlayHeight - margin

const padding = overlayHeight * 0.1



// overlay background

ctx.fillStyle = "rgba(0,0,0,0.55)"

ctx.fillRect(
overlayX,
overlayY,
overlayWidth,
overlayHeight
)



// map preview

const mapSize = overlayHeight - padding*2

const mapX = overlayX + padding
const mapY = overlayY + padding


const lat = overlayData.lat
const lon = overlayData.lon



if(lat && lon)
{

const mapURL =
"https://staticmap.openstreetmap.de/staticmap.php?center="
+ lat + "," + lon +
"&zoom=17&size=200x200&markers="
+ lat + "," + lon + ",red"

try
{

const mapImg = await loadImage(mapURL)

ctx.drawImage(
mapImg,
mapX,
mapY,
mapSize,
mapSize
)

}
catch(err)
{
console.warn("Map preview failed:", err.message)
}

}



// text area

const textX = mapX + mapSize + padding

let textY = mapY + overlayHeight*0.18

ctx.fillStyle = "white"



// location

ctx.font = "bold " + Math.floor(overlayHeight*0.22) + "px Arial"

if(overlayData.location)
{

ctx.fillText(
overlayData.location,
textX,
textY
)

}



// address (skip — location already contains address from reverse geocode)

textY += overlayHeight*0.22



// coordinates

ctx.font = Math.floor(overlayHeight*0.14) + "px Arial"

if(lat && lon)
{

ctx.fillText(
"Lat " + lat + "°   Lon " + lon + "°",
textX,
textY
)

}



// datetime

textY += overlayHeight*0.18

if(overlayData.date || overlayData.time)
{

ctx.fillText(
(overlayData.date || "") + "  " + (overlayData.time || ""),
textX,
textY
)

}



isRendering = false

return canvas

}
catch(err)
{
// FIX: always reset lock even if something throws
console.error("Render error:", err)
isRendering = false
return null
}

}



// preview trigger

async function updatePreview()
{

const img = document.getElementById("img")

if(!img || !img.src || img.naturalWidth === 0) return

// use a short debounce so rapid overlay changes don't stack up
clearTimeout(updatePreview._timer)

updatePreview._timer = setTimeout(async ()=>{

await renderFinalImage()

}, 80)

}



// text wrap helper

function drawWrappedText(ctx,text,x,y,maxWidth,lineHeight)
{

const words = text.split(" ")

let line = ""

for(let n=0;n<words.length;n++)
{

const testLine = line + words[n] + " "

const metrics = ctx.measureText(testLine)

const testWidth = metrics.width

if(testWidth > maxWidth && n > 0)
{
ctx.fillText(line,x,y)
line = words[n] + " "
y += lineHeight
}
else
{
line = testLine
}

}

ctx.fillText(line,x,y)

}



// safe image loader

function loadImage(src)
{

return new Promise((resolve,reject)=>{

const img = new Image()

img.crossOrigin = "anonymous"

img.onload = () => resolve(img)

img.onerror = reject

img.src = src

})

}