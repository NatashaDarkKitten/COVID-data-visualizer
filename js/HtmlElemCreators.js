function createNumInput(field, min, max, side) {
    const input = document.createElement('input');
    input.setAttribute('type', 'number');
    input.setAttribute('id', `${field}${side}`);
    value = (side === 'from') ? min : max;
    input.setAttribute('value', value);
    input.setAttribute('min', min);
    input.setAttribute('max', max);
    input.setAttribute('maxlength', max.toString().length);
    input.setAttribute('oninput', 'limitInput(event)');
    input.setAttribute('onkeypress', 'return isNumberKey(event)');
    return input;
}

function createLabel(field, side) {
    const label = document.createElement('label');
    label.setAttribute('for', `${field}${side}`);
    label.innerHTML = side;
    return label;
}

function createButton(type) {
    const button = document.createElement('input');
    button.setAttribute('type', 'button');
    button.setAttribute('value', type);
    button.setAttribute('onclick', `${type}Filter(event)`);
    button.setAttribute('class', type);
    return button;
}

function fillDataList(id) {
    const dataList = document.getElementById(`${id}list`);
    const elems = statistics.dataset.map(item => item[id]).sort();
    const elemsSet = new Set(elems);

    let options = '';
    elemsSet.forEach(item => {
        options += `<option>${item}<option>`;
    });

    dataList.innerHTML = options;
}

function fillFilterCells() {

    fillDataList('continent');
    fillDataList('country');

    const dataFieldNames = ['population', 'cases.new', 'cases.active', 'cases.critical', 'cases.recovered', 'cases.1M_pop', 'cases.total', 'deaths.new', 'deaths.1M_pop', 'deaths.total', 'tests.1M_pop', 'tests.total'];

    let filterCells = document.querySelector('.filterCells').children;
    let i = 1;
    dataFieldNames.forEach(item => {
        let values = statistics.getValuesByProp(item);
        let min = Math.min(values);
        let max = Math.max(values);

        filterCells[i].appendChild(createLabel(item, 'from'));
        filterCells[i].appendChild(createNumInput(item, min, max, 'from'));

        filterCells[i].appendChild(createLabel(item, 'to'));
        filterCells[i].appendChild(createNumInput(item, min, max, 'to'));

        filterCells[i].appendChild(createButton('discard'));
        filterCells[i].appendChild(createButton('apply'));
        i++;
    });
}