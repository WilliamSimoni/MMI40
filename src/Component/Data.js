import React, { Component } from 'react';

import { Accordion, AccordionTab } from 'primereact/accordion';
import { Chips } from 'primereact/chips';
import { Dropdown } from 'primereact/dropdown';
import { SelectButton } from 'primereact/selectbutton';
import { Spinner } from 'primereact/spinner';
import { Button } from 'primereact/button';
import { InputSwitch } from 'primereact/inputswitch';
import { Dialog } from 'primereact/dialog';

import data from '../Data/const.json'
import chartprops from '../Data/chartProps.json'

import NameComp from './NameComp.js'

import ChartProps from './CharProp';

/**
 * 
 * Component that holds the fields of a data
 */

class Data extends Component {

    constructor(props) {
        super(props)
        const items = data.datatype.map((key) => {
            return {
                label: key.name,
                value: key.name

            }
        })
        this.state = {
            items: items,
            displayDialog: false
        }
    }

    /**
     * Function that search among all types of data and return the properties
     * 
     * @param {String} e Type of the chart
     * @param {number} s Key of the data
     */
    addChart(e, s) {
        let res = {}
        for (let i = 0; i < chartprops.length; i++) {
            if (chartprops[i].type === e) {
                res = chartprops[i]
                break;
            }
        }
        this.props.onChangeChart(res, s)
    }

    /**
     * Return the value that max threshold alarm should show
     * @param {number} s key of the data
     */
    maxth(s) {
        if (this.props.alarm[s] === false) return 0
        else return this.props.datas[s].alarm.maxthreshold
    }

    /**
     * Return the value that min threshold alarm should show
     * @param {number} s key of the data
     */
    minth(s) {
        if (this.props.alarm[s] === false) return 0
        else return this.props.datas[s].alarm.minthreshold
    }

    render() {

        const time = data.time
        const charts = data.charts

        const titles = []
        const dt = this.props.datas
        for (let i = 0; i < dt.length; i++) {
            if (dt[i].title === "") titles.push([])
            else titles.push([dt[i].title])
        }

        return (
            <div style={{ marginTop: '10px' }}>
                <Accordion>
                    {this.props.datas.map((row2, s) => {

                        const stylealarm = {
                            display: (this.props.alarm[s]) ? true : "none",
                            marginLeft: "10px",
                        }

                        return <AccordionTab key={s} header={row2.title}>
                            {/*  Delete button*/ }
                            <Button style={{ float: "right" }} icon="pi pi-times"
                                className="p-button-danger"
                                onClick={() => { this.setState({ displayDialog: true }) }}
                                tooltip="Delete Data" />
                            <Dialog header="Delete Data"
                                visible={this.state.displayDialog}
                                onHide={() => { this.setState({ displayDialog: false }) }} >
                                <h3>Are you sure you want to delete data {row2.title}?</h3>
                                <Button label="Yes" onClick={() => {
                                    this.setState({ displayDialog: false })
                                    this.props.removeData(s)
                                }} />
                                <Button style={{ float: "right" }} label="No" onClick={() => { this.setState({ displayDialog: false }) }} />
                            </Dialog>

                            {/*Title of the data */}
                            <NameComp name="Title"
                                tip="Name of this data. Single value. Press ENTER to confirm the value,
                                 must be different from the other view names"/>
                            <Chips value={titles[s]}
                                max={1}
                                onChange={(e) => {
                                    titles[s] = e.value
                                    if (e.value.length === 0) this.props.onChangeData("", s)
                                    else this.props.onChangeData(titles[s][0], s)
                                }}></Chips>

                                {/*Type of the data */}
                            <NameComp name="Type"
                                tip="Type of the data, Choose one value from the list" />
                            <Dropdown value={row2.type}
                                options={this.state.items}

                                onChange={(e) => this.props.onChangeDType(e, s)}
                                placeholder="Select data type" />

                            {/*List of device */}
                            <NameComp name="Device"
                                tip="List of device. Multiple value, press ENTER to confirm each value" />
                            <Chips
                                value={row2.variables.datasource.device}
                                onChange={(e) => this.props.onChangeDevice(e, s)}></Chips>
                            {/*List of keyword */}
                            <NameComp name="Keyword"
                                tip="List of tag. Multiple value, press ENTER to confirm each value" />
                            <Chips value={row2.variables.datasource.keyword}
                                onChange={(e) => this.props.onChangeKeyword(e, s)} />

                                {/*set the alarm */}
                            <NameComp name="Alarm"
                                tip="Set the alarm for this data" />
                            <InputSwitch checked={this.props.alarm[s]}
                                onChange={(e) => this.props.onChangeAlarmval(e, s)} />
                             {/*visible only if alarm is true */}
                            <div style={stylealarm}>
                                {/*Max threshold of the alarm */}
                                <NameComp name="Max Threshold" dim={4}
                                    tip="Maximum threshold for the alarm" />
                                <Spinner value={this.maxth(s)}
                                    onChange={(e) => this.props.onChangeAlarmth(e, s, 1)}
                                    min={this.minth(s)} />
                                    {/*Min threshold of the alarm */}
                                <NameComp name="Min Threshold" dim={4}
                                    tip="Minimum threshold for the alarm" />
                                <Spinner value={this.minth(s)}
                                    onChange={(e) => this.props.onChangeAlarmth(e, s, 0)}
                                    max={this.maxth(s)} />
                            </div>



                            <h3>Aggregation</h3>
                            {/*Aggregation function type */}
                            <NameComp name="Type" dim={4}
                                tip="Type of the aggreagation function. Choose one of the value" />
                            <Dropdown value={row2.variables.aggregationfunction.type}
                                options={this.props.aggtype}
                                onChange={(e) => this.props.onChangeAggType(e, s)}
                                placeholder="Select a type aggregation" />
                                {/*Aggregation partition */}
                            <NameComp name="Partition" dim={4}
                                tip="How to divide the data into the aggregation function, Select one" />
                            <SelectButton value={this.props.aggr[s]} options={this.props.keyword}
                                onChange={(e) => this.props.onChangeAggDiv(e, s)} />

                            {/* Time interval*/}
                            <NameComp name="Time Interval"
                                tip="Time interval of the data to be displayed" />
                            <Spinner value={row2.timeinterval.split(" ")[0]}
                                onChange={(e) => this.props.onChangeTime(e, s, 0)}
                                min={1} max={400} />

                            <Dropdown value={row2.timeinterval.split(" ")[1]}
                                options={time}
                                onChange={(e) => this.props.onChangeTime(e.value, s, 1)}
                                placeholder="Select a time period" />

                             {/* Granularity*/}
                            <NameComp name="Granularity"
                                tip="Granularity of the data" />
                            <Spinner value={row2.granularity.split(" ")[0]}
                                onChange={(e) => this.props.onChangeGran(e, s, 0)}
                                min={1} max={400} />
                            <Dropdown value={row2.granularity.split(" ")[1]}
                                options={time}
                                onChange={(e) => this.props.onChangeGran(e.value, s, 1)}
                                placeholder="Select a granularity period" />

                            <h3>Charts</h3>
                            {/*Type of the chart */}
                            <NameComp name="Type" dim={4}
                                tip="Type of chart you want to use for this data" />
                            <Dropdown value={row2.chart.type}
                                options={charts}
                                onChange={(e) => this.addChart(e.value, s)}
                                placeholder="Select a chart" />
                            {/*Component ChartProps, show the properties of the chart chosen*/}
                            <ChartProps chart={row2.chart}
                                onChangeChartProps={(e) => this.props.onChangeChartProps(e, s)}></ChartProps>
                        </AccordionTab>

                    })}

                </Accordion>
            </div>
        )
    }

}

export default Data;
