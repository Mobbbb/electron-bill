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

export const settingRoute = {
    path: '/setting',
    name: 'setting',
    meta: {
        level: 0,
        name: '设置',
    },
    component: () => import('@renderer/single-page/setting/index.vue'),
}

export const inputRoute = {
    path: '/input',
    name: 'input',
    meta: {
        level: 0,
        name: '录入',
    },
    component: () => import('@renderer/single-page/input/index.vue'),
}

export const listRoute = {
    path: '/list',
    name: 'list',
    meta: {
        level: 0,
        name: '列表',
    },
    component: () => import('@renderer/single-page/list/index.vue'),
}

export const configRoute = {
    path: '/config',
    name: 'config',
    meta: {
        level: 0,
        name: '配置',
    },
    component: () => import('@renderer/single-page/config/index.vue'),
}

export const routes = [
    homeRoute,
    loginRoute,
    settingRoute,
    inputRoute,
    listRoute,
    configRoute,
]
