import { contextBridge, ipcRenderer } from 'electron'
// import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for ipcMain
const listen = {
	ipcMainCallRenderer: (callback) => ipcRenderer.on('ipcMainCallRenderer', async (event, value) => callback(value)),
}

// Custom APIs for renderer
const call = {
	rendererCallIpcMain: () => ipcRenderer.invoke('rendererCallIpcMain'),
	desktopCapturer: () => ipcRenderer.invoke('desktopCapturer'),
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
