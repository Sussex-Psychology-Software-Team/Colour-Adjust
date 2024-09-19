// CONSENT FORM ---------------------------------------------------------------
// add listeners (see below)
document.getElementById('fullConsent').addEventListener('change', toggleIdRequirements)
document.getElementById('dontRecord').addEventListener('change', toggleIdRequirements)

document.getElementById('consentForm').addEventListener('submit', submitConsent)

// Make "don't record" button remove requirements for other fields
function toggleIdRequirements(e){
    // if checked, don't record, if unchecked, record
    const recordData = !document.getElementById('dontRecord').checked 
    const requiredOpts = document.getElementsByClassName('participantCode')
    for(let e=0; e<requiredOpts.length; e++){
        // remove consent requirements if checked and vice versa
        requiredOpts[e].required = recordData
    }
}

function submitConsent(e){
    e.preventDefault()
    const consentFormRaw = new FormData(e.target)
    const consentFormObject = Object.fromEntries(consentFormRaw)
    console.log(consentFormObject)
    // Store participant info
    createParticipantInfo(consentFormObject)
    // Next page
    document.getElementById('consentPage').hidden = true;
    document.getElementById('confirmSettingsPage').hidden = false;
    currentPage = 'confirmSettingsPage';
}

function createParticipantInfo(consentFormObject){
  participantInfo = {
    randomID: data.randomID,
    userAgent: window.navigator.userAgent,
    participantID: consentFormObject.codeBirth + consentFormObject.codeName + consentFormObject.codeStreet + consentFormObject.codePhone,
    email: consentFormObject.email,
    futureStudies: ("futureStudies" in consentFormObject), // If unchecked, is left out of object, so use that property here rather than value to get a bool https://stackoverflow.com/questions/1098040/checking-if-a-key-exists-in-a-javascript-object
    consent: consentFormObject.consent === 'true'
  }
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