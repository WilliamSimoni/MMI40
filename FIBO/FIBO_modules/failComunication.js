const errors = {
    BADREQUEST: 1,
    NOTSUPPORTEDFUNCTION: 2,
    GRANULARITYNOTSUPPORTED: 3,
}

/**
 * @param {number} error - number associated to error
 * @param {request} requestBody - body of the post request sent by Client
 * @param {response} response - response object created by express.js
 */

function fail(error, requestBody, response) {
    switch (error) {
        case errors.BADREQUEST:
            response.json({ status: 400, statusText: 'Bad Request', request: requestBody });
            break;
        case errors.NOTSUPPORTEDFUNCTION:
            response.json({ status: 401, statusText: 'Function not supported', request: requestBody });
            break;
        case errors.GRANULARITYNOTSUPPORTED:
            response.json({ status: 402, statusText: 'Granularity not supported', request: requestBody });
            break;
    }
}

exports.errors = errors;
exports.fail = fail;