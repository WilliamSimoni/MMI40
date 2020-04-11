import React, { Component } from 'react';

import 'primereact/resources/themes/nova-light/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import { Dropdown } from 'primereact/dropdown';

import algquest from './Data/AlgQuestion.json'

/* *
   * Class tha contains the algorithm
   * Algorithm proposes some questions regarding the data 
   * and based on the choices it returns one or more types of graph 
   * to choose to better visualize the data
*/
class AlgChart extends Component {

    constructor() {
        super()
        this.state = {
            q1: ""
        }
    }

/**
 * Select the new question based on the previous answer
 * @param {String} i - String of the new question.
 * @return {Element} Element of the new question to display.
 */
    question(i) {
        switch (i) {
            case "q1":
                return <div>
                    <h3>Che informazione vuoi trasmettere all'utente?</h3>
                    <Dropdown value={this.state.q1}
                        options={algquest.q1}
                        onChange={(e) => this.setState({ q1: e.value })}
                        placeholder="Seleziona la risposta" />
                    {this.question(this.state.q1)}
                </div>
            case "q2":
                return <div>Dato che volete evidenziare il singolo valore assunto da una variabile
                i due grafici che puoi utilizzare sono:
                • Icon Chart
                  • Gauge Chart</div>

            case "q3":
                return <div><h3>Come intendi confrontare i valori delle variabili?</h3>
                    <Dropdown value={this.state.q3}
                        options={algquest.q3}
                        onChange={(e) => this.setState({ q3: e.value })}
                        placeholder="Seleziona la risposta" />
                    {this.question(this.state.q3)}
                </div>

            case "q4":
                return <div><h3>Quante sono le variabili?</h3>
                    <Dropdown value={this.state.q4}
                        options={algquest.q4}
                        onChange={(e) => this.setState({ q4: e.value })}
                        placeholder="Seleziona la risposta" />
                    {this.question(this.state.q4)}
                </div>

            case "q5":
                return <div><h3>Quanti sono i periodi/momenti?</h3>
                    <Dropdown value={this.state.q5}
                        options={algquest.q5}
                        onChange={(e) => this.setState({ q5: e.value })}
                        placeholder="Seleziona la risposta" />
                    {this.question(this.state.q5)}
                </div>

            case "q6":
                return <div>Vuoi mostrare differenze o affinità tra i valori di varie variabili indipendenti in
                vari momenti o periodi. Questo significa che il grafico più adatto è un Line Chart.</div>
            case "q7":
                return <div><h3>Quante sono le variabili?</h3>
                    <Dropdown value={this.state.q7}
                        options={algquest.q7}
                        onChange={(e) => this.setState({ q7: e.value })}
                        placeholder="Seleziona la risposta" />
                    {this.question(this.state.q7)}
                </div>
            case "q8":
                return <div>Vuoi mostrare differenze o affinità tra i valori di una o due variabili
                indipendenti in un determinato momento o periodo. Questo significa che il
                grafico più adatto è un Column Chart.</div>
            case "q9":
                return <div>Vuoi mostrare differenze o affinità tra i valori di varie variabili indipendenti un
                determinato momento o periodo. Questo significa che il grafico più adatto è un
                Bar Chart.</div>
            case "q10":
                return <div><h3>Come vuoi che sia la composizione?</h3>
                    <Dropdown value={this.state.q10}
                        options={algquest.q10}
                        onChange={(e) => this.setState({ q10: e.value })}
                        placeholder="Seleziona la risposta" />
                    {this.question(this.state.q10)}
                </div>
            case "q11":
                return <div>Vuoi mostrare differenze o affinità tra i valori di varie variabili indipendenti in
                pochi momenti o periodi. Questo significa che il grafico più adatto è un
                Column Chart.</div>
                case "q12":
                    return <div>Vuoi mostrare differenze o affinità tra i valori di varie variabili indipendenti in
                    molti momenti o periodi. Questo significa che il grafico più adatto è un
                    Line Chart.</div>
                case "q13":
                    return <div><h3>Quante sono le composizioni che vuoi mostrare?</h3>
                        <Dropdown value={this.state.q13}
                            options={algquest.q13}
                            onChange={(e) => this.setState({ q13: e.value })}
                            placeholder="Seleziona la risposta" />
                        {this.question(this.state.q13)}
                    </div>
            case "q14":
                return <div>Vuoi mostrare un unica composizioni di variabili in un determinato momento.
                Il grafico più adatto è un Pie Chart.</div>
            case "q15":
                return <div>Vuoi mostrare più composizioni di variabili in un determinato momento. Il
                grafico più adatto è uno 100% Stacked Bar Chart o uno 100% Stacked Column
                Chart.</div>
            case "q16":
                return <div><h3>Quanti sono i periodi/momenti?</h3>
                    <Dropdown value={this.state.q16}
                        options={algquest.q16}
                        onChange={(e) => this.setState({ q16: e.value })}
                        placeholder="Seleziona la risposta" />
                    {this.question(this.state.q16)}
                </div>
            case "q17":
                return <div><h3>Cosa vuoi mostrare nello specico?</h3>
                    <Dropdown value={this.state.q17}
                        options={algquest.q17}
                        onChange={(e) => this.setState({ q17: e.value })}
                        placeholder="Seleziona la risposta" />
                    {this.question(this.state.q17)}
                </div>
            case "q18":
                return <div>Vuoi mostrare la composizione di variabili in pochi momenti evidenziando
                come ogni parte della composizione contribuisce sull'intera composizione. Il
                grafico migliore è un 100% Stacked Column Chart o 100% Stacked Area Chart.</div>
            case "q19":
                return <div>Vuoi mostrare la composizione di variabili in pochi momenti non solo
                mostrando come le parti contribuiscono alla composizione, ma anche come
                l'intera composizione varia nel tempo. Il grafico migliore è uno Stacked
                Column Chart o Stacked Area Chart.</div>
             case "q20":
                return <div><h3>Cosa vuoi mostrare nello specico?</h3>
                    <Dropdown value={this.state.q20}
                        options={algquest.q20}
                        onChange={(e) => this.setState({ q20: e.value })}
                        placeholder="Seleziona la risposta" />
                    {this.question(this.state.q20)}
                </div>
            case "q21":
                return <div>Vuoi mostrare la composizione di variabili in molti momenti evidenziando
                come ogni parte della composizione contribuisca sull'intera composizione. Il
                grafico migliore è un 100% Stacked Area Chart.</div>
            case "q22":
                return <div>Vuoi mostrare la composizione di variabili in molti momenti evidenziando
                come ogni parte della composizione contribuisca sull'intera composizione. Il
                grafico migliore è uno Stacked Area Chart.</div>
            case "q23":
                return <div><h3>Quanti sono i periodi/momenti?</h3>
                    <Dropdown value={this.state.q23}
                        options={algquest.q23}
                        onChange={(e) => this.setState({ q23: e.value })}
                        placeholder="Seleziona la risposta" />
                    {this.question(this.state.q23)}
                </div>
            case "q24":
                return <div><h3>Come sono relazionate le variabili?</h3>
                    <Dropdown value={this.state.q24}
                        options={algquest.q24}
                        onChange={(e) => this.setState({ q24: e.value })}
                        placeholder="Seleziona la risposta" />
                    {this.question(this.state.q24)}
                </div>
            case "q25":
                return <div>Vuoi mostrare le relazioni che intercorrono fra i valori di due variabili. Il
                grafico per queste evenienze è un Scatter Plot.</div>
            case "q26":
                return <div>Vuoi mostrare le relazioni che intercorrono fra i valori di tre variabili. Il grafico
                per queste evenienze èe un Bubble Chart.</div>
            case "q27":
                return <div>Vuoi mostrare le relazioni che intercorrono fra i valori di tante variabili. Non
                c'è un grafico consigliato.</div>
            case "q28":
                return <div><h3>Quante sono le variabili?</h3>
                    <Dropdown value={this.state.q28}
                        options={algquest.q28}
                        onChange={(e) => this.setState({ q28: e.value })}
                        placeholder="Seleziona la risposta" />
                    {this.question(this.state.q28)}
                </div>
            case "q29":
                return <div>Mostrare la distribuzione di una variabile? Nulla di più semplice con un
                Histogram.</div>
            case "q30":
                return <div>Vuoi mostrare la distribuzione di due variabili. Quindi dovresti usare uno
                Scatter Plot.</div>
             case "q31":
                return <div><h3>Quante sono le variabili?</h3>
                    <Dropdown value={this.state.q31}
                        options={algquest.q31}
                        onChange={(e) => this.setState({ q31: e.value })}
                        placeholder="Seleziona la risposta" />
                    {this.question(this.state.q31)}
                </div>
            case "q32":
                return <div>Vuoi confrontare i valori di poche variabili in pochi periodi di tempo. Per cui
                ti consiglio un semplice Column Chart.</div>
            case "q33":
                return <div>Vuoi confrontare i valori di molte variabili in pochi periodi di tempo. Per cui
                ti consiglio un Line Chart.</div>
            case "q34":
                return <div>Vuoi confrontare i valori di alcune variabili in molti periodi di tempo. Per cui
                ti consiglio un Line Chart.</div>
            default:
                return ""
        }


    }


    render() {
        return (
            <div>

                {this.question("q1")}
            </div>
        )
    }
}

export default AlgChart;