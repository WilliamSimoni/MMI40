/* eslint-disable eqeqeq */
import React, { Component } from 'react';
import TopBar from './Component/TopBar.js'
import Views from './Component/Views.js'

import { Accordion, AccordionTab } from 'primereact/accordion';
import { Growl } from 'primereact/growl';
import { Chips } from 'primereact/chips';
import { Dropdown } from 'primereact/dropdown';

import './App.css';

import constdata from './Data/const.json'
import CreateYAML from './Function/CreateYAML.js'
import UploadYAML from './Function/UploadFile.js'
import AddView from './Function/AddView.js'
import DeleteView from './Function/DeleteView.js'
import DeleteData from './Function/DeleteData.js'
import AddData from './Function/AddData.js'
import AggFun from './Function/SetAggregationFun.js'
import AlgChart from './Algchart'
import { Sidebar } from 'primereact/sidebar';

import 'primereact/resources/themes/nova-light/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import { Button } from 'primereact/button';



class App extends Component {

    constructor() {
        super();

        this.state = {
            aggdiv: [],//list all aggregation function type
            name: [],//list of all view name
            rolespage: [],//list of role for each views
            roles: [],//list of all roles
            template: null,
            projectname: [],
            views: [],//list of all view
            alarmval: [],//list of all alarm for each view
            nuser: 0,//number of user
            users: [],//list of user
            visible: false

        }
    }

    /**
     * Create the YAML file ready for download
     */
    downloadFile = async () => {
        const YAML = require('json-to-pretty-yaml');

        const yamlcomp = CreateYAML(this.state);
        const yaml = YAML.stringify(yamlcomp);
        const blob = new Blob([yaml], { type: 'application/x-yaml' });

        const href = await URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = href;
        link.download = "file.yaml";

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    /**
    * Upload a YAML file and refresh the state with the new YAML file
    * @param {Object} value - The yaml file
    */
    UploadFile(value) {
        if (value === null) {

            this.growl.show({
                severity: 'error',
                summary: 'Error Message',
                detail: 'File not supported'
            });

        } else {
            this.setState(UploadYAML(value))
            this.growl.show({
                severity: 'success',
                summary: 'Success Message',
                detail: 'File Loaded'
            });
        }


    }

    /**
     * Create a random password for the users
     * @return {String} A random password of 8 char
     */
    genPassword() {
        const size = 8
        const char = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
        const leng = char.length
        var pass = "";
        for (let i = 0; i < size; ++i) {
            pass += char.charAt(Math.floor(Math.random() * leng));
        }
        return pass;
    }


    render() {
        /* *Data for some dropdown (see /Data/const.json)*/
        const template = constdata.template
        const keyword = constdata.aggergationFormat
        const aggregationType = constdata.aggregationType

        const role = [];
        for (let i = 0; i < this.state.roles.length; i++) {
            role.push({ label: this.state.roles[i], value: this.state.roles[i] })
        }

        return (
            <div>
                {/* *Show the algorithm for the correct chart for a data*/}
                <Sidebar visible={this.state.visible} position="right"
                    style={{ width: '30em' }}
                    onHide={(e) => this.setState({ visible: false })}>
                    {/* * Component for the algorithm  */}
                    <AlgChart />
                </Sidebar>

                {/* *Top Bar with the button for upload and download a yaml file 
                    *and show up the chart algorithm   
                    */}
                <TopBar downloadFile={this.downloadFile}
                    handleState={(value) => this.UploadFile(value)}
                    openSide={(e) => this.setState({ visible: e })} />

                <div id="main" className="Accord">
                    <Growl ref={(el) => this.growl = el} />
                    {/* * Accordion for general data */}
                    <Accordion>
                        <AccordionTab header="General">
                            <div className="container">
                                {/* * Input text for the project name */}
                                <h3>Project Name</h3>
                                <Chips value={this.state.projectname}
                                    onChange={(e) => this.setState({ projectname: e.value })}
                                    max={1}
                                    tooltip="Press Enter to confirm"
                                    placeholder= {(this.state.projectname.length===0) ?"Project name" : ""}></Chips>

                                <h3>Roles</h3>
                                {/* * Multiple input text for the roles */}
                                <Chips
                                    value={this.state.roles}
                                    onChange={(e) => this.setState({ roles: e.value })}></Chips>

                                {/* * Button to add new user */}
                                <h3>Users</h3>
                                <Button label="Add Users" icon="pi pi-check"
                                    onClick={() => {
                                        const z = {
                                            name: [],
                                            pass: this.genPassword(),
                                            role: ""
                                        }
                                        const k = this.state.users
                                        k.push(z)
                                        const users = this.state.nuser + 1
                                        this.setState({
                                            nuser: users,
                                            users: k
                                        })
                                    }
                                    }></Button>

                                {/* * List of user   */}
                                {this.state.users.map((row, i) => {
                                    return <div key={i}>
                                        {/* * InputText for the user name */}
                                        <Chips style={{ size: "150" }} value={row.name}
                                            onChange={(e) => {
                                                const k = this.state.users
                                                k[i].name = e.value
                                                this.setState({ users: k })
                                            }}
                                            max={1}
                                            tooltip="Press Enter to confirm"></Chips>
                                            {/* * Dropdown for choose the role for the user */}
                                        <Dropdown value={row.role}
                                            options={role}
                                            onChange={(e) => {
                                                const k = this.state.users
                                                k[i].role = e.value
                                                this.setState({ users: k })
                                            }}
                                            placeholder="Select a role" />
                                            {/* * Button to delete the user */}
                                        <Button
                                            icon="pi pi-times" className="p-button-danger"
                                            onClick={() => {
                                                const z = this.state.users
                                                z.splice(i, 1)
                                                const users = this.state.nuser - 1
                                                this.setState({
                                                    nuser: users,
                                                    users: z
                                                })
                                            }} />


                                    </div>
                                })}
                                {/* * DropDown for select the template*/}
                                <h3>Template</h3>
                                <Dropdown value={this.state.template}
                                    options={template}
                                    onChange={(e) => { this.setState({ template: e.value }) }}
                                    placeholder="Select a Template" />
                            </div>
                        </AccordionTab>                   
                    </Accordion>

                    {/* * Button add new view */}
                    <h2>Views</h2>
                    <Button label="Add" icon="pi pi-plus"
                        onClick={() => this.setState(AddView(this.state))} />
                        {/* * List of accordion of all view */}
                    <Views names={this.state.name}
                        cancelButton={(i) => { this.setState(DeleteView(i, this.state)) }}
                        addData={(i) => { this.setState(AddData(i, this.state)) }}
                        removeData={(s, i) => { this.setState(DeleteData(i, this.state)) }}
                        onChange1={(e, i) => {
                            const nome = this.state.name
                            nome[i] = e
                            this.setState({
                                name: nome
                            })
                        }}
                        views={this.state.views}
                        alarm={this.state.alarmval}
                        rolespage={this.state.rolespage}
                        aggdiv={this.state.aggdiv}
                        role={role}
                        keyword={keyword}
                        aggtype={aggregationType}
                        onChangeMulti={(e, i) => {
                            const k = this.state.rolespage;
                            k[i] = { admittedroles: e.value }
                            this.setState({ rolespage: k })
                        }}
                        onChangeData={(e, s, i) => {
                            const k = this.state.views
                            k[i].data[s].title = e
                            this.setState({
                                views: k
                            })
                        }}
                        onChangeDevice={(e, s, i) => {
                            const k = this.state.views
                            k[i].data[s].variables.datasource.device = e.target.value
                            this.setState({
                                views: k
                            })
                        }}
                        onChangeKeyword={(e, s, i) => {
                            const k = this.state.views
                            k[i].data[s].variables.datasource.keyword = e.target.value
                            this.setState({
                                views: k
                            })
                        }}
                        onChangeAggType={(e, s, i) => {
                            const k = this.state.views
                            k[i].data[s].variables.aggregationfunction.type = e.target.value
                            this.setState({
                                views: k
                            })
                        }}
                        onChangeAggDiv={(e, s, i) => { this.setState(AggFun(e, s, i, this.state)) }}
                        onChangeTime={(e, s, i, n) => {
                            const k = this.state.views
                            const time = k[i].data[s].timeinterval
                            const split = time.split(" ")
                            if (n == 0) {
                                split[0] = e.target.value
                                k[i].data[s].timeinterval = split.join(" ")
                            } else {
                                split[1] = e
                                k[i].data[s].timeinterval = split.join(" ")
                            }

                            this.setState({
                                views: k
                            })
                        }}
                        onChangeGran={(e, s, i, n) => {
                            const k = this.state.views
                            const gran = k[i].data[s].granularity
                            const split = gran.split(" ")
                            if (n == 0) {
                                split[0] = e.target.value
                                k[i].data[s].granularity = split.join(" ").trim()
                            } else {
                                split[1] = e
                                k[i].data[s].granularity = split.join(" ").trim()
                            }
                            this.setState({
                                views: k
                            })
                        }}
                        onChangeChart={(e, s, i) => {
                            const k = this.state.views
                            k[i].data[s].chart = e
                            this.setState({
                                views: k
                            })
                        }}

                        onChangeAlarmval={(e, s, i) => {
                            const k = this.state.alarmval
                            const z = this.state.views
                            k[i][s] = e.target.value
                            if (k[i][s] == true) {
                                z[i].data[s].alarm = {
                                    maxthreshold: 1,
                                    minthreshold: 0
                                }
                            } else {
                                z[i].data[s].alarm = undefined
                            }
                            this.setState({
                                alarmval: k
                            })
                        }}

                        onChangeAlarmth={(e, s, i, val) => {
                            const z = this.state.views

                            if (val === 1) z[i].data[s].alarm.maxthreshold = e.target.value
                            else z[i].data[s].alarm.minthreshold = e.target.value
                            this.setState({
                                views: z
                            })

                        }}

                        onChangeDType={(e, s, i) => {
                            const k = this.state.views

                            k[i].data[s].type = e.target.value
                            this.setState({
                                views: k
                            })

                        }}

                        onChangeChartProps={(e, s, i) => {
                            const k = this.state.views
                            k[i].data[s].chart[e.target.name] = e.target.value
                            this.setState({
                                views: k
                            })
                        }}
                    />




                </div>
            </div>
        )

    }
}

export default App;