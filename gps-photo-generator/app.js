// APP CONTROLLER
// Initializes CUBO GPS CAM


document.addEventListener("DOMContentLoaded", initApp)



function initApp()
{

console.log("CUBO GPS CAM initialized")

initializeTheme()

}



// placeholder for future theme system

function initializeTheme()
{

const savedTheme =
localStorage.getItem("theme")

if(savedTheme === "dark")
{
document.body.classList.add("dark")
}

}