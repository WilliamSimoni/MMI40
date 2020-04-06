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

        }

    }

    downloadFile = async () => {
        const YAML = require('json-to-pretty-yaml');

        const yamlcomp = {
            projectname: this.state.projectname[0],
            template: this.state.template,
            roles: this.state.roles,
            views: { view: [] },

            datatype: data.datatype
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
        yamlcomp.views.view = pages

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

        
        this.setState({
            aggdiv: aggdiv,
            value: npage,
            name: nome,
            rolespage: roles,
            alldata: alldata
        })

        

    }

    cancelPage(n) {
        const aggdiv = this.state.aggdiv
        const nome = this.state.name
        const roles = this.state.rolespage
        const alldata = this.state.alldata
        const npage = this.state.value - 1

        aggdiv.splice(n, 1)
        nome.splice(n, 1)
        roles.splice(n, 1)
        alldata.splice(n, 1)

        this.setState({
            aggdiv: aggdiv,
            value: npage,
            name: nome,
            rolespage: roles,
            alldata: alldata
        })

    }

    addData(i,h) {

        const agdv = this.state.aggdiv
        const aggdiv = agdv[i]
        const data = this.state.alldata
        const datai = data[i].datas
        const k = data[i].value+1

        const agd = []
        //const name = 'NewData'+h
       
        
        let name2 /*= {
            title: name,
            type: h,
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

        } */
        for(let i=0;i<datatype.length;i++){
            if(h===datatype[i].type) {
                name2=datatype[i].data
                break;
            }
        }
        aggdiv.push(agd)
        datai.push(name2)

        data[i].value = k
        data[i].datas = datai

        this.setState({
            aggdiv: agdv,
            alldata: data
        })

    }

    removeData(n,i) {
        const agdv = this.state.aggdiv
        const aggdiv = agdv[i]
        const data = this.state.alldata
        const datai = data[i].datas
        const k = data[i].value-1

        aggdiv.splice(n, 1)
        datai.splice(n, 1)
        
        data[i].value = k
        data[i].datas = datai

        this.setState({
            aggdiv: agdv,
            alldata: data
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
        const na = value.views.view;
        let pages = []
        let addmi = []
        let data = []
        let aggdiv = []
        for (let i = 0; i < na.length; i++) {
            pages.push([na[i].viewname])
            addmi.push({ admittedroles: na[i].admittedroles })
            const k = na[i].data
            const l = k.length

            const aggdivm = []
            for (let h = 0; h < l; h++) {
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
        }

        this.setState({
            aggdiv: aggdiv,
            rolespage: addmi,
            projectname: [value.projectname],
            value: na.length,
            name: pages,


            roles: value.roles,
            template: value.template,
            alldata: data,

        })

        this.growl.show({
            severity: 'success',
            summary: 'Success Message',
            detail: 'File Loaded'
        });

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
                <TopBar downloadFile={this.downloadFile}
                    handleState={(value) => this.UploadFile(value)} />

                <div id="main" className="Accord">
                    <Growl ref={(el) => this.growl = el} />
                     

                    <Accordion>
                        <AccordionTab header="General">
                            <div className="container">

                                <h3>Project Name: {this.state.projectname[0]}</h3>
                                <Chips value={this.state.projectname}  
                                onChange={(e) => this.setState({ projectname: e.value})}
                                max={1}
                                tooltip="Premere Enter per confermare"></Chips>
                                

                                <h3>Roles</h3>
                                <Chips 
                                    value={this.state.roles}
                                    onChange={(e) => this.setState({ roles: e.value })}></Chips>

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
                              onClick={() => this.addPage()}/>
                    <AccTab names={this.state.name}
                        cancelButton={(i) => { this.cancelPage(i) }}
                        addData={(i,h)=> {this.addData(i,h)}}
                        removeData={(s,i) => {this.removeData(s,i)}}
                        onChange1={(e, i) => { this.onChange1(e, i) }}
                        alldata={this.state.alldata}
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
                        onChangeGran={(e, s, i,n) => {
                            const k = this.state.alldata
                            const gran= k[i].datas[s].granularity
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

                        onChangeDType={(e,s,i)=> {
                            const k = this.state.alldata
                            k[i].datas[s].type = e.target.value
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