/**
 * Delete a specific View
 * @param {number} n - Key of the view to remove.
 * @param {Object} state - The current state.
 * @return {Object} The new state.
 */
export default function cancelPage(n,state) {
    const aggdiv = state.aggdiv
    const nome = state.name
    const roles = state.rolespage
    const views = state.views
    const alarm = state.alarmval

    aggdiv.splice(n, 1)
    nome.splice(n, 1)
    roles.splice(n, 1)
    views.splice(n, 1)
    alarm.splice(n, 1)


    const setState={
        aggdiv: aggdiv,
        name: nome,
        rolespage: roles,
        views: views,
        alarmval: alarm
    } 

    return setState

}