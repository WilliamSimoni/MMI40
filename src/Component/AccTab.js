import React, { Component } from 'react';
import { Accordion, AccordionTab } from 'primereact/accordion';
import { MultiSelect } from 'primereact/multiselect';
import { Button } from 'primereact/button';
import { Chips } from 'primereact/chips';
import { SplitButton } from 'primereact/splitbutton';

import DataAccord from './DataAccord.js'
import data from '../Data/const.json'

import 'primereact/resources/themes/nova-light/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';

class AccTab extends Component {

    constructor(props) {
        super(props)
        this.state = {
            name: [],
        }
    }

    render() {

        return (
            <Accordion>

                {this.props.names.map((row, i) => {
                    const items = data.datatype.map((key) => {
                        return {
                            label: key.name,
                            icon: 'pi pi-plus',
                            command: () => this.props.addData(i, key.name)
                        }
                    })
                    return <AccordionTab key={i} header={row}>
                        <Button style={{ float: "right" }}
                            icon="pi pi-times" className="p-button-danger"
                            onClick={() => this.props.cancelButton(i)} />
                        <h3>Page Name</h3>
                        <Chips value={row}
                            onChange={(e) => this.props.onChange1(e.target.value, i)}
                            max={1}></Chips>

                        <h3>Select roles</h3>
                        <MultiSelect value={this.props.rolespage[i].admittedroles} options={this.props.role}
                            onChange={(e) => { this.props.onChangeMulti(e, i) }}
                            style={{ minWidth: '12em' }}
                            filter={true} filterPlaceholder="Search" placeholder="Choose Role" />

                        <h3>New Data</h3>
                        <SplitButton label="Add" icon="pi pi-plus"
                            onClick={() => this.props.addData(i, "empty")} model={items}></SplitButton>

                        <DataAccord datas={this.props.alldata[i].datas}
                            removeData={(s) => { this.props.removeData(s, i) }}
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

                        />
                    </AccordionTab>;
                })}
            </Accordion>



        )

    }
}

export default AccTab;