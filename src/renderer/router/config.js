export const initPath = '/'

export const homeRoute = {
    path: '/',
    name: 'home',
    meta: {
        level: 0,
        name: '首页',
    },
    component: () => import('@renderer/single-page/home/index.vue'),
}

export const loginRoute = {
    path: '/login',
    name: 'login',
    meta: {
        level: 0,
        name: '登录',
    },
    component: () => import('@renderer/single-page/login/index.vue'),
}

export const routes = [
    homeRoute,
    loginRoute,
]
