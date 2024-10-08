// Globals
// Dom references
const colourPrompt = document.getElementById('colourPrompt') // Text display of colour
const trialButtons = {
    up: document.getElementById('up'),
    down: document.getElementById('down'),
    left: document.getElementById('left'),
    right: document.getElementById('right'),
}

// Vars
const colourConstraints = {
    White: {
        l: 85,
        c: 20, // max Ch
        hueRanges: [
            { min: 0, max: 360 }  // Full hue circle, but Ch is constrained
        ]
    },
    Red: {
        l: 40,
        c: 45,
        hueRanges: [
            { min: 0, max: 152 },
            { min: 276, max: 360 }
        ]
    },
    Green: {
        l: 45,
        c: 25,
        hueRanges: [
            { min: 0, max: 360 }  // Full hue circle
        ]
    },
    Blue: {
        l: 40,
        c: 25,
        hueRanges: [
            { min: 0, max: 360 }  // Full hue circle
        ]
    },
    Yellow: {
        l: 50,
        c: 50,
        hueRanges: [
            { min: 0, max: 155 },
            { min: 274, max: 360 }
        ]
    }
};

let startingColour, // Data for current trial
    currentColour, // Current user selected LAB for background
    timer, // Records reaction time
    intervalID = null // Stores loaded call for button clicks

const trials = []

// Trial Setup ---------------------------------------------------------------
function setupTrials(){
    currentPage = 'trialsPage'
    document.getElementById('trialsPage').hidden = false
    
    // Add listeners
    Object.values(trialButtons).forEach(button => {
        // Using Pointer events: Click is registered after mouseup, and touchstart emulates mouse events too so double fires
        // https://developer.mozilla.org/en-US/docs/Web/API/Touch_events/Using_Touch_Events#from_interfaces_to_gestures
        button.addEventListener("pointerdown", clickHold);
    });
    // No harm in using these tbf....
    // document.addEventListener('mouseup', cancelClickHold)
    // document.addEventListener('touchend', cancelClickHold)
    // document.addEventListener('touchcancel', cancelClickHold)
    document.addEventListener('pointerup', cancelClickHold)
    document.addEventListener('pointercancel', cancelClickHold)

    // Submit trial button
    document.getElementById('submitTrial').addEventListener('click', submitTrial)
    createTrialsArray()
    newTrial() // call new trial
}

function createTrialsArray(){
    const hues = ['Red', 'Green', 'Blue', 'Yellow']
    const nBlocks = 3
    for (let b=0; b<nBlocks; b++) {
        shuffle(hues) // Random shuffle on hues
        for(let h=0; h<hues.length; h++){
            trials.push('White')
            trials.push(hues[h])
        }
    }
}

// Function to shuffle the array (Fisher-Yates Shuffle)
function shuffle(array) {
    for(let i=array.length-1; i>0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];  // Swap
    }
}

// Define Trials
function newTrial(){
    if(trials.length === 0) endTrials() // End when colours array is empty
    else {
        enableColourChangeButtons() // Make sure not still disabled
        // Get colour name
        colourPrompt.innerText = trials.shift(); // Remove first element of array
        startingColour = randomStartingColour(colourPrompt.innerText) // Randomise starting hue
        // Change buttons for white or hue
        if(colourPrompt.innerText === 'White'){
            // Setup buttons
            whiteTrialButtons()
            // Random white chroma
            startingColour.c = Math.random() * colourConstraints.White.c
            // Test buttons
            const startingLAB = lch2lab(startingColour)
            toggleWhiteTrialButtons(startingLAB)
        } else{
            // Setup buttons
            hueTrialButtons()
            // Test buttons
            toggleHueButtons(startingColour.h)
        }
        console.log('startingColour: ',startingColour)
        // Get random starting colour
        colourBackground(startingColour)
        // Record starting data
        currentColour = { ...startingColour };
        timer = performance.now()
    }
}

function enableColourChangeButtons(){
    Object.values(trialButtons).forEach(button => button.disabled = false);
}

function whiteTrialButtons(){
    trialButtons.up.hidden = false
    trialButtons.down.hidden = false
    trialButtons.left.value = 'B+'
    trialButtons.right.value = 'Y+'
}

function hueTrialButtons(){
    // Top and bottom buttons hidden on hue trials
    trialButtons.up.hidden = true
    trialButtons.down.hidden = true
    trialButtons.left.value = '-'
    trialButtons.right.value = '+'
}

function getRandomHue(hueRanges) {
    // Select a random range from hue ranges
    const randomRange = hueRanges[Math.floor(Math.random() * hueRanges.length)];
    // Generate a random hue within the selected range
    return Math.floor(Math.random() * (randomRange.max - randomRange.min+1) + randomRange.min);
}

function randomStartingColour(colour) {
    const constraints = colourConstraints[colour];
    // random hue within the allowed ranges
    const randomHue = getRandomHue(constraints.hueRanges);
    return { l: constraints.l, c: constraints.c, h: randomHue };
}

function colourBackground(lch){
    const rgb = lch2rgb(lch)
    document.body.style.backgroundColor = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`
}

// Colour Adjust button listeners ---------------------------------------------------------------
function changeColour(e){
    // Double check callback still needs to be run
    if(!e.target.disabled && intervalID !== null){
        // Change colour and check if buttons need to be disabled
        if(colourPrompt.textContent === 'White') changeAB(e.target.value)
        else if(colourPrompt.textContent !== 'White') changeHue(e.target.value)
        console.log('New colour: ', currentColour)
        // Change background colour
        colourBackground(currentColour)
    } else {
        cancelClickHold(e)
        return
    }
}

// Listener registers and cancel
function clickHold(e){
    //if(typeof(window.ontouchstart) != 'undefined' && e.type == 'mousedown') return
    // If not currently repeating, register new interval
    //e.preventDefault()
    if(intervalID === null){
        intervalID = setInterval(changeColour, 50, e)
    }
    //https://stackoverflow.com/questions/923782/disable-the-text-highlighting-magnifier-on-touch-hold-on-mobile-safari-webkit
    //e.returnValue = false consider this to stop magnifying glass - maybe add touchend and click listeners too?
}

function cancelClickHold(e){
    if(intervalID !== null){
        e.preventDefault() // Call here as this will fire before click is registered on submit button
        clearInterval(intervalID)
        intervalID = null
    }
}

// WHITE TRIALS --------------
function changeAB(button){
    // convert to lab
    const lab = lch2lab(currentColour)
    //change A or B according to button pressed
    if(button ==='B+') lab.b--
    else if(button ==='R+') lab.a++
    else if(button ==='Y+') lab.b++
    else if(button ==='G+') lab.a--
    // Check bounds of c on increase in a or b and disable buttons
    toggleWhiteTrialButtons(lab)
    // convert back to lch and make sure c isn't out of bounds
    currentColour = lab2lch(lab)
}

function testABChange(lab, axisKey="a", change=1){
    const predictedLAB = {...lab}
    // Get predicted value after change in LAB and LCH
    predictedLAB[axisKey] += change // Change relevant value
    const predictedLCH = lab2lch(predictedLAB) // Convert to lch
    // Compare to constraints
    // to check abBounds = predictedLAB[axisKey] < -128 || predictedLAB[axisKey] > 127
    return predictedLCH.c < 0 || predictedLCH.c > colourConstraints.White.c
}

function toggleWhiteTrialButtons(lab){
    // Disable if a +/- 1 change in relevant a or b would push chroma out of bounds
    trialButtons.up.disabled = testABChange(lab,'a',1)
    trialButtons.down.disabled = testABChange(lab,'a',-1)
    trialButtons.left.disabled = testABChange(lab,'b',-1)
    trialButtons.right.disabled = testABChange(lab,'b',1)
}

// HUE TRIALS --------------
function changeHue(button){
    // Extract hue and change
    if(button === '+') currentColour.h++
    else if(button === '-') currentColour.h--
    // constrain 0-360
    currentColour.h = mod(currentColour.h, 360) // custom mod handles negatives and >360
    // Check buttons
    toggleHueButtons(currentColour.h)
}

// mod fuction to handle negative numbers
function mod(n, m) { //https://stackoverflow.com/questions/4467539/javascript-modulo-gives-a-negative-result-for-negative-numbers
    return ((n % m) + m) % m;
}

function toggleHueButtons(hue){
    if(colourConstraints[colourPrompt.textContent].hueRanges.length > 1){
        trialButtons.left.disabled = hue === colourConstraints[colourPrompt.textContent].hueRanges[1].min
        trialButtons.right.disabled = hue === colourConstraints[colourPrompt.textContent].hueRanges[0].max
    }
}

// Submit button
function submitTrial(e){
    // Stop any interference from other listeners
    e.preventDefault()
    e.stopPropagation()
    cancelClickHold(e) // just incase
    // Save and move on
    saveTrial(e.timeStamp)
    newTrial()
}

function saveTrial(time){
    const trialData = {
        targetColour: colourPrompt.innerText,
        startingLCH: startingColour,
        finalLCH: currentColour,
        finalRGB: lch2rgb(currentColour),
        rt: time-timer,
    }

    data.trials.push(trialData)
}

function endTrials(){
    // Remove listeners
    document.removeEventListener('mousedown', clickHold)
    document.removeEventListener('mouseup', cancelClickHold)
    document.removeEventListener('touchstart', clickHold)
    document.removeEventListener('touchend', cancelClickHold)
    document.removeEventListener('touchcancel', cancelClickHold)
    document.getElementById('submitTrial').removeEventListener('click', submitTrial)
    // End trials
    document.getElementById('trialsPage').hidden = true
    // Next page
    showSurvey()
}