<template>
	<Date
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
import { getDateGroup, getMonthTotal } from '@renderer/utils'
import json from '@renderer/mock'
import Date from '../components/Date.vue'

const store = new useStore()

const toolbarLabel = reactive({
	left: '1970-01',
	right: '1970-01',
	dayLeft: '1970-01-01',
	dayRight: '1970-01-01',
})
const billData = computed(() => store.state.app.billData)

const oldestDate =  computed(() => billData.value.oldestDate || '2020-02-02')
const latestDate =  computed(() => billData.value.latestDate || '2020-02-02')

const setBillData = (value) => store.commit('app/setBillData', value)
const setMonthTotalYM = (value) => store.commit('app/setMonthTotalYM', value)

const toolbarLabelChange = ({ left, right }) => {
	toolbarLabel.left = left
	toolbarLabel.right = right
}
const daytoolbarLabelChange = ({ left, right }) => {
	toolbarLabel.dayLeft = left
	toolbarLabel.dayRight = right
}

const groupData = getDateGroup(json)
const monthTotalYM = getMonthTotal(json)
setBillData(groupData)
setMonthTotalYM(monthTotalYM)
</script>
