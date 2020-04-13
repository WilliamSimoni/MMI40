import React, { Component } from 'react';

import { Accordion, AccordionTab } from 'primereact/accordion';
import { Chips } from 'primereact/chips';
import { Dropdown } from 'primereact/dropdown';
import { SelectButton } from 'primereact/selectbutton';
import { Spinner } from 'primereact/spinner';
import { Button } from 'primereact/button';
import { InputSwitch } from 'primereact/inputswitch';

import data from '../Data/const.json'
import chartprops from '../Data/chartProps.json'

import NameComp from './NameComp.js'

import 'primereact/resources/themes/nova-light/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';

import ChartProps from './CharProp';

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
            items: items
        }
    }

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

    maxth(s) {
        if (this.props.alarm[s] === false) return 0
        else return this.props.datas[s].alarm.maxthreshold
    }
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
                            backgroundColor: "rgba(39, 36, 36, 0.3)",
                        }
                        return <AccordionTab key={s} header={row2.title}>

                            <Button style={{ float: "right" }} icon="pi pi-times"
                                className="p-button-danger"
                                onClick={() => this.props.removeData(s)}
                                tooltip="Delete Data" />
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
                            <NameComp name="Type"
                                tip="Type of the data, Choose one value from the list" />
                            <Dropdown value={row2.type}
                                options={this.state.items}

                                onChange={(e) => this.props.onChangeDType(e, s)}
                                placeholder="Select data type" />


                            <NameComp name="Device"
                                tip="List of device. Multiple value, press ENTER to confirm each value" />
                            <Chips
                                value={row2.variables.datasource.device}
                                onChange={(e) => this.props.onChangeDevice(e, s)}></Chips>

                            <NameComp name="Keyword"
                                tip="List of tag. Multiple value, press ENTER to confirm each value" />
                            <Chips value={row2.variables.datasource.keyword}
                                onChange={(e) => this.props.onChangeKeyword(e, s)}
                                placeholder="Select a Keyword" />
                           <NameComp name="Alarm"
                                tip="Set the alarm for this data" />
                            <InputSwitch checked={this.props.alarm[s]}
                                onChange={(e) => this.props.onChangeAlarmval(e, s)} />
                            <div style={stylealarm}>
                            <NameComp name="Max Threshold" dim={4}
                                tip="Maximum threshold for the alarm" />
                                <Spinner value={this.maxth(s)}
                                    onChange={(e) => this.props.onChangeAlarmth(e, s, 1)}
                                    min={this.minth(s)} />
                                <NameComp name="Min Threshold" dim={4}
                                tip="Minimum threshold for the alarm" />
                                <Spinner value={this.minth(s)}
                                    onChange={(e) => this.props.onChangeAlarmth(e, s, 0)}
                                    max={this.maxth(s)} />
                            </div>



                            <h3>Aggregation</h3>
                            <NameComp name="Type" dim={4}
                                tip="Type of the aggreagation function. Choose one of the value" />
                            <Dropdown value={row2.variables.aggregationfunction.type}
                                options={this.props.aggtype}
                                onChange={(e) => this.props.onChangeAggType(e, s)}
                                placeholder="Select a type aggregation" />
                            <NameComp name="Partition" dim={4}
                                tip="How to divide the data into the aggregation function, Select one" />
                            <SelectButton value={this.props.aggr[s]} options={this.props.keyword}
                                onChange={(e) => this.props.onChangeAggDiv(e, s)} />

<NameComp name="Time Interval"
                                tip="Time interval of the data to be displayed" />
                            <Spinner value={row2.timeinterval.split(" ")[0]}
                                onChange={(e) => this.props.onChangeTime(e, s, 0)}
                                min={1} max={400} />

                            <Dropdown value={row2.timeinterval.split(" ")[1]}
                                options={time}
                                onChange={(e) => this.props.onChangeTime(e.value, s, 1)}
                                placeholder="Select a time period" />

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
                            <NameComp name="Type" dim={4}
                                tip="Type of chart you want to use for this data" />
                            <Dropdown value={row2.chart.type}
                                options={charts}
                                onChange={(e) => this.addChart(e.value, s)}
                                placeholder="Select a chart" />

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
