
Vue.component('compotest',{
 template: '<p>Soy un component</p>',
 data: function(){
     return "Original";
 }
});



new Vue({

    el: "#main",
    data: {
        graph:{},
        manifests:{},
        test:{
            name: "patata"
        },
        menu: ["Service", "Properties", "Resources"],
        count:0,
        website:"http://www.iti.es"
    },
    methods: {
        saluda: function saludo() {
            return "hola mundo";
        }
    },
    computed: {
        saluda: function saludo() {
            return "hola mundo";
        }
    },

});


