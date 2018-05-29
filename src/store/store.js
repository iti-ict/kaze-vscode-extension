import Vue from 'vue';
import Vuex from 'vuex';
import webSettings from '../settings/settings.js'
import validator from '../plugins/validator.js'


Vue.use(Vuex);

function isUndefinedOrEmpty(obj) {
    return obj == undefined || Object.keys(obj).length;

}
function limitName(name, length) {
    if ((name.length) > length) {
        return name.substr(0, length) + '...';
    }
    else
        return name;
}
function parseConnChannels(list){
    return Object.keys(list).map(function (key) {
        if (list[key].role && list[key].endpoint)
            return {
                fullName: list[key].role+":"+list[key].endpoint,
                name: [list[key].role, limitName(list[key].endpoint, 26 - list[key].role.length)],
                role: list[key].role,
                endpoint: list[key].endpoint
            };
        else 
            return {
                fullName: list[key].endpoint,
                name: ['',limitName(list[key].endpoint, 26)],
                endpoint: list[key].endpoint
            };
    });
}
function paseSugestionChannels(list,role) {
    return Object.keys(list).map(function (key) {
        if (role && list[key].name)
            return {
                fullName: role+":"+list[key].name,
                name: [role, limitName(list[key].name, 27 - role.length)],
                label: role + ":" +limitName(list[key].name, 27 - role.length),
                role: role,
                endpoint: list[key].name
            };
        else if (list[key].name)
            return {
                fullName: ":" + list[key].name,
                name: ['', limitName(list[key].name, 27)],
                label: '' + ":" + limitName(list[key].name, 27 ),
                endpoint: list[key].name
            };
    });
}

var maniAPI = {

    callback: (context, todo)=>{

        for(let mutation of todo)
            if(mutation.params)
                context.commit(mutation.name, mutation.params);
            else
                context.commit(mutation.name);

    },
    socket: null,
    setSocket: (url, context)=>{
        maniAPI.socket = io.connect(url, { 'forceNew': true });
        maniAPI.socket.on('status', function (data) {
            context.commit('resetAlerts');


/*             if (context.state.currentManifest>=0){
                maniAPI.getGraph(context.state.manifests[context.state.currentManifest].filePath, context); 
            }
            else */
                maniAPI.getManifests(context);
        });  
    },
    POST: (url, data, context, actions) => {
        Vue.http.post(url, JSON.stringify(data)).then(
            response => {
               // console.log(response)
                if (response.status == 200) {
                    maniAPI.callback(context,actions.success);
                }
                else{
                    maniAPI.callback(context,actions.failure);
                    context.dispatch('addAlert',{ text: "cantupd"});
                }
            },
            response => {
                context.dispatch('addAlert',{text: "cantupd"});
            }
        );
    },
    GET: (url, context, callback) => {
        Vue.http.get(url).then(
            response => {
                if (response.status == 200) {
                    callback(context, response);
                }
                else {
                    context.dispatch('addAlert', {text: "cantread"});
                    context.dispatch('resetService');
                }
            },
            response => {
                context.dispatch('addAlert', {text: "cantread"});
                context.dispatch('resetService');
            }
        );
    },
    updateManifest: (data, path, context, actions) => {
        let manifest = context.state.manifests[context.state.currentManifest];
        maniAPI.POST('/updatemanifest', maniAPI.makeParams(data, path, manifest), context, actions);
    },
    getManifests: (context) => {
        maniAPI.GET('/getmanifests', context, maniAPI.manageRes);
    },
    getGraph: (data, context) => {
        let url = '/getgraph?service='+data;
        maniAPI.GET(url, context, maniAPI.manageRes);
    },
    makeParams:(data,path,file) => {
        return { data: data, path: file.filePath, jsonPath: path };
    },
    manageRes: (context, response)=>{
/*         console.log("========")
        console.log(response.bodyText)
        console.log("========") */
        let res = JSON.parse(response.bodyText);
        if (res.status == 200)
            context.dispatch('setState', res.data)
        if (res.status == 201)
            context.dispatch('setServs', res.data)
        if (res.status == 500){
            context.dispatch('resetService');
            res.path = res.path != undefined ? res.path : '';
            context.dispatch('addAlert', { text: res.error, extra: res.path})
        }
            
    }
} 


// CAMBIAR EL NOMBRE 
function getAllChannels(state, getters,type){
   // console.log(type)
    let list = [];
    let excludeRolChann = {};
    let excludeSrvChann = {};

    let connType = type == 'requires' ? 'depended' : 'provided';
    let service = state.manifests[state.currentManifest];

    // Create exclusions
    for (let conn of service.connectors){
         for (let entry of conn[connType]) {
            if (entry.role){
                excludeRolChann[entry.role + ':' + entry.endpoint] = true;
            } 
        }  
          if (type == 'requires')
              for (let entry of conn[connType]) {
                if (entry.role == undefined) {
                    excludeSrvChann[':' + entry.endpoint] = true;
                }
            }    
    } 
    //  console.log(excludeRolChann)
  
       

    for (let role of service.roles) {
        if (getters.getComponents[role.component]) {
            let comChannels = getters.getComponents[role.component].channels[type];
            if (comChannels && comChannels.length > 0) {
                list = list.concat(paseSugestionChannels(comChannels, role.name));
            }
        }

    }
    if (type == 'requires' && service.channels['provides'])
        list = list.concat(paseSugestionChannels(service.channels['provides'], '')); 



    list = list.filter((x) => { return excludeRolChann[x.fullName] == undefined && excludeSrvChann[x.fullName] == undefined });
    return list;
}



export const store = new Vuex.Store({
    state:{


     // APP
        manifests: {
    /*         service: {
                name: '-',
                configuration: {
                    resources: [],
                    parameters: []
                },
                channels: {},
                connectors: [],
                roles: []
            } */
        },
        mDependencies: {},
        confirm: {
            accept: null,
            deny: null
        },
        alerts: [],
        graph: {},
        showAlertPan: false,
        Settings: webSettings,
        socket: null,
        manifestList: [],
        currentManifest: "",

    // SERVICE 
        currentRole: -1,
        currentConnector: -1,
        roleState: {
            role: { name: '', component: '', resources: [] }, 
            validation: {
                name: { err: false, msg: '' },
                component: { err: false, msg: '' },
            },
            updater: false,
            valid: true
        },
        channelState: {
            channel: { index: -1, inout: 'provides', data:{ name: "", type: "", protocol: "" }},
            validation: {
                name: { err: false, msg: '' },
                type: { err: false, msg: '' },
                protocol: { err: false, msg: '' }
            },
            updater: false,
            valid: true
        },
        serviceState:{
            name: {
                domain: '',
                name: '',
                version:''
            },
            validation: {
                domain: { err: false, msg: '' },
                name: { err: false, msg: '' },
                version: { err: false, msg: '' }
            },
             updater: false,
        },


    // COMPONENT
        componentState:{
            name: {
                domain: '',
                name: '',
                version: ''
            },
            runtime:'',
            validation: {
                runtime: { err: false, msg: '' },

            },
            updater: false
        },
        configurationState: {
            pname:'',
            rname:'',
            resources: [],
            parameters: [],
            validation: {
                pname: { err: false, msg: '' },
                rname: { err: false, msg: '' }
            },
            updater: false
        },




    },
    getters:{

        // APP 
        getAlerts: state =>{
            return state.alerts;
        },
        menuOptions: state => {
            let manifest = state.manifests[state.currentManifest];
            return state.Settings.menuOptions[manifest.type].concat(state.Settings.menuOptions['shared']);
        },
        getSettings: state => {
            return state.Settings;
        },
        alertPan: state => {
            return state.showAlertPan;
        },

        getManifest: state => {
            if(state.currentManifest!='')
                return state.manifests[state.currentManifest];
        },
        blockEditName: state => {
            return true;
        },

        // SERVICE
        getServiceName: state => {
            return {
                name: state.manifests[state.currentManifest].name.split('/')[4],
                domain: state.manifests[state.currentManifest].name.split('/')[2],
                version: state.manifests[state.currentManifest].name.split('/')[5]
             }
        },
        
        // ROLES
        getCurrentRole: state => {
            if (state.currentRole >= 0) {
                let service = state.manifests[state.currentManifest];
                let role = service.roles[state.currentRole];
                state.roleState.role = {
                    name: role.name,
                    component: role.component,
                    resources: (role.resources != undefined) ? Object.keys(role.resources).map(function (key) { return { name: role.resources[key], key: key }; }) : []
                }
            }
            else
                state.roleState.role = { name: '', component: '', resources: [] };

            return state.roleState.role;
        },
        getCurrentRoleIndex: state => {
            return state.currentRole;
        },
        getCurrentRoleResource: (state, getters)  => {
            let service = state.manifests[state.currentManifest];
            if (state.currentRole >= 0) {
                let role = service.roles[state.currentRole]
                let component = getters.getComponents[role.component];
                let resources = component.configuration.resources;

                let rows = [];
                if (resources.length>0){
                    for (let i = 0; i < resources.length; i++) {
                        let depId = role.resources ? role.resources[resources[i].name] : '';
                        rows.push([
                            { id: 'name', value: resources[i].name, type: state.Settings.inlineForms.valueTypes.text },
                            { id: 'resType', value: resources[i].type.match(/resource\/(.+)\//)[1], type: state.Settings.inlineForms.valueTypes.text, fullType: resources[i].type },
                            { id: 'depid', value: depId, type: state.Settings.inlineForms.valueTypes.input }
                        ]);
                    }
                    return { headers: state.Settings.inlineForms.headers.resource, rows: rows};
                }
            }
            return { headers: state.Settings.inlineForms.headers.resource, rows:[]} ;
        },
        getCurrentRoleParams: (state, getters) => {
            let service = state.manifests[state.currentManifest];
            if (state.currentRole >= 0) {
                let role = service.roles[state.currentRole]
                let component = getters.getComponents[role.component];
                return component.configuration.parameters;
            }
            return [];
        },

        // CHANNELS 
        getChannels: state => {
            return state.manifests[state.currentManifest].channels;
        },
        getCurrentConnector: state => {
            return state.currentConnector;
        },

        // CONNECTORS
        getCurrConnDepended: (state, getters) => {
            if (state.currentConnector>=0){
                let connectors =  getters.getConnectors;
                let list = connectors[state.currentConnector].depended;
                return parseConnChannels(list);
            }
        },
        getCurrConnProvided: (state, getters) => {
            if (state.currentConnector >= 0) {
                let connectors = getters.getConnectors;
                let list = connectors[state.currentConnector].provided;
                return parseConnChannels(list);
            }
        },
        getAllConnProvided: (state, getters) => {
            return getAllChannels(state,getters,'provides');
        },
        getAllConnDepended: (state, getters) => {
            return getAllChannels(state, getters,'requires');
        },
        getConnectors: state => {
            let connectors = state.manifests[state.currentManifest].connectors;
            let genId = -1;
            return Object.keys(connectors).map(function (key) {
                return {
                    id: ++genId,
                    name: connectors[key].type.split("/")[4],
                    depended: connectors[key].depended,
                    provided: connectors[key].provided
                };
            });
        },

        // COMPONENTS
        getComponents: state => {
            let components = {};
            Object.keys(state.manifests).map(function (key, index) {
                if (state.manifests[key].type == 'component') {
                    components[key] = state.manifests[key];
                }
                return true;
            })

            return components;
        },

        // RESOURCES
        getResources: state => {


            let res = [];
            Object.keys(state.manifests).map(function (key, index) {
                if (state.manifests[key].type == 'resource') {
                    resources.push(state.manifests[key]);
                }
                return true;
            })

            if(res != undefined){
            let arrRes = Object.keys(res).map(function (key) { return res[key]; });
                return arrRes;
            }
        },

        // PARAMETERS
        getBypassParams: state => {
            if (state.currentRole >= 0) {
                let role = state.manifests[state.currentManifest].roles[state.currentRole];
                return state.manifests[state.currentManifest].configuration.parameters.findIndex(x => x.name == role.name)!=-1;
            }
        }
        
    },
    mutations:{

        // APP
        setState: (state, data) => {
            state.manifests = data;
           // state.graph = data.graph;
        },
        addAlert: (state, data) => {
            state.alerts.push(data);
        },
        deleteAlert: (state, index) => {
            state.alerts.splice(index, 1);
        },
        resetAlerts: (state, index) => {
            state.alerts=[];
        },
        displayAlertPan:(state, diplay) => {
            state.showAlertPan = diplay;
        },
        resetValidation: (state, param) => {
            param.validation[param.key] = false;
        },
        resetAllValidation: (state, validation) => {
            for (var prop in validation) {
               validation[prop].err=false;
            }
        },
        updateAllValidation: (state, param) => {
            param.currState.valid = true;
            for (var prop in param.currState.validation) {
                param.currState.validation[prop] = validator(param.type, prop, param.data[prop]);
             //   console.log(prop)
             //   console.log(param.currState.validation[prop])
                if (param.currState.validation[prop].err)
                    param.currState.valid = false;
            }
           // console.log("VALIDACION: " + param.currState.valid)
        },
        updateValidation: (state, param) => {
            param.validation[param.prop] = validator(param.type, param.prop, param.value);
        },
        setErrValidation: (state, param) => {
            param.validation[param.prop] = {err: true, msg: param.msg};
        },
        setManifest: (state, key) => {
            state.currentManifest = key;
        },
        
        //COMPONENT
        updateCompState: (state, data) => {
            state.componentState[data.key] = data.value;
            state.componentState.updater = !state.componentState.updater;
        },
        updateConfigState: (state, data) => {
            state.configurationState[data.key] = data.value;
            state.configurationState.updater = !state.configurationState.updater;
        },
        updateConfState: (state, data) => {
            state.configurationState[data.key] = data.value;
            state.configurationState.updater = !state.configurationState.updater;
        },
        setComponentRuntime: (state, value) => {
            state.manifests[state.currentManifest].runtime=value;
        },
        setComponentResources:(state, res) => {
            state.manifests[state.currentManifest].configuration.resources = res;
        },
        setComponentParameters: (state, param) => {
            state.manifests[state.currentManifest].configuration.parameters = param;
        },

        // SERVICE 
        setServiceName: (state, name) => {
            state.manifests[state.currentManifest].name = name;
        },
        updateServState: (state, data) => {
            state.serviceState.name[data.key] = data.value;
            state.serviceState.updater = !state.serviceState.updater;
        },
        setServs: (state, data) => {
            state.manifestList = data;
        },
        setDependencies: (state, data) => {
            state.mDependencies = data;
        },
        setStateName: (state, data) => {
            data.state.name = data.param;
        },

        // ROLES
        setRole: (state, index) => {
            if(index<state.manifests[state.currentManifest].roles.length){
                state.currentRole = index;
            
                if (state.currentRole >= 0){
                    let role = state.manifests[state.currentManifest].roles[state.currentRole];
                    state.roleState.role = {
                        name: role.name,
                        component:  role.component,
                        resources: ( role.resources != undefined) ?  Object.keys(role.resources).map(function (key) { return { name: role.resources[key], key: key }; }) : []
                    }
                }
            }

        },
        updateRoles: (state, data) => {
            state.manifests[state.currentManifest].roles.push(data);
        },
        updateRoleName: (state, name) => {
            state.manifests[state.currentManifest].roles[state.currentRole].name = name;
        },
        updateRoleComp:(state,component)=>{          
            state.manifests[state.currentManifest].roles[state.currentRole].component = component;
        },
        updateRoleRes: (state, res) => {
            state.manifests[state.currentManifest].roles[state.currentRole].resources = res;
        },
        updateRoleState: (state, role) => {
            state.roleState.role[role.key] = role.value;
            state.roleState.updater = !state.roleState.updater;
        },
        deleteRole: (state, index) => {
            state.manifests[state.currentManifest].roles.splice(index, 1);
            
        },
        resetRole: (state) => {
            state.currentRole = -1;
            state.roleState.role = { name: '', component: '', resources: [] };
        },

        //CHANNELS
        resetChannel: (state) => {
            state.channelState.channel = { index: -1, inout: 'provides', data: {name:'', type: '', protocol: ''} };
        },
        setChannel: (state, channel) => {
            //console.log(channel)
            state.channelState.channel = channel;
        },
        setChannelDirect: (state, data) => {
            state.channelState.channel.inout = data;
        },
        updateChannels: (state, data) => {
            state.manifests[state.currentManifest].channels[data.direction]=data.channels;
        },
        updateChannState: (state, chann) => {
            state.channelState.channel.data[chann.key] = chann.value;
            state.channelState.updater = !state.channelState.updater;
        },
        //CONNECTORS 
        setConnector: (state, id) => {
            state.currentConnector = id;
        },
        updateConnectors: (state, connectors) => {
             state.manifests[state.currentManifest].connectors=connectors;
        },
        deleteConnList: (state, connList) =>{
            if (state.currentConnector >= 0) {
                let direction = connList.type == state.Settings.listTypes.connectorList.provided ? 'provided' : 'depended';
                state.manifests[state.currentManifest].connectors[state.currentConnector][direction].splice(connList.index, 1);
            }
        },
        resetConnector: (state) => {
            state.currentConnector = -1;
        },
        

        // RESOURCES
        updateServRes: (state, data)=>{
          state.manifests[state.currentManifest].configuration.resources[data.index].name=data.name;
        },
        updateRolRes:(state, data)=>{
            state.manifests[state.currentManifest].roles[state.currentRole][data.name]=data.tag;
        },
        setServRes: (state, data) => {
            state.manifests[state.currentManifest].configuration.resources = data.res;
        },
        setRolRes: (state, data) => {
             state.manifests[state.currentManifest].roles[state.currentRole].resources=data.res;
        },

        // PARAMETERS
        setServParams: (state, data)=>{
            state.manifests[state.currentManifest].configuration.parameters = data;
        }

        
    },
    actions:{

        // APP
        setState(context, data) {
        //    console.log('setState')
            context.commit('setState', data);
        },
        startConnection(context) {
            maniAPI.getManifests(context);
            maniAPI.setSocket('http://localhost:3000', context);
        },
        deleteAlert(context, index) {
            context.commit('deleteAlert', index);
        },
        alertResult(context, result) {      
            context.commit('displayAlertPan', false);
            if (result)
                context.state.confirm.accept();
            else 
                context.state.confirm.deny();
        },
        addAlert(context, err){
            err.extra = err.extra != undefined ? err.extra : '';
            context.commit('addAlert', { text: err.text, type: context.state.Settings.alerts.danger, extra:err.extra });
        },
        

        // COMPONENTS 
        setComponentState(context){
            let component = context.state.manifests[context.state.currentManifest];
            context.commit('updateCompState', { key: 'runtime', value: component.runtime });
            context.commit('updateConfState', { key: 'resources', value: component.configuration.resources });
            context.commit('updateConfState', { key: 'parameters', value: component.configuration.parameters });

            let validation = context.state.componentState.validation;
            context.commit('updateAllValidation', { type: 'component', data: component, currState: context.state.componentState });
            if(context.state.Settings.manifestStructure.elementtype.runtime.enum.filter((x)=> {return x.eslap == component.runtime }).length==0)
                context.commit('setErrValidation', { validation: validation, prop: 'runtime', msg: "wrongruntime" });
            
        },
        updateComponentState(context, data){
            context.commit('updateCompState', data);
            let component = context.state.manifests[context.state.currentManifest];

            let path = '';
            let success = [];
            if(data.key = 'runtime'){
                path = data.key;
                success.push({ name: 'setComponentRuntime', params: data.value })
            }
   
            context.commit('updateAllValidation', { type: 'component', data: component, currState: context.state.componentState });
            maniAPI.updateManifest(data.value, path, context, { success: success, failure: [] });
        },
        updateConfigState(context, data){
            let component = context.state.manifests[context.state.currentManifest];
            context.commit('updateConfigState', data);
            context.commit('resetValidation', {key: data.key, validation: context.state.configurationState.validation });
            
            if (data.key == 'rname' && component.configuration.resources.filter((x) => { return x.name == data.value }).length > 0)
                context.commit('setErrValidation', { validation: context.state.configurationState.validation, prop: 'rname', msg: "dupname" });
            if (data.key == 'pname' && component.configuration.parameters.filter((x) => { return x.name == data.value }).length > 0)
                context.commit('setErrValidation', { validation: context.state.configurationState.validation, prop: 'pname', msg: "dupname" });

            
        },
        addComponentResource(context, data){
            let component = context.state.manifests[context.state.currentManifest];
            context.commit('updateValidation', { type: 'configuration', prop: 'rname', value: data.name, validation: context.state.configurationState.validation }); 

            if (component.configuration.resources.filter((x) => { return x.name == data.name }).length > 0)
                context.commit('setErrValidation', { validation: context.state.configurationState.validation, prop: 'rname', msg: "dupname" });
                

            if (!context.state.configurationState.validation.rname.err){
                let resources = component.configuration.resources.slice();
                resources.push(data);
                maniAPI.updateManifest(resources, 'configuration.resources', context, { success: [
                    { name: 'setComponentResources', params: resources },
                    { name: 'updateConfigState', params: { key: 'resources', value: resources }},
                    { name: 'updateConfigState', params: { key: 'rname', value: '' } }
                ], failure: [] });
                
  
            }
        }, 
        addComponentParameter(context, data) { 
            let component = context.state.manifests[context.state.currentManifest];
            context.commit('updateValidation', { type: 'configuration', prop: 'pname', value: data.name, validation: context.state.configurationState.validation });  
            if (component.configuration.parameters.filter((x) => { return x.name == data.name }).length > 0)
                context.commit('setErrValidation', { validation: context.state.configurationState.validation, prop: 'pname', msg: "dupname" });

            if (!context.state.configurationState.validation.pname.err) {
                let parameters = component.configuration.parameters.slice();
                parameters.push(data);
                maniAPI.updateManifest(parameters, 'configuration.parameters', context, { success:[
                    { name: 'setComponentParameters', params: parameters }, 
                    { name: 'updateConfigState', params: { key: 'parameters', value: parameters }},
                    { name: 'updateConfigState', params: { key: 'pname', value: '' } }
                ], failure: [] });
            }
        },
        deleteComponentResource(context, data) {
            let component = context.state.manifests[context.state.currentManifest];
            let resources = component.configuration.resources.slice();
            resources.splice(data.index,1);
            maniAPI.updateManifest(resources, 'configuration.resources', context, {
                success: [
                    { name: 'setComponentResources', params: resources },
                    { name: 'updateConfigState', params: { key: 'resources', value: resources } }
                ], failure: []
            });

        },
        deleteComponentParameter(context, data) {
            let component = context.state.manifests[context.state.currentManifest];
            let parameters = component.configuration.parameters.slice();
            parameters.splice(data.index,1);
            maniAPI.updateManifest(parameters, 'configuration.parameters', context, {
                success: [
                    { name: 'setComponentParameters', params: parameters },
                    { name: 'updateConfigState', params: { key: 'parameters', value: parameters } }
                ], failure: []
            });
        },



        
        // SERVICE
        resetService(context){
            context.commit('menuVisible', false);
            context.commit('setManifest', '');
        },
        setServs(context, data) {
            if (data && Object.keys(data).length){
                context.commit('setServs', Object.keys(data).map(function (key, index) {
                    return { value: key, label: key, type: data[key].type, id: index };
                    })
                );
            }
 
        //  console.log(JSON.stringify(data))
            let services = [];
            Object.keys(data).map(function (key, index) {
                if (data[key].type == 'service' ){
                    services.push(data[key]);
                }
                return true;
            })

            let mDependencies = {};
            for(let serv of  services){
                for (let role of serv.roles)
                    if (role.component)
                        mDependencies[role.component] = serv.name;
            }
         
            context.commit('setDependencies', mDependencies);
            context.dispatch('setState', data);

            if(context.state.currentManifest.length>0){
                if (data[context.state.currentManifest]!=undefined)  
                    context.dispatch('setManifest', context.state.currentManifest);
                else 
                    context.commit('setManifest', '');
                }
            else
                context.commit('setManifest', '');
        },
        setManifest(context, key){
 
            context.commit('setManifest', key);
            let service = context.state.manifests[key];
            let state = null;


            switch (service.type) {
                case 'service':
                    state = context.state.serviceState;
                    break;
                case 'component':
                    state = context.state.componentState;
                    context.dispatch('setComponentState');
                    break;
            
                default:
                    break;
            }

            if(state!=null)
                context.commit('setStateName', {
                    state: state,
                    param: {
                        name: service.name.split('/')[4],
                        domain: service.name.split('/')[2],
                        version: service.name.split('/')[5]
                    }
                });

           context.commit('updateAllValidation', { type: 'service', data: context.getters.getServiceName, currState: context.state.serviceState });
               //    
                //  maniAPI.getGraph(context.state.manifestList[index].value, context);
            
        },
        updateServiceName(context, fullName) {
            let currName = context.state.manifests[context.state.currentManifest].name;
            let splitname = currName.split('/');
            splitname[4] = fullName.name;   // name
            splitname[2] = fullName.domain; // domain
            splitname[5] = fullName.version;// version
            let path = 'name'
            maniAPI.updateManifest(splitname.join('/'), path, context, { success: [{ name: 'setServiceName', params: splitname.join('/') }], failure: [{ name: 'setServiceName', params: currName }] });

        },
        updateServState(context, data){
            context.commit('updateValidation', { type: 'service', prop: data.key, value: data.value, validation: context.state.serviceState.validation }); 
            context.commit('updateServState', data);
               
        },


        // ROLES
        setRole(context, index){
            //context.commit('resetAllValidation', context.state.roleState.validation);
            context.commit('setRole', index);
            context.commit('updateAllValidation',{ type:'role', data: context.state.manifests[context.state.currentManifest].roles[index], currState: context.state.roleState });
        },
        updateRoleName(context, name) {
            let validation = context.state.roleState.validation; 
            context.dispatch('updateRoleState', {key:'name', value: name});
            let roles = context.state.manifests[context.state.currentManifest].roles.filter((rol, index) => { return rol.name == name && index != context.state.currentRole});
            if (roles.length > 0)
                context.commit('setErrValidation', { validation: validation, prop: 'name', msg: "dupname" });
                       
           // console.log(validation.name.err)
            if (!validation.name.err){

                context.dispatch('updateRoleNameInConnectors', {oldName: context.state.manifests[context.state.currentManifest].roles[context.state.currentRole].name, newName: name});        
                context.dispatch('updateRoleNameInParams', { oldName: context.state.manifests[context.state.currentManifest].roles[context.state.currentRole].name, newName: name });  

                let path = 'roles.' + context.state.currentRole + '.name';
                maniAPI.updateManifest(name, path, context, { success: [{ name: 'updateRoleName', params: name }], failure: [] });
            }
        },
        updateRoleNameInParams(context, data) {

            let parameters = context.state.manifests[context.state.currentManifest].configuration.parameters.slice();
            for (let j = 0; j < parameters.length; j++){
                if (data.oldName == parameters[j].name)
                    parameters[j].name = data.newName;
            }

            let path = 'configuration.parameters';
            maniAPI.updateManifest(parameters, path, context, { success: [{ name: 'setServParams', params: parameters }], failure: [] });             
          
        },
        updateRoleNameInConnectors(context, data) {
            let connectors = context.state.manifests[context.state.currentManifest].connectors.slice();
            let UpdateConnList = (data, list)=>{
                for (let j = 0; j < list.length; j++)
                    if (list[j].role && data.oldName == list[j].role)
                        list[j].role = data.newName;

            }

            for (let i = 0; i < connectors.length; i++) {
                UpdateConnList(data, connectors[i].provided);
                UpdateConnList(data, connectors[i].depended);
            }

            let path = 'connectors';
            maniAPI.updateManifest(connectors, path, context, { success: [{ name: 'updateConnectors', params: connectors }], failure: [] }); 
        },
        addRole(context, role) {
            context.commit('updateAllValidation', { type: 'role', data: role, currState: context.state.roleState });
            if (context.state.roleState.valid){ 
                let path = 'roles';
                let roles = context.state.manifests[context.state.currentManifest].roles.slice();
                roles.push(role);
                maniAPI.updateManifest(roles, path, context, { success: [{ name: 'updateRoles', params: role }, { name: 'setRole', params: roles.length - 1 }], failure: [] });
            }
        },
        updateRoleComp(context, component) {
            context.commit('displayAlertPan', true);
            context.state.confirm.accept = () => {
                context.commit('updateRoleState', { key: 'component', value: component});

                context.dispatch('deleteRoleFromConnectors', context.state.currentRole);
                context.dispatch('deleteRoleFromResouces', context.state.currentRole);
                context.dispatch('deleteRolesResouces', context.state.currentRole);
                context.dispatch('deleteRoleFromParameters', context.state.currentRole);

                let path = 'roles.' + context.state.currentRole + '.component';

                maniAPI.updateManifest(component, path, context, { success: [{ name: 'updateRoleComp', params: component }], failure: [] });
            }
            context.state.confirm.deny = () => {
                context.commit('updateRoleComp', context.state.manifests[context.state.currentManifest].roles[context.state.currentRole].component);
                context.commit('updateRoleState', { key: 'component', value: context.state.manifests[context.state.currentManifest].roles[context.state.currentRole].component });
            }
        },
        updateRoleState(context, role) {
            context.commit('updateRoleState', role);
            context.commit('updateValidation', { type: 'role', prop: role.key, value: role.value, validation: context.state.roleState.validation });    
        },
        deleteRole(context, index) {
            context.commit('displayAlertPan', true);
            context.state.confirm.accept = () => {
                context.commit('resetRole')
                let roles = context.state.manifests[context.state.currentManifest].roles.slice();
                
                context.dispatch('deleteRoleFromConnectors', index);
                context.dispatch('deleteRoleFromResouces', index);
                context.dispatch('deleteRoleFromParameters', index);
                
                // UPDATE ROLES
                roles.splice(index, 1);
                let path = 'roles';
                maniAPI.updateManifest(roles, path, context, { success: [{ name: 'deleteRole', params: index }], failure: [] });
            }
            context.state.confirm.deny = () => {}
        },
        deleteRoleFromConnectors(context, index){
            let path = '';
            let roles = context.state.manifests[context.state.currentManifest].roles.slice();
            let role = roles[index];

            // UPDATE SERVICE CONNECTORS
            let filterConn = function (elem) { return elem.role != undefined && elem.role !== role.name };
            let connectors = context.state.manifests[context.state.currentManifest].connectors.slice();
            for (let i = 0; i < connectors.length; i++) {
                connectors[i].provided = connectors[i].provided.filter(filterConn);
                connectors[i].depended = connectors[i].depended.filter(filterConn);
            }
            path = 'connectors';
            maniAPI.updateManifest(connectors, path, context, { success: [{ name: 'updateConnectors', params: connectors }], failure: [] }); 

        },
        deleteRoleFromResouces(context, index) {
            let path = '';
            let roles = context.state.manifests[context.state.currentManifest].roles.slice();
            let role = roles[index];


            // UPDATE SERVICE RESOURCES
            let resources = context.state.manifests[context.state.currentManifest].configuration.resources;
            let roleRes = {};
            let filterRes = function (elem) { return roleRes[elem.name] == undefined }

            for (let prop in role.resources) {
                roleRes[role.resources[prop]] = true;
            }

            resources = resources.filter(filterRes);

            path = 'configuration.resources';
            maniAPI.updateManifest(resources, path, context, { success: [{ name: 'setServRes', params: { res: resources } }], failure: [] }); 

        }, 
        deleteRolesResouces(context, index) {
            let roles = context.state.manifests[context.state.currentManifest].roles.slice();
            let role = roles[index];

            // UPDATE SERVICE RESOURCES
            role.resources = {};

            context.commit('updateRoleState', { key: 'resources', value: {} });

            let path = 'roles.' + index;
            maniAPI.updateManifest(role, path, context, { success: [{ name: 'updateRoleRes', params: {} }], failure: [] });
        }, 
        deleteRoleFromParameters(context, index) {
            let path = '';
            let roles = context.state.manifests[context.state.currentManifest].roles.slice();
            let role = roles[index];
            
            // UPDATE SERVICE PARAMETERS               
            let filterParam = function (elem) { return elem.name !== role.name };
            let parameters = context.state.manifests[context.state.currentManifest].configuration.parameters.filter(filterParam);
            path = "configuration.parameters"
            maniAPI.updateManifest(parameters, path, context, { success: [{ name: 'setServParams', params: parameters }], failure: [] }); 

        },

        // RESOURCES
        setResource(context, data){
            if (context.state.currentRole>-1){
                let role = context.state.manifests[context.state.currentManifest].roles[context.state.currentRole];
                let sResources = context.state.manifests[context.state.currentManifest].configuration.resources.slice();  
                let sResIndex = sResources.findIndex(x => x["name"] == data.oldTag);
                let path = '';
    
                if (role.resources && role.resources[data.name]){
                    if (data.tag.length>0){
                        // actualizar
                        path = 'configuration.resources.' + sResIndex;
                        sResources[sResIndex].name=data.tag;
                        maniAPI.updateManifest(sResources[sResIndex], path, context, { success: [{ name: 'updateServRes', params: { index: sResIndex, name: data.tag} }], failure: [] }); 

                        path = 'roles.' + context.state.currentRole + '.resources.'+data.name;
                        let rResources = {};
                        Object.assign(rResources, role.resources);
                        rResources[data.name]=data.tag;
                        maniAPI.updateManifest(rResources[data.name], path, context, { success: [{ name: 'updateRolRes', params: { name: data.name, tag: data.tag } }], failure: [] }); 
                    }
                    else{
                        //borrar
                        path = 'configuration.resources';
                        sResources.splice(sResIndex,1);                      
                        maniAPI.updateManifest(sResources, path, context, { success: [{ name: 'setServRes', params: { res: sResources} }], failure: [] }); 

                        path = 'roles' 
                        let rResources = {} ;
                        Object.assign(rResources, role.resources );
                        delete rResources[data.name];
                        let roles = context.state.manifests[context.state.currentManifest].roles.slice();
                        roles[context.state.currentRole].resources = rResources;
                    
                        maniAPI.updateManifest(roles, path, context, { success: [{ name: 'setRolRes', params: { res: rResources } }], failure: [] }); 
                    }
                }
                else if (data.tag.length>0){
                   // crear
                    if (sResIndex < 0) {
                        sResources.push({ name: data.tag, type: data.type });
                        sResIndex = sResources.length;
 
                    }else{
                        sResources[sResIndex] = { name: data.tag, type: data.type };
                    }
                    path = 'configuration.resources';
                    maniAPI.updateManifest(sResources, path, context, { success: [{ name: 'setServRes', params: { res: sResources } }], failure: [] }); 

                    let rResources = {};
                    if (role.resources){
                        Object.assign(rResources, role.resources);
                        rResources[data.name]=data.tag;
                    }
                    else{
                        rResources[(data.name)] = data.tag;
                    }
                    path = 'roles.' + context.state.currentRole + '.resources'
                    maniAPI.updateManifest(rResources, path, context, { success: [{ name: 'setRolRes', params: { res: rResources } }], failure: [] });
                } 
               
               
            }
        },
        

        // PARAMETERS
        changeBypass(context){
            if (context.state.currentRole >= 0) {
                let role = context.state.manifests[context.state.currentManifest].roles[context.state.currentRole];
                let params = context.state.manifests[context.state.currentManifest].configuration.parameters.slice();
                let pIndex = params.findIndex(x => x.name == role.name); 
           //     console.log(pIndex)
                if (pIndex>-1){
                    params.splice(pIndex,1);
                }
                else{
                    params.push({ name: role.name, type: context.state.Settings.manifestStructure.elementtype.parameter.enum.find((x) => x.name == 'json').eslap})
                }
              //  console.log(JSON.stringify(params))
                let path = "configuration.parameters"
                maniAPI.updateManifest(params, path, context, { success: [{ name: 'setServParams', params: params}], failure: [] }); 

            }
        },    

        // CHANNELS 
        setChannel(context, channel) {
            channel.data = Object.assign({}, context.state.manifests[context.state.currentManifest].channels[channel.inout][channel.index]);
            context.commit('setChannel', channel);
            context.commit('updateAllValidation', { type: 'channel', data: context.state.manifests[context.state.currentManifest].channels[channel.inout][channel.index], currState: context.state.channelState });
        },
        deleteChannel(context, channel) {
            channel.data = Object.assign({}, context.state.manifests[context.state.currentManifest].channels[channel.inout][channel.index]);
            context.commit('displayAlertPan', true);
           
            context.state.confirm.accept = () => {
                let channels = context.state.manifests[context.state.currentManifest].channels[channel.inout].slice();
                channels.splice(channel.index, 1);
                let path = 'channels.'+channel.inout;
                maniAPI.updateManifest(channels, path, context, { success: [{ name: 'updateChannels', params: { channels: channels, direction: channel.inout} }], failure: [] });
                context.dispatch('deleteChannelInConnectors', channel);
            }
            context.state.confirm.deny = () => {};
        }, 

        deleteChannelInConnectors(context, channel){
            let service = context.state.manifests[context.state.currentManifest];
            // UPDATE SERVICE CONNECTORS
            if (service.type == 'service') {
                let filterConn = function (elem) { return elem.role != undefined || elem.endpoint != channel.data.name };
                let connectors = service.connectors.slice();
                for (let i = 0; i < connectors.length; i++) {
                    connectors[i].provided = connectors[i].provided.filter(filterConn);
                    connectors[i].depended = connectors[i].depended.filter(filterConn);
                }
                let path = 'connectors';
                maniAPI.updateManifest(connectors, path, context, { success: [{ name: 'updateConnectors', params: connectors }], failure: [] });
            }
        },
        updateCurrentChannel(context, channel) {
            let service = context.state.manifests[context.state.currentManifest];
            let channels = service.channels[channel.inout].slice();
           

            if (channels[channel.index].type != channel.data.type || (channels[channel.index].protocol != channel.data.protocol && channel.data.protocol !='' ) ){
              
                context.commit('displayAlertPan', true);
                context.state.confirm.accept = () => {
                    context.dispatch('deleteChannelInConnectors', channel);
                    channels[channel.index].name = channel.data.name;
                    channels[channel.index].type = channel.data.type;
                    if (channel.data.protocol !='')
                        channels[channel.index].protocol = channel.data.protocol;

                    let path = 'channels.' + channel.inout;
                    maniAPI.updateManifest(channels, path, context, { success: [{ name: 'updateChannels', params: { channels: channels, direction: channel.inout } }], failure: [] });
                }
                context.state.confirm.deny = () => {
                    context.dispatch('updateChannState', { key: 'type', value: channels[channel.index].type });
                    context.dispatch('updateChannState', { key: 'protocol', value: channels[channel.index].protocol });
                };

            }
            else{
                let validation = context.state.channelState.validation;
                let filteredChan;
                context.dispatch('updateChannState', { key: 'name', value: channel.data.name });
                let direct = 'provides';
                filteredChan = context.state.manifests[context.state.currentManifest].channels[direct].filter((chann, index) => { return chann.name == channel.data.name && (direct == channel.inout ? index != channel.index : true) });
                if (filteredChan.length > 0)
                    context.commit('setErrValidation', { validation: validation, prop: 'name', msg: "dupname" });
                
                direct = 'requires';
                filteredChan = context.state.manifests[context.state.currentManifest].channels[direct].filter((chann, index) => { return chann.name == channel.data.name && (direct == channel.inout ? index != channel.index : true) });
                
                if (filteredChan.length > 0)
                    context.commit('setErrValidation', { validation: validation, prop: 'name', msg: "dupname" });

                if (!validation.name.err) {
                    context.dispatch('updateChannelInConnectors', { oldName: channels[channel.index].name, newName: channel.data.name });
                    channels[channel.index].name = channel.data.name;
                    channels[channel.index].type = channel.data.type;
                    if (channel.data.protocol != '')
                        channels[channel.index].protocol = channel.data.protocol;
                    let path = 'channels.' + channel.inout;
                    maniAPI.updateManifest(channels, path, context, { success: [{ name: 'updateChannels', params: { channels: channels, direction: channel.inout } }], failure: [] });
                }
            }
            
        },
        updateChannelInConnectors(context, data) {
            let service = context.state.manifests[context.state.currentManifest];
            if (service.type == 'service') {
                let connectors = service.connectors.slice();
                let UpdateConnList = (data, list) => {
                    for (let j = 0; j < list.length; j++)
                        if (list[j].role == undefined && data.oldName == list[j].endpoint)
                            list[j].endpoint = data.newName;

                }

                for (let i = 0; i < connectors.length; i++) {
                    UpdateConnList(data, connectors[i].provided);
                    UpdateConnList(data, connectors[i].depended);
                }
                let path = 'connectors';
                maniAPI.updateManifest(connectors, path, context, { success: [{ name: 'updateConnectors', params: connectors }], failure: [] }); 
            }

        },     
        setChannelDirect(context, data){
            context.commit('resetChannel')
            context.commit('resetAllValidation', context.state.channelState.validation);
            context.commit('setChannelDirect', data);
        },
        addChannel(context, channel){

            context.commit('updateAllValidation', { type: 'channel', data: channel.data, currState: context.state.channelState });
            if (context.state.channelState.valid) { 
                let channels = context.state.manifests[context.state.currentManifest].channels[channel.inout].slice();
                channels.push(channel.data); 
                let path = 'channels.' + channel.inout; 
                maniAPI.updateManifest(channels, path, context, { success: [{ name: 'updateChannels', params: { channels: channels, direction: channel.inout } }, { name: 'setChannel', params: { index: channels.length - 1, inout: channel.inout, data: channel.data }}], failure: [] });
            }
        },
        updateChannState(context, chann) {
            context.commit('updateChannState', chann);
            context.commit('updateValidation', { type: 'channel', prop: chann.key, value: chann.value, validation: context.state.channelState.validation });
        },

        // CONNECTORS
        setConnector(context, id) {
            context.commit('setConnector', id);
        },
        deleteConnector(context, id) {
            let connectors = context.state.manifests[context.state.currentManifest].connectors.slice();
            connectors.splice(id, 1);
            let path = 'connectors';
            maniAPI.updateManifest(connectors, path, context, { success: [{ name: 'updateConnectors', params: connectors }, { name: 'resetConnector'}], failure: [] }); 

        },  
        addConnector(context, connector) {
            let connectors = context.state.manifests[context.state.currentManifest].connectors.slice(); 
            connectors.push(connector);
            let path = 'connectors';
            maniAPI.updateManifest(connectors, path, context, { success: [{ name: 'updateConnectors', params: connectors }, { name: 'setConnector', params: connectors.length-1 }], failure: [] });
        },
        addConnection(context, data) {
            let connectors = context.state.manifests[context.state.currentManifest].connectors.slice();
            connectors[context.state.currentConnector][data.direction].push(data.element);
            let path = 'connectors';
            maniAPI.updateManifest(connectors, path, context, { success: [{ name: 'updateConnectors', params: connectors }], failure: [] });
        },    
 

        deleteConnList(context, connList) {
            if (context.state.currentConnector >= 0) {
                let direction = connList.type == context.state.Settings.listTypes.connectorList.provided ? 'provided' : 'depended';
                let connChannels = context.state.manifests[context.state.currentManifest].connectors[context.state.currentConnector][direction].slice();
                connChannels.splice(connList.index, 1);
                let path = 'connectors.'+context.state.currentConnector + "." + direction;
                maniAPI.updateManifest(connChannels, path, context, { success: [{ name: 'deleteConnList', params: connList }], failure: [] }); 
            }
        },


       
        // ROUTING ACTIONS 
        cleanCurrent(context, data) {
            data = data.split("#")[1];
            switch (data) {
                case context.state.Settings.modalProps.roles.id:
                    context.commit('resetRole')
                    context.commit('resetAllValidation', context.state.roleState.validation);
                    break;
                case context.state.Settings.modalProps.channels.id:
                    context.commit('resetChannel')
                    context.commit('resetAllValidation', context.state.channelState.validation);
                    break;
                case context.state.Settings.modalProps.connectors.id:
                    context.commit('resetConnector')
                    break;
                default:
                    break;
            }
        }
    }
})

