<template>
    <label class="switch">
      <input type="checkbox" v-model="isChecked" @change="toggleSwitch">
      <span class="slider round"></span>
    </label>
  </template>
  
  <script>
  export default {
    name: 'subPopupSwitchToggle',
    props: {
      value: {
        type: Boolean,
        default: false
      }
    },
    data() {
      return {
        isChecked: this.value
      };
    },
    methods: {
      toggleSwitch() {
        this.$emit('touch-swtich', this.isChecked);
      }
    }
  };
  </script>
  
  <style scoped>
  .switch {
    position: relative;
    display: inline-block;
    width: 34px;
    height: 20px;
  }
  
  .switch input {
    opacity: 0;
    width: 0;
    height: 0;
  }
  
  .slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #ccc;
    transition: .4s;
    border-radius: 34px;
  }
  
  .slider:before {
    position: absolute;
    content: "";
    height: 14px;
    width: 14px;
    left: 3px;
    bottom: 3px;
    background-color: white;
    transition: .4s;
    border-radius: 50%;
  }
  
  input:checked + .slider {
    background-color: #2196F3;
  }
  
  input:checked + .slider:before {
    transform: translateX(14px);
  }
  </style>