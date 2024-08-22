// GLObALS ---------------------------------------------------------------

// Dom references
const colour = document.getElementById('colour')
const canvas = document.getElementById('canvas')
const ctx = canvas.getContext('2d')

// Trial vars
const colours = ['White', 'Green', 'Red', 'Blue', 'Yellow']
let currentColour // Current user selected LAB for background

// Event listeners
let intervalID // Stores loaded call for button clicks
document.addEventListener('mousedown', clickHold)
document.addEventListener('mouseup', cancelClickHold)
document.addEventListener('touchstart', clickHold);
document.addEventListener('touchend', cancelClickHold);
document.addEventListener('touchcancel', cancelClickHold);
document.getElementById('submit').addEventListener('click', newTrial)

// Installing functions and vars
let installPrompt = null;
const installButton = document.getElementById("install");
const instructions = document.getElementById("instructions")
window.addEventListener("appinstalled", hideInstructions);
window.addEventListener("load", hideInstructions); //when opened up
document.addEventListener('visibilitychange', hideInstructions); //hacky but fires on switch from browser to standalone

// Init functions
const il = illuminants()

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


// Canvas colour changes ---------------------------------------------------------------
function randomLAB(l, a, b){
    //−128 to 127 https://en.wikipedia.org/wiki/CIELAB_color_space#Coordinates:~:text=the%20range%20of-,%E2%88%92128%20to%20127,-.
    if(!l) l = Math.floor(Math.random() * (Math.floor(100) - Math.ceil(0) + 1) + Math.ceil(0)); // The maximum is inclusive and the minimum is inclusive
    if(!a) a = Math.floor(Math.random() * (Math.floor(127) - Math.ceil(-128) + 1) + Math.ceil(-128)); // The maximum is inclusive and the minimum is inclusive
    if(!b) b = Math.floor(Math.random() * (Math.floor(127) - Math.ceil(-128) + 1) + Math.ceil(-128)); // The maximum is inclusive and the minimum is inclusive
    return { 'l':l, 'a':a, 'b':b }
}

function updateCanvasColour(lab){
    const rgb = lab2rgb(lab)
    fillColour(rgb)
}

function fillColour(rgb){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    ctx.fillStyle = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`
    ctx.fillRect(0,0,canvas.width,canvas.height)
}

// Define trials ---------------------------------------------------------------
function newTrial(){
    if(colours.length === 0) endTrials()
    else {
        colour.innerText = colours.splice(Math.floor(Math.random() * colours.length), 1)[0]
        // Change buttons for white or hue
        if(colour.innerText === 'White'){
            whiteTrial()
            currentColour = randomLAB(75)
        } else{
            hueTrial()
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
            currentColour = lch2lab(lch)
        }
        // Present starting colour
        updateCanvasColour(currentColour)
    }
}

function whiteTrial(){
    document.getElementById('left').hidden = false
    document.getElementById('right').hidden = false
    document.getElementById('up').value = 'R+'
    document.getElementById('down').value = 'G+'
}

function hueTrial(){
    document.getElementById('left').hidden = true
    document.getElementById('right').hidden = true
    document.getElementById('up').value = '+'
    document.getElementById('down').value = '-'
}

function endTrials(){
    document.getElementById('textContainer').textContent = 'FIN'
    document.getElementById('left').hidden = true
    document.getElementById('up').hidden = true
    document.getElementById('right').hidden = true
    document.getElementById('down').hidden = true
}

// Button Listeners---------------------------------------------------------------

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

// Helpers ---
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

// Main listeners ---
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
    updateCanvasColour(currentColour)
}

function clickHold(e){
    if(['left','up','right','down'].includes(e.target.id)) intervalID = setInterval(changeLAB, 50, e)
}

function cancelClickHold(){
    intervalID && clearInterval(intervalID)
}




// Installers ---------------------------------------------------------------
// Android
// https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/How_to/Trigger_install_prompt

window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault()
    installPrompt = event
    installButton.removeAttribute("hidden")
})

installButton.addEventListener("click", async () => {
    if (!installPrompt) { return }
    const result = await installPrompt.prompt()
    console.log(`Install prompt was: ${result.outcome}`)
    disableInAppInstallPrompt()
})

function disableInAppInstallPrompt() {
    installPrompt = null
    installButton.setAttribute("hidden", "")
}

//iOS and Desktop
function hideInstructions(){
    // note seems window.matchMedia("(display-mode: standalone)").matches is the working part here?
    if(window.matchMedia("(display-mode: standalone)").matches || //android
        window.navigator.standalone || //ios
        document.referrer.includes("android-app://")){ //android 2
            instructions.style.display = 'none'
            disableInAppInstallPrompt()
            setupTrial()
            screen.orientation.lock('landscape')
    }
}

function setupTrial(){
    const buttons = document.getElementsByClassName('adjustColourButton')
    for(let i=0; i<buttons.length; i++){
        buttons[i].hidden = false
    }
    newTrial() // call new trial
}

window.matchMedia('(display-mode: standalone)').addEventListener('change', (e) => {
    if (e.matches) {
        instructions.style.display = 'none'
    } else {
        instructions.style.display = 'block'
        instructions.innerHTML = '<p>Please return to or reinstall the app version of this website.</p>' 
    }
})

screen.orientation.addEventListener("change",(e) => {
    document.getElementById('version').innerHTML = e.target.type
    if(e.target.type === 'portrait'){
        instructions.style.display = 'block'
        instructions.innerHTML = '<p>This app is only available in landscape mode. Please roate your phone.</p>' 
    } else {
        instructions.style.display = 'none'
    }
})