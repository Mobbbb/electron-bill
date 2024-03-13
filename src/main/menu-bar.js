import { Menu } from 'electron'

export default (mainWindow, name) => {
	const menu = Menu.buildFromTemplate([
		{
		  label: name,
		  submenu: [
				{
					click: () => mainWindow.webContents.send('ipcMainCallRenderer', 1),
					label: 'Increment'
				},
				{
					click: () => mainWindow.webContents.send('ipcMainCallRenderer', -1),
					label: 'Decrement'
				}
			]
		}
	])
	Menu.setApplicationMenu(menu)
}