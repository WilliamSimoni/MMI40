import React, { Component } from 'react';
import { InputText } from 'primereact/inputtext';
import {Button} from 'primereact/button';

 class InputTextDemo extends Component {

    constructor(props){
        super(props)
        this.state = {
            value: this.props.value
        }
    }

    


    render() {
        const k="Enter the "+this.props.name;
        return (
            <div>
                 <h3>{this.props.name}</h3>
                 <InputText tooltip={k} value={this.state.value} onChange={(e) => this.setState({value: e.target.value})} />
                 <Button icon="pi pi-check" onClick={() => this.props.onChange1(this.state.value)} />
            </div>
           
        )
    }
}

export default InputTextDemo