<template>
	<div>
		<span class="form-group-title" style="margin-top: 0;">· 每月限额设置</span>
		<div class="title-wrap">
			<div class="date-picker-wrap">
				<el-button  :icon="DArrowLeft" 
							class="header-icon-btn change-date-icon border-none-btn" 
							@click="changeCalendarYear(-1)">
				</el-button>
				<el-date-picker v-model="monthYear" 
								type="year"
								value-format="YYYY-MM-DD"
								placeholder="日期选择"
								style="width: 120px;" 
								:clearable="false" 
								:editable="false"
								@change="changeCalendarYear">
				</el-date-picker>
				<el-button  :icon="DArrowRight" 
							class="header-icon-btn change-date-icon border-none-btn" 
							@click="changeCalendarYear(1)">
				</el-button>
			</div>
			<el-select v-model="currentYearValue" multiple @change="changeYearValue"
				placeholder="统一设置月限额" style="width: 400px">
				<el-option-group
					v-for="(group, index) in limitConfigOption"
					:key="index"
					:label="group.label">
					<el-option
						v-for="(item, _index) in group.children"
						:key="`${index}${_index}`"
						:label="item.label"
						:disabled="!props.oldNameList.includes(item.value)"
						:value="item.value"/>
				</el-option-group>
			</el-select>
		</div>
		<monthly-calendar class="limit-monthly-calendar" :year="monthYear" @on-click="clickMonthCalendar">
			<template #dateCell="{ data }">
				<div class="date-cell month-date-cell" :class="getCalendarCellClass(data)">
					<p>{{ data.label }}</p>
					<p>{{ formatCalendarCellData(data) }}</p>
				</div>
			</template>
		</monthly-calendar>
		<el-dialog v-model="showMonthEdit" :title="currentMonthParams.label"
			width="400" top="30vh" :close-on-click-modal="false">
			<el-select v-model="currentMonthParams.value" multiple>
				<el-option-group
					v-for="(group, index) in limitConfigOption"
					:key="index"
					:label="group.label">
					<el-option
						v-for="(item, _index) in group.children"
						:key="`${index}${_index}`"
						:label="item.label"
						:disabled="!props.oldNameList.includes(item.value)"
						:value="item.value"/>
				</el-option-group>
			</el-select>
			<template #footer>
				<el-button size="small" @click="showMonthEdit = false">取消</el-button>
				<el-button size="small" type="primary" @click="confirmMonthEdit">确定</el-button>
			</template>
		</el-dialog>
	</div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { Minus, Plus, DArrowLeft, DArrowRight  } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { dateFormat } from 'umob'
import { HOUSE_ID, CAR_ID } from '@renderer/config'
import MonthlyCalendar from './components/monthly-calendar.vue'

const WORD_MAP = {
	'house': HOUSE_ID,
	'car': CAR_ID,
	'base': '基础',
}

const props = defineProps(['oldNameList'])
const emit = defineEmits(['update:originLimitData'])

const route = useRoute()
const router = useRouter()
const store = new useStore()

const showMonthEdit = ref(false)
const currentMonthParams = ref([])
const limitConfigOption = ref([])
const originLimitData = ref({})
const monthYear = ref(dateFormat(new Date()))
const currentYearValue = ref([])
const limitConfigData = computed(() => store.state.app.limitConfigData)
const typeMap = computed(() => store.state.app.configData.typeMap)

const changeYearValue = (value) => {
	const year = new Date(monthYear.value).getFullYear()
	originLimitData.value[year] = value
	emit('update:originLimitData', originLimitData.value)
}

const changeCalendarYear = (value) => {
    if (typeof value === 'number') {
        const year = new Date(monthYear.value).getFullYear()
        monthYear.value = `${year + value}-01-01`
		currentYearValue.value = originLimitData.value[year + value] || []
    }
}

const getCalendarCellClass = (data) => {
	let itemData = originLimitData.value[data.day.slice(0, 7)] || originLimitData.value[data.day.slice(0, 4)] || []

    let className = ''
    if (itemData.length) {
        className = 'red-calendar-cell'
    } else {
        className = 'no-data-month-cell'
    }
    return className
}

const formatCalendarCellData = (data) => {
	let itemData = originLimitData.value[data.day.slice(0, 7)] || originLimitData.value[data.day.slice(0, 4)] || []

	let totalNum = 0
	itemData.forEach(item => {
		const keyArr = item.split('_')
		totalNum += limitConfigData.value[keyArr[0]][keyArr[1]]
	})

	if (totalNum) {
		return totalNum + '元'
	} else {
		return '--'
	}
}

const clickMonthCalendar = (data) => {
	currentMonthParams.value = {
		day: data.day,
		label: data.day.slice(0, 4) + '年' + data.label,
		value: originLimitData.value[data.day.slice(0, 7)] || [],
	}
	showMonthEdit.value = true
}

const confirmMonthEdit = () => {
	originLimitData.value[currentMonthParams.value.day] = currentMonthParams.value.value
	emit('update:originLimitData', originLimitData.value)
	showMonthEdit.value = false
}

const comfirm = async () => {
	const res = await window.call.updateConfigData({
		text: JSON.stringify(originLimitData.value),
		fileName: 'limit.json',
		username: sessionStorage.getItem('username')
	})
	return res
}

const init = () => {
	originLimitData.value = {
		...store.state.app.originLimitData
	}
	emit('update:originLimitData', originLimitData.value)
	currentYearValue.value = originLimitData.value[monthYear.value.slice(0, 4)]

	limitConfigOption.value = []
	Object.keys(limitConfigData.value).forEach(key => {
		const id = WORD_MAP[key] || key
		const item = {
			label: typeMap.value[id] || id,
			children: [],
		}
		Object.keys(limitConfigData.value[key]).forEach(name => {
			item.children.push({
				label: name,
				value: `${key}_${name}`
			})
		})
		limitConfigOption.value.push(item)
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
.title-wrap {
	display: flex;
	justify-content: space-between;
	align-items: center;
    max-width: 600px;
	margin-top: 4px;
	padding-right: 12px;
	box-sizing: border-box;
}
.limit-monthly-calendar {
    max-width: 600px;
}
.date-cell {
    height: 100%;
    font-size: 12px;
}
.date-cell p:first-of-type {
    padding: 8px;
    font-size: 16px;
}

.red-calendar-cell p:first-of-type {
    color: #222;
}
.red-calendar-cell {
    background: #fae6e7;
    color: rgb(235, 68, 54);
    font-weight: bold;
}
.no-data-month-cell {
    color: #c0c4cc;
}
.month-date-cell p:first-of-type {
    font-weight: normal;
}
</style>

<style>

</style>
