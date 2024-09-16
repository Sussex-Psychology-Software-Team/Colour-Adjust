// GLObALS ---------------------------------------------------------------
// Dom references
const installButton = document.getElementById("installButton") // Button for installing
const installInstructions = document.getElementById("installInstructions") // Install instructions
const consent = document.getElementById('consent')
const trialsContainer = document.getElementById('trials')
const survey = document.getElementById('survey')
const colour = document.getElementById('colour') // Text display of colour

// Trial vars
const colours = ['White', 'Green', 'Red', 'Blue', 'Yellow']
const calibration = ['rgb(0,0,0)','rgb(255,255,255)','rgb(0,0,255)','rgb(0,255,0)','rgb(255,0,0)']
let currentColour, // Current user selected LAB for background
    timer, // Records reaction time
    initialColour, // Data for current trial
    intervalID, // Stores loaded call for button clicks
    installPrompt = null
// Participant data structure
const data = { 
        metadata:{
            randomID: randomID(24),
            userAgent: window.navigator.userAgent
        },
        consent:{},
        trials: [], 
        survey: {}
    }

// Install listeners
window.addEventListener("appinstalled", startExperiment)
window.addEventListener("load", startExperiment) //when opened up
document.addEventListener('visibilitychange', startExperiment) //hacky but fires on switch from browser to standalone

// Form listeners
document.getElementById('consentForm').addEventListener('submit', submitConsent)
document.getElementById('setupForm').addEventListener('submit', submitSetup)
document.getElementById('survey').addEventListener('submit', submitSurvey)


// Init functions
const il = illuminants()
// setupTrials() // For testing

// CONSENT ---------------------------------------------------------------
// Make "don't record" remove requirements for other fields
document.getElementById('dontRecord').addEventListener('change', function() {
    if(this.checked) {
      document.querySelectorAll('.required').forEach(input => {
          input.removeAttribute('required')
          // Consider removing values too? .value = "" .checked = false
      });
    } else {
      document.querySelectorAll('.required').forEach(input => input.setAttribute('required', 'required'));
    }
});

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
    document.getElementById('consent').hidden = true;
    document.getElementById('setup').hidden = false;
}

function submitSetup(e){
    e.preventDefault()
    document.getElementById('setup').hidden = true;
    // Setup trials and call new trial function
    setupTrials()
}
// METADATA ---------------------------------------------------------------
function randomID(len){ // Note consider a gross UUID function: https://stackoverflow.com/questions/105034/how-do-i-create-a-guid-uuid
    const characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
    let id = ''
    // Loop to generate characters for the specified length
    for (let i=0; i<len; i++) {
        id += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return id;
}

// CALIBRATION MODE ---------------------------------------------------------------
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

// Define trials ---------------------------------------------------------------
function setupTrials(){
    document.getElementById('trials').hidden = false
    // Add listeners
    document.addEventListener('mousedown', clickHold)
    document.addEventListener('mouseup', cancelClickHold)
    document.addEventListener('touchstart', clickHold)
    document.addEventListener('touchend', cancelClickHold)
    document.addEventListener('touchcancel', cancelClickHold)
    document.getElementById('submit').addEventListener('click', submitTrial)
    newTrial() // call new trial
}

function newTrial(){
    if(colours.length === 0) endTrials()
    else {
        timer = performance.now()
        colour.innerText = colours.splice(Math.floor(Math.random() * colours.length), 1)[0]
        // Change buttons for white or hue
        if(colour.innerText === 'White'){
            whiteTrialButtons()
            currentColour = randomLAB(75)
        } else{
            hueTrialButtons()
            const lch = randomHue()
            currentColour = lch2lab(lch)
        }
        
        // Present starting colour
        colourBackground(currentColour)
        initialColour = currentColour
    }
}

function randomHue(){
    // Get fully saturated RGB
    let rgb
    if(colour.innerText === 'Red') rgb = {r:255, g:0, b:0}
    if(colour.innerText === 'Green') rgb = {r:0, g:255, b:0}
    if(colour.innerText === 'Blue') rgb = {r:0, g:0, b:255}
    if(colour.innerText === 'Yellow') rgb = {r:255, g:255, b:0}
    // convert to lch to randomise h and convert back
    const lab = rgb2lab(rgb)
    const lch = lab2lch(lab)
    lch.h = Math.floor(Math.random()*(360-0+1)+0) //random degree
    return lch
}

function whiteTrialButtons(){
    document.getElementById('left').hidden = false
    document.getElementById('right').hidden = false
    document.getElementById('up').value = 'R+'
    document.getElementById('down').value = 'G+'
}

function hueTrialButtons(){
    document.getElementById('left').hidden = true
    document.getElementById('right').hidden = true
    document.getElementById('up').value = '+'
    document.getElementById('down').value = '-'
}

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

// SURVEY ---------------------------------------------------------------
function showSurvey(){
    document.body.style.backgroundColor = 'white'
    document.getElementById('survey').hidden = false
}

// Blue light filter conditional
const filterRadios = document.getElementsByName('filter')
for(let i=0; i<filterRadios.length; i++){
    filterRadios[i].addEventListener('change', filterYes)
}

function toggleHidden(className, displayState){
    const elements = document.getElementsByClassName(className)
    for (let i = 0; i < elements.length; i++){
        elements[i].hidden = displayState;
    }
}

function filterYes(e){
    if(document.getElementById('filterYes').checked){
        // toggleHidden('filterOn', true)
        document.getElementById('filterOn').hidden = false
    } else {
        // toggleHidden('filterOn', false)
        document.getElementById('filterOn').hidden = true
    }
}

//Campus room conditional
const locationRadios = document.getElementsByName('location')
for(let i=0; i<locationRadios.length; i++){
    locationRadios[i].addEventListener('change', locationCampus)
}

function locationCampus(e){
    if(document.getElementById('onCampus').checked){
        // toggleHidden('filterOn', true)
        document.getElementById('onCampusRoom').hidden = false
    } else {
        // toggleHidden('filterOn', false)
        document.getElementById('onCampusRoom').hidden = true
    }
}



function submitSurvey(e){
    // Send responses
    e.preventDefault()
    const formData = new FormData(e.target)
    data.survey = Object.fromEntries(formData.entries())
    console.log(data)
    const responses = makeRequestBody("CdE5fn8ckU5w", data)
    sendData(responses)

    // Send participant username
    const participantInfo = {
        username: document.getElementById('username').value,
        randomID: data.metadata.randomID
    }
    const participant = makeRequestBody("eXM0k3gPdL9y", participantInfo)
    sendData(participant)

    // End survey and show next page
    document.getElementById('survey').hidden = true
    enterCalibrationMode()
}

// Debrief ---------------------------------------------------------------
function debrief(){
    hideMaterials()
    document.getElementById('debrief').hidden = false
    document.getElementById('displayData').innerHTML = JSON.stringify(data, null, 4)
    document.body.scrollTop = 0
}

// SEND DATA ---------------------------------------------------------------
function makeRequestBody(id, dataToSend){
    // Responses: CdE5fn8ckU5w https://pipe.jspsych.org/admin/CdE5fn8ckU5w OSF: https://osf.io/7qs4n/
    // Participants: eXM0k3gPdL9y https://pipe.jspsych.org/admin/eXM0k3gPdL9y OSF: https://osf.io/7ecsb/
    return {
        experimentID: id,
        filename: data.metadata.randomID + ".json",
        data: JSON.stringify(dataToSend)
    }
}

async function sendData(requestBody){
    try {
        const response = await fetch("https://pipe.jspsych.org/api/data/", {
            method: "POST",
            body: JSON.stringify(requestBody),
            headers: { "Content-Type": "application/json", },
        })

        if (!response.ok) {
          throw new Error(`Response status: ${response.status}`);
        }
        
        const json = await response.json();
        console.log(json);
    } catch (error) {
        console.error(error.message);
    }
}

// COLOUR CONVERSION ---------------------------------------------------------------

// CIE illuminants D-value and degree FOV
function illuminants(d=65, deg=2, scale=1){
    let Xn, Yn, Zn //not these assume 2 degree observer
    if(d===65){ //from https://en.wikipedia.org/wiki/Standard_illuminant#D65_values
        if(deg===2){
            Xn = 95.0489
            Yn = 100
            Zn = 108.8840
        } else if(deg===10){
            Xn = 94.811
            Yn = 100
            Zn = 107.304
        }
    } else if(d===50){
        if(deg===2){ //from: https://en.wikipedia.org/wiki/CIELAB_color_space#From_CIEXYZ_to_CIELAB
            Xn = 96.4212
            Yn = 100
            Zn = 82.5188
        }
    }

    Xn = Xn/scale
    Yn = Yn/scale
    Zn = Zn/scale
    return { 'Xn': Xn, 'Yn': Yn, 'Zn': Zn }
}


// Convert sRGB to XYZ
function rgb2xyz(rgb){
    // from https://en.wikipedia.org/wiki/SRGB#From_sRGB_to_CIE_XYZ
        //may need to consider conversion for other colourspaces - D65 and 2deg here??

    // scale 0-1
    //for (key of Object.keys(rgb)) {
    //    rgb[key]=rgb[key]/255;
    //}
    
    // linear RGB
    function adj(C, d=12.9232102) { //or just use more common 12.92
        C = C/255 //Convert to 0-1
        if (Math.abs(C) <= 0.04045) {
            return C / d;
        } else {
            return ((C+0.055)/1.055)**2.4
        }
    }

    const R = adj(rgb.r)
    const G = adj(rgb.g)
    const B = adj(rgb.b)//, 12.02) //see https://www.color.org/chardata/rgb/srgb.pdf 'Inverting the color component transfer function'

    //adj gamma-expanded linear values https://color.org/chardata/rgb/sRGB.pdf
    const x =  0.4124*R + 0.3576*G + 0.1805*B
    const y = 0.2126*R + 0.7152*G + 0.0722*B
    const z =  0.0193*R + 0.1192*G + 0.9505*B

    return { 'x':x, 'y':y, 'z':z }
}

// Convert XYZ to CIELAB
function xyz2lab(xyz, scale=1){
    // scale 0-100
    for (key of Object.keys(xyz)) {
        xyz[key]=xyz[key]*100;
    }

    //https://en.wikipedia.org/wiki/CIELAB_color_space#From_CIEXYZ_to_CIELAB
    function f(t){
        const sigma = 6/29 //216/24389
        if(t>sigma**3){
            return t**(1/3)
        } else {
            return ((1/3)*t*sigma**-2) + (4/29) //t / (3 * delta ** 2)???
        }
    }

    const l = 116 * f(xyz.y / il.Yn) - 16
    const a = 500 * (f(xyz.x / il.Xn) - f(xyz.y / il.Yn))
    const b = 200 * (f(xyz.y / il.Yn) - f(xyz.z / il.Zn))

    return { 'l':l, 'a':a, 'b':b }
}



// Convert CIELAB to XYZ
function lab2xyz(lab, scale=1){
    //https://en.wikipedia.org/wiki/CIELAB_color_space#From_CIELAB_to_CIEXYZ
    //reference white 100
    function finv(t){
        const sigma = 6/29
        if(t>sigma){
            return t**3
        } else {
            return 3*sigma**2 * t-4/29
        }
    }

    const fy = ((lab.l+16)/116)
    const x = (il.Xn/scale) * finv( fy + (lab.a/500))
    const y = (il.Yn/scale) * finv( fy )
    const z = (il.Zn/scale) * finv( fy - (lab.b/200))
    
    return {'x':x, 'y':y, 'z':z}
}


// Convert XYZ to sRGB
function xyz2rgb(xyz){
    // from: https://stackoverflow.com/a/45238704/7705626
    // c.f. https://en.wikipedia.org/wiki/SRGB#From_CIE_XYZ_to_sRGB, https://gist.github.com/mnito/da28c930d270f280f0989b9a707d71b5
        //for D65 only??
    // for improved constants see: https://www.color.org/chardata/rgb/srgb.pdf
    //https://www.image-engineering.de/library/technotes/958-how-to-convert-between-srgb-and-ciexyz%20*%20@param%20%20%7Bstring%7D%20hex
    
    //get linear RGB - //more precise values from: https://en.wikipedia.org/wiki/SRGB#sYCC:~:text=higher%2Dprecision%20XYZ%20to%20sRGB%20matrix
    const r =  3.2404542*xyz.x - 1.5372080*xyz.y - 0.4986286*xyz.z
    const g = -0.9689307*xyz.x + 1.8757561*xyz.y + 0.0415175*xyz.z
    const b =  0.0557101*xyz.x - 0.2040211*xyz.y + 1.0569959*xyz.z

    //convert to srgb
    function adj(c) {
        //Clamp
        c = Math.max(0, Math.min(1, c)); //clamp 0-1 -- REMOVE CLAMP - MAYBE GO BLACK IF OUT OF GAMUT
        //for more accurate values see: https://en.wikipedia.org/wiki/SRGB#Computing_the_transfer_function
        if (c <= 0.0031308) {
            c = 12.92 * c //12.9232102 often round to 12.92
        } else {
            c = 1.055 * (c**(1/2.4)) - 0.055 // can try applying −f(−x) when x is negative https://en.wikipedia.org/wiki/SRGB#sYCC:~:text=applying%20%E2%88%92f(%E2%88%92x)%20when%20x%20is%20negative
        }
        return Math.round(c*255) //'multiplied by 2^bit_depth-1 and quantized.'
    }

    return { 'r':adj(r), 'g':adj(g), 'b':adj(b) } // Consider storing out of bounds values?
}

// Convert LAB to Cylindrical model LCH
function lab2lch(lab){ //https://en.wikipedia.org/wiki/CIELAB_color_space#Cylindrical_model
    // convert from cartesian to polar
    const c = Math.sqrt(lab.a**2 + lab.b**2)
    let h = Math.atan2(lab.b, lab.a) //use atan2 not atan??
    // h from radians to degrees for interpretability
    h *= 180/Math.PI
    if(h<0) h += 360 // h 0-360
    // store and check bounds
    return { 'l':lab.l, 'c':c, 'h':h }
}

function lch2lab(lch){
    // convert h back to radians
    lch.h *= Math.PI/180  // John's code states /= (2*Math.PI)*360?
    // convert h and c to a and b
    const a = lch.c * Math.cos(lch.h)
    const b = lch.c * Math.sin(lch.h)
    // Check bounds on LAB
    let lab = { 'l':lch.l, 'a':a, 'b':b }
    lab = clampLAB(lab)
    return lab
}

// Wrappers
// Convert RGB to LAB
function rgb2lab(rgb){
    const xyz = rgb2xyz(rgb)
    //console.log(xyz)
    const lab = xyz2lab(xyz)
    //console.log(lab)
    return lab
}


// Convert LAB to RGB
function lab2rgb(lab){
    const xyz = lab2xyz(lab, 100) //scale 0-1 for RGB formula
    //console.log(xyz)
    const rgb = xyz2rgb(xyz)
    //console.log(rgb)
    return rgb
}

// Check colour validity ---------------------------------------------------------------

// Colour checks ---
function sameColour(colour1, colour2, channels){
    return colour1[channels.charAt(0)] === colour2[channels.charAt(0)] &&
    colour1[channels.charAt(1)] === colour2[channels.charAt(1)] &&
    colour1[channels.charAt(2)] === colour2[channels.charAt(2)]
}

function clampLAB(lab){
    // L* 0-100
    if(lab.l<0) lab.l=0
    else if(lab.l>100) lab.l=100
    // a*-127-128
    if(lab.a<-127) lab.a=-127
    else if(lab.a>128) lab.a=128
    //b* -127-128
    if(lab.b<-127) lab.b=-127
    else if(lab.b>128) lab.b=128
    return { 'l':lab.l, 'a':lab.a, 'b':lab.b }
}

function validAB(lab){
    return lab.a>=-127 && lab.a<=128 && lab.b>=-127 && lab.b<=128
}

// Background colour changes ---------------------------------------------------------------
function randomLAB(l, a, b){
    if(!l) l = Math.floor(Math.random() * (100 - 0 + 1)) // max/min inclusive
    //−128 to 127 https://en.wikipedia.org/wiki/CIELAB_color_space#Coordinates:~:text=the%20range%20of-,%E2%88%92128%20to%20127,-.
    if(!a) a = Math.floor(Math.random() * (127 - -128 + 1) + -128)
    if(!b) b = Math.floor(Math.random() * (127 - -128 + 1) + -128)
    return { 'l':l, 'a':a, 'b':b }
}

function colourBackground(lab){
    const rgb = lab2rgb(lab)
    document.body.style.backgroundColor = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`
}


// Colour Adjust button listeners ---------------------------------------------------------------
// mod fuction to handle negative numbers
function mod(n, m) { //https://stackoverflow.com/questions/4467539/javascript-modulo-gives-a-negative-result-for-negative-numbers
    return ((n % m) + m) % m;
}

function toggleButtonDisable(){
    document.getElementById('up').disabled = currentColour.a >= 128
    document.getElementById('down').disabled = currentColour.a <= -127
    document.getElementById('left').disabled = currentColour.b <= -127
    document.getElementById('right').disabled = currentColour.b >= 128
}

function changeLAB(e){
    if(typeof(window.ontouchstart) != 'undefined' && e.type == 'mousedown') return;
    // White trials
    if(colour.textContent === 'White'){ // stop exceeding range
        //change A or B according to button pressed
        if(e.target.value ==='B+') currentColour.b--
        else if(e.target.value ==='R+') currentColour.a++
        else if(e.target.value ==='Y+') currentColour.b++
        else if(e.target.value ==='G+') currentColour.a--

        // Clamp resulting change to valid LAB values
        currentColour = clampLAB(currentColour)
        console.log(currentColour)
        // Disable button and cancel if beyond bounds
        toggleButtonDisable()

    // Hue trials
    } else if(colour.textContent !== 'White'){ // or just else is hue trial
        const oldRGB = lab2rgb(currentColour)
        // Extract hue and change
        while(sameColour(oldRGB,lab2rgb(currentColour),'rgb') && validAB(currentColour)){//if(true){
            const lch = lab2lch(currentColour)
            if(e.target.value==='+') lch.h++
            else if(e.target.value==='-') lch.h--
            // Clamp 0-360 degrees
            lch.h = mod(lch.h, 360) //custom mod handles small negatives and >360
            // Convert back to lab and update colour
            currentColour = lch2lab(lch)
        }
    }

    console.log('lab: ', currentColour, 'lch: ', lab2lch(currentColour), 'rgb: ', lab2rgb(currentColour))
    colourBackground(currentColour)
}

function clickHold(e){
    if(['left','up','right','down'].includes(e.target.id)) intervalID = setInterval(changeLAB, 50, e)
}

function cancelClickHold(){
    intervalID && clearInterval(intervalID)
}






// Installers ---------------------------------------------------------------

// Install Prompt 
// https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/How_to/Trigger_install_prompt
window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault()
    installPrompt = e
    installButton.hidden = false
})

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

// Show and hide materials on change
function showMaterials(){
    // Note listener is removed after trials are complete
    if(Object.keys(data.consent).length === 0) document.getElementById('survey').hidden = false
    else if(colours.length === 5) document.getElementById('setup').hidden = false // If no colours removed yet
    else trialsContainer.hidden = false // Else show the current trial
}

function hideMaterials(){
    // hide everything
    consent.hidden = true
    document.getElementById('setup').hidden = true
    trialsContainer.hidden = true
}

function inStandalone(){
    return window.matchMedia("(display-mode: fullscreen)").matches || // Android - note standalone will not match if mode:fullscreen
    window.navigator.standalone || // iOS
    document.referrer.includes("android-app://") // Android 2
}

// Listener if not in PWA mode
window.matchMedia('(display-mode: fullscreen)').addEventListener('change', (e) => {
    if(e.matches || inStandalone()) {
        // Hide Installation instructions
        document.getElementById('browserModeWarning').hidden = true
        installInstructions.hidden = true
        // Show materials then check orientation
        showMaterials()
        checkOrientation()
    } else {
        // Show reinstall prompt - likely not actually relevant to mobile??
        hideMaterials()
        document.getElementById('browserModeWarning').hidden = false
    }
})

// Display warning if not in landscape
function checkOrientation(){
    if(inStandalone()){ // Run if in app mode
        if(screen.orientation.type === 'portrait-primary' || screen.orientation.type === 'portrait-secondary'){
            // If in portrait hide materials and show warning
            hideMaterials()
            document.getElementById('orientationWarning').hidden = false
        } else {
            // If landscape show relevant materials
            document.getElementById('orientationWarning').hidden = true
            showMaterials()
        }
    }
}

// Start the experiment if install load or visibility change triggered
function startExperiment(){
    if(inStandalone() && !installInstructions.hidden){ // If installation instructions not hidden yet
        installInstructions.hidden = true
        disableInAppInstallPrompt()
        // Load Orientation listener
        screen.orientation.addEventListener("change", checkOrientation)
        // Show materials then check orientation
        showMaterials()
        checkOrientation()
    }
}

function landscapeLock(){
    // Support is terrible for this https://developer.mozilla.org/en-US/docs/Web/API/ScreenOrientation/lock#browser_compatibility
    // Includes chrome on iOS not working - only place I really need it - removed for now
    if(screen.orientation.lock) screen.orientation.lock('landscape')
    .then(() => {console.log('locked to: ' + screen.orientation.type)})
    .catch((err) => { console.log('error: ' + err) });
}