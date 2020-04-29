const fetch = require('node-fetch');
const chalk = require('chalk');
const btoa = require('btoa');


const PORT = 7777;

class FIBO {
    constructor() {
        this.loggedin = false;
        this.token = null;
        this.projects = [];
        this.lsDone = false;
        this.API_URL = 'http://localhost:'+PORT;
    }

    async login(username, password) {

        const request = {
            username: username,
            password: password,
        }

        let response;

        try {
            response = await this.send(request, '/login/superuser', null);
            if (response.status === 200) {
                this.token = response.token;
                this.loggedin = true;
            }
        } catch (err) {
            throw new Error('something went wrong, try again in a few seconds');
        }

        return response;
    }

    async logout(username, password) {

        let response;

        try {
            response = await this.send(null, '/logout/superuser', this.token);
            if (response.status === 200) {
                this.token = null;
                this.loggedin = false;
            }
        } catch (err) {
            throw new Error('something went wrong, try again in a few seconds');
        }

        return response;
    }


    //CREATE PROJECT
    async createProject(request) {
        let response;

        try {
            response = await this.send(request, '/config/createproject', this.token);
        } catch (err) {
            throw new Error('something went wrong, try again in a few seconds');
        }

        if (response.status === 200) {
            if (!this.projects.includes(request.projectName)) {
                this.projects.push(request.projectName);
            }
        }

        return response;
    }

    async ls() {
        let response;
        if (!this.lsDone) {
            try {
                response = await this.send({}, '/config/ls', this.token);
            } catch (err) {
                throw new Error('something went wrong, try again in a few seconds');
            }
        } else {
            response = this.projects;
        }

        return response;
    }

    async send(request, endpoint, token) {

        const api_url = this.API_URL + endpoint;

        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token
            },
            body: JSON.stringify(request),
        };
        const response = await fetch(api_url, options);
        const json = await response.json();

        return json;
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

const fibo = new FIBO();

exports.fibo = fibo;
exports.getToken = getToken;