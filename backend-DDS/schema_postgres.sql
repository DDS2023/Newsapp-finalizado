-- Crear tabla de usuarios para PostgreSQL
CREATE TABLE "User" (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  apellido VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  dni VARCHAR(20) NOT NULL,
  idiomaPreferido VARCHAR(50),
  contrasena VARCHAR(255) NOT NULL
);

-- Crear tabla Lista (agregado parentId para jerarquía)
CREATE TABLE Lista (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  userId INT NOT NULL,
  parentId INT NULL, -- Para sublistas
  CONSTRAINT FK_Lista_User
    FOREIGN KEY (userId) REFERENCES "User"(id),
  CONSTRAINT FK_Lista_Parent
    FOREIGN KEY (parentId) REFERENCES Lista(id)
);

-- Crear tabla News
CREATE TABLE News (
  id SERIAL PRIMARY KEY,
  titular VARCHAR(500) NOT NULL,
  cuerpo TEXT,
  fecha TIMESTAMP,
  idioma VARCHAR(50),
  tema VARCHAR(100),
  url VARCHAR(1000),
  fuente VARCHAR(255)
);

-- Crear tabla ListaNews (agregado leida para estado de lectura)
CREATE TABLE ListaNews (
  listaId INT NOT NULL,
  newsId INT NOT NULL,
  leida BOOLEAN DEFAULT FALSE, -- Estado de lectura
  CONSTRAINT PK_ListaNews PRIMARY KEY (listaId, newsId),
  CONSTRAINT FK_ListaNews_Lista
    FOREIGN KEY (listaId) REFERENCES Lista(id),
  CONSTRAINT FK_ListaNews_News
    FOREIGN KEY (newsId) REFERENCES News(id)
);

-- Crear tabla Search
CREATE TABLE Search (
  id SERIAL PRIMARY KEY,
  fechaBusqueda TIMESTAMP NOT NULL,
  cadena VARCHAR(255) NOT NULL,
  activa BOOLEAN NOT NULL,
  userId INT NOT NULL,
  CONSTRAINT FK_Search_User
    FOREIGN KEY (userId) REFERENCES "User"(id)
);