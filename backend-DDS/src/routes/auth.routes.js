import express from 'express';
import jwt from 'jsonwebtoken';
import { createUser, findUserByEmail, validatePassword, findUserById, updateUser } from '../database/user.repository.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = express.Router();

// Registro
router.post('/register', async (req, res) => {
  try {
    const { nombre, apellido, email, dni, idiomaPreferido, contrasena } = req.body;

    // Verificar si el usuario ya existe
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: 'El email ya está registrado' });
    }

    // Crear usuario
    const user = await createUser(nombre, apellido, email, dni, idiomaPreferido, contrasena);
    res.status(201).json({ message: 'Usuario registrado exitosamente', userId: user.id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error en el registro' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, contrasena } = req.body;

    // Buscar usuario
    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    // Validar contraseña
    const isValid = await validatePassword(contrasena, user.contrasena);
    if (!isValid) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    // Generar token
    const token = jwt.sign({ userId: user.id, email: user.email }, process.env.JWT_SECRET || 'fallback_secret_dev_only', { expiresIn: '1h' });

    res.json({ message: 'Login exitoso', token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error en el login' });
  }
});

// Obtener perfil (protegido)
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await findUserById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener perfil' });
  }
});

// Actualizar perfil (protegido)
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const updates = req.body; // Ej: { nombre, apellido, email, dni, idiomaPreferido, contrasena }
    const updatedUser = await updateUser(req.user.userId, updates);
    res.json({ message: 'Perfil actualizado', user: updatedUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al actualizar perfil' });
  }
});

export default router;