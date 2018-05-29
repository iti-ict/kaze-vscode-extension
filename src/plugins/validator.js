var regex = {
    notNull: {
        r: /^.+$/, 
        errMsg: 'empty'
    },
    validVersion: {
        r: /^\d+_\d+_\d+$/, 
        errMsg: 'invalidf'
    },
    noSpecialChars: {
        r: /^[a-zA-Z0-9_.-]*$/, 
        errMsg: 'invalidc'
    }
}

var cheCker = (check, value) => {
    let status = value.match(regex[check].r);
        return { err: (status == null), msg: regex[check].errMsg };
}



var data = {
    role: {
        name: ['notNull','noSpecialChars'],
        component: ['notNull']
    },
    channel: {
        name: ['notNull', 'noSpecialChars'],
        type: ['notNull'],
        protocol: []
    },
    service: {
        domain: ['notNull', 'noSpecialChars'],
        name: ['notNull', 'noSpecialChars'],
        version:['notNull','validVersion']
    },
    component: {
        runtime: []
    },
    configuration: {
        pname: ['notNull'],
        rname: ['notNull']
    }

}


var validator = (conditions, value) => {
        for( cond of conditions){
            let res = cheCker(cond, value)
            if(res.err)
                return res;
        }
        return {err: false, msg:''}; 
    }



var validType= (type, prop, value) => {
/*     console.log("------VALIDADTOR------")
    console.log(type)
    console.log(prop)
    console.log(value)
    console.log("----------------------") */
    let conditions = data[type][prop];
    for (cond of conditions) {
        let res = cheCker(cond, value)
        if (res.err)
            return res;
    }
    return { err: false, msg: '' };
}



    
module.exports = validType;




{/* <div :class="{'form-group':true, 'has-error':validation.name.err, 'has-feedback':validation.name.err}">
    <input class="form-control" @input="updateName" ref="name" v-bind:value="name">
                          <span v-if="validation.name.err" class="glyphicon glyphicon-remove form-control-feedback"></span>
    <span v-if="validation.name.err" class="help-block">{{ validation.name.msg }}</span>
</div> */}