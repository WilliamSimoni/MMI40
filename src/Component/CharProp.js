import React, { Component } from 'react';

import 'primereact/resources/themes/nova-light/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Spinner } from 'primereact/spinner';
import {InputSwitch} from 'primereact/inputswitch';

class ChartProps extends Component {


    propsofChart() {
        const valpos = [
            { label: 'Top', value: 'top' },
            { label: 'Bottom', value: 'bottom' },
            { label: 'Right', value: 'right' },
            { label: 'Left', value: 'left' },
        ]

        const legendval = [
            { label: 'Top', value: 'top' },
            { label: 'Bottom', value: 'bottom' },
            { label: 'Right', value: 'right' },
            { label: 'Left', value: 'left' },
            { label: 'None', value: '' },

        ]
        const linetype =[
            { label: 'Point', value: 'point' },
            { label: 'Basic', value: 'basic' },
            { label: 'Brush', value: 'brush' },
        ]
        if (this.props.chart.type === '') {
            return <h4>No Chart selected</h4>

        }

        if (this.props.chart.type === 'area') {
            return <h4>No props for {this.props.chart.type} chart</h4>

        }
        if (this.props.chart.type === 'bar') {
            return <div>
                <h4>Legend position</h4>
                <Dropdown name="legendPosition" value={this.props.chart.legendPosition}
                    options={legendval}
                    onChange={(e) => this.props.onChangeChartProps(e)}
                    placeholder="Select legend position" />

            </div>

        }
        if (this.props.chart.type === 'bubble') {
            return <div><h4>Legend position</h4>
                <Dropdown name="legendPosition" value={this.props.chart.legendPosition}
                    options={legendval}
                    onChange={(e) => this.props.onChangeChartProps(e)}
                    placeholder="Select legend position" />
                <h4>Trend line</h4>
                <InputSwitch name="trendLine" checked={this.props.chart.trendLine} 
                onChange={(e) => this.props.onChangeChartProps(e)} />
            </div>

        }
        if (this.props.chart.type === 'column') {
            return <div>
                <h4>Legend position</h4>
                <Dropdown name="legendPosition" value={this.props.chart.legendPosition}
                    options={legendval}
                    onChange={(e) => this.props.onChangeChartProps(e)}
                    placeholder="Select legend position" />

            </div>
        }
        if (this.props.chart.type === 'compass') {
            return <div>
                <h4>Min value</h4>
                <Spinner name="min" value={this.props.chart.min}
                    size={15}
                    onChange={(e) => this.props.onChangeChartProps(e)}
                    />
                <h4>Max value</h4>
                <Spinner name="max" value={this.props.chart.max}
                    size={15}
                    onChange={(e) => this.props.onChangeChartProps(e)}
                     />
                <h4>Start angle</h4>
                <Spinner name="startAngle" value={this.props.chart.startAngle}
                    size={15}
                    onChange={(e) => this.props.onChangeChartProps(e)}
                    min={-180} max={0} />
                <h4>End angle</h4>
                <Spinner name="endAngle" value={this.props.chart.endAngle}
                size={15}
                onChange={(e) => this.props.onChangeChartProps(e)}
                min={0} max={180} />


            </div>
        }
        if (this.props.chart.type === 'donut') {
            return <div>
                <h4>Legend position</h4>
                <Dropdown name="legendPosition" value={this.props.chart.legendPosition}
                    options={legendval}
                    onChange={(e) => this.props.onChangeChartProps(e)}
                    placeholder="Select legend position" />

            </div>
        }
        if (this.props.chart.type === 'gauge') {
            return <div>
            <h4>Min value</h4>
            <Spinner name="min" value={this.props.chart.min}
                size={15}
                onChange={(e) => this.props.onChangeChartProps(e)}
                />
            <h4>Max value</h4>
            <Spinner name="max" value={this.props.chart.max}
                size={15}
                onChange={(e) => this.props.onChangeChartProps(e)}
                 />
            <h4>Start angle</h4>
            <Spinner name="startAngle" value={this.props.chart.startAngle}
                size={15}
                onChange={(e) => this.props.onChangeChartProps(e)}
                min={-180} max={0} />
            <h4>End angle</h4>
            <Spinner name="endAngle" value={this.props.chart.endAngle}
            size={15}
            onChange={(e) => this.props.onChangeChartProps(e)}
            min={0} max={180} />


        </div>
        }
        if (this.props.chart.type === 'histogram') {
            return <h4>No props for {this.props.chart.type} chart</h4>
        }
        if (this.props.chart.type === 'icon') {
            return <div>
                <h4>Name Icon</h4>
                <InputText name="icon" type="text" value={this.props.chart.icon}
                    onChange={(e) => this.props.onChangeChartProps(e)} />
                <h4>Value position</h4>
                <Dropdown name="valuePosition" value={this.props.chart.valuePosition}
                    options={valpos}
                    onChange={(e) => this.props.onChangeChartProps(e)}
                    placeholder="Select value position" />
            </div>
        }
        if (this.props.chart.type === 'line') {
            return <div>
            <h4>Legend position</h4>
            <Dropdown name="legendPosition" value={this.props.chart.legendPosition}
                options={legendval}
                onChange={(e) => this.props.onChangeChartProps(e)}
                placeholder="Select legend position" />
            <h4>Line type</h4>
            <Dropdown name="lineType" value={this.props.chart.lineType}
                options={linetype}
                onChange={(e) => this.props.onChangeChartProps(e)}
                placeholder="Select a line type" />

        </div>
        }
        if (this.props.chart.type === 'map') {
            return <h4>No props for {this.props.chart.type} chart</h4>
        }
        if (this.props.chart.type === 'pie') {
            return <div>
            <h4>Legend position</h4>
            <Dropdown name="legendPosition" value={this.props.chart.legendPosition}
                options={legendval}
                onChange={(e) => this.props.onChangeChartProps(e)}
                placeholder="Select legend position" />

        </div>
        }
        if (this.props.chart.type === 'stacked') {
            return <h4>No props for {this.props.chart.type} chart</h4>
        }
        if (this.props.chart.type === 'scatter') {
            return <div><h4>Legend position</h4>
            <Dropdown name="legendPosition" value={this.props.chart.legendPosition}
                options={legendval}
                onChange={(e) => this.props.onChangeChartProps(e)}
                placeholder="Select legend position" />
            <h4>Trend line</h4>
            <InputSwitch name="trendLine" checked={this.props.chart.trendLine} 
            onChange={(e) => this.props.onChangeChartProps(e)} />
        </div>
        }




    }

    render() {

        return (
            <div>
                {this.propsofChart()}
            </div>
        )
    }
}

export default ChartProps