/**
 * Transform a YAML object in the new state
 * @param {Object} value - The YAML Object.
 * @return {Object} The new state or null if catch an error.
 */
export default function UploadFile(value) {
    try {
        let alarm = []
        const views = value.views;
        let pages = []
        let addmi = []
        let data = []
        let aggdiv = []

        //for all view
        for (let i = 0; i < views.length; i++) {

            pages.push([views[i].viewname])
            addmi.push({ admittedroles: views[i].admittedroles })
            const k = views[i].data
            const l = k.length
            const alarm2 = []
            const aggdivm = []

            //for all data in view i
            for (let h = 0; h < l; h++) {
                //read alarm
                if (k[h].alarm === undefined) alarm2.push(false)
                else alarm2.push(true)

                //read agregation function
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

        //read user
        const nuser = value.users.length
        for (let d = 0; d < nuser; d++) {
            const us = value.users[d]
            const s = [us.name]
            us.name = s
        }

        const state = {
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
    } catch (e) {
        return null
    }
}