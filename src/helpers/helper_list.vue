<template>
  <div>
    {{init()}}
    <div v-for="(elem, index) in list" 
         v-bind:class="{row: true, 'bg-info': index%2==0 && getCurrentConnector!=elem.id, 'bg-success': getCurrentConnector==elem.id}" 
         @click="Settings.listProps[type].rowSelection ? setDef(elem.id,type,$event) : null ">
   
      <div v-if="Settings.listProps[type].icon"  class="" v-bind:class="{'col-sm-2': true, listElem: true}">
        <i  :class ="'ico-private blue fa '+Settings.listProps[type].iconImg"></i>
      </div>


      <div :class="'col-sm-'+Settings.listProps[type].fullSize+ ' listElem'"><div v-html="getName(elem, type)"></div></div>
      <div v-if="Settings.listProps[type].extraCol" :class="'col-sm-'+Settings.listProps[type].extraCol+ ' listElem'"><div v-html="getExtra(elem, type)"></div></div>

      <div :class="'col-sm-'+Settings.listProps[type].btnsSize+ ' listElem'">
        <div class="action-btn">
          <i v-if="Settings.listProps[type].buttons.edit" class="btn-private yellow fa fa-pencil-square" @click="setDef(index,type)" data-toggle="modal" v-bind:data-target="Settings.listProps[type].target" ></i>
          <i v-if="Settings.listProps[type].buttons.delete" class ="btn-private red fa fa-minus-square" @click="deleteDef(index,type)"></i>
        </div>
      </div>
    </div>
  </div>
</template>

<script>

  import {mapActions} from 'vuex';
  import {mapGetters} from 'vuex';

    export default {
      props: ['list', 'type'],
      data (){ 
        return {
          data:{
          }        
        }
      },
      computed: {
        ...mapGetters([
           'getCurrentConnector',
           'getSettings'

        ])
      },
      methods:{
        ...mapActions([
            'setRole',
            'deleteRole',
            'setChannel',
            'deleteChannel',
            'setConnector',
            'deleteConnector',
            'deleteConnList',
            'deleteComponentResource',
            'deleteComponentParameter'

            
      ]),
        init(){
          this.Settings = this.$store.state.Settings;
        },
        selectRow(index){
          this.data.selectedRow=index;
        },
        getName(elem, type){

          switch (type) {
            case this.Settings.listTypes.role:
             return '<label>'+elem.name+'</label>';

             case this.Settings.listTypes.connectorList.provided:
              return '<label>'+elem.name[0]+'</label>:'+elem.name[1];
              break;
             case this.Settings.listTypes.connectorList.depended:
              return '<label>'+elem.name[0]+'</label>:'+elem.name[1];
              break;
             
            default:
              return '<label>'+elem.name+'</label>';
          } 
        },
        getExtra(elem, type){
          switch (type) {
            case this.Settings.listTypes.component.resources:
              return '<label>'+elem.type+'</label>';
              break;
            case this.Settings.listTypes.component.parameters:
              return '<label>'+elem.type+'</label>';
              break;
            default:
              return '';
          } 
        },
        setDef(index, type, event){
           if(event===undefined || event.target.tagName!='I')
            switch (type) {
              case this.Settings.listTypes.role:
                this.setRole(index); 
                break;
              case this.Settings.listTypes.channel.provides:
                this.setChannel({index:index, inout: this.Settings.listProps[type].channelType}); 
                break;
              case this.Settings.listTypes.channel.requires:
                this.setChannel({index:index, inout: this.Settings.listProps[type].channelType}); 
                break;
              case this.Settings.listTypes.connector:
                this.setConnector(index); 
                break;
              default:
                break;
            } 
        },
        deleteDef(index, type){
         switch (type) {
            case this.Settings.listTypes.role:
              this.deleteRole(index);
              break;
            case this.Settings.listTypes.channel.provides:
              this.deleteChannel({index:index, inout: this.Settings.listProps[type].channelType}); 
              break;
            case this.Settings.listTypes.channel.requires:
              this.deleteChannel({index:index, inout: this.Settings.listProps[type].channelType}); 
              break;
            case this.Settings.listTypes.channel.requires:
              this.deleteChannel({index:index, inout: this.Settings.listProps[type].channelType}); 
              break;
            case this.Settings.listTypes.connector:
              this.deleteConnector(index);  
              break;
            case this.Settings.listTypes.connectorList:
              this.deleteConnectorElement(index);  
              break;
            case this.Settings.listTypes.connectorList.depended:
              this.deleteConnList({index:index,type:type});
              break;
            case this.Settings.listTypes.connectorList.provided:
              this.deleteConnList({index:index,type:type});
               break;
            case this.Settings.listTypes.component.resources:
              this.deleteComponentResource({index:index});
               break;
            case this.Settings.listTypes.component.parameters:
              this.deleteComponentParameter({index:index});
              break;
            default:
              break;  
          }
        }
      }

    
}
</script>

