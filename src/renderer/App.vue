<template>
	<router-view></router-view>
</template>

<script setup>
import { computed } from 'vue'
import { useStore } from 'vuex'
import { ElMessage } from 'element-plus'

const store = new useStore()

const billData = computed(() => store.state.app.billData)
const newBillDataHasSaved = computed(() => store.state.app.newBillDataHasSaved)
const initData = (value) => store.dispatch('app/initData', value)
const updateNewBillDataSavedStatus = (value) => store.commit('app/updateNewBillDataSavedStatus', value)

if (!billData.value.dateGroupYM) {
	const username = sessionStorage.getItem('username')
	initData({ username })
}

window.listen.onsave(async () => {
	if (newBillDataHasSaved.value) {
		ElMessage.warning('暂无数据需要保存！')
	} else {
		const res = await window.call.updateUserData({
			username: sessionStorage.getItem('username'),
			password: sessionStorage.getItem('userToken'),
			fileName: 'data',
			text: window.originData,
		})
		if (res.success) {
			ElMessage.success(res.msg)
			updateNewBillDataSavedStatus(true)
		} else {
			ElMessage.error(res.msg)
		}
	}
})
</script>
