// Definitions used in geo.js
var rad = 180 / Math.PI; // Define one radian
var crop = 140; // How many cells have been cropped from the original matrix
var ewpivot = (-7.000) / rad; // Pivot point of the matrix
var onedgr = 1852 * 60; // One angular degree
var orgHeight = 1501; // Height of original matrix

//Convert geographical latitude and longitude to matrix index (x,y)
function geo2grid(lat, lon) {
    var rlon = lon / rad - ewpivot;
    var rlat = lat / rad;
    var alat = Math.asin(Math.sin(rlon) * Math.cos(rlat));
    var ydisp = Math.asin(Math.sin(rlat) / Math.cos(alat));
    var southb = 61.2 / rad;
    var gridn = 100 / onedgr;
    var y = 1501 - (1 + (ydisp - southb) * rad / gridn) - crop;
    var dist = Math.log(Math.tan((2 * alat + Math.PI) / 4)) * rad / gridn;
    var x = (0.5 * 821 + dist);
    var returnVal = [x, y];
    return returnVal;
}

//Convert matrix index (x,y) og geographical coordinates latitude and longitude
function grid2geo(x, y, width) {
    var gridn = 100 / onedgr / rad;
    var southb = 61.2 / rad;
    var xpivn = 0.5 * width;
    y = 1501 - y - crop;
    var latn = alat(x - xpivn, gridn);
    var ydist = (y - 1) * gridn;
    ydist = ydist + southb;
    var rlat = Math.asin(Math.sin(ydist) * Math.cos(latn));
    var rlon = ewpivot + Math.asin(Math.sin(latn) / Math.cos(rlat));
    var lat = rlat * rad;
    var lon = rlon * rad;
    return [lat, lon];

}

function alat(dist, grid) {
    return 2 * Math.atan(Math.exp(dist * grid)) - (Math.PI / 2);
}

var currentArrow = new Image();
currentArrow.src = 'img/currentArrow.svg';

/*
	Draws a vector from xstart,ystart with the specified length and angle on to the specified context
*/
function drawVector(xstart, ystart, length, angle, context) {
    var angleRad = angle; // *(Math.PI/180);
    context.save();
    context.translate(xstart, ystart);
    context.rotate(-angle);
    context.translate(-length / 2, -length / 2);
    context.drawImage(currentArrow, 0, 0, length, length);
    context.restore();
}