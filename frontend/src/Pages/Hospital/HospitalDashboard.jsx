import { useState, useEffect } from "react";
import HospitalLayout from "./HospitalLayout";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHospital,
  faUser,
  faEnvelope,
  faPhone,
  faCalendarAlt,
  faSignOutAlt,
  faSearch,
  faBell,
  faBullhorn,
  faChartLine,
  faTint,
  faClipboardList,
  faHistory,
} from "@fortawesome/free-solid-svg-icons";

const HospitalDashboard = () => {
  const [hospitalInfo, setHospitalInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("userToken");

  useEffect(() => {
    const role = localStorage.getItem("userRole");
    if (!token || (role !== "hospital" && role !== "BenhVien")) {
      window.location.href = "/partner-login";
      return;
    }

    const fetchHospitalInfo = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/hospital/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        if (response.ok) {
          setHospitalInfo(data);
        } else {
          setError(data.message || "Không thể lấy thông tin bệnh viện");
          if (response.status === 401) {
            localStorage.removeItem("userToken");
            window.location.href = "/partner-login";
          }
        }
      } catch (err) {
        setError("Lỗi kết nối máy chủ");
      } finally {
        setLoading(false);
      }
    };

    fetchHospitalInfo();
  }, [token]);

  const handleLogout = () => {
    localStorage.removeItem("userToken");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("maBenhVien");
    localStorage.removeItem("partnerToken");
    window.location.href = "/partner-login";
  };

  if (loading) {
    return (
      <HospitalLayout>
        <div className="flex justify-center items-center min-h-[60vh]">
          <p className="text-gray-500 font-medium">Đang tải thông tin...</p>
        </div>
      </HospitalLayout>
    );
  }

  if (error) {
    return (
      <HospitalLayout>
        <div className="flex justify-center items-center min-h-[60vh]">
          <p className="text-red-500 font-medium">{error}</p>
        </div>
      </HospitalLayout>
    );
  }

  return (
    <HospitalLayout>
      <div className="max-w-6xl mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Dashboard Bệnh viện</h1>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition shadow-sm text-sm font-semibold"
          >
            <FontAwesomeIcon icon={faSignOutAlt} />
            Đăng xuất
          </button>
        </div>

        {/* Thông tin bệnh viện */}
        <div className="bg-white shadow rounded-lg p-6 mb-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <FontAwesomeIcon icon={faHospital} className="text-red-600 text-xl" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">{hospitalInfo.TenBenhVien}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <FontAwesomeIcon icon={faUser} className="text-gray-500 w-5" />
              <span className="font-medium">Người đại diện:</span>
              <span>{hospitalInfo.NguoiDaiDien || hospitalInfo.TenNguoiLienHe}</span>
            </div>
            <div className="flex items-center gap-2">
              <FontAwesomeIcon icon={faEnvelope} className="text-gray-500 w-5" />
              <span className="font-medium">Email:</span>
              <span>{hospitalInfo.Email}</span>
            </div>
            <div className="flex items-center gap-2">
              <FontAwesomeIcon icon={faPhone} className="text-gray-500 w-5" />
              <span className="font-medium">SĐT:</span>
              <span>{hospitalInfo.SoDienThoaiBenhVien || hospitalInfo.SoDienThoaiLienHe}</span>
            </div>
            <div className="flex items-center gap-2">
              <FontAwesomeIcon icon={faCalendarAlt} className="text-gray-500 w-5" />
              <span className="font-medium">Ngày tham gia:</span>
              <span>{new Date(hospitalInfo.NgayThamGia || hospitalInfo.createdAt).toLocaleDateString("vi-VN")}</span>
            </div>
          </div>
          <div className="mt-3">
            <span className="inline-block px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full border border-green-300">
              {hospitalInfo.TrangThai === "hoat dong" || hospitalInfo.TrangThai === "Đang hoạt động" ? "Đang hoạt động" : "Tạm khóa"}
            </span>
          </div>
        </div>

        {/* Các chức năng nhanh - Lưới 6 thẻ (3 cột x 2 hàng) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* 1. Tin khẩn cấp */}
          <a
            href="/hospital/emergency"
            className="bg-white shadow rounded-lg p-6 border border-gray-200 hover:shadow-lg transition flex flex-col items-center text-center justify-between"
          >
            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mb-3">
              <FontAwesomeIcon icon={faBullhorn} className="text-red-600 text-xl" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">Tin khẩn cấp</h3>
              <p className="text-xs text-gray-500 mt-1">Đăng và quản lý tin</p>
            </div>
          </a>

          {/* 2. Tìm người hiến */}
          <a
            href="/hospital/search-donor"
            className="bg-white shadow rounded-lg p-6 border border-gray-200 hover:shadow-lg transition flex flex-col items-center text-center justify-between"
          >
            <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mb-3">
              <FontAwesomeIcon icon={faSearch} className="text-blue-600 text-xl" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">Tìm người hiến</h3>
              <p className="text-xs text-gray-500 mt-1">Tìm người hiến máu phù hợp</p>
            </div>
          </a>

          {/* 3. Danh sách đơn đăng ký (MỚI THÊM) */}
          <a
            href="/hospital/orders"
            className="bg-white shadow rounded-lg p-6 border border-gray-200 hover:shadow-lg transition flex flex-col items-center text-center justify-between"
          >
            <div className="w-14 h-14 bg-purple-100 rounded-full flex items-center justify-center mb-3">
              <FontAwesomeIcon icon={faClipboardList} className="text-purple-600 text-xl" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">Danh sách đơn đăng ký</h3>
              <p className="text-xs text-gray-500 mt-1">Xem và quản lý đơn đăng ký</p>
            </div>
          </a>

          {/* 4. Kho máu (MÀU TRẮNG ĐỒNG BỘ) */}
          <a
            href="/hospital/inventory"
            className="bg-white shadow rounded-lg p-6 border border-gray-200 hover:shadow-lg transition flex flex-col items-center text-center justify-between"
          >
            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mb-3">
              <FontAwesomeIcon icon={faTint} className="text-red-600 text-xl" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">Kho máu</h3>
              <p className="text-xs text-gray-500 mt-1">Danh sách máu trong kho</p>
            </div>
          </a>

          {/* 5. LỊCH SỬ NHẬP XUẤT MÁU (BM22 - UC31) */}
          <a
            href="/hospital-history"
            className="bg-white shadow rounded-lg p-6 border border-gray-200 hover:shadow-lg transition flex flex-col items-center text-center justify-between"
          >
            <div className="w-14 h-14 bg-teal-100 rounded-full flex items-center justify-center mb-3">
              <FontAwesomeIcon icon={faHistory} className="text-teal-600 text-xl" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">Lịch sử nhập xuất máu</h3>
              <p className="text-xs text-gray-500 mt-1">Tra cứu chi tiết lịch sử</p>
            </div>
          </a>

          {/* 5. Thông báo */}
          <a
            href="/hospital/notifications"
            className="bg-white shadow rounded-lg p-6 border border-gray-200 hover:shadow-lg transition flex flex-col items-center text-center justify-between"
          >
            <div className="w-14 h-14 bg-yellow-100 rounded-full flex items-center justify-center mb-3">
              <FontAwesomeIcon icon={faBell} className="text-yellow-600 text-xl" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">Thông báo</h3>
              <p className="text-xs text-gray-500 mt-1">Gửi và xem thông báo</p>
            </div>
          </a>
        </div>
      </div>
    </HospitalLayout>
  );
};

export default HospitalDashboard;