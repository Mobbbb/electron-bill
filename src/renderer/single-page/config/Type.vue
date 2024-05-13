<template>
	<div>
		<span class="form-group-title" style="margin: 0 0 8px 0;display: block;">· 类别</span>
		<div class="type-tag-wrap" v-for="(item, index) in typeArr" :key="index">
			<el-input
				v-if="item.inputVisible"
				ref="InputItemRef"
				v-model="item.inputValue"
				class="edit-input"
				size="small"
				@keyup.enter="handleItemInputConfirm(item, index)"
				@blur="handleItemInputConfirm(item, index)" />
			<el-tag class="type-tag"
				v-else
				@click.native="showItemInput(item, index)"
				@close="handleClose(item, index)"
				:closable="!usedTypeArr.includes(item.value) && !READONLY_ID.includes(item.value)"
				:type="READONLY_ID.includes(item.value) ? 'danger' : 'primary'">
				{{ item.label }}
			</el-tag>
		</div>
		<el-input
			v-if="inputVisible"
			ref="InputRef"
			v-model="inputValue"
			class="edit-input"
			size="small"
			@keyup.enter="handleInputConfirm"
			@blur="handleInputConfirm"/>
		<el-button v-else class="button-new-tag" size="small" @click="showInput">
			+ New Tag
		</el-button>
	</div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { ElMessage } from 'element-plus'
import { dateFormat, calculateDate, toMonth } from 'umob'
import { READONLY_ID } from '@renderer/config'

const props = defineProps(['oldNameList'])
const emit = defineEmits(['update:originLimitData'])

const route = useRoute()
const router = useRouter()
const store = new useStore()

const inputValue = ref('')
const inputVisible = ref(false)
const InputRef = ref()
const InputItemRef = ref()
const usedTypeArr = computed(() => store.state.app.billData.usedTypeArr)
const typeMap = computed(() => store.state.app.configData.typeMap)
const typeArr = ref([])

const handleClose = (item, index) => {
	typeArr.value.splice(index, 1)
}

const showItemInput = (item, index) => {
	if (READONLY_ID.includes(item.value))  return
	item.inputVisible = true
	nextTick(() => {
		if (InputItemRef.value[0]) {
			InputItemRef.value[0].input.focus()
		}
	})
}

const handleItemInputConfirm = (item, index) => {
	if (item.inputValue) {
		item.label = item.inputValue
	}
	item.inputVisible = false
	item.inputValue = item.label
}

const showInput = () => {
	inputVisible.value = true
	nextTick(() => {
		if (InputRef.value) {
			InputRef.value.input.focus()
		}
	})
}

const handleInputConfirm = () => {
	if (inputValue.value) {
		let maxId = getMaxId()
		if (maxId) {
			maxId ++
			typeArr.value.push({
				value: maxId.toString(),
				label: inputValue.value,
				inputValue: inputValue.value,
				inputVisible: false,
			})
		}
	}
	inputVisible.value = false
	inputValue.value = ''
}

const getMaxId = () => {
	return Math.max(...[...usedTypeArr.value, ...typeArr.value.map(item => item.value)].filter(item => !Number.isNaN(Number(item))))
}

const comfirm = async () => {
	let hasChanged = false
	const obj = {}
	typeArr.value.forEach(item => {
		obj[item.value] = item.label
	})
	
	if (Object.keys(obj).length !== Object.keys(typeMap.value).length) {
		hasChanged = true
	} else {
		Object.keys(obj).forEach(key => {
			if (obj[key] !== typeMap.value[key]) {
				hasChanged = true
			}
		})
	}

	if (hasChanged) {
		const res = await window.call.updateConfigData({
			text: JSON.stringify(obj),
			fileName: 'type.json',
			username: sessionStorage.getItem('username')
		})
		if (res.success) {
			ElMessage.success('类别保存成功')
		} else {
			ElMessage.error(res.msg)
		}
		return res
	} else {
		return {
			success: false,
		}
	}
}

const init = () => {
	typeArr.value = []
	Object.keys(typeMap.value).forEach(key => {
		typeArr.value.push({
			label: typeMap.value[key],
			inputValue: typeMap.value[key],
			value: key.toString(),
			inputVisible: false,
		})
	})
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
.type-tag-wrap {
	display: inline-block;
	margin: 0 12px 8px 0;
}
.edit-input, .button-new-tag {
	width: 80px;
}
</style>
