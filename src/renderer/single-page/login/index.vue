<style scoped>
  @import './login.css';
</style>

<template>
	<div class="login">
        <div class="login-con">
            <el-card class="login-card">
                <div class="title-header">
                    <p class="title_style">Bill</p>
                </div>
                <el-form :rules="rules" :model="formData" ref="ruleFormRef" label-position="left" label-width="auto" style="padding: 0 20px; margin-top: 20px;">
					<el-form-item label-width="0" prop="username">
						<el-input v-model="formData.username" class="login-input" placeholder="请输入账户" @keyup.enter="handleSubmit">
							<template #prepend>
								<el-icon><UserFilled /></el-icon>
							</template>
						</el-input>
					</el-form-item>
					<el-form-item label-width="0" prop="password">
						<el-input v-model="formData.password" class="login-input" type="password" placeholder="请输入密码" @keyup.enter="handleSubmit">
							<template #prepend>
								<el-icon><GoodsFilled /></el-icon>
							</template>
						</el-input>
					</el-form-item>
					<el-button type="primary" style="width: 100%;margin-bottom: 10px;" @click="handleSubmit">登录</el-button>
					<el-checkbox v-model="rememberUsername" label="记住账户" size="small" class="login-checkbox" />
				</el-form>
            </el-card>
        </div>
    </div>
</template>

<script setup>
import { computed, ref, reactive } from 'vue'
import { useStore } from 'vuex'
import { UserFilled, GoodsFilled } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRouter } from 'vue-router'
import md5 from '@renderer/utils/md5'

const router = useRouter()

const store = new useStore()

const rememberUsername = ref(false)
const ruleFormRef = ref()
const checkStatus = ref(true)

const formData = reactive({
	username: '',
	password: '',
})

const validatePass1 = (rule, value, callback) => {
	if (!value) callback(new Error('请填写账户'))
	if (checkStatus.value) {
		callback()
	} else {
		callback(new Error('账户或密码错误'))
	}
}

const validatePass2 = (rule, value, callback) => {
	if (!value) callback(new Error('请填写密码'))
	if (checkStatus.value) {
		callback()
	} else {
		callback(new Error('账户或密码错误'))
	}
}

const rules = reactive({
	username: [{ validator: validatePass1, trigger: 'change', }],
	password: [{ validator: validatePass2, trigger: 'change', }],
})

const initData = (value) => store.dispatch('app/initData', value)

const handleSubmit = async () => {
	const password = md5(formData.password)
	const result = await window.call.getUserData('data', formData.username, password)
	const { success, code, data } = result
	const registerStatus = !success && code === '-4058' // 注册账户
	const recoverStatus = !success && code === '-3' // 数据恢复用户

	checkStatus.value = success || registerStatus || recoverStatus
	ruleFormRef.value.validate(async (valid, fields) => {
		checkStatus.value = true
		if (valid && success) {
			sessionStorage.setItem('username', formData.username)
			sessionStorage.setItem('userToken', password)
			window.originData = JSON.parse(JSON.stringify(data))
			await initData({ outsideData: data, username: formData.username })
			router.push({
				name: 'home',
			})
		} else if (valid && registerStatus) {
			ElMessageBox.confirm('该账户不存在，点击确定为您创建此账户', '提示', {
				confirmButtonText: '确定',
      			cancelButtonText: '取消',
			}).then(() => {
				router.push({
					name: 'setting',
					query: {
						username: formData.username,
						password,
					},
				})
			}).catch(() => {})
		} else if (valid && recoverStatus) {
			// todo
			console.log('备份')
		}
	})
}
</script>

<style>
.login-input .el-input-group__prepend{
	padding: 0 12px;
}
.login-card .el-card__body {
    padding: 0;
}
.login-checkbox .el-checkbox__label {
	line-height: 18px!important;
}
</style>
