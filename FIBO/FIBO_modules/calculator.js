const legalFunctions = [
    'sum',
    'mean',
    'max',
    'min'
]

/** 
    * @param {number} code - code that tells the calculator how to perform the function
*/
function legalCodes(code){
    if (code < 0 || code > 5){
        return false;
    }
    return true;
}   

exports.legalFunctions = legalFunctions;
exports.legalCodes = legalCodes;