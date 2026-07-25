import { useState, useEffect } from "react";

const ManageHospitals = () => {
  const [hospitals, setHospitals] = useState([]);
  const [editingHospital, setEditingHospital] = useState(null);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null); // Lưu ID bệnh viện cần xóa

  useEffect(() => {
    const storedHospitals = localStorage.getItem("hospitalAccounts");
    if (storedHospitals) {
      setHospitals(JSON.parse(storedHospitals));
    } else {
      const initialHospitals = [
        {
          id: "BV001",
          maBV: "BV001",
          tenBV: "Bệnh viện Chợ Rẫy",
          nguoiDaiDien: "Nguyễn Văn A",
          diaChi: "201B Nguyễn Chí Thanh, Q.5, TP.HCM",
          maSoThue: "0301234567",
          sdt: "02838554137",
          email: "choray@bloodlink.vn",
          ngayDangKy: "2026-01-15",
          ngayThamGia: "2026-02-01",
          trangThai: "Đang hoạt động",
        },
        {
          id: "BV002",
          maBV: "BV002",
          tenBV: "Bệnh viện Truyền máu Huyết học",
          nguoiDaiDien: "Trần Thị B",
          diaChi: "118 Hồng Bàng, Q.5, TP.HCM",
          maSoThue: "0307654321",
          sdt: "02839571342",
          email: "bvhuyethoc@bloodlink.vn",
          ngayDangKy: "2026-03-10",
          ngayThamGia: "2026-03-20",
          trangThai: "Ngừng hoạt động",
        },
      ];
      localStorage.setItem("hospitalAccounts", JSON.stringify(initialHospitals));
      setHospitals(initialHospitals);
    }
  }, []);

  const saveToLocalStorage = (data) => {
    setHospitals(data);
    localStorage.setItem("hospitalAccounts", JSON.stringify(data));
  };

  const showAlert = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 4000);
  };

  // --- HÀM CẬP NHẬT ---
  const handleUpdate = (e) => {
    e.preventDefault();
    
    // Ràng buộc dữ liệu đầu vào: Thiếu thông tin (Alternative Flow 1)
    if (
      !editingHospital.tenBV || !editingHospital.nguoiDaiDien || 
      !editingHospital.diaChi || !editingHospital.maSoThue || 
      !editingHospital.sdt || !editingHospital.email
    ) {
      showAlert("error", "MS05: Thiếu thông tin yêu cầu. Vui lòng điền đầy đủ các trường dữ liệu!");
      return;
    }

    const updatedList = hospitals.map((item) =>
      item.id === editingHospital.id ? editingHospital : item
    );
    
    saveToLocalStorage(updatedList);
    setEditingHospital(null);
    showAlert("success", "MS10: Hệ thống đã cập nhật thông tin mới vào danh sách tài khoản bệnh viện thành công.");
  };

  // --- HÀM XÓA CHÍNH THỨC ---
  const handleDelete = (hospital) => {
    // Ràng buộc nghiệp vụ BR15 / Alternative Flow 4: Bệnh viện đang hoạt động thì KHÔNG thể xóa
    if (hospital.trangThai === "Đang hoạt động") {
      showAlert("error", "MS46: Bệnh viện vẫn đang hoạt động, không thể xóa khỏi danh sách hợp tác!");
      setShowDeleteConfirm(null);
      return;
    }

    // Tiến hành xóa nếu trạng thái là Ngừng hoạt động (Alternative Flow 2)
    const updatedList = hospitals.filter((item) => item.id !== hospital.id);
    saveToLocalStorage(updatedList);
    setShowDeleteConfirm(null);
    showAlert("success", "MS45: Xóa tài khoản bệnh viện hợp tác thành công.");
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-800">Quản lý & Cập nhật danh sách tài khoản bệnh viện</h2>

      {/* Hiển thị Thông báo MS */}
      {message.text && (
        <div className={`p-4 rounded-md font-medium text-sm ${
          message.type === "success" ? "bg-green-100 text-green-800 border-l-4 border-green-600" : "bg-red-100 text-red-800 border-l-4 border-red-600"
        }`}>
          {message.text}
        </div>
      )}

      {/* BIỂU MẪU CẬP NHẬT (Form chỉnh sửa ẩn hiện linh hoạt) */}
      {editingHospital && (
        <form onSubmit={handleUpdate} className="bg-gray-50 border border-gray-200 rounded-lg p-5 space-y-4">
          <h3 className="text-md font-bold text-gray-700">Chỉnh sửa thông tin: {editingHospital.maBV}</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Tên bệnh viện *</label>
              <input type="text" className="w-full p-2 border border-gray-300 rounded text-sm" value={editingHospital.tenBV} onChange={(e) => setEditingHospital({...editingHospital, tenBV: e.target.value})} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Người đại diện *</label>
              <input type="text" className="w-full p-2 border border-gray-300 rounded text-sm" value={editingHospital.nguoiDaiDien} onChange={(e) => setEditingHospital({...editingHospital, nguoiDaiDien: e.target.value})} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Số điện thoại *</label>
              <input type="text" className="w-full p-2 border border-gray-300 rounded text-sm" value={editingHospital.sdt} onChange={(e) => setEditingHospital({...editingHospital, sdt: e.target.value})} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Email bệnh viện *</label>
              <input type="email" className="w-full p-2 border border-gray-300 rounded text-sm" value={editingHospital.email} onChange={(e) => setEditingHospital({...editingHospital, email: e.target.value})} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Mã số thuế *</label>
              <input type="text" className="w-full p-2 border border-gray-300 rounded text-sm" value={editingHospital.maSoThue} onChange={(e) => setEditingHospital({...editingHospital, maSoThue: e.target.value})} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Trạng thái hoạt động</label>
              <select className="w-full p-2 border border-gray-300 rounded text-sm bg-white" value={editingHospital.trangThai} onChange={(e) => setEditingHospital({...editingHospital, trangThai: e.target.value})}>
                <option value="Đang hoạt động">Đang hoạt động</option>
                <option value="Ngừng hoạt động">Ngừng hoạt động</option>
              </select>
            </div>
            <div className="md:col-span-3">
              <label className="block text-xs font-medium text-gray-600 mb-1">Địa chỉ bệnh viện *</label>
              <input type="text" className="w-full p-2 border border-gray-300 rounded text-sm" value={editingHospital.diaChi} onChange={(e) => setEditingHospital({...editingHospital, diaChi: e.target.value})} />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className="px-4 py-2 text-sm bg-gray-300 hover:bg-gray-400 rounded" onClick={() => setEditingHospital(null)}>Hủy bỏ</button>
            <button type="submit" className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded">Cập nhật</button>
          </div>
        </form>
      )}

      {/* POPUP XÁC NHẬN XÓA (Alternative Flow 2 & 3) */}
      {showDeleteConfirm && (
        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-md flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <p className="text-sm text-yellow-800">
            Biểu mẫu: Bạn có chắc chắn muốn xóa tài khoản bệnh viện <strong>{showDeleteConfirm.tenBV}</strong> không?
          </p>
          <div className="flex gap-2">
            {/* Chọn Hủy (Alternative Flow 3 - Hệ thống hoàn tác yêu cầu) */}
            <button className="px-3 py-1 bg-gray-300 hover:bg-gray-400 text-xs rounded" onClick={() => setShowDeleteConfirm(null)}>Hủy</button>
            {/* Chọn Xác nhận xóa */}
            <button className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded" onClick={() => handleDelete(showDeleteConfirm)}>Xác nhận xóa</button>
          </div>
        </div>
      )}

      {/* BIỂU MẪU CHUẨN BM11: HIỂN THỊ DANH SÁCH TÀI KHOẢN BỆNH VIỆN */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left border border-gray-200 rounded-lg">
          <thead className="bg-gray-100 text-gray-700 text-xs uppercase border-b border-gray-200">
            <tr>
              <th className="px-3 py-3 text-center">STT</th>
              <th className="px-3 py-3">Mã bệnh viện</th>
              <th className="px-4 py-3">Tên bệnh viện</th>
              <th className="px-4 py-3">Người đại diện</th>
              <th className="px-4 py-3">Địa chỉ bệnh viện</th>
              <th className="px-3 py-3">Mã số thuế</th>
              <th className="px-3 py-3">Số điện thoại</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-3 py-3">Ngày đăng ký</th>
              <th className="px-3 py-3">Ngày tham gia</th>
              <th className="px-3 py-3 text-center">Trạng thái</th>
              <th className="px-4 py-3 text-center">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 text-xs">
            {hospitals.length === 0 ? (
              <tr>
                <td colSpan="12" className="text-center py-6 text-gray-500 font-medium">Không tìm thấy kết quả phù hợp</td>
              </tr>
            ) : (
              hospitals.map((hospital, index) => (
                <tr key={hospital.id} className="hover:bg-gray-50">
                  <td className="px-3 py-3 text-center font-medium">{index + 1}</td>
                  <td className="px-3 py-3 font-semibold text-gray-700">{hospital.maBV}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">{hospital.tenBV}</td>
                  <td className="px-4 py-3 text-gray-600">{hospital.nguoiDaiDien}</td>
                  <td className="px-4 py-3 text-gray-500 max-w-[180px] truncate" title={hospital.diaChi}>{hospital.diaChi}</td>
                  <td className="px-3 py-3 text-gray-600">{hospital.maSoThue}</td>
                  <td className="px-3 py-3 text-gray-600">{hospital.sdt}</td>
                  <td className="px-4 py-3 text-gray-600">{hospital.email}</td>
                  <td className="px-3 py-3 text-gray-500">{hospital.ngayDangKy}</td>
                  <td className="px-3 py-3 text-gray-500">{hospital.ngayThamGia}</td>
                  <td className="px-3 py-3 text-center">
                    <span className={`px-2 py-1 rounded-full font-semibold text-[10px] ${
                      hospital.trangThai === "Đang hoạt động" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    }`}>
                      {hospital.trangThai}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center space-x-2">
                    <button className="text-blue-600 hover:text-blue-800 font-medium" onClick={() => { setEditingHospital(hospital); window.scrollTo({top: 0, behavior: 'smooth'}); }}>Sửa</button>
                    <button className="text-red-600 hover:text-red-800 font-medium" onClick={() => setShowDeleteConfirm(hospital)}>Xóa</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManageHospitals;