import React, { Component } from 'react';
import { Button } from 'primereact/button';

/**
 * Component tha create the header and the (?)instruction for a field
 */
class NameComp extends Component {

dimension(n) {
    switch(n) {
        case 1: return <h1 style={{display: "inline-block"}}>{this.props.name}</h1>
        case 2: return <h2 style={{display: "inline-block"}}>{this.props.name}</h2>
        case 3: return <h3 style={{display: "inline-block"}}>{this.props.name}</h3>
        case 4: return <h4 style={{display: "inline-block"}}>{this.props.name}</h4>
        case 5: return <h5 style={{display: "inline-block"}}>{this.props.name}</h5>
        case 6: return <h6 style={{display: "inline-block"}}>{this.props.name}</h6>
        default: return <h3 style={{display: "inline-block"}}>{this.props.name}</h3>
    }
}
     render() {
         return (
             <div> 
                 {this.dimension(this.props.dim)}
                 <Button style={{display: "inline-block"}} 
                 icon="pi pi-question"
                 className="p-button-rounded p-button-secondary"
                 tooltip={this.props.tip}
                 disabled="disabled"></Button>
             </div>
         )
     }

}

export default NameComp