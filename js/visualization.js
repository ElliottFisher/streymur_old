var vizObj = new visProperties();

/*!
Initializes the the canvases used for painting matrices
*/

function initVisualization() {
    //console.log(arguments.callee.name);
    vizObj.selectedTime = new Date();
    //fitLandMap();
    initPage();
    // The Images canvas is used to store a complete image of the matrix. This image is used for preview zoom and pan
    $('#MapContent').width(vizObj.viewPortSize[0] + 'px');
    $('#MapContent').height(vizObj.viewPortSize[1] + 'px');

    //Set the size of the image canvas to the same size as the viewPortSize
    $('#Image').width(vizObj.viewPortSize[0] + 'px');
    $('#Image').height(vizObj.viewPortSize[1] + 'px');

    //Set the position of the time container

    //Based on the size of the template and the size of the display calculate suitable scaling factor
    var sX = $('#Image').width() / map[0].length; //Calculate scaling factor for x-axis
    var sY = $('#Image').height() / map.length; //Calculate scaling factor for y-axis
    vizObj.tw = map[0].length;
    vizObj.th = map.length;
    //Check if it is possible to use sY to also scale the x dimension
    if (map.length * sX <= $('#Image').height()) {
        vizObj.sT = sX;
    } else {
        vizObj.sT = sY;
    }

    // The main canvas is used to zoom/pan previews based on the image. And used to show the matrix including offset/vizObj.vizObj.zoomFactor
    $('#PreviewOcean').width(vizObj.viewPortSize[0] + 'px');
    $('#PreviewOcean').height(vizObj.viewPortSize[1] + 'px');


    canvas = document.getElementById('PreviewOcean');

    //Set the size of the canvas to the same size as the container
    canvas.width = $('#PreviewOcean').width();
    canvas.height = $('#PreviewOcean').height();
    //Get the context
    vizObj.contextOcean = canvas.getContext("2d");

    var arrowsCanvas = document.getElementById('Arrows');
    arrowsCanvas.width = $('#Arrows').width();
    arrowsCanvas.height = $('#Arrows').height();
    vizObj.contextArrows = arrowsCanvas.getContext("2d");

    //Set the canvas size
    //var ca = document.getElementById('PreviewLand');
    //vizObj.con          = ca.getContext("2d");
    vizObj.displaySize = [vizObj.viewPortSize[0], vizObj.viewPortSize[1]];
    vizObj.interPolate = false;
    vizObj.paintArrows = true;
    //$('#PreviewLand').height(vizObj.viewPortSize[1] + 'px');
    //$('#PreviewLand').width('100%');
    vizObj.canvasStart = [0, 0];
    vizObj.canvasStop = [vizObj.viewPortSize[0], vizObj.viewPortSize[1]];
    document.onmousemove = function(e) {
        vizObj.mouse = [e.pageX, e.pageY];
    };

    var dummy = document.getElementById('PreviewOcean');
    vizObj.paintMatrixContext = dummy.getContext("2d");

    zoomEnd(1, vizObj);
    //Init the touch functions
    touchInit(vizObj);
}

function fitLandMap() {
    //console.log(arguments.callee.name);

    var width = $('#m').width();
    var height = $('#LandMap').height();

    var sX = $('#Map').width() / width; //Calculate scaling factor for x-axis
    var sY = $('#Map').height() / height; //Calculate scaling factor for y-axis
    var s = 0;
    //Check if it is possible to use sY to also scale the x dimension
    if (height * sX <= $('#Map').height()) {
        s = sX;
    } else {
        s = sY;
    }

    // Scale the landmap
    $('#LandMap').width((width * s) + 'px');
    $('#LandMap').height((height * s) + 'px');

    //Center the landmap in the parent container

    var top = ($('#Map').height() - $('#LandMap').height()) / 2;
    var left = ($('#Map').width() - $('#LandMap').width()) / 2;

    $('#LandMap').css({ "top": top + 'px' });
    $('#LandMap').css({ "left": left + 'px' });
    vizObj.landImageSize = [$('#LandMap').width(), $('#LandMap').height()];
    vizObj.previewSize = [$('#LandMap').width(), $('#LandMap').height()];
    vizObj.previewPosition = [$('#LandMap').position().left, $('#LandMap').position().top];
}

function scrollInit() {
    //console.log(arguments.callee.name);
    //fitLandMap
    $('#Map').bind('mousewheel  DOMMouseScroll MozMousePixelScroll', function(e) {
        var zoom = 0;
        if (e.originalEvent.wheelDelta > 0) {
            zoom = 0.5;
        } else {
            zoom = -0.5;
        }

        zoomPreview(vizObj.zoomFactor + zoom, oxPre, oyPre, vizObj);
        zoomEnd(vizObj.zoomFactor + zoom, vizObj);
        simulateArea(vizObj.m0[0], vizObj.m1[0], vizObj.m0[1], vizObj.m1[1], 3, vizObj.selectedTime);
        paintArrows(vizObj);
        updateGPSValues();
        GPSDisplayUpdate(vizObj.lat, vizObj.lon);
    });
}

function time(direction) {
    //console.log(arguments.callee.name);
    timeChange(direction);
    simulateArea(vizObj.m0[0], vizObj.m1[0], vizObj.m0[1], vizObj.m1[1], 3, vizObj.selectedTime);
    zoomEnd(vizObj.zoomFactor, vizObj);
    paintArrows(vizObj);
}