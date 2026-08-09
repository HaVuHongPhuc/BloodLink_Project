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
  const [allHospitals, setAllHospitals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [selectedHospital, setSelectedHospital] = useState(null);

  const token = localStorage.getItem("userToken");

  // Lấy danh sách bệnh viện hợp tác (BenhVienHopTac)
  const fetchHospitals = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:5000/api/hospitals", {
        headers: { Authorization: `Bearer ${token}` },
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

  // Lấy tất cả bệnh viện từ TaiKhoanBenhVien (để thêm vào hợp tác)
  const fetchAllHospitals = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/admin/all-hospitals", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setAllHospitals(data);
      }
    } catch (error) {
      console.error("Lỗi fetch all hospitals:", error);
    }
  };

  // Thêm bệnh viện vào danh sách hợp tác
  const handleAddHospital = async () => {
    if (!selectedHospital) {
      setMessage("Vui lòng chọn bệnh viện");
      setMessageType("error");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("http://localhost:5000/api/hospitals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          MaBenhVien: selectedHospital.MaBenhVien,
          MaTaiKhoanBenhVien: selectedHospital.MaTaiKhoanBenhVien || selectedHospital.MaBenhVien,
          TenBenhVien: selectedHospital.TenBenhVien,
          DiaChiBenhVien: selectedHospital.DiaChiBenhVien,
          TenNguoiLienHe: selectedHospital.NguoiDaiDien || selectedHospital.TenNguoiLienHe,
          SoDienThoaiLienHe: selectedHospital.SoDienThoaiBenhVien || selectedHospital.SoDienThoaiLienHe,
          Email: selectedHospital.Email,
          TrangThai: "Đang hợp tác",
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("Thêm bệnh viện hợp tác thành công");
        setMessageType("success");
        setShowAddModal(false);
        setSelectedHospital(null);
        setSearchKeyword("");
        fetchHospitals();
      } else {
        setMessage(data.message || "Thêm thất bại");
        setMessageType("error");
      }
    } catch (error) {
      console.error("Lỗi add:", error);
      setMessage("Lỗi kết nối server");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  // Cập nhật thông tin bệnh viện hợp tác
  const handleUpdate = async (maBenhVien) => {
    try {
      setLoading(true);
      const res = await fetch(`http://localhost:5000/api/hospitals/${maBenhVien}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editForm),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("Cập nhật thành công");
        setMessageType("success");
        setEditingId(null);
        fetchHospitals();
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

  // Xóa bệnh viện khỏi danh sách hợp tác
  const handleDelete = async (maBenhVien) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa bệnh viện này khỏi danh sách hợp tác?")) return;

    try {
      setLoading(true);
      const res = await fetch(`http://localhost:5000/api/hospitals/${maBenhVien}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("Xóa thành công");
        setMessageType("success");
        fetchHospitals();
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
    setEditingId(hospital._id);
    setEditForm({ ...hospital });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  // Hàm hiển thị trạng thái dễ nhìn
  const displayStatus = (status) => {
    if (!status) return "Đang hợp tác";
    // Chuẩn hóa các giá trị trạng thái để hiển thị đẹp
    if (status === "Đang hoạt động" || status === "dang hop tac" || status === "Đang hợp tác") {
      return "Đang hợp tác";
    }
    if (status === "Ngừng hơp tác" || status === "ngung hop tac" || status === "Ngừng hợp tác") {
      return "Ngừng hợp tác";
    }
    return status; // trả về nguyên giá trị nếu không khớp
  };

  // Xác định màu cho trạng thái
  const getStatusColor = (status) => {
    const display = displayStatus(status);
    return display === "Đang hợp tác" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700";
  };

  useEffect(() => {
    fetchHospitals();
    fetchAllHospitals();
  }, []);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  // Lọc bệnh viện chưa có trong danh sách hợp tác
  const availableHospitals = allHospitals.filter(
    (h) => !hospitals.some((hc) => hc.MaBenhVien === h.MaBenhVien)
  );

  const filteredAvailable = availableHospitals.filter(
    (h) =>
      h.TenBenhVien.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      h.MaBenhVien.toLowerCase().includes(searchKeyword.toLowerCase())
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Danh sách bệnh viện hợp tác</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2"
          >
            <FontAwesomeIcon icon={faPlus} /> Thêm bệnh viện
          </button>
          <button
            onClick={fetchHospitals}
            className="text-gray-500 hover:text-gray-700 text-sm flex items-center gap-1"
            disabled={loading}
          >
            <FontAwesomeIcon icon={faSync} className={loading ? "animate-spin" : ""} />
            Làm mới
          </button>
        </div>
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
        <p className="text-gray-500">Chưa có bệnh viện hợp tác</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 text-left">STT</th>
                <th className="p-2 text-left">Mã BV</th>
                <th className="p-2 text-left">Mã TK</th>
                <th className="p-2 text-left">Tên bệnh viện</th>
                <th className="p-2 text-left">Địa chỉ</th>
                <th className="p-2 text-left">SĐT</th>
                <th className="p-2 text-left">Trạng thái</th>
                <th className="p-2 text-left">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {hospitals.map((item, index) => {
                const isEditing = editingId === item._id;
                return (
                  <tr key={item._id} className="border-b hover:bg-gray-50">
                    <td className="p-2">{index + 1}</td>
                    <td className="p-2 font-mono text-xs">{item.MaBenhVien}</td>
                    <td className="p-2 font-mono text-xs">{item.MaTaiKhoanBenhVien || "---"}</td>
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
                          value={editForm.TrangThai || "Đang hợp tác"}
                          onChange={(e) =>
                            setEditForm({ ...editForm, TrangThai: e.target.value })
                          }
                          className="border rounded px-2 py-1"
                        >
                          <option value="Đang hợp tác">Đang hợp tác</option>
                          <option value="Ngừng hợp tác">Ngừng hợp tác</option>
                        </select>
                      ) : (
                        <span
                          className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(
                            item.TrangThai
                          )}`}
                        >
                          {displayStatus(item.TrangThai)}
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
                            onClick={() => handleDelete(item.MaBenhVien)}
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

      {/* MODAL THÊM BỆNH VIỆN HỢP TÁC */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Thêm bệnh viện hợp tác</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Tìm kiếm bệnh viện</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Nhập tên hoặc mã bệnh viện..."
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  className="flex-1 border rounded px-3 py-2 text-sm"
                />
                <button
                  onClick={() => fetchAllHospitals()}
                  className="bg-gray-200 hover:bg-gray-300 px-3 py-2 rounded text-sm"
                >
                  <FontAwesomeIcon icon={faSync} />
                </button>
              </div>
            </div>

            <div className="mb-4 max-h-60 overflow-y-auto border rounded">
              {filteredAvailable.length === 0 ? (
                <p className="p-4 text-gray-500 text-sm">Không có bệnh viện nào để thêm</p>
              ) : (
                filteredAvailable.map((h) => (
                  <div
                    key={h._id}
                    className={`p-3 border-b hover:bg-gray-50 cursor-pointer flex justify-between items-center ${
                      selectedHospital?._id === h._id ? "bg-blue-50 border-l-4 border-blue-500" : ""
                    }`}
                    onClick={() => setSelectedHospital(h)}
                  >
                    <div>
                      <p className="font-medium text-sm">{h.TenBenhVien}</p>
                      <p className="text-xs text-gray-500">Mã: {h.MaBenhVien} | TK: {h.MaTaiKhoanBenhVien}</p>
                    </div>
                    {selectedHospital?._id === h._id && (
                      <span className="text-blue-600 text-xs font-semibold">Đã chọn</span>
                    )}
                  </div>
                ))
              )}
            </div>

            {selectedHospital && (
              <div className="bg-gray-50 p-3 rounded mb-4">
                <p className="text-sm font-medium">Đã chọn: <span className="text-blue-600">{selectedHospital.TenBenhVien}</span></p>
              </div>
            )}

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 border rounded hover:bg-gray-50 text-sm"
              >
                Hủy
              </button>
              <button
                onClick={handleAddHospital}
                disabled={!selectedHospital || loading}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded text-sm font-semibold disabled:opacity-50"
              >
                {loading ? "Đang xử lý..." : "Thêm vào hợp tác"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageHospitals;