const express = require('express');
const router = express.Router();
const { validationResult, body } = require('express-validator');

const { Database } = require('../database/db');

//for generating JWT
const jwt = require('jsonwebtoken');
const JWT_KEY = process.env.JWT_KEY;
const EXPRIRATION_TIME = process.env.EXPRIRATION_TIME;

if (!JWT_KEY) {
    throw new Error('JWT_KEY NON DEFINED');
}

//decrypt password
const bcrypt = require('bcrypt');
const BCRYPT_SALT = process.env.BCRYPT_SALT;

if (!JWT_KEY) {
    throw new Error('BCRYPT_SALT NON DEFINED');
}

//obtaining instance database
const database = new Database();

router.post('/', [
    body('username')
        .exists().withMessage('username or password or project not valid').bail()
        .isString().withMessage('username or password or project not valid'),
    body('password')
        .exists().withMessage('username or password or project not valid').bail()
        .isString().withMessage('username or password or project not valid'),
    body('projectName')
        .exists().withMessage('username or password or project not valid').bail()
        .isString().withMessage('username or password or project not valid'),
],
    async (request, response) => {
        try {
            //handle validation error
            const errors = validationResult(request);
            if (!errors.isEmpty()) {
                return response.status(411).json({ status: 411, errors: ['username or password or project not valid'] });
            }

            let username = request.body.username;
            let password = request.body.password;
            let projectName = request.body.projectName;

            //search user in database
            const usernameSearchResult = await database.searchUser(username, projectName);


            //username doesn't exist
            if (!usernameSearchResult.rows[0]) {
                return response.status(411).json({ status: 411, errors: ['username or password or project not valid'] });
            }

            //check password
            bcrypt.compare(password, usernameSearchResult.rows[0].password, function (err, res) {
                if (err) {
                    console.error(error);
                    return response.status(400).json({ status: 400, errors: ['Something went wrong'] });
                }
                if (res) {
                    //create token
                    const token = jwt.sign({ username: username, projectname: usernameSearchResult.rows[0].projectname, roleid: usernameSearchResult.rows[0].roleid },
                        JWT_KEY,
                        { expiresIn: EXPRIRATION_TIME }
                    );
                    //send success
                    return response.status(200).json({
                        status: 200,
                        message: 'Authentication successful!',
                        token: token
                    });
                } else {
                    return response.status(411).json({ status: 411, errors: ['username or password or project not valid'] });
                }
            });
        } catch (err) {
            console.error(err);
            response.status(400).json({ status: 400, errors: ['Something went wrong'] });
        }
    });


exports.login = router;