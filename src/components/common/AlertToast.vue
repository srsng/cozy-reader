<template>
    <div class="fixed top-4 right-4 z-50">
      <div class="max-w-xs bg-white border border-gray-200 rounded-xl shadow-lg dark:bg-neutral-800 dark:border-neutral-700" role="alert" tabindex="-1" aria-labelledby="hs-toast-normal-example-label">
        <div class="flex p-4">
          <div class="shrink-0">
            <svg class="shrink-0 size-4 text-blue-500 mt-0.5" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm.93-9.412-1 4.705c-.07.34.029.533.304.533.194 0 .487-.07.686-.246l-.088.416c-.287.346-.92.598-1.465.598-.703 0-1.002-.422-.808-1.319l.738-3.468c.064-.293.006-.399-.287-.47l-.451-.081.082-.381 2.29-.287zM8 5.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2z"></path>
            </svg>
          </div>
          <div class="ms-3">
            <p id="hs-toast-normal-example-label" class="text-sm text-gray-700 dark:text-neutral-400">
              {{ message }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: 'AlertToast',
    props: {
      message: {
        type: String,
        required: true
      }
    },
    mounted() {
      setTimeout(() => {
        this.$emit('close');
      }, 3000);
    }
  }
  </script>