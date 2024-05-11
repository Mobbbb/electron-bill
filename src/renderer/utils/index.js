import { getAllMonthBetweenGap, dateFormat } from './libs'
import { ALL_ID } from '@renderer/config'
import store from '@renderer/store'

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

function getItemTotal(groupObj, key) {
    let itemTotal = 0
    groupObj[key].forEach(item => {
        item.list.forEach(cell => {
            itemTotal += cell.num
        })
    })

    return Math.round(itemTotal)
}

function createGroupObjByType(dataList = []) {
    const groupObj = {}
    dataList.forEach(item => {
        let type = item.type
        if (item.type === ALL_ID) type = item.label || item.date || ''
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
        if (item.type === ALL_ID) {
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
                obj[key] += cell.num
            } else {
                obj[key] = cell.num
            }
        })
    })
    return obj
}

function splitGroupObjByType(dataList = []) {
    const groupObj = {}
    dataList.forEach(item => {
        let type = item.type
        if (type === ALL_ID) {
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
        if (item.type === ALL_ID) {
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

function filterGroupObjByRange(dateGroup = {}, range = [], keyType = 'date') {
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
    const limit = store.state.app.limitData[date] || store.state.app.limitData[year]
    if (!limit) return Infinity
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

function transformGroupObj2DateArrY(groupObj) {
    const data = []
    Object.keys(groupObj).forEach(key => {
        data.push({
            date: key,
            data: getItemTotal(groupObj, key),
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
        if (store.state.app.configData.typeMap[item.key]) {
            item.key = store.state.app.configData.typeMap[item.key]
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

function getBranchValue(date, rest, monthTotalYM) {
    const borrow = store.state.app.configData.borrow[date.slice(0, 7)] || 0
    const limit = getLimit(date.slice(0, 7))
    const registered = monthTotalYM[date.slice(0, 7)] || 0
    return limit + borrow - registered - rest
}

function formatLimitData(data, limitConfigData) {
    const limitObj = {}
    Object.keys(data).forEach(key => {
        if (!limitObj[key]) limitObj[key] = 0
        data[key].forEach(item => {
            const keyArr = item.split('_')
            limitObj[key] += limitConfigData[keyArr[0]][keyArr[1]]
        })
    })
    return limitObj
}

function transfromBillData(data, limitConfigData) {
    data.forEach(item => {
        item.list.forEach(cell => {
            if (cell.function === 'getValueByKey' && cell.key) {
                const keyArr = cell.key.split('_')
                cell.num = limitConfigData[keyArr[0]][keyArr[1]]
            }
        })
    })
}

function getDateGroup(data, monthTotalYM) {
    const dateGroupY = {}
    const dateGroupYM = {}
    const allMonthArr = []
    const usedKeyArr = []
    const usedTypeArr = []

    data.forEach(item => {
        if (item.type) {
            usedTypeArr.push(item.type)
        }
        item.list.forEach(cell => {
            if (cell.function === 'getBranchValue') {
                cell.num = getBranchValue(item.date, cell.rest || 0, monthTotalYM)
            }
            if (cell.key) {
                usedKeyArr.push(cell.key)
            }
            if (cell.type) {
                usedTypeArr.push(cell.type)
            }
        })

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
        usedKeyArr,
        usedTypeArr: [...new Set(usedTypeArr)],
        allMonthArr: getAllMonthBetweenGap(allMonthArr[0], allMonthArr[allMonthArr.length - 1]),
    }
}

export {
    getItemTotal,
    formatLimitData,
    createGroupObjByType,
    reSortDataListByType,
    countYearPriceInType,
    splitGroupObjByType,
    splitAndFilterDataList,
    filterGroupObjByRange,
    getLimit,
    transformGroupObj2DateArr,
    transformGroupObj2DateArrY,
    transformGroupObj2DetailArr,
    filterDataListByDate,
    getDateGroup,
    transfromBillData,
    getMonthTotal,
    getBranchValue,
}