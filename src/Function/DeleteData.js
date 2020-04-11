/**
 * Delete a specific Data
 * @param {number} n - Key of the data to remove.
 * @param {number} i - Key of the view where is located the data.
 * @param {Object} state - The current state.
 * @return {Object} The new state.
 */
export default function removeData(n, i,state) {
    const agdv = state.aggdiv
    const aggdiv = agdv[i]
    const data = state.views
    const datai = data[i].data
    const alarm = state.alarmval
    const alarm1 = alarm[i]

    alarm1.splice(n, 1)
    aggdiv.splice(n, 1)
    datai.splice(n, 1)


    const setState={
        aggdiv: agdv,
        views: data,
        alarmval: alarm
    }
    return setState

}