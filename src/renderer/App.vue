<template>
	<router-view></router-view>
</template>

<script setup>
import { computed } from 'vue'
import { useStore } from 'vuex'

const store = new useStore()

const billData = computed(() => store.state.app.billData)
const initData = () => store.dispatch('app/initData')

if (!billData.value.dateGroupYM) {
	initData()
}
</script>
