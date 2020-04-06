import React, { Component } from 'react';
import YAML from 'js-yaml';
import './TopBar.css';
import logo from '../zer.png';


class TopBar extends Component {
    constructor(props) {
        super(props);
        // eslint-disable-next-line no-unused-vars
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


    handleFileRead = (e) => {
        const content = this.fileReader.result;

        const obj = YAML.load(content)
        this.props.handleState(obj);
    }
    handleFileChosen = (file) => {
        this.fileReader = new FileReader();
        this.fileReader.onloadend = this.handleFileRead;
        this.fileReader.readAsText(file);


    }
    render() {
        return (
            <div className="topnav">
                <img src={logo} alt="logo"></img>
                <p>ZYC</p>
                <button
                    className="link-button"
                    onClick={() => this.props.downloadFile()}>
                    <i className="pi pi-download"></i>
                    Download
                </button>

                <input
                    type="file"
                    className="inputfile"
                    ref={this.setTextInputRef}
                    onChange={e => this.handleFileChosen(e.target.files[0])}
                />

                <button
                    className="link-button"
                    onClick={this.focusTextInput}>
                    <i className="pi pi-upload"></i>
                    Upload
                </button>
            </div>
        );
    }

}
export default TopBar;