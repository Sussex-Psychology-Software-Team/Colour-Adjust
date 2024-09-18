// Globals
// Dom references
const trialsPage = document.getElementById('trialsPage')
const colour = document.getElementById('colour') // Text display of colour
const trialButtons = {
    up: document.getElementById('up'),
    down: document.getElementById('down'),
    left: document.getElementById('left'),
    right: document.getElementById('right'),
}

// Vars
const colours = ['White', 'Green', 'Red', 'Blue', 'Yellow']
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


let currentColour, // Current user selected LAB for background
    currentBounds,
    timer, // Records reaction time
    startingColour, // Data for current trial
    intervalID // Stores loaded call for button clicks

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
    newTrial() // call new trial
}

setupTrials()

// Define Trials
function newTrial(){
    if(colours.length === 0) endTrials() // End when colours array is empty
    else {
        enableColourChangeButtons() // make sure not still disabled
        // Get colour name
        const trialColour = colours.splice(Math.floor(Math.random() * colours.length), 1)[0]
        // Change buttons for white or hue
        if(trialColour === 'White'){
            whiteTrialButtons()
        } else{
            hueTrialButtons()
        }
        // Get random starting colour
        startingColour = randomStartingColour(trialColour) // randomise starting hue
        // Present starting colour
        colour.innerText = trialColour
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
    console.log('New background colour: ', rgb)
    document.body.style.backgroundColor = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`
}

// Colour Adjust button listeners ---------------------------------------------------------------

function changeColour(e){
    // Stop if touch and mouse click
    if(typeof(window.ontouchstart) != 'undefined' && e.type == 'mousedown') return;

    // Run trial functions
    if(colour.textContent === 'White') changeAB(e.target.value)
    else if(colour.textContent !== 'White') changeHue(e.target.value)
    // Change background colour
    colourBackground(currentColour)
}

// Helpers (Bounding functions)
// mod fuction to handle negative numbers
function mod(n, m) { //https://stackoverflow.com/questions/4467539/javascript-modulo-gives-a-negative-result-for-negative-numbers
    return ((n % m) + m) % m;
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
    currentColour.c = clamp(currentColour.c, 0, colourConstraints.White.c)
}

function testABChange(lab, axisKey="a", change=1){
    const predictedLAB = {...lab}
    predictedLAB[axisKey] += change // Change relevant value
    const lch = lab2lch(predictedLAB) // Convert to lch
    // Compare to constraints
    return lch.c < 0 || lch.c > colourConstraints.White.c
}

function toggleWhiteTrialButtons(lab){
    // Disable if a +/- 1 change in relevant a or b would push chroma out of bounds
    trialButtons.up.disabled = testABChange(lab,'a',1)
    trialButtons.down.disabled = testABChange(lab,'a',-1)
    trialButtons.left.disabled = testABChange(lab,'b',-1)
    trialButtons.right.disabled = testABChange(lab,'b',1)
}

function clamp(number, min, max) {
    return Math.max(min, Math.min(number, max));
}

// HUE TRIALS --------------
function changeHue(button){
    // Extract hue and change
    if(button === '+') currentColour.h++
    else if(button === '-') currentColour.h--
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
    const hueRanges = colourConstraints[colour.textContent].hueRanges
    // Loop back if 0 to 360
    if(h<0 || h>360) return mod(h, 360) // custom mod handles negatives and >360
    // Else if constraints present avoid segment in the middle of the hue circle
    else if(hueRanges[0].min !== 0 && hueRanges[0].max !== 360){
        if(h>hueRanges[0].max && h<hueRanges[1].min) return roundToNearest(h, hueRanges[0].max, hueRanges[1].min)
        else return h
    }
    return h
}

function toggleHueTrialButtons(lch){
    const hueRanges = colourConstraints[colour.textContent].hueRanges
    if(hueRanges[0].min !== 0 && hueRanges[0].max !== 360){
        trialButtons.left.disabled = lch.h <= hueRanges[0].max
        trialButtons.right.disabled = lch.h >= hueRanges[1].min
    }
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
        targetColour: colour.innerText,
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