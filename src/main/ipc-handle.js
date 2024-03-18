import { ipcMain } from 'electron'
import { join } from 'path'
const fs = require('fs')
const crypto = require('crypto')

const algorithm = 'aes-256-cbc'
const iv = Buffer.alloc(16, 0) // 初始化向量

function encrypto(text, password) { // 加密
	const keyByte = Buffer.from(password)
	let cipher = crypto.createCipheriv(algorithm, keyByte, iv)
	let encrypted = cipher.update(text)
	encrypted = Buffer.concat([encrypted, cipher.final()])
	return encrypted.toString('hex')
}

function decrypto(text, password) { // 解密
	const keyByte = Buffer.from(password)
	let encryptedText = Buffer.from(text, 'hex')
	let decipher = crypto.createDecipheriv(algorithm, keyByte, iv)
	let decrypted = decipher.update(encryptedText)
	decrypted = Buffer.concat([decrypted, decipher.final()])

	return decrypted.toString()
}

export default (mainWindow) => {
	// IPC test
	ipcMain.on('ping', () => console.log('pong'))
	ipcMain.handle('rendererCallIpcMain', () => 'ping')
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
				msg: 'no such file or directory',
			}
		}
		return {
			data: lists,
			success: true,
			code: '200',
			msg: '',
		}
	})

	ipcMain.handle('getUserData', async (event, { username, password, fileName }) => {
		let lists = []
		try {
			lists = fs.readFileSync(`./AppData/${username}/${fileName}`).toString()
		} catch (e) {
			return {
				data: [],
				success: false,
				code: '-4058',
				msg: 'no such file or directory',
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
				msg: 'decryption failed',
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
