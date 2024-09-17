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
const bounds = {
    White: {l:40, c:45},
    Red: {l:40, c:45, minH: 152, maxH: 275 },
    Green: {l:40, c:25, minH: 0, maxH: 360 },
    Blue: {l:40, c:25, minH: 0, maxH: 360 },
    Yellow: {l:50, c:50, minH: 155, maxH: 273 },
}

let currentColour, // Current user selected LAB for background
    currentBounds,
    timer, // Records reaction time
    initialColour, // Data for current trial
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
        // Get colour name
        const trialColour = colours.splice(Math.floor(Math.random() * colours.length), 1)[0]
        // Change buttons for white or hue
        if(trialColour === 'White'){
            whiteTrialButtons()
        } else{
            hueTrialButtons()
        }
        // Get bounds of colours
        currentBounds = bounds[trialColour]
        initialColour = randomiseHue(currentBounds) // randomise starting hue
        // Present starting colour
        colour.innerText = trialColour
        colourBackground(initialColour)
        // Record starting data
        currentColour = initialColour
        timer = performance.now()
        console.log(currentColour)
    }
}

function randomiseHue(bounds){
    // random H
    const h = Math.random() * (bounds.maxH - bounds.minH) + bounds.minH
    return { l:bounds.l, c:bounds.c, h:h }
}

function whiteTrialButtons(){
    trialButtons.up.hidden = false
    trialButtons.down.hidden = false
    trialButtons.left.value = 'B+'
    trialButtons.right.value = 'Y+'
}

function hueTrialButtons(){
    trialButtons.up.hidden = true
    trialButtons.down.hidden = true
    trialButtons.left.value = '-'
    trialButtons.right.value = '+'
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

function colourBackground(lch){
    const rgb = lch2rgb(lch)
    document.body.style.backgroundColor = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`
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
    // Check bounds of c on increase in a or b
    toggleWhiteTrialButtons(lab)
    // convert back to lch and make sure c isn't out of bounds
    currentColour = lab2lch(lab)
    currentColour.c = clamp(currentColour.c, 0, bounds.c)
}

function checkABChange(lab, axisKey="a", change=1){
    lab[axisKey] += change // Change relevant value
    const lch = lab2lch(lab) // Convert to lch
    // Compare current values
    if(change < 0) return lch.c <= 0
    else return lch.c >= currentBounds.c
}

function toggleWhiteTrialButtons(lab){
    trialButtons.up.disabled = checkABChange(lab,'a',1)
    trialButtons.down.disabled = checkABChange(lab,'a',-1)
    trialButtons.left.disabled = checkABChange(lab,'b',-1)
    trialButtons.right.disabled = checkABChange(lab,'b',1)
}

// HUE TRIALS --------------
function changeHue(button){
    // Extract hue and change
    console.log('NEW')
    console.log(currentColour)
    if(button === '+') currentColour.h++
    else if(button === '-') currentColour.h--
    console.log(currentColour)
    currentColour.h = constrainHue(currentColour.h)
    console.log(currentColour)
}

function constrainHue(h){
    // if 0-360 allow for continuous movement around circle
    if(currentBounds.minH === 0 && currentBounds.maxH === 360) return mod(h, 360) // custom mod handles negatives and >360
    // else clamp to bounds
    else return clamp(h, currentBounds.minH, currentBounds.maxH)
}

function toggleHueTrialButtons(lch){
    trialButtons.left.disabled = lch.h <= currentBounds.minH
    trialButtons.right.disabled = lch.h >= currentBounds.maxH
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
        initialColour: initialColour,
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