# Important Data

## 2019 

- Agregar filtro todos


> Subir app info
    - Generar apk firmado
            jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore elecciones.keystore /home/administrador/Projects/elecciones/elecciones_fe/platforms/android/app/build/outputs/apk/release/app-release-unsigned.apk eleccionesapp2
            zipalign -v 4 /home/administrador/Projects/elecciones/elecciones_fe/platforms/android/app/build/outputs/apk/release/app-release-unsigned.apk app-actualizada.apk

    - Cuenta play store
        gestagromovil@gmail.com
        p: Humb3rt01#



jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore /home/administrador/Escritorio/elecciones.keystore /home/administrador/Projects/elecciones/elecciones_fe/platforms/android/app/build/outputs/apk/release/app-release-unsigned.apk eleccionesapp2 && zipalign -v 4 /home/administrador/Projects/elecciones/elecciones_fe/platforms/android/app/build/outputs/apk/release/app-release-unsigned.apk /home/administrador/Escritorio/nueva-version.apk

## 2023

Comandos para levantar el backend con pm2:

PORT=3001 pm2 start /home/administrador/elecciones_be/server.js --watch --name "elecciones-be"
PORT=3002 pm2 start /home/administrador/elecciones_be_rosario/server.js --watch --name "elecciones-be-rosario" 
