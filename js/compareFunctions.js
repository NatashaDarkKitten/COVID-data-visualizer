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
}

function numberSort(a, b) {
    let field = statistics.sortInfo.fieldName;
    let order = statistics.sortInfo.order;

    let x = statistics.getValueByProp(a, field);
    let y = statistics.getValueByProp(b, field);

    let result = x - y;

    return order == order.ASC ? result : -result;
}


function stringSort(a, b) {
    let field = statistics.sortInfo.fieldName;
    let order = statistics.sortInfo.order;

    let x = statistics.getValueByProp(a, field);
    let y = statistics.getValueByProp(b, field);
    x = x ? x.toLowerCase() : x;
    y = y ? y.toLowerCase() : y;

    let result = 0;
    if (x > y) {
        result = 1;
    }
    if (x < y) {
        result = -1;
    }

    return order == order.ASC ? result : -result;
}