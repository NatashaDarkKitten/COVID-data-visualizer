const order = {
    ASC: 'ASC',
    DESC: 'DESC'
};

let tableState = {
    dataset: undefined,
    sortInfo: {
        fieldName: undefined,
        order: undefined
    },
    schema: {
        'continent': {
            sortType: 'string'
        },
        'country': {
            sortType: 'string'
        },
        'population': {
            sortType: 'number'
        },
        'cases': {
            'new': {
                sortType: 'number'
            },
            'active': {
                sortType: 'number'
            },
            'critical': {
                sortType: 'number'
            },
            'recovered': {
                sortType: 'number'
            },
            '1M_pop': {
                sortType: 'number'
            },
            'total': {
                sortType: 'number'
            }
        },
        'deaths': {
            'new': {
                sortType: 'number'
            },
            '1M_pop': {
                sortType: 'number'
            },
            'total': {
                sortType: 'number'
            },
        },
        'tests': {
            '1M_pop': {
                sortType: 'number'
            },
            'total': {
                sortType: 'number'
            },
        },
        'day': 'string'
    },
    charts: [],
    filterInfo: [],
    filteredData: function() {
        let filterData = this.dataset.slice();
        this.filterInfo.forEach(filter => {
            let f = filter.fieldName;
            filterData = filterData.filter(item =>
                +getValueByFieldName(item, f) >= filter.from &&
                +getValueByFieldName(item, f) <= filter.to ||
                item[f] === null || item[f] === 'null');
        });

        return filterData;
    },
    getDateString: function() {
        let months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
        let dateStr = this.dataset[0].day;
        return 'Update as of ' + months[dateStr.slice(5, 7) - 1] + ' ' + dateStr.slice(8, 10) + ', ' + dateStr.slice(0, 4);
    }
};

let history = {
    chart: undefined,
    response: undefined
}

function init() {
    getStatistics();
}

function fillDomElems() {
    let tempSortInfo = { fieldName: 'country', order: order.ASC };
    tableState.sortInfo = tempSortInfo;
    initDropDowns();
    fillFilterCells();
    updateTable();
}

function initDropDowns() {
    const dropdown = $('#countrylist');
    const countries = tableState.dataset.map(item => item.country).sort();
    countries.forEach(country => {
        dropdown[0].innerHTML += '<option>' + country + '<option>';
    });
}

function viewChartByDate() {


    let alert = $('.alert');
    alert.css("display", "none");

    let country = $('#countryh').val();
    let dateFrom = $('#dateFrom').val();
    let dateTo = $('#dateTo').val();

    if (!country) {
        showErrMsg('Fill country field');
        return;
    }

    const countries = tableState.dataset.map(item => item.country);

    if (!countries.find(item => item.toLowerCase() == country.toLowerCase())) {
        showErrMsg('No such country found');
        return;
    }

    getHistory(country)
        .then(response => {
            history.response = response.response;

            if (dateFrom && dateTo) {
                history.response = history.response.filter(item =>
                    isInRange(item.day, dateFrom, dateTo)
                );
            }

            history.response = history.response.sort((a, b) => {
                let x = new Date(a.time);
                let y = new Date(b.time);
                return x > y ? 1 : x < y ? -1 : 0;
            });

            createChart();
        })
        .catch(err => {
            console.error(err);
        });
}

function createChart() {
    if (history.chart) {
        history.chart.destroy();
        history.chart = undefined;
    }

    const labels = ['population', 'cases.active', 'cases.critical', 'cases.recovered', 'cases.total', 'deaths.total', 'tests.total'];
    const colors = ['rgb(255, 99, 132)', 'rgb(255, 159, 64)', 'rgb(255, 205, 86)', 'rgb(75, 192, 192)', 'rgb(54, 162, 235)', 'rgb(153, 102, 255)', 'rgb(201, 203, 207)'];
    const dates = history.response.map(item => item.time.slice(0, 10));

    let datasets = [];
    for (let i = 0; i < labels.length; i++) {
        datasets.push({
            label: labels[i],
            backgroundColor: colors[i],
            borderColor: colors[i],
            data: history.response.map(item => getValueByFieldName(item, labels[i])),
        });
    }
    const data = {
        labels: dates,
        datasets: datasets
    };

    const config = {
        type: 'line',
        data,
        options: {
            elements: {
                point: {
                    radius: 0
                },
                line: {
                    borderWidth: 2
                }
            }
        }
    };

    history.chart = new Chart(
        document.getElementById('historyChart'),
        config
    );


}

function showErrMsg(msg) {
    let alert = $('.alert');
    alert.css("display", "");

    let errorMessage = $('#errorMessage');
    errorMessage.html(msg);
}

function isInRange(date, dateFrom, dateTo) {
    let dateArray = [];

    if (dateFrom > dateTo) {
        [dateFrom, dateTo] = [dateTo, dateFrom];
    }
    const datain = new Date(date);
    const datefr = new Date(dateFrom);
    const dateto = new Date(dateTo);

    if (datain > datefr && datain < dateto) {
        return true
    } else return false;
    // dateArray.push(dateItem.toISOString().slice(0, 10));
    // dateFrom.setDate(dateFrom.getDate() + 1);

}

function fillFilterCells() {

    let data = tableState.dataset;
    let dataFieldNames = ['population', 'cases.new', 'cases.active', 'cases.critical', 'cases.recovered', 'cases.1M_pop', 'cases.total', 'deaths.new', 'deaths.1M_pop', 'deaths.total', 'tests.1M_pop', 'tests.total'];

    let filterCells = document.getElementsByClassName('filterCells')[0].children;


    let datalistContinent = document.getElementById('continentlist');

    let tempSortInfo = { fieldName: 'continent', order: order.ASC };
    sortDataset(data, tempSortInfo);

    let dropDownSet = new Set();
    for (let j = 0; j < data.length; j++) {
        dropDownSet.add('<option>' + data[j]['continent'] + '</option>');
    }
    datalistContinent.innerHTML = [...dropDownSet].join('');

    let datalistCountry = document.getElementById('countrylist');

    tempSortInfo = { fieldName: 'country', order: order.ASC };
    sortDataset(data, tempSortInfo);

    dropDownSet = new Set();
    for (let j = 0; j < data.length; j++) {
        dropDownSet.add('<option>' + data[j]['country'] + '</option>');
    }
    datalistCountry.innerHTML = [...dropDownSet].join('');

    for (let i = 0; i < dataFieldNames.length; i++) {

        let specificArray = [];
        let arr = dataFieldNames[i].split('.');

        let currentProp = arr[0];
        specificArray = data.map(a => a[currentProp]);

        if (arr.length == 2) {
            let currentProp = arr[1];
            specificArray = specificArray.map(a => a[currentProp]);
        }

        let min = Math.min(...specificArray);
        let max = Math.max(...specificArray);

        let labelForFrom = document.createElement('label');
        labelForFrom.setAttribute('for', dataFieldNames[i] + 'from');
        labelForFrom.innerHTML = 'from';

        let inputNumFrom = document.createElement('input');
        inputNumFrom.setAttribute('type', 'number');
        inputNumFrom.setAttribute('id', dataFieldNames[i] + 'from');
        inputNumFrom.setAttribute('value', min);
        inputNumFrom.setAttribute('min', min);
        inputNumFrom.setAttribute('max', max);
        inputNumFrom.setAttribute('maxlength', max.toString().length);
        inputNumFrom.setAttribute('oninput', 'limitInput(event)');
        inputNumFrom.setAttribute('onkeypress', 'return isNumberKey(event)');

        filterCells[i + 1].appendChild(labelForFrom);
        filterCells[i + 1].appendChild(inputNumFrom);

        let labelForTo = document.createElement('label');
        labelForTo.setAttribute('for', dataFieldNames[i] + 'to');
        labelForTo.innerHTML = 'to';

        let inputNumTo = document.createElement('input');
        inputNumTo.setAttribute('type', 'number');
        inputNumTo.setAttribute('id', dataFieldNames[i] + 'to');
        inputNumTo.setAttribute('value', max);
        inputNumTo.setAttribute('min', min);
        inputNumTo.setAttribute('max', max);
        inputNumTo.setAttribute('maxlength', max.toString().length);
        inputNumTo.setAttribute('oninput', 'limitInput(event)');
        inputNumTo.setAttribute('onkeypress', 'return isNumberKey(event)');

        filterCells[i + 1].appendChild(labelForTo);
        filterCells[i + 1].appendChild(inputNumTo);

        let discBut = document.createElement('input');
        discBut.setAttribute('type', 'button');
        discBut.setAttribute('value', 'Discard');
        discBut.setAttribute('onclick', 'discardFilter(event)');
        discBut.setAttribute('class', 'discard');

        filterCells[i + 1].appendChild(discBut);

        let applyBut = document.createElement('input');
        applyBut.setAttribute('type', 'button');
        applyBut.setAttribute('value', 'Apply');
        applyBut.setAttribute('onclick', 'applyFilter(event)');
        applyBut.setAttribute('class', 'apply');

        filterCells[i + 1].appendChild(applyBut);
    }
}

function discardFilter(event) {

    let button = event.target;
    let siblingInputs = [];
    let sibling = button.parentNode.firstChild;
    button.parentNode.classList.remove('applyFilter');

    while (sibling) {
        if (sibling.nodeType === 1 && sibling.getAttribute('type') === 'number') {
            siblingInputs.push(sibling);
        }
        sibling = sibling.nextSibling;
    }

    let min = siblingInputs[0].getAttribute('min');
    let max = siblingInputs[1].getAttribute('max');
    siblingInputs[0].value = min;
    siblingInputs[1].value = max;

    let idField = siblingInputs[0].getAttribute('id').slice(0, -4);

    tableState.filterInfo = tableState.filterInfo.filter(item => item.fieldName !== idField);

    updateTable();
}

function applyFilter(event) {

    let button = event.target;
    let siblingInputs = [];
    let sibling = button.parentNode.firstChild;
    button.parentNode.classList.add('applyFilter');

    while (sibling) {
        if (sibling.nodeType === 1 && sibling.getAttribute('type') === 'number') {
            siblingInputs.push(sibling);
        }
        sibling = sibling.nextSibling;
    }

    let min = siblingInputs[0].getAttribute('min');
    let max = siblingInputs[1].getAttribute('max');
    let idField = siblingInputs[0].getAttribute('id').slice(0, -4);

    min = siblingInputs[0].value;
    max = siblingInputs[1].value;

    tableState.filterInfo = tableState.filterInfo.filter(item => item.fieldName !== idField);

    tableState.filterInfo.push({
        fieldName: idField,
        from: siblingInputs[0].value,
        to: siblingInputs[1].value
    });

    updateTable();
}

function limitInput(event) {
    if (event.target.value.length > event.target.maxLength) {
        event.target.value = event.target.value.slice(0, event.target.maxLength);
    }
    if (event.target.value.length == 0) {
        event.target.value = 0;
    }
}

function isNumberKey(event) {
    // 8 - Back Space, 0 - Null char, 13 - Carriage Return, 48-57 - 0-9 digits
    let res = ((event.charCode == 8 || event.charCode == 0 || event.charCode == 13) || (event.charCode >= 48 && event.charCode <= 57))
    return res;
}

function findContry(event) {
    let temp = JSON.parse(localStorage.getItem('statistics'));
    tableState.dataset = temp.response;

    let selCountry = event.target.value;
    let continentInput = document.getElementById('continent');
    continentInput.value = '';

    if (country) {

        let soughtObjs = tableState.dataset.filter(item => {
            let res = !item.country || item.country.toLowerCase() === selCountry.toLowerCase();
            return res;
        });

        if (soughtObjs.length > 0) {

            tableState.dataset = soughtObjs.slice();


            continentInput.value = soughtObjs[0].continent;
        }
    }

    sortDataset(tableState.dataset, { fieldName: 'country', order: order.ASC });
    updateTable();
}

function findContinent(event) {

    let temp = JSON.parse(localStorage.getItem('statistics'));
    tableState.dataset = temp.response;

    let selContinent = event.target.value;
    let countryInput = document.getElementById('country');

    if (selContinent) {

        let soughtObjs = tableState.dataset.filter(item => {
            let res = !item.continent || item.continent.toLowerCase() === selContinent.toLowerCase();
            return res;
        });

        if (soughtObjs.length > 0) {
            tableState.dataset = soughtObjs.slice();
        }
    }
    console.log(countryInput);
    countryInput.value = "";

    sortDataset(tableState.dataset, { fieldName: 'country', order: order.ASC });
    updateTable();
}

function sortDataset(dataset, sortInfo) {

    let fieldName = sortInfo.fieldName;
    let schema = getFieldSchema(fieldName);

    if (schema.sortType === 'number') {
        dataset.sort(function(a, b) {
            let x = getValueByFieldName(a, fieldName);
            let y = getValueByFieldName(b, fieldName);

            let result = x - y;

            return sortInfo.order == order.ASC ? result : -result;
        });
    } else {
        dataset.sort(
            function(a, b) {

                let x = getValueByFieldName(a, fieldName);
                let y = getValueByFieldName(b, fieldName);
                x = x ? x.toLowerCase() : x;
                y = y ? y.toLowerCase() : y;

                let result = 0;
                if (x > y) {
                    result = 1;
                }
                if (x < y) {
                    result = -1;
                }

                return sortInfo.order == order.ASC ? result : -result;
            }
        );
    }
}

function changeFieldOrder(event, fieldName) {

    let sortInfo = tableState.sortInfo;

    if (sortInfo.fieldName === fieldName) {
        sortInfo.order = sortInfo.order === order.ASC ? order.DESC : order.ASC;
    } else {
        sortInfo.fieldName = fieldName;
        sortInfo.order = order.ASC;
    }
    if (event) { changeActiveCellStyle(event); }
    updateTable();
}


function getFieldSchema(fieldName) {
    let arr = fieldName.split('.');
    let currentSchema = tableState.schema[arr[0]];

    for (let i = 1; i < arr.length; i++) {
        currentSchema = currentSchema[arr[i]];
    }

    return currentSchema;
}

function getValueByFieldName(data, fieldName) {

    let arr = fieldName.split('.');
    let currentProperty = data[arr[0]];

    for (let i = 1; i < arr.length; i++) {
        currentProperty = currentProperty[arr[i]];
    }

    return currentProperty;
}

function updateTable() {

    const data = tableState.filteredData();

    let lastUpdateCell = document.getElementById('lastUpdateCell');
    lastUpdateCell.innerHTML = tableState.getDateString();

    let tbody = document.getElementsByTagName('tbody')[0];
    let filterCells = document.getElementsByClassName('filterCells');

    let dataFieldNames = ['continent', 'country', 'population', 'cases.new', 'cases.active', 'cases.critical', 'cases.recovered', 'cases.1M_pop', 'cases.total', 'deaths.new', 'deaths.1M_pop', 'deaths.total', 'tests.1M_pop', 'tests.total'];

    sortDataset(data, tableState.sortInfo);

    let tbodyInnerHtml = '';
    for (let i = 0; i < data.length; i++) {

        let field = data[i];
        let rowHtml = '<tr>';
        for (let i = 0; i < dataFieldNames.length; i++) {
            rowHtml += '<td>' + getValueByFieldName(field, dataFieldNames[i]) + '</td>';
        }
        rowHtml += '</tr>';

        tbodyInnerHtml += rowHtml;
    }

    tbody.innerHTML = tbodyInnerHtml;

    if (tableState.charts.length > 0) {
        for (let i = 0; i < tableState.charts.length; i++) {
            if (tableState.charts[i]) {
                tableState.charts[i].destroy();
            }
        }
    }

    if (data.length === 1) {
        let chartDivs = document.getElementsByClassName('chart');
        drawChart(data[0]);
    }
}

function drawChart(country) {

    const labels = [
        ['cases.total', 'cases.recovered', 'deaths.total', 'tests.total'],
        ['cases.new', 'cases.active', 'cases.critical', 'deaths.new'],
        ['cases.1M_pop', 'deaths.1M_pop', 'tests.1M_pop'],
        ['population', 'cases.new', 'cases.active', 'cases.critical', 'cases.recovered', 'cases.1M_pop', 'cases.total', 'deaths.new', 'deaths.1M_pop', 'deaths.total', 'tests.1M_pop', 'tests.total'],
    ];

    let canvases = Array.from(document.getElementsByClassName('chart'));
    canvases = canvases.filter(item => item.classList.contains('chart'));

    labels.forEach((labels) => {
        let chart = canvases.shift().firstChild.nextElementSibling;

        tableState.charts.push(
            new Chart(chart,
                getConfig(labels, country)
            )
        );
    });
}

function getConfig(labels, field) {

    let values = []

    for (let i = 0; i < labels.length; i++) {
        values[i] = getValueByFieldName(field, labels[i]);
    }

    const data = {
        labels: labels,
        datasets: [{
            label: 'Data Set',
            data: values,
            backgroundColor: [
                'rgba(255, 99, 132, 0.2)',
                'rgba(255, 159, 64, 0.2)',
                'rgba(255, 205, 86, 0.2)',
                'rgba(75, 192, 192, 0.2)',
                'rgba(54, 162, 235, 0.2)',
                'rgba(153, 102, 255, 0.2)',
                'rgba(201, 203, 207, 0.2)',
                'rgba(255, 99, 132, 0.2)',
                'rgba(255, 159, 64, 0.2)',
                'rgba(255, 205, 86, 0.2)',
                'rgba(75, 192, 192, 0.2)',
                'rgba(54, 162, 235, 0.2)',
                'rgba(153, 102, 255, 0.2)',
                'rgba(201, 203, 207, 0.2)'

            ],
            borderColor: [
                'rgb(255, 99, 132)',
                'rgb(255, 159, 64)',
                'rgb(255, 205, 86)',
                'rgb(75, 192, 192)',
                'rgb(54, 162, 235)',
                'rgb(153, 102, 255)',
                'rgb(201, 203, 207)',
                'rgb(255, 99, 132)',
                'rgb(255, 159, 64)',
                'rgb(255, 205, 86)',
                'rgb(75, 192, 192)',
                'rgb(54, 162, 235)',
                'rgb(153, 102, 255)',
                'rgb(201, 203, 207)'
            ],
            borderWidth: 1
        }]
    };

    const config = {
        type: 'bar',
        data: data,
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        },
    };

    return config;

}

function changeActiveCellStyle(event) {

    let clkCellClasses = event.target.classList;

    if (clkCellClasses.contains('interactCellAsc')) {
        clkCellClasses.remove('interactCellAsc');
        clkCellClasses.add('interactCellDesc');
    } else
    if (clkCellClasses.contains('interactCellDesc')) {
        clkCellClasses.remove('interactCellDesc');
        clkCellClasses.add('interactCellAsc');
    } else {

        let interactCells = document.getElementsByClassName('interactCell');
        for (let i = 0; i < interactCells.length; i++) {
            let classList = interactCells[i].classList;

            if (classList.contains('interactCellAsc')) { classList.remove('interactCellAsc') } else
            if (classList.contains('interactCellDesc')) { classList.remove('interactCellDesc') }

            clkCellClasses.add('interactCellAsc');

        }

    }
}