// Installers ---------------------------------------------------------------
let installPrompt = null
// Dom references
const installButton = document.getElementById("installButton") // Button for installing
const installInstructions = document.getElementById("installInstructions") // Install instructions
// Install listeners
window.addEventListener("appinstalled", startExperiment)
window.addEventListener("load", startExperiment) //when opened up
document.addEventListener('visibilitychange', startExperiment) //hacky but fires on switch from browser to standalone

// IF INSTALLED, START ********************
// Start the experiment if install load or visibility change triggered
function startExperiment(){
    if(inStandalone() && !installInstructions.hidden){ // If installation instructions not hidden yet
        installInstructions.hidden = true
        disableInAppInstallPrompt()
        // Load Orientation listener
        screen.orientation.addEventListener("change", checkOrientation)
        // Show materials then check orientation
        document.getElementById('consentPage').hidden = false
        currentPage = "consentPage"
        checkOrientation()
    }
}

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

// CHECK PWA MODE ********************
function inStandalone(){
    return window.matchMedia("(display-mode: fullscreen)").matches || // Android - note standalone will not match if mode:fullscreen
    window.matchMedia('(display-mode: standalone)').matches || // Allows for use on computer PWA not on fullscreen
    window.navigator.standalone || // iOS
    document.referrer.includes("android-app://") // Android 2
}

// Listener to check if they leave PWA MODE - note might have issues on computer
window.matchMedia('(display-mode: fullscreen)').addEventListener('change', (e) => {
    if(e.matches || inStandalone()) {
        // Hide Installation instructions
        document.getElementById('browserModeWarning').hidden = true
        // Show materials then check orientation
        showMaterials()
        checkOrientation()
    } else {
        // Show reinstall prompt - likely not actually relevant to mobile??
        hideMaterials()
        document.getElementById('browserModeWarning').hidden = false
    }
})

