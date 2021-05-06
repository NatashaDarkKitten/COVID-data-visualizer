// https://covid-193.p.rapidapi.com/countries
// https://covid-193.p.rapidapi.com/history?country=usa&day=2020-06-02
// https://covid-193.p.rapidapi.com/statistics

const baseUrl = 'https://covid-193.p.rapidapi.com/';
const headers = {
    "x-rapidapi-key": "9f93069b03msh6e065e5054ea558p17744ajsn04faf957f7e4",
    "x-rapidapi-host": "covid-193.p.rapidapi.com"
};
const options = {
    "method": "GET",
    "headers": headers
};

async function getHistory(country) {
    let response = await fetch(`${baseUrl}history?country=${country}`, options);
    return await response.json();
}

async function getStatistics() {
    let response = await fetch(`${baseUrl}statistics`, options);
    return await response.json();
}