const express = require('express');
const router = express.Router();

const jwt = require('jsonwebtoken');
const JWT_KEY = process.env.JWT_KEY;

const { Database } = require('../database/db');

//obtaining instance database
const database = new Database();

router.post('/', async (request, response) => {
    try {
        let token = request.headers['x-access-token'] || request.headers['authorization']; // Express headers are auto converted to lowercase
        if (token) {
            if (token.startsWith('Bearer ')) {
                // Remove Bearer from string
                token = token.slice(7, token.length);
            }
            jwt.verify(token, JWT_KEY, async (err, decoded) => {
                try {
                    if (err) {
                        return response.status(480).json({
                            status: 480,
                            errors: ['Token is not valid']
                        });
                    } else {
                        //put token in blackList
                        await database.putTokenInBlackList(token, decoded.projectname)
                        //send success
                        return response.status(200).json({
                            status: 200,
                            message: 'logout successful!',
                        });
                    }
                } catch (err) {
                    console.error(err);
                    response.status(400).json({ status: 400, errors: ['Something went wrong'] });
                }
            });
        } else {
            return response.status(480).json({
                status: 480,
                errors: ['Auth token is not supplied']
            });
        }
    } catch (err) {
        console.error(err);
        response.status(400).json({ status: 400, errors: ['Something went wrong'] });
    }
});

exports.logout = router;