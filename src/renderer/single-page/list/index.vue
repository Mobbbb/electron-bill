<template>
	<div class="block"></div>
	<el-card class="data-lists">
		<Back></Back>
		<el-button size="small" class="table-btn" type="primary" @click="copyData">复制数据</el-button>
		<el-button size="small" class="table-btn" type="primary" @click="openImportModal">导入数据</el-button>
		<div class="table-wrap">
			<el-table class="list-table" height="100%" :data="showListData" border>
				<el-table-column show-overflow-tooltip prop="index" label="序号" width="70" fixed="left" />
				<el-table-column show-overflow-tooltip prop="label" label="标题" min-width="180" fixed="left" />
				<el-table-column prop="type" label="类别" width="100">
					<template #default="scope">
						<span>
							{{typeMap[scope.row.type]}}
						</span>
					</template>
				</el-table-column>
				<el-table-column prop="num" label="金额" width="120" />
				<el-table-column prop="date" label="时间" width="110" />
				<el-table-column label="操作" fixed="right" align="center" width="80">
					<template #default="scope">
						<el-button
							v-if="!scope.row.isChildren"
							type="danger"
							size="small"
							@click.prevent="deleteRow(scope)">
							删除
						</el-button>
					</template>
				</el-table-column>
			</el-table>
		</div>
        <el-pagination small background 
            v-model:currentPage="currentPage"
            :page-size="pageSize"
            :total="tableData.length"
			class="gc-pagination" />
    </el-card>
	<el-dialog v-model="showImportModal" title="导入" width="50%" :close-on-click-modal="false">
		<el-input v-model="outsideData" :rows="13" type="textarea" />
		<template #footer>
			<el-button size="small" type="primary" @click="importData">导入</el-button>
		</template>
	</el-dialog>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { getBranchValue, transfromBillData } from '@renderer/utils'
import { Delete, Plus, Minus } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import Back from '../components/Back.vue'

const route = useRoute()
const router = useRouter()
const store = new useStore()

const showImportModal = ref(false)
const outsideData = ref('')
const tableData = ref([])
const currentPage = ref(1)
const pageSize = 20

const showListData = computed(() => {
	const startNum = (currentPage.value - 1) * pageSize
	return tableData.value.slice(startNum, startNum + pageSize)
})
const typeMap = computed(() => store.state.app.configData.typeMap)
const monthTotalYM = computed(() => store.state.app.monthTotalYM)
const limitConfigData = computed(() => store.state.app.limitConfigData)

const initBillData = (value) => store.dispatch('app/initBillData', value)
const updateNewBillDataSavedStatus = (value) => store.commit('app/updateNewBillDataSavedStatus', value)

const deleteRow = async (data) => {
    window.originData.splice(data.row.index, 1)
	initListData()
	initBillData(JSON.parse(JSON.stringify(window.originData)))
	updateNewBillDataSavedStatus(false)
	ElMessage.success('删除成功')
}

const openImportModal = () => {
	showImportModal.value = true
	outsideData.value = ''
}

const copyData = () => {
	navigator.clipboard.writeText(JSON.stringify(window.originData))
	ElMessage.success('复制成功！')
}

const importData = () => {
	try {
		const data = JSON.parse(outsideData.value)
		window.originData = data
		initListData()
		initBillData(JSON.parse(outsideData.value))
		updateNewBillDataSavedStatus(false)
		ElMessage.success('导入成功！')
		showImportModal.value = false
	} catch(e) {
		ElMessage.error('非法数据！')
	}
}

const initListData = () => {
	const data = JSON.parse(JSON.stringify(window.originData))
	transfromBillData(data, limitConfigData.value)
	data.forEach((item, index) => {
		let num = 0
		item.index = index
		item.list.forEach(cell => {
			cell.isChildren = true
			if (cell.function === 'getBranchValue') {
				cell.num = Number(getBranchValue(item.date, cell.rest || 0, monthTotalYM.value).toFixed(2))
			}
			num += cell.num
		})
		item.num = num.toFixed(2)
	})
	tableData.value = data
}

onMounted(() => {
	initListData()
})

</script>

<style scoped>
.block {
	padding-top: 20px;
}
.data-lists {
	margin: 0 20px;
	height: calc(100% - 40px);
	position: relative;
}
.table-wrap {
	height: calc(100% - 44px - 32px);
	padding: 8px 0 14px 0;
	box-sizing: border-box;
}
.gc-pagination {
	padding-right: 12px;
}
.table-btn {
	margin-top: 14px;
}
</style>

<style>
.no-wrap-form-item .el-form-item__content {
	flex-wrap: nowrap;
}
.data-lists > .el-card__body {
	padding-top: 14px;
	height: 100%;
	box-sizing: border-box;
}
.gc-pagination button {
	background: none!important;
}
.gc-pagination .el-pagination__jump {
    margin-left: 0!important;
}
</style>
