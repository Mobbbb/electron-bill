import { contextBridge, ipcRenderer } from 'electron'
// import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for ipcMain
const listen = {
	ipcMainCallRenderer: (callback) => ipcRenderer.on('ipcMainCallRenderer', async (event, value) => callback(value)),
}

// Custom APIs for renderer
const call = {
	rendererCallIpcMain: () => ipcRenderer.invoke('rendererCallIpcMain'),
	initAppData: (username, password, params) => ipcRenderer.invoke('initAppData', { username, password, params }),
	getLimitConfig: (username) => ipcRenderer.invoke('getLimitConfig', username),
	getUserData: (fileName, username, password) => ipcRenderer.invoke('getUserData', { username, fileName, password }),
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
	try {
		// contextBridge.exposeInMainWorld('electron', electronAPI)
		contextBridge.exposeInMainWorld('listen', listen)
		contextBridge.exposeInMainWorld('call', call)
	} catch (error) {
		console.error(error)
	}
} else {
	// window.electron = electronAPI
	window.listen = listen
	window.call = call
}
