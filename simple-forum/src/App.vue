<script setup>
import { RouterView } from 'vue-router'
</script>

<template>
  <div class="main-layout">
    <header class="sidebar">
      <div class="logo-wrapper">
        <h1 class="app-title">2025作业</h1>
        <img alt="ZJUT_seal" class="logo" src="@/assets/ZJUT_seal.svg.png" width="250" height="250" />
      </div>
    </header>

    <main class="content"> 
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
/* 使用 Flexbox 来创建左右布局 */
.main-layout {
  display: flex;
  width: 100%;
  height: 100vh;
  /* 居中对齐 */
  justify-content: center;
  align-items: center;
  /*  使用 gap 属性在子项目之间创建固定的间距 */
  gap: 5rem; /* 你可以调整这个值来改变间距大小，比如 8rem 或 100px */
  padding: 0 2rem; /* 在页面两侧也留一些边距，防止内容贴边 */
}

.sidebar {
  /* 我们不再需要写死宽度 */
  /* 它会自动根据内容调整 */
  display: flex;
  justify-content: center;
  align-items: center;
}

.content {
  /* 给登录框设置一个固定的最大宽度，让它看起来更精致 */
  max-width: 1000px;
  width: 100%; /* 宽度会撑满 max-width */
  display: flex;
  justify-content: center;
  align-items: center;
}

.logo-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.app-title {
  font-size: 2rem;
  font-weight: bold;
  color: #333;
  margin-bottom: 20px;
}

.logo {
  display: block;
}
</style>