<template>
    <div :class="'modal fade modal'+modalSize"  v-bind:id="modalProp.id" role="dialog">
      <div class="modal-dialog modal-lg">
           <!-- Modal content-->
          <slot name="body"  ></slot>
      </div> 
    </div>
</template>

<script>
    export default {
      props: ['modalProp','modalSize'],
      data (){
        return {
        
        }
      }

}
</script>

