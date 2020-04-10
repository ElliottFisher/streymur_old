var periods = [12.42, 12.0, 12.66, 23.93, 25.82, 24.07, 6.21];

var periodsRad = [0.505892537, 0.523598776, 0.496302157, 0.262565203, 0.243345674, 0.261038027, 1.011785074];
var amplitudes = Create2DArray(1221, 821);

var angles = Create2DArray(1221, 821);
var colors = Create2DArray(1221, 821);
var minOffset = -0.5509;
var uMeanOffset = -0.8947;
var vMeanOffset = -0.8782;

function simulateArea(xStart, xStop, yStart, yStop, nComponents, date) {

    console.log(date);
    console.log(arguments.callee.name + "(" + xStart + "," + xStop + "," + yStart + "," + yStop + "," + nComponents + "," + date + ")");

    var t = HourFraction(date);

    var hourOffset = date.getTimezoneOffset(); // Get offset in minutes
    hourOffset = hourOffset / 60; //convert hour offsett to fractional hours and add offset to t
    t = t + hourOffset;

    var Year = date.getFullYear();
    var Day = dayOfYear(date);

    nComponents = 3;
    Day = Day - 14;
    t = t + 24 * 14;

    console.log(String(Year) + String(Day) + String(t));

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
    var xx = 0;
    var yy = 0;
    //abo todo
    var avgSize = 11;
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

    //abo todo
    vizObj.areaMax = areaMax;

}

function AstroArgAll(d, year, nComponents) {
    console.log(arguments.callee.name);
    var output = new Array(nComponents);
    for (var i = 0; i < nComponents; i++) {
        output[i] = astroArg(d, year, i);
    }
    return output;
}

function astroArg(d0, year0, harmonic) {
    console.log(arguments.callee.name);
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
    console.log(arguments.callee.name);
    return new Date();
}

function timeChange(direction) {
    console.log(arguments.callee.name);
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
    console.log(arguments.callee.name);
    this.x = x;
    this.y = y;
    this.z = z;
}

function HourFraction(date) {
    console.log(arguments.callee.name);
    var hour = date.getHours();
    hour = hour + (date.getMinutes() / 60);
    return hour;
}

function simulateCell(x, y, t) {
    console.log(arguments.callee.name);
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