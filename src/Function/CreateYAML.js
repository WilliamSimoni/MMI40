import data from '../Data/const.json'

/**
 * Create the yaml object
 * @param {Object} datainput - the state that contains all the information to create the yaml
 * @return {Object} The yaml object.
 */
export default function CreateYAML(datainput) {
    
    const yamlcomp = {
        projectname: (datainput.projectname[0]===undefined) ? "example" :datainput.projectname[0]            ,
        template: (datainput.template===null) ?"standard" :datainput.template,
        roles: /*(datainput.roles.length===0) ? undefined : */datainput.roles,
        views: [],
        users: /*(datainput.users.length===0) ? undefined : */datainput.users,
        datatype: data.datatype

    }


    for (let d = 0; d < datainput.nuser; d++) {
        const h = yamlcomp.users[d]
        const s = h.name[0]
        h.name = s

    }
    let pages = []

    for (let i = 0; i < datainput.views.length; i++) {
        let dat = datainput.views[i].data


        pages.push({
            viewname: datainput.name[i][0],
            admittedroles: datainput.rolespage[i].admittedroles,
            data: dat
        })

    }
    yamlcomp.views = pages

    return yamlcomp
}