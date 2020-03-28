import React, { Component } from 'react';

import 'primereact/resources/themes/nova-light/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';

class ChartProps extends Component {

    constructor(props) {
        super(props)
       

        
        this.state = {
            valpos: 'right'
        }
    }

    propsofChart() {
        const valpos=[
            { label: 'Top', value: 'top' },
            { label: 'Bottom', value: 'bottom' },
            { label: 'Right', value: 'right' },
            { label: 'Left', value: 'left' },
        ]

        if(this.props.chart==='') {
            return <h2>No Chart selected</h2>
        
        }
     
        if(this.props.chart==='area') {
            return <h2>No props for area</h2>
        
        } 
        if(this.props.chart==='bar') {
            return <h2>No props for {this.props.chart}</h2>
        
        }
        if(this.props.chart==='bubble') {
            return <h2>No props for {this.props.chart}</h2>
        
        }
        if(this.props.chart==='column') {
            return <h2>No props for {this.props.chart}</h2>        
        }
        if(this.props.chart==='compass') {
            return <h2>No props for {this.props.chart}</h2>        
        }
        if(this.props.chart==='donut') {
            return <h2>No props for {this.props.chart}</h2>        
        }
        if(this.props.chart==='gauge') {
            return <h2>No props for {this.props.chart}</h2>        
        }
        if(this.props.chart==='histogram') {
            return <h2>No props for {this.props.chart}</h2>        
        }
        if(this.props.chart==='icon') {
            return <div>
                  <h4>Icon</h4>   
                  <InputText autoFocus type="text" value={this.state.icon}
                                onChange={(e) => this.setState({icon:e.value})}/> 
                  <h4>value position</h4>
                  <Dropdown value={this.state.valpos}
                                options={valpos}
                                onChange={(e) => this.setState({valpos:e.value})}
                                placeholder="Select a type aggregation" />
                 

                  </div>    
        }
        if(this.props.chart==='line') {
            return <h2>No props for {this.props.chart}</h2>        
        }
        if(this.props.chart==='map') {
            return <h2>No props for {this.props.chart}</h2>        
        }
        if(this.props.chart==='pie') {
            return <h2>No props for {this.props.chart}</h2>        
        }
        if(this.props.chart==='stacked') {
            return <h2>No props for {this.props.chart}</h2>        
        }
        if(this.props.chart==='scatter') {
            return <h2>No props for {this.props.chart}</h2>        
        }
        


        
    }

    render() {

        return(
            <div>
               {this.propsofChart()}
            </div>
        )
    }
}

export default ChartProps