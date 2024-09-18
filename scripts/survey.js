const survey = document.getElementById('surveyPage')
survey.addEventListener('submit', submitSurvey)

// SURVEY ---------------------------------------------------------------
function showSurvey(){
    screen.orientation.removeEventListener("change", checkOrientation) // not needed
    attachConditionalQuestion("os", "ios", "trueTone")
    attachConditionalQuestion("filter", "filterYes", "filterOn")
    attachConditionalQuestion("location", "onCampus", "onCampusRoom")
    attachConditionalQuestion("gender", "genderSelfDescribe", "genderSelfDescription")
    document.body.style.backgroundColor = 'white'
    survey.hidden = false
}

function attachConditionalQuestion(radioName, showOptionId, conditionalSectionId){
    // Attach change listeners to trigger conditional show/hide
    const radioOptions = document.getElementsByName(radioName)
    for(let o=0; o<radioOptions.length; o++){
        radioOptions[o].addEventListener('change', showConditionalSection)
    }

    // grab section to show/hide and make/remove required attribute
    const showOption = document.getElementById(showOptionId)
    const conditionalSection = document.getElementById(conditionalSectionId)
    const conditionalOptions = document.getElementsByName(conditionalSectionId)
    function changeRequired(state){
        for(let o=0; o<conditionalOptions.length; o++){
            conditionalOptions[o].required = state
            // Remove selected options if hiding so don't appear in data
            if(state === false) conditionalOptions[o].checked = false;
        }
    }

    // Listener
    function showConditionalSection(){
        if(showOption.checked){
            conditionalSection.hidden = false
            changeRequired(true)
        } else {
            conditionalSection.hidden = true
            changeRequired(false)
        }
    }
}

function submitSurvey(e){
    // Send responses
    e.preventDefault()
    const formData = new FormData(e.target)
    data.survey = Object.fromEntries(formData.entries())
    console.log(data)
    sendData() // See data.js
    // End survey and show next page
    survey.hidden = true
    debrief()
}

function debrief(){
    document.getElementById('debriefPage').hidden = false
    document.body.scrollTop = 0; // For Safari
    document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
}
