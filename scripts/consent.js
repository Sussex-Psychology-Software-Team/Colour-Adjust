// CONSENT FORM ---------------------------------------------------------------
// add listeners (see below)
document.getElementById('dontRecord').addEventListener('change', removeConsentRequirements);
document.getElementById('consentForm').addEventListener('submit', submitConsent)

// Make "don't record" button remove requirements for other fields
function removeConsentRequirements(e){
    // if checked, don't record, if unchecked, record
    const recordData = !e.target.checked 
    const requiredOpts = document.getElementsByClassName('requiredConsent')
    for(let e=0; e<requiredOpts.length; e++){
        // remove consent requirements if checked and vice versa
        requiredOpts[e].required = recordData
    }
}

function submitConsent(e){
    e.preventDefault()
    const formData = new FormData(e.target)
    const consentData = Object.fromEntries(formData)
    console.log(consentData)
    // Store consent data
    data.consent = {
        futureStudies: ("futureStudies" in consentData), // If unchecked, is left out of object, so use that property here rather than value to get a bool
        consentChecked: ("consentChecked" in consentData), //https://stackoverflow.com/questions/1098040/checking-if-a-key-exists-in-a-javascript-object
        dontRecord: ("dontRecord" in consentData),
        participantID: consentData.codeBirth + consentData.codeName + consentData.codeStreet + consentData.codePhone,
        email: consentData.email
    }
    console.log(data)
    // Next page
    document.getElementById('consentPage').hidden = true;
    document.getElementById('confirmSettingsPage').hidden = false;
    currentPage = 'confirmSettingsPage';
}

document.getElementById('fullscreen').addEventListener('click',(e)=>{
    if(isFullscreen()) {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        } else if (document.mozCancelFullScreen) {
          document.mozCancelFullScreen();
        } else if (document.webkitExitFullscreen) {
          document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
          document.msExitFullscreen();
        }
      } else {
        element = document.documentElement;
        if (element.requestFullscreen) {
          element.requestFullscreen();
        } else if (element.mozRequestFullScreen) {
          element.mozRequestFullScreen();
        } else if (element.webkitRequestFullscreen) {
          element.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
        } else if (element.msRequestFullscreen) {
          element.msRequestFullscreen();
        }
      }
})

function isFullscreen(){
    return document.fullscreenElement ||
    document.webkitFullscreenElement ||
    document.mozFullScreenElement ||
    document.msFullscreenElement
}