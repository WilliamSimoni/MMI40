/**
 * Transform a YAML object in the new state
 * @param {Object} value - The YAML Object.
 * @return {Object} The new state.
 */
export default function UploadFile(value) {
    let alarm = []
    const na = value.views;
    let pages = []
    let addmi = []
    let data = []
    let aggdiv = []
    for (let i = 0; i < na.length; i++) {

        pages.push([na[i].viewname])
        addmi.push({ admittedroles: na[i].admittedroles })
        const k = na[i].data
        const l = k.length
        const alarm2 = []
        const aggdivm = []
        for (let h = 0; h < l; h++) {
            if (k[h].alarm === undefined) alarm2.push(false)
            else alarm2.push(true)


            const agg = k[h].variables.aggregationfunction.aggregated
            const div = k[h].variables.aggregationfunction.divided
            if (agg.length === 2) {
                if (agg.indexOf("device") === 0) {
                    aggdivm.push('agg1')
                    continue;
                } else {
                    aggdivm.push('agg2')
                    continue;
                }
            }
            if (div.length === 2) {
                aggdivm.push('div')
                continue;
            }
            if (agg.length === 1) {
                if (agg.includes("device")) {
                    aggdivm.push('aggdiv')
                    continue;
                } else {
                    aggdivm.push('divagg')
                    continue;
                }
            }
        }
        const f = {
            data: k
        }
        aggdiv.push(aggdivm)
        data.push(f)
        alarm.push(alarm2)
    }
   
    const nuser = value.users.length
    for (let d = 0; d < nuser; d++) {
        const us = value.users[d]
        const s = [us.name]
        us.name = s
    }

    const state ={
        aggdiv: aggdiv,
        rolespage: addmi,
        projectname: [value.projectname],
        name: pages,

        alarmval: alarm,
        roles: value.roles,
        template: value.template,
        views: data,

        users: value.users,
        nuser: nuser,
        visible: false

    }
    return state
}