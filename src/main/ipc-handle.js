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
				msg: 'Directory created failed',
			}
		}
	})
	
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
				msg: 'Encrypto failed',
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
				msg: 'WriteFileSync or RenameSync failed',
			}
		}

		return {
			data: null,
			success: true,
			code: '200',
			msg: '保存成功',
		}
	})

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
}
