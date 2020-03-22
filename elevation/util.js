
// General purpose circle building function
export const buildCircle = (x, y, radius, numPoints = 360) => {

  var step = 2 * Math.PI / numPoints;
  let coordinates = [];

  for ( var theta = 0;  theta < 2 * Math.PI; theta += step ) {
    var h = x + radius * Math.cos(theta);
    var k = y - radius * Math.sin(theta);
    coordinates.push([h, k]);
  }

  return coordinates;

}

// General purpose rounding function
const roundNumber = (num, scale) => {

  if(!("" + num).includes("e")) {

    // @ts-ignore
    return +(Math.round(num + "e+" + scale)  + "e-" + scale);

  } else {

    var arr = ("" + num).split("e");
    var sig = ""
    if(+arr[1] + scale > 0) {
      sig = "+";
    }

    // @ts-ignore
    return +(Math.round(+arr[0] + "e" + sig + (+arr[1] + scale)) + "e-" + scale);

  }

}

// Very naive implementation to round up coordinates
export const roundGeoJsonCoordinates = (geojson, nbDecimals) => {

  let { coordinates, type } = geojson;

  let outCoordinates;

  if (type === 'Point') {
    let [x, y] = coordinates;
    outCoordinates = [ roundNumber(x, nbDecimals), roundNumber(y, nbDecimals) ];
  } else if (type === 'Polygon') {
    outCoordinates = coordinates.map((ring, i) => {
      return ring.map(([x, y], i) => {
        return [ roundNumber(x, nbDecimals), roundNumber(y, nbDecimals) ];
      });
    });
  } else if (type === 'LineString') {
    outCoordinates = coordinates.map(([x, y], i) => {
      return [ roundNumber(x, nbDecimals), roundNumber(y, nbDecimals) ];
    });
  } else {
    return geojson;
  }

  return {...geojson, ...{ coordinates: outCoordinates }};

}
