'use strict';

// defines the allowed dimensions, default dimensions and how much variance from allowed
// dimension is allowed.

const variables = {
        allowedDimension : [ {w:50}, {w:100}, {w:200}, {w:300}, {w:400}, {w:500}, {w:600}, {w:700}, {w:800}, {w:900}, {w:1000}, {w:1250}, {w:1500}, {w:1920}],
        defaultDimension : {w:600},
        defaultQuality : 89,
        variance: 5,
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
    // fetch the uri of original image
    let fwdUri = request.uri;
    let quality = 89;
    // if there is no dimension attribute, just pass the request
    if(!params.get("w")){
        console.log("Dimensions not found")
        callback(null, request);
        return;
    }

    if(!params.get("q")){
        console.log("Quality not found")
    }else{
        if(params.get("q") > 0 && params.get("q") <= 100 ){
            quality = params.get("q");
        }
    }
    // read the dimension parameter value = width x height and split it by 'x'
    const dimensionMatch = params.get("w"); // e.g 200
    console.log("dimensionMatch=",JSON.stringify({dimensionMatch}));
    
    let width = dimensionMatch; //200
    
    
    
    // define variable to be set to true if requested dimension is allowed.
    let matchFound = false;

    // calculate the acceptable variance. If image dimension is 105 and is within acceptable
    // range, then in our case, the dimension would be corrected to 100.
    let variancePercent = (variables.variance/100);
    let nearestMax = 0;
    for (let dimension of variables.allowedDimension) {
        let minWidth = dimension.w - (dimension.w * variancePercent);
        let maxWidth = dimension.w + (dimension.w * variancePercent);
        if(!nearestMax && dimension.w > width){
            nearestMax = dimension.w;
        }
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
        if(!nearestMax){
            width = 1920;
        }
        width = nearestMax;
    }
    console.log("width = ",width);
    request.uri = fwdUri + `/${width}/${quality}`
    console.log('fwduri=',request.uri);
    request.querystring = queryString;
    //console.log(JSON.stringify({ afterRequest: request }))
    //callback(null, request);
};
