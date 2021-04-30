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
    let lastUpdate = localStorage.getItem('lastUpdate');
    let lastDate = new Date(lastUpdate);
    let nowDate = new Date();

    let min15 = 15 * 60 * 1000; //ms
    if ((lastUpdate && nowDate - lastDate > min15) || !lastUpdate) {
        fetch("https://covid-193.p.rapidapi.com/statistics", {
                "method": "GET",
                "headers": {
                    "x-rapidapi-key": "9f93069b03msh6e065e5054ea558p17744ajsn04faf957f7e4",
                    "x-rapidapi-host": "covid-193.p.rapidapi.com"
                }
            })
            .then(response => response.json())
            .then(data => {

                localStorage.setItem('statistics', JSON.stringify(data));
                tableState.dataset = data.response;
                fillDomElems();
            })
            .catch(err => {
                console.error(err);
            });
    } else {
        let temp = JSON.parse(localStorage.getItem('statistics'));
        tableState.dataset = temp.response;
        fillDomElems();
    }

    localStorage.setItem('lastUpdate', nowDate);
}



function getHistory2(event) {
    let requestString = 'https://covid-193.p.rapidapi.com/history?country=' + country;

    requestString += date ? date : '';

    console.log(requestString);
    console.log(country);
    console.log(date);



}