<template>
  <div  style="position:relative" v-bind:class="{'open':openSuggestion, disabled:disabled}">
  {{init()}}
      <input  :disabled="disabled ? '' : null" :value="defaultVal" class="form-control" type="text" v-model="selection"
          @keydown.enter = 'enter'
          @keydown.down = 'down'
          @keydown.up = 'up'
          @focusout = 'close($event)'
          @focus = 'setFocus'   
      />
      <ul class="dropdown-menu" style="width:100%; margin-top:25px;">
          <li v-for="(suggestion, index) in matches"
              v-bind:class="{'active': isActive(index)}"
              @click="suggestionClick(index)"
          >
              <a href="#">{{ suggestion.label }}</a>
          </li>
      </ul>
  </div>
</template>

<script>

  import {mapActions} from 'vuex';
  import {mapGetters} from 'vuex';

    export default {
      props: ['disabled','suggestions','reset', 'defaultVal'],
      data (){ 
        return {
            open: false,
            current: 0,
            selection:'',
            value: '',
            focus: false   
        }
      },
      computed: {
        ...mapGetters([
        
        ]),
        //Filtering the suggestion based on the input
        matches() {
            if(this.focus && this.selection=='')
                return this.suggestions

            return this.suggestions.filter((elem) => {
                return elem.fullName.indexOf(this.selection) >= 0;
            });
        },

        //The flag
        openSuggestion() {
             //this.selection !== "" &&
               return   this.matches.length != 0 &&
                  this.open === true;
        }

      },
      methods:{
        ...mapActions([
           
            
      ]),
      setFocus(){
          this.focus = true;
            if (this.open == false) {
              this.open = true;
              this.current = 0;
          }
      },
       init(){
           if(this.reset){
             this.selection='';
             this.$emit('reset', false)
             }
        },
      //When enter pressed on the input
      enter() {
        
        this.$emit('update', this.matches[this.current])
        this.selection = this.matches[this.current].fullName;
        this.open = false;
      },

      //When up pressed while suggestions are open
      up() {
          console.log("upp")
          if(this.current > 0)
              this.current--;
      },

      //When up pressed while suggestions are open
      down() {
          console.log("down")
          if(this.current < this.matches.length - 1)
              this.current++;
      },

      //For highlighting element
      isActive(index) {
          return index === this.current;
      },

      //When the user changes input
      change() {
          if (this.open == false) {
              this.open = true;
              this.current = 0;
          }
      },

      //Close suggestion list
      close(event){
          if(event.relatedTarget==null || event.relatedTarget.tagName!='A'){
            this.open = false;
            this.focus = false;
            }
      },
      //When one of the suggestion is clicked
      suggestionClick(index) {
          this.$emit('update', this.matches[index])
          this.selection = this.matches[index].fullName;
          this.open = false;
      }

    }

    
}
</script>

