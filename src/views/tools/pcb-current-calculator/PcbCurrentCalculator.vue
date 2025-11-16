<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import './PcbCurrentCalculator.css'
const { t } = useI18n()

// 电气参数
const standard = ref('IPC-2221')
const layer = ref('外层')
const copper = ref('1') // 单位 oz

// 计算参数（设置默认值）
const traceWidthValue = ref<number | null>(1)   // 默认 1 mm
const traceWidthUnit = ref('mm')
// 将默认电流改为 2.392
const currentValue = ref<number | null>(2.392)   // 默认 2.392 A
const tempRiseValue = ref<number | null>(10)    // 默认 10 °C
const conductorLengthValue = ref<number | null>(1) // 默认 1 mm
const conductorLengthUnit = ref('mm')

// 单位换算常量（保留唯一声明）
const MIL_TO_MM = 0.0254
const MM_TO_MIL = 1 / MIL_TO_MM // ~39.3700787

// 联动：当线宽单位变化时同步导体长度单位并换算数值，反之亦然（使用 newVal, oldVal 避免循环）
// 注意：此处不再重新声明 MM_TO_MIL，直接使用上面唯一的常量
watch(( ) => traceWidthUnit.value, (newUnit, oldUnit) => {
  if (newUnit === oldUnit) return
  // 将 traceWidthValue 按单位转换
  if (traceWidthValue.value != null && !Number.isNaN(Number(traceWidthValue.value))) {
    if (oldUnit === 'mm' && newUnit === 'mil') {
      traceWidthValue.value = Number((Number(traceWidthValue.value) * MM_TO_MIL).toFixed(3))
    } else if (oldUnit === 'mil' && newUnit === 'mm') {
      traceWidthValue.value = Number((Number(traceWidthValue.value) / MM_TO_MIL).toFixed(3))
    }
  }
  // 保持导体长度单位同步（会触发其 watcher以换算导体长度）
  if (conductorLengthUnit.value !== newUnit) conductorLengthUnit.value = newUnit
})

watch(( ) => conductorLengthUnit.value, (newUnit, oldUnit) => {
  if (newUnit === oldUnit) return
  // 将 conductorLengthValue 按单位转换
  if (conductorLengthValue.value != null && !Number.isNaN(Number(conductorLengthValue.value))) {
    if (oldUnit === 'mm' && newUnit === 'mil') {
      conductorLengthValue.value = Number((Number(conductorLengthValue.value) * MM_TO_MIL).toFixed(3))
    } else if (oldUnit === 'mil' && newUnit === 'mm') {
      conductorLengthValue.value = Number((Number(conductorLengthValue.value) / MM_TO_MIL).toFixed(3))
    }
  }
  // 保持线宽单位同步
  if (traceWidthUnit.value !== newUnit) traceWidthUnit.value = newUnit
})

// 占位函数（实际公式由用户实现）
// 说明：函数先做输入校验，校验通过后在此处实现具体算法并把结果写回对应的响应式变量（例如 traceWidthValue / currentValue / tempRiseValue）
// 不要在这里抛出 alert，以便在单元测试或自动化环境下也可安全调用。

// 辅助常量
const OZ_TO_MM = 0.035
const OZ_TO_MIL = OZ_TO_MM / MIL_TO_MM // 1 oz in mils (~1.37795)

// 计算电流：根据 I = k * (ΔT^0.44) * (A^0.725)，A 单位为平方 mil
function calculateCurrent(): void {
  // 校验
  if (traceWidthValue.value == null || Number.isNaN(Number(traceWidthValue.value)) || Number(traceWidthValue.value) <= 0) {
    console.warn('calculateCurrent: missing or invalid traceWidthValue')
    return
  }
  if (tempRiseValue.value == null || Number.isNaN(Number(tempRiseValue.value))) {
    console.warn('calculateCurrent: missing or invalid tempRiseValue')
    return
  }
  // 获取线宽（mil）
  const widthMil = traceWidthUnit.value === 'mm'
    ? Number(traceWidthValue.value) * MM_TO_MIL
    : Number(traceWidthValue.value)

  if (widthMil <= 0) {
    console.warn('calculateCurrent: computed widthMil <= 0')
    return
  }

  // 铜厚（mil）
  const copperOz = Number(copper.value) || 1
  const thicknessMil = copperOz * OZ_TO_MIL
  if (thicknessMil <= 0) {
    console.warn('calculateCurrent: invalid copper thickness')
    return
  }

  // 截面积 A (mil^2)
  const areaMil2 = widthMil * thicknessMil
  if (areaMil2 <= 0) {
    console.warn('calculateCurrent: computed area <= 0')
    return
  }

  // ΔT
  const deltaT = Number(tempRiseValue.value)

  // k 值选择（保留 IPC-2512 的占位）
  let k = 0.048 // default IPC-2221 外层
  if (standard.value === 'IPC-2221') {
    k = layer.value === '外层' ? 0.048 : 0.024
  } else if (standard.value === 'IPC-2512') {
    // 占位值（可后续调整/替换为精确值）
    k = layer.value === '外层' ? 0.035 : 0.0175
  }

  // 公式计算
  const I = k * Math.pow(deltaT, 0.44) * Math.pow(areaMil2, 0.725)
  currentValue.value = Number(I.toFixed(3)) // 存储 3 位小数，展示由 formatVal 控制
}

// 计算线宽：反推 A，再由 A / thickness 得到宽度（单位与 traceWidthUnit 保持一致）
function calculateTraceWidth(): void {
  // 校验
  if (currentValue.value == null || Number.isNaN(Number(currentValue.value)) || Number(currentValue.value) <= 0) {
    console.warn('calculateTraceWidth: missing or invalid currentValue')
    return
  }
  if (tempRiseValue.value == null || Number.isNaN(Number(tempRiseValue.value))) {
    console.warn('calculateTraceWidth: missing or invalid tempRiseValue')
    return
  }

  const I = Number(currentValue.value)
  const deltaT = Number(tempRiseValue.value)

  // k 值选择
  let k = 0.048
  if (standard.value === 'IPC-2221') {
    k = layer.value === '外层' ? 0.048 : 0.024
  } else if (standard.value === 'IPC-2512') {
    k = layer.value === '外层' ? 0.035 : 0.0175
  }

  if (k <= 0) {
    console.warn('calculateTraceWidth: invalid k')
    return
  }

  // 铜厚（mil）
  const copperOz = Number(copper.value) || 1
  const thicknessMil = copperOz * OZ_TO_MIL
  if (thicknessMil <= 0) {
    console.warn('calculateTraceWidth: invalid copper thickness')
    return
  }

  // 根据公式 A = (I / (k * ΔT^0.44))^(1/0.725)
  const denom = k * Math.pow(deltaT, 0.44)
  if (denom <= 0) {
    console.warn('calculateTraceWidth: denom <= 0')
    return
  }
  const areaMil2 = Math.pow(I / denom, 1 / 0.725)
  if (!isFinite(areaMil2) || areaMil2 <= 0) {
    console.warn('calculateTraceWidth: computed invalid area')
    return
  }

  // 宽度（mil） = A / thicknessMil
  const widthMil = areaMil2 / thicknessMil
  if (!isFinite(widthMil) || widthMil <= 0) {
    console.warn('calculateTraceWidth: computed invalid widthMil')
    return
  }

  // 写回 traceWidthValue（保持当前单位）
  if (traceWidthUnit.value === 'mm') {
    const widthMm = widthMil * MIL_TO_MM
    traceWidthValue.value = Number(widthMm.toFixed(3))
  } else {
    traceWidthValue.value = Number(widthMil.toFixed(3))
  }
}

// 计算温升：反推 ΔT = (I / (k * A^0.725))^(1/0.44)
function calculateTemperatureRise(): void {
  // 校验
  if (traceWidthValue.value == null || Number.isNaN(Number(traceWidthValue.value)) || Number(traceWidthValue.value) <= 0) {
    console.warn('calculateTemperatureRise: missing or invalid traceWidthValue')
    return
  }
  if (currentValue.value == null || Number.isNaN(Number(currentValue.value)) || Number(currentValue.value) <= 0) {
    console.warn('calculateTemperatureRise: missing or invalid currentValue')
    return
  }

  // 获取线宽（mil）
  const widthMil = traceWidthUnit.value === 'mm'
    ? Number(traceWidthValue.value) * MM_TO_MIL
    : Number(traceWidthValue.value)

  // 铜厚（mil）
  const copperOz = Number(copper.value) || 1
  const thicknessMil = copperOz * OZ_TO_MIL
  if (thicknessMil <= 0) {
    console.warn('calculateTemperatureRise: invalid copper thickness')
    return
  }

  const areaMil2 = widthMil * thicknessMil
  if (areaMil2 <= 0) {
    console.warn('calculateTemperatureRise: computed area <= 0')
    return
  }

  const I = Number(currentValue.value)

  // k 值选择
  let k = 0.048
  if (standard.value === 'IPC-2221') {
    k = layer.value === '外层' ? 0.048 : 0.024
  } else if (standard.value === 'IPC-2512') {
    k = layer.value === '外层' ? 0.035 : 0.0175
  }

  const denom = k * Math.pow(areaMil2, 0.725)
  if (denom <= 0) {
    console.warn('calculateTemperatureRise: denom <= 0')
    return
  }

  const deltaT = Math.pow(I / denom, 1 / 0.44)
  if (!isFinite(deltaT) || deltaT < 0) {
    console.warn('calculateTemperatureRise: computed invalid deltaT')
    return
  }

  tempRiseValue.value = Number(deltaT.toFixed(3))
}

// 新增计算：将输入值换算为 mm / m，并计算副参数（截面积、单位长度电阻、总电阻、压降、功耗）
const traceWidthMm = computed(() => {
  if (traceWidthValue.value == null) return null
  const v = Number(traceWidthValue.value)
  return traceWidthUnit.value === 'mm' ? v : v * MIL_TO_MM
})

const copperThicknessMm = computed(() => {
  // 近似：1 oz ≈ 0.035 mm
  const oz = Number(copper.value) || 0
  return oz * 0.035
})

const conductorLengthM = computed(() => {
  if (conductorLengthValue.value == null) return null
  const v = Number(conductorLengthValue.value)
  const mm = conductorLengthUnit.value === 'mm' ? v : v * MIL_TO_MM
  return mm / 1000
})

const areaMm2 = computed(() => {
  if (traceWidthMm.value == null || copperThicknessMm.value == null) return null
  if (traceWidthMm.value <= 0 || copperThicknessMm.value <= 0) return null
  return traceWidthMm.value * copperThicknessMm.value
})

// 铜的电阻率（Ω·mm²/m）近似值
const COPPER_RESISTIVITY = 0.017241

// 单位长度电阻 Ω/m
const resistancePerMeter = computed(() => {
  if (areaMm2.value == null || areaMm2.value <= 0) return null
  return COPPER_RESISTIVITY / areaMm2.value
})

// 总电阻 Ω
const totalResistance = computed(() => {
  if (resistancePerMeter.value == null || conductorLengthM.value == null) return null
  return resistancePerMeter.value * conductorLengthM.value
})

// 单位长度压降 V/m = I * R_per_m
const voltagePerLength = computed(() => {
  if (resistancePerMeter.value == null || currentValue.value == null) return null
  return (Number(currentValue.value) * resistancePerMeter.value)
})

// 总压降 V
const totalVoltageDrop = computed(() => {
  if (voltagePerLength.value == null || conductorLengthM.value == null) return null
  return voltagePerLength.value * conductorLengthM.value
})

// 单位长度功耗 W/m = I^2 * R_per_m
const powerPerLength = computed(() => {
  if (resistancePerMeter.value == null || currentValue.value == null) return null
  return (Number(currentValue.value) ** 2) * resistancePerMeter.value
})

// 总功耗 W
const totalPower = computed(() => {
  if (powerPerLength.value == null || conductorLengthM.value == null) return null
  return powerPerLength.value * conductorLengthM.value
})

// 格式化：保留 3 位小数
const formatVal = (v: number | null | undefined, digits = 3) => (v == null || Number.isNaN(v) ? '-' : Number(v).toFixed(digits))

// 显示字符串（统一只显示公制小单位）
// 导体截面积（保持原有显示逻辑）
const areaDisplay = computed(() => {
  if (areaMm2.value == null) return '-'
  return `${formatVal(areaMm2.value, 3)} mm²`
})

// 单位长度电阻：统一显示 mΩ/mm（数值等于 Ω/m）
const resistancePerMeterDisplay = computed(() => {
  if (resistancePerMeter.value == null) return '-'
  return `${formatVal(resistancePerMeter.value, 3)} mΩ/mm`
})

// 总电阻，保持 Ω 显示
const totalResistanceDisplay = computed(() => {
  if (totalResistance.value == null) return '-'
  return `${formatVal(totalResistance.value, 3)} Ω`
})

// 单位长度压降：统一显示 mV/mm（数值等于 V/m）
const voltagePerLengthDisplay = computed(() => {
  if (voltagePerLength.value == null) return '-'
  return `${formatVal(voltagePerLength.value, 3)} mV/mm`
})

// 总压降（以 V 为单位）
const totalVoltageDropDisplay = computed(() => {
  if (totalVoltageDrop.value == null) return '-'
  return `${formatVal(totalVoltageDrop.value, 3)} V`
})

// 单位长度功耗：统一显示 mW/mm（数值等于 W/m）
const powerPerLengthDisplay = computed(() => {
  if (powerPerLength.value == null) return '-'
  return `${formatVal(powerPerLength.value, 3)} mW/mm`
})

// 总功耗（以 W 为单位）
const totalPowerDisplay = computed(() => {
  if (totalPower.value == null) return '-'
  return `${formatVal(totalPower.value, 3)} W`
})

// 在切换层类或铜厚时自动重新计算电流
watch(() => layer.value, (newV, oldV) => {
  if (newV === oldV) return
  calculateCurrent()
})

watch(() => copper.value, (newV, oldV) => {
  if (newV === oldV) return
  calculateCurrent()
})
</script>

<template>
  <div class="page-container">
    <div class="glass-container">
      <div class="pcb-form">
        <div class="section-container">
          <section class="section section-electrical">
            <h2 class="section-title">{{ t('electricalParams') }}</h2>
            <div class="field">
              <label class="field-label">{{ t('standardSelect') }}</label>
              <div class="field-control">
                <select v-model="standard" class="unit-select select-large control-full">
                  <option>IPC-2221</option>
                  <option>IPC-2512</option>
                </select>
              </div>
            </div>
            <div class="field">
              <label class="field-label">{{ t('layerType') }}</label>
              <div class="field-control">
                <select v-model="layer" class="unit-select select-large control-full">
                  <option>{{ t('internalLayer') }}</option>
                  <option>{{ t('externalLayer') }}</option>
                </select>
              </div>
            </div>
            <div class="field">
              <label class="field-label">{{ t('copperThicknessSelect') }}</label>
              <div class="field-control">
                <select v-model="copper" class="unit-select select-large control-full">
                  <option v-for="v in [0.5,1,2,3,4,5,6,7,8,9,10]" :key="v" :value="String(v)">{{ v }} oz</option>
                </select>
              </div>
            </div>
          </section>
        </div>
        <div class="section-container">
          <section class="section section-compute">
            <h2 class="section-title">{{ t('computeParams') }}</h2>
            <div class="field">
              <label class="field-label">{{ t('traceWidth') }}</label>
              <div class="field-control controls-inline">
                <input type="number" v-model.number="traceWidthValue" :placeholder="t('traceWidth')" class="control-full" />
                <select v-model="traceWidthUnit" class="unit-select unit-control">
                  <option value="mm">{{ t('unitMm') }}</option>
                  <option value="mil">{{ t('unitMil') }}</option>
                </select>
                <button class="btn" @click="calculateTraceWidth">{{ t('calculateTraceWidth') }}</button>
              </div>
            </div>
            <div class="field">
              <label class="field-label">{{ t('current') }}</label>
              <div class="field-control controls-inline">
                <input type="number" v-model.number="currentValue" :placeholder="t('current')" class="control-full" />
                <select class="unit-select unit-control" disabled>
                  <option>{{ t('currentUnit') }}</option>
                </select>
                <button class="btn" @click="calculateCurrent">{{ t('calculateCurrent') }}</button>
              </div>
            </div>
            <div class="field">
              <label class="field-label">{{ t('allowTempRise') }}</label>
              <div class="field-control controls-inline">
                <input type="number" v-model.number="tempRiseValue" :placeholder="t('allowTempRise')" class="control-full" />
                <select class="unit-select unit-control" disabled>
                  <option>{{ t('temperatureRiseUnit') }}</option>
                </select>
                <button class="btn" @click="calculateTemperatureRise">{{ t('calculateTemperatureRise') }}</button>
              </div>
            </div>
            <div class="field">
              <label class="field-label">{{ t('conductorLength') }}</label>
              <div class="field-control controls-inline">
                <input type="number" v-model.number="conductorLengthValue" :placeholder="t('conductorLength')" class="control-full" />
                <select v-model="conductorLengthUnit" class="unit-select unit-control">
                  <option value="mm">{{ t('conductorLengthUnit') }}</option>
                  <option value="mil">{{ t('unitMil') }}</option>
                </select>
              </div>
            </div>
            <div class="secondary-results">
              <div class="secondary-row">
                <span class="secondary-label">{{ t('area') }}：</span>
                <span class="secondary-value">{{ areaDisplay }}</span>
              </div>
              <div class="secondary-row">
                <span class="secondary-label">{{ t('resistancePerLen') }}：</span>
                <span class="secondary-value">{{ resistancePerMeterDisplay }}</span>
              </div>
              <div class="secondary-row">
                <span class="secondary-label">{{ t('totalResistance') }}：</span>
                <span class="secondary-value">{{ totalResistanceDisplay }}</span>
              </div>
              <div class="secondary-row">
                <span class="secondary-label">{{ t('voltagePerLen') }}：</span>
                <span class="secondary-value">{{ voltagePerLengthDisplay }}</span>
              </div>
              <div class="secondary-row">
                <span class="secondary-label">{{ t('totalVoltage') }}：</span>
                <span class="secondary-value">{{ totalVoltageDropDisplay }}</span>
              </div>
              <div class="secondary-row">
                <span class="secondary-label">{{ t('powerPerLen') }}：</span>
                <span class="secondary-value">{{ powerPerLengthDisplay }}</span>
              </div>
              <div class="secondary-row">
                <span class="secondary-label">{{ t('totalPower') }}：</span>
                <span class="secondary-value">{{ totalPowerDisplay }}</span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  </div>
</template>
