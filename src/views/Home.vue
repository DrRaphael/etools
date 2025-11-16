<script setup lang="ts">
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
import './Home.css'
import logoUrl from '../assets/logo.png'
import overcurrentUrl from '../assets/overcurrent.png' // 新增：PCB电流计算工具图片
</script>

<template>
  <div class="page-container">
    <div class="tool-cards">
      <router-link to="/tools/pcb-current-calculator" class="tool-card">
        <div class="tool-card__title">{{ t('pcbCurrentCalculator') }}</div>
        <img :src="overcurrentUrl" :alt="t('pcbCurrentCalculator')" class="tool-card__img" />
        <div class="tool-card__footer">{{ t('enterTool') }}</div>
      </router-link>
      <router-link to="/tools/pcb-current-calculator" class="tool-card">
        <div class="tool-card__title">{{ t('pcbCurrentCalculator') }} 2</div>
        <img :src="logoUrl" :alt="t('pcbCurrentCalculator')" class="tool-card__img" />
        <div class="tool-card__footer">{{ t('enterTool') }}</div>
      </router-link>
      <router-link to="/tools/pcb-current-calculator" class="tool-card">
        <div class="tool-card__title">{{ t('pcbCurrentCalculator') }} 3</div>
        <img :src="logoUrl" :alt="t('pcbCurrentCalculator')" class="tool-card__img" />
        <div class="tool-card__footer">{{ t('enterTool') }}</div>
      </router-link>
      <router-link to="/tools/pcb-current-calculator" class="tool-card">
        <div class="tool-card__title">{{ t('pcbCurrentCalculator') }} 4</div>
        <img :src="logoUrl" :alt="t('pcbCurrentCalculator')" class="tool-card__img" />
        <div class="tool-card__footer">{{ t('enterTool') }}</div>
      </router-link>
      <router-link to="/tools/pcb-current-calculator" class="tool-card">
        <div class="tool-card__title">{{ t('pcbCurrentCalculator') }} 5</div>
        <img :src="logoUrl" :alt="t('pcbCurrentCalculator')" class="tool-card__img" />
        <div class="tool-card__footer">{{ t('enterTool') }}</div>
      </router-link>
      <router-link to="/tools/pcb-current-calculator" class="tool-card">
        <div class="tool-card__title">{{ t('pcbCurrentCalculator') }} 6</div>
        <img :src="logoUrl" :alt="t('pcbCurrentCalculator')" class="tool-card__img" />
        <div class="tool-card__footer">{{ t('enterTool') }}</div>
      </router-link>
      <!-- ...existing code... -->
    </div>
    <!-- ...existing code... -->
  </div>
</template>
