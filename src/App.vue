<template>
  <div >
    <div class="notifier alertNoty" >
      <notifier></notifier>
    </div>
    <div id="container">
        <alertpan  v-show="alertPan"></alertpan>
        <graph v-if="false" @d3-event="listener"></graph>
        <appmenu v-if="currentManifest!=''">
            <menuservice v-if="getManifest.type=='service'" slot="menu"></menuservice>
            <menucomp v-if="getManifest.type=='component'" slot="menu"></menucomp>
        </appmenu>

        <div v-if="currentManifest==''" class="panel panel-primary alertModal">
            <div class="panel-heading">
                {{$t('panel.selector.title')}}
            </div>
            <div class="panel-body">
              <div class="form-group">
                <label class="checkbox-inline">
                    <input type="checkbox" value="service" v-model="filerManifests">{{$t('panel.selector.options.services')}}
                </label>
                <label class="checkbox-inline">
                    <input type="checkbox"  value="component"  v-model="filerManifests">{{$t('panel.selector.options.components')}}
                </label>
                </div>
              <v-select :value="selected" :on-change="setSelect" :options="options" ref="select"></v-select>
            </div>
            <div class="panel-footer">
              <button  type="button" @click="selectModal" ref="btnaccept" :class="{btn:true, 'btn-success':true, disabled:manifestList.length==0 || selectedManifest==null}">  <i class="fa fa-check"></i> {{$t('panel.warning.buttons.accept')}}</button>
            </div>
        </div>
    </div>
      <footer v-if="currentManifest!=''" id="footer">
        <div>
          <p  class="footext">Manifest: {{manifests[currentManifest].name}} &nbsp;&nbsp;|&nbsp;&nbsp; Type: {{manifests[currentManifest].type}}&nbsp;&nbsp;|&nbsp;&nbsp; Path: {{manifests[currentManifest].filePath}}</p>
        </div>
      </footer>
  </div>
</template>
<script>

import Graph from './components/graph.vue'
import Menu from './components/menu.vue'
import Notifier from './components/notifier.vue'
import MenuService from './partials/_menu_service.vue'
import MenuComponent from './partials/_menu_component.vue'
import i18n from './i18n'
import {mapGetters} from 'vuex';
import {mapState} from 'vuex';
import vSelect from "vue-select"


import {mapActions} from 'vuex';

    export default {
      components:{
        'appmenu':Menu,
        'graph':Graph,
        'notifier': Notifier,
        'menuservice': MenuService,
        'menucomp': MenuComponent,
        vSelect
      },
      data (){
        return {
           filerManifests: ["service", "component"],
           selectedManifest: null,
           selected: null
        }
      },
        computed: {
        ...mapGetters([
          'alertPan',
          'getManifest'
        
        ]),
        ...mapState({
              manifests: state => state.manifests,
              currentManifest: state => state.currentManifest,
              manifestList: state =>  state.manifestList
        }),

        options(){
          return this.manifestList.filter((x)=>{
            return this.filerManifests.indexOf(x.type)>-1});
        },

      
        },
      methods:{
        listener(data){
        //  console.log(data)
        },
        ...mapActions([
            'setManifest'
        ]),
        setSelect(val){
          this.selectedManifest = val;
          this.$refs.btnaccept.focus();
        },
        selectModal(){
          if(this.manifestList.length>0 && this.selectedManifest!=null)
            this.setManifest(this.selectedManifest.label)
        }


      } 
}
</script>
