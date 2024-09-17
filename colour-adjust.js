// GLObALS ---------------------------------------------------------------


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





