function ready() {
    console.log("other ready");
    var delay = 1;
    initVisualization();
    scrollInit();
    initSim();
    simulateArea(vizObj.m0[0], vizObj.m1[0], vizObj.m0[1], vizObj.m1[1], 3, vizObj.selectedTime);
    zoomEnd(vizObj.zoomFactor, vizObj);
    paintArrows(vizObj);
}

function initPage() {
    var mapSize = [$('#Map').first().outerWidth(), $('#Map').first().outerHeight()];
    vizObj.viewPortSize = [mapSize[0], mapSize[1]];

    //Get the scale canvas and adjust its size
    var canvas = document.getElementById('Scale');
    if (canvas) {
        //Get the width of the scalecontainer
        var scaleContainerWidth = $('#ScaleContainer').outerWidth();
        var scaleContainerHeight = $('#ScaleContainer').outerHeight();

        canvas.width = Math.round(scaleContainerWidth);
        canvas.height = Math.round(scaleContainerHeight);
        $('#Scale').width(canvas.width + 'px');
        $('#Scale').height(canvas.height + 'px');
    }
    if (canvas) {
        vizObj.contextScale = canvas.getContext("2d");
    }

    $('#Content').width(mapSize[0] + 'px');
    $('#Content').height(mapSize[1] + 'px');

    //Init gradient canvas
    //Get the gradient canvas and adjust its size
    if (canvas) {
        /*
        var canvas = document.getElementById('Gradient');
        canvas.width = $('#GradientContainer').width();
        canvas.height = $('#GradientContainer').height();

        vizObj.contextGradient = canvas.getContext("2d");
        */

        //Get the height of the time container
        var timeHeight = $('#TimeContainer').height();


    }

    nowButtonClick();
}

/* Matrix functions */
function Create2DArray(rows, columns) {
    rows = Math.round(rows);
    columns = Math.round(columns);
    var x = new Array(rows);
    for (var i = 0; i < rows; i++) {
        x[i] = new Array(columns);
    }
    return x;
}

function nowButtonClick() {
    var currentTime = getCurrentTime();
    if (currentTime.getTime() != vizObj.selectedTime.getTime()) {
        vizObj.selectedTime = getCurrentTime();
        //waitingState(true);
        setTimeout(function() {
            simulateArea(vizObj.m0[0], vizObj.m1[0], vizObj.m0[1], vizObj.m1[1], 3, vizObj.selectedTime);
            zoomEnd(vizObj.zoomFactor, vizObj);
            paintArrows(vizObj);
            //waitingState(false);
        }, vizObj.waitingTimeout);

        $("#HourSlider").attr("value", vizObj.selectedTime.getHours() * 60 + vizObj.selectedTime.getMinutes());
        $("#HourSlider").val(vizObj.selectedTime.getHours() * 60 + vizObj.selectedTime.getMinutes());
        $("#SelectedDateTime").text(dateToString(vizObj.selectedTime));
        $("#MapSelectedDate").text(dateToString(vizObj.selectedTime));
        $("#overviewSelectedDate").text(dateToShortString(vizObj.selectedTime));
    }

}

function getCurrentTime() {
    var date = new Date();
    var minutes = date.getMinutes();
    minutes = ((((60 / vizObj.timeIncrement) * minutes) / 59).toFixed(0)) / (60 / vizObj.timeIncrement);
    minutes = minutes * 60;
    if (minutes == 60) {
        minutes = 0;
        date.setHours(date.getHours() + 1);
    }

    date.setMinutes(minutes);
    date.setSeconds(0);
    date.setMilliseconds(0);
    return date;
}

function dayOfYear(date) {
    var Year = date.getFullYear();
    var onejan = new Date(date.getFullYear(), 0, 1);

    var totalSeconds = date.getTime() / 1000;
    var totalMinutes = totalSeconds / 60 - date.getTimezoneOffset();
    var totalHours = totalMinutes / 60;
    var totalDays = totalHours / 24;

    var onetotalSeconds = onejan.getTime() / 1000;
    var onetotalMinutes = onetotalSeconds / 60;
    var onetotalHours = onetotalMinutes / 60
    var onetotalDays = onetotalHours / 24;

    var dDays = totalDays - onetotalDays;

    var days = Math.floor(dDays);
    days = days + 1;

    return days;
}

function dateToString(date) {
    var shortYear = date.getFullYear();
    shortYear = Math.floor(shortYear / 100) * 100;
    return lz(date.getDate()) + '/' + lz(date.getMonth() + 1) + '/' + lz(date.getFullYear() - shortYear) + '  ' + lz(date.getHours()) + ':' + lz(date.getMinutes());
}

function dateToShortString(date) {
    var shortYear = date.getFullYear();
    shortYear = Math.floor(shortYear / 100) * 100;
    return lz(date.getDate()) + '/' + lz(date.getMonth() + 1) + '/' + lz(date.getFullYear() - shortYear);
}

// Add leading zero
function lz(number) {
    if (number < 10) {
        return '0' + number;
    } else {
        return number;
    }
}

function rad2deg(value) {
    return value * (180 / Math.PI)
}