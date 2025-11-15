<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import logoUrl from './assets/logo.png'
const { t } = useI18n()

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

  // 注入百度统计脚本
  ;(window as any)._hmt = (window as any)._hmt || []
  ;(function() {
    const hm = document.createElement('script')
    hm.src = 'https://hm.baidu.com/hm.js?35e56ef5bca847554cba315ef209d5e3'
    const s = document.getElementsByTagName('script')[0]
    s.parentNode!.insertBefore(hm, s)
  })()
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
  </header>
  <main>
    <router-view />
  </main>
  <!-- 全局固定底栏（页面最底部） -->
  <div class="page-footer">
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

<style>


</style>
