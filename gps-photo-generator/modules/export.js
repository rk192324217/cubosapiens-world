// EXPORT MODULE
// Handles exporting the final GPS image


const exportBtn =
document.getElementById("exportBtn")

const imgBox =
document.getElementById("imgBox")



// export image

async function exportImage()
{

try
{

const canvas = await html2canvas(
imgBox,
{
scale:2,
useCORS:true
}
)

const data =
canvas.toDataURL("image/png")

downloadImage(data)

}

catch(err)
{
console.error("Export failed",err)
}

}



// download generated image

function downloadImage(dataURL)
{

const link =
document.createElement("a")

link.href = dataURL

link.download = generateFileName()

link.click()

}



// generate file name

function generateFileName()
{

const now = new Date()

const date =
now.toISOString().slice(0,10)

const time =
now.toTimeString().slice(0,5).replace(":","-")

return "cubo-gps-" + date + "-" + time + ".png"

}



// event listener

document.addEventListener("DOMContentLoaded",()=>{

exportBtn.addEventListener("click",exportImage)

})