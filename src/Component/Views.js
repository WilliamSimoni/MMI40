import React, { Component } from 'react';

import { Accordion, AccordionTab } from 'primereact/accordion';
import { MultiSelect } from 'primereact/multiselect';
import { Button } from 'primereact/button';
import { Chips } from 'primereact/chips'

import Data from './Data.js'

import 'primereact/resources/themes/nova-light/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';


/* *Class tha show all the View and their information */ 
class AccTab extends Component {

    render() {
        return (
            <Accordion>
                {/* * List of all view */}
                {this.props.names.map((row, i) => {
                    return <AccordionTab key={i} header={row}>
                        {/* * Button to delete the view */}
                        <Button style={{ float: "right" }}
                            icon="pi pi-times" className="p-button-danger"
                            onClick={() => this.props.cancelButton(i)} />

                            {/* * InputText for the viewName */}
                        <h3>View Name</h3>
                        <Chips value={row}
                            onChange={(e) => this.props.onChange1(e.target.value, i)}
                            max={1}></Chips>
                        {/* * MultiSelect for roles */}
                        <h3>Select roles</h3>
                        <MultiSelect value={this.props.rolespage[i].admittedroles} options={this.props.role}
                            onChange={(e) => { this.props.onChangeMulti(e, i) }}
                            style={{ minWidth: '12em' }}
                            filter={true} filterPlaceholder="Search" placeholder="Choose Role" />
                           {/* * Button to add new data */}
                        <h3>New Data</h3>
                        <Button label="Add" icon="pi pi-plus"
                            onClick={() => this.props.addData(i)}></Button>
                         {/* * Component data */}
                        <Data datas={this.props.views[i].data}
                            removeData={(s) => { this.props.removeData(s, i) }}
                            alarm={this.props.alarm[i]}
                            keyword={this.props.keyword}
                            aggtype={this.props.aggtype}
                            aggr={this.props.aggdiv[i]}
                            onChangeData={(e, s) => { this.props.onChangeData(e, s, i) }}
                            onChangeDevice={(e, s) => { this.props.onChangeDevice(e, s, i) }}
                            onChangeKeyword={(e, s) => { this.props.onChangeKeyword(e, s, i) }}
                            onChangeAggType={(e, s) => { this.props.onChangeAggType(e, s, i) }}
                            onChangeAggDiv={(e, s) => { this.props.onChangeAggDiv(e, s, i) }}
                            onChangeTime={(e, s, n) => { this.props.onChangeTime(e, s, i, n) }}
                            onChangeGran={(e, s, n) => { this.props.onChangeGran(e, s, i, n) }}
                            onChangeChart={(e, s) => { this.props.onChangeChart(e, s, i) }}
                            onChangeDType={(e, s) => { this.props.onChangeDType(e, s, i) }}
                            onChangeAlarmval={(e, s) => { this.props.onChangeAlarmval(e, s, i) }}
                            onChangeAlarmth={(e,s,val) => {this.props.onChangeAlarmth(e, s,i,val)}}
                            onChangeChartProps={(e,s)=> this.props.onChangeChartProps(e,s,i)}
                            

                        />
                    </AccordionTab>;
                })}
            </Accordion>



        )

    }
}

export default AccTab;