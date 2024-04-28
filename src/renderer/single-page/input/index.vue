<template>
	<div class="block"></div>
	<el-card class="setting">
		<Back></Back>
		<el-form :rules="rules" :model="formData" ref="ruleFormRef" label-position="right" 
			label-width="auto"
			style="max-width: 320px; margin: 20px auto;padding-right: 20px;">
			<el-form-item label="日期" prop="date">
				<el-date-picker
					placeholder="请选择日期"
					:editable="false" :clearable="false"
					type="date"
					v-model="formData.date"
					style="width: 100%;"
					value-format="YYYY-MM-DD">
				</el-date-picker>
			</el-form-item>
			<el-form-item label="类别" prop="type">
				<el-select v-model="formData.type" placeholder="请选择类别">
					<el-option
						v-for="(item, key) in configData.typeMap"
						:key="key"
						:label="item"
						:value="key" />
				</el-select>
			</el-form-item>
			<el-form-item label="一级名称" prop="label">
				<el-input
				 	placeholder="请输入名称"
					v-model="formData.label" />
			</el-form-item>
		</el-form>
		<div class="data-lists-wrap">
			<el-form label-position="right" 
				label-width="auto"
				ref="dynamicFormRef"
				:model="dynamicFormData"
				style="max-width: 100%;display: flex;flex-wrap:wrap;">
				<el-card class="data-lists-item" v-for="(item, index) in dynamicFormData.listData">
					<el-form-item label="数据来源">
						<el-select v-model="item.dataType" placeholder="请选择" style="width: 200px;margin-right: 12px;">
							<el-option label="手动录入" :value="0" />
							<el-option label="计算未录入金额" :value="1" />
							<el-option label="从配置文件中选择" :value="2" />
						</el-select>
					</el-form-item>
					<el-form-item v-if="formData.type === '*'" label="类别"
						:rules="[{ required: true, message: '请填写', trigger: 'change' }]">
						<el-select v-model="item.type" placeholder="请选择类别">
							<el-option
								v-for="(item, key) in configData.typeMap"
								:key="key"
								:label="item"
								:value="key" />
						</el-select>
					</el-form-item>
					<el-form-item label="二级名称"
						:prop="`listData.${index}.label`">
						<el-input
							placeholder="请输入名称"
							v-model="item.label" />
					</el-form-item>
					<el-form-item v-if="item.dataType === 0" label="金额"
						:prop="`listData.${index}.num`"
						:rules="[{ required: true, message: '请填写', trigger: 'change', validator: (rule, value, callback) => {
							if (!value) {
								callback(new Error('Please input the password again'))
							} else {
								callback()
							}
						}}]">
						<el-input-number
							style="width: 200px;margin-right: 12px;"
							placeholder="请输入金额"
							v-model="item.num"
							:min="0"
							controls-position="right" />
					</el-form-item>
					<el-form-item v-if="item.dataType === 1" label="剩余金额"
						:prop="`listData.${index}.rest`"
						:rules="[{ required: true, message: '请填写', trigger: 'change', validator: (rule, value, callback) => {
							if (!value) {
								callback(new Error('Please input the password again'))
							} else {
								callback()
							}
						}}]">
						<el-input-number
							style="width: 200px;margin-right: 12px;"
							placeholder="请输入金额"
							v-model="item.rest"
							:min="0"
							controls-position="right" />
					</el-form-item>
					<el-form-item v-if="item.dataType === 2" label="配置文件"
						:rules="[{ required: true, message: '请填写', trigger: 'change' }]">
						<el-select v-model="item.configFile" placeholder="请选择配置文件">
							<el-option
								v-for="(cell, key) in limitConfigData"
								:key="key"
								:label="WORD_MAP[key]"
								:value="key" />
						</el-select>
					</el-form-item>
					<el-form-item v-if="item.dataType === 2" label="金额"
						:rules="[{ required: true, message: '请填写', trigger: 'change' }]">
						<el-select v-model="item.selectNum" placeholder="请选择金额">
							<el-option
								v-for="(cell, key) in limitConfigData[item.configFile]"
								:key="key"
								:label="key + ' - ' + cell"
								:value="cell" />
						</el-select>
					</el-form-item>
					<el-button size="small" :icon="Minus" type="danger"
						v-if="index"
						circle 
						class="delete-icon"
						@click.prevent="removeList(item)">
					</el-button>
				</el-card>
			</el-form>
		</div>
		<div style="text-align: center;margin: 24px 0;padding-right: 20px;">
			<el-button :icon="Plus" @click="addList">添加</el-button>
			<el-button size="large" type="primary" style="width: 230px;" @click="comfirm">录入</el-button>
		</div>
    </el-card>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { type } from '@renderer/config'
import { Delete, Plus, Minus } from '@element-plus/icons-vue'
import Back from '../components/Back.vue'

const WORD_MAP = {
	'house': '房屋',
	'base': '基础',
	'car': '汽车',
}

const route = useRoute()
const router = useRouter()
const store = new useStore()

const formData = reactive({
	label: '',
	date: new Date(+new Date() + 28800000).toISOString().split('T')[0],
	type: '1',
})

const dynamicFormData = reactive({
	listData: [{
		label: '',
		dataType: 0,
	}]
})

const rules = reactive({
	label: [{ required: true, message: '请填写名称', trigger: 'change', }],
	date: [{ required: true, message: '', trigger: 'change', }],
	type: [{ required: true, message: '', trigger: 'change', }],
})
const ruleFormRef = ref()
const dynamicFormRef = ref()

const configData = computed(() => store.state.app.configData)
const limitConfigData = computed(() => store.state.app.limitConfigData)

const initData = (value) => store.dispatch('app/initData', value)

const addList = () => {
	dynamicFormData.listData.push({
		label: '',
		dataType: 0,
	})
}

const removeList = (item) => {
	const index = dynamicFormData.listData.indexOf(item)
	if (index !== -1) {
		dynamicFormData.listData.splice(index, 1)
	}
}

const comfirm = async () => {
	ruleFormRef.value.validate(async (valid, fields) => {
		if (valid) {
			dynamicFormRef.value.validate(async (valid, fields) => {
				if (valid) {
					console.log({
						...formData,
						list: dynamicFormData.listData,
					})
				}
			})
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
.data-lists-wrap {
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	justify-content: center;
}
.data-lists-item {
	position: relative;
	overflow: unset;
	margin: 0 24px 12px 0;
}
.delete-icon {
	position: absolute;
	right: -4px;
	top: -4px;
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
	margin: 0 0 12px 0;
}
.add-icon:hover {
	border-color: var(--el-color-primary);
}
</style>

<style>
.no-wrap-form-item .el-form-item__content {
	flex-wrap: nowrap;
}
.setting > .el-card__body {
	padding-top: 14px;
	padding-right: 0;
} 
</style>
