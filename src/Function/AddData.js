/**
 * Create a new Data
 * @param {number} i - Key of the view where add the new data.
 * @param {Object} state - The state before the new data.
 * @return {Object} The new state.
 */
export default function addData(i,state) {

    const agdv = state.aggdiv
    const aggdiv = agdv[i]
    const data = state.views
    const datai = data[i].data

    const alarm = state.alarmval
    const alarm1 = alarm[i]
    alarm1.push(false)
    const agd = []


    const name2 = {
        title: "Newdata"+datai.length,
        type: "",
        alarm: undefined,
        variables: {
            datasource: {
                device: [],
                keyword: []

            },
            aggregationfunction: {
                type: '',
                aggregated: [],
                divided: [],
            }
        },
        timeinterval: '5 seconds',
        granularity: '1',
        chart: {
            type: ''
        },

    }

    datai.push(name2)
    aggdiv.push(agd)


    data[i].view = datai

    const setState ={
        aggdiv: agdv,
        views: data,
        alarmval: alarm
    }

    return setState

}