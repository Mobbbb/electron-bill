const crypto = require('crypto')

const algorithm = 'aes-256-cbc'
const iv = Buffer.alloc(16, 0) // 初始化向量

export function encrypto(text, password) { // 加密
	const keyByte = Buffer.from(password)
	let cipher = crypto.createCipheriv(algorithm, keyByte, iv)
	let encrypted = cipher.update(text)
	encrypted = Buffer.concat([encrypted, cipher.final()])
	return encrypted.toString('hex')
}

export function decrypto(text, password) { // 解密
	const keyByte = Buffer.from(password)
	let encryptedText = Buffer.from(text, 'hex')
	let decipher = crypto.createDecipheriv(algorithm, keyByte, iv)
	let decrypted = decipher.update(encryptedText)
	decrypted = Buffer.concat([decrypted, decipher.final()])

	return decrypted.toString()
}
