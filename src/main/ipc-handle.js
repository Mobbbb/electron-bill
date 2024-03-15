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
	
	ipcMain.handle('getLimitConfig', async (event, username) => {
		let lists = {}
		const filePath = `./AppData/${username}/limitConfig/`
		try {
			const files = await fs.readdirSync(filePath)
			files.forEach(async file => {
				const fileName = file.split('.')
				const fileContent = await fs.readFileSync(join(filePath, file), 'utf8').toString()
				lists[fileName[0]] = JSON.parse(fileContent)
			})
		} catch (e) {
			return {
				data: {},
				success: false,
			}
		}
		return {
			data: lists,
			success: true,
		}
	})

	ipcMain.handle('getUserData', async (event, { username, password, fileName }) => {
		let lists = []
		try {
			lists = await fs.readFileSync(`./AppData/${username}/${fileName}`).toString()
		} catch (e) {
			return {
				data: [],
				success: false,
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
			}
		}

        return {
			data: lists,
			success: true,
		}
	})
}
