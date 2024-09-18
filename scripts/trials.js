// Globals
// Dom references
const trialsPage = document.getElementById('trialsPage')
const colourPrompt = document.getElementById('colourPrompt') // Text display of colour
const trialButtons = {
    up: document.getElementById('up'),
    down: document.getElementById('down'),
    left: document.getElementById('left'),
    right: document.getElementById('right'),
}

// Vars
const colourConstraints = {
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
    },
    White: {
        l: 90,
        c: 12.5, // max Ch
        hueRanges: [
            { min: 0, max: 360 }  // Full hue circle, but Ch is constrained
        ]
    }
};


let startingColour, // Data for current trial
    currentColour, // Current user selected LAB for background
    timer, // Records reaction time
    intervalID // Stores loaded call for button clicks

const trials=[]

// Trial Setup ---------------------------------------------------------------
function setupTrials(){
    document.getElementById('consentPage').hidden = true;
    trialsPage.hidden = false
    // Add listeners
    document.addEventListener('mousedown', clickHold)
    document.addEventListener('mouseup', cancelClickHold)
    document.addEventListener('touchstart', clickHold)
    document.addEventListener('touchend', cancelClickHold)
    document.addEventListener('touchcancel', cancelClickHold)
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

setupTrials()

// Define Trials
function newTrial(){
    if(trials.length === 0) endTrials() // End when colours array is empty
    else {
        enableColourChangeButtons() // Make sure not still disabled
        // Get colour name
        colourPrompt.innerText = trials.shift(); // Remove first element of array
        // Change buttons for white or hue
        if(colourPrompt.innerText === 'White'){
            whiteTrialButtons()
        } else{
            hueTrialButtons()
        }
        // Get random starting colour
        startingColour = randomStartingColour(colourPrompt.innerText) // Randomise starting hue
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
    return Math.random() * (randomRange.max - randomRange.min) + randomRange.min;
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
    // Stop if button disabled
    if(e.target.disabled) return;
    // Stop if touch and mouse click
    if(typeof(window.ontouchstart) != 'undefined' && e.type == 'mousedown') return;

    // Run trial functions
    if(colourPrompt.textContent === 'White') changeAB(e.target.value)
    else if(colourPrompt.textContent !== 'White') changeHue(e.target.value)
    // Change background colour
    colourBackground(currentColour)
}

// Helpers (Bounding functions)
// mod fuction to handle negative numbers
function mod(n, m) { //https://stackoverflow.com/questions/4467539/javascript-modulo-gives-a-negative-result-for-negative-numbers
    return ((n % m) + m) % m;
}

function clamp(number, min, max) {
    return Math.max(min, Math.min(number, max));
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
    console.log("New Colour:", currentColour )
    // Clamp to desired colours: remove as should be unnecessary
    //currentColour.c = clamp(currentColour.c, 0, colourConstraints.White.c)
}

function testABChange(lab, axisKey="a", change=1){
    const predictedLAB = {...lab}
    // Get predicted value after change in LAB and LCH
    predictedLAB[axisKey] += change // Change relevant value
    const predictedLCH = lab2lch(predictedLAB) // Convert to lch
    // Compare to constraints
    const cBounds = predictedLCH.c < 0 || predictedLCH.c > colourConstraints.White.c
    const abBounds = predictedLAB[axisKey] < -128 || predictedLAB[axisKey] > 127 // Probably unncessary
    console.log('Predicted LAB', predictedLAB)
    console.log('Predicted LCH: ', predictedLCH)
    return cBounds || abBounds
}

function toggleWhiteTrialButtons(lab){
    // Disable if a +/- 1 change in relevant a or b would push chroma out of bounds
    console.log('up')
    trialButtons.up.disabled = testABChange(lab,'a',1)
    console.log('down')
    trialButtons.down.disabled = testABChange(lab,'a',-1)
    console.log('left')
    trialButtons.left.disabled = testABChange(lab,'b',-1)
    console.log('right')
    trialButtons.right.disabled = testABChange(lab,'b',1)
}

// HUE TRIALS --------------
function changeHue(button){
    // Extract hue and change
    if(button === '+') currentColour.h++
    else if(button === '-') currentColour.h--
    // constrain 0-360
    currentColour.h = mod(currentColour.h, 360) // custom mod handles negatives and >360
    console.log(currentColour.h)
    currentColour.h = constrainHue(currentColour.h)
}

function roundToNearest(num, a, b) {
    // abs diffs
    const diffA = Math.abs(num - a);
    const diffB = Math.abs(num - b);
    // return smaller diff
    return diffA < diffB ? a : b;
}

function constrainHue(h){
    const hueRanges = colourConstraints[colourPrompt.textContent].hueRanges
    const allHuesAllowed = hueRanges[0].min === 0 && hueRanges[0].max === 360
    // if bounds present and within them
    if(!allHuesAllowed && (h>hueRanges[0].max && h<hueRanges[1].min)){
        // midpoint of segment
        const midpoint = ((hueRanges[1].min-hueRanges[0].max)/2)+hueRanges[0].max
        // if over min (under midpoint) round up to skip
        if(h<midpoint) return hueRanges[1].min
        // else round down to skip
        else return hueRanges[0].max
    } else return h;
}

// Listener registers and cancel
function clickHold(e){
    if(['left','up','right','down'].includes(e.target.id)) intervalID = setInterval(changeColour, 50, e)
}

function cancelClickHold(){
    intervalID && clearInterval(intervalID)
}

// Submit button
function submitTrial(e){
    saveTrial(e.timeStamp)
    newTrial()
}

function saveTrial(time){
    const trialData = {
        targetColour: colourPrompt.innerText,
        startingColour: startingColour,
        finalColour: currentColour,
        rt: time-timer,
    }

    data.trials.push(trialData)
}

function endTrials(){
    // End trials
    document.getElementById('trials').hidden = true
    // Remove listeners
    screen.orientation.removeEventListener("change", checkOrientation)
    document.removeEventListener('mousedown', clickHold)
    document.removeEventListener('mouseup', cancelClickHold)
    document.removeEventListener('touchstart', clickHold)
    document.removeEventListener('touchend', cancelClickHold)
    document.removeEventListener('touchcancel', cancelClickHold)
    document.getElementById('submit').removeEventListener('click', submitTrial)

    showSurvey()
}