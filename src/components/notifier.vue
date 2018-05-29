<template>
  <div>
    <div v-for="(alert, index) in getAlerts" :class="'alert '+ alert.type +' alert-dismissable' ">
      <button :id="index" type="button" class="close" @click="deleteAlert(index)" aria-hidden="true">×</button>
      {{$t('notify.'+alert.text) +" "+ alert.extra}}
    </div>
  </div>
</template>

<script>
  import {mapActions} from 'vuex';
  import {mapGetters} from 'vuex';

    export default {
      computed: {
        ...mapGetters([
          'getAlerts'
        ])
      },
      methods:{
        ...mapActions([
            'deleteAlert'
        ]),

      },
      data (){
        return {
        }
      }
}
</script>







