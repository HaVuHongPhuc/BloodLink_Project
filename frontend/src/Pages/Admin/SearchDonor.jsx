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
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const parseDMY = (value) => {
    if (!value) return null;
    const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value.trim());
    if (!match) return null;
    const day = Number(match[1]);
    const month = Number(match[2]);
    const year = Number(match[3]);
    const date = new Date(year, month - 1, day);
    if (
      Number.isNaN(date.getTime()) ||
      date.getFullYear() !== year ||
      date.getMonth() !== month - 1 ||
      date.getDate() !== day
    ) {
      return null;
    }
    return date;
  };

  const token = localStorage.getItem("userToken");

  const fetchAllDonors = async (searchKeyword = keyword, fromDate = startDate, toDate = endDate) => {
    try {
      const parsedStart = fromDate ? parseDMY(fromDate) : null;
      const parsedEnd = toDate ? parseDMY(toDate) : null;

      if ((fromDate && !parsedStart) || (toDate && !parsedEnd)) {
        setResults([]);
        setAllData([]);
        setMessage("Vui lòng nhập ngày theo định dạng dd/mm/yyyy");
        return;
      }

      if (parsedStart && parsedEnd && parsedStart > parsedEnd) {
        setResults([]);
        setAllData([]);
        setMessage("Ngày bắt đầu không được lớn hơn ngày kết thúc");
        return;
      }

      setLoading(true);
      setMessage("");
      const params = new URLSearchParams();
      if (searchKeyword.trim()) params.append("keyword", searchKeyword.trim());
      if (fromDate.trim()) params.append("startDate", fromDate.trim());
      if (toDate.trim()) params.append("endDate", toDate.trim());

      const res = await fetch(`http://localhost:5000/api/admin/tra-cuu-nguoi-hien?${params.toString()}`, {
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
    fetchAllDonors(keyword, startDate, endDate);
  };

  return (
    <div className="w-full max-w-full rounded-xl border border-gray-200 bg-white p-3 shadow-sm sm:p-4">
      <h2 className="mb-3 text-lg font-semibold text-gray-800 sm:mb-4 sm:text-xl">Tra cứu người hiến máu</h2>

      <div className="mb-3 grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-4 sm:mb-4">
        <input
          type="text"
          placeholder="Tìm theo tên, email, SĐT..."
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 sm:px-4 sm:py-2.5"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        />
        <input
          type="text"
          placeholder="Từ ngày (dd/mm/yyyy)"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 sm:px-4 sm:py-2.5"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
        <input
          type="text"
          placeholder="Đến ngày (dd/mm/yyyy)"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 sm:px-4 sm:py-2.5"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
        <button
          onClick={handleSearch}
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700 disabled:opacity-50 sm:w-auto"
        >
          <FontAwesomeIcon icon={loading ? faSync : faSearch} className={loading ? "animate-spin" : ""} />
          Tìm kiếm
        </button>
      </div>

      {message && (
        <div className="mb-4 rounded border border-yellow-200 bg-yellow-50 px-3 py-2 text-sm text-yellow-700 sm:px-4">
          {message}
        </div>
      )}

      {loading && <p className="text-sm text-gray-500">Đang tải...</p>}

      {!loading && results.length > 0 && (
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="min-w-[760px] w-full border-collapse text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 text-left">STT</th>
                <th className="p-2 text-left">Mã đơn</th>
                <th className="p-2 text-left">Họ tên</th>
                <th className="p-2 text-left">Nhóm máu</th>
                <th className="p-2 text-left">SĐT</th>
                <th className="p-2 text-left">Email</th>
                <th className="p-2 text-left">Ngày đăng ký</th>
                <th className="p-2 text-left">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {results.map((item, index) => (
                <tr key={item._id || item.MaDon || index} className="border-b hover:bg-gray-50">
                  <td className="p-2">{index + 1}</td>
                  <td className="p-2">{item.MaDon || "---"}</td>
                  <td className="p-2">{item.HoTen}</td>
                  <td className="p-2">
                    <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-bold">
                      {item.NhomMau || "---"}
                    </span>
                  </td>
                  <td className="p-2">{item.SoDienThoai}</td>
                  <td className="p-2">{item.Email || "---"}</td>
                  <td className="p-2">{item.createdAt ? new Date(item.createdAt).toLocaleDateString("vi-VN") : "---"}</td>
                  <td className="p-2">
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold ${
                        item.TrangThai === "Hoan_Thanh"
                          ? "bg-green-100 text-green-700"
                          : item.TrangThai === "Tu_Choi" || item.TrangThai === "Da_Huy"
                          ? "bg-gray-100 text-gray-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {item.TrangThai || "Cho_Duyet"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-2 text-xs text-gray-400">Hiển thị {results.length} kết quả</p>
        </div>
      )}
    </div>
  );
};

export default SearchDonor;