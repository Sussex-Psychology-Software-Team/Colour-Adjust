// Participant data structure
const data = { 
    metadata:{
        randomID: randomID(24),
        userAgent: window.navigator.userAgent
    },
    consent:{},
    trials: [], 
    survey: {}
}

// Form listeners

// METADATA ---------------------------------------------------------------
function randomID(len){ // Note consider a gross UUID function: https://stackoverflow.com/questions/105034/how-do-i-create-a-guid-uuid
    const characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
    let id = ''
    // Loop to generate characters for the specified length
    for (let i=0; i<len; i++) {
        id += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return id;
}

// SEND DATA ---------------------------------------------------------------
function makeRequestBody(id, dataToSend){
    // Responses: CdE5fn8ckU5w https://pipe.jspsych.org/admin/CdE5fn8ckU5w OSF: https://osf.io/7qs4n/
    // Participants: eXM0k3gPdL9y https://pipe.jspsych.org/admin/eXM0k3gPdL9y OSF: https://osf.io/7ecsb/
    return {
        experimentID: id,
        filename: data.metadata.randomID + ".json",
        data: JSON.stringify(dataToSend)
    }
}

async function sendData(requestBody){
    try {
        const response = await fetch("https://pipe.jspsych.org/api/data/", {
            method: "POST",
            body: JSON.stringify(requestBody),
            headers: { "Content-Type": "application/json", },
        })

        if (!response.ok) {
          throw new Error(`Response status: ${response.status}`);
        }
        
        const json = await response.json();
        console.log(json);
    } catch (error) {
        console.error(error.message);
    }
}