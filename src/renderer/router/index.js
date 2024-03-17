import { createRouter, createWebHashHistory } from 'vue-router'
import { routes } from './config'

const router = createRouter({
    history: createWebHashHistory(),
    routes,
})

router.beforeEach((to, from, next) => {
    let userToken = sessionStorage.getItem('userToken')

    if (!userToken && to.name !== 'login') {
        if (to.name === 'setting') {
            next()
        } else {
            // 未登录且前往的不是登录页
            next({
                name: 'login'
            })
        }
    } else if (userToken && to.name === 'login') {
        next({
            name: 'home'
        })
    } else {
        next()
    }
})

export default router
