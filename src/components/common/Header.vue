<!-- Header.vue -->
<template>
  <header class="flex sticky top-0 justify-start flex-nowrap z-50 w-full backdrop-blur-md text-sm py-3 ">
    <nav class="relative w-full px-4 items-center justify-between sm:px-6" aria-label="Global">
      <div class="flex items-center justify-between">
        <div class="flex items-center select-none space-x-4 size-6">
          <div @click="triggerUpload" class="upload-button">
              <input type="file" @change="handleFileChange" id="bookInput" multiple style="display: none" />
              <svg class="size-6 sm:size-5 fill-current cursor-pointer hover:text-blue-600 " viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
                <path d="M797.013333 597.333333c-117.76 0-213.333333 95.573333-213.333333 213.333334S679.253333 1024 797.013333 1024s213.333333-95.573333 213.333334-213.333333S914.773333 597.333333 797.013333 597.333333z m134.826667 230.4h-117.76v117.76c0 10.24-8.533333 17.066667-17.066667 17.066667-10.24 0-17.066667-8.533333-17.066666-17.066667v-117.76h-117.76c-10.24 0-17.066667-8.533333-17.066667-17.066666 0-10.24 8.533333-17.066667 17.066667-17.066667h117.76v-117.76c0-10.24 8.533333-17.066667 17.066666-17.066667 10.24 0 17.066667 8.533333 17.066667 17.066667v117.76h117.76c10.24 0 17.066667 8.533333 17.066667 17.066667s-8.533333 17.066667-17.066667 17.066666z m-134.826667-612.693333H160.426667C119.466667 215.04 85.333333 180.906667 85.333333 139.946667c0-40.96 34.133333-75.093333 75.093334-75.093334h636.586666c-22.186667 17.066667-35.84 44.373333-35.84 75.093334 0 29.013333 15.36 56.32 35.84 75.093333zM145.066667 1024H116.053333c-56.32 0-102.4-46.08-102.4-102.4V136.533333c0-75.093333 61.44-136.533333 136.533334-136.533333h561.493333c32.426667 0 61.44 15.36 80.213333 37.546667H153.6c-56.32 0-102.4 46.08-102.4 102.4 0 52.906667 40.96 97.28 93.866667 102.4V1024z m448.853333 0h-409.6V242.346667h92.16V563.2l85.333333-71.68L443.733333 563.2V242.346667h380.586667v274.773333c-8.533333-1.706667-18.773333-1.706667-27.306667-1.706667-162.133333 0-295.253333 131.413333-295.253333 295.253334 0 83.626667 35.84 160.426667 92.16 213.333333z" p-id="7565"></path>
              </svg>
          </div>

        </div>
      </div>
      
    </nav>
  </header>
</template>

<script>

export default {
  name: 'AppHeader',  
  methods: {
    triggerUpload() {
      document.getElementById('bookInput').click();
    },
    handleFileChange(event) {
      this.$emit('upload-books', event);
    }
  }
}
</script>