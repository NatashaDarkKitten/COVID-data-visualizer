function limitInput(event) {
    let elem = event.target;
    let value = event.target.value;

    if (value.length > elem.maxLength) {
        value = value.slice(0, elem.maxLength);
    }
    if (value.length == 0) {
        value = 0;
    }
}

function isNumberKey(event) {
    // 8 - Back Space, 0 - Null char, 13 - Carriage Return, 48-57 - 0-9 digits
    let res = ((event.charCode == 8 || event.charCode == 0 || event.charCode == 13) || (event.charCode >= 48 && event.charCode <= 57))
    return res;
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

    statistics.filterInfo = statistics.filterInfo.filter(item => item.fieldName !== idField);

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

    statistics.filterInfo = statistics.filterInfo.filter(item => item.fieldName !== idField);

    statistics.filterInfo.push({
        fieldName: idField,
        from: siblingInputs[0].value,
        to: siblingInputs[1].value
    });

    updateTable();
}

function findCountry(event) {
    let temp = JSON.parse(localStorage.getItem('statistics'));
    statistics.dataset = temp.response;

    let selCountry = event.target.value;
    let continentInput = document.getElementById('continent');
    continentInput.value = '';

    if (country) {

        let soughtObjs = statistics.dataset.filter(item => {
            let res = !item.country || item.country.toLowerCase() === selCountry.toLowerCase();
            return res;
        });

        if (soughtObjs.length > 0) {

            statistics.dataset = soughtObjs.slice();


            continentInput.value = soughtObjs[0].continent;
        }
    }
    updateTable();
}

function findContinent(event) {

    let temp = JSON.parse(localStorage.getItem('statistics'));
    statistics.dataset = temp.response;

    let selContinent = event.target.value;
    let countryInput = document.getElementById('country');

    if (selContinent) {

        let soughtObjs = statistics.dataset.filter(item => {
            let res = !item.continent || item.continent.toLowerCase() === selContinent.toLowerCase();
            return res;
        });

        if (soughtObjs.length > 0) {
            statistics.dataset = soughtObjs.slice();
        }
    }
    countryInput.value = "";

    updateTable();
}

function changeFieldOrder(event, fieldName) {

    let sortInfo = statistics.sortInfo;

    if (sortInfo.fieldName === fieldName) {
        sortInfo.order = sortInfo.order === order.ASC ? order.DESC : order.ASC;
    } else {
        sortInfo.fieldName = fieldName;
        sortInfo.order = order.ASC;
    }
    if (event) { changeActiveCellStyle(event); }
    updateTable();
}