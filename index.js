const request = require('sync-request');
const EdimaxClient = require('./edimaxClient');
const edimaxClient = new EdimaxClient();

const sunsetISO8601 = () => {
    const lat = process.env.EDIMAX_LAT;
    const lng = process.env.EDIMAX_LNG;
    const url = `https://api.sunrise-sunset.org/json?lat=${lat}&lng=${lng}&formatted=0`;

    const res = request('GET', url).getBody();
    return JSON.parse(res.toString()).results.sunset;
};

const withinThirtyMinsOfSunset = () => {
    const now = new Date().valueOf();
    const sunset = new Date(sunsetISO8601()).valueOf();
    return (now >= (sunset - 1800000) && now <= sunset);
};

const generateErrorMessage = (timeToSwitchOn, plugIsOff) => {
    let errors = [];
    if (!timeToSwitchOn) {
        errors.push("it's way before or after sunset")
    }
    if (!plugIsOff) {
        errors.push("the plug is already on")
    }
    return `No need to switch on: ${errors.join(" and ")}.`
};

const main = async () => {
    const timeToSwitchOn = withinThirtyMinsOfSunset()
    const plugIsOff = await edimaxClient.plugIsOff()

    if (timeToSwitchOn && plugIsOff) {
        console.log("Switching on!");
        edimaxClient.switchOn();
    } else {        
        const errorMessage = generateErrorMessage(timeToSwitchOn, plugIsOff)
        console.log(errorMessage)
    }
};

main()
