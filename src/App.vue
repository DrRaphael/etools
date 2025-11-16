<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { onMounted, watch } from 'vue'
import logoUrl from './assets/logo.png'
const { t, locale } = useI18n() // 增加 locale 用于语言切换

// 设置浏览器标签页 favicon
function setFavicon(url: string) {
  let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement | null
  if (!link) {
    link = document.createElement('link')
    link.rel = 'icon'
    document.head.appendChild(link)
  }
  link.href = url
}

onMounted(() => {
  // 设置标签页 favicon 与标题
  setFavicon(logoUrl)
  document.title = t('appTitle')


})

// 可选：监听语言变化时更新标题
watch(() => t('appTitle'), (val) => { document.title = val })
</script>

<template>
  <header class="app-header">
    <router-link to="/" class="app-header__brand">
      <img :src="logoUrl" alt="logo" class="app-header__logo" />
      <span class="app-header__title">{{ t('appTitle') }}</span>
    </router-link>

    <!-- 语言切换下拉（靠右对齐，样式与其它下拉保持一致，尺寸略小） -->
    <div class="lang-switcher">
      <select v-model="locale" aria-label="切换语言" class="unit-select unit-control lang-select">
        <option value="zh-CN">中文</option>
        <option value="en-US">English</option>
      </select>
    </div>
  </header>
  <main>
    <router-view />
  </main>
  <!-- 全局固定底栏（页面最底部） -->
  <div class="page-footer">
    <span class="footer-copyright">{{ t('copyright') }}</span>
    <span class="footer-icp">
      <a
        href="https://beian.miit.gov.cn/#/Integrated/index"
        target="_blank"
        rel="noopener noreferrer"
      >
        {{ t('icpNumber') }}
      </a>
    </span>
  </div>
</template>

<style scoped>
/* filepath: E:\02-Project\etools\src\App.vue (local styles to align language switcher) */

/* 保证 header 为 flex 布局，品牌在左，语言选择靠右 */
.app-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 1rem;
  box-sizing: border-box;
}

/* 品牌左侧对齐保持原状 */
.app-header__brand {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
  color: inherit;
}

/* 让语言开关区域推到最右 */
.lang-switcher {
  margin-left: auto;
  display: flex;
  align-items: center;
}

/* 语言下拉使用与其它下拉相似的视觉风格，但尺寸略小 */
.lang-switcher .lang-select {
  font-size: 0.6rem;      /* 调小一号 */
  line-height: 1.2;
  padding: 0.3rem 0.7rem;  /* 增加内边距 */
  height: 34px;
  width: auto;
  min-width: 110px;        /* 更宽以容纳国旗与文字 */
  flex: 0 0 auto;
  border-radius: 6px;
  border: 1px solid rgba(0,0,0,0.18);
  background: rgba(255,255,255,0.95);
  color: rgba(0,0,0,0.8);
  box-sizing: border-box;
}

/* 窄屏再稍微缩小 */
@media (max-width: 600px) {
  .lang-switcher .lang-select {
    font-size: 0.6rem; /* 同步调小 */
    height: 32px;
    padding: 0.25rem 0.6rem;
    min-width: 100px;
  }
}
</style>
