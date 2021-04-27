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
    let dataFieldNames = ['continent', 'country', 'population', 'cases.new', 'cases.active', 'cases.critical', 'cases.recovered', 'cases.1M_pop', 'cases.total', 'deaths.new', 'deaths.1M_pop', 'deaths.total', 'tests.1M_pop', 'tests.total'];

    let filterCells = document.getElementsByClassName('filterCells')[0].children;

    for (let i = 0; i < dataFieldNames.length; i++) {
        if (tableState.schema[dataFieldNames[i]] && tableState.schema[dataFieldNames[i]].sortType == 'string') {

            let dropDown = document.createElement('input');
            dropDown.setAttribute('type', 'text');
            dropDown.setAttribute('list', dataFieldNames[i] + 'list');
            dropDown.setAttribute('onchange', 'findField(event, ' + dataFieldNames[i] + ')');
            dropDown.setAttribute('id', dataFieldNames[i]);


            let datalist = document.createElement('datalist');
            datalist.setAttribute('id', dataFieldNames[i] + 'list');

            let tempSortInfo = { fieldName: dataFieldNames[i], order: order.ASC };
            sortDataset(data, tempSortInfo);

            let dropDownSet = new Set();
            for (let j = 0; j < data.length; j++) {
                dropDownSet.add('<option>' + data[j][dataFieldNames[i]] + '</option>');
            }
            datalist.innerHTML = [...dropDownSet].join('');

            filterCells[i].appendChild(dropDown);
            filterCells[i].appendChild(datalist);

        } else {
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

            filterCells[i].appendChild(labelForFrom);
            filterCells[i].appendChild(inputNumFrom);

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

            filterCells[i].appendChild(labelForTo);
            filterCells[i].appendChild(inputNumTo);
        }

        let inputBut = document.createElement('input');
        inputBut.setAttribute('type', 'button');
        inputBut.setAttribute('value', 'Discard');
        inputBut.setAttribute('onclick', 'discardFilter(event)');

        filterCells[i].appendChild(inputBut);
    }
}

function discardFilter(event) {

    let button = event.target;
    let siblingInputs = [];
    let sibling = button.parentNode.firstChild;

    while (sibling) {
        if ((sibling.nodeType === 1 && sibling !== button) &&
            (sibling.getAttribute('type') == 'number' || sibling.getAttribute('type') == 'text')) {
            siblingInputs.push(sibling);
        }
        sibling = sibling.nextSibling;
    }

    if (siblingInputs[0].getAttribute('type') == 'number') {
        siblingInputs[0].value = siblingInputs[0].getAttribute('min');
        siblingInputs[1].value = siblingInputs[1].getAttribute('max');
    } else if (siblingInputs[0].getAttribute('type') == 'text') {
        siblingInputs[0].value = '';
    }

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

        let soughtObjs = tableState.dataset.filter(item => item[prop.id] === event.target.value);

        if (soughtObjs.length > 0) {
            tableState.dataset = [...soughtObjs];
            let inputElems = document.getElementsByTagName('input');
            if (prop.id === 'country') {
                for (let i = 0; i < inputElems.length; i++) {
                    if (inputElems[i].getAttribute('list') == 'continentlist') {
                        inputElems[i].value = soughtObjs[0].continent;
                    }
                }

            } else if (prop.id === 'continent') {
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

    let tempData = [...tableState.dataset];

    let months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

    let lastUpdateCell = document.getElementById('lastUpdateCell');
    lastUpdateCell.innerHTML = 'Update as of ' + months[+tempData[0].day.slice(5, 7) - 1] + ' ' + tempData[0].day.slice(8, 10) + ', ' + tempData[0].day.slice(0, 4);

    let tbody = document.getElementsByTagName('tbody')[0];
    let filterCells = document.getElementsByClassName('filterCells');


    let dataFieldNames = ['continent', 'country', 'population', 'cases.new', 'cases.active', 'cases.critical', 'cases.recovered', 'cases.1M_pop', 'cases.total', 'deaths.new', 'deaths.1M_pop', 'deaths.total', 'tests.1M_pop', 'tests.total'];

    // for (let i = 0; i < dataFieldNames.length; i++) {
    //     if (document.getElementById(dataFieldNames[i] + 'to')) {
    //         let numFrom = document.getElementById(dataFieldNames[i] + 'from').value;
    //         let numTo = document.getElementById(dataFieldNames[i] + 'to').value;
    //         console.log(dataFieldNames[i], " ", numFrom, " ", numTo);

    //         tempData = tempData.filter((item) => {
    //             let val = getValueByFieldName(item, dataFieldNames[i]);
    //             return ((val >= numFrom && val <= numTo) || (val == null) || (val == 'null'));
    //         });
    //         console.log(tempData);
    //     }
    // }

    sortDataset(tableState.dataset, tableState.sortInfo);

    let tbodyInnerHtml = '';
    for (let i = 0; i < tempData.length; i++) {

        let field = tempData[i];
        let rowHtml = '<tr>';
        for (let i = 0; i < dataFieldNames.length; i++) {
            rowHtml += '<td>' + getValueByFieldName(field, dataFieldNames[i]) + '</td>';
        }
        rowHtml += '</tr>';

        tbodyInnerHtml += rowHtml;
    }

    tbody.innerHTML = tbodyInnerHtml;
    console.log(tempData);
    if (tempData.length == 1) {
        drawChart(tempData[0]);
    }
}

function drawChart(country) {

    // const labels = ['population', 'cases.new', 'cases.active', 'cases.critical', 'cases.recovered', 'cases.1M_pop', 'cases.total', 'deaths.new', 'deaths.1M_pop', 'deaths.total', 'tests.1M_pop', 'tests.total'];

    let labels1 = ['cases.total', 'cases.recovered', 'deaths.total', 'tests.total'];
    let labels2 = ['cases.new', 'cases.active', 'cases.critical', 'deaths.new'];
    let labels3 = ['cases.1M_pop', 'deaths.1M_pop', 'tests.1M_pop'];

    let myChart1 = new Chart(
        document.getElementById('myChart1'),
        getConfig(labels1, country)

    );

    let myChart2 = new Chart(
        document.getElementById('myChart2'),
        getConfig(labels2, country)
    );

    let myChart3 = new Chart(
        document.getElementById('myChart3'),
        getConfig(labels3, country)

    );
}

function getRGB() {
    let red = Math.floor(Math.random() * 255);
    let green = Math.floor(Math.random() * 255);
    let blue = Math.floor(Math.random() * 255);
    return 'rgb(' + red + ', ' + green + ', ' + blue + ', 0.2)';
}

function getRGBA() {
    let red = Math.floor(Math.random() * 255);
    let green = Math.floor(Math.random() * 255);
    let blue = Math.floor(Math.random() * 255);
    return 'rgb(' + red + ', ' + green + ', ' + blue + ', 0.2)';
}

function getConfig(labels, country) {
    let values = [];
    for (let i = 0; i < labels.length; i++) {
        values[i] = getValueByFieldName(country, labels[i]);
    }

    let data = {
        labels: labels,
        datasets: [{
            label: 'Data',
            data: values,
            backgroundColor: [
                'rgba(255, 99, 132, 0.2)',
                'rgba(255, 159, 64, 0.2)',
                'rgba(255, 205, 86, 0.2)',
                'rgba(75, 192, 192, 0.2)',
                'rgba(54, 162, 235, 0.2)',
                'rgba(153, 102, 255, 0.2)',
                'rgba(201, 203, 207, 0.2)'
            ],
            borderColor: [
                'rgba(255, 99, 132)',
                'rgba(255, 159, 64)',
                'rgba(255, 205, 86)',
                'rgba(75, 192, 192)',
                'rgba(54, 162, 235)',
                'rgba(153, 102, 255)',
                'rgba(201, 203, 207)'
            ],
            borderWidth: 1
        }]
    };

    let config = {
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