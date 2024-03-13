export const initPath = '/'

export const homeRoute = {
    path: '/',
    name: 'home',
    meta: {
        level: 0,
        name: '',
    },
    component: () => import('@renderer/single-page/home/index.vue'),
}

export const routes = [
    homeRoute,
]
