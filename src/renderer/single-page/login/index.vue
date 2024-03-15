<style scoped>
  @import './login.css';
</style>

<template>
	<div class="login">
        <div class="left-img">
            <img src="@renderer/assets/loginBac.png" :style="{'marginLeft': '-150px', height: '100%'}">
        </div>
        <div class="login-con">
            <el-card style="height: 263px; width: 300px;">
                <div class="title-header">
                    <p class="title_style">Bill</p>
                </div>
                <el-form label-position="left" label-width="auto">
					<el-form-item label-width="0">
						<el-input v-model="formData.username">
							<template #prepend>
								<el-button :icon="UserFilled" />
							</template>
						</el-input>
					</el-form-item>
					<el-form-item label-width="0">
						<el-input v-model="formData.password" type="password">
							<template #prepend>
								<el-button :icon="GoodsFilled" />
							</template>
						</el-input>
					</el-form-item>
				</el-form>
				<el-button type="primary" style="width: 100%;" @click="handleSubmit">登录</el-button>
            </el-card>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, ref, reactive } from 'vue'
import { useStore } from 'vuex'
import { UserFilled, GoodsFilled } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import md5 from '@renderer/utils/md5'

const router = useRouter()

const store = new useStore()

const formData = reactive({
	username: '',
	password: '',
})

const setOriginBillData = (value) => store.commit('app/setOriginBillData', value)

const handleSubmit = async () => {
	const password = md5(formData.password)
	let result = await window.call.getUserData('data', formData.username, password)
	if (result.success) {
		setOriginBillData(result.data)
		sessionStorage.setItem('userToken', password)
		router.push({
			name: 'home',
		})
	} else {
		ElMessage.error('账户或用户名错误')
	}
}
</script>
