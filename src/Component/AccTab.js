import React, { Component } from 'react';
import { Accordion, AccordionTab } from 'primereact/accordion';
import { MultiSelect } from 'primereact/multiselect';
import { InputText } from 'primereact/inputtext';
import {Button} from 'primereact/button';

import DataAccord from './DataAccord.js'


import 'primereact/resources/themes/nova-light/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';

class AccTab extends Component {

    render() {

        return (
            <Accordion>

                {this.props.names.map((row, i) => {
                    return <AccordionTab key={i} header={row}>
                        <Button icon="pi pi-times" className="p-button-danger"
                        onClick={() => this.props.cancelButton(i)}/>
                        <h3>Page Name</h3>
                        <InputText autoFocus type="text" value={row}
                            onChange={(e) => this.props.onChange1(e.target.value, i)}
                            tooltip="Enter the Page Name"
                        />
                      
                        <h3>Select roles</h3>
                        <MultiSelect value={this.props.rolespage[i].admittedroles} options={this.props.role}
                            onChange={(e) => { this.props.onChangeMulti(e, i) }}
                            style={{ minWidth: '12em' }}
                            filter={true} filterPlaceholder="Search" placeholder="Choose Role" />

                        <h3>New Data</h3>
                            <Button label="Add" icon="pi pi-plus" 
                              onClick={() => this.props.addData(i)}/>

                        <DataAccord datas={this.props.alldata[i].datas}
                            removeData={(s) => {this.props.removeData(s,i)}}
                            keyword={this.props.keyword}
                            aggtype={this.props.aggtype}
                            aggr={this.props.aggdiv[i]}
                            onChangeData={(e, s) => { this.props.onChangeData(e, s, i) }}
                            onChangeDevice={(e, s) => { this.props.onChangeDevice(e, s, i) }}
                            onChangeKeyword={(e, s) => { this.props.onChangeKeyword(e, s, i) }}
                            onChangeAggType={(e, s) => { this.props.onChangeAggType(e, s, i) }}
                            onChangeAggDiv={(e, s) => { this.props.onChangeAggDiv(e, s, i) }} 
                            onChangeTime={(e,s,n) => {this.props.onChangeTime(e,s,i,n)}}
                            onChangeGran={(e,s,n) => {this.props.onChangeGran(e,s,i,n)}}
                            onChangeChart={(e,s) => {this.props.onChangeChart(e,s,i)}}
                            
                            />
                    </AccordionTab>;
                })}
            </Accordion>



        )

    }
}

export default AccTab;