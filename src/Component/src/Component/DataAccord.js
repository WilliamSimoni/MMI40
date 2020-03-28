import React, { Component } from 'react';
import { Accordion, AccordionTab } from 'primereact/accordion';
import { Chips } from 'primereact/chips';

import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { SelectButton } from 'primereact/selectbutton';
import { Spinner } from 'primereact/spinner';
import { Button } from 'primereact/button';
import {Dialog} from 'primereact/dialog';

import ChartProps from './CharProp.js'

import 'primereact/resources/themes/nova-light/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';

class DataAccord extends Component {

    constructor(props) {
        super(props)
        this.state = {
            time1: [],
            time2: []
        }
    }





    render() {
        const time = [
            { label: 'Empty', value: ' ' },
            { label: 'Seconds', value: 'seconds' },
            { label: 'Minutes', value: 'minutes' },
            { label: 'Hours', value: 'hours' },
            { label: 'Days', value: 'days' },
            { label: 'Months', value: 'months' },
            { label: 'Years', value: 'years' },
        ];
        const charts = [
            { label: 'Area', value: 'area' },
            { label: 'Bar', value: 'bar' },
            { label: 'Bubble', value: 'bubble' },
            { label: 'Column', value: 'column' },
            { label: 'Compass', value: 'compass' },
            { label: 'Donut', value: 'donut' },
            { label: 'Gauge', value: 'gauge' },
            { label: 'Histogram', value: 'histogram' },
            { label: 'Icon', value: 'icon' },
            { label: 'Line', value: 'line' },
            { label: 'Map', value: 'map' },
            { label: 'Pie', value: 'pie' },
            { label: 'Stacked', value: 'stacked' },
            { label: 'Scatter', value: 'scatter' },
        ];
        return (
            <div style={{ marginTop: '10px' }}>
                <Accordion>
                    {this.props.datas.map((row2, s) => {
                        return <AccordionTab key={s} header={row2.title}>

                            <Button icon="pi pi-times" className="p-button-danger"
                                onClick={() => this.props.removeData(s)} />
                            <h3>Title</h3>
                            <InputText autoFocus type="text" value={row2.title}
                                onChange={(e) => this.props.onChangeData(e, s)} />
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
                                onChange={(e) => this.props.onChangeChart(e.value, s)}
                                placeholder="Select a chart" />


                            <Button label="Show" icon="pi pi-info-circle" onClick={(e) => this.setState({ visible: true})} />
                            <Dialog header={'Props for Chart '+row2.chart.type +'in '+row2.title} visible={this.state.visible} style={{ width: '50vw' }} modal={true} onHide={() => this.setState({ visible: false })}>
                                  <ChartProps chart={row2.chart.type}/>
                             </Dialog>
                        </AccordionTab>

                    })}

                </Accordion>
            </div>
        )
    }

}

export default DataAccord;