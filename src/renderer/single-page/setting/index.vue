<template>
	<div class="block"></div>
	<el-card class="setting">
		<el-steps class="setting-bar" :active="0" simple>
			<p>设置你的月开销上限</p>
		</el-steps>
		<el-form :rules="stepRules" :model="formData" ref="ruleFormRef" label-position="right" 
			label-width="auto"
			style="max-width: 275px; margin: 20px auto;">
			<el-form-item label="每月房贷" prop="house">
				<el-input-number
					style="width: 200px;"
				 	placeholder="请输入房贷"
					v-model="formData.house"
					:min="0"
					controls-position="right" />
			</el-form-item>
			<el-form-item label="每月车贷" prop="car">
				<el-input-number
					style="width: 200px;"
				 	placeholder="请输入车贷"
					v-model="formData.car"
					:min="0"
					controls-position="right" />
			</el-form-item>
			<el-form-item label="除房/车外的开销" prop="base">
				<el-input-number
					style="width: 200px;"
				 	placeholder="请输入剩余开销"
					v-model="formData.base"
					:min="0"
					controls-position="right" />
			</el-form-item>
			<el-form-item label="月开销上限合计:">
				<span class="total-text">
					{{ formData.base + formData.house + formData.car }} 元
				</span>
			</el-form-item>
			<el-button type="primary" style="margin-left: 78px;" @click="comfirm">完成</el-button>
		</el-form>
    </el-card>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'

const route = useRoute()
const router = useRouter()
const store = new useStore()

const formData = reactive({
	base: 0,
	house: 0,
	car: 0,
})

const KEY_MAP = {
	base: '基础开销 - V1',
	house: '房贷 - V1',
	car: '车贷 - V1',
}

const stepRules = reactive({
	base: [{ required: true, message: '请设置基础开销', trigger: 'change', validator: (rule, value, callback) => {
		if (!value) callback(new Error())
		else callback()
	}}],
})
const ruleFormRef = ref()

const initData = (value) => store.dispatch('app/initData', value)

const comfirm = async () => {
	ruleFormRef.value.validate(async (valid, fields) => {
		if (valid) {
			const limitConfig = {}
			const limitData = {}
			const currentYear = (new Date().getFullYear()).toString()
			limitData[currentYear] = []
			
			Object.keys(formData).forEach(key => {
				if (formData[key]) {
					const name = KEY_MAP[key] || formData[key]
					limitData[currentYear].push(`${key}_${name}`)
					limitConfig[key] = {}
					limitConfig[key][name] = formData[key]
				}
			})
			const username = route.query.username
			const password = route.query.password
			const result = await window.call.initAppData(username, password, {
				limitConfig,
				limitData,
			})
			if (result.success) {
				sessionStorage.setItem('username', username)
				sessionStorage.setItem('userToken', password)
				if (route.query.rememberUsername) {
					localStorage.setItem('bill-username', username)
				}
				await initData({ username })
				router.push({
					name: 'home',
				})
			}
		}
	})
}

</script>

<style scoped>
.block {
	padding-top: 20px;
}
.setting {
	margin: 0 20px;
}
.setting-bar {
	width: calc(100% - 60px);
	margin: 20px auto 40px auto;
	box-sizing: border-box;
}
.setting-bar p {
	text-align: center;
	width: 100%;
	font-weight: bold;
}
.total-text {
	color: rgb(235, 68, 54);
	font-weight:bold;
}
</style>
