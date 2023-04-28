'use strict';

// defines the allowed dimensions, default dimensions and how much variance from allowed
// dimension is allowed.

const variables = {
        allowedDimension : [ {w:100}, {w:200}, {w:300}, {w:400}, {w:500}, {w:600}, {w:700}, {w:800}, {w:900}, {w:1000}, {w:1250}, {w:1500}, {w:1920}],
        defaultDimension : {w:600},
        variance: 20,
        webpExtension: 'webp'
  };

exports.handler = (event, context, callback) => {
    const request = event.Records[0].cf.request;
    console.log(JSON.stringify({ beforeRequest: request }))
    const headers = request.headers;

    // parse the querystrings key-value pairs. In our case it would be d=100x100
    const queryString = request.querystring
    console.log('query string',queryString)
    const params = new URLSearchParams(queryString);
    console.log("w",params.get('w'));
    // fetch the uri of original image
    let fwdUri = request.uri;

    // if there is no dimension attribute, just pass the request
    if(!params.get("w")){
        console.log("Dimensions not found")
        callback(null, request);
        return;
    }
    // read the dimension parameter value = width x height and split it by 'x'
    const dimensionMatch = params.get("w"); // e.g 200
    console.log("dimensionMatch=",JSON.stringify({dimensionMatch}));
    
    let width = dimensionMatch; //200
    console.log('fwduri=',fwdUri);
    
    
    // define variable to be set to true if requested dimension is allowed.
    let matchFound = false;

    // calculate the acceptable variance. If image dimension is 105 and is within acceptable
    // range, then in our case, the dimension would be corrected to 100.
    let variancePercent = (variables.variance/100);

    for (let dimension of variables.allowedDimension) {
        let minWidth = dimension.w - (dimension.w * variancePercent);
        let maxWidth = dimension.w + (dimension.w * variancePercent);
        if(width >= minWidth && width <= maxWidth){
            width = dimension.w;
            // height = dimension.h;
            matchFound = true;
            console.log("Match F")
            break;
        }
    }
    // if no match is found from allowed dimension with variance then set to default
    //dimensions.
    if(!matchFound){
        width = variables.defaultDimension.w;
    }
   
    request.uri = fwdUri + `/${width}`
    request.querystring = queryString;
    console.log(JSON.stringify({ afterRequest: request }))
    callback(null, request);
};
