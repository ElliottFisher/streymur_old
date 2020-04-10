function visProperties() {
    //console.log(arguments.callee.name);
    var properties = {
        zoomFactor: 1, // Zoomfactor, ranges from 1 to inf
        //offset			: 0,
        sT: 0, // Template scale relative to matrix size
        //imageSize		: 0,			// Size of the image [width,height]
        lon: 0, // Longitude [deg]
        lat: 0, // Latitude  [deg]
        mouse: 0, // Mouse coordinates [x,y]
        matrix: 0, // Matrix cooridates [x,y]
        angle: 0,
        maxAmplitude: 3,
        speed: 0, // Speed from GPS
        displaySize: 0, // Resolution of the client display [width,height]
        //c0				: 0,
        //c1				: 0,
        m0: 0, // Start coordinates of visualized part of matrix [x,y]
        m1: 0, // End coordinates of visualized part of matrix [x,y]
        cellSize: 0, // Size of matrix cell with current zoomFactor [pixels]
        //pw				: 0,			// Width of preview
        //ph				: 0,			// Height of preview
        //contextLocation : 0,
        contextArrows: 0,
        contextLand: 0, // Context of the preview
        contextOcean: 0,
        touchElement: 0, // Element which is used for detecting touch input
        canvasSize: 0,
        previewImage: 0, // Context containing the preview
        //con				: 0,			// Context containg a single interpolation triangle
        //interPolate     : 0,
        paintArrows: 0,
        //t    			: 0,
        //xScale			: 0,
        //xScalePrev		: 0,
        canvasStart: 0,
        canvasStop: 0,
        viewPortSize: 0,
        Position: 0,
        contextScale: 0,
        contextGradient: 0,
        timeIncrement: 15, // Time increment [minutes]
        //landImageSize	: 0,
        matrixCoords: 0,
        dispCoords: 0,
        waitingTimeout: 1,
        selectedTime: 0,
        areaMax: 0,
        //avgSize: 17,
        avgSize: 1,
        minDisplayAmp: 0.05,
        previewPosition: 0,
        previewSize: 0,
        paintMatrixContext: 0,
        autoTimeEnabled: 0
    };
    properties.displaySize = [0, 0];
    properties.mouse = [0, 0];
    //properties.offset = [0,0];
    properties.matrix = [0, 0];
    //properties.c0 = [0,0];
    //properties.c1 = [0,0];
    properties.canvasSize = [0, 0];
    properties.canvasStart = [0, 0];
    properties.canvasStop = [0, 0];
    properties.viewPortSize = [0, 0];
    properties.Position = new Object();
    properties.contextScale = new Object();
    properties.contextGradient = new Object();
    properties.contextLand = new Object();
    properties.contextOcean = new Object();
    properties.paintArrows = false;
    //properties.landImageSize = new Object();
    properties.matrixCoords = new Object();
    properties.dispCoords = new Object();
    properties.selectedTime = new Object();
    properties.previewPosition = new Object();
    properties.previewSize = new Object();
    properties.paintMatrixContext = new Object();
    properties.autoTimeEnabled = new Object();
    return properties;
}

function PositionStyle(ID) {
    //console.log(arguments.callee.name);
    var leftStr = $('#' + ID)[0].style.left;
    var topStr = $('#' + ID)[0].style.top;
    leftStr = leftStr.substring(0, leftStr.length - 2);
    topStr = topStr.substring(0, topStr.length - 2);
    return [Number(leftStr), Number(topStr)];
}

/* Zoom functions   */

function zoomEnd(zf, visData) {
    //console.log(arguments.callee.name);
    zf = Number(zf);
    visData.zoomFactor = zf;
    if (visData.zoomFactor < 1) {
        visData.zoomFactor = 1;
    }

    if (visData.zoomFactor <= 1) {
        visData.avgSize = 11;
        //visData.avgSize=1;  //For demo visualization
    } else if (visData.zoomFactor <= 1.5) {
        visData.avgSize = 9;
    } else if (visData.zoomFactor <= 2) {
        visData.avgSize = 5;
    } else if (visData.zoomFactor <= 3) {
        visData.avgSize = 5;
    } else if (visData.zoomFactor <= 4) {
        visData.avgSize = 3;
    } else if (visData.zoomFactor <= 6) {
        visData.avgSize = 3;
    } else {
        visData.avgSize = 1;
    }

    //Maintain the center of the landmap
    var parentSize = [$('#Map').width(), $('#Map').height()];
    var Size = [$('#LandMap').width(), $('#LandMap').height()];
    var Position = PositionStyle('LandMap');

    var drawStart = [-Position[0], -Position[1]];
    var drawStop = [Position[0] + Size[0], Position[1] + Size[1]];
    if (drawStart[0] < 0) {
        drawStart[0] = 0;
    }
    if (drawStart[1] < 0) {
        drawStart[1] = 0;
    }
    if (drawStop[0] < parentSize[0]) {
        drawStop[0] = $('#LandMap').width();
    } else if (drawStop[0] > parentSize[0]) {
        drawStop[0] = parentSize[0] - Position[0];
    }
    if (drawStop[1] < parentSize[1]) {
        drawStop[1] = $('#LandMap').height();
    } else if (drawStop[1] > parentSize[1]) {
        drawStop[1] = parentSize[1] - Position[1];
    }

    // Translate draw coordinates into matrix coordinates
    drawStart[0] = drawStart[0] / Size[0];
    drawStart[1] = drawStart[1] / Size[1];
    drawStop[0] = drawStop[0] / Size[0];
    drawStop[1] = drawStop[1] / Size[1];

    m0 = [map[0].length * drawStart[0], map.length * drawStart[1]];

    m1 = [map[0].length * drawStop[0], map.length * drawStop[1]];


    visData.m0 = [map[0].length * drawStart[0], map.length * drawStart[1]];
    visData.m1 = [map[0].length * drawStop[0], map.length * drawStop[1]];

    // Calculate the width of the image which has been drawn on the display
    var newStart = [Position[0], Position[1]];
    var newStop = [Position[0] + Size[0], Position[1] + Size[1]];

    if (newStart[0] < 0) {
        newStart[0] = 0;
    } else if (newStart[0] > parentSize[0]) {
        newStart[0] = parentSize[0];
    }
    if (newStart[1] < 0) {
        newStart[1] = 0;
    } else if (newStart[1] > parentSize[1]) {
        newStart[1] = parentSize[1];
    }

    if (newStop[0] < 0) {
        newStop[0] = 0;
    } else if (newStop[0] > parentSize[0]) {
        newStop[0] = parentSize[0];

    }
    if (newStop[1] < 0) {
        newStop[1] = 0;
    } else if (newStop[1] > parentSize[1]) {
        newStop[1] = parentSize[1];
    }

    //Calculate the size of the part of the image which is visible
    var visibleSize = [newStop[0] - newStart[0], newStop[1] - newStart[1]];

    visData.dispCoords = [newStart[0], newStart[1], newStop[0], newStop[1]];
    visData.matrixCoords = [visData.m0[0], visData.m0[1], visData.m1[0], visData.m1[1]]

    //setValues(visData);
}

//var PreviewSize = new Object();
//var PreviewPosition = new Object();
function zoomPreview(zf, xoff, yoff, visData) {
    //console.log(arguments.callee.name);
    visData.contextOcean.clearRect(0, 0, visData.displaySize[0], visData.displaySize[1]);
    visData.contextArrows.clearRect(0, 0, visData.displaySize[0], visData.displaySize[1]);
    zf = Number(zf);
    if (zf < 1) {
        zf = 1;
    }

    //Maintain the center of the landmap
    var parentSize = [$('#Map').width(), $('#Map').height()];

    // Calculate relative distance to center of image
    var distTop = (parentSize[1] / 2) - visData.previewPosition[1];
    var distLeft = (parentSize[0] / 2) - visData.previewPosition[0];
    distTop = distTop / visData.previewSize[1];
    distLeft = distLeft / visData.previewSize[0];

    // Calculate new width and height for the LandMap
    var newWidth = visData.landImageSize[0] * zf;
    var newHeight = visData.landImageSize[1] * zf;

    // Calculate distance to left in pixels
    var newLeft = newWidth * distLeft;
    var newTop = newHeight * distTop;
    // Subtract half the width of the parent container
    newLeft = -(newLeft - parentSize[0] / 2);
    newTop = -(newTop - parentSize[1] / 2);
    // Calculate new left and top in order to maintain the center

    $('#LandMap').width((newWidth) + 'px');
    $('#LandMap').height((newHeight) + 'px');
    $('#LandMap').css({ "left": newLeft + 'px' });
    $('#LandMap').css({ "top": newTop + 'px' });

}

/* Pan functions */
var oxPre = 0;
var oyPre = 0;
var oxPre1 = 0;
var oyPre1 = 0;
var previewImageTest = new Object();
var landPosn = $('#LandMap').position();

function panPreview(ox, oy, visData) {
    //console.log(arguments.callee.name);
    var left = landPosn.left;
    var top = landPosn.top;
    $('#LandMap').css({ "left": left - ox + 'px' });
    $('#LandMap').css({ "top": top - oy + 'px' });
}

function panEnd(ox, oy, visData) {
    //console.log(arguments.callee.name);
    $('#LandMap').css({ "left": landPosn.left + -ox + 'px' });
    $('#LandMap').css({ "top": landPosn.top - oy + 'px' });
    zoomEnd(visData.zoomFactor, visData);
}

/* Mapping functions */
function calcCoords(screenX, screenY, visData) {
    //console.log(arguments.callee.name);
    var coords = disp2Matrix(screenX, screenY, visData);
    visData.matrix = coords;
    var latlon = grid2geo(visData.matrix[0], visData.matrix[1], 821)
    visData.lat = latlon[0];
    visData.lon = latlon[1];
    if (visData.matrix[0] >= 0 && visData.matrix[0] <= 821 && visData.matrix[1] >= 0 && visData.matrix[1] <= 1221) {
        if (angles[Math.round(visData.matrix[1])][Math.round(visData.matrix[0])]) {
            visData.angle = angles[Math.round(visData.matrix[1])][Math.round(visData.matrix[0])];
        }

    }
    // setValues(visData);
}

function disp2Matrix(xIn, yIn, visData) {
    //console.log(arguments.callee.name);
    var Position = PositionStyle('LandMap');
    var ximg = xIn + (-Position[0]);
    var yimg = yIn + (-Position[1]);
    var xmat = ximg / visData.xScale;
    var ymat = yimg / visData.xScale;
    return [xmat, ymat];
}

function matrix2Disp(xIn, yIn, visData) {
    //console.log(arguments.callee.name);
    var Position = PositionStyle('LandMap');
    var xDisp = (xIn * visData.xScale) - (-Position[0]);
    var yDisp = (yIn * visData.xScale) - (-Position[1]);
    return [xDisp, yDisp];
}

/* Painting functions */
// Usage confirmed
function paintMatrixImage(canvasID, matrixCoords, dispCoords, visData) {
    //console.log(arguments.callee.name);
    //console.log(matrixCoords);
    //console.log(dispCoords);
    xStart = (matrixCoords[0]);
    yStart = (matrixCoords[1]);
    xStop = (matrixCoords[2]);
    yStop = (matrixCoords[3]);
    visData.avgSize = 1;
    var span = (visData.avgSize - 1) / 2;

    // Calculate the width and height of the matrix (or submatrix) which should be painted
    var xLength = (xStop - xStart);
    var yLength = (yStop - yStart);
    var l = 0;
    var index = 0;
    var pi = 0;
    var color = [0, 0, 0];
    var pixelIndex = 0;

    xxLength = Math.round(xLength / visData.avgSize);
    yyLength = Math.round(yLength / visData.avgSize);

    var imageData = visData.paintMatrixContext.createImageData(xxLength, yyLength);
    xStart = Math.round(xStart);
    xStop = Math.round(xStop);
    yStart = Math.round(yStart);
    yStop = Math.round(yStop);

    for (var y = 0; y < imageData.height; y++) {
        for (var x = 0; x < imageData.width; x++) {
            if (map[y * visData.avgSize][x * visData.avgSize] != -1) {}
        }
    }
    var imgx = 0;
    var imgy = 0;
    for (var x = xStart + span; x < xStop - span; x += vizObj.avgSize) {
        imgy = 0;
        for (var y = yStart + span; y < yStop - span; y += vizObj.avgSize) {
            if (map[y][x] != -1) {
                pixelIndex = ((imgy * (imageData.width * 4)) + (imgx * 4));
                color = gradientRGB[colors[y][x]];
                if (!color) {
                    imageData.data[pixelIndex + 3] = 0;
                } else {
                    imageData.data[pixelIndex] = color[0];
                    imageData.data[pixelIndex + 1] = color[1];
                    imageData.data[pixelIndex + 2] = color[2];
                    imageData.data[pixelIndex + 3] = 255;
                }
            }
            imgy++;
        }
        imgx++;
    }

    var dx = dispCoords[0];
    var dy = dispCoords[1];
    var dirtyX = 0;
    var dirtyY = 0;
    var dirtyWidth = dispCoords[2] - dx;
    var dirtyHeight = dispCoords[3] - dy;
    var newCanvas = $("<canvas>").attr("width", imageData.width).attr("height", imageData.height)[0];
    newCanvas.getContext("2d").putImageData(imageData, 0, 0);
    visData.paintMatrixContext.drawImage(newCanvas, dx, dy, dirtyWidth, dirtyHeight);
}

function paintArrows(visData) {
    //console.log(arguments.callee.name);
    var canvasID = 'PreviewOcean';
    visData.contextOcean.clearRect(0, 0, visData.displaySize[0], visData.displaySize[1]);
    paintMatrixImage(canvasID, visData.matrixCoords, visData.dispCoords, visData);
    xStart = visData.matrixCoords[0];
    yStart = visData.matrixCoords[1];
    xStop = visData.matrixCoords[2];
    yStop = visData.matrixCoords[3];

    // Calculate the width and height of the matrix (or submatrix) which should be painted
    var xLength = xStop - xStart;
    var yLength = yStop - yStart;

    // set the width of the output to the same width as the input
    var xLengthOutput = xLength;
    // Repeat for height
    var yLengthOutput = yLength;

    //Calculate cell size in pixels
    var nPixelsX = xLengthOutput / amplitudes[0].length;
    // Get the context imagedata
    var imageData = visData.paintMatrixContext.getImageData(visData.dispCoords[0], visData.dispCoords[1], visData.dispCoords[2] - visData.dispCoords[0], visData.dispCoords[3] - visData.dispCoords[1]);


    var nPixels = imageData.width * imageData.height;
    var xScale = imageData.width / xLength;
    visData.xScale = xScale;
    visData.cellSize = xScale;
    var yScale = imageData.height / yLength;

    var l = 0;

    // Clear the layer containing the arrows
    visData.contextArrows.clearRect(0, 0, visData.displaySize[0], visData.displaySize[1]);

    if (visData.paintArrows) {
        var ystart = Math.round(visData.m0[1]);
        var ystop = Math.round(visData.m1[1]);
        var xstart = Math.round(visData.m0[0]);
        var xstop = Math.round(visData.m1[0]);
        //Calculate how many arrows should be shown (on the x dimension)
        var arrowSize = 0.1;
        var nArrows = 5;
        var parentSize = [visData.dispCoords[2] - visData.dispCoords[0], visData.dispCoords[3] - visData.dispCoords[1]]; //   [$('#Map').width(),$('#Map').height()];
        var arrowSize = parentSize[0] / nArrows; // [pixels]
        var cellSize = visData.cellSize;
        // Calculate how many cells are shown horizontally
        var nCellsH = (visData.dispCoords[2] - visData.dispCoords[0]) / visData.cellSize;
        var paintArea = parentSize[0] * parentSize[1];
        nArrows = (parentSize[0] / visData.cellSize) / 10;
        if (visData.zoomFactor < 1.5) {
            arrowSize = visData.cellSize * 150;
            nArrows = Math.ceil(parentSize[0] / arrowSize);
            arrowSize = arrowSize * 0.5;
        } else if (visData.zoomFactor < 3) {
            arrowSize = visData.cellSize * 50;
            nArrows = Math.ceil(parentSize[0] / arrowSize);
            arrowSize = arrowSize * 0.7;
        } else if (visData.zoomFactor < 4) {
            arrowSize = visData.cellSize * 50;
            nArrows = Math.ceil(parentSize[0] / arrowSize);
            arrowSize = arrowSize * 1;
        } else if (visData.zoomFactor < 5) {
            arrowSize = visData.cellSize * 30;
            nArrows = Math.ceil(parentSize[0] / arrowSize);
            arrowSize = arrowSize * 1;
        } else if (visData.zoomFactor < 6) {
            arrowSize = visData.cellSize * 20;
            nArrows = Math.ceil(parentSize[0] / arrowSize);
            arrowSize = arrowSize * 1;
        } else if (visData.zoomFactor < 7) {
            arrowSize = visData.cellSize * 15;
            nArrows = Math.ceil(parentSize[0] / arrowSize);
            arrowSize = arrowSize * 1;
        } else if (visData.zoomFactor < 10) {
            arrowSize = visData.cellSize * 13;
            nArrows = Math.ceil(parentSize[0] / arrowSize);
            arrowSize = arrowSize;
        } else if (visData.zoomFactor < 13) {
            arrowSize = visData.cellSize * 9;
            nArrows = Math.ceil(parentSize[0] / arrowSize);
            arrowSize = arrowSize;
        } else if (visData.zoomFactor < 15) {
            arrowSize = visData.cellSize * 7;
            nArrows = Math.ceil(parentSize[0] / arrowSize);
            arrowSize = arrowSize;
        } else if (visData.zoomFactor < 17) {
            arrowSize = visData.cellSize * 6;
            nArrows = Math.ceil(parentSize[0] / arrowSize);
            arrowSize = arrowSize;
        } else if (visData.zoomFactor < 20) {
            arrowSize = visData.cellSize * 5;
            nArrows = Math.ceil(parentSize[0] / arrowSize);
            arrowSize = arrowSize;
        } else if (visData.zoomFactor < 22) {
            arrowSize = visData.cellSize * 4;
            nArrows = Math.ceil(parentSize[0] / arrowSize);
            arrowSize = arrowSize;
        } else if (visData.zoomFactor < 24) {
            arrowSize = visData.cellSize * 3;
            nArrows = Math.ceil(parentSize[0] / arrowSize);
            arrowSize = arrowSize;
        } else if (visData.zoomFactor < 26) {
            arrowSize = visData.cellSize * 2.5;
            nArrows = Math.ceil(parentSize[0] / arrowSize);
            arrowSize = arrowSize;
        } else {
            arrowSize = visData.cellSize * 2;
            nArrows = Math.ceil(parentSize[0] / arrowSize);
            arrowSize = arrowSize;
        }
        //nArrows = 10;
        //arrowSize = parentSize[0] / nArrows;
        // Calculate how many areas should be calculated base to the avgSize
        var xlength = nArrows; //Number of areas in the x-dimension should be the same as the number of arrows
        var ylength = Math.ceil((xlength) * (parentSize[1] / parentSize[0])); //Just multiply  xlength with the ratio to get the y-dimension

        // Define the size of the area in the matrix which should be used to calculate average current	
        var avgSizex = Math.round((xstop - xstart) / xlength); //Take the width of the area in the matrix
        var avgSizey = Math.round((ystop - ystart) / ylength); //Take the width of the area in the matrix
        var xPosn = 0;
        var yPosn = 0;
        var expval = 2;
        // Start from xstart,ystart and count up 'avgSize' for each loop
        for (var xMain = xstart; xMain < xstop; xMain += avgSizex) {
            for (var yMain = ystart; yMain < ystop; yMain += avgSizey) {
                var ampAvg = matrixAverage(amplitudes, [xMain, yMain], [xMain + avgSizex, yMain + avgSizey]);
                var angleAvg = matrixAverage(angles, [xMain, yMain], [xMain + avgSizex, yMain + avgSizey]);
                // For each sub area, loop through all the cells in that sub-area and calculate average angle/amplitude
                var amplitudesSum = 0;
                var anglesSum = 0;
                var angleSet = false;
                var counts = 0; // Only count up if the cells are sea-cells (land cells are ignored when averaging)
                for (var xSub = 0; xSub < avgSizex; xSub++) {
                    for (var ySub = 0; ySub < avgSizey; ySub++) {
                        xPosn = xMain + xSub;
                        yPosn = yMain + ySub;
                        if (xPosn < map[0].length && yPosn < map.length) {
                            // Add to sum if current cell is a sea-cell (not a land-cell)
                            if (map[yPosn][xPosn] != -1) {
                                amplitudesSum = amplitudesSum + amplitudes[yPosn][xPosn];
                                if (angleSet == false) {
                                    angleSet = true;
                                    anglesSum = angles[yPosn][xPosn];
                                }
                                counts++;
                            }
                        }
                    }
                }
                var averageTest = amplitudesSum / counts;
                var angleTest = anglesSum / counts;
                // If there was at least on sea-cell paint an arrow
                if (counts > 0) {
                    var paintArrow = true;
                    if (visData.zoomFactor < 3) {
                        expval = 1;
                    } else {
                        expval = 2;
                    }

                    if (visData.zoomFactor > 2) {
                        amplitudesSum = amplitudesSum / counts;
                        if (amplitudesSum < visData.minDisplayAmp) {
                            paintArrow = false;
                        }

                        if (amplitudesSum > visData.maxAmplitude) {
                            amplitudesSum = visData.maxAmplitude;
                        }
                        amplitudesSum = (amplitudesSum / visData.areaMax);
                        if (amplitudesSum > 1) {
                            var dummy = 0;
                            dummy = dummy + 1;
                        }
                        amplitudesSum = amplitudesSum * expval;
                        var diff = (amplitudesSum);
                        var exp = Math.exp(diff) / Math.exp(expval);
                        amplitudesSum = amplitudesSum * exp;
                        amplitudesSum = exp * arrowSize;
                    } else {
                        amplitudesSum = arrowSize;
                    }


                    if (amplitudesSum > -1 && paintArrow) {
                        var c = matrix2Disp(xPosn - (avgSizex / 2), yPosn - (avgSizey / 2), visData);
                        drawVector(c[0], c[1], amplitudesSum, anglesSum, visData.contextArrows);
                    }
                }
            }
        }
    }
    return;
}

function matrixAverage(m, start, stop) {
    // console.log(arguments.callee.name);
    var sum = 0;
    var counts = 0; // Only count up if the cells are sea-cells (land cells are ignored when averaging)
    for (var x = start[0]; x < stop[0]; x++) {
        for (var y = start[1]; y < stop[1]; y++) {
            if (x < m[0].length && y < m.length) {
                // Add to sum if current cell is a sea-cell (not a land-cell)
                if (map[y][x] != -1) {
                    if (!m[y][x]) {
                        var dummy = 0;
                    }
                    sum = sum + m[y][x];
                    counts++;
                }
            }
        }
    }
    var average = sum / counts;
    return [average, counts];

}

var pan = new Object();
var pinch = new Object();
var tap = new Object();
var mc = new Object();
var pinchActive = false;
panStartPreviewPosition = new Object();
var panStartFired = false; // Used to monitor panstart event. Sometimes pan and panend events fire before panstart, this causes unexpected behaviour		

function touchInit(visData) {
    // console.log(arguments.callee.name);

    visData.touchElement = document.getElementById('TouchLayer');

    mc = new Hammer.Manager(visData.touchElement);
    // create pan recognizers
    pan = new Hammer.Pan();
    pan.options.threshold = 25;
    pan.options.pointers = 0;
    // create pinch recognizers
    pinch = new Hammer.Pinch();
    // add to the Manager
    var tap = new Hammer.Tap();
    mc.add([pan, pinch, tap]);
    mc.on("tap", function(ev) {
        calcCoords(ev.pointers[0].clientX, ev.pointers[0].clientY, visData);
        GPSDisplayUpdate(visData.lat, visData.lon);
    });

    mc.on("pinchstart", function(ev) {
        pan.options.enable = false;
    });

    mc.on("pinch", function(ev) {
        ev.scale = ev.scale.toFixed(3);
        ev.scale = Number(ev.scale);
        ev.scale = ev.scale - 1;
        if (ev.scale < 0) {
            ev.scale = ev.scale * 5;
            ev.scale = Math.pow(ev.scale, 2) * -1;
        } else {
            ev.scale = Math.pow(ev.scale, 2);

        }
        $('#sliderStatus').text(ev.scale);
        zoomPreview(ev.scale + visData.zoomFactor, oxPre, oyPre, visData);
    });

    mc.on("pinchend", function(ev) {
        zoomEnd(ev.scale + visData.zoomFactor, visData);
        simulateArea(vizObj.m0[0], vizObj.m1[0], vizObj.m0[1], vizObj.m1[1], 3, vizObj.selectedTime);
        paintArrows(vizObj);
        updateGPSValues();
        GPSDisplayUpdate(vizObj.lat, vizObj.lon);
        pan.options.enable = true;
    });

    mc.on("pan panstart panend", function(ev) {
        pinch.options.enable = false;
        if (ev.type == 'panend') {
            if (!panStartFired) {
                return;
            }
            panEnd(-pan.pX, -pan.pY, visData);
            simulateArea(vizObj.m0[0], vizObj.m1[0], vizObj.m0[1], vizObj.m1[1], 3, vizObj.selectedTime);
            paintArrows(vizObj);
            visData.previewSize = [$('#LandMap').width(), $('#LandMap').height()];
            visData.previewPosition = [$('#LandMap').position().left, $('#LandMap').position().top];
            updateGPSValues();
            GPSDisplayUpdate(vizObj.lat, vizObj.lon);

            pinch.options.enable = true;
            panStartFired = false;
        } else if (ev.type == 'panstart') {
            panStartFired = true;
            visData.previewSize = [$('#LandMap').width(), $('#LandMap').height()];
            visData.previewPosition = [$('#LandMap').position().left, $('#LandMap').position().top];
            panStartPreviewPosition = visData.previewPosition;
            visData.contextArrows.clearRect(0, 0, visData.displaySize[0], visData.displaySize[1]);
            visData.contextOcean.clearRect(0, 0, visData.displaySize[0], visData.displaySize[1]);
            landPosn = $('#LandMap').position();
        } else if (ev.type == 'pan') {
            if (!panStartFired) {
                return;
            }
            panPreview(-pan.pX, -pan.pY, visData);
            visData.previewSize = [$('#LandMap').width(), $('#LandMap').height()];
            visData.previewPosition = [$('#LandMap').position().left, $('#LandMap').position().top];
        }
    });

}