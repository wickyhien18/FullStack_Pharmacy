// ================================================================
// Admin UsersPage.jsx — Quản lý người dùng
// ================================================================
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { UserCheck, UserX } from "lucide-react";
import toast from "react-hot-toast";
import api from "@/lib/axios.js";

export default function UsersPage() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: () => api.get("/admin/users").then((r) => r.data.data),
  });

  // Toggle khoá / mở khoá tài khoản
  const toggleMutation = useMutation({
    mutationFn: ({ userId, isActive }) =>
      api.patch(`/admin/users/${userId}/status`, { isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("Cập nhật thành công");
    },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        Quản lý người dùng
      </h1>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              {[
                "Người dùng",
                "Email",
                "Số điện thoại",
                "Vai trò",
                "Trạng thái",
                "",
              ].map((h) => (
                <th
                  key={h}
                  className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {isLoading
              ? Array(5)
                  .fill(0)
                  .map((_, i) => (
                    <tr key={i}>
                      {Array(6)
                        .fill(0)
                        .map((_, j) => (
                          <td key={j} className="px-4 py-3">
                            <div className="h-4 bg-gray-100 rounded animate-pulse" />
                          </td>
                        ))}
                    </tr>
                  ))
              : data?.items?.map((user) => (
                  <tr key={user.userId} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 bg-primary-100 rounded-full flex items-center
                                        justify-center text-primary-600 font-bold text-xs"
                        >
                          {user.fullName?.charAt(0)?.toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-gray-700">
                            {user.fullName}
                          </p>
                          <p className="text-xs text-gray-400">
                            @{user.userName}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{user.email}</td>
                    <td className="px-4 py-3 text-gray-500">{user.phone}</td>
                    <td className="px-4 py-3">
                      <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">
                        {user.role?.roleName}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-full
                        ${user.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-500"}`}
                      >
                        {user.isActive ? "Hoạt động" : "Bị khoá"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() =>
                          toggleMutation.mutate({
                            userId: user.userId,
                            isActive: !user.isActive,
                          })
                        }
                        className="text-gray-400 hover:text-primary-500 transition"
                        title={user.isActive ? "Khoá tài khoản" : "Mở khoá"}
                      >
                        {user.isActive ? (
                          <UserX size={16} />
                        ) : (
                          <UserCheck size={16} />
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
