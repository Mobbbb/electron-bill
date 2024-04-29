import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import App from './App.vue'
import router from './router'
import store from './store'

import 'element-plus/dist/index.css'
import './styles/echarts.css'
import './styles/index.css'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'

zhCn.el.datepicker.months = {
    jan: '1\u6708',
    feb: '2\u6708',
    mar: '3\u6708',
    apr: '4\u6708',
    may: '5\u6708',
    jun: '6\u6708',
    jul: '7\u6708',
    aug: '8\u6708',
    sep: '9\u6708',
    oct: '10\u6708',
    nov: '11\u6708',
    dec: '12\u6708',
}

window.originData = []

const app = createApp(App)

app.use(ElementPlus, {
    locale: zhCn,
})
app.use(router)
app.use(store)

app.mount('#app')
