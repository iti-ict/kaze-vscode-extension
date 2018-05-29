import Vue from 'vue'
import i18n from './i18n'
import App from './App.vue'
import VueResource from 'vue-resource'
import Modal from './helpers/helper_modal.vue'
import RowList from './helpers/helper_list.vue'
import RGridForm from './helpers/helper_grid_form.vue'
import AlertPanel from './helpers/helper_alert_panel.vue'
import  {store} from './store/store.js'


Vue.use(VueResource);
Vue.component('modal',    Modal);
Vue.component('rowlist',  RowList);
Vue.component('gridform', RGridForm);
Vue.component('alertpan', AlertPanel);


var app;

Vue.http.options.emulateJSON = true
Vue.http.headers.common['Access-Control-Allow-Origin']  = '*';
Vue.http.headers.common['Access-Control-Allow-Headers'] = 'Origin, X-Requested-With, Content-Type, Accept';
Vue.http.headers.common['Access-Control-Allow-Methods'] = 'GET, POST, PUT';

store.dispatch('startConnection');

Vue.use(VueResource);
Vue.component('modal', Modal);
Vue.component('rowlist', RowList);


  app = new Vue({
    store: store,
    el: '#app',
    i18n,
    render: h => h(App)
  })


  

