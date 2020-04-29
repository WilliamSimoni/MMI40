
//
// check user input
//

const validator = require('validator');

//
// to create interactive CLI
//

const inquirer = require('inquirer');
const prompt = inquirer.prompt;
inquirer.registerPrompt('autocomplete', require('inquirer-autocomplete-prompt'));

const loginQuestion =
    [
        {
            type: 'input',
            name: 'username',
            message: 'Insert your ZDM email',
            validate: function (input) {
                if (validator.isEmail(input))
                    return true;
                else
                    throw new Error('invalid email');
            }
        },
        {
            type: 'password',
            name: 'password',
            message: 'Insert your ZDM account password',
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

//
// to read YAML
//

const YAML = require('yamljs');

//
// to color the text
//

const chalk = require('chalk');


//
// Check properties inside yaml
//

const { YamlChecker, YamlError } = require('../yaml checker/yamlChecker')

//
// api for comunicate with FIBO
//

const { fibo, getToken } = require('../fiboApi');

//
//spiner for waiting moments
//

const Spinner = require('cli-spinner').Spinner;
const spinner = new Spinner('processing.. %s');
spinner.setSpinnerString('|/-\\');

const yamlChecker = new YamlChecker();

async function createProject(yamlPath, options) {
    try {
        //
        //load yaml file
        //

        if (!(/\w+.yaml/g.test(yamlPath))) {
            yamlPath += '.yaml';
        }

        let yaml = YAML.load(yamlPath);

        //
        //check project name
        //

        const projectName = yaml.projectname;
        yamlChecker.checkProjectName(projectName);

        //
        //check workspace uid
        //

        const workspaceUid = yaml.workspace;
        if (!yamlChecker.checkWorkspaceUid(workspaceUid)) {
            throw new YamlError('workspace uid is not valid, each workspace id must start with wks-')
        }

        //
        //check fleets
        //

        const fleets = yamlChecker.checkFleet(yaml.fleets);
        const fleetsId = fleets.map(el => el.id);

        //
        //check users
        //

        let users = yamlChecker.checkUsers(fleets, yaml.users);

        //
        //check views
        //

        const views = yaml.views;

        let viewName = [];              //view names

        let enabledFleet = [];          //enabledFleets per view

        let tagOfValue = [];            //couple of tag and values 

        let tagOfValuePerView = [];     //array of array of index which indicates the tagofvalues contained in each view

        let dataPerView = [];           //array of array of object. Each element represent the data property in view

        let alarmPerView = [];

        if (!Array.isArray(views)) {
            throw new YamlError('views is not valid, it must be an array')
        }

        if (views.length === 0) {
            throw new YamlError('views is empty')
        }

        for (let view of views) {

            dataPerView.push([]);

            tagOfValuePerView.push([]);

            alarmPerView.push([]);

            //
            //Check if there are two views with same name
            //

            if (viewName.includes(view.viewname)) {
                throw new YamlError('two views with the same name' + chalk.red(view.viewname));
            }
            viewName.push(view.viewname);

            const viewIndex = viewName.findIndex(el => el === view.viewname);

            //
            //Check if there is at least one admittedFleet and if that fleet is in fleets property
            //

            if (!Array.isArray(view.enabledfleet)) {
                throw new YamlError(`enabledfleet property in view called` + chalk.red(view.viewname) + `is not an array`);
            }

            if (view.enabledfleet.length === 0) {
                throw new YamlError('enabledfleet property in view called ' + chalk.red(view.viewname) + ' is an empty array');
            }

            for (let i = 0; i < view.enabledfleet.length; i++) {
                if (!fleetsId.includes(view.enabledfleet[i])) {
                    throw new YamlError('enabledfleet property in view called ' + chalk.red(view.viewname) + ' contains id ' + chalk.red(view.enabledfleet[i]) + ' which is not in fleets property');
                }
            }

            enabledFleet.push([]);

            for (let enFleet of view.enabledfleet) {
                enabledFleet[viewIndex].push(fleetsId.findIndex(el => el === enFleet));
            }

            //
            //Check data property
            //

            const data = view.data;


            for (let i = 0; i < data.length; i++) {

                let singleData = {};

                //
                //Check timeSeries, timeSeries must be an array of object, each object must be defined as {tag <string>, value: <string>}  
                //

                const timeSeries = data[i].timeseries;

                if (!timeSeries) {
                    throw new YamlError('timeSeries is not defined inside element ' + chalk.bold(i + 1) + ' of property data in ' + chalk.red(view.viewname) + ' view');
                }

                if (!Array.isArray(timeSeries)) {
                    throw new YamlError('timeSeries is not well defined inside element ' + chalk.bold(i + 1) + ' of property data in ' + chalk.red(view.viewname) + ' view. Every timeSeries property must be a non empty array');
                }

                if (timeSeries.length === 0) {
                    throw new YamlError('timeSeries is not well defined inside element ' + chalk.bold(i + 1) + ' of property data in ' + chalk.red(view.viewname) + ' view. Every timeSeries property must be a non empty array');
                }

                let datagroups = [];

                for (let j = 0; j < timeSeries.length; j++) {

                    let aggregation = timeSeries[j].aggregation;

                    if (aggregation.replace(/\s+/g, '').length === 0) {
                        aggregation = data[i].aggregationfunction;
                    }

                    datagroups.push({ aggregation: aggregation, tagOfValue: [] });

                    //
                    // check tagofvalue objects
                    //

                    const tagOfValueArray = timeSeries[j].tagvalue;

                    for (let t = 0; t < tagOfValueArray.length; t++) {

                        const couple = tagOfValueArray[t];

                        if (! typeof couple.tag === 'string' || ! typeof couple.value === 'string') {
                            throw new YamlError('Invalid item ' + chalk.red(t + 1) + ' inside time series ' + chalk.bold(j + 1) + ' and ' + chalk.red(i + 1) + ' data in ' + chalk.red(view.viewname) + ' view. Each item must be defined as {tag <string>, value: <string>}  ')
                        }

                        if (couple.tag.replace(/\s+/g, '').length === 0) {
                            throw new YamlError('Invalid item ' + chalk.red(t + 1) + ' inside time series ' + chalk.bold(j + 1) + ' and ' + chalk.red(i + 1) + ' data in ' + chalk.red(view.viewname) + ' view. Each item must be defined as {tag <string>, value: <string>}  ')
                        }

                        if (couple.value.replace(/\s+/g, '').length === 0) {
                            throw new YamlError('Invalid item ' + chalk.red(t + 1) + ' inside time series ' + chalk.bold(j + 1) + ' and ' + chalk.red(i + 1) + ' data in ' + chalk.red(view.viewname) + ' view. Each item must be defined as {tag <string>, value: <string>}  ')
                        }

                        //
                        //push couple inside tagOfValue if it has not yet been pushed
                        //

                        if (!tagOfValue.some(el => el.tag === couple.tag && el.value === couple.value)) {
                            tagOfValue.push({ tag: couple.tag, value: couple.value })
                        }

                        //
                        //push couple inside tagOfValueperview at index i if it has not yet been pushed
                        //

                        const tagValueIndex = tagOfValue.findIndex(el => el.tag === couple.tag && el.value === couple.value);

                        if (!tagOfValuePerView[viewIndex].includes(tagValueIndex)) {
                            tagOfValuePerView[viewIndex].push(tagValueIndex);
                        }

                        //
                        // insert data in datagroup with index j
                        //

                        datagroups[j].tagOfValue.push(tagValueIndex);

                    }
                }
                dataPerView[viewIndex].push({ aggrFun: data[i].aggregationfunction, tagvalue: datagroups });
            }

            //
            // alarm property
            //

            const alarms = view.alarm;

            if (alarms) {

                if (!Array.isArray(alarms)) {
                    throw new Error('alarms property in view ' + chalk.red(view.viewname + ' must be an array'))
                }

                for (let alarm of alarms) {

                    if (!alarm.tag || !alarm.value) {
                        throw new YamlError('alarm in view ' + chalk.red(view.viewname) + ' is not valid. Each alarm must be defined as follow: {tag: <string>, value: <string>, [max: <number>, min: <number>]}. At least one of the max/min properties must be defined');
                    }

                    if (!alarm.max && !alarm.min) {
                        throw new YamlError('alarm in view ' + chalk.red(view.viewname) + ' is not valid. Each alarm must be defined as follow: {tag: <string>, value: <string>, [max: <number>, min: <number>]}. At least one of the max/min properties must be defined');
                    }

                    //alarm written two times
                    let alarmIndex = alarmPerView[viewIndex].findIndex(el => alarm.tag === el.tag && alarm.value === el.value);

                    if (alarmIndex !== -1) {
                        throw new YamlError('two alarms with same tag: ' + chalk.red(alarm.tag) + ' and value: ' + chalk.red(alarm.value) + ' in view ' + chalk.red(view.viewname));
                    }

                    //
                    //push couple inside tagOfValue if it has not yet been pushed
                    //

                    if (!tagOfValue.some(el => el.tag === alarm.tag && el.value === alarm.value)) {
                        tagOfValue.push({ tag: alarm.tag, value: alarm.value })
                    }

                    //
                    //push couple inside tagOfValueperview at index i if it has not yet been pushed
                    //

                    const tagValueIndex = tagOfValue.findIndex(el => el.tag === alarm.tag && el.value === alarm.value);

                    if (alarm.max) {
                        alarmPerView[viewIndex].push({ tag: alarm.tag, value: alarm.value, tagvalueIndex: tagValueIndex, type: 'max', threshold: alarm.max });
                    }

                    if (alarm.min) {
                        alarmPerView[viewIndex].push({ tag: alarm.tag, value: alarm.value, tagvalueIndex: tagValueIndex, type: 'min', threshold: alarm.min });
                    }

                    if (!tagOfValuePerView[viewIndex].includes(tagValueIndex)) {
                        tagOfValuePerView[viewIndex].push(tagValueIndex);
                    }

                }

            }
        }

        //
        //get token with login
        //

        let token = null;
        let tokenExpires = null;
        let exit = false;
        let email;
        let pass;

        /*while (!exit && !token) {
            const { username, password } = await prompt(loginQuestion);
            try {

                const response = await getToken(username, password);
                if (response.code !== 200) {
                    console.log('username or password are not correct');
                } else {
                    token = response.data.token;
                    tokenExpires = response.data.expires;
                    email = username;
                    pass = password;
                }

            } catch (err) {
                console.error(err);
                exit = true;
            }

            if (!token) {
                const { retry } = await prompt([{
                    type: 'confirm',
                    name: 'retry',
                    message: `Retry?`,
                }]);
                exit = !retry;
            }
        }

        if (!token) {
            console.log('Project Creation annulled');
            return;
        }*/

        email = 'wilsimoni@gmail.com';
        pass = 'PRoF5lleh0w';
        let ret = await getToken(email, pass);
        token = ret.data.token;
        tokenExpires = ret.data.expires;

        if (options.overwrite) {
            const { confirm } = await prompt([{
                type: 'confirm',
                name: 'confirm',
                message: `Are you sure you want to overwrite the ` + chalk.rgb(102, 51, 0)(projectName) + ` project?`,
                default: false
            }]);
            options.overwrite = confirm;
        } else {
            options.overwrite = false;
        }

        const request = {
            projectName,
            workspaceuid: workspaceUid,
            username: email,
            password: pass,
            token,
            tokenExpires,
            users,
            fleets,
            enabledFleets: enabledFleet,
            viewNames: viewName,
            tagOfValue,
            tagOfValuePerView,
            dataPerView,
            alarmPerView,
            overwrite: options.overwrite,
        }

        spinner.start();
        const res = await fibo.createProject(request);
        spinner.stop(true);

        if (res.status !== 200) {
            if (res.status === 451) {
                console.log(res.errors[0]);
                console.log(chalk.red(`use: cp -o ${yamlPath} to overwrite the old project`));
                return;
            } else {
                console.log(res.errors[0]);
                return;
            }
        } else {
            console.log(chalk.greenBright('Project creation successful'));
        }

    } catch (err) {
        if (spinner.isSpinning()) {
            spinner.stop(true);
        }
        if (err instanceof YamlError) {
            console.error(chalk.red('Yaml error: ') + err.message);
        } else {
            console.error(chalk.red('generic error: ' + err.message))
        }
    }
}

//createProject('../yaml', { overwrite: false });

exports.createProject = createProject;