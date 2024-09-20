// GLOBALS ---------------

// DOM refs
const participantIDForm = document.getElementById('participantCode')
const currentColourText = document.getElementById('currentColour')

// Vars
const colorsArray = [
    ["Red", [255, 0, 0]],
    ["Green", [0, 255, 0]],
    ["Blue", [0, 0, 255]],
    ["White", [255, 255, 255]],
    ["Black", [0, 0, 0]],
    ["R1", [50, 0, 0]],
    ["R2", [100, 0, 0]],
    ["R3", [150, 0, 0]],
    ["R4", [200, 0, 0]],
    ["G1", [0, 50, 0]],
    ["G2", [0, 100, 0]],
    ["G3", [0, 150, 0]],
    ["G4", [0, 200, 0]],
    ["B1", [0, 0, 50]],
    ["B2", [0, 0, 100]],
    ["B3", [0, 0, 150]],
    ["B4", [0, 0, 200]]
];

let currentColourIndex = 0

// Add event listeners
participantIDForm.addEventListener('submit', getParticipantID)
document.getElementById('back').addEventListener('click', changeColour)
document.getElementById('next').addEventListener('click', changeColour)

// FUNCTIONS ---------------
function getParticipantID(e){
    e.preventDefault()
    const idFormRaw = new FormData(e.target)
    const idFormObject = Object.fromEntries(idFormRaw)
    const participantIDText = document.getElementById('participantID')
    participantIDText.innerText = idFormObject.codeBirth + idFormObject.codeName + idFormObject.codeStreet + idFormObject.codePhone
    startCalibration()
}

function startCalibration(){
    participantIDForm.hidden = true
    document.getElementById('calibrationPage').hidden = false
    document.getElementById('next').click()
}

// change colour
function changeColour(e){
    // Increase index
    if(e.target.id === 'back' && currentColourIndex>0) currentColourIndex--
    else if(e.target.id === 'next' && currentColourIndex<colorsArray.length-1) currentColourIndex++
    else return
    // Get new colour
    const newColour = colorsArray[currentColourIndex]
    currentColourText.innerText = newColour[0]+": "  + newColour[1].toString().replace(/,/g, ', ')
    document.body.style.backgroundColor = `rgb(${newColour[1][0]},${newColour[1][1]},${newColour[1][2]})`
}
  