import { ipcMain, desktopCapturer, screen } from 'electron'

export default (mainWindow) => {
	// IPC test
	ipcMain.on('ping', () => console.log('pong'))
	ipcMain.handle('rendererCallIpcMain', () => 'ping')
	ipcMain.handle('desktopCapturer', async () => {
		const { x, y } = mainWindow.getBounds()
		const { size, scaleFactor } = screen.getPrimaryDisplay()
		const sources = await desktopCapturer.getSources({
			types: ['window'],
			thumbnailSize: {
				width: size.width * scaleFactor,
            	height: size.height * scaleFactor,
			},
		})

		// 获取第一个屏幕
        return {
			source: sources[0]?.thumbnail.toDataURL('image/png'),
			...size,
			x,
			y,
			scaleFactor,
		}
	})
}