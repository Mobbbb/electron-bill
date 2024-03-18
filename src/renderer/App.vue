<template>
	<router-view></router-view>
</template>

<script setup>
import { computed } from 'vue'
import { useStore } from 'vuex'

const store = new useStore()

const billData = computed(() => store.state.app.billData)
const initData = (value) => store.dispatch('app/initData', value)

if (!billData.value.dateGroupYM) {
	const username = sessionStorage.getItem('username')
	initData({ username })
}
</script>
