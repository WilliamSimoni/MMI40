import React, { Component } from 'react';

import { Accordion, AccordionTab } from 'primereact/accordion';
import { MultiSelect } from 'primereact/multiselect';
import { Button } from 'primereact/button';
import { Chips } from 'primereact/chips'

import Data from './Data.js'
import NameComp from './NameComp.js'

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
                            onClick={() => this.props.cancelButton(i)} 
                            tooltip="Delete View"/>

                            {/* * InputText for the viewName */}
                            <NameComp name="View Name" 
                                tip="Press ENTER to confirm the value, must be different from the other view names"/>
                        <Chips value={row}
                            onChange={(e) => this.props.onChange1(e.target.value, i)}
                            max={1}></Chips>
                        {/* * MultiSelect for roles */}
                        <NameComp name="View Role" 
                                tip="Roles that can access this view; choose one or more roles "/>
                        <MultiSelect value={this.props.rolespage[i].admittedroles} options={this.props.role}
                            onChange={(e) => { this.props.onChangeMulti(e, i) }}
                            style={{ minWidth: '12em' }}
                            filter={true} filterPlaceholder="Search" placeholder="Choose Role" />
                           {/* * Button to add new data */}
                           <NameComp name="Data" 
                                tip="List of all data of this view; Press 'Add Data' to add a new data"/>
                        <Button label="Add Data" icon="pi pi-plus"
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