import React, { Component } from 'react';
import { Accordion, AccordionTab } from 'primereact/accordion';
import { Chips } from 'primereact/chips';

import { Dropdown } from 'primereact/dropdown';
import { SelectButton } from 'primereact/selectbutton';
import { Spinner } from 'primereact/spinner';
import { Button } from 'primereact/button';
import data from '../Data/const.json'
import chartprops from '../Data/chartProps.json'

import 'primereact/resources/themes/nova-light/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';

class DataAccord extends Component {

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
                        return <AccordionTab key={s} header={row2.title}>

                            <Button style={{ float: "right" }} icon="pi pi-times"
                                className="p-button-danger"
                                onClick={() => this.props.removeData(s)} />
                            <h3>Title</h3>
                            <Chips value={titles[s]}
                                max={1}
                                onChange={(e) => {
                                    titles[s] = e.value
                                    if (e.value.length === 0) this.props.onChangeData("", s)
                                    else this.props.onChangeData(titles[s][0], s)
                                }}></Chips>
                            <h3>Type</h3>
                            <Dropdown value={row2.type}
                                options={this.state.items}
                                onChange={(e) => this.props.onChangeDType(e, s)}
                                placeholder="Select data type" />


                            <h3>Device</h3>
                            <Chips
                                value={row2.variables.datasource.device}
                                onChange={(e) => this.props.onChangeDevice(e, s)}></Chips>

                            <h3>Keyword</h3>
                            <Chips value={row2.variables.datasource.keyword}
                                onChange={(e) => this.props.onChangeKeyword(e, s)}
                                placeholder="Select a Keyword" />
                            <h3>Aggregation</h3>
                            <h4>Type</h4>
                            <Dropdown value={row2.variables.aggregationfunction.type}
                                options={this.props.aggtype}
                                onChange={(e) => this.props.onChangeAggType(e, s)}
                                placeholder="Select a type aggregation" />
                            <h4>Partition</h4>
                            <SelectButton value={this.props.aggr[s]} options={this.props.keyword}
                                onChange={(e) => this.props.onChangeAggDiv(e, s)} />

                            <h3>Time Interval</h3>
                            <Spinner value={row2.timeinterval.split(" ")[0]}
                                onChange={(e) => this.props.onChangeTime(e, s, 0)}
                                min={1} max={100} />

                            <Dropdown value={row2.timeinterval.split(" ")[1]}
                                options={time}
                                onChange={(e) => this.props.onChangeTime(e.value, s, 1)}
                                placeholder="Select a time period" />

                            <h3>Granularity</h3>
                            <Spinner value={row2.granularity.split(" ")[0]}
                                onChange={(e) => this.props.onChangeGran(e, s, 0)}
                                min={1} max={10} />
                            <Dropdown value={row2.granularity.split(" ")[1]}
                                options={time}
                                onChange={(e) => this.props.onChangeGran(e.value, s, 1)}
                                placeholder="Select a granularity period" />
                            <h3>Charts</h3>
                            <h4>Type</h4>
                            <Dropdown value={row2.chart.type}
                                options={charts}
                                onChange={(e) => this.addChart(e.value, s)}
                                placeholder="Select a chart" />
                        </AccordionTab>

                    })}

                </Accordion>
            </div>
        )
    }

}

export default DataAccord;
