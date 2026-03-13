// IMAGE MODULE

document.addEventListener("DOMContentLoaded", () => {

    const imgInput = document.getElementById("imgInput")

    imgInput.addEventListener("change", handleUpload)

})

function handleUpload(event) {

    const file = event.target.files[0]

    if (!file) return

    const reader = new FileReader()

    reader.onload = function (e) {

        const img = document.getElementById("img")

        img.src = e.target.result

        img.onload = function () {
            // show image, hide placeholder, reveal overlay
            img.classList.add("loaded")
            document.getElementById("imgPlaceholder").classList.add("hidden")
            document.getElementById("overlay").classList.remove("hidden")
            updatePreview()
        }

    }

    reader.readAsDataURL(file)

}