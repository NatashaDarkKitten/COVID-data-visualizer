$(function() {

    function rangeInputChangeEventHandler(e) {

        var rangeGroup = $(this).attr('name'),
            minBtn = $(this).parent().children('.min'),
            maxBtn = $(this).parent().children('.max'),
            range_min = $(this).parent().children('.range_min'),
            range_max = $(this).parent().children('.range_max'),
            minVal = parseInt($(minBtn).val()),
            maxVal = parseInt($(maxBtn).val()),
            origin = $(this).context.className;

        if (origin === 'min' && minVal > maxVal) {
            $(minBtn).val(maxVal);
        }
        var minVal = parseInt($(minBtn).val());
        $(range_min).html(minVal);

        if (origin === 'max' && maxVal < minVal) {
            $(maxBtn).val(minVal);
        }
        var maxVal = parseInt($(maxBtn).val());
        $(range_max).html(maxVal);
    }

    $('input[type="range"]').on('input', rangeInputChangeEventHandler);
});