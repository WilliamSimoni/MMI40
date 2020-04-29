
const { Command } = require('./commands');
const { prompt, registerPrompt } = require('inquirer');
const figlet = require('figlet');

//const bottomBar = new ui.BottomBar();

registerPrompt(
    'command',
    require('inquirer-command-prompt')
)

const mainPrompt = [
    {
        type: 'command',
        name: 'command',
        message: 'FIBO> ',
        autoCompletion: ['ls', 'login', 'logout', 'createProject', 'help', '--version', 'clear'],
        context: 0,
        short: false
    }
];

const commands = new Command();

console.log(figlet.textSync('FIBO cli', {
    font: 'cyberlarge',
    horizontalLayout: 'default',
    verticalLayout: 'default'
}));

async function CLI(mainPrompt, commands) {

    while (true) {
        try {
            const { command } = await prompt(mainPrompt);

            //exit from loop when user insert exit
            if (command === 'exit') {
                break;
            }

            const argv = command.split(' ');

            try {
                await commands.parseAsync(argv, { from: 'user' })
            } catch (err) { }

        } catch (err) {
            console.error(err);
        }
    }

}

CLI(mainPrompt, commands.program);

