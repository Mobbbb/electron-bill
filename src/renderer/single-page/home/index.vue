<template>
	<Date
		ref="controller"
		:oldestDate="oldestDate"
		:latestDate="latestDate"
		@toolbar-label-change="toolbarLabelChange"
		@daytoolbar-label-change="daytoolbarLabelChange">
	</Date>
	<div class="chart-wrap">
		<div class="chart" ref="myChart"></div>
		<div class="chart-bottom">
			<div class="toolbar-wrap">
				<span>月范围选择：</span>
				<div class="toolbar-label month-left-label">{{ toolbarLabel.left }}</div>
				<div class="month-toolbar toolbar-chart" ref="toolbar"></div>
				<div class="toolbar-label month-right-label">{{ toolbarLabel.right }}</div>
			</div>
			<div class="toolbar-wrap">
				<span>日范围选择：</span>
				<div class="toolbar-label day-left-label">{{ toolbarLabel.dayLeft }}</div>
				<div class="day-toolbar toolbar-chart" ref="dayToolbar"></div>
				<div class="toolbar-label day-right-label">{{ toolbarLabel.dayRight }}</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed, ref, reactive } from 'vue'
import { useStore } from 'vuex'
import { getDateGroup, formatLimitData, getMonthTotal, transfromBillData } from '@renderer/utils'
import Date from '../components/Date.vue'

const store = new useStore()

const controller = ref(null)
const toolbarLabel = reactive({
	left: '1970-01',
	right: '1970-01',
	dayLeft: '1970-01-01',
	dayRight: '1970-01-01',
})
const billData = computed(() => store.state.app.billData)
const originBillData = computed(() => store.state.app.originBillData)
const oldestDate =  computed(() => billData.value.oldestDate || '1970-01-01')
const latestDate =  computed(() => billData.value.latestDate || '1970-01-01')

const toolbarLabelChange = ({ left, right }) => {
	toolbarLabel.left = left
	toolbarLabel.right = right
}
const daytoolbarLabelChange = ({ left, right }) => {
	toolbarLabel.dayLeft = left
	toolbarLabel.dayRight = right
}

const setBillData = (value) => store.commit('app/setBillData', value)
const setOriginBillData = (value) => store.commit('app/setOriginBillData', value)
const setConfigData = (value) => store.commit('app/setConfigData', value)
const setLimitData = (value) => store.commit('app/setLimitData', value)
const setLimitConfigData = (value) => store.commit('app/setLimitConfigData', value)

const getLimitConfig = async () => await window.call.getLimitConfig('admin')
const getBorrowData = async () => await window.call.getUserData('borrow.json', 'admin')
const getTypeConfig = async () => await window.call.getUserData('type.json', 'admin')

const getConfigData = async () => {
	const result = await Promise.all([getBorrowData(), getTypeConfig(), getLimitConfig()])
	const reverseTypeMap = {}
	Object.keys(result[1].data).forEach(key => reverseTypeMap[result[1].data[key]] = key)

	const configData = {
		borrow: result[0].data,
		typeMap: result[1].data,
		reverseTypeMap,
	}
	const limitConfigData = result[2].data
	setConfigData(configData)
	setLimitConfigData(limitConfigData)

	return limitConfigData
}

const getBillData = async (limitConfigData) => {
	if (originBillData.value.length) {
		const data = originBillData.value
		setOriginBillData([])
		transfromBillData(data, limitConfigData)
		const monthTotalYM = getMonthTotal(data)
		const groupData = getDateGroup(data, monthTotalYM)
		setBillData(groupData)
	} else {
		const password = sessionStorage.getItem('userToken')
		let result = await window.call.getUserData('data', 'admin', password)
		if (result.success) {
			const data = result.data
			transfromBillData(data, limitConfigData)
			const monthTotalYM = getMonthTotal(data)
			const groupData = getDateGroup(data, monthTotalYM)
			setBillData(groupData)
		} else {
			console.log('error')
		}
	}
	
}
const getLimitData = async (configData) => {
	let result = await window.call.getUserData('limit.json', 'admin')
	const limitData = formatLimitData(result.data, configData)
	setLimitData(limitData)
}

const initData = async () => {
	const limitConfigData = await getConfigData()
	await getLimitData(limitConfigData)
	getBillData(limitConfigData)
	controller.value.init()
}

initData()
</script>
