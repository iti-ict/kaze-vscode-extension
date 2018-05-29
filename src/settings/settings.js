
var alerts = {
    success: 'alert-success',
    info: 'alert-info',
    warning: 'alert-warning',
    danger: 'alert-danger'
}

var  modalProps =  {
    roles: {
        id: "modalRoles", icon: "fa fa-tags", title:"Roles"
    },
    channels:{
        id: "modalChannels", icon: "glyphicon glyphicon-transfer", title: "Channels"
    } ,
    connectors:{
        id: "modalConnectors", icon: "fa fa-chain", title: "Connectors"
    },
    runtimes: {
        id: "modalRuntimes", icon: 'fa fa-dashboard', title: "Runtime"
    },
    configuration: {
        id: "modalConfiguration", icon: 'fa fa-gear', title: "Configuration"
    },


}; 


var listTypes = {
    channel:{
        provides: 'ch-prov',
        requires:'ch-req'
    },
    role:'role',
    res:'resource',
    connector:'conn',
    connectorList:{
        provided: 'connlist-prov',
        depended: 'connlist-dep'
    },
    component:{
        resources: 'c-resources',
        parameters: 'c-parameters'
    },
    default: 'def'
}

var listProps = {
    'ch-prov': {
        target: "#" + modalProps.channels.id, icon: true, iconImg: 'fa-arrow-left', fullSize: '6', btnsSize: '4', channelType: 'provides', buttons: { edit: true, delete: true, save: false }, rowSelection: false
    },
    'ch-req': {
        target: "#" + modalProps.channels.id, icon: true, iconImg: 'fa-arrow-right', fullSize: '6', btnsSize: '4', channelType: 'requires', buttons: { edit: true, delete: true, save: false  }, rowSelection: false
    },
    'role': {
        target: "#" + modalProps.roles.id, icon: false, fullSize: '8', btnsSize: '4', buttons: { edit: true, delete: true, save: false  }, rowSelection: false
    },
    'conn': {
        target: "", icon: false, fullSize: '8', btnsSize: '4', buttons: { edit: false, delete: true, save: false  }, rowSelection: true
    },
    'connlist-prov': {
        target: "", icon: false, fullSize: '10', btnsSize: '2', buttons: { edit: false, delete: true, save: false  }, rowSelection: false
    },
    'connlist-dep': {
        target: "", icon: false, fullSize: '10', btnsSize: '2', buttons: { edit: false, delete: true, save: false  }, rowSelection: false
    },
    'c-resources': {
        target: "", icon: false, fullSize: '3', extraCol:'8', btnsSize: '1', buttons: { edit: false, delete: true, save: false }, rowSelection: false
    },
    'c-parameters': {
        target: "", icon: false, fullSize: '3', extraCol: '8', btnsSize: '1', buttons: { edit: false, delete: true, save: false }, rowSelection: false
    },
    'def': {
        target: "", icon: false, fullSize: '8', btnsSize: '4', buttons: { edit: true, delete: true, save: false }, rowSelection: false
    }
}



var inlineForms = {
    headers: {
        resource: ['Name','Type','DeployTag']
    },
    types:{
        resource: 'resource'
    },
    valueTypes: {
        text: "text",
        input: "input",
        select: "select"
    }
}

var  menuOptions ={
    service:[
        {
            id: 'service',
            name: 'menu.service.label',
            icon: 'fa fa-tasks',
            secondLevel: false
        },
        {
            id: 'roles',
            name: 'menu.roles.label',
            icon: 'fa fa-tags',
            secondLevel: true,
            add: {
                type: 'button',
                id: 'addRole',
                target: "#" + modalProps.roles.id,
                icon: 'glyphicon glyphicon-plus',
                fieldSize: 'col-sm-10'
            }
        },
        {
            id: 'channels',
            name: 'menu.channels.label',
            icon: 'glyphicon glyphicon-transfer',
            secondLevel: true,
            add: {
                type: 'button',
                id: 'addChannel',
                target: "#" + modalProps.channels.id,
                icon: 'glyphicon glyphicon-plus',
                fieldSize: 'col-sm-10'
            }
        },
        {
            id: 'connectors',
            name: 'menu.connectors.label',
            icon: 'fa fa-chain',
            clear: true,
            secondLevel: false,
            target: "#" + modalProps.connectors.id

        }
        /*    {
                id: 'ui',
                name: 'menu.uielements.label',
                icon: 'fa fa-wrench ',
                secondLevel: true,
                enum: [{
                    type: 'link',
                    id: 'show-channels',
                    href: '#',
                    text: 'Show/Hide channels',
                    fieldSize: 'col-sm-10'
                }] 
            }, */
    ],
    component:[
        {
            id: 'component',
            name: 'menu.component.label',
            icon: 'glyphicon glyphicon-hdd ',
            secondLevel: false
        },
        {
            id: 'runtime',
            name: 'menu.runtime.label',
            icon: 'fa fa-dashboard',
            target: "#" + modalProps.runtimes.id,
            secondLevel: false
        },
        {
            id: 'channels',
            name: 'menu.channels.label',
            icon: 'glyphicon glyphicon-transfer',
            secondLevel: true,
            add: {
                type: 'button',
                id: 'addChannel',
                target: "#" + modalProps.channels.id,
                icon: 'glyphicon glyphicon-plus',
                fieldSize: 'col-sm-10'
            }
        },
        {
            id: 'config',
            name: 'menu.config.label',
            icon: 'fa fa-gear',
            target: "#" + modalProps.configuration.id,
            secondLevel: false,
        },
    ],
    shared: [{
        id: 'ui',
        name: 'menu.settings.label',
        icon: 'fa fa-wrench ',
        secondLevel: true,
        enum: [{
            type: 'link',
            action: 'resetService',
            id: 'menu.settings.opt.changeServ',
            href: '#',
            fieldSize: 'col-sm-10'
            }]
        }
    ]

};


var  version = '1_0_0';

var manifestStructure = {
    version: version,
    eslap: 'eslap://',
    domain: 'eslap.cloud',
    elementtype:{
        channel: { name: 'channel', label: "Channel", enum: [
            { name: 'DUPLEX',               eslap: 'eslap://eslap.cloud/channel/duplex/' + version, type: 'all'},
            { name: 'RECEIVE',              eslap: 'eslap://eslap.cloud/channel/receive/' + version, type: 'requires'},
            { name: 'REPLY',                eslap: 'eslap://eslap.cloud/channel/reply/' + version, type: 'provides' },
            { name: 'REQUEST',              eslap: 'eslap://eslap.cloud/channel/request/' + version, type: 'requires' },
            { name: 'SEND',                 eslap: 'eslap://eslap.cloud/channel/send/' + version, type: 'provides' }
        ]},
        protocol: { name: 'protocol', label: "Channel Protocol" , enum:[
            { name: 'DEFAULT',              eslap: 'eslap://eslap.cloud/protocol/message/http/' + version },
            { name: 'TCP',                  eslap: 'eslap://eslap.cloud/protocol/tcp/' + version},
            { name: 'HTTP_intern',          eslap: 'eslap://eslap.cloud/protocol/message/http/' + version},
            { name: 'MESSAGE',              eslap: 'eslap://eslap.cloud/protocol/message/' + version},
            { name: 'HTTP',                 eslap: 'eslap://eslap.cloud/protocol/tcp/http/' + version}
        ]},
        connector: { name: 'Connectors', label: "Connectors" , enum:[
            { name: 'COMPLETE',             eslap: 'eslap://eslap.cloud/connector/complete/' + version},
            { name: 'LB',                   eslap: 'eslap://eslap.cloud/connector/loadbalancer/' + version},
            { name: 'PUBSUB',               eslap: 'eslap://eslap.cloud/connector/pubsub/' + version}
        ]},
        parameter: { name: 'parameter', enum: [
            { name: 'boolean',              eslap: 'eslap://eslap.cloud/parameter/boolean/' + version},
            { name: 'integer',              eslap:'eslap://eslap.cloud/parameter/integer/'+ version},
            { name: 'json',                 eslap:'eslap://eslap.cloud/parameter/json/'+ version},
            { name: 'list',                 eslap:'eslap://eslap.cloud/parameter/list/'+ version},
            { name: 'number',               eslap:'eslap://eslap.cloud/parameter/number'+ version},
            { name: 'string',               eslap:'eslap://eslap.cloud/parameter/string/'+ version},
            { name: 'vhost',                eslap:'eslap://eslap.cloud/parameter/vhost/'+ version}
        ]},
        resource: { name: 'resource', enum: [
            { name: 'Cert/Client',          eslap: "eslap://eslap.cloud/resource/cert/client/" + version },
            { name: 'Cert/Server',          eslap: "eslap://eslap.cloud/resource/cert/server/" + version },
            { name: 'Faultgroups',          eslap: "eslap://eslap.cloud/resource/faultgroups/" + version },
            { name: 'VHost',                eslap: "eslap://eslap.cloud/resource/vhost/" + version },
            { name: 'Volume/Persistent',    eslap: "eslap://eslap.cloud/resource/volume/persistent/" + version },
            { name: 'Volume/Volatile',      eslap: "eslap://eslap.cloud/resource/volume/volatile/" + version }
        ]},
        service: { name: 'service' },
        component: { name: 'component' },
        runtime: {
            name: 'runtime', enum: [
                { eslap: "eslap://eslap.cloud/runtime/java/1_0_1" },
                { eslap: "eslap://eslap.cloud/runtime/java/1_1_1" },
                { eslap: "eslap://eslap.cloud/runtime/native /1_0_1" },
                { eslap: "eslap://eslap.cloud/runtime/native /1_1_1" },
                { eslap: "eslap://c2netproject.eu/runtime/nodejs/1_0_0" },
                { eslap: "eslap://c2netproject.eu/runtime/nodejs/1_0_2" },
                { eslap: "eslap://c2netproject.eu/runtime/mariadb/1_0_2" },
                { eslap: "eslap://linagora.c2netproject.eu/runtime/ucp/1_0_0" },
                { eslap: "eslap://linagora.c2netproject.eu/runtime/ucp/1_0_4" },
                { eslap: "eslap://c2netproject.eu/runtime/java/1_0_0" },
                { eslap: "eslap://c2netproject.eu/runtime/java/1_0_2" }
            ]
    
        },
        manifest: { name: 'component' },
    }
}
    
module.exports  = {
    alerts,
    modalProps,
    listTypes,    
    listProps,
    inlineForms,
    menuOptions,
    manifestStructure
};