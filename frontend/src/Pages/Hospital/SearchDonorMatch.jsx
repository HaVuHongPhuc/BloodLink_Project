import { useState } from "react";
import Layout from "../Layout";

const SearchDonorMatch = () => {
  const [filters, setFilters] = useState({
    bloodType: "",
    location: "",
    minDonateCount: 0,
  });
  const [results, setResults] = useState([]);
  const [searched, setSearched] = useState(false);
  const [message, setMessage] = useState("");

  const handleSearch = () => {
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    let donors = users.filter(
      (u) =>
        u.role === "customer" &&
        u.donateRegisterDate &&
        (u.donateCount || 0) < 3
    );

    if (filters.bloodType) {
      donors = donors.filter((d) => d.bloodType === filters.bloodType);
    }
    if (filters.location) {
      donors = donors.filter((d) =>
        (d.address || "").toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    if (donors.length === 0) {
      setMessage("MS10: Không tìm thấy kết quả phù hợp");
      setResults([]);
    } else {
      setMessage("");
      setResults(donors);
    }
    setSearched(true);
  };

  return (
    <Layout>
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
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 rounded"
              >
                Tìm kiếm
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
                  <th className="p-3 text-left">Họ tên</th>
                  <th className="p-3 text-left">Nhóm máu</th>
                  <th className="p-3 text-left">Giới tính</th>
                  <th className="p-3 text-left">SĐT</th>
                  <th className="p-3 text-left">Địa chỉ</th>
                  <th className="p-3 text-left">Ngày hiến gần nhất</th>
                  <th className="p-3 text-left">Lượt hiến</th>
                  <th className="p-3 text-left">Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {results.map((d, index) => (
                  <tr key={d.email} className="border-b hover:bg-gray-50">
                    <td className="p-3">{index + 1}</td>
                    <td className="p-3">{d.fullName || "---"}</td>
                    <td className="p-3">
                      <span className="bg-red-100 text-red-700 px-2 py-1 rounded">
                        {d.bloodType || "---"}
                      </span>
                    </td>
                    <td className="p-3">{d.gender || "---"}</td>
                    <td className="p-3">{d.phone || "---"}</td>
                    <td className="p-3">{d.address || "---"}</td>
                    <td className="p-3">{d.lastDonateDate || "---"}</td>
                    <td className="p-3 text-center">{d.donateCount || 0}</td>
                    <td className="p-3">
                      <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-sm">
                        Sẵn sàng
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default SearchDonorMatch;