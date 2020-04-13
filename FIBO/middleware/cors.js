//middleware to handle CORS problems

function cors(request, response, next){
    response.header("Access-Control-Allow-Origin", '*');
    response.header(
        "Access-Control-Allow-Headers",
        "Content-Type, Authorization, x-access-token"
    );
    if (request.method === 'OPTIONS') {
        response.header('Access-Control-Allow-Methods', 'PUT, GET');
        return res.status(200).json({});
    }
    next();
}

exports.cors = cors;