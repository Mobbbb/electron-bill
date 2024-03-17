import { getDateGroup, formatLimitData, getMonthTotal, transfromBillData } from '@renderer/utils'
import { ElMessage } from 'element-plus'

const app = {
    namespaced: true,
    state() {
        return {
            billData: {
                allMonthArr: ['1970-01'],
            },
            configData: {},
            limitData: {},
            limitConfigData: {},
        }
    },
    getters: {

    },
    mutations: {
        setBillData(state, data) {
            state.billData = data
        },
        setConfigData(state, data) {
            state.configData = data
        },
        setLimitData(state, data) {
            state.limitData = data
        },
        setLimitConfigData(state, data) {
            state.limitConfigData = data
        },
    },
    actions: {
        async initData({ state, dispatch }, outsideData) {
            await dispatch('getConfigData')
            await dispatch('getLimitData')
            await dispatch('getBillData', outsideData)
        },
        async getConfigData({ commit })  {
            const getLimitConfig = async () => await window.call.getLimitConfig('admin')
            const getBorrowData = async () => await window.call.getUserData('borrow.json', 'admin')
            const getTypeConfig = async () => await window.call.getUserData('type.json', 'admin')

            const result = await Promise.all([getBorrowData(), getTypeConfig(), getLimitConfig()])
            const reverseTypeMap = {}
            Object.keys(result[1].data).forEach(key => reverseTypeMap[result[1].data[key]] = key)

            const configData = {
                borrow: result[0].data,
                typeMap: result[1].data,
                reverseTypeMap,
            }
            const limitConfigData = result[2].data
            commit('setConfigData', configData)
            commit('setLimitConfigData', limitConfigData)
        },
        async getBillData({ state, commit }, outsideData) {
            const password = sessionStorage.getItem('userToken')
            if (outsideData) {
                transfromBillData(outsideData, state.limitConfigData)
                const monthTotalYM = getMonthTotal(outsideData)
                const groupData = getDateGroup(outsideData, monthTotalYM)
                commit('setBillData', groupData)
            } else if (password) {
                let result = await window.call.getUserData('data', 'admin', password)
                if (result.success) {
                    const data = result.data
                    transfromBillData(data, state.limitConfigData)
                    const monthTotalYM = getMonthTotal(data)
                    const groupData = getDateGroup(data, monthTotalYM)
                    commit('setBillData', groupData)
                } else {
                    ElMessage.error(result.msg)
                }
            }
        },
        async getLimitData({ state, commit }) {
            let result = await window.call.getUserData('limit.json', 'admin')
            const limitData = formatLimitData(result.data, state.limitConfigData)
            commit('setLimitData', limitData)
        },
    },
}

export default app
