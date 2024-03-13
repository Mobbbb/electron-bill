<script setup lang="ts">
import { ref } from 'vue'
// const ipcHandle = () => window.electron.ipcRenderer.send('ping')
// const ipcHandle = async () => console.log(await window.call.rendererCallIpcMain())
// window.listen.ipcMainCallRenderer(value => console.log(value))
const imgInfo = ref({
	source: '',
	height: 0,
	width: 0,
	x: 0,
	y: 0,
	scaleFactor: 1,
})
const imgUrl = ref('')
const scanTop = 30
const scanBottom = 50
const scanLeft = 0
const imgWidth = 900
const imgHeight = 670 - scanBottom - scanTop

const canvas = document.createElement('canvas')
const ctx = canvas.getContext('2d')

const desktopCapturer = async () => {
	imgInfo.value = await window.call.desktopCapturer()
	const realImageWidth = imgWidth * imgInfo.value.scaleFactor
	const realImageHeight = imgHeight * imgInfo.value.scaleFactor

	ctx.clearRect(0, 0, realImageWidth, realImageHeight)
	let img = await new Promise(resolve => {
		let img = new Image()
		img.src = imgInfo.value.source
		if (img.complete) {
			resolve(img)
		} else {
			img.onload = () => resolve(img)
		}
	})

	const pos = {
		xRate: imgInfo.value.x / imgInfo.value.width,
		yRate: imgInfo.value.y / imgInfo.value.height
	}

	canvas.width = realImageWidth
	canvas.height = realImageHeight
	
	ctx.drawImage(
		img,
		// image的开始绘制点位
		(imgInfo.value.x + scanLeft) * imgInfo.value.scaleFactor,
		(imgInfo.value.y + scanTop + 7) * imgInfo.value.scaleFactor,
		realImageWidth, realImageHeight, // image的绘制区域大小
		0, 0, // canvas的开始绘制点位
		realImageWidth, realImageHeight, // canvas的绘制区域大小
	)
	imgUrl.value = canvas.toDataURL('image/png', 1.0)
}

</script>

<template>
	<div class="menu-bar"></div>
	<div class="scan-wrap" :style="{ height: `${imgHeight}px`, width: `${imgWidth}px` }">
		<div class="scan-background"></div>
		<img :src="imgUrl" />
	</div>
	<div class="footer" :style="{ height: `${scanBottom}px` }">
		<el-button type="primary" @click="desktopCapturer">Send IP1</el-button>
		<el-button type="primary" @click="imgUrl = ''">clear</el-button>
	</div>
</template>

<style scoped>
.menu-bar {
	background: #fff;
	box-shadow: 0 2px 8px 1px hsla(0, 0%, 39%, .1);
	width: 100%;
	-webkit-app-region: drag;
	-webkit-user-select: none;
	height: 30px;
}
.scan-wrap {
	position: relative;
	overflow: hidden;
	background-image:
    linear-gradient(0deg,
    transparent 24%,
    rgba(32, 255, 77, 0.1) 25%,
    rgba(32, 255, 77, 0.1) 26%,
    transparent 27%,
    transparent 74%,
    rgba(32, 255, 77, 0.1) 75%,
    rgba(32, 255, 77, 0.1) 76%,
    transparent 77%,
    transparent),
    linear-gradient(90deg,
    transparent 24%,
    rgba(32, 255, 77, 0.1) 25%,
    rgba(32, 255, 77, 0.1) 26%,
    transparent 27%,
    transparent 74%,
    rgba(32, 255, 77, 0.1) 75%,
    rgba(32, 255, 77, 0.1) 76%,
    transparent 77%,
    transparent);
	background-size: 3rem 3rem;
	background-position: -1rem -1rem;
}
.scan-background {
	animation: scan 2.5s infinite;
	animation-timing-function: cubic-bezier(0.53, 0, 0.43, 0.99);
	animation-delay: 1.4s;
	height: 100%;
	width: 100%;
	top: 0;
	position: absolute;
	background: linear-gradient(180deg, rgba(0, 255, 51, 0) 43%, #00ff33 211%);
	border-bottom: 3px solid #00ff33;
	transform: translateY(-100%);
}
@keyframes scan {
	0% {  
        transform: translateY(-110%);  
  }  
  
    100% {  
        transform: translateY(120%);  
  } 
}
.scan-wrap img {
	width: 100%;
	height: 100%;
}
</style>
