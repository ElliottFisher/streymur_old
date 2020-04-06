function updateGPSValues() {
    if (vizObj.Position.coords) {
        $('#GPS_Speed').html(Number((vizObj.Position.coords.speed) * 18 / 5).toFixed(1));
        $('#GPS_Latitude').html(Number(vizObj.Position.coords.latitude).toFixed(5));
        $('#GPS_Longitude').html(Number(vizObj.Position.coords.longitude).toFixed(5));

        if (((vizObj.Position.coords.speed) * 18 / 5) >= 2) {
            $('#GPS_Heading').html(Number(vizObj.Position.coords.heading).toFixed(0) + '° ' + CompassAngleName(vizObj.Position.coords.heading));
            var str = 'rotate(' + Number(vizObj.Position.coords.heading).toFixed(2) + 'deg)';
            $('#GPS_Heading_Img').css({ "-ms-transform": str, "-webkit-transform": str, "transform": str, });
            $('#GPS_Heading_Img').css({ "opacity": 1 });
        } else {
            $('#GPS_Heading').html('-');
            var str = 'rotate(' + 0 + 'deg)';
            $('#GPS_Heading_Img').css({ "-ms-transform": str, "-webkit-transform": str, "transform": str, });
            $('#GPS_Heading_Img').css({ "opacity": 0.25 });
        }

        $('#GPS_Altitude').html(Number(vizObj.Position.coords.altitude).toFixed(0));
        $('#GPS_Accuracy').html(Number(vizObj.Position.coords.accuracy).toFixed(0));

        GPSDisplayUpdate(vizObj.Position.coords.latitude, vizObj.Position.coords.longitude);
    }
}

function GPSDisplayUpdate(lat, long) {
    if (lat == 0 || long == 0) {
        return;
    }
    var mposn = geo2grid(lat, long);
    if (mposn[0] < 0 && mposn[1] < 0) {
        return;
    }

    var screenposn = geo2grid(lat, long);
    screenposn = matrix2Disp(screenposn[0], screenposn[1], vizObj);

    var infoWidth = Math.round($('#LocationInfo').width() / 2);

    let pos1 = Math.round(mposn[1]);
    if (pos1 < 0 || pos1 > angles.length)
        return;

    var angle = angles[Math.round(mposn[1])][Math.round(mposn[0])];

    angle = rad2deg(angle);
    angle = (450 - angle) % 360;
    angle = angle.toFixed(0);

    var amplitude = amplitudes[Math.round(mposn[1])][Math.round(mposn[0])];

    if (amplitude >= 0 && angle != 'NaN') {
        amplitude = amplitude.toFixed(1);
        $('#LocationInfoAmplitude').html(amplitude + 'm/s');
        $('#LocationInfoAngle').html(angle + '° ' + CompassAngleName(angle));
    } else {
        $('#LocationInfoAmplitude').html('');
        $('#LocationInfoAngle').html('');
    }

    var imageHeight = $('#LocationInfoIcon').height();
    var imageWidth = $('#LocationInfoIcon').width();
    $("#LocationInfo").css({ "top": (screenposn[1] - imageHeight) + "px", "left": screenposn[0] - infoWidth + "px" });

}

function CompassAngleName(angle) {
    if (angle >= 0 && angle <= 22.5) {
        return 'N';
    } else if (angle > 337.5) {
        return 'N';
    } else if (angle > 22.5 && angle <= 67.5) {
        return 'NE';
    } else if (angle > 67.5 && angle <= 112.5) {
        return 'E';
    } else if (angle > 112.5 && angle <= 157.5) {
        return 'SE';
    } else if (angle > 157.5 && angle <= 202.5) {
        return 'S';
    } else if (angle > 202.5 && angle <= 247.5) {
        return 'SW';
    } else if (angle > 247.5 && angle <= 292.5) {
        return 'W';
    } else if (angle > 292.5 && angle < 337.5) {
        return 'NW';
    }
}