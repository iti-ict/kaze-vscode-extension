<template>
    <div :class="'modal-content content'+'xs'" heith="100" :updater="updater">
        <div class="modal-header">
            <button type="button" class="close" data-dismiss="modal">&times;</button>
            <h4 class="modal-title"> <i :class="modalProp.icon"></i> {{ modalProp.title }} </h4>
        </div>
        <div class="modal-body">
            <div class="panel panel-primary">
                <div class="panel-heading">
                    <i class="fa fa-gears fa-fw"></i> {{$t('modals.heads.settings')}} 
                </div>
                <div class="panel-body">
                    <div class="row">
                        <div class="col-sm-3"><label>{{$t('modals.components.labels.runtime')}}</label></div>
                        <div class="col-sm-9">
                            <div :class="{'form-group':true, 'has-error':validation.runtime.err, 'has-feedback':validation.runtime.err}">
                                <select id="componentsList" class="form-control" ref="runtime" @change="updateRuntime()" :value="runtime">
                                    <option v-for="run in getRuntimes"  :value="run.eslap" :selected="run.eslap == runtime" >{{run.eslap}}</option>
                                </select>
                                <span v-if="validation.runtime.err" class="glyphicon glyphicon-remove form-control-feedback"></span>
                                <span v-if="validation.runtime.err" class="help-block">{{$t('validation.'+validation.runtime.msg)}}</span>
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
          'getSettings',
        ]),
        ...mapState({
              runtime: state => state.componentState.runtime,
              validation: state => state.componentState.validation,
              updater: state => state.componentState.updater
          }),
         modalProp(){
            return this.getSettings.modalProps.runtimes;
        },
        getRuntimes(){
            return this.getSettings.manifestStructure.elementtype.runtime.enum
        },
      },
      methods:{
          ...mapActions([
              'updateComponentState'

        ]),

        updateRuntime(){
            this.updateComponentState({key: 'runtime', value: this.$refs.runtime.value});
        }
      }
     }
</script>
