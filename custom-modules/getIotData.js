const fetch = require('node-fetch');
const moment = require('moment');
const btoa = require('btoa');
const { Safe } = require('./safe');

//database
const { Database } = require('../database/db');
const database = new Database();

//create encryption object for encrypt tokens
const ENCRYPT_PASS = process.env.ENCRYPT_KEY;
const ENCRYPT_KEY_USERNAME = process.env.ENCRYPT_KEY_USERNAME;

class IoTData {

    constructor() {
        this.tokens = {};
        this.API_URL = 'https://api.zdm.zerynth.com/v1/tsmanager/workspace';
        this.safe = new Safe(ENCRYPT_PASS);
        this.safe_email = new Safe(ENCRYPT_KEY_USERNAME);
    }

    //true if project token is present and it is not expired, false otherwise
    isToken(projectName) {
        if (this.tokens[projectName]) {
            if (this.tokens[projectName].expires > moment.utc().unix()) {
                return false;
            } else {
                return true;
            }
        } else {
            return false;
        }
    }

    //insert token in tokens structure and in FIBO db
    async updateToken(projectName, token, expires, workspaceuid) {
        //insert in tokens
        this.tokens[projectName] = {
            token: token,
            expires: expires,
            workspaceuid: workspaceuid
        }
        await database.updateProjectToken(projectName, token, expires);
    }

    //returns token and expirestime if projectName exists, empty array otherwis
    async getProject(projectName) {
        const response = await database.searchProject(projectName);
        return response;
    }

    //insert project into tokens
    insertProject(projectname, token, expires, workspaceuid) {
        //insert in tokens
        this.tokens[projectName] = {
            token: token,
            expires: expires,
            workspaceuid: workspaceuid
        }
    }

    //delete project from tokens
    deleteProject(projectname) {
        if (this.tokens[projectname]) {
            delete this.tokens[projectname];
            return true;
        } else {
            return false;
        }
    }

    async getData(projectName, tags, fleets, start, end, retries) {
        if (retries === 0) {
            return [];
        }
        //obtain token
        if (!this.isToken(projectName)) {
            const project = await this.getProject(projectName);
            //project does not exist anymore
            if (!project[0]) {
                return [];
            } else {
                try {
                    const cryptedCredentials = [this.safe_email.decryptAsync(project[0].zdmemail), this.safe.decryptAsync(project[0].zdmpassword)];
                    const credentials = await Promise.all(cryptedCredentials)
                        .then(response => {
                            return { email: response[0], pass: response[1] }
                        })
                    const token = await getToken(credentials.email, credentials.pass);
                    await this.updateToken(projectName, token.data.token, token.data.expires, project[0].workspaceuid);
                } catch (err) {
                    console.error(err);
                    return [];
                }
            }
        }


        try {
            const result = await this.getDataExecuter(projectName,
                this.tokens[projectName].token,
                this.tokens[projectName].workspaceuid,
                tags, fleets, start, end, retries);
            return result;
        } catch (err) {
            console.error(err);
            return [];
        }

    }

    async getDataExecuter(projectName, token, workspaceuid, tags, fleets, start, end, retries) {

        const options = {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            redirect: 'follow'
        };

        //create tag query
        let queryTag = '';
        for (let tag of tags) {
            tag = tag.replace(/\s+/g, '%20');
            queryTag += `&tag=${tag}`
        }

        //create fleet query
        let queryFleet = '';
        for (let fleet of fleets) {
            fleet = fleet.replace(/\s+/g, '%20');
            queryFleet += `&fleet=${fleet}`
        }

        //startQuery
        let queryStart = '';
        if (start) {
            queryStart = `&start=${moment.unix(start).toISOString()}`
        }

        //endQuery
        let queryEnd = '';
        if (end) {
            queryEnd = `&end=${moment.unix(end).toISOString()}`
        }
        const query = `${this.API_URL}/${workspaceuid}?sort=-timestamp_device&size=-1${queryTag}${queryFleet}${queryStart}${queryEnd}`;
        
        let response;
        try {
            response = await fetch(query, options);
            const json = await response.json();
            return json;
        } catch (err) {
            console.error(err);
            return this.getData(projectName, tags, fleets, start, end, retries - 1);
        }

    }
}

async function getToken(email, password) {


    var requestOptions = {
        method: 'GET',
        headers: {
            "Authorization": "Basic " + btoa(email + ":" + password)
        },
        redirect: 'follow'
    };

    const response = await fetch("https://backend.zerynth.com//v1/user", requestOptions)
    const json = await response.json();

    return json;
}

exports.IoTData = IoTData;