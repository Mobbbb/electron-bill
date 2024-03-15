const app = {
    namespaced: true,
    state() {
        return {
            billData: {
                allMonthArr: ['1970-01'],
            },
            originBillData: [],
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
        setOriginBillData(state, data) {
            state.originBillData = data
        },
    },
    actions: {

    },
}

export default app
