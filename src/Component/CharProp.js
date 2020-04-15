import React, { Component } from 'react';

import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Spinner } from 'primereact/spinner';
import { InputSwitch } from 'primereact/inputswitch';

import NameComp from './NameComp.js'
import constData from '../Data/const.json'

/**
 * Component that shows the properties of the chosen chart
 */

class ChartProps extends Component {

    /**
     * Show the properties of a chart chosen on chart type
     * @returns {Component} The properties
     * 
     */

    propsofChart() {
        const valpos = constData.valuePosition
        const legendval = constData.legendPosition
        const linetype = constData.lineType

        switch (this.props.chart.type) {
            case "area":
            case "histogram": 
            case "map": 
            case "stacked" :return <h4>No props for {this.props.chart.type} chart</h4>

            case "bar": 
            case "column" :
            case "donut" :
            case "pie" :return <div>
                <NameComp name="Legend Position" dim={4}
                                tip="Where to place the legend of the chart"/>
                <Dropdown name="legendPosition" value={this.props.chart.legendPosition}
                    options={legendval}
                    onChange={(e) => this.props.onChangeChartProps(e)}
                    placeholder="Select legend position" />

            </div>

            case "bubble":
            case "scatter": return <div>
                <NameComp name="Legend Position" dim={4}
                                tip="Where to place the legend of the chart"/>
                <Dropdown name="legendPosition" value={this.props.chart.legendPosition}
                    options={legendval}
                    onChange={(e) => this.props.onChangeChartProps(e)}
                    placeholder="Select legend position" />
                <NameComp name="Trend Line" dim={4}
                                tip="indicates if you want to show the trend line of the swarms of points."/>
                <InputSwitch name="trendLine" checked={this.props.chart.trendLine}
                    onChange={(e) => this.props.onChangeChartProps(e)} />
            </div>

            case "compass":
            case "gauge":return <div>
            <NameComp name="Min Value" dim={4}
                                tip="Value that represents the 0% of the chart"/>
            <Spinner name="min" value={this.props.chart.min}
                size={15}
                onChange={(e) => this.props.onChangeChartProps(e)}
            />
            <NameComp name="Max Value" dim={4}
                                tip="Value that represents the 100% of the chart"/>
            <Spinner name="max" value={this.props.chart.max}
                size={15}
                onChange={(e) => this.props.onChangeChartProps(e)}
            />
            <NameComp name="Start Angle" dim={4}
                                tip="Angle from which to start the semicircle (y axis)."/>
            <Spinner name="startAngle" value={this.props.chart.startAngle}
                size={15}
                onChange={(e) => this.props.onChangeChartProps(e)}
                min={-180} max={0} />
            <NameComp name="End Angle" dim={4}
                                tip="Angle from which to end the semicircle (y axis)."/>
            <Spinner name="endAngle" value={this.props.chart.endAngle}
                size={15}
                onChange={(e) => this.props.onChangeChartProps(e)}
                min={0} max={180} />
        </div>

        case "icon" :
            return <div>
                <NameComp name="Name Icon" dim={4}
                                tip="File name of the icon to show."/>
                <InputText name="icon" type="text" value={this.props.chart.icon}
                    onChange={(e) => this.props.onChangeChartProps(e)} />
                <NameComp name="Value Position" dim={4}
                                tip="Indicates where the value is placed relative to the icon."/>
                <Dropdown name="valuePosition" value={this.props.chart.valuePosition}
                    options={valpos}
                    onChange={(e) => this.props.onChangeChartProps(e)}
                    placeholder="Select value position" />
            </div>

            case "line":
                return <div>
                <NameComp name="Legend Position" dim={4}
                                tip="Where to place the legend of the chart"/>
                <Dropdown name="legendPosition" value={this.props.chart.legendPosition}
                    options={legendval}
                    onChange={(e) => this.props.onChangeChartProps(e)}
                    placeholder="Select legend position" />
                <NameComp name="Line type" dim={4}
                                tip="The line type of the chart"/>
                <Dropdown name="lineType" value={this.props.chart.lineType}
                    options={linetype}
                    onChange={(e) => this.props.onChangeChartProps(e)}
                    placeholder="Select a line type" />

            </div>

            default: return <h4>No Chart selected</h4>
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