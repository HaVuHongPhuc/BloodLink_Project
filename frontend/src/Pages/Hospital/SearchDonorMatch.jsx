import { useState, useEffect } from "react";
import HospitalLayout from "./HospitalLayout";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faPaperPlane, faTimes } from "@fortawesome/free-solid-svg-icons";

const SearchDonorMatch = () => {
  const [filters, setFilters] = useState({
    bloodType: "",
    location: "",
  });
  const [results, setResults] = useState([]);
  const [allData, setAllData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [searched, setSearched] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);
  const [sendData, setSendData] = useState({ maTaiKhoan: "", noiDung: "" });
  const [sendMessage, setSendMessage] = useState("");

  const token = localStorage.getItem("userToken");

  const fetchAllDonors = async () => {
    try {
      setLoading(true);
      setMessage("");
      const response = await fetch("http://localhost:5000/api/users/tim-nguoi-hien-phu-hop", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (response.ok) {
        setAllData(data);
        setResults(data);
        if (data.length === 0) {
          setMessage("MS10: Không tìm thấy kết quả phù hợp");
        }
      } else {
        setAllData([]);
        setResults([]);
        setMessage(data.message || "MS09: Không đủ dữ liệu để tìm kiếm");
      }
    } catch (error) {
      setMessage("Lỗi kết nối server");
    } finally {
      setLoading(false);
      setSearched(true);
    }
  };

  useEffect(() => {
    fetchAllDonors();
  }, []);

  const handleSearch = () => {
    let filtered = allData;
    if (filters.bloodType) {
      filtered = filtered.filter(d => d.NhomMau === filters.bloodType);
    }
    if (filters.location) {
      filtered = filtered.filter(d => 
        (d.DiaChi || "").toLowerCase().includes(filters.location.toLowerCase())
      );
    }
    setResults(filtered);
    setSearched(true);
    if (filtered.length === 0) {
      setMessage("MS10: Không tìm thấy kết quả phù hợp");
    } else {
      setMessage("");
    }
  };

  useEffect(() => {
    if (allData.length > 0) {
      handleSearch();
    }
  }, [filters]);

  const handleSendNotification = async (e) => {
    e.preventDefault();
    setSendMessage("");
    if (!sendData.noiDung.trim()) {
      setSendMessage("MS40: Vui lòng điền nội dung thông báo");
      return;
    }
    const maBenhVien = localStorage.getItem("maBenhVien") || "";
    const tenBenhVien = localStorage.getItem("hospitalName") || "Bệnh viện";
    try {
      const response = await fetch("http://localhost:5000/api/thong-bao/gui", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          maTaiKhoan: sendData.maTaiKhoan,
          noiDung: sendData.noiDung.trim(),
          maBenhVien,
          tenBenhVien,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        setSendMessage("✅ Gửi thông báo thành công!");
        setTimeout(() => {
          setShowSendModal(false);
          setSendData({ maTaiKhoan: "", noiDung: "" });
          setSendMessage("");
        }, 1500);
      } else {
        setSendMessage(data.message || "Gửi thông báo thất bại");
      }
    } catch (error) {
      setSendMessage("Lỗi kết nối máy chủ");
    }
  };

  const openSendModal = (maTaiKhoan) => {
    setSendData({ maTaiKhoan, noiDung: "" });
    setSendMessage("");
    setShowSendModal(true);
  };

  return (
    <HospitalLayout>
      <div className="max-w-5xl mx-auto py-8 px-4">
        <h1 className="text-2xl font-bold mb-6">Tìm kiếm người hiến máu phù hợp</h1>
        <p className="text-sm text-gray-500 mb-4">BM04: Danh sách người hiến máu</p>

        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nhóm máu</label>
              <select
                value={filters.bloodType}
                onChange={(e) => setFilters({ ...filters, bloodType: e.target.value })}
                className="w-full border border-gray-300 rounded px-3 py-2"
              >
                <option value="">Tất cả</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Địa chỉ</label>
              <input
                type="text"
                placeholder="Nhập địa chỉ..."
                value={filters.location}
                onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                className="w-full border border-gray-300 rounded px-3 py-2"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={handleSearch}
                disabled={loading}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 rounded disabled:opacity-50"
              >
                {loading ? "Đang tải..." : "Lọc"}
              </button>
            </div>
          </div>
        </div>

        {message && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded mb-4">
            {message}
          </div>
        )}

        {searched && results.length > 0 && (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-3 text-left">STT</th>
                  <th className="p-3 text-left">Mã TK</th>
                  <th className="p-3 text-left">Họ tên</th>
                  <th className="p-3 text-left">Nhóm máu</th>
                  <th className="p-3 text-left">SĐT</th>
                  <th className="p-3 text-left">Địa chỉ</th>
                  <th className="p-3 text-left">Trạng thái</th>
                  <th className="p-3 text-left">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {results.map((d, index) => (
                  <tr key={d.MaTaiKhoan} className="border-b hover:bg-gray-50">
                    <td className="p-3">{index + 1}</td>
                    <td className="p-3 font-mono text-xs">{d.MaTaiKhoan}</td>
                    <td className="p-3 font-medium">{d.HoTen}</td>
                    <td className="p-3">
                      <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-sm font-bold">
                        {d.NhomMau}
                      </span>
                    </td>
                    <td className="p-3">{d.SoDienThoai}</td>
                    <td className="p-3">{d.DiaChi}</td>
                    <td className="p-3">
                      <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-sm">
                        Sẵn sàng
                      </span>
                    </td>
                    <td className="p-3">
                      <button
                        onClick={() => openSendModal(d.MaTaiKhoan)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm flex items-center gap-1"
                      >
                        <FontAwesomeIcon icon={faPaperPlane} /> Gửi TB
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="text-gray-400 text-xs p-2">Hiển thị {results.length} kết quả</p>
          </div>
        )}
      </div>

      {/* MODAL GỬI THÔNG BÁO */}
      {showSendModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-lg p-6 shadow-2xl">
            <div className="flex justify-between items-center border-b pb-3 mb-4">
              <h3 className="text-xl font-bold">BM13: Gửi thông báo</h3>
              <button onClick={() => setShowSendModal(false)} className="text-gray-400 hover:text-gray-600">
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            <form onSubmit={handleSendNotification}>
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">Mã tài khoản</label>
                <input type="text" value={sendData.maTaiKhoan} disabled className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100" />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Nội dung</label>
                <textarea
                  rows="4"
                  value={sendData.noiDung}
                  onChange={(e) => setSendData({ ...sendData, noiDung: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-red-500"
                  placeholder="Nhập nội dung thông báo..."
                />
              </div>
              {sendMessage && (
                <div className={`p-2 rounded mb-3 ${sendMessage.includes("✅") ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                  {sendMessage}
                </div>
              )}
              <div className="flex justify-end gap-3 pt-3 border-t">
                <button type="button" onClick={() => setShowSendModal(false)} className="px-4 py-2 border rounded hover:bg-gray-50">Hủy</button>
                <button type="submit" className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded font-bold">Gửi</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </HospitalLayout>
  );
};

export default SearchDonorMatch;