# Proyecto Angular 17 + Electron JS 25

Este proyecto combina Angular 17 con Electron JS 25 para crear una aplicación de escritorio potente y escalable. Angular se encarga de la interfaz de usuario y la lógica del cliente, mientras que Electron permite empaquetar la aplicación como una aplicación de escritorio multiplataforma.

## Requisitos previos

- Node.js y npm: Asegúrate de tener Node.js y npm instalados en tu máquina.

## Instalación

1. Clona este repositorio: `git clone https://github.com/tu-usuario/tu-proyecto.git`

2. Entra en el directorio del proyecto: `cd tu-proyecto`

3. Instala las dependencias: `npm install`

# Modify AppUpdater.js
Para obtener la notificación de actualización en español buscar en ```node_modules/electron-updater/out/AppUpdater.js```
```
formatDownloadNotification()
```

```
if (downloadNotification == null) {
	downloadNotification = {
		title: "Una nueva versión esta lista para instalar",
		body: `{appName} version {version} fue descargada será instalada automaticamente despues de cerrar la aplicación`,
	};
}
```

## Desarrollo
Para ejecutar la aplicación en modo de desarrollo:

```bash
npm  run  electron:serve
```
## Build

```bash
npm  run  electron:build
```
