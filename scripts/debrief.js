// Debrief ---------------------------------------------------------------
function debrief(){
    hideMaterials()
    document.getElementById('debrief').hidden = false
    document.getElementById('displayData').innerHTML = JSON.stringify(data, null, 4)
    document.body.scrollTop = 0
}