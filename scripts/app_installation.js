// Installers ---------------------------------------------------------------
let installPrompt = null
// Dom references
const installButton = document.getElementById("installButton") // Button for installing
const installInstructions = document.getElementById("installInstructions") // Install instructions
// Install listeners
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
if(isMobile){
    window.addEventListener("appinstalled", startExperiment) // Not a guarantee but this is supposed to work
    window.addEventListener("load", startExperiment) // Load event also fires when opened up
    document.addEventListener('visibilitychange', startExperiment) // Hacky but fires on switch from browser to standalone
} else {
    installInstructions.hidden = true
    document.getElementById('consentPage').hidden = false
    currentPage = "consentPage"
}


// IF INSTALLED, START ********************
// Check PWA mode
function inStandalone(){
    return window.matchMedia("(display-mode: fullscreen)").matches || // Android - note standalone will not match if mode:fullscreen
    window.matchMedia('(display-mode: standalone)').matches || // Allows for use on computer PWA not on fullscreen
    window.navigator.standalone || // iOS
    document.referrer.includes("android-app://") // Android 2
}

// Start the experiment if install, load, visibility change, or not in mobile
function startExperiment(){
    if((inStandalone() && !installInstructions.hidden)){ // If installation instructions not hidden yet
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


