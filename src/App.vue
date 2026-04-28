<template>
  <router-view />
</template>

<script setup>
// App.vue 只负责渲染路由，非常干净
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif;
}

#app {
  width: 100%;
  height: 100vh;
  overflow: hidden;
}
</style>
