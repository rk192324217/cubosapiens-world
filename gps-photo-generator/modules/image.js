// IMAGE MODULE

document.addEventListener("DOMContentLoaded", () => {

const imgInput = document.getElementById("imgInput")

imgInput.addEventListener("change", handleUpload)

})

function handleUpload(event)
{

const file = event.target.files[0]

if(!file) return

const reader = new FileReader()

// FIX: removed duplicate reader.onload block that was outside the function
// FIX: added img.onload → updatePreview() so canvas renders after image loads
reader.onload = function(e)
{

const img = document.getElementById("img")

img.src = e.target.result

img.onload = function()
{
// FIX: reveal overlay now that an image is present
document.getElementById("overlay").classList.remove("hidden")
updatePreview()
}

}

reader.readAsDataURL(file)

}