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

function init() {
    // hack
    let temp = JSON.parse(localStorage.getItem('statistics'));
    tableState.dataset = temp.response;

    tableState.sortInfo = { fieldName: 'country', order: order.ASC };

    fillFilterCells();
    updateTable();
}

function fillFilterCells() {

    let data = tableState.dataset;
    let dataFieldNames = ['population', 'cases.new', 'cases.active', 'cases.critical', 'cases.recovered', 'cases.1M_pop', 'cases.total', 'deaths.new', 'deaths.1M_pop', 'deaths.total', 'tests.1M_pop', 'tests.total'];

    let filterCells = document.getElementsByClassName('filterCells')[0].children;


    let dropDownContinent = document.createElement('input');
    dropDownContinent.setAttribute('type', 'text');
    dropDownContinent.setAttribute('list', 'continentlist');
    dropDownContinent.setAttribute('onchange', 'findField(event, "continent")');
    dropDownContinent.setAttribute('id', 'continent');

    let datalistContinent = document.createElement('datalist');
    datalistContinent.setAttribute('id', 'continentlist');

    let tempSortInfo = { fieldName: 'continent', order: order.ASC };
    sortDataset(data, tempSortInfo);

    let dropDownSet = new Set();
    for (let j = 0; j < data.length; j++) {
        dropDownSet.add('<option>' + data[j]['continent'] + '</option>');
    }
    datalistContinent.innerHTML = [...dropDownSet].join('');

    filterCells[0].appendChild(dropDownContinent);
    filterCells[0].appendChild(datalistContinent);

    let dropDownCountry = document.createElement('input');
    dropDownCountry.setAttribute('type', 'text');
    dropDownCountry.setAttribute('list', 'countrylist');
    dropDownCountry.setAttribute('onchange', 'findField(event, "country")');
    dropDownCountry.setAttribute('id', 'country');

    let datalistCountry = document.createElement('datalist');
    datalistCountry.setAttribute('id', 'countrylist');

    tempSortInfo = { fieldName: 'country', order: order.ASC };
    sortDataset(data, tempSortInfo);

    dropDownSet = new Set();
    for (let j = 0; j < data.length; j++) {
        dropDownSet.add('<option>' + data[j]['country'] + '</option>');
    }
    datalistCountry.innerHTML = [...dropDownSet].join('');

    filterCells[0].appendChild(dropDownCountry);
    filterCells[0].appendChild(datalistCountry);

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

        filterCells[i + 1].appendChild(discBut);

        let applyBut = document.createElement('input');
        applyBut.setAttribute('type', 'button');
        applyBut.setAttribute('value', 'Apply');
        applyBut.setAttribute('onclick', 'applyFilter(event)');

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

function findField(event, prop) {

    let temp = JSON.parse(localStorage.getItem('statistics'));
    tableState.dataset = temp.response;

    if (event.target.value) {

        let soughtObjs = tableState.dataset.filter(item => item[prop] === event.target.value);

        if (soughtObjs.length > 0) {
            tableState.dataset = [...soughtObjs];
            let inputElems = document.getElementsByTagName('input');
            if (prop === 'country') {
                for (let i = 0; i < inputElems.length; i++) {
                    if (inputElems[i].getAttribute('list') == 'continentlist') {
                        inputElems[i].value = soughtObjs[0].continent;
                    }
                }

            } else if (prop === 'continent') {
                for (let i = 0; i < inputElems.length; i++) {
                    if (inputElems[i].getAttribute('list') == 'countrylist') {
                        inputElems[i].value = '';
                    }
                }
            }
        }
    }

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

    // const labels = ['population', 'cases.new', 'cases.active', 'cases.critical', 'cases.recovered', 'cases.1M_pop', 'cases.total', 'deaths.new', 'deaths.1M_pop', 'deaths.total', 'tests.1M_pop', 'tests.total'];

    let labels1 = ['cases.total', 'cases.recovered', 'deaths.total', 'tests.total'];
    let labels2 = ['cases.new', 'cases.active', 'cases.critical', 'deaths.new'];
    let labels3 = ['cases.1M_pop', 'deaths.1M_pop', 'tests.1M_pop'];
    let labels4 = ['population', 'cases.new', 'cases.active', 'cases.critical', 'cases.recovered', 'cases.1M_pop', 'cases.total', 'deaths.new', 'deaths.1M_pop', 'deaths.total', 'tests.1M_pop', 'tests.total'];

    tableState.charts[0] = new Chart(
        document.getElementById('myChart1'),
        getConfig(labels1, country)

    );

    tableState.charts[1] = new Chart(
        document.getElementById('myChart2'),
        getConfig(labels2, country)
    );

    tableState.charts[3] = new Chart(
        document.getElementById('myChart3'),
        getConfig(labels3, country)

    );

    tableState.charts[4] = new Chart(
        document.getElementById('myChart4'),
        getConfig(labels4, country)

    );
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
                },
                text: "jjj"
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