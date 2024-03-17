<template>
	<div class="setting">
		<el-steps style="max-width: 600px; margin: 20px auto;" :active="step" finish-status="success" simple>
			<el-step title="Step 1" />
			<el-step title="Step 2" />
			<el-step title="Step 3" />
		</el-steps>
		<el-form :rules="stepRules1" :model="formData1" ref="ruleFormRef" label-position="right" label-width="auto" style="max-width: 275px; margin: 20px auto;">
			<el-form-item label="基础开销" prop="base">
				<el-input-number
					style="width: 200px;"
				 	placeholder="请输入基础开销"
					v-model="formData1.base"
					:min="0"
					controls-position="right" />
			</el-form-item>
			<el-form-item label="房贷" prop="house">
				<el-input-number
					style="width: 200px;"
				 	placeholder="请输入房贷"
					v-model="formData1.house"
					:min="0"
					controls-position="right" />
			</el-form-item>
			<el-form-item label="车贷" prop="car">
				<el-input-number
					style="width: 200px;"
				 	placeholder="请输入车贷"
					v-model="formData1.car"
					:min="0"
					controls-position="right" />
			</el-form-item>
			<el-button type="primary" style="margin-left: 78px;" @click="nextStep">下一步</el-button>
		</el-form>
    </div>
</template>

<script setup>
import { ref, reactive } from 'vue'

const step = ref(0)
const formData1 = ref({
	base: 5000,
	house: 8000,
	car: 5000,
})

const stepRules1 = reactive({
	base: [{ required: true, message: 'Please select Activity zone', trigger: 'change' }],
})

const nextStep = () => {
	step.value ++
}

</script>

<style scoped>

</style>
