import { createList, getListsByUser, getListByIdAndUser } from '../database/list.repository.js';

export async function createListService(nombre, userId, parentId = null) {
  if (!nombre || !userId) {
    throw new Error('Nombre y userId son obligatorios');
  }

  // Si parentId, verificar que existe y pertenece al usuario
  if (parentId) {
    const parentList = await getListByIdAndUser(parentId, userId);
    if (!parentList) {
      throw new Error('Lista padre no encontrada o no pertenece al usuario');
    }
  }

  return await createList(nombre, userId, parentId);
}

export async function getListsService(userId) {
  return await getListsByUser(userId);
}
