async function query(pool, queryText, parameters){
    const client = await pool.connect();
    let result = {};
    try{
        result = await client.query(queryText, parameters)
    } finally {
        client.release()
    }
    return result;
}

exports.query = query;