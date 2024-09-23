// SHOW/HIDE MATERIALS  ********************
// Show and hide materials on change
let currentPage = 'consentPage'

function showMaterials(){
    // Note listener is removed after trials are complete
    document.getElementById(currentPage).hidden = false
}

function hideMaterials(){
    // hide everything
    const pages = document.getElementsByClassName('page')
    for(let p=0; p<pages.length; p++){
        pages[p].hidden = true
    }
}

// ORIENTATION LISTENERS ********************
// Display warning if not in landscape
function checkOrientation(){
    if(screen.orientation.type === 'portrait-primary' || screen.orientation.type === 'portrait-secondary'){
        // If in portrait hide materials and show warning
        hideMaterials()
        document.getElementById('orientationWarning').hidden = false
    } else {
        // If landscape show relevant materials
        document.getElementById('orientationWarning').hidden = true
        showMaterials()
    }
}

function initOrientationCheck(){
    // Load Orientation listener
    screen.orientation.addEventListener("change", checkOrientation)
    checkOrientation()
}