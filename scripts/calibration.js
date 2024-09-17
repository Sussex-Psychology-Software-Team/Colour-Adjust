// CALIBRATION MODE ---------------------------------------------------------------
// Trial vars
const calibration = ['rgb(0,0,0)','rgb(255,255,255)','rgb(0,0,255)','rgb(0,255,0)','rgb(255,0,0)']


function enterCalibrationMode(){
    // Show container and hide buttons
    document.getElementById('trials').hidden = false
    document.getElementById('left').hidden = true
    document.getElementById('up').hidden = true
    document.getElementById('right').hidden = true
    document.getElementById('down').hidden = true
    // Change submit button and inner text
    const submitButton = document.getElementById('submit')
    submitButton.value = 'Continue'
    colour.innerText = 'Please alert the experimenter that you are ready to calibrate your screen now.'
    // Add new listener
    function nextCalibration(e){
        console.log(calibration)
        if(calibration.length){
            const calibrationTarget = calibration.pop()
            // Make sure text and button are visible on black background
            if(calibrationTarget==='rgb(0,0,0)'){
                document.body.style.color = 'white'
                submitButton.style.color = 'white'
                submitButton.style.borderColor = 'white'
            } else {
                document.body.style.color = 'black'
                submitButton.style.color = 'black'
                submitButton.style.borderColor = 'black'
            }
            // Display ID, text and colour background
            colour.innerText = 'ID: ' + data.metadata.randomID + '\n\r' + calibrationTarget
            document.body.style.backgroundColor = calibrationTarget
        } else {
            // Undo above and show debrief
            document.body.style.backgroundColor = 'white'
            document.body.style.color = 'black'
            submitButton.style.color = 'black'
            submitButton.style.borderColor = 'black'
            debrief()
        }
    }

    submitButton.addEventListener('click', nextCalibration, false)
}