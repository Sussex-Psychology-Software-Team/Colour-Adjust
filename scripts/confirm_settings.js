document.getElementById('settingsForm').addEventListener('submit', confirmSettings)

function confirmSettings(e){
    e.preventDefault()
    document.getElementById('confirmSettingsPage').hidden = true;
    // Setup trials and call new trial function
    setupTrials()
}