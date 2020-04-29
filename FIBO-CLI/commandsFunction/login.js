
const btoa = require('btoa');

//
// to color the text
//

const chalk = require('chalk');

//
// to create interactive CLI
//

const inquirer = require('inquirer');
const prompt = inquirer.prompt;
inquirer.registerPrompt('autocomplete', require('inquirer-autocomplete-prompt'));

//
// api for comunicate with FIBO
//

const { fibo } = require('../fiboApi');

const loginQuestion =
    [
        {
            type: 'input',
            name: 'username',
            message: 'Insert your username',
            validate: function (input) {
                if (typeof input !== 'string') {
                    return ('username is not correct');
                }
                if (input.length < 1) {
                    return ('username is not correct');
                }
                return true;
            }
        },
        {
            type: 'password',
            name: 'password',
            message: 'Insert your password',
            validate: function (input) {
                if (typeof input !== 'string') {
                    return ('password is not correct');
                }
                if (input.length < 1) {
                    return ('password is not correct');
                }
                return true;
            }
        }
    ];

/**
 * ask to the user the credentials to log in as super user in FIBO
 * @returns {boolean} - true if login is succesfull, otherwise false 
 */

async function login() {
    try {
        let { username, password } = await prompt(loginQuestion);
        username = username.trim();
        const response = await fibo.login(username, password);
        if (response.status !== 200) {
            console.log(chalk.rgb(255, 153, 51)('username or password not valid'));
            return false;
        }
        console.log(chalk.green('Authentication successful!'));
        return true;
    } catch (err) {
        console.error(chalk.red('error: ') + err.message);
        return false;
    }
}

exports.login = login;