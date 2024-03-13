export const typeMap = {
    '*': '集合',
    '1': '其他',
    '2': '服装',
    '3': '游戏',
    '4': '租房',
    '5': '生活用品',
    '6': '电子产品',
    '7': '人情',
    '8': '学习',
    '9': '医疗',
    '10': '生活品质',
    '11': '礼物/红包',
    '12': '美食',
    '13': '非娱乐性质',
    '14': '玩具',
    '15': '日常开支',
    '16': '电器',
    '17': '娱乐',
    '18': '交通',
}

const reverseTypeMap = {}
Object.keys(typeMap).forEach(key => reverseTypeMap[typeMap[key]] = key)

export const festivalMap = {
    '中秋节': '中秋节',
    '国庆节': '国庆节',
    '劳动节': '劳动节',
    '春节': '春节',
    '元旦节': '元旦节',
    '元宵节': '元宵节',
    '端午节': '端午节',
    '圣诞节': '圣诞节',
    '母亲节': '母亲节',
    '父亲节': '父亲节',
    '清明节': '清明节',
    '情人节': '情人节',
}

export const gameMap = {
    'DNF': 'DNF',
    'O': '原神',
    'DC': '天命之子',
    'WZRY': '王者荣耀',
    'NIKKE': 'NIKKE',
    'Steam': 'Steam',
}

// 租房费用
export const rentMap = {
    RENT_V1: 3400,                  // 2023-上-租房
    RENT_V2: 3460 + 86.5,           // 2023-下-租房
    RENT_V3: 3460 + 86.5 - 1200,    // 2024-上-租房
}

// 基础费用
const baseLimitMap = {
    V1: 5000,
}

// 借钱列表
export const borrowMap = {
    O: 648 * 5 - 2231,              // 甘雨 + 原神卖号
    SURFACE: 8986.38 + 278,         // 苏菲 + 保险
    BROADBAND_2023: 1320 + 78,      // 2023宽带
    FATHERS_DAY_2023: 520,          // 2023父亲节
    RED_PACKET_2024: 2000,          // 楠楠
}

// 总额限制配置
export const limitConfig = {
    '2024': baseLimitMap.V1 + rentMap.RENT_V3,
    '2023-12': baseLimitMap.V1 + rentMap.RENT_V3,
    '2023-11': baseLimitMap.V1 + rentMap.RENT_V3,
    '2023-10': baseLimitMap.V1 + rentMap.RENT_V2,
    '2023-09': baseLimitMap.V1 + rentMap.RENT_V2,
    '2023-08': baseLimitMap.V1 + rentMap.RENT_V2,
    '2023-07': baseLimitMap.V1 + rentMap.RENT_V2,
    '2023-06': baseLimitMap.V1 + rentMap.RENT_V2,
    '2023': baseLimitMap.V1 + rentMap.RENT_V1,
    '2023-01': Infinity,
    '2022': Infinity,
    '2021': Infinity,
    '2020': Infinity,
    '2019': Infinity,
}

// 借钱配置
export const borrowConfig = {
    '2023-04': borrowMap.SURFACE,
    '2023-05': borrowMap.O,
    '2023-06': borrowMap.BROADBAND_2023 + borrowMap.FATHERS_DAY_2023,
    '2024-02': borrowMap.RED_PACKET_2024,
}
