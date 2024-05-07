<template>
	<div class="block"></div>
	<el-card class="setting">
		<Back></Back>
		<el-form :rules="stepRules" :model="formData" ref="ruleFormRef" label-position="right" label-width="auto">
			<span class="form-group-title">· 基础开销</span>
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
							controls-position="right" />
					</el-form-item>
					<el-button size="small" :icon="Minus" type="danger"
						v-if="index"
						circle 
						class="delete-icon"
						@click.prevent="removeList('base', index, item)">
					</el-button>
				</div>
				<div class="add-icon" @click="addList('base')"><el-icon><Plus /></el-icon></div>
			</div>
			<span class="form-group-title">· 房贷</span>
			<div class="data-lists-wrap">
				<div class="data-lists-item" v-for="(item, index) in formData.house">
					<el-form-item label="名称" :prop="`house.${index}.name`">
						<el-input style="width: 140px;" placeholder="请输入名称" v-model="item.name" />
					</el-form-item>
					<el-form-item label="金额" :prop="`house.${index}.value`">
						<el-input-number
							style="width: 140px;"
							placeholder="请输入"
							v-model="item.value"
							:min="0"
							controls-position="right" />
					</el-form-item>
					<el-button size="small" :icon="Minus" type="danger"
						v-if="index"
						circle 
						class="delete-icon"
						@click.prevent="removeList('house', index, item)">
					</el-button>
				</div>
				<div class="add-icon" @click="addList('house')"><el-icon><Plus /></el-icon></div>
			</div>
			<span class="form-group-title">· 车贷</span>
			<div class="data-lists-wrap">
				<div class="data-lists-item" v-for="(item, index) in formData.car">
					<el-form-item label="名称" :prop="`car.${index}.name`">
						<el-input style="width: 140px;" placeholder="请输入名称" v-model="item.name" />
					</el-form-item>
					<el-form-item label="金额" :prop="`car.${index}.value`">
						<el-input-number
							style="width: 140px;"
							placeholder="请输入"
							v-model="item.value"
							:min="0"
							controls-position="right" />
					</el-form-item>
					<el-button size="small" :icon="Minus" type="danger"
						v-if="index"
						circle 
						class="delete-icon"
						@click.prevent="removeList('car', index, item)">
					</el-button>
				</div>
				<div class="add-icon" @click="addList('car')"><el-icon><Plus /></el-icon></div>
			</div>
			<el-button type="primary" style="margin: 20px auto 0px; display: block;" @click="comfirm">保存</el-button>
		</el-form>
    </el-card>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { type } from '@renderer/config'
import { Minus, Plus } from '@element-plus/icons-vue'
import Back from '../components/Back.vue'

const route = useRoute()
const router = useRouter()
const store = new useStore()

const formData = reactive({
	base: [],
	house: [],
	car: [],
})

const stepRules = reactive({
	base: [{ required: true, message: '请设置基础开销', trigger: 'change', validator: (rule, value, callback) => {
		if (!value) callback(new Error())
		else callback()
	}}],
})
const ruleFormRef = ref()
const configData = computed(() => store.state.app.configData)
const limitConfigData = computed(() => store.state.app.limitConfigData)
const limitData = computed(() => store.state.app.limitData)

const addList = (key) => {
	formData[key].push({
		name: '',
		value: 0,
	})
}

const removeList = (key, index) => {
	formData[key].splice(index, 1)
}

const comfirm = async () => {
	ruleFormRef.value.validate(async (valid, fields) => {
		if (valid) {
			
		}
	})
}

onMounted(() => {
	Object.keys(limitConfigData.value).forEach(key => {
		Object.keys(limitConfigData.value[key]).forEach(name => {
			formData[key].push({
				name,
				value: limitConfigData.value[key][name]
			})
		})
	})
	Object.keys(formData).forEach(key => {
		if (!formData[key].length) {
			formData[key] = [{
				name: '',
				value: 0,
			}]
		}
	})
})

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
}
.data-lists-item {
	border-radius: var(--el-card-border-radius);
    border: 1px solid var(--el-card-border-color);
    background-color: var(--el-card-bg-color);
    color: var(--el-text-color-primary);
    transition: var(--el-transition-duration);
	width: 150px;
	padding: 18px 12px 0 12px;
	box-shadow: var(--el-box-shadow-light);
	margin-left: 8px;
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
}
.add-icon:hover {
	border-color: var(--el-color-primary);
}
.form-group-title {
	display: inline-block;
	margin: 20px 0 4px 0;
	font-weight: bold;
}
</style>
