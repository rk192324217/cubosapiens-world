// APP CONTROLLER
// Initializes CUBO GPS CAM

document.addEventListener("DOMContentLoaded", initApp)

function initApp()
{

console.log("CUBO GPS CAM initialized")

initializeTheme()

addThemeToggle()

}


// Apply saved theme on load

function initializeTheme()
{

const savedTheme = localStorage.getItem("theme")

if(savedTheme === "dark")
{
document.body.classList.add("dark")
}

}


// FIX: dark mode toggle was never wired to any UI element.
// This creates a toggle button in the header so users can actually switch themes.

function addThemeToggle()
{

const header = document.querySelector("header")

const toggleBtn = document.createElement("button")

toggleBtn.id = "themeToggle"

toggleBtn.title = "Toggle dark mode"

toggleBtn.style.cssText =
"position:absolute;" +
"right:20px;" +
"top:50%;" +
"transform:translateY(-50%);" +
"background:none;" +
"border:2px solid #ccc;" +
"border-radius:8px;" +
"padding:6px 12px;" +
"cursor:pointer;" +
"font-size:14px;"

updateToggleLabel(toggleBtn)

toggleBtn.addEventListener("click", () =>
{

document.body.classList.toggle("dark")

const isDark = document.body.classList.contains("dark")

localStorage.setItem("theme", isDark ? "dark" : "light")

updateToggleLabel(toggleBtn)

})

// header needs position:relative for the absolute button to sit inside it
header.style.position = "relative"

header.appendChild(toggleBtn)

}


function updateToggleLabel(btn)
{

const isDark = document.body.classList.contains("dark")

btn.textContent = isDark ? "☀ Light" : "☾ Dark";
btn.style.color       = isDark ? "#e34949" : "#111"
btn.style.borderColor = isDark ? "#e34949" : "#000000"

}