import React, { Component } from 'react';
import YAML from 'js-yaml';
import './TopBar.css';
import logo from '../wizard.png';

/**
 * Top Navigation bar
 */
class TopBar extends Component {

    /* *Constructor */
    constructor(props) {
        super(props);
        this.fileReader= null;
        this.handleFileRead = this.handleFileRead.bind(this);
        this.handleFileChosen = this.handleFileChosen.bind(this);

        this.textInput = null;
        this.setTextInputRef = element => {
            this.textInput = element;
        };
        this.focusTextInput = () => {
            if (this.textInput) {
                this.textInput.click();
            }
        };

    }

/**
 * Transform the file read as a Text in a YAML Object
 */
    handleFileRead = () => {
        const content = this.fileReader.result;

        try {
            const obj = YAML.load(content)
            this.props.uploadFile(obj);
        } catch(e) {
            console.log(e)
            this.props.uploadFile(null)
        }
        
    }
    /**
 * Read a file as Text
 * @param {File} file - Key of the view where add the new data.
 */
    handleFileChosen = (file) => {
        this.fileReader = new FileReader();
        this.fileReader.onloadend = this.handleFileRead;
        this.fileReader.readAsText(file);


    }
    render() {
        return (
            <div className="topnav">
                {/* * Logo */}
                <img src={logo} alt="logo"></img>
                {/* * Button to download */}
                <button
                    className="link-button"
                    onClick={() => this.props.downloadFile()}>
                    <i className="pi pi-download"></i>
                    Download
                </button>

{/* * Input to select the file */}
                <input
                    type="file"
                    className="inputfile"
                    ref={this.setTextInputRef}
                    onChange={e => this.handleFileChosen(e.target.files[0])}
                />
{/* * Button to upload */}
                <button
                    className="link-button"
                    onClick={this.focusTextInput}>
                    <i className="pi pi-upload"></i>
                    Upload
                </button>
 {/* * Button to open the chart algorithm */}
                <button
                    className="link-button"
                    onClick={()=>this.props.openSide(true)}>
                    <i className="pi pi-arrow-right"></i>
                    Algoritmo
                </button>
            </div>
        );
    }

}
export default TopBar;