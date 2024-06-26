<template>
	<div class="home-wrap">
		<date-component
			:dateConfig="dateConfig"
			@toolbar-label-change="toolbarLabelChange"
			@daytoolbar-label-change="daytoolbarLabelChange">
		</date-component>
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
		<el-icon :size="20" class="config-set" @click="jumpToSetting"><Tools /></el-icon>
		<el-icon :size="20" class="document-add" @click="jumpToAdd">
			<Edit />
			<div class="red-point" v-if="!newBillDataHasSaved"></div>
		</el-icon>
		<el-icon :size="20" class="document-list" @click="jumpToList"><List /></el-icon>
	</div>
</template>

<script setup>
import { computed, ref, reactive } from 'vue'
import { useStore } from 'vuex'
import { Tools, Edit, List } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import DateComponent from '../components/Date.vue'

const store = new useStore()
const router = useRouter()

const toolbarLabel = reactive({
	left: '1970-01',
	right: '1970-01',
	dayLeft: '1970-01-01',
	dayRight: '1970-01-01',
})
const billData = computed(() => store.state.app.billData)
const newBillDataHasSaved = computed(() => store.state.app.newBillDataHasSaved)

const dateConfig = computed(() => {
	const oldestDate = billData.value.oldestDate || '1970-01'
	const latestDate = billData.value.latestDate || '1970-01'

	const latestYear = Number(latestDate.slice(0, 4))
	const oldestYear = Number(oldestDate.slice(0, 4))

	const arr = []
	for (let i = (latestYear - oldestYear + 1); i > 0; i--) {
		const year = latestYear + 1 - i
		arr.unshift({
			text: `${year}年`,
			value: [new Date(year, 0, 1), new Date(year, 11, 31)],
		})
	}
	return {
		monthShortcuts: arr,
		latestDate,
	}
})

const toolbarLabelChange = ({ left, right }) => {
	toolbarLabel.left = left
	toolbarLabel.right = right
}
const daytoolbarLabelChange = ({ left, right }) => {
	toolbarLabel.dayLeft = left
	toolbarLabel.dayRight = right
}

const jumpToAdd = () => {
	router.push({
		name: 'input',
	})
}

const jumpToList = () => {
	router.push({
		name: 'list',
	})
}

const jumpToSetting = () => {
	router.push({
		name: 'config',
	})
}
</script>

<style scoped>
.home-wrap {
	height: 100%;
	width: 100%;
	position: relative;
}
.config-set, .document-add, .document-list {
	position: absolute;
	right: 22px;
	top: 22px;
	color: #868686;
	cursor: pointer;
	transition: all .3s ease;
}
.document-add {
	left: 22px;
}
.document-list {
	right: 58px;
}
.document-add:hover, .config-set:hover, .document-list:hover {
	color: #222;
}
.red-point {
	position: absolute;
	background-color: #e59800;
	width: 6px;
	height: 6px;
	border-radius: 6px;
    right: -11px;
    top: 7px;
}
</style>
