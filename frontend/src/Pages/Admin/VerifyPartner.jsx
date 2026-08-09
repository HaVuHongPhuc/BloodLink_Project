// frontend/src/pages/Admin/VerifyPartner.jsx
import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faTimes, faSync } from "@fortawesome/free-solid-svg-icons";

const VerifyPartner = () => {
  const [pendingList, setPendingList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [passwordInfo, setPasswordInfo] = useState("");
  const [messageType, setMessageType] = useState("success"); // success | error
  const [messageVisible, setMessageVisible] = useState(false);

  const token = localStorage.getItem("userToken");

  const fetchPendingList = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:5000/api/admin/danh-sach-cho-xac-thuc", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (res.ok) {
        setPendingList(data);
      } else {
        setPendingList([]);
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

  const handleVerify = async (maDangKy, action) => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:5000/api/admin/xac-thuc-doi-tac", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ maDangKy, action }),
      });
      const data = await res.json();
      setMessage(data.message || (action === "duyet" ? "MS03: Đã tạo tài khoản" : "MS04: Đã từ chối yêu cầu"));
      setPasswordInfo(data.matKhauTamThoi ? `Mật khẩu tạm thời: ${data.matKhauTamThoi}` : "");
      setMessageType(res.ok ? "success" : "error");
      setMessageVisible(true);
      if (res.ok) {
        // Cập nhật lại danh sách
        await fetchPendingList();
      }
    } catch (error) {
      console.error("Lỗi xác thực:", error);
      setMessage("Lỗi kết nối server");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingList();
  }, []);

  // Tự động ẩn thông báo sau 3 giây
  useEffect(() => {
    if (message) {
      setMessageVisible(true);
    }
  }, [message]);

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Danh sách chờ xác thực</h2>
        <button
          onClick={fetchPendingList}
          className="text-gray-500 hover:text-gray-700 text-sm flex items-center gap-1"
          disabled={loading}
        >
          <FontAwesomeIcon icon={faSync} className={loading ? "animate-spin" : ""} />
          Làm mới
        </button>
      </div>

      {messageVisible && (
        <div
          className={`px-4 py-2 rounded mb-4 ${
            messageType === "success"
              ? "bg-green-100 text-green-700 border border-green-200"
              : "bg-red-100 text-red-700 border border-red-200"
          }`}
        >
          <div className="flex justify-between items-start gap-4">
            <div>
              <div>{message}</div>
              {passwordInfo && <div className="mt-2 font-medium">{passwordInfo}</div>}
            </div>
            <button
              onClick={() => setMessageVisible(false)}
              className="text-gray-500 hover:text-gray-700 text-sm"
            >
              Đóng
            </button>
          </div>
        </div>
      )}

      {loading && <p className="text-gray-500">Đang tải...</p>}

      {!loading && pendingList.length === 0 ? (
        <p className="text-gray-500">Không có yêu cầu chờ xác thực</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 text-left">STT</th>
                <th className="p-2 text-left">Tên bệnh viện</th>
                <th className="p-2 text-left">Người đại diện</th>
                <th className="p-2 text-left">Email</th>
                <th className="p-2 text-left">SĐT</th>
                <th className="p-2 text-left">Ngày đăng ký</th>
                <th className="p-2 text-left">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {pendingList.map((item, index) => (
                <tr key={item.MaDangKy} className="border-b hover:bg-gray-50">
                  <td className="p-2">{index + 1}</td>
                  <td className="p-2 font-medium">{item.TenBenhVien}</td>
                  <td className="p-2">{item.NguoiDaiDien}</td>
                  <td className="p-2">{item.Email}</td>
                  <td className="p-2">{item.SoDienThoaiBenhVien}</td>
                  <td className="p-2">{new Date(item.NgayDangKy).toLocaleDateString()}</td>
                  <td className="p-2">
                    <button
                      onClick={() => handleVerify(item.MaDangKy, "duyet")}
                      className="bg-green-600 text-white px-3 py-1 rounded mr-2 hover:bg-green-700 text-sm disabled:opacity-50"
                      disabled={loading}
                    >
                      <FontAwesomeIcon icon={faCheck} className="mr-1" /> Duyệt
                    </button>
                    <button
                      onClick={() => handleVerify(item.MaDangKy, "tu_choi")}
                      className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 text-sm disabled:opacity-50"
                      disabled={loading}
                    >
                      <FontAwesomeIcon icon={faTimes} className="mr-1" /> Từ chối
                    </button>
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

export default VerifyPartner;