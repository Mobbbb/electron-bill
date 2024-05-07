<template>
	<div class="block"></div>
	<el-card class="setting">
		<el-steps style="max-width: 600px; margin: 20px auto 40px auto;" :active="0" simple>
			<p style="text-align: center;width: 100%;font-weight: bold;">设置你的月开销</p>
		</el-steps>
		<el-form :rules="stepRules" :model="formData" ref="ruleFormRef" label-position="right" 
			label-width="auto"
			style="max-width: 275px; margin: 20px auto;">
			<el-form-item label="基础开销" prop="base">
				<el-input-number
					style="width: 200px;"
				 	placeholder="请输入基础开销"
					v-model="formData.base"
					:min="0"
					controls-position="right" />
			</el-form-item>
			<el-form-item label="房贷" prop="house">
				<el-input-number
					style="width: 200px;"
				 	placeholder="请输入房贷"
					v-model="formData.house"
					:min="0"
					controls-position="right" />
			</el-form-item>
			<el-form-item label="车贷" prop="car">
				<el-input-number
					style="width: 200px;"
				 	placeholder="请输入车贷"
					v-model="formData.car"
					:min="0"
					controls-position="right" />
			</el-form-item>
			<el-button type="primary" style="margin-left: 78px;" @click="comfirm">完成</el-button>
		</el-form>
    </el-card>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { type } from '@renderer/config'

const route = useRoute()
const router = useRouter()
const store = new useStore()

const formData = reactive({
	base: 0,
	house: 0,
	car: 0,
})

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
			const limitData = {
				default: [],
			}
			Object.keys(formData).forEach(key => {
				if (formData[key]) {
					limitData.default.push(`${key}_${formData[key]}`)
					limitConfig[key] = {}
					limitConfig[key][formData[key]] = formData[key]
				}
			})
			const username = route.query.username
			const password = route.query.password
			const result = await window.call.initAppData(username, password, {
				limitConfig,
				limitData,
				type,
			})
			if (result.success) {
				sessionStorage.setItem('username', username)
				sessionStorage.setItem('userToken', password)
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
</style>
