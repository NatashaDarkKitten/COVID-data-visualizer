// https://covid-193.p.rapidapi.com/countries
// https://covid-193.p.rapidapi.com/history?country=usa&day=2020-06-02
// https://covid-193.p.rapidapi.com/statistics

const baseUrl = 'https://covid-193.p.rapidapi.com/';
const headers = {
    "x-rapidapi-key": "9f93069b03msh6e065e5054ea558p17744ajsn04faf957f7e4",
    "x-rapidapi-host": "covid-193.p.rapidapi.com"
};

function getHistory(country) {
    let promise = fetch(baseUrl + 'history?country=' + country, {
        "method": "GET",
        "headers": headers
    }).then(response => response.json())
    return promise;
}

function getStatistics() {

}



function getHistory2(event) {
    let requestString = 'https://covid-193.p.rapidapi.com/history?country=' + country;

    requestString += date ? date : '';

    console.log(requestString);
    console.log(country);
    console.log(date);

    fetch("https://covid-193.p.rapidapi.com/countries", {
            "method": "GET",
            "headers": {
                "x-rapidapi-key": "9f93069b03msh6e065e5054ea558p17744ajsn04faf957f7e4",
                "x-rapidapi-host": "covid-193.p.rapidapi.com"
            }
        })
        .then(response => {
            console.log(response);
            localStorage.setItem('statistics', statistics);
        })
        .catch(err => {
            console.error(err);
        });

}