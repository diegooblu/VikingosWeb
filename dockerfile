# Usa una imagen base de Node.js
FROM node:16-alpine

# Establece el directorio de trabajo
WORKDIR /app

# Copia los archivos del backend
COPY ./backend ./backend

# Copia los archivos del frontend
COPY ./frontend ./frontend

# Instala las dependencias del backend
RUN cd backend && npm install

# Expone el puerto 5000
EXPOSE 5000

# Comando para iniciar el servidor
CMD ["node", "backend/server.js"]