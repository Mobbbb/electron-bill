function genVW(length) {
    let clientWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth
    if (!clientWidth) return length
    return length * clientWidth / 1536
}

/**
 * @description 函数节流，示例：window.onscroll = throttle(onScroll, 200, 300)
 * @param {Function} fn 需要节流的方法
 * @param {Number} delay 在delay时间内若方法未重复触发，则执行方法
 * @param {Number} mustRunDelay 在mustRunDelay时间后执行一次方法
 * @returns {Function}
 */
function throttle(fn, delay, mustRunDelay = 0) {
    if (delay == null) return fn
    const timestampProvider =
        typeof performance === 'object' ? performance : Date
    let timer = null
    let tStart
    return function () {
        const tCurr = timestampProvider.now()
        if (timer != null) clearTimeout(timer)
        if (!tStart) {
            tStart = tCurr
        }
        if (mustRunDelay !== 0 && tCurr - tStart >= mustRunDelay) {
            fn.apply(this, arguments)
            tStart = tCurr
        } else {
            const context = this
            const args = [...arguments]
            timer = setTimeout(function () {
                timer = null
                return fn.apply(context, args)
            }, delay)
        }
    }
}

const dateFormat = (date, fmt = 'yyyy-MM-dd') => {
    if (!(date instanceof Date)) date = new Date(date)

    var a = ['日', '一', '二', '三', '四', '五', '六']
    var o = {
        'M+': date.getMonth() + 1, // 月份
        'd+': date.getDate(), // 日
        'h+': date.getHours(), // 小时
        'm+': date.getMinutes(), // 分
        's+': date.getSeconds(), // 秒
        'q+': Math.floor((date.getMonth() + 3) / 3), // 季度
        'S': date.getMilliseconds(), // 毫秒
        'w': date.getDay(), // 周
        'W': a[date.getDay()], // 大写周
        'T': 'T'
    }
    if (/(y+)/.test(fmt)) { fmt = fmt.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length)) }
    for (var k in o) {
        if (new RegExp('(' + k + ')').test(fmt)) { fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : (('00' + o[k]).substr(('' + o[k]).length))) }
    }
    return fmt
}

/**
 * @description 获取两个日期中间的月份
 * @param {*} stime yyyy-mm
 * @param {*} etime yyyy-mm
 * @returns 
 */
const getAllMonthBetweenGap = (stime, etime) => {
    let diffdate = []
    if (!stime || !stime) {
        return diffdate
    }
    while(stime < etime) {
        diffdate.push(stime)
        let nextMonth = parseInt(stime.slice(5, 7)) + 1
        let nextYear = parseInt(stime.slice(0, 4))
        nextYear = nextMonth > 12 ? nextYear + 1 : nextYear
        nextMonth = nextMonth > 12 ? nextMonth - 12 : nextMonth

        nextMonth = nextMonth < 10 ? `0${nextMonth}` : nextMonth
        stime = `${nextYear}-${nextMonth}`
    }
    diffdate.push(etime)
    return diffdate
}

const getAllDateBetweenGap = (stime, etime) => {
    let diffdate = new Array()
    while(stime < etime) {
        diffdate.push(stime)
        //获取开始日期时间戳
        let timeTs = new Date(stime).getTime()
        
        //增加一天时间戳后的日期
        let nextDate = timeTs + (24*60*60*1000)
        
        let nextYear = new Date(nextDate).getFullYear() + '-'
        let nextMonth = (new Date(nextDate).getMonth() + 1 < 10)
            ? '0' + (new Date(nextDate).getMonth() + 1) + '-'
            : (new Date(nextDate).getMonth() + 1) + '-'
        let nextDay = (new Date(nextDate).getDate() < 10)
            ? '0' + new Date(nextDate).getDate()
            : new Date(nextDate).getDate()
 
        stime = nextYear + nextMonth + nextDay   
    }
    diffdate.push(etime)
    return diffdate
}

const getTextSize = (text, fontSize) => {
    let textDom = document.createElement('span')
    let width = 0
    let height = 0
    textDom.innerHTML = text
    textDom.style.position = 'absolute'
    textDom.style.color = 'transparent'
    textDom.style.lineHeight = 'normal'
    textDom.style.fontSize = fontSize

    document.body.appendChild(textDom)
    width = textDom.clientWidth
    height = textDom.clientHeight
    document.body.removeChild(textDom)

    return {
        width,
        height,
    }
}

export {
    genVW,
    throttle,
    dateFormat,
    getAllMonthBetweenGap,
    getAllDateBetweenGap,
    getTextSize,
}