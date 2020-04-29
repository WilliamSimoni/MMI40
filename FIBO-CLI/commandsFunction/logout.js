
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

const logoutQuestion =
    [
        {
            type: 'confirm',
            name: 'logout',
            message: 'are you sure you want to logout?'
        }
    ];

/**
 * logout from the superuser account
 * @returns {boolean} - true if logout is succesfull, otherwise false 
 */

async function logout() {
    try {
        const { logout } = await prompt(logoutQuestion);
        if (logout) {
            const response = await fibo.logout();
            if (response.status !== 200) {
                console.log(chalk.rgb(255, 153, 51)('something went wrong, try again in a few seconds'));
                return false;
            }
            console.log(chalk.green('logout successful!'));
            return true
        }
        return false;
    } catch (err) {
        console.error('error: ' + err.message);
        return false;
    }
}

exports.logout = logout;