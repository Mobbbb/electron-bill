<template>
	<div class="block"></div>
	<el-card class="config-page">
		<Back class="nav-btn"></Back>
		<div class="config-form">
			<Limit @update:originLimitData="updateOriginLimitData" :oldNameList="oldNameList" ref="limitRef"></Limit>
			<LimitConfig @update:oldNameList="updateOldNameList" :usedOriginLimitData="usedOriginLimitData" ref="limitConfigRef"></LimitConfig>
			<el-divider>
				<el-icon><star-filled /></el-icon>
			</el-divider>
			<Type></Type>
			<div style="height: 60px;"></div>
		</div>
		<div class="save-btn-wrap">
			<el-button type="primary" class="save-btn" @click="comfirm">保存</el-button>
		</div>
    </el-card>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { StarFilled } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import Back from '../components/Back.vue'
import LimitConfig from './limit-config.vue'
import Limit from './Limit.vue'
import Type from './Type.vue'

const route = useRoute()
const router = useRouter()
const store = new useStore()

const limitConfigRef = ref()
const limitRef = ref()
const usedOriginLimitData = ref([])
const oldNameList = ref([])

const initData = (value) => store.dispatch('app/initData', value)

const updateOriginLimitData = (data) => {
	usedOriginLimitData.value = []
	Object.keys(data).forEach(key => {
		usedOriginLimitData.value = usedOriginLimitData.value.concat(data[key])
	})
	usedOriginLimitData.value = [...new Set(usedOriginLimitData.value)]
}

const updateOldNameList = (data) => {
	oldNameList.value = data
}

const comfirm = async () => {
	const res = await limitRef.value.comfirm()
	if (res.success) {
		const res2 = await limitConfigRef.value.comfirm()
		if (res2.success) {
			ElMessage.success(res2.msg)
			await initData({ username: sessionStorage.getItem('username') })
			limitRef.value.init()
			limitConfigRef.value.init()
		} else {
			ElMessage.error(res2.msg)
		}
	} else {
		ElMessage.error(res.msg)
	}
}
</script>

<style scoped>
.block {
	padding-top: 20px;
}
.config-page {
	margin: 0 20px;
	height: calc(100% - 40px);
	position: relative;
}
.nav-btn {
	height: 20px;
	padding-bottom: 20px;
}
.config-form {
	height: calc(100% - 40px);
	overflow: scroll;
	box-sizing: border-box;
}
.save-btn-wrap {
	position: absolute;
	bottom: 0;
	height: 60px;
	width: 100%;
	left: 0;
	background: white;
	display: flex;
	align-items: center;
	justify-content: center;
	box-shadow: 0px 0px 12px rgba(0, 0, 0, 0.12);
	z-index: 100;
}
.save-btn {
	display: block;
	width: 200px;
}
</style>

<style>
.config-number-input.el-input-number.is-controls-right .el-input__wrapper {
	padding-left: 8px;
}
.config-page > .el-card__body {
	height: 100%;
	box-sizing: border-box;
}
.form-group-title {
	display: inline-block;
	margin: 20px 0 6px 0;
	font-weight: bold;
}
</style>
