const express = require('express');
const router = express.Router();

const { validationResult, body } = require('express-validator');

const { Database } = require('../../database/db');
const calculator = require(`../stub_modules/calculator`);

//obtaining instance database
const database = new Database();

router.post('/createproject', [
    body('projectName')
        .isString().withMessage('Project Name is not valid').bail()
        .customSanitizer(projectName => projectName.replace(/\s+/g, ''))
        .isLength({ min: 1 }).withMessage('Project Name is not valid')
        .customSanitizer(projectName => projectName.replace(/\w+/g, (match) => match.toLowerCase())),
    body('users')
        .isArray().withMessage('users is not an array').bail()
        .custom((users, { req }) => {
            const roles = req.body.roles;
            if (Array.isArray(roles)) {
                for (let user of users) {
                    if (!user.name || !user.pass || !user.role) {
                        throw new Error('a user has no name, no pass or role');
                    }
                    user.name = user.name.replace(/\s+/g, '');
                    if (user.name.length === 0) {
                        throw new Error('a user name is empty');
                    }
                    user.pass = user.pass.replace(/\s+/g, '');
                    if (user.pass.length < 1) {
                        throw new Error('user ' + user.name + ' pass is empty');
                    }
                    if (!roles.includes(user.role)) {
                        throw new Error('role called ' + user.role + ' assigned to ' + user.role + ' does not exist');
                    }
                }
            }
            return true;
        }),
    body('roles')
        .isArray({ min: 1 }).withMessage('roles is not an array or is an empty array').bail()
        .custom(roles => {
            for (let role of roles) {
                role = role.replace(/\s+/g, '');
                if (role.length === 0) {
                    throw new Error('roles array contains not valid roles')
                }
            }
            return true;
        }),
    body('devices')
        .isArray({ min: 1 }).withMessage('devices is not an array or is an empty array').bail()
        .custom(devices => {
            for (let dev of devices) {
                dev = dev.replace(/\s+/g, '');
                if (dev.length === 0) {
                    throw new Error('roles array contains not valid roles')
                }
            }
            return true;
        }),
    body('keywords')
        .isArray({ min: 1 }).withMessage('keywords is not an array or is an empty array').bail()
        .custom(keywords => {
            for (let key of keywords) {
                key = key.replace(/\s+/g, '');
                if (key.length === 0) {
                    throw new Error('roles array contains not valid roles')
                }
            }
            return true;
        }),
    body('data')
        .isArray({ min: 1 }).withMessage('data is not an array or is an empty array').bail()
        .custom(data => {
            for (let item of data) {
                if (!Array.isArray(item.device)) {
                    throw new Error('a device property in data is not an array')
                }
                if (!Array.isArray(item.keyword)) {
                    throw new Error('a keyword property in data is not an array')
                }
                if (!Array.isArray(item.alarm)) {
                    throw new Error('a alarm property in data is not an array')
                }
                if (!Array.isArray(item.admittedroles)) {
                    throw new Error('a admittedroles property in data is not an array')
                }
                if (!item.aggregationFunctionName) {
                    throw new Error('aggregation function name not sent')
                }
                if (!calculator.legalFunctions.includes(item.aggregationFunctionName)) {
                    throw new Error('aggregation function ' + item.aggregationFunctionName + ' not supported yet');
                }
                if (!item.aggregationFunctionCode) {
                    throw new Error('aggregation function Code not sent')
                }
                if (!calculator.legalCodes(item.aggregationFunctionCode)) {
                    throw new Error('aggregation function code ' + item.aggregationFunctionCode + ' not valid');
                }
            }
            return true;
        }),
    body('overwrite')
        .isBoolean().withMessage('overwrite sent is not a boolean').bail(),
    body('token')
        .isString().withMessage('token not sent').bail()
        .isLength({ min: 1 }).withMessage('token not valid'),
    body('workspaceuid')
        .isString().withMessage('workspaceuid not sent').bail()
        .isLength({ min: 1 }).withMessage('workspaceuid not valid'),
], async (request, response) => {

    //handle validation error
    const errors = validationResult(request);
    if (!errors.isEmpty()) {
        const errArray = errors.array();
        let errResponse = [];
        for (err of errArray) {
            errResponse.push(err.msg);
        }
        return response.status(400).json({ status: 400, errors: errResponse });
    }

    const {
        projectName,
        devices,
        keywords,
        roles,
        data,
        users,
        overwrite,
        token,
        workspaceuid
    } = request.body;

    const username = request.decoded.username;

    try {

        //search if a project with the same name already exists

        const preProject = await database.searchProject(projectName);

        if (preProject[0]) {
            //a project with the same name created by someone already exists
            if (preProject[0].superuser !== username) {
                return response.status(450).json({ status: 450, errors: [`Someone has already created a project called ${projectName}`] });
            } else {
                if (overwrite) {
                    await database.deleteProject(projectName, username);
                } else {
                    return response.status(451).json({ status: 451, errors: [`you have already created a project called ${projectName}`] });
                }
            }
        }

        //insert the project
        await database.insertProject(projectName, token, workspaceuid, username);
        //insert roles
        const roleId = await database.insertRole(projectName, roles);
        //insert devices
        const deviceId = await database.insertDevice(devices, projectName);
        //insert keywords
        const keywordId = await database.insertTag(keywords, projectName);
        //insert users
        await database.insertUsers(users, projectName, roleId);
        //insert data
        await database.insertMultipleData(data, deviceId, keywordId, roleId, projectName);

        response.status(200).json({ status: 200 });
    } catch (err) {
        console.error(err);
        response.status(400).json({ status: 400, errors: ['Something went wrong'] });
    }
});

router.post('/ls', async (request, response) => {
    try {
        const username = request.decoded.username;
        const projects = await database.searchSuperuserProject(username);
        response.status(200).json({ status: 200, projects});
    } catch (err) {
        console.error(err);
        response.status(400).json({ status: 400, errors: ['Something went wrong'] });
    }
})

exports.configurator = router;