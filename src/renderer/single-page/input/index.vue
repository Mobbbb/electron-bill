<template>
	<div class="block"></div>
	<el-card class="setting">
		<el-form :rules="stepRules1" :model="formData" ref="ruleFormRef" label-position="right" 
			label-width="auto"
			style="max-width: 375px; margin: 20px auto;">
			<el-form-item label="日期" prop="date">
				<el-date-picker
					placeholder="请选择日期"
					:editable="false" :clearable="false"
					type="date" v-model="formData.date">
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
			<el-form-item label="名称" prop="name">
				<el-input
				 	placeholder="请输入名称"
					v-model="formData.name" />
			</el-form-item>
		</el-form>
		<div class="data-lists-wrap">
			<el-card class="data-list-item" v-for="(item, index) in listData">
				<el-form label-position="right" 
					label-width="auto"
					style="max-width: 375px;">
					<el-form-item label="数据填写方式">
						<el-select v-model="item.dataType" placeholder="请选择" style="width: 200px;margin-right: 12px;">
							<el-option label="手工填写" :value="0" />
							<el-option label="计算未录入金额" :value="1" />
							<el-option label="从配置文件中选择" :value="2" />
						</el-select>
					</el-form-item>
					<el-form-item label="类别" prop="type">
						<el-select v-model="item.type" placeholder="请选择类别">
							<el-option
								v-for="(item, key) in configData.typeMap"
								:key="key"
								:label="item"
								:value="key" />
						</el-select>
					</el-form-item>
					<el-form-item label="名称" prop="name">
						<el-input
							placeholder="请输入名称"
							v-model="item.name" />
					</el-form-item>
					<el-form-item label="金额">
						<el-input-number
							style="width: 200px;margin-right: 12px;"
							placeholder="请输入金额"
							v-model="item.num"
							:min="0"
							controls-position="right" />
					</el-form-item>
					<el-form-item label="剩余金额" prop="rest">
						<el-input-number
							style="width: 200px;margin-right: 12px;"
							placeholder="请输入金额"
							v-model="item.rest"
							:min="0"
							controls-position="right" />
					</el-form-item>
					<el-form-item label="类别" prop="type">
						<el-select v-model="item.type" placeholder="请选择类别">
							<el-option
								v-for="(cell, key) in configData.typeMap"
								:key="key"
								:label="cell"
								:value="key" />
						</el-select>
					</el-form-item>
					<el-form-item label="配置文件" prop="key1">
						<el-select v-model="item.key1" placeholder="请选择配置文件">
							<el-option
								v-for="(cell, key) in limitConfigData"
								:key="key"
								:label="key"
								:value="key" />
						</el-select>
					</el-form-item>
					<el-form-item label="金额" prop="key2">
						<el-select v-model="item.key2" placeholder="请选择金额">
							<el-option
								v-for="(cell, key) in limitConfigData[item.key1]"
								:key="key"
								:label="cell"
								:value="key" />
						</el-select>
					</el-form-item>
				</el-form>
				<el-button size="small" :icon="Minus" type="danger"
					circle 
					class="delete-icon"
					@click.prevent="removeList(item)">
				</el-button>
			</el-card>
			<div class="add-icon" @click="addList"><el-icon><Plus /></el-icon></div>
		</div>
		<div style="text-align: center;margin: 24px 0;">
			<el-button size="large" type="primary" style="width: 300px;" @click="comfirm">录入</el-button>
		</div>
    </el-card>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { type } from '@renderer/config'
import { Delete, Plus, Minus } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const store = new useStore()

const formData = reactive({
	base: 0,
	house: 0,
	car: 0,
})

const listData = ref([{
	key: '',
	num: 0,
	dataType: 0,
}])

const stepRules1 = reactive({
	base: [{ required: true, message: '请设置基础开销', trigger: 'change', validator: (rule, value, callback) => {
		if (!value) callback(new Error())
		else callback()
	}}],
})
const ruleFormRef = ref()

const configData = computed(() => store.state.app.configData)
const limitConfigData = computed(() => store.state.app.limitConfigData)

const initData = (value) => store.dispatch('app/initData', value)

const addList = () => {
	listData.value.push({
		key: Date.now(),
		num: 0,
		dataType: 0,
	})
}

const removeList = (item) => {
	const index = listData.value.indexOf(item)
	if (index !== -1) {
		listData.value.splice(index, 1)
	}
}

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
.data-lists-wrap {
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	justify-content: center;
}
.data-list-item {
	width: 450px;
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
</style>
