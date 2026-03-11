// IMAGE MODULE
// Handles image upload and editor rendering


let imgElement = document.getElementById("img")
let imgInput = document.getElementById("imgInput")


// handle image upload

function loadImage(file)
{

if(!file) return

if(!file.type.startsWith("image"))
{
alert("Please upload a valid image")
return
}

const reader = new FileReader()

reader.onload = function(e)
{

imgElement.src = e.target.result

// show overlay after image loads
resetOverlay()

}

reader.readAsDataURL(file)

}


// reset overlay values when new image loads

function resetOverlay()
{

document.getElementById("ovLocation").innerText = ""

document.getElementById("ovLat").innerText = ""

document.getElementById("ovLon").innerText = ""

document.getElementById("ovDate").innerText = ""

document.getElementById("ovTime").innerText = ""

}


// handle input change

function onImageSelect(e)
{

const file = e.target.files[0]

loadImage(file)

}


// event listener

document.addEventListener("DOMContentLoaded",()=>{

imgInput.addEventListener("change",onImageSelect)

})