import { getAllMonthBetweenGap, dateFormat } from './libs'
import { limitConfig, borrowConfig, typeMap } from '@renderer/config'
import store from '@renderer/store'

function getCellNum(cell, item) {
    if (typeof cell.num === 'function') {
        const borrow = borrowConfig[item.date.slice(0, 7)] || 0
        const limit = getLimit(item.date.slice(0, 7))
        return cell.num(store.state.app.billData.monthTotalYM[item.date.slice(0, 7)] || 0, borrow, limit)
    }
    return cell.num
}

function getItemTotal(groupObj, key) {
    let itemTotal = 0
    groupObj[key].forEach(item => {
        item.list.forEach(cell => {
            itemTotal += getCellNum(cell, item)
        })
    })

    return Math.round(itemTotal)
}

function createGroupObjByType(dataList = []) {
    const groupObj = {}
    dataList.forEach(item => {
        let type = item.type
        if (item.type === '*') type = item.label || item.date || ''
        if (!groupObj[type]) {
            groupObj[type] = []
        }
        groupObj[type].push(item)
    })

    return groupObj
}

function reSortDataListByType(dataList = []) {
    let arr = []
    dataList.forEach(item => {
        if (item.type === '*') {
            const obj = {}
            item.list.forEach(cell => {
                const type = cell.type
                if (obj[type]) {
                    obj[type].list.push(cell)
                } else {
                    obj[type] = {
                        type,
                        label: item.label,
                        date: item.date,
                        list: [cell],
                    }
                }
            })
            arr = arr.concat(Object.keys(obj).map(key => obj[key]))
        } else {
            arr.push(item)
        }
    })

    return arr
}

function countYearPriceInType(data) {
    const obj = {}
    data.forEach(item => {
        const key = item.date.slice(0, 4)
        item.list.forEach(cell => {
            if (typeof obj[key] !== 'undefined') {
                obj[key] += getCellNum(cell, item)
            } else {
                obj[key] = getCellNum(cell, item)
            }
        })
    })
    return obj
}

function splitGroupObjByType(dataList = []) {
    const groupObj = {}
    dataList.forEach(item => {
        let type = item.type
        if (type === '*') {
            item.list.forEach(cell => {
                type = cell.type
                if (!groupObj[type]) {
                    groupObj[type] = []
                }
                groupObj[type].push({
                    type,
                    label: cell.label,
                    date: item.date,
                    list: [cell],
                })
            })
        } else {
            if (!groupObj[type]) {
                groupObj[type] = []
            }
            groupObj[type].push(item)
        }
    })

    return groupObj
}

function splitAndFilterDataList(dataList = [], filterType) {
    const arr = []
    dataList.forEach(item => {
        if (item.type === '*') {
            item.list.forEach(cell => {
                arr.push({
                    type: cell.type,
                    label: cell.label,
                    date: item.date,
                    list: [cell],
                })
            })
        } else {
            arr.push(item)
        }
    })

    return arr.filter(item => item.type === filterType)
}

function filterGroupObjByRange(dateGroup, range = [], keyType = 'date') {
    const groupObj = {}
    Object.keys(dateGroup).forEach(key => {
        if (keyType === 'number') {
            if (key >= range[0] && key <= range[1]) {
                groupObj[key] = dateGroup[key]
            }
        } else {
            groupObj[key] = dateGroup[key].filter(item => item.date >= range[0] && item.date <= range[1])
            if (!groupObj[key].length) delete groupObj[key]
        }
    })
    return groupObj
}

function getLimit(date) {
    const year = date.slice(0, 4)
    const limit = limitConfig[date] || limitConfig[year]
    if (!limit) {
        ElementPlus.ElMessage({
            message: `LimitConfig - ${date} 未配置`,
            type: 'warning',
        })
    }
    return limit
}

function transformGroupObj2DateArr(groupObj) {
    const data = []
    Object.keys(groupObj).forEach(key => {
        const cost = getItemTotal(groupObj, key)
        const limit = getLimit(key) === Infinity ? cost : getLimit(key)
        data.push({
            date: key,
            data: cost >= limit ? cost : limit,
            cost,
            overRate: cost >= limit ? (cost - limit) / cost : (limit - cost) / limit,
            isOverRate: cost >= limit,
        })
    })
    data.sort((a, b) => a.date > b.date ? 1 : -1)
    return data
}

function transformGroupObj2DetailArr(groupObj) {
    const data = []
    Object.keys(groupObj).forEach(key => {
        data.push({
            key,
            data: getItemTotal(groupObj, key),
        })
    })
    data.sort((a, b) => parseInt(a.key) - parseInt(b.key))
    data.forEach(item => {
        if (typeMap[item.key]) {
            item.key = typeMap[item.key]
        }
    })
    return data
}

function filterDataListByDate(dateGroup, dateRange) {
    const startDate = dateFormat(dateRange[0])
    const endDate = dateFormat(dateRange[1])
    const dateGroupObj = filterGroupObjByRange(dateGroup, [startDate, endDate], 'date')
    let dataList = []
    Object.keys(dateGroupObj).forEach(key => dataList = dataList.concat(dateGroupObj[key]))
    dataList.sort((a, b) => a.date > b.date ? 1 : -1)
    return dataList
}

function getDateGroup(data) {
    const dateGroupY = {}
    const dateGroupYM = {}
    const allMonthArr = []

    data.forEach(item => {
        allMonthArr.push(item.date.slice(0, 7))
        if (!dateGroupYM[item.date.slice(0, 7)]) {
            dateGroupYM[item.date.slice(0, 7)] = []
        }
        if (!dateGroupY[item.date.slice(0, 4)]) {
            dateGroupY[item.date.slice(0, 4)] = []
        }
        dateGroupYM[item.date.slice(0, 7)].push(item)
        dateGroupY[item.date.slice(0, 4)].push(item)
    })
    allMonthArr.sort((a, b) => a > b ? 1 : -1)
    return {
        latestDate: allMonthArr[allMonthArr.length - 1],
        oldestDate: allMonthArr[0],
        dateGroupYM: dateGroupYM,
        dateGroupY: dateGroupY,
        allMonthArr: getAllMonthBetweenGap(allMonthArr[0], allMonthArr[allMonthArr.length - 1]),
        monthTotalYM: {},
    }
}

function getMonthTotal(data) {
    const dateGroupYM = {}

    data.forEach(item => {
        if (!dateGroupYM[item.date.slice(0, 7)]) {
            dateGroupYM[item.date.slice(0, 7)] = []
        }
        dateGroupYM[item.date.slice(0, 7)] = dateGroupYM[item.date.slice(0, 7)].concat(item.list)
    })

    Object.keys(dateGroupYM).forEach(key => {
        let total = 0
        dateGroupYM[key].forEach(item => {
            if (typeof item.num === 'number') {
                total += item.num
            }
        })
        dateGroupYM[key] = total
    })
    return dateGroupYM
}

export {
    getCellNum,
    getItemTotal,
    createGroupObjByType,
    reSortDataListByType,
    countYearPriceInType,
    splitGroupObjByType,
    splitAndFilterDataList,
    filterGroupObjByRange,
    getLimit,
    transformGroupObj2DateArr,
    transformGroupObj2DetailArr,
    filterDataListByDate,
    getDateGroup,
    getMonthTotal,
}