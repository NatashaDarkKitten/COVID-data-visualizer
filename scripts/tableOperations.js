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

    changeFieldOrder(null, 'country');

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

    sortDataset(tableState.dataset, sortInfo);
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

    let months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

    let lastUpdateCell = document.getElementById('lastUpdateCell');
    lastUpdateCell.innerHTML = 'Update as of ' + months[+tableState.dataset[0].day.slice(5, 7) - 1] + ' ' + tableState.dataset[0].day.slice(8, 10) + ', ' + tableState.dataset[0].day.slice(0, 4);

    let tbody = document.getElementsByTagName('tbody')[0];

    let dataFieldNames = ['continent', 'country', 'population', 'cases.new', 'cases.active', 'cases.critical', 'cases.recovered', 'cases.1M_pop', 'cases.total', 'deaths.new', 'deaths.1M_pop', 'deaths.total', 'tests.1M_pop', 'tests.total'];

    let tbodyInnerHtml = '';
    for (let i = 0; i < tableState.dataset.length; i++) {

        let data = tableState.dataset[i];
        let rowHtml = '<tr>';
        for (let i = 0; i < dataFieldNames.length; i++) {
            rowHtml += '<td>' + getValueByFieldName(data, dataFieldNames[i]) + '</td>';
        }
        rowHtml += '</tr>';

        tbodyInnerHtml += rowHtml;
    }

    tbody.innerHTML = tbodyInnerHtml;
}

function changeActiveCellStyle(event) {

    let clkCellClasses = event.target.classList;

    if (clkCellClasses.contains("interactCellAsc")) {
        clkCellClasses.remove("interactCellAsc");
        clkCellClasses.add("interactCellDesc");
    } else
    if (clkCellClasses.contains("interactCellDesc")) {
        clkCellClasses.remove("interactCellDesc");
        clkCellClasses.add("interactCellAsc");
    } else {

        let interactCells = document.getElementsByClassName("interactCell");
        for (let i = 0; i < interactCells.length; i++) {
            let classList = interactCells[i].classList;

            if (classList.contains("interactCellAsc")) { classList.remove("interactCellAsc") } else
            if (classList.contains("interactCellDesc")) { classList.remove("interactCellDesc") }

            clkCellClasses.add("interactCellAsc");

        }

    }
}