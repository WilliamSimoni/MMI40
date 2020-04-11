/**
 * Transform a specific string for Aggregation Function in the correct way to display it in the yaml 
 * @param {Event} e - Event that contain the string to transform
 * @param {number} s - Key of the data.
 * @param {number} i - Key of the view.
 * @param {Object} state - The current state.
 * @return {Object} The new state.
 */
export default function aggPartiton(e, s, i,state) {
    const views = state.views
    const aggdivm = views[i].data[s].variables.aggregationfunction
    aggdivm.aggregated = []
    aggdivm.divided = []

    const k = state.aggdiv
    const val = e.target.value
    k[i][s] = val

    switch (val) {
        case "agg1":
            aggdivm.aggregated = ['device', 'keyword'];
            break;
        case "agg2":
            aggdivm.aggregated = ['keyword', 'device'];
            break;
        case "aggdiv":
            aggdivm.aggregated = ['device'];
            aggdivm.divided = ['keyword'];
            break;
        case "divagg":
            aggdivm.aggregated = ['keyword'];
            aggdivm.divided = ['device'];
            break;
        case "div":
            aggdivm.divided = ['device', 'keyword'];
            break;
        default:
            aggdivm.aggregated = ['device', 'keyword'];
    }

    const setState={
        views: views,
        aggdiv: k
    }
    return setState

}