const app = {
    namespaced: true,
    state() {
        return {
            billData: {
                monthTotalYM: {},
            },
        }
    },
    getters: {

    },
    mutations: {
        setBillData(state, data) {
            state.billData = data
        },
        setMonthTotalYM(state, data) {
            state.monthTotalYM = data
        },
    },
    actions: {

    },
}

export default app
