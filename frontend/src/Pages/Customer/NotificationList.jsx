import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faTimes, faRefresh } from "@fortawesome/free-solid-svg-icons";

const NotificationList = ({ maTaiKhoan }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const token = localStorage.getItem("userToken");

  const fetchNotifications = async () => {
    if (!maTaiKhoan) return;
    try {
      setLoading(true);
      const res = await fetch(`http://localhost:5000/api/thong-bao/khach-hang/${maTaiKhoan}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setNotifications(data.data || []);
      } else {
        setNotifications([]);
        setMessage(data.message || "MS47: Hiện tại không có thông báo nào");
      }
    } catch (error) {
      setMessage("Lỗi kết nối server");
    } finally {
      setLoading(false);
    }
  };

  const handlePhanHoi = async (maThongBao, phanHoi) => {
    try {
      const res = await fetch("http://localhost:5000/api/thong-bao/phan-hoi", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ maThongBao, phanHoi }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("MS48: Đã gửi phản hồi");
        fetchNotifications();
        setTimeout(() => setMessage(""), 3000);
      } else {
        setMessage(data.message || "Phản hồi thất bại");
      }
    } catch (error) {
      setMessage("Lỗi kết nối server");
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [maTaiKhoan]);

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">BM14: Danh sách thông báo</h3>
        <button
          onClick={fetchNotifications}
          className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
        >
          <FontAwesomeIcon icon={faRefresh} className={loading ? "animate-spin" : ""} />
          Làm mới
        </button>
      </div>

      {message && (
        <div className={`p-3 rounded mb-4 ${message.includes("MS48") ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
          {message}
        </div>
      )}

      {loading && <p className="text-gray-500">Đang tải...</p>}

      {!loading && notifications.length === 0 && (
        <p className="text-gray-500">MS47: Hiện tại không có thông báo nào</p>
      )}

      {!loading && notifications.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 text-left">STT</th>
                <th className="p-2 text-left">Bệnh viện</th>
                <th className="p-2 text-left">Nội dung</th>
                <th className="p-2 text-left">Ngày gửi</th>
                <th className="p-2 text-left">Trạng thái</th>
                <th className="p-2 text-left">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {notifications.map((item, index) => (
                <tr key={item.MaThongBao} className="border-b hover:bg-gray-50">
                  <td className="p-2">{index + 1}</td>
                  <td className="p-2 font-medium">{item.TenBenhVien}</td>
                  <td className="p-2">{item.NoiDung}</td>
                  <td className="p-2">{new Date(item.NgayGui).toLocaleString()}</td>
                  <td className="p-2">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      item.TrangThai === "da gui" ? "bg-yellow-100 text-yellow-700" :
                      item.TrangThai === "da xem" ? "bg-blue-100 text-blue-700" :
                      item.TrangThai === "da dong y" ? "bg-green-100 text-green-700" :
                      "bg-red-100 text-red-700"
                    }`}>
                      {item.TrangThai === "da gui" ? "Đã gửi" :
                       item.TrangThai === "da xem" ? "Đã xem" :
                       item.TrangThai === "da dong y" ? "Đã đồng ý" : "Đã từ chối"}
                    </span>
                  </td>
                  <td className="p-2">
                    {item.TrangThai === "da xem" && item.LoaiThongBao === "yeu cau hien mau" ? (
                      <div className="flex gap-1">
                        <button
                          onClick={() => handlePhanHoi(item.MaThongBao, "dong y")}
                          className="bg-green-600 text-white px-2 py-1 rounded text-xs hover:bg-green-700"
                        >
                          <FontAwesomeIcon icon={faCheck} className="mr-1" /> Đồng ý
                        </button>
                        <button
                          onClick={() => handlePhanHoi(item.MaThongBao, "tu choi")}
                          className="bg-red-600 text-white px-2 py-1 rounded text-xs hover:bg-red-700"
                        >
                          <FontAwesomeIcon icon={faTimes} className="mr-1" /> Từ chối
                        </button>
                      </div>
                    ) : (
                      <span className="text-gray-400 text-xs">Đã phản hồi</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default NotificationList;