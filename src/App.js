/* eslint-disable eqeqeq */
import React, { Component } from 'react';
import TopBar from './Component/TopBar.js'
import AccTab from './Component/AccTab.js'

import { Accordion, AccordionTab } from 'primereact/accordion';
import { Growl } from 'primereact/growl';
import { Chips } from 'primereact/chips';
import { Dropdown } from 'primereact/dropdown';


import './App.css';
import data from './Data/const.json'
import datatype from './Data/dataType.json'
import AlgChart from './Algchart'
import { Sidebar } from 'primereact/sidebar';

import 'primereact/resources/themes/nova-light/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import { Button } from 'primereact/button';



class App extends Component {

    constructor(props) {
        super(props);

        this.state = {
            aggdiv: [],
            value: 0,
            name: [],
            rolespage: [],
            roles: [],
            template: null,
            projectname: [],
            alldata: [],

            alarmval: [],

            nuser: 0,
            users: [],

            visible: false

        }

    }

    downloadFile = async () => {
        const YAML = require('json-to-pretty-yaml');

        const yamlcomp = {
            projectname: this.state.projectname[0],
            template: this.state.template,
            roles: this.state.roles,
            views: [],


            users: this.state.users,
            datatype: data.datatype

        }


        for (let d = 0; d < this.state.nuser; d++) {
            const h = yamlcomp.users[d]
            const s = h.name[0]
            h.name = s

        }
        let pages = []

        for (let i = 0; i < this.state.value; i++) {
            let dat = this.state.alldata[i].datas


            pages.push({
                viewname: this.state.name[i][0],
                admittedroles: this.state.rolespage[i].admittedroles,
                data: dat
            })

        }
        yamlcomp.views = pages

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

    addPage() {
        const aggdiv = this.state.aggdiv
        const nome = this.state.name
        const roles = this.state.rolespage
        const alldata = this.state.alldata
        const npage = this.state.value + 1
        const alarm = this.state.alarmval

        const nalarm = []
        const inse = ['NewPage']
        const rol = []
        const agd = []
        const data = {
            value: 0,
            datas: [],
        }

        aggdiv.push(agd)
        nome.push(inse)
        roles.push(rol)
        alldata.push(data)
        alarm.push(nalarm)

        this.setState({
            aggdiv: aggdiv,
            value: npage,
            name: nome,
            rolespage: roles,
            alldata: alldata,
            alarmval: alarm
        })



    }

    cancelPage(n) {
        const aggdiv = this.state.aggdiv
        const nome = this.state.name
        const roles = this.state.rolespage
        const alldata = this.state.alldata
        const npage = this.state.value - 1
        const alarm = this.state.alarmval

        aggdiv.splice(n, 1)
        nome.splice(n, 1)
        roles.splice(n, 1)
        alldata.splice(n, 1)
        alarm.splice(n, 1)


        this.setState({
            aggdiv: aggdiv,
            value: npage,
            name: nome,
            rolespage: roles,
            alldata: alldata,
            alarmval: alarm
        })

    }

    addData(i, h) {

        const agdv = this.state.aggdiv
        const aggdiv = agdv[i]
        const data = this.state.alldata
        const datai = data[i].datas
        const k = data[i].value + 1

        const alarm = this.state.alarmval
        const alarm1 = alarm[i]
        alarm1.push(false)

        const agd = []
        //const name = 'NewData'+h

        const name2 = {
            title: "Newdata" + k,
            type: h,
            alarm: undefined,
            variables: {
                datasource: {
                    device: [],
                    keyword: []

                },
                aggregationfunction: {
                    type: '',
                    aggregated: [],
                    divided: [],
                }
            },
            timeinterval: '1 seconds',
            granularity: '1',
            chart: {
                type: ''
            },
            lex: '...',

        }
        for (let ri = 0; ri < datatype.length; ri++) {
            if (h === "empty") break;
            if (h === datatype[ri].type) {
                const dtk = datatype[ri].data
                name2.title = dtk.title
                name2.type = dtk.type
                name2.variables.aggregationfunction = dtk.variables.aggregationfunction
                name2.timeinterval = dtk.timeinterval
                name2.granularity = dtk.granularity
                name2.chart = dtk.chart
                break;
            }
        }
        datai.push(name2)
        aggdiv.push(agd)


        data[i].value = k
        data[i].datas = datai

        this.setState({
            aggdiv: agdv,
            alldata: data,
            alarmval: alarm
        })

    }

    removeData(n, i) {
        const agdv = this.state.aggdiv
        const aggdiv = agdv[i]
        const data = this.state.alldata
        const datai = data[i].datas
        const k = data[i].value - 1
        const alarm = this.state.alarmval
        const alarm1 = alarm[i]

        alarm1.splice(n, 1)
        aggdiv.splice(n, 1)
        datai.splice(n, 1)

        data[i].value = k
        data[i].datas = datai

        this.setState({
            aggdiv: agdv,
            alldata: data,
            alarmval: alarm
        })

    }

    onChange1(e, index) {
        const nome = this.state.name
        nome[index] = e
        this.setState({
            name: nome
        })
    }
    /////
    aggPartiton(e, s, i) {
        const variables = this.state.alldata
        const aggdivm = variables[i].datas[s].variables.aggregationfunction
        aggdivm.aggregated = []
        aggdivm.divided = []

        const k = this.state.aggdiv
        const val = e.target.value
        k[i][s] = val

        switch (val) {
            case "agg1":
                aggdivm.aggregated = ['device', 'keyword'];
                break;
            case "agg2":
                aggdivm.aggregated = ['keyword', 'device'];
                break;
            case "aggdiv":
                aggdivm.aggregated = ['device'];
                aggdivm.divided = ['keyword'];
                break;
            case "divagg":
                aggdivm.aggregated = ['keyword'];
                aggdivm.divided = ['device'];
                break;
            case "div":
                aggdivm.divided = ['device', 'keyword'];
                break;
            default:
                aggdivm.aggregated = ['device', 'keyword'];
        }

        this.setState({
            alldata: variables,
            aggdiv: k
        })

    }

    UploadFile(value) {
        let alarm = []
        const na = value.views;
        let pages = []
        let addmi = []
        let data = []
        let aggdiv = []
        for (let i = 0; i < na.length; i++) {

            pages.push([na[i].viewname])
            addmi.push({ admittedroles: na[i].admittedroles })
            const k = na[i].data
            const l = k.length
            const alarm2 = []
            const aggdivm = []
            for (let h = 0; h < l; h++) {
                if (k[h].alarm === undefined) alarm2.push(false)
                else alarm2.push(true)


                const agg = k[h].variables.aggregationfunction.aggregated
                const div = k[h].variables.aggregationfunction.divided
                if (agg.length == 2) {
                    if (agg.indexOf("device") == 0) {
                        aggdivm.push('agg1')
                        continue;
                    } else {
                        aggdivm.push('agg2')
                        continue;
                    }
                }
                if (div.length == 2) {
                    aggdivm.push('div')
                    continue;
                }
                if (agg.length == 1) {
                    if (agg.includes("device")) {
                        aggdivm.push('aggdiv')
                        continue;
                    } else {
                        aggdivm.push('divagg')
                        continue;
                    }
                }
            }
            const f = {
                value: l,
                datas: k
            }
            aggdiv.push(aggdivm)
            data.push(f)
            alarm.push(alarm2)
        }
        const nuser = value.users.length
        for (let d = 0; d < nuser; d++) {
            const us = value.users[d]
            const s = [us.name]
            us.name = s
        }

        this.setState({
            aggdiv: aggdiv,
            rolespage: addmi,
            projectname: [value.projectname],
            value: na.length,
            name: pages,

            alarmval: alarm,
            roles: value.roles,
            template: value.template,
            alldata: data,

            users: value.users,
            nuser: nuser

        })

        this.growl.show({
            severity: 'success',
            summary: 'Success Message',
            detail: 'File Loaded'
        });

    }

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

        const template = data.template
        const keyword = data.aggergationFormat
        const aggregationType = data.aggregationType

        const role = [];
        for (let i = 0; i < this.state.roles.length; i++) {
            role.push({ label: this.state.roles[i], value: this.state.roles[i] })
        }

        return (
            <div>
                <Sidebar visible={this.state.visible} position="right" 
                style={{width:'30em'}}
                onHide={(e) => this.setState({ visible: false })}>
                    <AlgChart></AlgChart>
                </Sidebar>
                <TopBar downloadFile={this.downloadFile}
                    handleState={(value) => this.UploadFile(value)} 
                    openSide={(e)=> this.setState({visible: e})}/>

                <div id="main" className="Accord">
                    <Growl ref={(el) => this.growl = el} />


                    <Accordion>
                        <AccordionTab header="General">
                            <div className="container">
                                <h3>Project Name: {this.state.projectname[0]}</h3>
                                <Chips value={this.state.projectname}
                                    onChange={(e) => this.setState({ projectname: e.value })}
                                    max={1}
                                    tooltip="Premere Enter per confermare"></Chips>


                                <h3>Roles</h3>
                                <Chips
                                    value={this.state.roles}
                                    onChange={(e) => this.setState({ roles: e.value })}></Chips>

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


                                {this.state.users.map((row, i) => {
                                    return <div>
                                        <Chips style={{ size: "150" }} value={row.name}
                                            onChange={(e) => {
                                                const k = this.state.users
                                                k[i].name = e.value
                                                this.setState({ users: k })
                                            }}
                                            max={1}
                                            tooltip="Premere Enter per confermare"></Chips>
                                        <Dropdown value={row.role}
                                            options={role}
                                            onChange={(e) => {
                                                const k = this.state.users
                                                k[i].role = e.value
                                                this.setState({ users: k })
                                            }}
                                            placeholder="Select a role" />
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



                                <h3>Template</h3>
                                <Dropdown value={this.state.template}
                                    options={template}
                                    onChange={(e) => { this.setState({ template: e.value }) }}
                                    placeholder="Select a Template" />
                            </div>



                        </AccordionTab>

                    </Accordion>
                    <h2>Views</h2>
                    <Button label="Add" icon="pi pi-plus"
                        onClick={() => this.addPage()} />
                    <AccTab names={this.state.name}
                        cancelButton={(i) => { this.cancelPage(i) }}
                        addData={(i, h) => { this.addData(i, h) }}
                        removeData={(s, i) => { this.removeData(s, i) }}
                        onChange1={(e, i) => { this.onChange1(e, i) }}
                        alldata={this.state.alldata}
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
                            const k = this.state.alldata
                            k[i].datas[s].title = e
                            this.setState({
                                alldata: k
                            })
                        }}
                        onChangeDevice={(e, s, i) => {
                            const k = this.state.alldata
                            k[i].datas[s].variables.datasource.device = e.target.value
                            this.setState({
                                alldata: k
                            })
                        }}
                        onChangeKeyword={(e, s, i) => {
                            const k = this.state.alldata
                            k[i].datas[s].variables.datasource.keyword = e.target.value
                            this.setState({
                                alldata: k
                            })
                        }}
                        onChangeAggType={(e, s, i) => {
                            const k = this.state.alldata
                            k[i].datas[s].variables.aggregationfunction.type = e.target.value
                            this.setState({
                                alldata: k
                            })
                        }}
                        onChangeAggDiv={(e, s, i) => { this.aggPartiton(e, s, i) }}
                        onChangeTime={(e, s, i, n) => {
                            const k = this.state.alldata
                            const time = k[i].datas[s].timeinterval
                            const split = time.split(" ")
                            if (n == 0) {
                                split[0] = e.target.value
                                k[i].datas[s].timeinterval = split.join(" ")
                            } else {
                                split[1] = e
                                k[i].datas[s].timeinterval = split.join(" ")
                            }

                            this.setState({
                                alldata: k
                            })
                        }}
                        onChangeGran={(e, s, i, n) => {
                            const k = this.state.alldata
                            const gran = k[i].datas[s].granularity
                            const split = gran.split(" ")
                            if (n == 0) {
                                split[0] = e.target.value
                                k[i].datas[s].granularity = split.join(" ").trim()
                            } else {
                                split[1] = e
                                k[i].datas[s].granularity = split.join(" ").trim()
                            }
                            this.setState({
                                alldata: k
                            })
                        }}
                        onChangeChart={(e, s, i) => {
                            const k = this.state.alldata
                            k[i].datas[s].chart = e
                            this.setState({
                                alldata: k
                            })
                        }}

                        onChangeAlarmval={(e, s, i) => {
                            const k = this.state.alarmval
                            const z = this.state.alldata
                            k[i][s] = e.target.value
                            if (k[i][s] == true) {
                                z[i].datas[s].alarm = {
                                    maxthreshold: 1,
                                    minthreshold: 0
                                }
                            } else {
                                z[i].datas[s].alarm = undefined
                            }
                            this.setState({
                                alarmval: k
                            })
                        }}

                        onChangeAlarmth={(e, s, i, val) => {
                            const z = this.state.alldata
                            if (val === 1) z[i].datas[s].alarm.maxthreshold = e.target.value
                            else z[i].datas[s].alarm.minthreshold = e.target.value
                            this.setState({
                                alldata: z
                            })

                        }}

                        onChangeDType={(e, s, i) => {
                            const k = this.state.alldata
                            k[i].datas[s].type = e.target.value
                            this.setState({
                                alldata: k
                            })
                        }}
                        onChangeChartProps={(e, s, i) => {
                            const k = this.state.alldata
                            k[i].datas[s].chart[e.target.name] = e.target.value
                            this.setState({
                                alldata: k
                            })
                        }}
                    />




                </div>
            </div>
        )

    }
}

export default App;