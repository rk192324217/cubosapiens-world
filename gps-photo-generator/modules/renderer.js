// RENDERER MODULE
// Layout matches reference template exactly:
//
// [TOP-RIGHT]  🌐 CUBO GPS CAM  (logo badge)
//
// ┌─────────────────────────────────────────────────────────┐
// │ [satellite]  City, State, Country 🇮🇳  ← large bold     │
// │  [Google]    Full address, pincode                      │
// │              Lat xx.xxxxxx° Long xx.xxxxxx°             │
// │              Weekday, DD/MM/YYYY  HH:MM AM  GMT+05:30   │
// └─────────────────────────────────────────────────────────┘

let isRendering = false



async function renderFinalImage()
{

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
const ctx    = canvas.getContext("2d")

const W = originalImg.naturalWidth
const H = originalImg.naturalHeight

canvas.width  = W
canvas.height = H

// ── 1. Base photo ─────────────────────────────────────────
ctx.drawImage(originalImg, 0, 0, W, H)


// ── 2. Geometry (all proportional to image size) ──────────

// Overlay sits at bottom, leaves a small margin on all sides
const MARGIN  = Math.round(H * 0.028)
const OVH     = Math.round(H * 0.215)          // overlay height
const OVW     = Math.round(W * 0.93)           // overlay width
const OVX     = Math.round((W - OVW) / 2)
const OVY     = H - OVH - MARGIN
const RADIUS  = Math.round(OVH * 0.075)
const PAD     = Math.round(OVH * 0.085)        // inner padding

// Satellite thumbnail — square, flush left inside overlay
const MAP_SIZE = OVH - PAD * 2
const MAP_X    = OVX + PAD
const MAP_Y    = OVY + PAD

// Text column starts just right of thumbnail
const TEXT_X  = MAP_X + MAP_SIZE + Math.round(PAD * 1.4)
const TEXT_W  = OVX + OVW - TEXT_X - PAD

// Font sizes — city ~2.5× the info lines (matches reference ratio)
const FS_CITY  = Math.round(OVH * 0.175)   // ~large bold
const FS_INFO  = Math.round(OVH * 0.110)   // address / coords / datetime (all equal)
const LH_INFO  = Math.round(FS_INFO * 1.38) // line-height for info rows


// ── 3. Overlay background ─────────────────────────────────
ctx.save()
roundRect(ctx, OVX, OVY, OVW, OVH, RADIUS)
ctx.fillStyle = "rgba(15, 15, 15, 0.74)"
ctx.fill()
ctx.restore()


// ── 4. Satellite thumbnail ────────────────────────────────
const lat = overlayData.lat
const lon = overlayData.lon

if(lat && lon)
{
// Tighter bbox → more zoomed (0.001° ≈ ~100 m each side)
const esriURL =
"https://server.arcgisonline.com/ArcGIS/rest/services/" +
"World_Imagery/MapServer/export" +
"?bbox=" + getBbox(parseFloat(lat), parseFloat(lon), 0.001) +
"&bboxSR=4326&size=512,512&imageSR=102100&format=png&f=image"

try
{
const mapImg = await loadImage(esriURL)

// Clip to rounded square
ctx.save()
roundRect(ctx, MAP_X, MAP_Y, MAP_SIZE, MAP_SIZE, RADIUS * 0.55)
ctx.clip()
ctx.drawImage(mapImg, MAP_X, MAP_Y, MAP_SIZE, MAP_SIZE)
ctx.restore()

// no watermark
}
catch(e)
{
// Fallback placeholder
ctx.save()
roundRect(ctx, MAP_X, MAP_Y, MAP_SIZE, MAP_SIZE, RADIUS * 0.55)
ctx.fillStyle = "#1c2b1c"
ctx.fill()
ctx.restore()
ctx.font = Math.round(MAP_SIZE * 0.35) + "px Arial"
ctx.textAlign = "center"
ctx.textBaseline = "middle"
ctx.fillStyle = "rgba(255,255,255,0.3)"
ctx.fillText("📍", MAP_X + MAP_SIZE / 2, MAP_Y + MAP_SIZE / 2)
ctx.textAlign    = "left"
ctx.textBaseline = "top"
}

// Red pin marker in centre of thumbnail
drawPin(ctx, MAP_X + MAP_SIZE / 2, MAP_Y + MAP_SIZE / 2, MAP_SIZE * 0.11)
}


// ── 5. Text ───────────────────────────────────────────────
ctx.textBaseline = "top"
ctx.shadowBlur   = 0

// Vertical start — centre the text block within the overlay
// We have: city line + 3 info lines = 4 rows
const totalTextH = FS_CITY * 1.3 + LH_INFO * 3
const textBlockY = MAP_Y + Math.round((MAP_SIZE - totalTextH) / 2)
let TY = textBlockY


// Line 1 — City, State, Country 🇮🇳  (large bold white)
const flag      = countryCodeToFlag(overlayData.countryCode)
// const flag = `<span class="fi fi-${overlayData.countryCode.toLowerCase()}"></span>`
const cityParts = [overlayData.city, overlayData.state, overlayData.country].filter(Boolean)
const cityLine  = cityParts.join(", ") + (flag ? " " + flag : "")

ctx.font      = "700 " + FS_CITY + "px -apple-system, 'Helvetica Neue', Arial, sans-serif"
ctx.fillStyle = "#ffffff"
ctx.fillText(clipText(ctx, cityLine || overlayData.location, TEXT_W), TEXT_X, TY)

TY += Math.round(FS_CITY * 1.30)


// Line 2 — Full address (single line, clipped with ellipsis)
const address = overlayData.location || ""

ctx.font      = FS_INFO + "px -apple-system, 'Helvetica Neue', Arial, sans-serif"
ctx.fillStyle = "rgba(255,255,255,0.88)"
ctx.fillText(clipText(ctx, address, TEXT_W), TEXT_X, TY)

TY += LH_INFO


// Line 3 — Lat xx.xxxxxx° Long xx.xxxxxx°  (note: "Long" matches reference)
if(lat && lon)
{
const coordLine = "Lat " + lat + "°  Long " + lon + "°"
ctx.font      = FS_INFO + "px -apple-system, 'Helvetica Neue', Arial, sans-serif"
ctx.fillStyle = "rgba(255,255,255,0.88)"
ctx.fillText(coordLine, TEXT_X, TY)
}

TY += LH_INFO


// Line 4 — Weekday, DD/MM/YYYY  HH:MM AM  GMT+05:30
const dtLine = buildDateTimeLine()
ctx.font      = FS_INFO + "px -apple-system, 'Helvetica Neue', Arial, sans-serif"
ctx.fillStyle = "rgba(255,255,255,0.88)"
ctx.fillText(dtLine, TEXT_X, TY)


// ── 6. Logo badge (top-right corner) ─────────────────────
drawLogoBadge(ctx, W, MARGIN, Math.round(H * 0.048))


isRendering = false
return canvas

}
catch(err)
{
console.error("Render error:", err)
isRendering = false
return null
}

}



// ── Logo badge — top right ────────────────────────────────────────────────────
// Renders:  🌐 CUBO GPS CAM  on a dark pill

function drawLogoBadge(ctx, W, margin, badgeH)
{

const fontSize  = Math.round(badgeH * 0.44)
const iconSize  = Math.round(badgeH * 0.52)
const padX      = Math.round(badgeH * 0.5)
const padY      = Math.round((badgeH - fontSize) / 2)
const gap       = Math.round(badgeH * 0.28)
const radius    = Math.round(badgeH * 0.28)

ctx.font = "600 " + fontSize + "px -apple-system, 'Helvetica Neue', Arial, sans-serif"

const label     = "CUBO GPS CAM"
const textW     = ctx.measureText(label).width
const badgeW    = padX + iconSize + gap + textW + padX

const bx        = W - badgeW - margin
const by        = margin

// Badge pill background
ctx.save()
roundRect(ctx, bx, by, badgeW, badgeH, radius)
ctx.fillStyle = "rgba(15,15,15,0.78)"
ctx.fill()
ctx.restore()

// Globe icon (emoji rendered as canvas text)
const iconFont = iconSize + "px Arial"
ctx.font = iconFont
ctx.textBaseline = "middle"
ctx.textAlign    = "left"
ctx.fillStyle    = "white"
ctx.fillText("🌐", bx + padX, by + badgeH / 2)

// Label text
ctx.font = "600 " + fontSize + "px -apple-system, 'Helvetica Neue', Arial, sans-serif"
ctx.fillStyle = "white"
ctx.fillText(label, bx + padX + iconSize + gap, by + badgeH / 2)

ctx.textBaseline = "top"
ctx.textAlign    = "left"

}



// ── Date/time line builder ─────────────────────────────────────────────────────
// Output: "Saturday, 07/03/2026  09:45 AM  GMT+05:30"

function buildDateTimeLine()
{

const dateStr = document.getElementById("date").value   // YYYY-MM-DD
const timeStr = document.getElementById("time").value   // HH:MM

// Formatted date: "Saturday, 07/03/2026"
let datePart = ""
if(dateStr)
{
const d = new Date(dateStr + "T00:00:00")
const weekday = d.toLocaleDateString("en-US", { weekday: "long" })
const day     = String(d.getDate()).padStart(2, "0")
const month   = String(d.getMonth() + 1).padStart(2, "0")
const year    = d.getFullYear()
datePart = weekday + ", " + day + "/" + month + "/" + year
}

// Formatted time: "09:45 AM"
let timePart = ""
if(timeStr)
{
const [h, m] = timeStr.split(":").map(Number)
const ampm   = h >= 12 ? "PM" : "AM"
const h12    = h % 12 === 0 ? 12 : h % 12
timePart = String(h12).padStart(2, "0") + ":" + String(m).padStart(2, "0") + " " + ampm
}

// GMT offset: "GMT+05:30"
const gmtOffset = getGMTOffset()

return [datePart, timePart, gmtOffset].filter(Boolean).join("  ")

}


// Returns "GMT+05:30" or "GMT-08:00" etc.

function getGMTOffset()
{

const offset    = -new Date().getTimezoneOffset()   // minutes, positive = ahead of UTC
const sign      = offset >= 0 ? "+" : "-"
const absOffset = Math.abs(offset)
const hours     = String(Math.floor(absOffset / 60)).padStart(2, "0")
const minutes   = String(absOffset % 60).padStart(2, "0")

return "GMT" + sign + hours + ":" + minutes

}



// ── Helpers ───────────────────────────────────────────────────────────────────


function getBbox(lat, lon, delta)
{
return [
(lon - delta).toFixed(6),
(lat - delta).toFixed(6),
(lon + delta).toFixed(6),
(lat + delta).toFixed(6)
].join(",")
}


function drawPin(ctx, cx, cy, r)
{
ctx.save()

// Shadow
ctx.shadowColor = "rgba(0,0,0,0.5)"
ctx.shadowBlur  = Math.round(r * 0.5)

// Outer red circle
ctx.beginPath()
ctx.arc(cx, cy, r, 0, Math.PI * 2)
ctx.fillStyle = "#e53935"
ctx.fill()

// Inner white dot
ctx.shadowBlur = 0
ctx.beginPath()
ctx.arc(cx, cy, r * 0.38, 0, Math.PI * 2)
ctx.fillStyle = "white"
ctx.fill()

ctx.restore()
}


function roundRect(ctx, x, y, w, h, r)
{
r = Math.min(r, w / 2, h / 2)
ctx.beginPath()
ctx.moveTo(x + r, y)
ctx.lineTo(x + w - r, y)
ctx.quadraticCurveTo(x + w, y, x + w, y + r)
ctx.lineTo(x + w, y + h - r)
ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
ctx.lineTo(x + r, y + h)
ctx.quadraticCurveTo(x, y + h, x, y + h - r)
ctx.lineTo(x, y + r)
ctx.quadraticCurveTo(x, y, x + r, y)
ctx.closePath()
}


function clipText(ctx, text, maxWidth)
{
if(!text) return ""
if(ctx.measureText(text).width <= maxWidth) return text
while(text.length > 0 && ctx.measureText(text + "…").width > maxWidth)
{
text = text.slice(0, -1)
}
return text + "…"
}


function drawWrappedText(ctx, text, x, y, maxWidth, lineHeight, maxLines)
{
if(!text) return y
const words = text.split(" ")
let line    = ""
let lines   = []
for(const word of words)
{
const test = line ? line + " " + word : word
if(ctx.measureText(test).width > maxWidth && line)
{
lines.push(line)
line = word
if(lines.length >= maxLines) break
}
else
{
line = test
}
}
if(line && lines.length < maxLines) lines.push(line)
for(const l of lines)
{
ctx.fillText(l, x, y)
y += lineHeight
}
return y
}


function loadImage(src)
{
return new Promise((resolve, reject) => {
const img       = new Image()
img.crossOrigin = "anonymous"
img.onload      = () => resolve(img)
img.onerror     = reject
img.src         = src
})
}


async function updatePreview()
{
const img = document.getElementById("img")
if(!img || !img.src || img.naturalWidth === 0) return
clearTimeout(updatePreview._timer)
updatePreview._timer = setTimeout(async () => {
await renderFinalImage()
}, 100)
}