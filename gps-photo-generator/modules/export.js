// EXPORT MODULE

document.addEventListener("DOMContentLoaded", () => {

const btn = document.getElementById("exportBtn")

btn.addEventListener("click", exportImage)

})

async function exportImage()
{

// FIX: guard against null return when no image is loaded or render is busy
const canvas = await renderFinalImage()

if(!canvas)
{
alert("Please upload an image first.")
return
}

const link = document.createElement("a")

link.download = generateFileName()

link.href = canvas.toDataURL("image/png")

link.click()

}

function generateFileName()
{

const now = new Date()

const date = now.toISOString().slice(0,10)

const time = now.toTimeString().slice(0,5).replace(":","-")

return "CuboGPS-" + date + "_" + time + ".png"

}