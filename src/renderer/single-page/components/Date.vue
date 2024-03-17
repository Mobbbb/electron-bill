<template>
	<div class="date-wrap">
		<el-radio-group v-model="pickerType" @change="changeDateType" class="switch-radio">
			<el-radio-button :value="0">年</el-radio-button>
			<el-radio-button :value="1">月</el-radio-button>
			<el-radio-button :value="2">详</el-radio-button>
		</el-radio-group>
		<el-date-picker
			:disabled="!pickerType"
			:editable="false"
			:clearable="false"
			:shortcuts="dateConfig.monthShortcuts"
			type="monthrange"
			v-model="detailRange"
			range-separator="To"
			start-placeholder="Start"
			end-placeholder="End"
			class="date-picker"
			popper-class="date-picker-popper detail-picker-popper"
			@change="changeDate" 
			v-if="pickerType === 2">
		</el-date-picker>
		<el-date-picker
			:disabled="!pickerType"
			:editable="false"
			:clearable="false"
			:shortcuts="dateConfig.monthShortcuts"
			type="monthrange"
			v-model="monthRange"
			range-separator="To"
			start-placeholder="Start"
			end-placeholder="End"
			class="date-picker"
			popper-class="date-picker-popper"
			@change="changeDate"
			v-else>
		</el-date-picker>
		<el-switch v-model="detailEchartsType"
			v-if="pickerType === 2"
			inline-prompt
			active-value="bar"
			inactive-value="pie"
			active-text="Bar"
			inactive-text="Pie"
			:width="50"
			@change="changeEchartsType"
			class="type-switch"
			style="--el-switch-off-color: #13ce66" />
	</div>
</template>

<script>
import {
    splitGroupObjByType,
    filterGroupObjByRange,
    transformGroupObj2DateArr,
    transformGroupObj2DetailArr,
    filterDataListByDate,
} from '@renderer/utils'
import { dateFormat, getTextSize, getAllDateBetweenGap } from '@renderer/utils/libs'
import * as echarts from 'echarts'
import { getBarOption, getToolbarOption, getPieOption } from '@renderer/config/options'

const chartInstance = {
    bar: null,
    pie: null,
    toolbar: null,
    dayToolbar: null,
}

export default {
	props: ['dateConfig'],
	data() {
        const date = new Date(`${this.dateConfig.latestDate}-01`)
        const currentYear = date.getFullYear()
        
        return {
            pickerType: 1, // 图表横坐标类型
            monthRange: [new Date(currentYear, 0, 1), new Date(currentYear, 11, 31)],
            detailRange: [new Date(currentYear, date.getMonth(), 1), new Date(currentYear, date.getMonth() + 1, 0)],
            type: '15',
            detailEchartsType: 'bar',
        }
    },
	computed: {
		billData() {
			return this.$store.state.app.billData
		},
		configData() {
			return this.$store.state.app.configData
		},
	},
    mounted() {
        this.renderEchartsByType()
        window.onresize = function() {
            chartInstance.bar?.resize()
            chartInstance.pie?.resize()
            chartInstance.toolbar?.resize()
            chartInstance.dayToolbar?.resize()
        }
    },
    methods: {
        renderEchartsByType() {
            if (!this.pickerType) { // 年
                this.$nextTick(() => {
                    document.getElementsByClassName('el-range-input')[0].value = this.billData.oldestDate.slice(0, 4)
                    document.getElementsByClassName('el-range-input')[1].value = this.billData.latestDate.slice(0, 4)
                    this.renderYearEcharts()
                })
            } else if (this.pickerType === 1) { // 月
                this.showDocument(document.getElementsByClassName('chart-bottom')[0])
                this.renderMonthEcharts()
                this.renderMonthToolbar(this.monthRange)
                this.renderDayToolbar(this.monthRange)
            } else { // 详
                this.showDocument(document.getElementsByClassName('chart-bottom')[0])
                this.renderDetailEcharts()
                this.renderMonthToolbar(this.detailRange)
                this.renderDayToolbar(this.detailRange)
            }
        },
        renderMonthEcharts() {
            const startDate = dateFormat(this.monthRange[0])
            const endDate = dateFormat(this.monthRange[1])
            const groupObj = filterGroupObjByRange(this.billData.dateGroupYM, [startDate, endDate], 'date')
            const data = transformGroupObj2DateArr(groupObj)
            this.renderBarEcharts({
                data: data.map(item => {
                    const labelConfig = {
                        fontSize: '12px',
                        formatter: () => item.cost,
                    }
                    if (!item.isOverRate) {
                        const { width } = getTextSize(item.cost, labelConfig.fontSize)
                        labelConfig.position = ['50%', `${item.overRate * 100}%`]
                        labelConfig.offset = [-width / 2, -17]
                    }
                    return {
                        value: item.data,
                        itemStyle: {
                            color: item.isOverRate ? new echarts.graphic.LinearGradient(
                                0, 0, 0, 1,
                                [
                                    { offset: 0, color: 'rgb(235, 68, 54)' },
                                    { offset: item.overRate, color: 'rgb(235, 68, 54)' },
                                    { offset: item.overRate, color: '#6699ff' },
                                    { offset: 1, color: '#6699ff' },
                                ]
                            ) : new echarts.graphic.LinearGradient(
                                0, 0, 0, 1,
                                [
                                    { offset: 0, color: '#f9c8c833' },
                                    { offset: item.overRate, color: '#f9c8c833' },
                                    { offset: item.overRate, color: '#6699ff' },
                                    { offset: 1, color: '#6699ff' },
                                ]
                            ),
                        },
                        label: labelConfig,
                    }
                }),
                xAxis: data.map(item => item.date),
            })
        },
        renderDetailEcharts() {
            const dataList = filterDataListByDate(this.billData.dateGroupYM, this.detailRange)
            const groupObj = splitGroupObjByType(dataList)
            const data = transformGroupObj2DetailArr(groupObj)
            if (this.detailEchartsType === 'bar') {
                this.renderBarEcharts({ data: data.map(item => item.data), xAxis: data.map(item => item.key) })
            } else {
                this.renderPieEcharts(data.map(item => ({
                    value: item.data,
                    name: item.key,
                })).sort((a, b) => b.value - a.value))
            }
        },
        renderYearEcharts() {
            const startDate = this.billData.oldestDate.slice(0, 4)
            const endDate = this.billData.latestDate.slice(0, 4)
            const groupObj = filterGroupObjByRange(this.billData.dateGroupY, [startDate, endDate], 'number')
            const data = transformGroupObj2DateArr(groupObj)
            this.renderBarEcharts({ data: data.map(item => item.data), xAxis: data.map(item => item.date) })
            this.hideDocument(document.getElementsByClassName('chart-bottom')[0])
        },
        changeEchartsType() {
            this.clearPie()
            this.clearBar()
            this.renderDetailEcharts()
        },
        clearPie() {
            chartInstance.pie?.clear()
            chartInstance.pie?.dispose()
            chartInstance.pie = null
        },
        clearBar() {
            chartInstance.bar?.clear()
            chartInstance.bar?.dispose()
            chartInstance.bar = null
        },
        renderPieEcharts(data) {
            this.clearBar()
            if (!chartInstance.pie) {
                const chartDom = document.getElementsByClassName('chart')[0]
                chartInstance.pie = echarts.init(chartDom)
                const option = getPieOption(data)
                chartInstance.pie.setOption(option)
            } else {
                const option = getPieOption(data)
                chartInstance.pie.setOption(option, true)
            }
        },
        // 渲染柱状图
        renderBarEcharts(data) {
            this.clearPie()
            if (!chartInstance.bar) {
                const chartDom = document.getElementsByClassName('chart')[0]
                chartInstance.bar = echarts.init(chartDom)
                const option = getBarOption(data, this)
                chartInstance.bar.setOption(option)
                chartInstance.bar.on('click', (params) => {
                    if (!this.pickerType) { // 年 -> 月
                        this.monthRange = [new Date(params.name, 0, 1), new Date(params.name, 11, 31)]
                        this.pickerType = 1
                        this.renderEchartsByType()
                    } else if (this.pickerType === 1) { // 月 -> 详
                        this.detailRange = [
                            `${params.name}-01`,
                            new Date(params.name.slice(0, 4), params.name.slice(5, 7), 0),
                        ]
                        this.pickerType = 2
                        this.renderEchartsByType()
                    }
                })
            } else {
                const option = getBarOption(data, this)
                chartInstance.bar.setOption(option, true)
            }
        },
        renderMonthToolbar(range) {
            let startValue = dateFormat(range[0], 'yyyy-MM')
            startValue = startValue < this.billData.oldestDate ? this.billData.oldestDate : startValue
            startValue = startValue > this.billData.latestDate ? this.billData.latestDate : startValue
            let endValue = dateFormat(range[1], 'yyyy-MM')
            endValue = endValue > this.billData.latestDate ? this.billData.latestDate : endValue

            const data = {
                xAxis: this.billData.allMonthArr,
                startValue,
                endValue,
            }

            this.$emit('toolbar-label-change', {
                left: startValue,
                right: endValue,
            })

            if (!chartInstance.toolbar) {
                const chartDom = document.getElementsByClassName('month-toolbar')[0]
                const dayToolbar = document.getElementsByClassName('day-toolbar')[0]
                chartInstance.toolbar = echarts.init(chartDom)
                const option = getToolbarOption(data)
                chartInstance.toolbar.setOption(option)

                chartInstance.toolbar.on('datazoom', (params) => {
                    let endValue = chartInstance.toolbar.getOption().dataZoom[0].endValue
                    let startValue = chartInstance.toolbar.getOption().dataZoom[0].startValue
                    let startDate = this.billData.allMonthArr[startValue]
                    let endDate = this.billData.allMonthArr[endValue]
                    const rangeDate = [
                        `${startDate}-01 00:00:00`,
                        `${endDate}-01 00:00:00`,
                    ]
                    
                    this.$emit('toolbar-label-change', {
                        left: startDate,
                        right: endDate,
                    })
                    if (dayToolbar) {
                        this.renderDayToolbar(rangeDate)
                    }

                    if (this.pickerType === 1) { // 月
                        this.monthRange = rangeDate
                        this.renderMonthEcharts()
                    } else if (this.pickerType === 2) { // 详
                        this.detailRange = [
                            `${startDate}-01`,
                            new Date(endDate.slice(0, 4), endDate.slice(5, 7), 0),
                        ]
                        this.renderDetailEcharts()
                    }
                })
            } else {
                const option = getToolbarOption(data)
                chartInstance.toolbar.setOption(option)
            }
        },
        renderDayToolbar(range) {
            let startValue = dateFormat(range[0], 'yyyy-MM')
            startValue = startValue < this.billData.oldestDate ? this.billData.oldestDate : startValue
            startValue = startValue > this.billData.latestDate ? this.billData.latestDate : startValue
            let endValue = dateFormat(range[1], 'yyyy-MM')
            endValue = endValue > this.billData.latestDate ? this.billData.latestDate : endValue
            const toolbarStartValue = `${startValue}-01`
            const toolbarEndValue = dateFormat(new Date(endValue.slice(0, 4), endValue.slice(5, 7), 0), 'yyyy-MM-dd')
            this.billData.xAxisDayArr = getAllDateBetweenGap(toolbarStartValue, toolbarEndValue)
            
            const data = {
                xAxis: this.billData.xAxisDayArr,
                startValue: toolbarStartValue,
                endValue: toolbarEndValue,
            }

            this.$emit('daytoolbar-label-change', {
                left: toolbarStartValue,
                right: toolbarEndValue,
            })

            if (!chartInstance.dayToolbar) {
                const chartDom = document.getElementsByClassName('day-toolbar')[0]
                chartInstance.dayToolbar = echarts.init(chartDom)
                const option = getToolbarOption(data)
                chartInstance.dayToolbar.setOption(option)

                chartInstance.dayToolbar.on('datazoom', (params) => {
                    let endValue = chartInstance.dayToolbar.getOption().dataZoom[0].endValue
                    let startValue = chartInstance.dayToolbar.getOption().dataZoom[0].startValue

                    this.$emit('daytoolbar-label-change', {
                        left: this.billData.xAxisDayArr[startValue],
                        right: this.billData.xAxisDayArr[endValue],
                    })

                    if (this.pickerType) {
                        if (this.pickerType === 1) { // 月
                            this.monthRange = [this.billData.xAxisDayArr[startValue], this.billData.xAxisDayArr[endValue]]
                            this.renderMonthEcharts()
                        } else if (this.pickerType === 2) { // 详
                            this.detailRange = [this.billData.xAxisDayArr[startValue], this.billData.xAxisDayArr[endValue]]
                            this.renderDetailEcharts()
                        }
                    }
                })
            } else {
                const option = getToolbarOption(data)
                chartInstance.dayToolbar.setOption(option)
            }
        },
        changeDate() {
            if (this.pickerType === 1) {
                this.monthRange = [
                    this.monthRange[0],
                    new Date(this.monthRange[1].getFullYear(), this.monthRange[1].getMonth() + 1, 0)
                ]
            } else if (this.pickerType === 2) {
                this.detailRange = [
                    this.detailRange[0],
                    new Date(this.detailRange[1].getFullYear(), this.detailRange[1].getMonth() + 1, 0)
                ]
            }
            this.renderEchartsByType()
        },
        changeDateType() {
            this.renderEchartsByType()
        },
        showDocument(el) {
            if (el) {
                el.style.display = 'block'
            }
        },
        hideDocument(el) {
            if (el) {
                el.style.display = 'none'
            }
        },
    },
}
</script>
