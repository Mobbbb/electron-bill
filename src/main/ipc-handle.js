import { ipcMain, globalShortcut } from 'electron'
import { join } from 'path'
import { encrypto, decrypto } from './utils'
import { typeJson } from './config'
const fs = require('fs')

const ROOT_DATA_FILE = 'AppData'

function getFileData({ username, password, fileName }) {
	const filePath = `./${ROOT_DATA_FILE}/${username}/${fileName}`
	let lists = []
	try {
		lists = fs.readFileSync(filePath).toString()
	} catch (e) {
		if (password) {
			if (fs.existsSync(`${filePath}.bk`) || fs.existsSync(`${filePath}.temp`)) {
				return {
					data: [],
					success: false,
					code: '-3',
					msg: 'Bk or temp file exist',
				}
			}
		}
		return {
			data: [],
			success: false,
			code: '-4058',
			msg: 'No such file or directory',
		}
	}

	try {
		if (password) { // 需要解密的文件
			lists = JSON.parse(decrypto(lists, password))
		} else {
			lists = JSON.parse(lists)
		}
	} catch (e) {
		return {
			data: [],
			success: false,
			code: '-1',
			msg: 'Data acquisition failed',
		}
	}

	return {
		data: lists,
		success: true,
		code: '200',
		msg: '',
	}
}

export default (mainWindow) => {
	// IPC test
	ipcMain.on('ping', () => console.log('pong'))
	ipcMain.handle('rendererCallIpcMain', () => 'ping')

	globalShortcut.register('CommandOrControl+S', () => {
		mainWindow.webContents.send('onsave')
	})

	ipcMain.handle('initAppData', async (event, { username, password, params }) => {
		const { limitConfig, limitData } = params
		try {
			if (!fs.existsSync(`./${ROOT_DATA_FILE}`)) {
				fs.mkdirSync(`./${ROOT_DATA_FILE}`)
			}
			if (!fs.existsSync(`./${ROOT_DATA_FILE}/${username}`)) {
				fs.mkdirSync(`./${ROOT_DATA_FILE}/${username}`)
			}
			if (!fs.existsSync(`./${ROOT_DATA_FILE}/${username}/limitConfig`)) {
				fs.mkdirSync(`./${ROOT_DATA_FILE}/${username}/limitConfig`)
			}
			Object.keys(limitConfig).forEach(key => {
				fs.writeFileSync(`./${ROOT_DATA_FILE}/${username}/limitConfig/${key}.json`, JSON.stringify(limitConfig[key]))
			})
			fs.writeFileSync(`./${ROOT_DATA_FILE}/${username}/borrow.json`, '{}')
			fs.writeFileSync(`./${ROOT_DATA_FILE}/${username}/data`, encrypto('[]', password))
			fs.writeFileSync(`./${ROOT_DATA_FILE}/${username}/limit.json`, JSON.stringify(limitData))
			fs.writeFileSync(`./${ROOT_DATA_FILE}/${username}/type.json`, JSON.stringify(typeJson))

			return {
				data: null,
				success: true,
				code: '200',
				msg: '',
			}
		} catch (e) {
			fs.rmdirSync(`./${ROOT_DATA_FILE}/${username}`, { recursive: true })
			return {
				data: null,
				success: false,
				code: '-2',
				msg: 'Directory created failed',
			}
		}
	})

	// 获取limitConfig文件
	ipcMain.handle('getLimitConfig', async (event, username) => {
		let lists = {}
		const filePath = `./${ROOT_DATA_FILE}/${username}/limitConfig/`
		try {
			const files = fs.readdirSync(filePath)
			files.forEach(async file => {
				const fileName = file.split('.')
				const fileContent = fs.readFileSync(join(filePath, file), 'utf8').toString()
				lists[fileName[0]] = JSON.parse(fileContent)
			})
		} catch (e) {
			return {
				data: {},
				success: false,
				code: '-4058',
                msg: 'No such file or directory',
			}
		}
		return {
			data: lists,
			success: true,
			code: '200',
			msg: '',
		}
	})

	// 获取data文件或配置文件
	ipcMain.handle('getUserData', async (event, { username, password, fileName }) => {
		return getFileData({ username, password, fileName })
	})

	// 更新limitConfig文件
	ipcMain.handle('updateLimitConfig', async (event, {
		username,
		password,
		params,
		originData = [],
		limitConfigParams = {}
	}) => {
		const path = `./${ROOT_DATA_FILE}/${username}/limitConfig/`

		const res = getFileData({ username, fileName: 'limit.json' })
		const limitData = res.data
		if (!res.success) return res

		try {
			const files = fs.readdirSync(path)
			files.forEach(async file => {
				fs.renameSync(`${path}${file}`, `${path}${file}.temp`) // 将文件转为临时文件
			})
		} catch (e) {
			return {
				data: null,
				success: false,
				code: '-4',
                msg: 'Encrypto failed',
			}
		}

		try {
			Object.keys(params).forEach(key => {
				const filePath = `${path}${key}.json`
				fs.writeFileSync(filePath, JSON.stringify(params[key])) // 写入新文件
			})

			if (Object.keys(limitConfigParams).length) { // 更新limit.json
				Object.keys(limitData).forEach(key => {
					const newArr = []
					limitData[key].forEach(item => {
						if (limitConfigParams[item]) {
							newArr.push(limitConfigParams[item])
						} else {
							newArr.push(item)
						}
					})
					limitData[key] = newArr
				})
				const limitPath = `./${ROOT_DATA_FILE}/${username}/limit.json`
				fs.renameSync(limitPath, `${limitPath}.temp`) // 将文件转为临时文件
				fs.writeFileSync(limitPath, JSON.stringify(limitData)) // 写入新文件

				if (originData.length) {
					const dataPath = `./${ROOT_DATA_FILE}/${username}/data`
					let json = JSON.stringify(originData)
					json = encrypto(json, password)
					fs.renameSync(dataPath, `${dataPath}.temp`) // 将旧文件转为临时文件
					fs.writeFileSync(dataPath, json)
					fs.renameSync(`${dataPath}.temp`, `${dataPath}.bk`) // 将临时文件转为备份文件
				}

				if (fs.existsSync(`${limitPath}.temp`)) {
					fs.rmSync(`${limitPath}.temp`, { recursive: true }) // 删除临时文件
				}
			}
		} catch (e) {
			// limit.json恢复相关
			const limitPath = `./${ROOT_DATA_FILE}/${username}/limit.json`
			if (fs.existsSync(`${limitPath}.temp`)) {
				fs.renameSync(`${limitPath}.temp`, limitPath) // 使用临时文件恢复旧文件
			}

			// data恢复相关
			const dataPath = `./${ROOT_DATA_FILE}/${username}/data`
			if (fs.existsSync(`${dataPath}.temp`)) {
				fs.renameSync(`${dataPath}.temp`, dataPath) // 使用临时文件恢复旧文件
			}

			// limitConfig恢复相关
			const files = fs.readdirSync(path)
			files.forEach(async file => {
				if (file.indexOf('temp') > -1) {
					const fileName = file.split('.')[0]
					fs.renameSync(`${path}${file}`, `${path}${fileName}.json`) // 使用临时文件恢复旧文件
				}
			})

			return {
				data: null,
				success: false,
				code: '-4',
                msg: 'WriteFileSync or RenameSync failed',
			}
		}

		try {
			const files = fs.readdirSync(path)
			files.forEach(async file => {
				if (file.indexOf('temp') > -1) {
					fs.rmSync(`${path}${file}`, { recursive: true }) // 删除临时文件
				}
			})
		} catch (e) {
			return {
				data: null,
				success: false,
				code: '-4',
				msg: '删除临时文件失败',
			}
		}

		return {
			data: null,
			success: true,
			code: '200',
			msg: '保存成功',
		}
	})

	// 更新配置文件
	ipcMain.handle('updateConfigData', async (event, { username, fileName, text }) => {
		const filePath = `./${ROOT_DATA_FILE}/${username}/${fileName}`

		try {
			fs.renameSync(filePath, `${filePath}.temp`) // 将文件转为临时文件
		} catch (e) {
			return {
				data: null,
				success: false,
				code: '-4',
				msg: '临时文件创建失败',
			}
		}

		try {
			fs.writeFileSync(filePath, text) // 写入新文件
		} catch (e) {
			fs.renameSync(`${filePath}.temp`, filePath) // 使用临时文件恢复旧文件
			return {
				data: null,
				success: false,
				code: '-4',
				msg: '数据保存失败',
			}
		}

		try {
			if (fs.existsSync(`${filePath}.temp`)) {
				fs.rmSync(`${filePath}.temp`, { recursive: true }) // 删除临时文件
			}
		} catch (e) {
			return {
				data: null,
				success: false,
				code: '-4',
				msg: '删除临时文件失败',
			}
		}

		return {
			data: null,
			success: true,
			code: '200',
			msg: '保存成功',
		}
	})

	// 更新data文件
	ipcMain.handle('updateUserData', async (event, { username, password, fileName, text }) => {
		const filePath = `./${ROOT_DATA_FILE}/${username}/${fileName}`
		let json = JSON.stringify(text)

		try {
			if (password) { // 需要加密的文件
				json = encrypto(json, password)
				fs.renameSync(filePath, `${filePath}.temp`) // 将旧文件转为临时文件
			}
		} catch (e) {
			return {
				data: null,
				success: false,
				code: '-4',
                msg: 'No such file or directory',
			}
		}

		try {
			fs.writeFileSync(filePath, json)
			fs.renameSync(`${filePath}.temp`, `${filePath}.bk`) // 将临时文件转为备份文件
		} catch (e) {
			fs.renameSync(`${filePath}.temp`, filePath) // 将临时文件恢复为原文件
			return {
				data: null,
				success: false,
				code: '-4',
                msg: 'Data acquisition failed',
			}
		}

		return {
			data: null,
			success: true,
			code: '200',
			msg: '保存成功',
		}
	})
}
