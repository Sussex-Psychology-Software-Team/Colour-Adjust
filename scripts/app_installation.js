// Installers ---------------------------------------------------------------
let installPrompt = null
// Dom references
const installButton = document.getElementById("installButton") // Button for installing
const installInstructions = document.getElementById("installInstructions") // Install instructions
// Install listeners
window.addEventListener("appinstalled", startExperiment)
window.addEventListener("load", startExperiment) //when opened up
document.addEventListener('visibilitychange', startExperiment) //hacky but fires on switch from browser to standalone


// INSTALLING ********************
// https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/How_to/Trigger_install_prompt
window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault()
    installPrompt = e
    installButton.hidden = false
})

installButton.addEventListener("click", async () => {
    if (!installPrompt) { return }
    const result = await installPrompt.prompt()
    console.log(`Install prompt was: ${result.outcome}`)
    disableInAppInstallPrompt()
})

function disableInAppInstallPrompt() {
    installPrompt = null
    installButton.hidden = true
}



// SHOW/HIDE MATERIALS  ********************
// Show and hide materials on change
function showMaterials(){
    // Note listener is removed after trials are complete
    if(Object.keys(data.consent).length === 0) document.getElementById('trialsPage').hidden = false
    else if(colours.length === 5) document.getElementById('trialsPage').hidden = false // If no colours removed yet
    else trialsPage.hidden = false // Else show the current trial
}

function hideMaterials(){
    // hide everything
    document.getElementById('consentPage').hidden = true
    document.getElementById('confirmSettingsPage').hidden = true
    document.getElementById('trialsPage').hidden = true
}


// PWA MODE ********************
function inStandalone(){
    return window.matchMedia("(display-mode: fullscreen)").matches || // Android - note standalone will not match if mode:fullscreen
    window.navigator.standalone || // iOS
    document.referrer.includes("android-app://") // Android 2
}

window.matchMedia('(display-mode: fullscreen)').addEventListener('change', (e) => {
    if(e.matches || inStandalone()) {
        // Hide Installation instructions
        document.getElementById('browserModeWarning').hidden = true
        installInstructions.hidden = true
        // Show materials then check orientation
        showMaterials()
        checkOrientation()
    } else {
        // Show reinstall prompt - likely not actually relevant to mobile??
        hideMaterials()
        document.getElementById('browserModeWarning').hidden = false
    }
})


// ORIENTATION ********************
// Display warning if not in landscape
function checkOrientation(){
    if(inStandalone()){ // Run if in app mode
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
}

// Start the experiment if install load or visibility change triggered
function startExperiment(){
    if(inStandalone() && !installInstructions.hidden){ // If installation instructions not hidden yet
        installInstructions.hidden = true
        disableInAppInstallPrompt()
        // Load Orientation listener
        screen.orientation.addEventListener("change", checkOrientation)
        // Show materials then check orientation
        showMaterials()
        checkOrientation()
    }
}

function landscapeLock(){
    // Support is terrible for this https://developer.mozilla.org/en-US/docs/Web/API/ScreenOrientation/lock#browser_compatibility
    // Includes chrome on iOS not working - only place I really need it - removed for now
    if(screen.orientation.lock) screen.orientation.lock('landscape')
    .then(() => {console.log('locked to: ' + screen.orientation.type)})
    .catch((err) => { console.log('error: ' + err) });
}