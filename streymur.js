function zoomFactorAndOffset(canvas) {
    let map_width = 821;
    let map_height = 1221;
    let canvas_width = canvas.width;
    let canvas_height = canvas.height;
    let width_factor = canvas_width / map_width;
    let height_factor = canvas_height / map_height;
    let scale = Math.min(width_factor, height_factor);
    let width_remainder = canvas_width - (map_width * scale);
    let height_remainder = canvas_height - (map_height * scale);
    let translate_x = (width_remainder > 0) ? width_remainder / 2 : 0;
    let translate_y = (height_remainder > 0) ? height_remainder / 2 : 0;

    return {
        factor: Math.min(width_factor, height_factor),
        x: translate_x,
        y: translate_y
    }
}

function resize(canvas) {
    let ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    canvas.style.width = window.innerWidth;
    canvas.style.height = window.innerHeight;
}

function centerAndResize(canvas) {
    let ctx = canvas.getContext("2d");
    let _zoomFactor = zoomFactorAndOffset(canvas);
    ctx.translate(_zoomFactor.x, _zoomFactor.y);
    ctx.scale(_zoomFactor.factor, _zoomFactor.factor);
}


//    simulateArea(0, 821, 0, 1221, 3, new Date());

//console.log("fillrect!");
//    ctx.fillStyle = "#000000";
//    ctx.fillRect(0, 0, 150, 100);

window.onload = function() {
    let canvas = $("#mapCanvas").get(0);
    let ctx = canvas.getContext('2d');
    resize(canvas);

    centerAndResize(canvas);

    trackTransforms(ctx);

    function redraw() {
        ctx.clear();

        //console.log('redraw');
        ctx.fillStyle = "rgba(" + gradientRGB[0][0] + "," + gradientRGB[0][1] + "," + gradientRGB[0][2] + ",1.0)"
        ctx.fillRect(8, 8, 805, 1205);
        simulateArea(ctx, 0, 821, 0, 1221, 3, new Date());
        vizObj.paintMatrixContext = ctx;
        //paintMatrixImage(canvas, [0, 0, 821, 1221], [canvas.offsetLeft, canvas.offsetTop, 825, 1234], vizObj);
        paintMatrixImage(canvas, [0, 0, 821, 1221], [0, 0, 821, 1221], vizObj);
        drawMap(ctx);
    }

    $(window).resize(function() {
        resize(canvas);
        centerAndResize(canvas);
        redraw();
    });

    redraw();

    var lastX = canvas.width / 2,
        lastY = canvas.height / 2;

    var dragStart, dragged;

    canvas.addEventListener('mousedown', function(evt) {
        document.body.style.mozUserSelect = document.body.style.webkitUserSelect = document.body.style.userSelect = 'none';
        lastX = evt.offsetX || (evt.pageX - canvas.offsetLeft);
        lastY = evt.offsetY || (evt.pageY - canvas.offsetTop);
        dragStart = ctx.transformedPoint(lastX, lastY);
        dragged = false;
    }, false);

    canvas.addEventListener('mousemove', function(evt) {
        lastX = evt.offsetX || (evt.pageX - canvas.offsetLeft);
        lastY = evt.offsetY || (evt.pageY - canvas.offsetTop);
        dragged = true;
        if (dragStart) {
            var pt = ctx.transformedPoint(lastX, lastY);
            ctx.translate(pt.x - dragStart.x, pt.y - dragStart.y);
            redraw();
        }
    }, false);

    canvas.addEventListener('mouseup', function(evt) {
        dragStart = null;
        if (!dragged) zoom(evt.shiftKey ? -1 : 1);
    }, false);

    var scaleFactor = 1.1;

    var zoom = function(clicks) {
        var pt = ctx.transformedPoint(lastX, lastY);
        ctx.translate(pt.x, pt.y);
        var factor = Math.pow(scaleFactor, clicks);
        ctx.scale(factor, factor);
        ctx.translate(-pt.x, -pt.y);
        redraw();
    }

    var handleScroll = function(evt) {
        var delta = evt.wheelDelta ? evt.wheelDelta / 40 : evt.detail ? -evt.detail : 0;

        if (delta) zoom(delta);
        return evt.preventDefault() && false;
    };

    canvas.addEventListener('DOMMouseScroll', handleScroll, false);
    canvas.addEventListener('mousewheel', handleScroll, false);
};

function trackTransforms(ctx) {
    let svg = document.createElementNS("http://www.w3.org/2000/svg", 'svg');
    let xform = svg.createSVGMatrix();
    ctx.getTransform = function() { return xform; };


    ctx.clear = function() {
        let p1 = this.transformedPoint(0, 0);
        let p2 = this.transformedPoint(this.canvas.width, this.canvas.height);
        ctx.clearRect(p1.x, p1.y, p2.x - p1.x, p2.y - p1.y);
        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        ctx.restore();
    };

    let savedTransforms = [];
    let save = ctx.save;
    ctx.save = function() {
        savedTransforms.push(xform.translate(0, 0));
        return save.call(ctx);
    };

    let restore = ctx.restore;
    ctx.restore = function() {
        xform = savedTransforms.pop();
        return restore.call(ctx);
    };

    let scale = ctx.scale;
    ctx.scale = function(sx, sy) {
        xform = xform.scaleNonUniform(sx, sy);
        return scale.call(ctx, sx, sy);
    };

    let rotate = ctx.rotate;
    ctx.rotate = function(radians) {
        xform = xform.rotate(radians * 180 / Math.PI);
        return rotate.call(ctx, radians);
    };

    let translate = ctx.translate;
    ctx.translate = function(dx, dy) {
        xform = xform.translate(dx, dy);
        return translate.call(ctx, dx, dy);
    };

    let transform = ctx.transform;
    ctx.transform = function(a, b, c, d, e, f) {
        var m2 = svg.createSVGMatrix();
        m2.a = a;
        m2.b = b;
        m2.c = c;
        m2.d = d;
        m2.e = e;
        m2.f = f;
        xform = xform.multiply(m2);
        return transform.call(ctx, a, b, c, d, e, f);
    };

    let setTransform = ctx.setTransform;
    ctx.setTransform = function(a, b, c, d, e, f) {
        xform.a = a;
        xform.b = b;
        xform.c = c;
        xform.d = d;
        xform.e = e;
        xform.f = f;
        return setTransform.call(ctx, a, b, c, d, e, f);
    };

    let pt = svg.createSVGPoint();
    ctx.transformedPoint = function(x, y) {
        pt.x = x;
        pt.y = y;
        return pt.matrixTransform(xform.inverse());
    }
}

var periods = [12.42, 12.0, 12.66, 23.93, 25.82, 24.07, 6.21];

var periodsRad = [0.505892537, 0.523598776, 0.496302157, 0.262565203, 0.243345674, 0.261038027, 1.011785074];
var amplitudes = Create2DArray(1221, 821);

var angles = Create2DArray(1221, 821);
var colors = Create2DArray(1221, 821);
var minOffset = -0.5509;
var uMeanOffset = -0.8947;
var vMeanOffset = -0.8782;

var last_simulation_date = 0;

function simulateArea(ctx, xStart, xStop, yStart, yStop, nComponents, date) {
    var coeff = 1000 * 60 * 5;
    date = new Date(Math.round(date / coeff) * coeff)

    let simulation_date = date.getTime();

    if (simulation_date == last_simulation_date)
        return;

    last_simulation_date = simulation_date

    console.log("New simulation");

    //console.log(arguments.callee.name + "(" + xStart + "," + xStop + "," + yStart + "," + yStop + "," + nComponents + "," + date + ")");

    var t = HourFraction(date);

    var hourOffset = date.getTimezoneOffset(); // Get offset in minutes
    hourOffset = hourOffset / 60; //convert hour offsett to fractional hours and add offset to t
    t = t + hourOffset;

    var Year = date.getFullYear();
    var Day = dayOfYear(date);


    nComponents = 3;
    Day = Day - 14;
    t = t + 24 * 14;

    //Round all coordinates to nearest integer
    xStart = Math.round(xStart);
    xStop = Math.round(xStop);
    yStart = Math.round(yStart);
    yStop = Math.round(yStop);

    // Calculate the radian frequencies for the components
    var wts = [periodsRad[0] * t, periodsRad[1] * t, periodsRad[2] * t];

    // Initialize variables to hold temporary results for components.
    var alpha0 = 0;
    var beta0 = 0;
    var ic0 = 0;
    var is0 = 0;
    var argument0 = 0;

    var alpha1 = 0;
    var beta1 = 0;
    var ic1 = 0;
    var is1 = 0;
    var argument1 = 0;

    var alpha2 = 0;
    var beta2 = 0;
    var ic2 = 0;
    var is2 = 0;
    var argument2 = 0;

    var u = 0;
    var v = 0;
    var areaMax = 0;

    // Offset for minimum component and the mean (residual components). All values in js. files have offsett in order
    // to avoid negative numbers. This saves storage and memory space

    var astro = AstroArgAll(Day, Year, nComponents);

    console.log(String(Year) + String(Day) + String(t));

    var xx = 0;
    var yy = 0;
    //abo todo
    //var avgSize = 11;
    var avgSize = 17;
    var span = (avgSize - 1) / 2;
    var colorIndex = 0;
    for (var x = xStart + span; x < xStop - span; x += vizObj.avgSize) {
        for (var y = yStart + span; y < yStop - span; y += vizObj.avgSize) {

            if (map[y][x] != -1) {
                var index = map[y][x];

                //M2
                argument0 = wts[0] - M2Pha[index] / 100 + astro[0];
                alpha0 = (M2Maj[index] / 100) * Math.cos(argument0);
                beta0 = ((M2Min[index] / 1000) + minOffset) * Math.sin(argument0);
                ic0 = Math.cos(M2Inc[index] / 100);
                is0 = Math.sin(M2Inc[index] / 100);

                //S2
                argument1 = wts[1] - S2Pha[index] / 100 + astro[1];
                alpha1 = (S2Maj[index] / 100) * Math.cos(argument1);
                beta1 = ((S2Min[index] / 1000) + minOffset) * Math.sin(argument1);
                ic1 = Math.cos(S2Inc[index] / 100);
                is1 = Math.sin(S2Inc[index] / 100);

                //N2
                argument2 = wts[2] - N2Pha[index] / 100 + astro[2];
                alpha2 = (N2Maj[index] / 100) * Math.cos(argument2);
                beta2 = ((N2Min[index] / 1000) + minOffset) * Math.sin(argument2);
                ic2 = Math.cos(N2Inc[index] / 100);
                is2 = Math.sin(N2Inc[index] / 100);

                u = (alpha0 * ic0 - beta0 * is0) + (alpha1 * ic1 - beta1 * is1) + (alpha2 * ic2 - beta2 * is2) + (uMean[index] / 1000) + uMeanOffset;
                v = (alpha0 * is0 + beta0 * ic0) + (alpha1 * is1 + beta1 * ic1) + (alpha2 * is2 + beta2 * ic2) + (vMean[index] / 1000) + vMeanOffset;

                amplitudes[y][x] = Math.sqrt(Math.pow(u, 2) + Math.pow(v, 2));
                angles[y][x] = Math.atan2(v, u);
                colorIndex = amplitudes[y][x] / vizObj.maxAmplitude;
                if (colorIndex > 1) {
                    colorIndex = 1;
                }
                colorIndex = (gradientRGB.length - 1) * colorIndex;
                colorIndex = Math.round(colorIndex);
                colors[y][x] = colorIndex;
                if (vizObj.avgSize > 1) {
                    var amplitude = amplitudes[y][x];
                    var angle = angles[y][x];
                    for (var xx = x - span; xx < x + span + 1; xx++) {
                        for (var yy = y - span; yy < y + span + 1; yy++) {
                            if (map[yy][xx] != -1) {
                                amplitudes[yy][xx] = amplitude;
                                angles[yy][xx] = angle;
                                colors[yy][xx] = colorIndex;
                            }

                        }
                    }
                }
                if (amplitudes[y][x] > areaMax) {
                    areaMax = amplitudes[y][x];
                }
            }
        }
    }
}

function AstroArgAll(d, year, nComponents) {
    // console.log(arguments.callee.name);
    var output = new Array(nComponents);
    for (var i = 0; i < nComponents; i++) {
        output[i] = astroArg(d, year, i);
    }
    return output;
}

function astroArg(d0, year0, harmonic) {
    //console.log(arguments.callee.name);
    var reference = new Date(1975, 0, 1);
    var selected = new Date(year0, 1, d0);
    var d = 365 * (year0 - 1975) + Math.round(0.25 * (year0 - 1973)) + d0;
    var t = (27392.500528 + 1.0000000356 * d) / 36525;
    var t2 = t * t;
    var h0 = 279.69668 + 36000.768925 * t + 0.000303 * t2;
    var s0 = 270.434358 + 481267.88314137 * t - 0.001133 * t2 + 0.0000019 * t * t2
    var p0 = 334.329653 + 4069.0340329575 * t - 0.010325 * t2 - 0.000012 * t2 * t;
    var output = 0;

    if (harmonic == 0) {
        output = (2 * h0) - (2 * s0);
    } else if (harmonic == 1) {
        output = 0;
    } else if (harmonic == 2) {
        output = (2 * h0) - (3 * s0) + p0;
    } else if (harmonic == 3) {
        output = 4 * h0 - 4 * s0;
    } else if (harmonic == 4) {
        output = h0 + (Math.PI / 2);
    } else if (harmonic == 5) {
        output = h0 - 2 * s0 - (Math.PI / 2);
    } else if (harmonic == 6) {
        output = h0 - (Math.PI / 2);
    }
    output = output % 360;
    output = output * (6.283185307 / 360);
    return output;
}

function currentDate() {
    //console.log(arguments.callee.name);
    return new Date();
}

function timeChange(direction) {
    //console.log(arguments.callee.name);
    var newDateObj = new Date();

    if (direction == true) {
        newDateObj.setTime(vizObj.selectedTime.getTime() + (vizObj.timeIncrement * 60 * 1000));
    } else {
        newDateObj.setTime(vizObj.selectedTime.getTime() - (vizObj.timeIncrement * 60 * 1000));
    }
    vizObj.selectedTime = newDateObj;
    $("#HourSlider").attr("value", currentDate().getHours() * 60 + currentDate().getMinutes());
    $("#SelectedDateTime").text(dateToString(vizObj.selectedTime));
    $("#MapSelectedDate").text(dateToString(vizObj.selectedTime));
    $(".mapSelectedDate").text(dateToString(vizObj.selectedTime));
    GPSDisplayUpdate(vizObj.lat, vizObj.lon);
}

function Point(x, y, z) {
    //console.log(arguments.callee.name);
    this.x = x;
    this.y = y;
    this.z = z;
}

function HourFraction(date) {
    //console.log(arguments.callee.name);
    var hour = date.getHours();
    hour = hour + (date.getMinutes() / 60);
    return hour;
}

function simulateCell(x, y, t) {
    //console.log(arguments.callee.name);
    // Calculate the radian frequencies for the components
    var wts = [periodsRad[0] * t, periodsRad[1] * t, periodsRad[2] * t];

    // Initialize variables to hold temporary results for components.
    var alpha0 = 0;
    var beta0 = 0;
    var ic0 = 0;
    var is0 = 0;
    var argument0 = 0;

    var alpha1 = 0;
    var beta1 = 0;
    var ic1 = 0;
    var is1 = 0;
    var argument1 = 0;

    var alpha2 = 0;
    var beta2 = 0;
    var ic2 = 0;
    var is2 = 0;
    var argument2 = 0;

    var u = 0;
    var v = 0;

    if (map[y][x] != -1) {
        var index = map[y][x];
        //M2
        argument0 = wts[0] - (M2Pha[index]);
        alpha0 = (M2Maj[index]) * Math.cos(argument0);
        beta0 = ((M2Min[index])) * Math.sin(argument0);
        ic0 = Math.cos(M2Inc[index]);
        is0 = Math.sin(M2Inc[index]);

        //S2
        argument1 = wts[1] - (S2Pha[index]);
        alpha1 = (S2Maj[index]) * Math.cos(argument1);
        beta1 = ((S2Min[index])) * Math.sin(argument1);
        ic1 = Math.cos(S2Inc[index]);
        is1 = Math.sin(S2Inc[index]);

        //N2
        argument2 = wts[2] - (N2Pha[index]);
        alpha2 = (N2Maj[index]) * Math.cos(argument2);
        beta2 = ((N2Min[index])) * Math.sin(argument2);
        ic2 = Math.cos(N2Inc[index]);
        is2 = Math.sin(N2Inc[index]);

        u = (alpha0 * ic0 - beta0 * is0); // + (alpha1*ic1-beta1*is1) + (alpha2*ic2-beta2*is2) + (uMean[index]);
        v = (alpha0 * is0 + beta0 * ic0); // + (alpha1*is1+beta1*ic1) + (alpha2*is2+beta2*ic2) + (vMean[index]);

        vel = Math.sqrt(Math.pow(u, 2) + Math.pow(v, 2));
        return vel;
    }
}