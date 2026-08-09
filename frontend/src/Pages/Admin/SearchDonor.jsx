// frontend/src/pages/Admin/SearchDonor.jsx
import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faSync } from "@fortawesome/free-solid-svg-icons";

const SearchDonor = () => {
  const [keyword, setKeyword] = useState("");
  const [results, setResults] = useState([]);
  const [allData, setAllData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const token = localStorage.getItem("userToken");

  const fetchAllDonors = async () => {
    try {
      setLoading(true);
      setMessage("");
      const res = await fetch(`http://localhost:5000/api/admin/tra-cuu-nguoi-hien`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setAllData(data);
        setResults(data);
        if (data.length === 0) {
          setMessage("Không tìm thấy kết quả phù hợp");
        }
      } else {
        setAllData([]);
        setResults([]);
        setMessage(data.message || "Lỗi tra cứu");
      }
    } catch (error) {
      setMessage("Lỗi kết nối server");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllDonors();
  }, []);

  const handleSearch = () => {
    if (!keyword.trim()) {
      setResults(allData);
      setMessage(allData.length === 0 ? "Không tìm thấy kết quả phù hợp" : "");
      return;
    }
    const filtered = allData.filter(
      (d) =>
        (d.HoTen || "").toLowerCase().includes(keyword.toLowerCase()) ||
        (d.Email || "").toLowerCase().includes(keyword.toLowerCase()) ||
        (d.SoDienThoai || "").includes(keyword)
    );
    setResults(filtered);
    setMessage(filtered.length === 0 ? "Không tìm thấy kết quả phù hợp" : "");
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Tra cứu người hiến máu</h2>

      <div className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Tìm theo tên, email, SĐT..."
          className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        />
        <button
          onClick={handleSearch}
          disabled={loading}
          className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 flex items-center gap-2 disabled:opacity-50"
        >
          <FontAwesomeIcon icon={loading ? faSync : faSearch} className={loading ? "animate-spin" : ""} />
          Tìm kiếm
        </button>
      </div>

      {message && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-2 rounded mb-4">
          {message}
        </div>
      )}

      {loading && <p className="text-gray-500">Đang tải...</p>}

      {!loading && results.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 text-left">STT</th>
                <th className="p-2 text-left">Mã TK</th>
                <th className="p-2 text-left">Họ tên</th>
                <th className="p-2 text-left">Nhóm máu</th>
                <th className="p-2 text-left">SĐT</th>
                <th className="p-2 text-left">Ngày hiến gần nhất</th>
                <th className="p-2 text-left">Lượt hiến</th>
                <th className="p-2 text-left">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {results.map((item, index) => (
                <tr key={item.MaTaiKhoan} className="border-b hover:bg-gray-50">
                  <td className="p-2">{index + 1}</td>
                  <td className="p-2">{item.MaTaiKhoan}</td>
                  <td className="p-2">{item.HoTen}</td>
                  <td className="p-2">
                    <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-bold">
                      {item.NhomMau}
                    </span>
                  </td>
                  <td className="p-2">{item.SoDienThoai}</td>
                  <td className="p-2">
                    {item.NgayHienMauGanNhat
                      ? new Date(item.NgayHienMauGanNhat).toLocaleDateString()
                      : "---"}
                  </td>
                  <td className="p-2 text-center">{item.LuotHien}</td>
                  <td className="p-2">
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold ${
                        item.trangThai === "Sẵn sàng"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {item.trangThai || "Chưa sẵn sàng"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="text-gray-400 text-xs mt-2">Hiển thị {results.length} kết quả</p>
        </div>
      )}
    </div>
  );
};

export default SearchDonor;