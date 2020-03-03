/* eslint-disable eqeqeq */
import React, { Component } from 'react';
import AccTab from './Component/AccTab.js'
import TopBar from './Component/TopBar.js'
import ButtonBlank from './Component/ButtonBlank.js'

import { Spinner } from 'primereact/spinner';
import { Accordion, AccordionTab } from 'primereact/accordion';
import { Growl } from 'primereact/growl';
import { Chips } from 'primereact/chips';
import {Dropdown} from 'primereact/dropdown';


import './App.css';

import 'primereact/resources/themes/nova-light/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';


class App extends Component {

    constructor(props) {
        super(props);
        this.state = {
            value: 0,
            name: [],
            roles: [],
            template: null,
            projectname: ""


        }

    }

    downloadFile = async () => {
        const YAML = require('json-to-pretty-yaml');
        const yamlcomp = {
            projectname: this.state.projectname,
            template: this.state.template,
            roles: this.state.roles,
            views: {view:[]}
        }
        let pages = []
        for (let i = 0; i < this.state.value; i++) {
            pages.push({ viewname: this.state.name[i] })

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

    handleClick2(e) {

        const nome = this.state.name
        const j = e.target.value
        if (j > this.state.value) {
            const inse = 'Page' + j
            nome.push(inse)
        }
        if (j < this.state.value) {
            nome.pop()
        }


        this.setState({
            value: j,
            name: nome
        })

    }

    onChange1(e, index) {
        const nome = this.state.name
        nome[index] = e
        this.setState({
            name: nome
        })
    }

    handleState(value) {
        const na=value.views.view;
        let pages = []
        for (let i = 0; i < na.length; i++) {
            pages.push(na[i].viewname)

        }
        this.setState({
            value: na.length,
            name: pages,
            projectname: value.projectname,
            roles: value.roles,
            template: value.template

        })
        console.log(pages)
        this.growl.show({ severity: 'success', summary: 'Success Message', detail: 'File Loaded' });

    }




    render() {

        const cars = [
            {label: 'Standard', value: 'Standard'},
            {label: 'TemplateA', value: 'TemplateA'},
            {label: 'TemplateB', value: 'TemplateB'},
        ];

        return (
            <div>
                <TopBar downloadFile={this.downloadFile} handleState={(value) => this.handleState(value)} />

                <div id="main" className="Accord">
                    <Growl ref={(el) => this.growl = el} />
                    <Accordion>
                        <AccordionTab header="general">
                            <ButtonBlank name="Project name" value={this.state.projectname} onChange1={(e) => this.setState({ projectname: e })}></ButtonBlank>

                            <h3>Roles</h3>
                            <Chips tooltip="Enter the role name and press enter" value={this.state.roles} onChange={(e) => this.setState({ roles: e.value })}></Chips>

                            <h3>Template</h3>
                            <Dropdown value={this.state.template} options={cars} onChange={(e) => {this.setState({template: e.value})}} placeholder="Select a Template" />
                            
                            <h3>Views number</h3>
                            <Spinner min={0} value={this.state.value}
                                onChange={(e) => this.handleClick2(e)} />

                        </AccordionTab>

                    </Accordion>
                    <h2>Views</h2>

                    <AccTab number={this.state.value} names={this.state.name} onChange1={(e, index) => this.onChange1(e, index)}></AccTab>

                </div>
            </div>
        )

    }
}

export default App;