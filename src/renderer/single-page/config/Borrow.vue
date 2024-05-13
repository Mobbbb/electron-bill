<template>
	<div>
		<span class="form-group-title" style="margin-top: 0;">· 借款设置</span>
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
		</div>
		<monthly-calendar class="limit-monthly-calendar" :year="monthYear" @on-click="clickMonthCalendar">
			<template #dateCell="{ data }">
				<div class="date-cell month-date-cell" :class="getCalendarCellClass(data)">
					<p>{{ data.label }}</p>
					<p>{{ formatCalendarCellData(data) }}</p>
				</div>
			</template>
		</monthly-calendar>
		<el-dialog v-model="showMonthEdit" :title="currentMonthParams.label" width="185" top="30vh">
			<el-input-number v-model="currentMonthParams.value"></el-input-number>
			<template #footer>
				<el-button size="small" type="primary" @click="confirmMonthEdit">确定</el-button>
			</template>
		</el-dialog>
	</div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { DArrowLeft, DArrowRight  } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { dateFormat } from 'umob'
import MonthlyCalendar from './components/monthly-calendar.vue'

const route = useRoute()
const router = useRouter()
const store = new useStore()

const showMonthEdit = ref(false)
const currentMonthParams = ref([])
const borrowData = ref({})
const monthYear = ref(dateFormat(new Date()))
const typeMap = computed(() => store.state.app.configData.typeMap)

const changeCalendarYear = (value) => {
    if (typeof value === 'number') {
        const year = new Date(monthYear.value).getFullYear()
        monthYear.value = `${year + value}-01-01`
    }
}

const getCalendarCellClass = (data) => {
	let itemData = borrowData.value[data.day.slice(0, 7)]

    let className = ''
    if (itemData) {
        className = 'red-calendar-cell'
    } else {
        className = 'no-data-month-cell'
    }
    return className
}

const formatCalendarCellData = (data) => {
	let itemData = borrowData.value[data.day.slice(0, 7)]

	if (itemData) {
		return itemData + '元'
	} else {
		return '0元'
	}
}

const clickMonthCalendar = (data) => {
	currentMonthParams.value = {
		day: data.day,
		label: data.day.slice(0, 4) + '年' + data.label,
		value: borrowData.value[data.day.slice(0, 7)] || 0,
	}
	showMonthEdit.value = true
}

const confirmMonthEdit = () => {
	borrowData.value[currentMonthParams.value.day] = currentMonthParams.value.value
	showMonthEdit.value = false
}

window.comfirm = async () => {
	let hasChanged = false
	Object.keys(borrowData.value).forEach(key => {
		if (!borrowData.value[key]) {
			delete borrowData.value[key]
		} else if (borrowData.value[key] !== store.state.app.configData.borrow[key]) {
			hasChanged = true
		}
	})
	if (Object.keys(borrowData.value).length !== Object.keys(store.state.app.configData.borrow).length) {
		hasChanged = true
	}

	if (hasChanged) {
		const res = await window.call.updateConfigData({
			text: JSON.stringify(borrowData.value),
			fileName: 'borrow.json',
			username: sessionStorage.getItem('username')
		})
		if (res.success) {
			ElMessage.success('借款保存成功')
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
	borrowData.value = {
		...store.state.app.configData.borrow
	}
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
