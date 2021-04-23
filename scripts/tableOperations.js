function updateTable() {

    let months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]

    let storageStatistics = JSON.parse(localStorage.getItem('statistics'));

    let tbody = document.getElementsByTagName("tbody")[0];

    while (tbody.firstChild) {
        tbody.removeChild(tbody.lastChild);
    }

    let tfoot = document.getElementsByTagName('tfoot')[0];
    let dropDownCountry = document.getElementById("dropDownCountry");

    let dataset = storageStatistics.response;
    let activeCell = document.getElementsByClassName(" interactionCellAscending ")[0] || document.getElementsByClassName("interactionCellDescending")[0];

    let pathToValue = activeCell.id;

    if (pathToValue.indexOf("-")) {
        pathToValue = pathToValue.split("-");
    }

    if (pathToValue.length == 1) {
        if (activeCell.classList.contains("interactionCellAscending")) {
            if (activeCell.classList.contains("textCell")) {
                dataset.sort(
                    function(a, b) {

                        if (a[pathToValue[0]] > b[pathToValue[0]]) {
                            return 1;
                        }
                        if (a[pathToValue[0]] < b[pathToValue[0]]) {
                            return -1;
                        }
                        return 0;
                    }
                );
            } else {
                dataset.sort(function(a, b) {
                    return a[pathToValue[0]] - b[pathToValue[0]];
                });
            }

        } else
        if (activeCell.classList.contains("interactionCellDescending")) {

            if (activeCell.classList.contains("textCell")) {
                dataset.sort(function(a, b) {

                    if (a[pathToValue[0]] < b[pathToValue[0]]) {
                        return 1;
                    }
                    if (a[pathToValue[0]] > b[pathToValue[0]]) {
                        return -1;
                    }
                    return 0;
                });
            } else {
                dataset.sort(function(a, b) {
                    return b[pathToValue[0]] - a[pathToValue[0]];
                });
            }
        }
    } else {
        if (pathToValue.length == 2) {
            if (activeCell.classList.contains("interactionCellAscending")) {

                dataset.sort(function(a, b) {
                    return a[pathToValue[0]][pathToValue[1]] - b[pathToValue[0]][pathToValue[1]];
                });


            } else
            if (activeCell.classList.contains("interactionCellDescending")) {

                dataset.sort(function(a, b) {
                    return b[pathToValue[0]][pathToValue[1]] - a[pathToValue[0]][pathToValue[1]];
                });

            }
        }
    }

    for (let i = 0; i < dataset.length; i++) {
        let columns = Array(14);
        let row = tbody.insertRow(i);

        for (let j = 0; j < 14; j++) {
            columns[j] = row.insertCell(j);
        }

        let country = document.createElement('option');
        country.text = dataset[i]["country"];
        country.value = dataset[i]["country"];
        dropDownCountry.add(country);

        columns[0].innerHTML = dataset[i]["continent"];
        columns[1].innerHTML = dataset[i]["country"];
        columns[2].innerHTML = dataset[i]["population"];

        columns[3].innerHTML = dataset[i].cases["new"];
        columns[4].innerHTML = dataset[i].cases["active"];
        columns[5].innerHTML = dataset[i].cases["critical"];
        columns[6].innerHTML = dataset[i].cases["recovered"];
        columns[7].innerHTML = dataset[i].cases["1M_pop"];
        columns[8].innerHTML = dataset[i].cases["total"];

        columns[9].innerHTML = dataset[i].deaths["new"];
        columns[10].innerHTML = dataset[i].deaths["1M_pop"];
        columns[11].innerHTML = dataset[i].deaths["total"];

        columns[12].innerHTML = dataset[i].tests["1M_pop"];
        columns[13].innerHTML = dataset[i].tests["total"];
    }
    tfoot.firstElementChild.firstElementChild.innerHTML = 'Update as of ' + months[+dataset[0].day.slice(5, 7) - 1] + ' ' + dataset[0].day.slice(8, 10) + ', ' + dataset[0].day.slice(0, 4);
}

function changeTableDataOrder() {
    if (event.target.classList.contains("interactionCellAscending")) {
        event.target.classList.remove("interactionCellAscending");
        event.target.classList.add("interactionCellDescending");
    } else
    if (event.target.classList.contains("interactionCellDescending")) {
        event.target.classList.remove("interactionCellDescending");
        event.target.classList.add("interactionCellAscending");
    } else {

        let interactionCell = document.getElementsByClassName("interactionCell");

        for (let index = 0; index < interactionCell.length; index++) {

            if (interactionCell[index].classList.contains("interactionCellAscending")) {
                interactionCell[index].classList.remove("interactionCellAscending");

            }
            if (interactionCell[index].classList.contains("interactionCellDescending")) {
                interactionCell[index].classList.remove("interactionCellDescending");
            }
        }
        event.target.classList.add("interactionCellAscending");
    }
    updateTable();

}