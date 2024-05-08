<template>
	<div>
		<span class="form-group-title" style="margin-top: 0;">· 限额</span>
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
			<el-select v-model="currentYearValue" multiple placeholder="统一设置月限额" style="width: 300px">
				<el-option-group
					v-for="(group, index) in limitConfigOption"
					:key="index"
					:label="group.label">
					<el-option
						v-for="(item, _index) in group.children"
						:key="`${index}${_index}`"
						:label="item.label"
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
	</div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, defineExpose } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { Minus, Plus, DArrowLeft, DArrowRight  } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import Back from '../components/Back.vue'
import MonthlyCalendar from './components/monthly-calendar.vue'
import { dateFormat, calculateDate, toMonth } from 'umob'

const route = useRoute()
const router = useRouter()
const store = new useStore()

const limitConfigOption = ref([])
const limitData = ref({})
const monthYear = ref(dateFormat(new Date()))
const currentYearValue = ref([])
const limitConfigData = computed(() => store.state.app.limitConfigData)

const changeYearValue = (value) => {
	const year = new Date(monthYear.value).getFullYear()
	limitData.value[year] = value
}

const changeCalendarYear = (value) => {
    if (typeof value === 'number') {
        const year = new Date(monthYear.value).getFullYear()
        monthYear.value = `${year + value}-01-01`
		// currentYearValue.value = limitData.value[year + value] || null
    }
}

const getCalendarCellClass = (data) => {
	let itemData = limitData.value[data.day.slice(0, 7)] || limitData.value[data.day.slice(0, 4)]

    let className = ''
    if (itemData) {
        className = 'red-calendar-cell'
    } else {
        className = 'no-data-month-cell'
    }
    return className
}

const formatCalendarCellData = (data) => {
	let itemData = limitData.value[data.day.slice(0, 7)] || limitData.value[data.day.slice(0, 4)]

	if (itemData) {
		return itemData + '元'
	} else {
		return '--'
	}
}

const clickMonthCalendar = (data) => {

}

const comfirm = async () => {
	console.log(limitData.value)
}

onMounted(() => {
	limitData.value = {
		...store.state.app.limitData
	}
	// currentYearValue.value = limitData.value[monthYear.value.slice(0, 4)]

	limitConfigOption.value = []
	Object.keys(limitConfigData.value).forEach(key => {
		const item = {
			label: key,
			children: [],
		}
		Object.keys(limitConfigData.value[key]).forEach(name => {
			item.children.push({
				label: name,
				value: limitConfigData.value[key][name]
			})
		})
		limitConfigOption.value.push(item)
	})
	console.log(limitConfigOption)
})

defineExpose({
	comfirm,
})
</script>

<style scoped>
.title-wrap {
	display: flex;
	justify-content: space-between;
	align-items: center;
    max-width: 512px;
	margin-top: 4px;
}
.limit-monthly-calendar {
    max-width: 512px;
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
