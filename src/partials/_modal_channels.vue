<template>
    <div :class="'modal-content content'+'xs'" heith="100" :updater="updater">
        <div class="modal-header">
            <button type="button" class="close" data-dismiss="modal">&times;</button>
            <h4 class="modal-title"> <i :class="modalProp.icon"></i> {{ modalProp.title }} </h4>
        </div>
        <div class="modal-body">

            <div class="panel panel-primary">
            
                <div class="panel-heading">
                    <i class="fa fa-gears fa-fw"></i> {{channel.index>-1 ? $t('modals.heads.settings'):$t('modals.heads.new')+' '+$t('modals.channels.name')}} 
                </div>
                <div class="panel-body">
                    <div>
                        <!-- Nav tabs -->
                        <ul class="nav nav-tabs">
                            <li v-if="channel.index==-1 || (channel.index>=0 && channel.inout=='provides')" 
                                v-bind:class="{active: channel.inout=='provides' }"
                                v-on:click="changeDir('provides')"
                                ><a href="#tab" data-toggle="tab" aria-expanded="true">{{$t('modals.channels.labels.prov')}} </a>
                            </li>
                            <li v-if="channel.index==-1 || (channel.index>=0 && channel.inout=='requires')" 
                                v-bind:class="{active: channel.inout=='requires'}"
                                v-on:click="changeDir('requires')"
                                ><a href="#tab" data-toggle="tab" aria-expanded="false">{{$t('modals.channels.labels.req')}}</a>
                            </li>
                        </ul>
                        

                        <!-- Tab panes -->
                        <br/>
                        <div class="tab-content">
                            <div class="tab-pane fade active in" id="tab">
                                <div class="row">
                                    <div class="col-sm-3"><label>{{$t('modals.channels.labels.name')}}</label></div>
                                    <div class="col-sm-9">
                                        <div :class="{'form-group':true, 'has-error':validation.name.err, 'has-feedback':validation.name.err}">
                                            <input class="form-control" ref="name" @input="updateName()" :value="channel.data.name">
                                            <span v-if="validation.name.err" class="glyphicon glyphicon-remove form-control-feedback"></span>
                                            <span v-if="validation.name.err" class="help-block">{{$t('validation.'+validation.name.msg)}}</span>
                                        </div>
                                    </div>
                                </div>
                                <div class="row">
                                    <div class="col-sm-3"><label>{{$t('modals.channels.labels.type')}}</label></div>
                                    <div class="col-sm-9">
                                        <div :class="{'form-group':true, 'has-error':validation.type.err, 'has-feedback':validation.type.err}">
                                            <select id="componentsList" class="form-control" ref="type" @change="updateType()" :value="getType(channel.data.type)">
                                                <option v-for="chType in getChannelTypes(channel.inout)"  :value="chType.eslap" :selected="chType.eslap == getType(channel.data.type)" >{{chType.name}}</option>
                                             </select>
                                            <span v-if="validation.type.err" class="glyphicon glyphicon-remove form-control-feedback"></span>
                                            <span v-if="validation.type.err" class="help-block">{{$t('validation.'+validation.type.msg)}}</span>
                                        </div>
                                        
                                    </div>
                                </div>
                                <div class="row">
                                    <div class="col-sm-3"><label>{{$t('modals.channels.labels.proto')}}</label></div>
                                    <div class="col-sm-9">
                                        <div :class="{'form-group':true, 'has-error':validation.protocol.err, 'has-feedback':validation.protocol.err}">
                                            <select id="componentsList" class="form-control" ref="protocol" @change="updateProtocol()" :value="getProtocol(channel.data.protocol)">
                                                <option v-for="chProt in getSettings.manifestStructure.elementtype.protocol.enum" :value="chProt.eslap">{{chProt.name}}</option>
                                            </select>
                                            <span v-if="validation.protocol.err" class="glyphicon glyphicon-remove form-control-feedback"></span>
                                            <span v-if="validation.protocol.err" class="help-block">{{$t('validation.'+validation.protocol.msg)}}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="modal-footer">
            <button v-if="channel.index==-1" @click="createChannel()" type="button" class="btn btn-primary" slot="add">  <i class="fa fa-plus"></i> {{$t('panel.buttons.add')}}</button>
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
              channel: state => state.channelState.channel,
              validation: state => state.channelState.validation,
              updater: state => state.channelState.updater
          }),
         modalProp(){
            return this.getSettings.modalProps.channels;
        },
      },
      methods:{
          ...mapActions([
              'setChannelDirect',
              'updateCurrentChannel',
              'addChannel',
              'updateChannState'

        ]),
        getType(eslap){
              let hasChannel = this.getSettings.manifestStructure.elementtype.channel.enum.filter((elem)=>{return elem.eslap == eslap});
              return hasChannel.length>0 ? hasChannel[0].eslap : '';
        },
        getProtocol(eslap){
            let hasProtocol = this.getSettings.manifestStructure.elementtype.protocol.enum.filter((elem)=>{return elem.eslap == eslap});
            return hasProtocol.length>0 ? hasProtocol[0].eslap : '';
        },
        getChannelTypes(inout){
            let negateDir =  inout == 'provides' ? 'requires' : 'provides'
            return this.getSettings.manifestStructure.elementtype.channel.enum.filter((elem)=>{return elem.type != negateDir});
        },
        updateName(){
            this.updateChannState({key: 'name', value: this.$refs.name.value});
            if(this.channel.index>-1)
                this.updateChannel();
        },
        updateType(){
            this.updateChannState({key: 'type', value: this.$refs.type.value});
            if(!this.updateTypeOpts){
                if(this.channel.index>-1){
                    this.updateChannel();
                }
            }
            this.updateTypeOpts=false;
        },
        updateProtocol(){
            this.updateChannState({key: 'protocol', value: this.$refs.protocol.value});
            if(this.channel.index>-1){
                this.updateChannel();
            }
        },
        updateChannel(){
              this.updateCurrentChannel({inout: this.channel.inout, index: this.channel.index, data:{name: this.$refs.name.value, type: this.$refs.type.value, protocol:this.$refs.protocol.value}});
        },
        createChannel(){
             this.addChannel({inout: this.channel.inout, data:{name: this.$refs.name.value, type: this.$refs.type.value, protocol:this.$refs.protocol.value}});
        },
        changeDir(dir){
            this.setChannelDirect(dir);
        }
      }
     }
</script>
