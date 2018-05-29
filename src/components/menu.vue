<template>
  <div id="control">
    <div id="control-panel" class="panel panel-primary">
      <div class="panel-heading">{{$t('menu.name')}}</div>
      <div class="panel-body">
        <slot name="menu" ></slot>
      </div>
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
        ]),
          ...mapState({
              validation: state => state.serviceState.validation,
              servName: state =>  state.serviceState.name,
              updater: state => state.serviceState.updater
          })
      
      },
      methods:{
          ...mapActions([
        ]),
      
    }
}
</script>







