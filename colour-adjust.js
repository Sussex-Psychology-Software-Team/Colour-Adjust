
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

// Convert XYZ to CIELAB
function xyz2lab(xyz){
    //check here: https://www.nixsensor.com/free-color-converter/ input: XYZ, in and out ref angles the same, uncheck 0-1 box.    
    //https://en.wikipedia.org/wiki/CIELAB_color_space#Converting_between_CIELAB_and_CIEXYZ_coordinates
    function f(t){
        let f;
        const sigma = 6/29
        if(t>sigma**3){
            f = t**(1/3)
        } else {
            f = (1/3)*t*sigma**-2 + (4/29)
        }
        return f
    }
    const l = 116 * f(xyz.y / il.Yn) - 16
    const a = 500 * (f(xyz.x / il.Xn) - f(xyz.y / il.Yn))
    const b = 200 * (f(xyz.y / il.Yn) - f(xyz.z / il.Zn))

    return { 'l':l, 'a':a, 'b':b }
}


// Convert CIELAB to XYZ
function lab2xyz(lab){
    //https://en.wikipedia.org/wiki/CIELAB_color_space#Converting_between_CIELAB_and_CIEXYZ_coordinates
    function finv(t){
        let f;
        const sigma = 6/29
        if(t>sigma){
            f = t**3
        } else {
            f = 3*sigma**2 * (t-(4/29))
        }
        return f
    }

    const v = ((lab.l+16)/116)
    const x = il.Xn* finv( v + (lab.a/500))
    const y = il.Yn* finv( v )
    const z = il.Zn* finv( v - (lab.b/200))

    return {'x':x, 'y':y, 'z':z}
}

// Convert XYZ to sRGB
function xyz2rgb(x,y,z){
    
}

// Convert sRGB to XYZ
function rgb2xyz(r,g,b){
    
}


// TESTING
function test(){
    const il = illuminants()
    let xyz = { 'x':50, 'y':50, 'z':50 }
    let lab = xyz2lab(xyz)
    xyz = lab2xyz(lab)
    console.log(xyz)
}

test()

