// COLOUR CONVERSION ---------------------------------------------------------------

// CIE illuminants D-value and degree FOV
function illuminants(d=65,deg=2){
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

    return { 'Xn': Xn, 'Yn': Yn, 'Zn': Zn }
}



// Convert CIELAB to XYZ
function lab2xyz(lab){
    //https://en.wikipedia.org/wiki/CIELAB_color_space#From_CIELAB_to_CIEXYZ
    function finv(t){
        const sigma = 6/29
        if(t>sigma){
            return t**3
        } else {
            return 3*sigma**2 * (t-(4/29))
        }
    }

    const w = ((lab.l+16)/116)
    const x = il.Xn* finv( w + (lab.a/500))
    const y = il.Yn* finv( w )
    const z = il.Zn* finv( w - (lab.b/200))

    return {'x':x, 'y':y, 'z':z}
}


function lab2xyzBD(lab){
    //http://www.brucelindbloom.com/index.html?Eqn_Lab_to_XYZ.html
    //but see http://www.brucelindbloom.com/index.html?LContinuity.html
    const e = 216/24389 //epsillon
    const k = 24389/27 //kappa
    // Y
    const fy = ((lab.l+16)/116)
    let yr;
    if(lab.l>(k*e)){ yr = ((lab.l+16)/116)**3
    } else { yr = lab.l/k }
    const y = yr*il.Yn
    // X
    const fx = fy+(lab.a/500)
    let xr;
    if(fx**3>e){ xr = fx**3
    } else { xr = (116*fx-16)/k }
    const x = xr*il.Xn
    // Z
    const fz = fy-(lab.b/200)
    let zr;
    if(fz**3>e){ zr = fz**3
    } else { zr = (116*fz-16)/k }
    const z = zr*il.Zn

    console.log('Bruce: ', {'x':x, 'y':y, 'z':z})
    return {'x':x, 'y':y, 'z':z} 
} 

// Convert XYZ to CIELAB
function xyz2lab(xyz){
    //https://en.wikipedia.org/wiki/CIELAB_color_space#From_CIEXYZ_to_CIELAB
    function f(t){
        const sigma = 6/29
        if(t>sigma**3){
            return t**(1/3)
        } else {
            return ((1/3)*t*sigma**-2) + (4/29)
        }
    }

    const l = 116 * f(xyz.y / il.Yn) - 16
    const a = 500 * (f(xyz.x / il.Xn) - f(xyz.y / il.Yn))
    const b = 200 * (f(xyz.y / il.Yn) - f(xyz.z / il.Zn))

    return { 'l':l, 'a':a, 'b':b }
}


// Convert XYZ to sRGB
function xyz2rgb(xyz){
    // from: https://stackoverflow.com/a/45238704/7705626
    // c.f. https://en.wikipedia.org/wiki/SRGB#From_CIE_XYZ_to_sRGB
        //for D65 only??
    // for improved constants see: https://www.color.org/chardata/rgb/srgb.pdf
    //scale 0-1
    for (key of Object.keys(xyz)) {
        xyz[key]=xyz[key]/100;
    }

    //get linear RGB - //more precise values from: https://en.wikipedia.org/wiki/SRGB#sYCC:~:text=higher%2Dprecision%20XYZ%20to%20sRGB%20matrix
    const r =  3.2406255*xyz.x - 1.5372080*xyz.y - 0.4986286*xyz.z
    const g = -0.9689307*xyz.x + 1.8757561*xyz.y + 0.0415175*xyz.z
    const b =  0.0557101*xyz.x - 0.2040211*xyz.y + 1.0569959*xyz.z

    //convert to srgb
    function adj(C) {
        let a
        //for more accurate values see: https://en.wikipedia.org/wiki/SRGB#Computing_the_transfer_function
        if (Math.abs(C) <= 0.0031308) {
            a = 12.9232102 * C; //others often round to 12.92
        } else {
            a = 1.055 * (C**0.41666) - 0.055;
        }
        return Math.round(a*255) //'multiplied by 2^bit_depth-1 and quantized.'
    }

    //adjust and make int 0-255
    const R = adj(r)
    const G = adj(g)
    const B = adj(b)

    return { 'r':R, 'g':G, 'b':B }
}


// Convert sRGB to XYZ
function rgb2xyz(rgb){
    // from https://en.wikipedia.org/wiki/SRGB#From_sRGB_to_CIE_XYZ
        //may need to consider conversion for other colourspaces - D65 and 2deg here??

    // scale 0-1
    //for (key of Object.keys(rgb)) {
    //    if(rgb[key]>1){
    //        rgb[key]=rgb[key]/255;
    //    }
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
    const B = adj(rgb.b, 12.02) //see https://www.color.org/chardata/rgb/srgb.pdf 'Inverting the color component transfer function'

    //adj gamma-expanded linear values https://color.org/chardata/rgb/sRGB.pdf
    const x =  0.4124*R + 0.3576*G + 0.1805*B
    const y = 0.2126*R + 0.7152*G + 0.0722*B
    const z =  0.0193*R + 0.1192*G + 0.9505*B

    return { 'x':x*100, 'y':y*100, 'z':z*100 }
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
    const xyz = lab2xyz(lab)
    //console.log(xyz)
    const rgb = xyz2rgb(xyz)
    //console.log(rgb)
    return rgb
}

// Testing ---------------------------------------------------------------
function test(){
    //check here: https://www.nixsensor.com/free-color-converter/ input: XYZ, in and out ref angles the same, uncheck 0-1 box.    
    let rgb = {r:255, g:255, b:255}
    let lab = rgb2lab(rgb)
    rgb = lab2rgb(lab)

    lab = {l:50,a:-128,b:-128}
    rgb = lab2rgb(lab)
    console.log(rgb)
}


const il = illuminants()
test()

const canvas = document.getElementById('canvas')
const ctx = canvas.getContext('2d');

function drawLAB(){
    //L:0-100, A:-128-128, B:-128-128
    ctx.clearRect(0,0,canvas.width,canvas.height);
    const w = canvas.width/(128*2) //canvas width / number of a and b vals
    let lab = {'l':50,'a':0,'b':0}
    for(let a=-128; a<128; a++){
        lab.a = a
        for(let b=-128; b<128; b++){
            lab.b = b
            const rgb = lab2rgb(lab)
            console.log(rgb)
            ctx.fillStyle = `rgb(${rgb.r}, ${rgb.g}%, ${rgb.b}%)`;
            ctx.fillRect(Math.ceil(a+128*w),Math.ceil(b+128*w),Math.ceil(w),Math.ceil(w)); //w+1 on last two also deals with aliasing well enough?
        }
    }
}

//drawLAB()