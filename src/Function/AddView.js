/**
 * Create a new view
 * @param {Object} state - The state before the new view.
 * @return {Object} The new state.
 */
export default function AddView(state) {
    const aggdiv = state.aggdiv
    const nome = state.name
    const roles = state.rolespage
    const views = state.views
    const alarm = state.alarmval

    const nalarm = []
    const inse = ['NewPage'+nome.length]
    const rol = []
    const agd = []
    const data = {
        data: [],
    }

    aggdiv.push(agd)
    nome.push(inse)
    roles.push(rol)
    views.push(data)
    alarm.push(nalarm)

    const setstate= {
        aggdiv: aggdiv,
        name: nome,
        rolespage: roles,
        views: views,
        alarmval: alarm
    }

return setstate

}
