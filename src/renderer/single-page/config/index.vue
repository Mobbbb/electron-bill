<template>
	<div class="block"></div>
	<el-card class="config-page">
		<Back class="nav-btn"></Back>
		<div class="config-form">
			<Limit @update:originLimitData="updateOriginLimitData" :oldNameList="oldNameList" ref="limitRef"></Limit>
			<LimitConfig @update:oldNameList="updateOldNameList" :usedOriginLimitData="usedOriginLimitData" ref="limitConfigRef"></LimitConfig>
			<el-divider><el-icon><star-filled /></el-icon></el-divider>
			<Borrow ref="borrowRef"></Borrow>
			<el-divider><el-icon><star-filled /></el-icon></el-divider>
			<Type ref="typeRef"></Type>
			<el-button type="info" size="small" plain @click="logout" class="logout-btn">退出登录</el-button>
			<div style="height: 52px;"></div>
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
import Borrow from './Borrow.vue'

const route = useRoute()
const router = useRouter()
const store = new useStore()

const limitConfigRef = ref()
const limitRef = ref()
const typeRef = ref()
const borrowRef = ref()
const usedOriginLimitData = ref([])
const oldNameList = ref([])

const newBillDataHasSaved = computed(() => store.state.app.newBillDataHasSaved)

const initData = (value) => store.dispatch('app/initData', value)
const updateNewBillDataSavedStatus = (value) => store.commit('app/updateNewBillDataSavedStatus', value)

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

const logout = () => {
	sessionStorage.removeItem('username')
	sessionStorage.removeItem('userToken')
	delete window.originData
	router.push({
		name: 'login',
	})
}

const configComfirm = () => {
	return new Promise(async resolve => {
		const res = await limitRef.value.comfirm()
		if (res.success) {
			const configRes = await limitConfigRef.value.comfirm()
			if (configRes.success) {
				ElMessage.success('限额保存成功')
				resolve({ success: true })
			} else {
				ElMessage.error(configRes.msg)
				resolve({ success: false })
			}
		} else {
			ElMessage.error(res.msg)
			resolve({ success: false })
		}
	})
}

const comfirm = async () => {
	if (!newBillDataHasSaved.value) { // 保存未保存的新数据
		const res = await window.call.updateUserData({
			username: sessionStorage.getItem('username'),
			password: sessionStorage.getItem('userToken'),
			fileName: 'data',
			text: window.originData,
		})
		if (res.success) {
			ElMessage.success('账单数据保存成功')
			updateNewBillDataSavedStatus(true)
		} else {
			ElMessage.error(res.msg)
			return
		}
	}

	const res = await Promise.all([configComfirm(), typeRef.value.comfirm(), borrowRef.value.comfirm()])
	if (res[0].success || res[1].success || res[2].success) {
		// 重新获取数据
		await initData({ username: sessionStorage.getItem('username') })

		if (res[0].success) {
			limitRef.value.init()
			limitConfigRef.value.init()
		}
		if (res[1].success) {
			typeRef.value.init()
		}
		if (res[2].success) {
			borrowRef.value.init()
		}
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
.logout-btn {
	margin: 32px auto 0;
	display: block;
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
