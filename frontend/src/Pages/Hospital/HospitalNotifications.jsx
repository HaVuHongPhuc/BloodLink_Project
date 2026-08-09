// frontend/src/pages/Hospital/HospitalNotifications.jsx
import { useState, useEffect } from "react";
import HospitalLayout from "./HospitalLayout";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell, faRefresh } from "@fortawesome/free-solid-svg-icons";

const HospitalNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const token = localStorage.getItem("userToken");
  const maBenhVien = localStorage.getItem("maBenhVien");

  const fetchNotifications = async () => {
    if (!maBenhVien) {
      setMessage("Không tìm thấy mã bệnh viện");
      return;
    }
    try {
      setLoading(true);
      const res = await fetch(`http://localhost:5000/api/thong-bao/benh-vien/${maBenhVien}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setNotifications(data.data || []);
        if (data.data?.length === 0) {
          setMessage("Chưa có thông báo nào được gửi");
        }
      } else {
        setMessage(data.message || "Lỗi tải thông báo");
      }
    } catch (error) {
      setMessage("Lỗi kết nối server");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  return (
    <HospitalLayout>
      <div className="max-w-6xl mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <FontAwesomeIcon icon={faBell} className="text-blue-600" />
            BM14: Lịch sử thông báo đã gửi
          </h1>
          <button
            onClick={fetchNotifications}
            className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
          >
            <FontAwesomeIcon icon={faRefresh} className={loading ? "animate-spin" : ""} />
            Làm mới
          </button>
        </div>

        {message && (
          <div className={`p-3 rounded mb-4 ${message.includes("Lỗi") ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"}`}>
            {message}
          </div>
        )}

        {loading && <p className="text-gray-500">Đang tải...</p>}

        {!loading && notifications.length > 0 && (
          <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
            <table className="w-full text-sm border-collapse">
              <thead className="bg-gray-100 text-gray-700">
                <tr>
                  <th className="p-3 text-left">STT</th>
                  <th className="p-3 text-left">Mã thông báo</th>
                  <th className="p-3 text-left">Mã tài khoản</th>
                  <th className="p-3 text-left">Nội dung</th>
                  <th className="p-3 text-left">Ngày gửi</th>
                  <th className="p-3 text-left">Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {notifications.map((item, idx) => (
                  <tr key={item.MaThongBao} className="border-b hover:bg-gray-50">
                    <td className="p-3">{idx + 1}</td>
                    <td className="p-3 font-mono text-xs">{item.MaThongBao}</td>
                    <td className="p-3 font-medium">{item.MaTaiKhoan}</td>
                    <td className="p-3 max-w-xs truncate" title={item.NoiDung}>{item.NoiDung}</td>
                    <td className="p-3">{new Date(item.NgayGui).toLocaleString('vi-VN')}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        item.TrangThai === 'da gui' ? 'bg-yellow-100 text-yellow-800' :
                        item.TrangThai === 'da xem' ? 'bg-blue-100 text-blue-800' :
                        item.TrangThai === 'da dong y' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {item.TrangThai === 'da gui' ? 'Đã gửi' :
                         item.TrangThai === 'da xem' ? 'Đã xem' :
                         item.TrangThai === 'da dong y' ? 'Đã đồng ý' : 'Đã từ chối'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="text-gray-400 text-xs p-2">Hiển thị {notifications.length} thông báo</p>
          </div>
        )}
      </div>
    </HospitalLayout>
  );
};

export default HospitalNotifications;