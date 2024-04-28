<template>
    <div class="navigation-btn" @click="backHandle">
        <el-icon><ArrowLeft /></el-icon>
        <span>返回</span>
    </div>
</template>

<script>
import { ArrowLeft } from '@element-plus/icons-vue'

export default {
    name: 'back-btn',
    components: {
        ArrowLeft,
    },
    computed: {

    },
    methods: {
        backHandle() {
            this.$router.push({
                name: 'home',
            })
        },
    },
}
</script>

<style scoped>
.navigation-btn {
    width: 50px;
    cursor: pointer;
    transition: .1s;
    font-size: 14px;
    display: flex;
    align-items: center;
}
.navigation-btn:hover {
    color: #fc5531;
}
</style>
