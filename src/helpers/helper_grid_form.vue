<template>
  <div>
    {{init()}}
   <div class="row">
      <div v-for="(hr, index) in  form.headers" :class="'col-sm-'+12/form.headers.length" >
       <p><label>{{hr}}</label></p>
      </div>
   </div>
    <div v-for="(row, index) in  form.rows" class="row" >
      <div v-for="(col, index) in  row" :class="'col-sm-'+12/form.headers.length" >
        <template v-if="col.type == Settings.inlineForms.valueTypes.text"><p class="rowText">{{col.value}}</p></template>
        <input v-if="col.type ==  Settings.inlineForms.valueTypes.input" class="form-control"  v-bind:value="col.value" :ref="col.id" @input="fieldChanged(row,col,type)">
      </div>
   </div>


  </div>
</template>

<script>

  import {mapActions} from 'vuex';
  import {mapGetters} from 'vuex';

    export default {
      props: ['data', 'type'],
      data (){ 
        return {
          form :{}
        }
      },
      computed: {
        ...mapGetters([
          'getCurrentRoleResource'
           
        ])
      },
      methods:{
        ...mapActions([
            'setResource'
            
      ]),
        init(){
          this.Settings = this.$store.state.Settings;
          this.form = this.getCurrentRoleResource;
        },

        fieldChanged(row,col,type){
          switch(type){
            case this.Settings.inlineForms.types.resource:
              this.setResource({name:row[0].value,tag: this.$refs[col.id][0].value, oldTag:col.value, type:row[1].fullType})
              col.value=this.$refs[col.id][0].value;
              break;
            default:
               break;
          } 
        }   
      }

    
}
</script>

