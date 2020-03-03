import React, { Component } from 'react';
import { Accordion ,AccordionTab } from 'primereact/accordion';
import ButtonBlank from "./ButtonBlank.js"

import 'primereact/resources/themes/nova-light/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';

class AccTab extends Component {

   

    createTable = () => {
        let table = []
        
       
        
        for (let i = 0; i < this.props.number; i++) {
          const z=<ButtonBlank name="Page name" value={this.props.names[i]} onChange1={(e) => this.props.onChange1(e,i)}></ButtonBlank>
          
        table.push(<AccordionTab header={this.props.names[i]}>{z}</AccordionTab>)
        }
        return table
      }
    
   
    render() {
    
        return(
            <Accordion>
                {this.createTable()}
            </Accordion>
                
            
                        
        )

    }
}

export default AccTab;