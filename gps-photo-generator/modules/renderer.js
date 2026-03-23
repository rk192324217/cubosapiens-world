let isRendering = false

function clamp(v, min, max)
{
return Math.max(min, Math.min(max, v))
}


// ── 🔥 NEW: Measure dynamic text height ─────────────────
function measureTextBlockHeight(ctx, text, maxWidth, lineHeight, maxLines)
{
if(!text) return lineHeight

const words = text.split(" ")
let line = ""
let lines = 0

for(const word of words)
{
const test = line ? line + " " + word : word

if(ctx.measureText(test).width > maxWidth && line)
{
lines++
line = word
if(lines >= maxLines) break
}
else
{
line = test
}
}

if(line) lines++

return Math.min(lines, maxLines) * lineHeight
}


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

ctx.drawImage(originalImg, 0, 0, W, H)


// ── 🔥 GLOBAL SCALE SYSTEM ─────────────────────────────
const BASE_WIDTH = 1000
const scale = clamp(W / BASE_WIDTH, 0.5, 1.6)


// ── Layout ────────────────────────────────────────────
const MARGIN = clamp(Math.round(H * 0.025), 8, 40)
const OVW    = clamp(Math.round(W * 0.80), 260, W - 40)
const OVX    = Math.round((W - OVW) / 2)


// ── Overlay box ───────────────────────────────────────
const OVH = clamp(Math.round(H * 0.22), 100, 220)
const OVY = H - OVH - MARGIN
const RADIUS = clamp(Math.round(16 * scale), 6, 20)


// ── Thumbnail ─────────────────────────────────────────
const MAP_SIZE = clamp(Math.round(W * 0.18 * scale), 60, 150)


// ── Typography ───────────────────────────────────────
const FS_CITY = clamp(Math.round(28 * scale), 16, 42)
const FS_INFO = clamp(Math.round(18 * scale), 10, 24)
const LH_INFO = Math.round(FS_INFO * 1.4)


// ── Padding ──────────────────────────────────────────
const PAD = clamp(Math.round(12 * scale), 6, 18)


// ── Thumbnail Position ───────────────────────────────
const MAP_X = OVX + PAD
const MAP_Y = OVY + Math.round((OVH - MAP_SIZE) / 2)


// ── Text Layout ──────────────────────────────────────
const TEXT_X = MAP_X + MAP_SIZE + Math.round(PAD * 1.8)
const TEXT_W = (OVX + OVW) - TEXT_X - PAD


// ── 🔥 Measure actual text height ─────────────────────
ctx.font = FS_INFO + "px -apple-system, Arial, sans-serif"

const addressHeight = measureTextBlockHeight(
ctx,
overlayData.location || "",
TEXT_W,
LH_INFO,
2
)

const textBlockHeight =
FS_CITY +
addressHeight +
LH_INFO +
LH_INFO +
Math.round(FS_CITY * 0.3)


// ── PERFECT CENTER ALIGNMENT ──────────────────────────
const CONTENT_CENTER_Y = OVY + OVH / 2
const TEXT_Y = CONTENT_CENTER_Y - textBlockHeight / 2


// ── Background ────────────────────────────────────────
ctx.save()
roundRect(ctx, OVX, OVY, OVW, OVH, RADIUS)
ctx.fillStyle = "rgba(15, 15, 15, 0.80)"
ctx.fill()
ctx.restore()


// ── Map Thumbnail ─────────────────────────────────────
const lat = overlayData.lat
const lon = overlayData.lon

if(lat && lon)
{
const esriURL =
"https://server.arcgisonline.com/ArcGIS/rest/services/" +
"World_Imagery/MapServer/export" +
"?bbox=" + getBbox(parseFloat(lat), parseFloat(lon), 0.001) +
"&bboxSR=4326&size=512,512&imageSR=102100&format=png&f=image"

try
{
const mapImg = await loadImage(esriURL)

ctx.save()
roundRect(ctx, MAP_X, MAP_Y, MAP_SIZE, MAP_SIZE, RADIUS * 0.5)
ctx.clip()
ctx.drawImage(mapImg, MAP_X, MAP_Y, MAP_SIZE, MAP_SIZE)
ctx.restore()
}
catch(e)
{
ctx.save()
roundRect(ctx, MAP_X, MAP_Y, MAP_SIZE, MAP_SIZE, RADIUS * 0.5)
ctx.fillStyle = "#1a2a1a"
ctx.fill()
ctx.restore()
}

drawLocationPin(ctx, MAP_X + MAP_SIZE / 2, MAP_Y + MAP_SIZE / 2, MAP_SIZE * 0.1)
}


// ── TEXT ─────────────────────────────────────────────
ctx.textBaseline = "top"
let TY = TEXT_Y


// ── City + Flag ──────────────────────────────────────
const cityParts = [overlayData.city, overlayData.state, overlayData.country].filter(Boolean)
const cityText  = cityParts.join(", ")
const flagCode  = (overlayData.countryCode || "").toLowerCase()

const FLAG_H   = Math.round(FS_CITY * 0.70)
const FLAG_W   = Math.round(FLAG_H * (4 / 3))
const FLAG_GAP = Math.round(FS_CITY * 0.20)

ctx.font = "700 " + FS_CITY + "px -apple-system, Arial, sans-serif"
ctx.fillStyle = "#ffffff"

const availCityW = TEXT_W - (flagCode ? FLAG_W + FLAG_GAP : 0)
const cityClipped = clipText(ctx, cityText, availCityW)
const cityTextWidth = ctx.measureText(cityClipped).width

ctx.fillText(cityClipped, TEXT_X, TY)

if(flagCode)
{
const flagURL = "https://cdn.jsdelivr.net/npm/flag-icons@7.2.3/flags/4x3/" + flagCode + ".svg"

const flagX = TEXT_X + cityTextWidth + FLAG_GAP
const flagY = TY + Math.round((FS_CITY - FLAG_H) / 2)

try
{
const flagImg = await loadImage(flagURL)

ctx.save()
roundRect(ctx, flagX, flagY, FLAG_W, FLAG_H, Math.round(FLAG_H * 0.10))
ctx.clip()
ctx.drawImage(flagImg, flagX, flagY, FLAG_W, FLAG_H)
ctx.restore()
}
catch(e)
{
console.warn("Flag load failed:", flagCode)
}
}

TY += Math.round(FS_CITY * 1.35)


// ── Address ─────────────────────────────────────────
ctx.font      = FS_INFO + "px -apple-system, Arial, sans-serif"
ctx.fillStyle = "rgba(255,255,255,0.88)"

TY = drawWrappedText(ctx, overlayData.location || "", TEXT_X, TY, TEXT_W, LH_INFO, 2)


// ── Coordinates ─────────────────────────────────────
if(lat && lon)
{
const coordLine = "Lat " + lat + "°   Long " + lon + "°"
ctx.fillText(clipText(ctx, coordLine, TEXT_W), TEXT_X, TY)
TY += LH_INFO
}


// ── Date Time ───────────────────────────────────────
const dtLine = buildDateTimeLine()
ctx.fillText(clipText(ctx, dtLine, TEXT_W), TEXT_X, TY)


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


// ── LOCATION PIN ─────────────────────────────────────
function drawLocationPin(ctx, cx, cy, r)
{
ctx.save()

const bodyR   = r
const pinH    = r * 2.4
const tipY    = cy + pinH * 0.5
const centerY = cy - pinH * 0.1

ctx.shadowColor   = "rgba(0,0,0,0.55)"
ctx.shadowBlur    = r * 0.8
ctx.shadowOffsetY = r * 0.3

ctx.beginPath()
ctx.arc(cx, centerY, bodyR, Math.PI, 0, false)
ctx.bezierCurveTo(cx + bodyR, centerY + bodyR * 0.8, cx + bodyR * 0.4, tipY - r * 0.3, cx, tipY)
ctx.bezierCurveTo(cx - bodyR * 0.4, tipY - r * 0.3, cx - bodyR, centerY + bodyR * 0.8, cx - bodyR, centerY)
ctx.closePath()
ctx.fillStyle = "#e53935"
ctx.fill()

ctx.shadowBlur = 0
ctx.beginPath()
ctx.arc(cx, centerY, bodyR * 0.38, 0, Math.PI * 2)
ctx.fillStyle = "white"
ctx.fill()

ctx.restore()
}


// ── DATE TIME ───────────────────────────────────────
function buildDateTimeLine()
{
const dateStr = document.getElementById("date").value
const timeStr = document.getElementById("time").value

let datePart = ""
if(dateStr)
{
const d       = new Date(dateStr + "T00:00:00")
const weekday = d.toLocaleDateString("en-US", { weekday: "long" })
const day     = String(d.getDate()).padStart(2, "0")
const month   = String(d.getMonth() + 1).padStart(2, "0")
const year    = d.getFullYear()
datePart = weekday + ", " + day + "/" + month + "/" + year
}

let timePart = ""
if(timeStr)
{
const [h, m] = timeStr.split(":").map(Number)
const ampm   = h >= 12 ? "PM" : "AM"
const h12    = h % 12 === 0 ? 12 : h % 12
timePart = String(h12).padStart(2, "0") + ":" + String(m).padStart(2, "0") + " " + ampm
}

return [datePart, timePart, getGMTOffset()].filter(Boolean).join("  ")
}

function getGMTOffset()
{
const offset = -new Date().getTimezoneOffset()
const sign   = offset >= 0 ? "+" : "-"
const abs    = Math.abs(offset)
const h      = String(Math.floor(abs / 60)).padStart(2, "0")
const m      = String(abs % 60).padStart(2, "0")
return "GMT" + sign + h + ":" + m
}


// ── HELPERS ─────────────────────────────────────────
function getBbox(lat, lon, delta)
{
return [
(lon - delta).toFixed(6),
(lat - delta).toFixed(6),
(lon + delta).toFixed(6),
(lat + delta).toFixed(6)
].join(",")
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

function drawWrappedText(ctx, text, x, y, maxWidth, lineHeight, maxLines)
{
if(!text) return y + lineHeight

const words = text.split(" ")
let line = ""
let lines = []

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

if(lines.length < maxLines && line)
{
lines.push(line)
}
else if(lines.length >= maxLines && line)
{
lines[maxLines - 1] = clipText(ctx, lines[maxLines - 1] + " " + line, maxWidth)
}

for(const l of lines)
{
ctx.fillText(l, x, y)
y += lineHeight
}

return y
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

function loadImage(src)
{
return new Promise((resolve, reject) => {
const img = new Image()
img.crossOrigin = "anonymous"
img.onload = () => resolve(img)
img.onerror = reject
img.src = src
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