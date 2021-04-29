function APIcall() { // TODO use fetch and Promise approach
    var dateOfLastAPICall = localStorage.getItem('dateAPICall');
    var today = new Date();
    console.log(today.getDay());

    if (today.getDay() !== dateOfLastAPICall) { // use timestamps

        localStorage.setItem('dateAPICall', today.getDay());

        function fun() {
            if (this.readyState === this.DONE) {
                var statistics = this.responseText;
                localStorage.setItem('statistics', statistics);
                updateTable();
            }
        }
        const data = null;
        const xhr = new XMLHttpRequest();
        xhr.withCredentials = true;
        xhr.addEventListener("readystatechange", fun);

        xhr.open("GET", "https://covid-193.p.rapidapi.com/statistics");
        xhr.setRequestHeader("x-rapidapi-key", "9f93069b03msh6e065e5054ea558p17744ajsn04faf957f7e4");
        xhr.setRequestHeader("x-rapidapi-host", "covid-193.p.rapidapi.com");
        xhr.send();
    } else {
        if (localStorage.getItem('statistics')) {
            updateTable();
        }
    }
}
