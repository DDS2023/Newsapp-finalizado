import bcrypt from 'bcrypt';
import { pool } from './db.js';

export async function createUser(nombre, apellido, email, dni, idiomaPreferido, contrasena) {
  const hashedPassword = await bcrypt.hash(contrasena, 10);
  const result = await pool.query(
    `INSERT INTO "User" (nombre, apellido, email, dni, idiomaPreferido, contrasena) 
     VALUES ($1, $2, $3, $4, $5, $6) 
     RETURNING id, nombre, apellido, email, dni, idiomaPreferido AS "idiomaPreferido"`,
    [nombre, apellido, email, dni, idiomaPreferido, hashedPassword]
  );
  return result.rows[0];
}

export async function findUserByEmail(email) {
  const result = await pool.query(
    `SELECT id, nombre, apellido, email, dni, idiomaPreferido AS "idiomaPreferido", contrasena 
     FROM "User" WHERE email = $1`,
    [email]
  );
  return result.rows[0];
}

export async function findUserById(id) {
  const result = await pool.query(
    `SELECT id, nombre, apellido, email, dni, idiomaPreferido AS "idiomaPreferido" 
     FROM "User" WHERE id = $1`,
    [id]
  );
  return result.rows[0];
}

export async function updateUser(id, updates) {
  const fields = [];
  const values = [];
  let index = 1;

  if (updates.nombre) {
    fields.push(`nombre = $${index++}`);
    values.push(updates.nombre);
  }
  if (updates.apellido) {
    fields.push(`apellido = $${index++}`);
    values.push(updates.apellido);
  }
  if (updates.email) {
    fields.push(`email = $${index++}`);
    values.push(updates.email);
  }
  if (updates.dni) {
    fields.push(`dni = $${index++}`);
    values.push(updates.dni);
  }
  if (updates.idiomaPreferido !== undefined) {
    fields.push(`idiomaPreferido = $${index++}`);
    values.push(updates.idiomaPreferido);
  }
  if (updates.contrasena) {
    const hashedPassword = await bcrypt.hash(updates.contrasena, 10);
    fields.push(`contrasena = $${index++}`);
    values.push(hashedPassword);
  }

  if (fields.length === 0) {
    throw new Error('No hay campos para actualizar');
  }

  values.push(id);
  const query = `UPDATE "User" SET ${fields.join(', ')} WHERE id = $${index} 
                 RETURNING id, nombre, apellido, email, dni, idiomaPreferido AS "idiomaPreferido"`;

  const result = await pool.query(query, values);
  return result.rows[0];
}

export async function validatePassword(plainPassword, hashedPassword) {
  return await bcrypt.compare(plainPassword, hashedPassword);
}