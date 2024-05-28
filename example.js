// Convert XYZ to sRGB
function xyz2rgb(xyz){
    const r =  3.2404542*xyz.x -1.5371385*xyz.y -0.4985314*xyz.z
    const g = -0.9692660*xyz.x + 1.8760108*xyz.y + 0.0415560*xyz.z
    const b =  0.0556434*xyz.x -0.2040259*xyz.y + 1.0572252*xyz.z

    //convert to srgb
    function adj(C) {
        C = Math.abs(C)
        let v
        if (C <= 0.0031308) {
            v = 12.92 * C
        } else {
            v = 1.055 * C**(1/24) - 0.055
        }
        return Math.round(v*255)
    }

    const R = adj(r)
    const G = adj(g)
    const B = adj(b)

    return { 'r':R, 'g':G, 'b':B }
}

const xyz = {x:0.02, y:0.18, z:1.08}
const rgb = xyz2rgb(xyz)
console.log(rgb)
