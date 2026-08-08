// frontend/src/pages/Admin/ManageHospitals.jsx
import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEdit,
  faTrash,
  faPlus,
  faSync,
  faSave,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";

const ManageHospitals = () => {
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  const token = localStorage.getItem("userToken");

  // Lấy danh sách bệnh viện hợp tác
  const fetchHospitals = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:5000/api/admin/hospitals", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (res.ok) {
        setHospitals(data);
      } else {
        setMessage(data.message || "Không thể tải danh sách");
        setMessageType("error");
      }
    } catch (error) {
      console.error("Lỗi fetch:", error);
      setMessage("Lỗi kết nối server");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  // Cập nhật thông tin bệnh viện
  const handleUpdate = async (maBenhVien) => {
    try {
      setLoading(true);
      const res = await fetch(`http://localhost:5000/api/admin/hospitals/${maBenhVien}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editForm),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("MS10: Cập nhật thành công");
        setMessageType("success");
        setEditingId(null);
        await fetchHospitals();
      } else {
        setMessage(data.message || "Cập nhật thất bại");
        setMessageType("error");
      }
    } catch (error) {
      console.error("Lỗi update:", error);
      setMessage("Lỗi kết nối server");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  // Xóa bệnh viện (chỉ xóa được nếu ngừng hoạt động)
  const handleDelete = async (maBenhVien, trangThai) => {
    if (trangThai === "đang hoạt động") {
      setMessage("MS46: Bệnh viện vẫn đang hoạt động, không thể xóa");
      setMessageType("error");
      return;
    }
    if (!window.confirm("Bạn có chắc chắn muốn xóa bệnh viện này?")) return;

    try {
      setLoading(true);
      const res = await fetch(`http://localhost:5000/api/admin/hospitals/${maBenhVien}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("MS45: Xóa tài khoản bệnh viện hợp tác thành công");
        setMessageType("success");
        await fetchHospitals();
      } else {
        setMessage(data.message || "Xóa thất bại");
        setMessageType("error");
      }
    } catch (error) {
      console.error("Lỗi delete:", error);
      setMessage("Lỗi kết nối server");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (hospital) => {
    setEditingId(hospital.MaBenhVien);
    setEditForm({ ...hospital });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  useEffect(() => {
    fetchHospitals();
  }, []);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">BM07: Danh sách bệnh viện hợp tác</h2>
        <button
          onClick={fetchHospitals}
          className="text-gray-500 hover:text-gray-700 text-sm flex items-center gap-1"
          disabled={loading}
        >
          <FontAwesomeIcon icon={faSync} className={loading ? "animate-spin" : ""} />
          Làm mới
        </button>
      </div>

      {message && (
        <div
          className={`px-4 py-2 rounded mb-4 ${
            messageType === "success"
              ? "bg-green-100 text-green-700 border border-green-200"
              : "bg-red-100 text-red-700 border border-red-200"
          }`}
        >
          {message}
        </div>
      )}

      {loading && <p className="text-gray-500">Đang tải...</p>}

      {!loading && hospitals.length === 0 ? (
        <p className="text-gray-500">Không có bệnh viện nào</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 text-left">STT</th>
                <th className="p-2 text-left">Mã BV</th>
                <th className="p-2 text-left">Tên bệnh viện</th>
                <th className="p-2 text-left">Địa chỉ</th>
                <th className="p-2 text-left">SĐT</th>
                <th className="p-2 text-left">Trạng thái</th>
                <th className="p-2 text-left">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {hospitals.map((item, index) => {
                const isEditing = editingId === item.MaBenhVien;
                return (
                  <tr key={item.MaBenhVien} className="border-b hover:bg-gray-50">
                    <td className="p-2">{index + 1}</td>
                    <td className="p-2 font-mono text-xs">{item.MaBenhVien}</td>
                    <td className="p-2">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editForm.TenBenhVien || ""}
                          onChange={(e) =>
                            setEditForm({ ...editForm, TenBenhVien: e.target.value })
                          }
                          className="border rounded px-2 py-1 w-full"
                        />
                      ) : (
                        item.TenBenhVien
                      )}
                    </td>
                    <td className="p-2">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editForm.DiaChiBenhVien || ""}
                          onChange={(e) =>
                            setEditForm({ ...editForm, DiaChiBenhVien: e.target.value })
                          }
                          className="border rounded px-2 py-1 w-full"
                        />
                      ) : (
                        item.DiaChiBenhVien
                      )}
                    </td>
                    <td className="p-2">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editForm.SoDienThoaiLienHe || ""}
                          onChange={(e) =>
                            setEditForm({ ...editForm, SoDienThoaiLienHe: e.target.value })
                          }
                          className="border rounded px-2 py-1 w-full"
                        />
                      ) : (
                        item.SoDienThoaiLienHe
                      )}
                    </td>
                    <td className="p-2">
                      {isEditing ? (
                        <select
                          value={editForm.TrangThai || "đang hợp tác"}
                          onChange={(e) =>
                            setEditForm({ ...editForm, TrangThai: e.target.value })
                          }
                          className="border rounded px-2 py-1"
                        >
                          <option value="đang hợp tác">đang hợp tác</option>
                          <option value="ngừng hoạt động">ngừng hoạt động</option>
                        </select>
                      ) : (
                        <span
                          className={`px-2 py-1 rounded text-xs font-semibold ${
                            item.TrangThai === "đang hợp tác"
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {item.TrangThai}
                        </span>
                      )}
                    </td>
                    <td className="p-2">
                      {isEditing ? (
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleUpdate(item.MaBenhVien)}
                            className="bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700 text-xs disabled:opacity-50"
                            disabled={loading}
                          >
                            <FontAwesomeIcon icon={faSave} />
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="bg-gray-400 text-white px-2 py-1 rounded hover:bg-gray-500 text-xs"
                          >
                            <FontAwesomeIcon icon={faTimes} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex gap-1">
                          <button
                            onClick={() => startEdit(item)}
                            className="bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 text-xs"
                          >
                            <FontAwesomeIcon icon={faEdit} />
                          </button>
                          <button
                            onClick={() => handleDelete(item.MaBenhVien, item.TrangThai)}
                            className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700 text-xs disabled:opacity-50"
                            disabled={loading}
                          >
                            <FontAwesomeIcon icon={faTrash} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <p className="text-gray-400 text-xs mt-2">Hiển thị {hospitals.length} bệnh viện</p>
        </div>
      )}
    </div>
  );
};

export default ManageHospitals;