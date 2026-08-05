<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import weatherKidsCloud from '../assets/weatherkids-cloud.webp'
import weatherKidsCloudFront from '../assets/weatherkids-cloud-front.webp'
import weatherKidsSky from '../assets/weatherkids-sky-cloudier.webp'

const cloudProgress = ref(0.13)
const MIN_CLOUD_SCROLL_DISTANCE = 1800
let cloudAnimationFrameId = 0

const clamp = (value, min, max) => Math.min(max, Math.max(min, value))

const backClouds = [
  {
    id: 'back-left-1',
    asset: weatherKidsCloud,
    side: 'left',
    crop: 60,
    width: 'clamp(420px, 48vw, 760px)',
    scale: 0.58,
    opacity: 0.46,
    blur: 1.2,
    fromY: 102,
    toY: -120,
    delay: 0.15,
    duration: 0.55,
  },
  {
    id: 'back-right-1',
    asset: weatherKidsCloud,
    side: 'right',
    crop: 60,
    width: 'clamp(460px, 54vw, 840px)',
    scale: 0.66,
    opacity: 0.5,
    blur: 0.8,
    fromY: 120,
    toY: -115,
    delay: 0.14,
    duration: 0.6,
    flip: true,
  },
  {
    id: 'back-left-2',
    asset: weatherKidsCloud,
    side: 'left',
    crop: 50,
    width: 'clamp(560px, 68vw, 1060px)',
    scale: 0.78,
    opacity: 0.58,
    blur: 0.4,
    fromY: 118,
    toY: -122,
    delay: 0,
    duration: 0.7,
  },
  {
    id: 'back-right-2',
    asset: weatherKidsCloud,
    side: 'right',
    crop: 66,
    width: 'clamp(500px, 62vw, 940px)',
    scale: 0.72,
    opacity: 0.54,
    blur: 0.7,
    fromY: 120,
    toY: -108,
    delay: 0.44,
    duration: 0.56,
    flip: true,
  },
]

const frontClouds = [
  {
    id: 'front-right-1',
    asset: weatherKidsCloudFront,
    side: 'right',
    crop: 80,
    width: 'clamp(760px, 98vw, 1500px)',
    scale: 1,
    opacity: 0.84,
    blur: 0,
    fromY: 122,
    toY: -125,
    delay: 0.02,
    duration: 0.72,
    flip: true,
  },
  {
    id: 'front-left-small-1',
    asset: weatherKidsCloudFront,
    side: 'left',
    crop: 65,
    width: 'clamp(520px, 64vw, 920px)',
    scale: 0.62,
    opacity: 0.72,
    blur: 0.12,
    fromY: 112,
    toY: -122,
    delay: -0.02,
    duration: 0.4,
  },
  {
    id: 'front-left-1',
    asset: weatherKidsCloudFront,
    side: 'left',
    crop: 80,
    width: 'clamp(800px, 104vw, 1580px)',
    scale: 1.04,
    opacity: 0.82,
    blur: 0.1,
    fromY: 126,
    toY: -450,
    delay: 0.4,
    duration: 0.6,
  },
  {
    id: 'front-right-2',
    asset: weatherKidsCloudFront,
    side: 'right',
    crop: 80,
    width: 'clamp(720px, 92vw, 1420px)',
    scale: 0.94,
    opacity: 0.78,
    blur: 0.15,
    fromY: 120,
    toY: -50,
    delay: 0.34,
    duration: 0.66,
    flip: true,
  },
]

const cloudStyle = (cloud) => {
  const localProgress = clamp((cloudProgress.value - cloud.delay) / cloud.duration, 0, 1)
  const easedProgress = localProgress * localProgress * (3 - 2 * localProgress)
  const yPosition = cloud.fromY + (cloud.toY - cloud.fromY) * easedProgress
  const xPosition = cloud.side === 'left' ? -cloud.crop : cloud.crop
  const style = {
    width: cloud.width,
    opacity: cloud.opacity,
    filter: `blur(${cloud.blur}px)`,
    transform: `translate3d(${xPosition}%, calc(${yPosition}vh - ${easedProgress * 100}%), 0) scale(${cloud.scale})`,
  }

  style[cloud.side] = '0'
  return style
}

const updateCloudScene = () => {
  cloudAnimationFrameId = 0
  const scrollDistance = Math.max(window.innerHeight * 2.25, MIN_CLOUD_SCROLL_DISTANCE)
  const scrollRatio = clamp(window.scrollY / scrollDistance, 0, 1)
  cloudProgress.value = 0.13 + scrollRatio * 0.87
}

const requestCloudSceneUpdate = () => {
  if (cloudAnimationFrameId) return
  cloudAnimationFrameId = requestAnimationFrame(updateCloudScene)
}

onMounted(() => {
  window.addEventListener('scroll', requestCloudSceneUpdate, { passive: true })
  window.addEventListener('resize', requestCloudSceneUpdate)
  requestCloudSceneUpdate()
})

onUnmounted(() => {
  window.removeEventListener('scroll', requestCloudSceneUpdate)
  window.removeEventListener('resize', requestCloudSceneUpdate)
  cancelAnimationFrame(cloudAnimationFrameId)
})
</script>

<template>
  <div
    class="weather-sky"
    :style="{ '--weather-sky-image': `url(${weatherKidsSky})` }"
    aria-hidden="true"
  ></div>

  <div class="weather-cloud-stage cloud-stage-back" aria-hidden="true">
    <div
      v-for="cloud in backClouds"
      :key="cloud.id"
      class="cloud-object"
      :style="cloudStyle(cloud)"
    >
      <img :src="cloud.asset" alt="" :class="{ 'is-flipped': cloud.flip }" />
    </div>
  </div>

  <div class="weather-cloud-stage cloud-stage-front" aria-hidden="true">
    <div
      v-for="cloud in frontClouds"
      :key="cloud.id"
      class="cloud-object"
      :style="cloudStyle(cloud)"
    >
      <img :src="cloud.asset" alt="" :class="{ 'is-flipped': cloud.flip }" />
    </div>
  </div>
</template>

<style scoped>
.weather-sky {
  position: fixed;
  z-index: 0;
  inset: 0;
  overflow: hidden;
  background-color: var(--weather-sky-base, #b3d9e9);
  box-shadow: var(--weather-sky-shadow, inset 0 0 120px rgb(255 255 255 / 20%));
  pointer-events: none;
}

.weather-sky::before,
.weather-sky::after {
  position: absolute;
  content: '';
}

.weather-sky::before {
  inset: -3%;
  background-image: var(--weather-sky-image);
  background-position: center;
  background-size: cover;
  filter: var(--weather-sky-image-filter, none);
  transform: translate3d(5%, -4%, 0) scale(1.05);
  transform-origin: center;
}

.weather-sky::after {
  inset: 0;
  background: var(
    --weather-sky-overlay,
    linear-gradient(
      180deg,
      rgb(211 233 245 / 47%) 0%,
      rgb(220 238 247 / 54%) 45%,
      rgb(184 221 237 / 72%) 72%,
      rgb(151 204 227 / 86%) 100%
    )
  );
}

.weather-cloud-stage {
  position: fixed;
  inset: 0;
  overflow: hidden;
  filter: var(--weather-cloud-filter, none);
  pointer-events: none;
}

.cloud-stage-back {
  z-index: 1;
}

.cloud-stage-front {
  z-index: 3;
}

.cloud-object {
  position: absolute;
  inset-block-start: 0;
  transform-origin: center;
  will-change: transform;
}

.cloud-object img {
  display: block;
  width: 100%;
  max-width: none;
  height: auto;
  filter: drop-shadow(0 24px 38px rgb(40 79 101 / 16%));
}

.cloud-object img.is-flipped {
  transform: scaleX(-1);
}

@media (max-width: 720px) {
  .cloud-stage-back {
    opacity: 0.78;
  }

  .cloud-stage-front {
    opacity: 0.62;
  }
}
</style>
