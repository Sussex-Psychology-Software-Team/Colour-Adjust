// Installers ---------------------------------------------------------------
let installPrompt = null
// Dom references
const installInstructions = document.getElementById("installInstructions") // Install instructions
// Install listeners
addInstallListeners() // add these regardless - allows for pwa on computer and better testing
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
console.log(isMobile)
if(!isMobile){
    startExperiment() // if mobile 
}

// INSTALLING ********************
function addInstallListeners(){

    // Install button and prompt
    // https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/How_to/Trigger_install_prompt
    const installButton = document.getElementById("installButton") // Button for installing
    window.addEventListener("beforeinstallprompt", enableInstallButton) // Fires if install available on chromium browsers

    function enableInstallButton(e){
        //e.preventDefault() // prevents popup install prompt
        installPrompt = e
        installButton.hidden = false
    }

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
    

    // Start the experiment when installed
    function inStandalone(){
        return window.matchMedia("(display-mode: fullscreen)").matches || // Android - note standalone will not match if mode:fullscreen
        window.matchMedia('(display-mode: standalone)').matches || // Allows for use on computer PWA
        window.navigator.standalone || // iOS
        document.referrer.includes("android-app://") // Android 2
    }

    console.log(inStandalone())

    function startPWA(){
        // If in PWA mode and installation instructions not hidden yet
        if(inStandalone() && !installInstructions.hidden){
            disableInAppInstallPrompt()
            startExperiment()
            if(isMobile) initOrientationCheck()
        }
    }
    // Attach listeners
    window.addEventListener("appinstalled", startPWA) // Not a guarantee but this is supposed to work
    window.addEventListener("load", startPWA) // Load event also fires when opened up
    document.addEventListener('visibilitychange', startPWA) // Hacky but fires on switch from browser to standalone
}

function startExperiment(){
    installInstructions.hidden = true
    document.getElementById('consentPage').hidden = false
}


