import {
    createGroupObjByType,
    reSortDataListByType,
    countYearPriceInType,
    transformGroupObj2DateArrY,
    filterDataListByDate,
} from '@renderer/utils'

document.addEventListener('wheel', (e) => {
    const scrollDom = document.getElementById('tooltipInner')
    if (scrollDom) {
        scrollDom.scrollTop += e.deltaY 
    }
})

document.addEventListener('keydown', (e) => {
    const scrollDom = document.getElementById('tooltipInner')
    if (scrollDom) {
        if (e.key) {
            if (e.key === 'ArrowUp' || e.key === 'w') {
                scrollDom.scrollTop -= 30
            } else if (e.key === 'ArrowDown' || e.key === 's') {
                scrollDom.scrollTop += 30
            } else if (e.key === 'ArrowLeft' || e.key === 'a') {
                scrollDom.scrollTop -= (scrollDom.clientHeight - 30)
            } else if (e.key === 'ArrowRight' || e.key === 'd') {
                scrollDom.scrollTop += (scrollDom.clientHeight - 30)
            }
        }
    }
})

const screenWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth
const fontSize = screenWidth < 544 ? 8 : 12

export const getBarOption = (data = {}, that) => {
    return {
        legend: {
            show: false,
        },
        grid: {
            top: '5%',
            bottom: 0,
            left: 0,
            right: 0,
            containLabel: true,
        },
        tooltip: {
            trigger: 'axis',
            className: 'tooltip-wrap',
            axisPointer: {
                type: 'cross'
            },
            formatter: (params, ticket, callback) => {
                let str = '<div id="tooltipInner" style="max-height: 500px;overflow-y: auto;transition: scrollTop .3s ease;">'
                if (!that.pickerType) { // 年
                    const groupObj = {}
                    Object.keys(that.billData.dateGroupYM).forEach(key => {
                        if (key.indexOf(params[0].name) > -1) {
                            groupObj[key] = that.billData.dateGroupYM[key]
                        }
                    })
                    
                    const data = transformGroupObj2DateArrY(groupObj)
                    data.forEach(item => {
                        str += `<div style="display: flex;">
                                    <div style="padding-right: 24px;">${item.date}</div>
                                    <div style="width: 100%;text-align: right;font-weight: bold;">${item.data}元</div>
                                </div>`
                    })
                } else if (that.pickerType === 1) {
                    const dataList = that.billData.dateGroupYM[params[0].name]
                    const groupObj = createGroupObjByType(dataList)

                    const strArr = []
                    Object.keys(groupObj).forEach(type => {
                        let itemTotal = 0
                        let cellStr = ''
                        groupObj[type].forEach(item => { // 类别
                            let cellTotal = 0
                            cellStr = `<div style="text-align: left;width: 100%;box-sizing: border-box;background: #f5f5f5;border-radius: 4px;padding: 4px 4px 4px 12px;margin-bottom: 4px;">`
                            item.list.forEach(cell => { // 类别明细
                                if (!that.configData.typeMap[type]) {
                                    cellStr += `<div style="display: flex;font-size: 13px;">
                                                <div style="padding-right: 24px;">-${cell.label || that.configData.typeMap[cell.type] || item.label}</div>
                                                <div style="width: 100%;text-align: right;font-weight: bold;">${cell.num.toFixed(2)}元</div>
                                            </div>`
                                }
                                cellTotal += cell.num
                            })
                            cellStr += '</div>'
                            
                            itemTotal += cellTotal
                            if (that.configData.typeMap[type]) cellStr = ''
                        })
                        strArr.push({
                            value: Number(itemTotal.toFixed(2)),
                            str: `<div style="display: flex;font-size: 14px;padding-right: 4px;">
                                    <div style="padding-right: 24px;">${that.configData.typeMap[type] || type}</div>
                                    <div style="width: 100%;text-align: right;font-weight: bold;">${Number(itemTotal.toFixed(2)).toFixed(2)}元</div>
                                </div>
                                ${cellStr}`,
                        })
                    })

                    strArr.sort((a, b) => b.value - a.value)

                    str += strArr.map(item => item.str).join('')
                } else { // 详
                    str = '<div id="tooltipInner" style="max-height: 500px;overflow-y: auto;transition: scrollTop .3s ease;padding-top: 6px;">'
                    let dataList = filterDataListByDate(that.billData.dateGroupYM, that.detailRange)
                    dataList = reSortDataListByType(dataList)
                    dataList = dataList.filter(item => item.type === that.configData.reverseTypeMap[params[0].name])
                    const yearPriceMap = countYearPriceInType(dataList)

                    dataList.forEach((item, index) => {
                        let itemTotal = 0
                        let subStr = '<div style="font-size: 13px;text-align: left;padding-left: 12px;width: 100%;box-sizing: border-box;">'
                        item.list.forEach(cell => {
                            if (item.list.length !== 1 || (item.list.length === 1 && cell.label && cell.label !== item.label)) {
                                subStr += `<div style="display: flex;">
                                            <div style="padding-right: 24px;">- ${cell.label || that.configData.typeMap[cell.type] || item.label}</div>
                                            <div style="width: 100%;text-align: right;font-weight: bold;">${Number(cell.num.toFixed(2)).toFixed(2)}元</div>
                                        </div>`
                            }
                            itemTotal += cell.num
                        })
                        subStr += '</div>'

                        let dateTitle = ''
                        if (index === 0 || item.date.slice(0, 4) > dataList[index - 1].date.slice(0, 4)) {
                            const year = item.date.slice(0, 4)
                            dateTitle = `<div style="display: flex;margin: 4px 0 0 -4px;font-weight: bold;color: black;font-size: 15px;">
                                            <div style="padding-right: 24px;">${year}</div>
                                            <div style="width: 100%;text-align: right;font-weight: bold;">${Number(yearPriceMap[year].toFixed(2)).toFixed(2)}元</div>
                                        </div>`
                        }
                        str += `${dateTitle}
                                <div style="display: flex;font-size: 14px;">
                                    <div style="padding-right: 24px;">${item.label || that.configData.typeMap[item.type]}</div>
                                    <div style="width: 100%;text-align: right;font-weight: bold;">${Number(itemTotal.toFixed(2)).toFixed(2)}元</div>
                                </div>
                                ${subStr}`
                    })
                }
                return str + '</div>'
            },
            // alwaysShowContent: true,
            enterable: true,
            // triggerOn: 'click',
            backgroundColor: 'rgba(255, 255, 255, 1)',
            position: function (pos, params, dom, rect, size) {
                var obj = { top: 0 }
                if ((pos[0] < size.viewSize[0] / 2)) {
                    obj.right = 5
                } else {
                    obj.left = 44
                }
                return obj
            },
        },
        xAxis: [
            {
                data: data.xAxis,
                axisLabel: {
                    show: true,
                    fontSize,
                    color: '#262626',
                },
                axisTick: {
                    show: false,
                },
                axisLine: {
                    lineStyle: {
                        color: '#ebebeb',
                        width: 1,
                        // *$坐标线延长线
                        shadowOffsetX: 14,
                        shadowColor: '#ebebeb',
                    },
                },
                axisPointer: {
                    show: true,
                    type: 'line',
                },
            },
            {
                axisLabel: {
                    show: false,
                },
                axisTick: {
                    show: false,
                },
                axisLine: {
                    lineStyle: {
                        color: '#ebebeb',
                        width: 1,
                        // *$坐标轴负方向延长线
                        shadowOffsetX: -14,
                        shadowColor: '#ebebeb',
                    },
                },
            },
        ],
        yAxis: [
            {
                type: 'value',
                axisTick: {
                    show: false,
                },
                axisLabel: {
                    show: true,
                    margin: 10,
                    // *$修改 axisTick 颜色
                    formatter: '{value}',
                    fontSize,
                    color: (value) => {
                        // *$隐藏0坐标
                        return value > 0 ? '#262626' : 'rgba(0, 0, 0, 0)'
                    }
                },
                axisLine: {
                    show: true,
                    lineStyle: {
                        color: '#ebebeb',
                        width: 1,
                        shadowOffsetY: -14,
                        shadowColor: '#ebebeb',
                    },
                },
                splitLine: {
                    show: false,
                },
            },
            {}, // *$坐标轴负方向延长线
        ],
        series: [{
            type: 'bar',
            data: data.data,
            barWidth: '50%',
            barMaxWidth: 30,
            itemStyle: {
                color: '#6699ff',
            },
            label: {
                show: true,
                position: 'top',
            },
        }],
    }
}

export const getLineOption = (data = {}, { type, pickerType }) => {
    return {
        legend: {
            show: false,
        },
        grid: {
            top: '5%',
            bottom: 0,
            left: 0,
            right: 0,
            containLabel: true,
        },
        tooltip: {
            trigger: 'axis',
            className: 'tooltip-wrap',
            axisPointer: {
                type: 'cross'
            },
            formatter: (params, ticket, callback) => {
                let str = '<div id="tooltipInner" style="max-height: 500px;overflow-y: auto;transition: scrollTop .3s ease;padding-top: 6px;">'
                let dataList = pickerType ? Book.data.dateGroupYM[params[0].name] : Book.data.dateGroupY[params[0].name]
                dataList = reSortDataListByType(dataList)
                dataList = dataList.filter(item => item.type === type)

                dataList.forEach(item => {
                    let itemTotal = 0
                    let subStr = '<div style="font-size: 13px;text-align: left;padding-left: 12px;width: 100%;box-sizing: border-box;">'
                    item.list.forEach(cell => {
                        if (item.list.length !== 1 || (item.list.length === 1 && cell.label && cell.label !== item.label)) {
                            subStr += `<div style="display: flex;">
                                        <div style="padding-right: 24px;">- ${cell.label || that.configData.typeMap[cell.type] || item.label}</div>
                                        <div style="width: 100%;text-align: right;font-weight: bold;">${Number(cell.num.toFixed(2)).toFixed(2)}元</div>
                                    </div>`
                        }
                        itemTotal += cell.num
                    })
                    subStr += '</div>'

                    str += `<div style="display: flex;font-size: 14px;">
                                <div style="padding-right: 24px;">${item.label || that.configData.typeMap[item.type]}</div>
                                <div style="width: 100%;text-align: right;font-weight: bold;">${Number(itemTotal.toFixed(2)).toFixed(2)}元</div>
                            </div>
                            ${subStr}`
                })

                return dataList.length ? str + '</div>' : ''
            },
            // alwaysShowContent: true,
            enterable: true,
            // triggerOn: 'click',
            backgroundColor: 'rgba(255, 255, 255, 1)',
            position: function (pos, params, dom, rect, size) {
                var obj = { top: 0 }
                if ((pos[0] < size.viewSize[0] / 2)) {
                    obj.right = 5
                } else {
                    obj.left = 44
                }
                return obj
            },
        },
        xAxis: [
            {
                data: data.xAxis,
                axisLabel: {
                    show: true,
                    textStyle: {
                        fontSize,
                        color: '#262626',
                    },
                },
                axisTick: {
                    show: false,
                },
                axisLine: {
                    lineStyle: {
                        color: '#ebebeb',
                        width: 1,
                        // *$坐标线延长线
                        shadowOffsetX: 14,
                        shadowColor: '#ebebeb',
                    },
                },
                axisPointer: {
                    show: true,
                    type: 'line',
                },
            },
            {
                axisLabel: {
                    show: false,
                },
                axisTick: {
                    show: false,
                },
                axisLine: {
                    lineStyle: {
                        color: '#ebebeb',
                        width: 1,
                        // *$坐标轴负方向延长线
                        shadowOffsetX: -14,
                        shadowColor: '#ebebeb',
                    },
                },
            },
        ],
        yAxis: [
            {
                type: 'value',
                axisTick: {
                    show: false,
                },
                axisLabel: {
                    show: true,
                    margin: 10,
                    // *$修改 axisTick 颜色
                    formatter: '{value}',
                    textStyle: {
                        fontSize,
                        color: (value) => {
                            // *$隐藏0坐标
                            return value > 0 ? '#262626' : 'rgba(0, 0, 0, 0)'
                        }
                    },
                },
                axisLine: {
                    show: true,
                    lineStyle: {
                        color: '#ebebeb',
                        width: 1,
                        shadowOffsetY: -14,
                        shadowColor: '#ebebeb',
                    },
                },
                splitLine: {
                    show: false,
                },
            },
            {}, // *$坐标轴负方向延长线
        ],
        series: [{
            type: 'line',
            data: data.data,
            showAllSymbol: true,
            connectNulls: true,
            smooth: true,
            itemStyle: {
                color: '#6699ff',
            },
            areaStyle: {
                opacity: 0.9,
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                    {
                        offset: 0,
                        color: 'rgba(129, 150, 213, 1)'
                    },
                    {
                        offset: 1,
                        color: 'rgba(217, 227, 255, 0.3)'
                    }
                ]),
            },
            label: {
                show: true,
                position: 'top',
            },
        }],
    }
}

export const getCategoryOption = (data = {}) => {
    return {
        legend: {
            show: false,
        },
        grid: {
            top: '5%',
            bottom: 0,
            left: 0,
            right: 0,
            containLabel: true,
        },
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'cross'
            },
            formatter: (params, ticket, callback) => {
                let str = ''
                params[0].data.list.forEach(item => {
                    str += `<div style="display: flex;">
                                <div style="padding-right: 24px;">${item.label}</div>
                                <div style="width: 100%;text-align: right;font-weight: bold;">${Number(item.num.toFixed(2))}元</div>
                            </div>`
                })
                return str
            },
            // alwaysShowContent: true,
            enterable: true,
            // triggerOn: 'click',
            backgroundColor: 'rgba(255, 255, 255, 1)',
        },
        xAxis: [
            {
                data: data.xAxis,
                axisLabel: {
                    show: true,
                    textStyle: {
                        fontSize,
                        color: '#262626',
                    },
                },
                axisTick: {
                    show: false,
                },
                axisLine: {
                    lineStyle: {
                        color: '#ebebeb',
                        width: 1,
                        // *$坐标线延长线
                        shadowOffsetX: 14,
                        shadowColor: '#ebebeb',
                    },
                },
                axisPointer: {
                    show: true,
                    type: 'line',
                },
            },
            {
                axisLabel: {
                    show: false,
                },
                axisTick: {
                    show: false,
                },
                axisLine: {
                    lineStyle: {
                        color: '#ebebeb',
                        width: 1,
                        // *$坐标轴负方向延长线
                        shadowOffsetX: -14,
                        shadowColor: '#ebebeb',
                    },
                },
            },
        ],
        yAxis: [
            {
                type: 'value',
                axisTick: {
                    show: false,
                },
                axisLabel: {
                    show: true,
                    margin: 10,
                    // *$修改 axisTick 颜色
                    formatter: '{value}',
                    textStyle: {
                        fontSize,
                        color: (value) => {
                            // *$隐藏0坐标
                            return value > 0 ? '#262626' : 'rgba(0, 0, 0, 0)'
                        }
                    },
                },
                axisLine: {
                    show: true,
                    lineStyle: {
                        color: '#ebebeb',
                        width: 1,
                        shadowOffsetY: -14,
                        shadowColor: '#ebebeb',
                    },
                },
                splitLine: {
                    show: false,
                },
            },
            {}, // *$坐标轴负方向延长线
        ],
        series: [{
            type: 'bar',
            data: data.data,
            barWidth: genVW(40),
            barMaxWidth: 30,
            itemStyle: {
                color: '#6699ff',
            },
            label: {
                show: true,
                position: 'top',
            },
        }],
    }
}

export const getToolbarOption = (data) => {
    return {
        tooltip: {
            show: false
        },
        grid: {
            top: 0,
            bottom: 0,
            left: '8px',
            right: '12px',
        },
        xAxis: [{
            data: data.xAxis,
            show: false,
        }],
        yAxis: [{
            type: 'value',
            show: false,
        }],
        dataZoom: [
            {
                type: 'slider',
                startValue: data.startValue,
                endValue: data.endValue,
                rangeMode: ['value', 'value'],
                realtime: true,
                zoomLock: false,
                showDetail: false,
                throttle: 500,
            },
        ],
        series: [
            {
                type: 'line',
                data: []
            }
        ]
    }
}

export const getPieOption = (data) => {
    return {
        tooltip: {
            trigger: 'item',
            formatter: '{b}：{c}元 <br/>占比：{d}%',
        },
        legend: {
            orient: 'vertical',
            left: 'right',
        },
        series: [
            {
                name: '',
                type: 'pie',
                radius: '50%',
                data,
                radius: [0, '75%'],
                emphasis: {
                    itemStyle: {
                        shadowBlur: 10,
                        shadowOffsetX: 0,
                        shadowColor: 'rgba(0, 0, 0, 0.5)'
                    }
                }
            }
        ]
    }
}
