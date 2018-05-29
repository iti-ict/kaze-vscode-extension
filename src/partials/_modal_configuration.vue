<template>
    <div :class="'modal-content content'+'xl'" heith="100" :updater="updater">
        <div class="modal-header">
            <button type="button" class="close" data-dismiss="modal">&times;</button>
            <h4 class="modal-title"> <i :class="modalProp.icon"></i> {{ modalProp.title }} </h4>
        </div>
        <div class="modal-body">


                <div class="panel panel-primary">
                    <div class="panel-heading">
                        <i class="fa fa-cubes fa-fw"></i> {{$t('modals.components.labels.res')}}
                    </div> 
                    <div class="panel-body">
                        <div class="row">   
                            <div class="col-md-3" >
                                <label style="text-decoration: underline;">{{$t('modals.components.labels.name')}}</label>
                            </div>
                            <div class="col-md-8" >
                                <label style="text-decoration: underline;">{{$t('modals.components.labels.type')}}</label>
                            </div>
                         </div>
                        <rowlist v-bind:list="resources"  :type="getSettings.listTypes.component.resources"> </rowlist>
                        <hr/>
                        <div class="row">   
                            <div class="col-md-3" >
                                <div :class="{'form-group':true, 'has-error':validation.rname.err, 'has-feedback':validation.rname.err}">
                                    <input class="form-control" ref="res_name" :value="rname" @input="updateStateRes" :placeholder="$t('modals.components.labels.name')"  @keyup.enter="addRes">
                                    <span v-if="validation.rname.err" class="glyphicon glyphicon-remove form-control-feedback"></span>
                                    <span v-if="validation.rname.err" class="help-block">{{$t('validation.'+validation.rname.msg)}}</span>
                                </div>
                               
                            </div>
                            <div class="col-md-8" >
                                <select class="form-control" ref="res_type"  @keyup.enter="addRes">
                                       <option v-for="res in getSettings.manifestStructure.elementtype.resource.enum"  :value="res.eslap">{{res.eslap}}</option>
                                </select>
                            </div>
                            <div class="col-md-1" >
                                <div class="action-btn">
                                     <i  class="btn-private fa fa-plus-square blue" @click="addRes()"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="panel panel-primary">
                    <div class="panel-heading">
                        <i class="fa fa-sliders fa-fw"></i> {{$t('modals.components.labels.param')}}
                    </div>
                    <div class="panel-body">
                        <div class="row">   
                            <div class="col-md-3" >
                                <label style="text-decoration: underline;">{{$t('modals.components.labels.name')}}</label>
                            </div>
                            <div class="col-md-8" >
                                <label style="text-decoration: underline;">{{$t('modals.components.labels.type')}}</label>
                            </div>
                         </div>
                        <rowlist v-bind:list="parameters"  :type="getSettings.listTypes.component.parameters"> </rowlist>
                        <hr/>
                        <div class="row">   
                            <div class="col-md-3" >
                                <div :class="{'form-group':true, 'has-error':validation.pname.err, 'has-feedback':validation.pname.err}">
                                    <input  ref="param_name" class="form-control" :value="pname" @input="updateStateParam" :placeholder="$t('modals.components.labels.name')" @keyup.enter="addParam">
                                    <span v-if="validation.pname.err" class="glyphicon glyphicon-remove form-control-feedback"></span>
                                    <span v-if="validation.pname.err" class="help-block">{{$t('validation.'+validation.pname.msg)}}</span>
                                </div>
                            </div>
                            <div class="col-md-8" >
                                <select class="form-control" @keyup.enter="addParam"  ref="param_type">
                                        <option v-for="param in getSettings.manifestStructure.elementtype.parameter.enum" :value="param.eslap">{{param.eslap}}</option>
                                </select>
                            </div>
                            <div class="col-md-1" >
                                <div class="action-btn">
                                    <i  class="btn-private fa fa-plus-square blue" @click="addParam()"></i>
                                </div>
                            </div>
                         </div>
                    </div>
                </div>


        </div>
        <div class="modal-footer">
            <button type="button" class="btn btn-default" data-dismiss="modal">  <i class="fa fa-times"></i> {{$t('panel.buttons.close')}}</button>
        </div>
    </div>

</template>






<script>
  import {mapActions} from 'vuex';
  import {mapGetters} from 'vuex';
  import {mapState} from 'vuex';

    export default {

      data (){
        return {
        }
      },
     computed: {
        ...mapGetters([
          'getSettings'
        ]),
        ...mapState({
              pname: state => state.configurationState.pname,
              rname: state => state.configurationState.rname,
              resources: state => state.configurationState.resources,
              parameters: state => state.configurationState.parameters,
              validation: state => state.configurationState.validation,
              updater: state => state.configurationState.updater
          }),
         modalProp(){
            return this.getSettings.modalProps.configuration;
        },
      },
      methods:{
        ...mapActions([
            'addComponentResource',
            'addComponentParameter',
            'updateConfigState'

        ]),
        addParam(){
             this.addComponentParameter({name: this.$refs.param_name.value, type: this.$refs.param_type.value});
        },
        addRes(){
            this.addComponentResource({name: this.$refs.res_name.value, type: this.$refs.res_type.value});
        },
        updateStateParam(){
            this.updateConfigState({ key: 'pname', value: this.$refs.param_name.value});
             
        },
        updateStateRes(){
            this.updateConfigState({ key: 'rname', value: this.$refs.res_name.value });
        }

      }
     }
</script>
