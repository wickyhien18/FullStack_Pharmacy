
import * as roleRepo from '../repositories/role.repository.js';

const format = (r) => ({
  roleId:   r.roleId.toString(),
  roleName: r.roleName,
});

export const getRoles = async () => {
  const roles = await roleRepo.findAllRoles();
  return roles.map(format);
};
