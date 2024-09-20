// Illuminants for D65, 2° observer
const il = { Xn: 95.0489, Yn: 100, Zn: 108.884 };

// Convert sRGB to XYZ
function rgb2xyz({r, g, b}) {
    // linear RGB
    function adj(C) {
        C = C/255 //Convert to 0-1
        if (Math.abs(C) <= 0.04045) {
            return C / 12.92// or 12.9232102 more accurate
        } else {
            return ((C+0.055)/1.055)**2.4
        }
    }
    const [R, G, B] = [adj(r), adj(g), adj(b)];
    
    return {
        x: 0.4124 * R + 0.3576 * G + 0.1805 * B,
        y: 0.2126 * R + 0.7152 * G + 0.0722 * B,
        z: 0.0193 * R + 0.1192 * G + 0.9505 * B
    };
}

// Convert XYZ to LAB
function xyz2lab({x, y, z}) {
    // scale 0-100
    x*=100
    y*=100
    z*=100

    //https://en.wikipedia.org/wiki/CIELAB_color_space#From_CIEXYZ_to_CIELAB
    function f(t){
        const sigma = 6/29 //216/24389
        if(t>sigma**3){
            return t**(1/3)
        } else {
            return ((1/3)*t*sigma**-2) + (4/29) //t / (3 * delta ** 2)???
        }
    }

    return {
        l: 116 * f(y / il.Yn) - 16,
        a: 500 * (f(x / il.Xn) - f(y / il.Yn)),
        b: 200 * (f(y / il.Yn) - f(z / il.Zn))
    };
}

// Convert LAB to XYZ
function lab2xyz({l, a, b}) {
    //https://en.wikipedia.org/wiki/CIELAB_color_space#From_CIELAB_to_CIEXYZ
    function finv(t){
        const sigma = 6/29
        if(t>sigma){
            return t**3
        } else {
            return 3*sigma**2 * t-4/29
        }
    }

    const fy = (l + 16) / 116;
    // or il/100 first?? scale 0-1 for RGB formula
    return {
        x: il.Xn * finv(fy + a / 500) / 100,
        y: il.Yn * finv(fy) / 100,
        z: il.Zn * finv(fy - b / 200) / 100
    };
}

// Convert XYZ to sRGB
function xyz2rgb({x, y, z}) {
    // from: https://stackoverflow.com/a/45238704/7705626
    // c.f. https://en.wikipedia.org/wiki/SRGB#From_CIE_XYZ_to_sRGB, https://gist.github.com/mnito/da28c930d270f280f0989b9a707d71b5
    // for improved constants see: https://www.color.org/chardata/rgb/srgb.pdf
    //https://www.image-engineering.de/library/technotes/958-how-to-convert-between-srgb-and-ciexyz%20*%20@param%20%20%7Bstring%7D%20hex
    
    //get linear RGB - //more precise values from: https://en.wikipedia.org/wiki/SRGB#sYCC:~:text=higher%2Dprecision%20XYZ%20to%20sRGB%20matrix
    const [r, g, b] = [
        3.2404542 * x - 1.5372080 * y - 0.4986286 * z,
       -0.9689307 * x + 1.8757561 * y + 0.0415175 * z,
        0.0557101 * x - 0.2040211 * y + 1.0569959 * z
    ];

    //convert to srgb
    function adj(c) {
        //for more accurate values see: https://en.wikipedia.org/wiki/SRGB#Computing_the_transfer_function
        if (c <= 0.0031308) {
            c = 12.92 * c //12.9232102 often round to 12.92
        } else {
            c = 1.055 * (c**(1/2.4)) - 0.055 // can try applying −f(−x) when x is negative https://en.wikipedia.org/wiki/SRGB#sYCC:~:text=applying%20%E2%88%92f(%E2%88%92x)%20when%20x%20is%20negative
        }
        return Math.round(c*255) //'multiplied by 2^bit_depth-1 and quantized.'
    }

    return {
        r: adj(r),
        g: adj(g),
        b: adj(b)
    };
}

// Convert LAB to LCH
function lab2lch({l, a, b}) {
    const c = Math.sqrt(a ** 2 + b ** 2);
    // h from radians to degrees for interpretability
    let h = Math.atan2(b, a) * 180 / Math.PI;
    // h 0-360
    if (h < 0) h += 360;
    
    return { l, c, h };
}

// Convert LCH to LAB
function lch2lab({l, c, h}) {
    // convert to rads
    const rad = h * Math.PI / 180;
    return { l, a: c * Math.cos(rad), b: c * Math.sin(rad) };
}

// Wrappers
// Convert RGB to LAB
function rgb2lab(rgb){
    const xyz = rgb2xyz(rgb)
    return xyz2lab(xyz)
}


// Convert LAB to RGB
function lab2rgb(lab){
    const xyz = lab2xyz(lab)
    return xyz2rgb(xyz)
}

// Convert lch to rgb
function lch2rgb(lch){
    const lab = lch2lab(lch)
    return lab2rgb(lab)
}

// Convert rgb to lch
function rgb2lch(rgb){
    const lab = rgb2lab(rgb)
    return lab2lch(lab)
}