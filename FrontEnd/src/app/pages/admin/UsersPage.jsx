import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { UserCheck, UserX, Shield } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../../lib/axios.js";

function RoleModal({ user, onClose }) {
  const queryClient = useQueryClient();
  const [selectedRole, setSelectedRole] = useState(user.role?.roleName || "");

  const { data: roles } = useQuery({
    queryKey: ["roles"],
    queryFn:  () => api.get("/admin/roles").then((r) => r.data.data),
    select:   (data) => Array.isArray(data) ? data : (data?.roles || []),
  });

  const mutation = useMutation({
    mutationFn: (roleName) =>
      api.patch(`/admin/users/${user.userId}/role`, { roleName }),
    onSuccess: () => {
      toast.success("Đổi role thành công");
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      onClose();
    },
    onError: (err) => toast.error(err.response?.data?.message || "Thất bại"),
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-2xl w-full max-w-sm p-6">
        <h3 className="font-bold text-gray-800 mb-4">
          Đổi role — {user.fullName}
        </h3>
        <div className="space-y-2 mb-5">
          {roles?.map((r) => (
            <label
              key={r.roleId}
              className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition ${
                selectedRole === r.roleName
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <input
                type="radio" name="role" value={r.roleName}
                checked={selectedRole === r.roleName}
                onChange={() => setSelectedRole(r.roleName)}
                className="accent-blue-600"
              />
              <span className="text-sm font-medium text-gray-700">{r.roleName}</span>
            </label>
          ))}
        </div>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-700 hover:bg-gray-50"
          >
            Huỷ
          </button>
          <button
            onClick={() => mutation.mutate(selectedRole)}
            disabled={mutation.isPending || selectedRole === user.role?.roleName}
            className="flex-1 py-2.5 rounded-xl text-white text-sm font-semibold disabled:opacity-60"
            style={{ backgroundColor: "#1250dc" }}
          >
            {mutation.isPending ? "Đang xử lý..." : "Lưu"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function UsersPage() {
  const queryClient = useQueryClient();
  const [roleModalUser, setRoleModalUser] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn:  () => api.get("/admin/users").then((r) => r.data.data),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ userId, isActive }) =>
      api.patch(`/admin/users/${userId}/status`, { isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("Cập nhật trạng thái thành công");
    },
    onError: (err) => toast.error(err.response?.data?.message || "Thất bại"),
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Quản lý người dùng</h1>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              {["Người dùng", "Email", "Số điện thoại", "Vai trò", "Trạng thái", "Thao tác"].map((h) => (
                <th key={h} className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {isLoading
              ? Array(5).fill(0).map((_, i) => (
                  <tr key={i}>
                    {Array(6).fill(0).map((_, j) => (
                      <td key={j} className="px-6 py-4">
                        <div className="h-4 bg-gray-100 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              : data?.items?.map((user) => (
                  <tr key={user.userId} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0"
                          style={{ backgroundColor: "#1250dc" }}
                        >
                          {user.fullName?.charAt(0)?.toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">{user.fullName}</p>
                          <p className="text-xs text-gray-400">@{user.userName}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{user.email}</td>
                    <td className="px-6 py-4 text-gray-600">{user.phone || "N/A"}</td>
                    <td className="px-6 py-4">
                      <span className="bg-gray-100 text-gray-700 text-xs px-2.5 py-1 rounded-full font-medium">
                        {user.role?.roleName}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                        user.isActive
                          ? "bg-green-50 text-green-700 border-green-200"
                          : "bg-red-50 text-red-700 border-red-200"
                      }`}>
                        {user.isActive ? "Hoạt động" : "Bị khoá"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {/* Đổi role */}
                        <button
                          onClick={() => setRoleModalUser(user)}
                          className="p-2 rounded-xl text-purple-500 hover:bg-purple-50 transition"
                          title="Đổi role"
                        >
                          <Shield size={16} />
                        </button>
                        {/* Khoá/mở khoá */}
                        <button
                          onClick={() => toggleMutation.mutate({ userId: user.userId, isActive: !user.isActive })}
                          className={`p-2 rounded-xl transition ${
                            user.isActive ? "text-red-500 hover:bg-red-50" : "text-green-600 hover:bg-green-50"
                          }`}
                          title={user.isActive ? "Khoá tài khoản" : "Mở khoá"}
                        >
                          {user.isActive ? <UserX size={16} /> : <UserCheck size={16} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>

      {roleModalUser && (
        <RoleModal user={roleModalUser} onClose={() => setRoleModalUser(null)} />
      )}
    </div>
  );
}
