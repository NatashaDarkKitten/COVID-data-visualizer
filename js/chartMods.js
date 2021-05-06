const colors = [
    'rgba(255, 99, 132)',
    'rgba(255, 159, 64)',
    'rgba(255, 205, 86)',
    'rgba(75, 192, 192)',
    'rgba(54, 162, 235)',
    'rgba(153, 102, 255)',
    'rgba(201, 203, 207)',
    'rgba(255, 99, 132)',
    'rgba(255, 159, 64)',
    'rgba(255, 205, 86)',
    'rgba(75, 192, 192)',
    'rgba(54, 162, 235)',
    'rgba(153, 102, 255)',
    'rgba(201, 203, 207)'
];

const colorsAlpha = [
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
];

function getConfig(labels, field) {

    let values = []

    for (let i = 0; i < labels.length; i++) {
        values[i] = statistics.getValueByProp(field, labels[i]);
    }

    const data = {
        labels: labels,
        datasets: [{
            label: 'Data Set',
            data: values,
            backgroundColor: colorsAlpha,
            borderColor: colors,
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

function createStatisticsCharts(country) {

    const labels = [
        ['cases.total', 'cases.recovered', 'deaths.total', 'tests.total'],
        ['cases.new', 'cases.active', 'cases.critical', 'deaths.new'],
        ['cases.1M_pop', 'deaths.1M_pop', 'tests.1M_pop'],
        allProps.slice(2)
    ];

    let canvases = Array.from(document.getElementsByClassName('chart'));
    canvases = canvases.filter(item => item.classList.contains('chart'));

    labels.forEach((labels) => {
        let chart = canvases.shift().firstChild.nextElementSibling;

        statistics.charts.push(
            new Chart(chart,
                getConfig(labels, country)
            )
        );
    });
}

function createHistoryChart() {
    if (history.chart) {
        history.chart.destroy();
        history.chart = undefined;
    }

    const labels = [
        'population',
        'cases.active',
        'cases.critical',
        'cases.recovered',
        'cases.total',
        'deaths.total',
        'tests.total'
    ];

    const dates = history.dataset.map(item => item.time.slice(0, 10));

    let datasets = [];
    for (let i = 0; i < labels.length; i++) {
        datasets.push({
            label: labels[i],
            backgroundColor: colors[i],
            borderColor: colors[i],
            data: history.dataset.map(item => statistics.getValueByProp(item, labels[i])),
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