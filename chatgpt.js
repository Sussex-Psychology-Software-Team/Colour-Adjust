// COLOUR CONVERSION ---------------------------------------------------------------

// CIE illuminants D-value and degree FOV
function illuminants(d=65,deg=2, scale=1){
    let Xn, Yn, Zn // not these assume 2 degree observer
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

const il = illuminants()

// Convert sRGB to XYZ
function rgb2xyz(rgb){
    // from https://en.wikipedia.org/wiki/SRGB#From_sRGB_to_CIE_XYZ
    function adj(C) {
        C = C / 255; // Convert to 0-1
        if (C <= 0.04045) {
            return C / 12.92;
        } else {
            return ((C + 0.055) / 1.055) ** 2.4;
        }
    }

    const R = adj(rgb.r)
    const G = adj(rgb.g)
    const B = adj(rgb.b)

    const x = 0.4124 * R + 0.3576 * G + 0.1805 * B
    const y = 0.2126 * R + 0.7152 * G + 0.0722 * B
    const z = 0.0193 * R + 0.1192 * G + 0.9505 * B

    return { 'x': x, 'y': y, 'z': z }
}

// Convert XYZ to CIELAB
function xyz2lab(xyz){
    function f(t){
        const delta = 6/29
        if(t > delta ** 3){
            return t ** (1/3)
        } else {
            return t / (3 * delta ** 2) + 4/29
        }
    }

    const l = 116 * f(xyz.y / il.Yn) - 16
    const a = 500 * (f(xyz.x / il.Xn) - f(xyz.y / il.Yn))
    const b = 200 * (f(xyz.y / il.Yn) - f(xyz.z / il.Zn))

    return { 'l': l, 'a': a, 'b': b }
}

// Convert CIELAB to XYZ
function lab2xyz(lab){
    function finv(t){
        const delta = 6/29
        if(t > delta){
            return t ** 3
        } else {
            return 3 * delta ** 2 * (t - 4/29)
        }
    }

    const fy = (lab.l + 16) / 116
    const fx = lab.a / 500 + fy
    const fz = fy - lab.b / 200

    const x = il.Xn * finv(fx)
    const y = il.Yn * finv(fy)
    const z = il.Zn * finv(fz)

    return {'x': x, 'y': y, 'z': z}
}

// Convert XYZ to sRGB
function xyz2rgb(xyz){
    function adj(C) {
        if (C <= 0.0031308) {
            return 12.92 * C;
        } else {
            return 1.055 * C ** (1/2.4) - 0.055;
        }
    }

    const r = adj(3.2406 * xyz.x - 1.5372 * xyz.y - 0.4986 * xyz.z)
    const g = adj(-0.9689 * xyz.x + 1.8758 * xyz.y + 0.0415 * xyz.z)
    const b = adj(0.0557 * xyz.x - 0.2040 * xyz.y + 1.0570 * xyz.z)

    return { 'r': Math.round(r * 255), 'g': Math.round(g * 255), 'b': Math.round(b * 255) }
}

// Wrappers
// Convert RGB to LAB
function rgb2lab(rgb){
    const xyz = rgb2xyz(rgb)
    const lab = xyz2lab(xyz)
    return lab
}

// Convert LAB to RGB
function lab2rgb(lab){
    const xyz = lab2xyz(lab)
    const rgb = xyz2rgb(xyz)
    return rgb
}

// Testing ---------------------------------------------------------------
function test(){
    let lab = {l:50, a:-128, b:-128}
    console.log(lab)
    let rgb = lab2rgb(lab)
    console.log(rgb)
}

test()

const canvas = document.getElementById('canvas')
const ctx = canvas.getContext('2d');

function drawLAB(){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    const w = canvas.width / (128 * 2) // canvas width / number of a and b vals
    let lab = {'l': 50, 'a': 0, 'b': 0}
    for(let a = -128; a < 128; a++){
        lab.a = a
        for(let b = -128; b < 128; b++){
            lab.b = b
            const rgb = lab2rgb(lab)
            ctx.fillStyle = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`
            ctx.fillRect(Math.ceil((a + 128) * w), Math.ceil((b + 128) * w), Math.ceil(w), Math.ceil(w))
        }
    }
}

//drawLAB()
