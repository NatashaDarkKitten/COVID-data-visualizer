const order = {
    ASC: 'ASC',
    DESC: 'DESC'
};

const statisticsSchema = {
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
    'day': 'string',

}

const allProps = [
    'continent',
    'country',
    'population',
    'cases.new',
    'cases.active',
    'cases.critical',
    'cases.recovered',
    'cases.1M_pop',
    'cases.total',
    'deaths.new',
    'deaths.1M_pop',
    'deaths.total',
    'tests.1M_pop',
    'tests.total'
]

const statistics = {
    dataset: undefined,
    sortInfo: {
        fieldName: 'country',
        order: order.ASC
    },
    schema: statisticsSchema,
    charts: [],
    filterInfo: [],
    sortedData: function() {
        let schema = this.getSchemaByProp(this.sortInfo.fieldName);
        let sortData = this.dataset.slice();
        if (schema.sortType === 'number') {
            sortData.sort(numberSort);
        } else if (schema.sortType === 'string') {
            sortData.sort(stringSort);
        }
        return sortData;
    },
    filteredData: function() {
        let filterData = this.sortedData();
        // How use Array.reduce() if reduce return one result but I need array
        this.filterInfo.forEach(filter => {
            let f = filter.fieldName;
            filterData = filterData.filter(item =>
                +statistics.getValueByProp(item, f) >= filter.from &&
                +statistics.getValueByProp(item, f) <= filter.to ||
                item[f] === null || item[f] === 'null');
        });
        return filterData;
    },
    getDateString: function() {
        let months = [
            'January',
            'February',
            'March',
            'April',
            'May',
            'June',
            'July',
            'August',
            'September',
            'October',
            'November',
            'December'
        ]
        let dateStr = this.dataset[0].day;
        return 'Update as of ' + months[dateStr.slice(5, 7) - 1] + ' ' + dateStr.slice(8, 10) + ', ' + dateStr.slice(0, 4);
    },
    getSchemaByProp: function(prop) {
        const chain = prop.split('.');
        let schema = statistics.schema[chain.shift()];
        chain.forEach(item => {
            schema = schema[item];
        });
        return schema;
    },
    getValuesByProp: function(prop) {
        const chain = prop.split('.');
        let chainLink = chain.shift();
        let values = statistics.dataset.map(item => item[chainLink]);
        chain.forEach(link => {
            values = values.map(item => item[link]);
        });
    },
    getValueByProp: function(someObj, prop) {
        let chain = prop.split('.');
        let value = someObj[chain.shift()];
        chain.forEach(item => {
            value = value[item];
        });
        return value;
    }
};

const history = {
    response: undefined,
    chart: undefined
}

function init() {
    let lastUpdate = localStorage.getItem('lastUpdate');
    let lastDate = new Date(lastUpdate);
    let nowDate = new Date();

    let min15 = 15 * 60 * 1000; //ms
    if ((lastUpdate && nowDate - lastDate > min15) || !lastUpdate) {
        getStatistics().then(data => {
                localStorage.setItem('statistics', JSON.stringify(data));
                localStorage.setItem('lastUpdate', nowDate);
                statistics.dataset = data.response;
                fillDomElems();
            })
            .catch(err => {
                console.error(err);
            });
    } else {
        let response = JSON.parse(localStorage.getItem('statistics'));
        statistics.dataset = response.response;
        fillDomElems();
    }
}

function fillDomElems() {
    fillFilterCells();
    updateTable();
}

function viewChartByDate() {

    document.querySelector('.alert').style.display = 'none';

    let country = document.querySelector('#countryh').value;
    let dateFrom = document.querySelector('#dateFrom').value;
    let dateTo = document.querySelector('#dateTo').value;

    if (!country) {
        showErrMsg('Fill country field');
        return;
    }

    const countries = statistics.dataset.map(item => item.country);

    if (!countries.find(item => item.toLowerCase() == country.toLowerCase())) {
        showErrMsg('No such country found');
        return;
    }

    getHistory(country)
        .then(response => {
            history.dataset = response.response;

            if (dateFrom && dateTo) {
                history.dataset = history.dataset.filter(item =>
                    isInRange(item.day, dateFrom, dateTo)
                );
            }

            history.dataset = history.dataset.sort((a, b) => {
                let x = new Date(a.time);
                let y = new Date(b.time);
                return x > y ? 1 : x < y ? -1 : 0;
            });

            createHistoryChart();
        })
        .catch(err => {
            console.error(err);
        });
}

function showErrMsg(msg) {

    let alert = document.querySelector('.alert');
    alert.style.display = '';

    let errorMessage = document.querySelector('#errorMessage');
    errorMessage.innerHTML = msg;
}

function updateTable() {

    const data = statistics.filteredData();

    document.querySelector('#lastUpdateCell').innerHTML = statistics.getDateString();

    let tbody = document.querySelector('tbody');
    let filterCells = document.querySelector('.filterCells');

    let tbodyInnerHtml = '';
    for (let i = 0; i < data.length; i++) {
        let rows = '';
        for (let j = 0; j < allProps.length; j++) {
            rows += `<td>${statistics.getValueByProp(data[i], allProps[j])}</td>`;

        }
        tbodyInnerHtml += `<tr>${rows}</tr>`;
    }

    tbody.innerHTML = tbodyInnerHtml;

    if (statistics.charts.length > 0) {
        for (let i = 0; i < statistics.charts.length; i++) {
            if (statistics.charts[i]) {
                statistics.charts[i].destroy();
            }
        }
    }

    if (data.length === 1) {
        let chartDivs = document.getElementsByClassName('chart');
        createStatisticsCharts(data[0]);
    }
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

            if (classList.contains('interactCellAsc')) {
                classList.remove('interactCellAsc')
            } else if (classList.contains('interactCellDesc')) {
                classList.remove('interactCellDesc')
            }
            clkCellClasses.add('interactCellAsc');
        }

    }
}