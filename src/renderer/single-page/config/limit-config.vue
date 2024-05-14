<template>
	<el-form :model="formData" ref="ruleFormRef" label-position="right" label-width="auto">
		<span class="form-group-title">· 限额设置 - {{ WORD_MAP.base }}</span>
		<div class="data-lists-wrap">
			<div class="data-lists-item" v-for="(item, index) in formData.base">
				<el-form-item label="名称"
					:prop="`base.${index}.name`"
					:rules="[{ required: true, message: '请填写', trigger: 'change' }]">
					<el-input style="width: 140px;" placeholder="请输入名称" v-model="item.name" />
				</el-form-item>
				<el-form-item label="金额"
					:prop="`base.${index}.value`"
					:rules="[{ required: true, message: '请填写', trigger: 'change' }]">
					<el-input-number
						style="width: 140px;"
						placeholder="请输入"
						v-model="item.value"
						:min="0"
						controls-position="right"
						class="config-number-input" />
				</el-form-item>
				<el-button size="small" :icon="Minus" type="danger"
					v-if="formData.base.length > 1 && !props.usedOriginLimitData.includes(item.oldName) && !usedKeyArr.includes(item.oldName)"
					circle 
					class="delete-icon"
					@click.prevent="removeList('base', index, item)">
				</el-button>
			</div>
			<div class="add-icon" @click="addList('base')"><el-icon><Plus /></el-icon></div>
		</div>
		<span class="form-group-title">· 设置 - {{ configData.typeMap[WORD_MAP.house] }}</span>
		<div class="data-lists-wrap">
			<div class="data-lists-item" v-for="(item, index) in formData.house">
				<el-form-item label="名称" 
					:prop="`house.${index}.name`"
					:rules="[{ message: '请填写', trigger: 'change', validator: (rule, value, callback) => {
						const fieldArr = rule.field.split('.')
						if (!value && formData[fieldArr[0]][fieldArr[1]].value) {
							callback(new Error('请填写'))
						} else {
							callback()
						}
					}}]">
					<el-input style="width: 140px;" placeholder="请输入名称" v-model="item.name" />
				</el-form-item>
				<el-form-item label="金额"
					:prop="`house.${index}.value`"
					:rules="[{ message: '请填写', trigger: 'change', validator: (rule, value, callback) => {
						const fieldArr = rule.field.split('.')
						if (!value && formData[fieldArr[0]][fieldArr[1]].name) {
							callback(new Error('请填写'))
						} else {
							callback()
						}
					}}]">
					<el-input-number
						style="width: 140px;"
						placeholder="请输入"
						v-model="item.value"
						:min="0"
						controls-position="right"
						class="config-number-input" />
				</el-form-item>
				<el-button size="small" :icon="Minus" type="danger"
					v-if="!props.usedOriginLimitData.includes(item.oldName) && !usedKeyArr.includes(item.oldName)"
					circle 
					class="delete-icon"
					@click.prevent="removeList('house', index, item)">
				</el-button>
			</div>
			<div class="add-icon" @click="addList('house')"><el-icon><Plus /></el-icon></div>
		</div>
		<span class="form-group-title">· 设置 - {{ configData.typeMap[WORD_MAP.car] }}</span>
		<div class="data-lists-wrap">
			<div class="data-lists-item" v-for="(item, index) in formData.car">
				<el-form-item label="名称"
					:prop="`car.${index}.name`"
					:rules="[{ message: '请填写', trigger: 'change', validator: (rule, value, callback) => {
						const fieldArr = rule.field.split('.')
						if (!value && formData[fieldArr[0]][fieldArr[1]].value) {
							callback(new Error('请填写'))
						} else {
							callback()
						}
					}}]">
					<el-input style="width: 140px;" placeholder="请输入名称" v-model="item.name" />
				</el-form-item>
				<el-form-item label="金额" 
					:prop="`car.${index}.value`"
					:rules="[{ message: '请填写', trigger: 'change', validator: (rule, value, callback) => {
						const fieldArr = rule.field.split('.')
						if (!value && formData[fieldArr[0]][fieldArr[1]].name) {
							callback(new Error('请填写'))
						} else {
							callback()
						}
					}}]">
					<el-input-number
						style="width: 140px;"
						placeholder="请输入"
						v-model="item.value"
						:min="0"
						controls-position="right"
						class="config-number-input" />
				</el-form-item>
				<el-button size="small" :icon="Minus" type="danger"
					v-if="!props.usedOriginLimitData.includes(item.oldName) && !usedKeyArr.includes(item.oldName)"
					circle 
					class="delete-icon"
					@click.prevent="removeList('car', index, item)">
				</el-button>
			</div>
			<div class="add-icon" @click="addList('car')"><el-icon><Plus /></el-icon></div>
		</div>
	</el-form>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { Minus, Plus } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { WORD_MAP } from '@renderer/config'

const route = useRoute()
const router = useRouter()
const store = new useStore()

const props = defineProps(['usedOriginLimitData'])
const emit = defineEmits(['update:oldNameList'])

const formData = reactive({
	base: [],
	house: [],
	car: [],
})

const ruleFormRef = ref()
const configData = computed(() => store.state.app.configData)
const limitConfigData = computed(() => store.state.app.limitConfigData)
const originLimitData = computed(() => store.state.app.originLimitData)
const usedKeyArr = computed(() => store.state.app.billData.usedKeyArr || [])

const addList = (key) => {
	formData[key].push({
		name: '',
		value: 0,
	})
}

const removeList = (key, index) => {
	formData[key].splice(index, 1)
	let arr = []
	Object.keys(formData).forEach(name => {
		arr = arr.concat(formData[name].map(item => item.oldName))
	})
	emit('update:oldNameList', arr)
}

const comfirm = async () => {
	return new Promise(resolve => {
		ruleFormRef.value.validate(async (valid, fields) => {
			let resolveRes = {
				success: false,
				msg: '限额校验未通过',
			}
			if (valid) {
				const params = {}
				const limitConfigParams = {}
				Object.keys(formData).forEach(key => {
					formData[key].forEach(item => {
						if (item.oldName
							&& props.usedOriginLimitData.includes(item.oldName)
							&& item.oldName !== `${key}_${item.name}`) {
							limitConfigParams[item.oldName] = `${key}_${item.name}`
						}
						if (item.name && item.value) {
							if (!params[key]) {
								params[key] = {}
								params[key][item.name] = item.value
							} else {
								params[key][item.name] = item.value
							}
						}
					})
				})
				let originData = []
				let hasChanged = false
				if (Object.keys(limitConfigParams).length) {
					originData = JSON.parse(JSON.stringify(window.originData))
					originData.forEach(item => {
						item.list.forEach(cell => {
							if (limitConfigParams[cell.key]) {
								hasChanged= true
								cell.key = limitConfigParams[cell.key]
							}
						})
					})
				}

				const res = await window.call.updateLimitConfig({
					params,
					originData: hasChanged ? originData : [],
					limitConfigParams,
					username: sessionStorage.getItem('username'),
					password: sessionStorage.getItem('userToken'),
				})
				resolveRes = res
			}
			resolve(resolveRes)
		})
	})
}

const init = () => {
	const arr = []
	Object.keys(formData).forEach(name => formData[name] = [])
	Object.keys(limitConfigData.value).forEach(key => {
		Object.keys(limitConfigData.value[key]).forEach(name => {
			formData[key].push({
				name,
				oldName: `${key}_${name}`,
				value: limitConfigData.value[key][name]
			})
			arr.push(`${key}_${name}`)
		})
	})
	emit('update:oldNameList', arr)
}

onMounted(() => {
	init()
})

defineExpose({
	comfirm,
	init,
})
</script>

<style scoped>
.data-lists-wrap {
	display: flex;
	flex-wrap: wrap;
}
.data-lists-item {
	border-radius: var(--el-card-border-radius);
    border: 1px solid var(--el-card-border-color);
    background-color: var(--el-card-bg-color);
    color: var(--el-text-color-primary);
    transition: var(--el-transition-duration);
	width: 185px;
	padding: 18px 12px 0 12px;
	box-shadow: var(--el-box-shadow-light);
	margin-left: 8px;
	margin-bottom: 8px;
	position: relative;
}
.delete-icon {
	position: absolute;
	right: -6px;
	top: -6px;
}
.add-icon {
	width: 128px;
    height: 128px;
	border: 1px dashed var(--el-border-color);
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    transition: var(--el-transition-duration-fast);
	display: inline-flex;
    justify-content: center;
    align-items: center;
	font-size: 28px;
    color: #8c939d;
	background-color: var(--el-fill-color-lighter);
	margin-left: 8px;
	margin-bottom: 8px;
}
.add-icon:hover {
	border-color: var(--el-color-primary);
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
</style>
