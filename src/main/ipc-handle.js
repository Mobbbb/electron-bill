import { ipcMain, globalShortcut } from 'electron'
import { join } from 'path'
import { encrypto, decrypto } from './utils'
const fs = require('fs')

export default (mainWindow) => {
	// IPC test
	ipcMain.on('ping', () => console.log('pong'))
	ipcMain.handle('rendererCallIpcMain', () => 'ping')

	globalShortcut.register('CommandOrControl+S', () => {
		mainWindow.webContents.send('onsave')
	})

	ipcMain.handle('initAppData', async (event, { username, password, params }) => {
		const { limitConfig, limitData, type } = params
		try {
			if (!fs.existsSync(`./AppData/${username}`)) {
				fs.mkdirSync(`./AppData/${username}`)
			}
			if (!fs.existsSync(`./AppData/${username}/limitConfig`)) {
				fs.mkdirSync(`./AppData/${username}/limitConfig`)
			}
			Object.keys(limitConfig).forEach(key => {
				fs.writeFileSync(`./AppData/${username}/limitConfig/${key}.json`, JSON.stringify(limitConfig[key]))
			})
			fs.writeFileSync(`./AppData/${username}/borrow.json`, '{}')
			fs.writeFileSync(`./AppData/${username}/data`, encrypto('[]', password))
			fs.writeFileSync(`./AppData/${username}/limit.json`, JSON.stringify(limitData))
			fs.writeFileSync(`./AppData/${username}/type.json`, JSON.stringify(type))

			return {
				data: null,
				success: true,
				code: '200',
				msg: '',
			}
		} catch (e) {
			fs.rmdirSync(`./AppData/${username}`, { recursive: true })
			return {
				data: null,
				success: false,
				code: '-2',
				msg: e,
			}
		}
	})
	
	// 获取limitConfig文件
	ipcMain.handle('getLimitConfig', async (event, username) => {
		let lists = {}
		const filePath = `./AppData/${username}/limitConfig/`
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
				msg: e,
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
		const filePath = `./AppData/${username}/${fileName}`
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
	})

	// 更新limitConfig文件
	ipcMain.handle('updateLimitConfig', async (event, { username, params }) => {
		const path = `./AppData/${username}/limitConfig/`

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
				msg: e,
			}
		}

		try {
			Object.keys(params).forEach(key => {
				const filePath = `${path}${key}.json`
				fs.writeFileSync(filePath, JSON.stringify(params[key])) // 写入新文件
			})

			const files = fs.readdirSync(path)
			files.forEach(async file => {
				if (file.indexOf('temp') > -1) {
					fs.rmSync(`${path}${file}`, { recursive: true }) // 删除临时文件
				}
			})
		} catch (e) {
			const files = fs.readdirSync(path)
			files.forEach(async file => {
				if (file.indexOf('json') > -1) {
					fs.rmSync(`${path}${file}`, { recursive: true }) // 删除新数据文件
				}
			})

			const _files = fs.readdirSync(path)
			_files.forEach(async file => {
				if (file.indexOf('temp') > -1) {
					const fileName = file.split('.')[0]
					fs.renameSync(`${path}${file}`, `${path}${fileName}.json`) // 使用临时文件恢复旧文件
				}
			})

			return {
				data: null,
				success: false,
				code: '-4',
				msg: e,
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
	ipcMain.handle('updateConfigData', async (event, { username, password, fileName, text }) => {
		const filePath = `./AppData/${username}/${fileName}`
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
				msg: e,
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
				msg: e,
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
		const filePath = `./AppData/${username}/${fileName}`
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
				msg: e,
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
				msg: e,
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
