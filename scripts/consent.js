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