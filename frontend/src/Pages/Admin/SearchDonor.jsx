import { useState } from "react";

const SearchDonor = () => {
  const [keyword, setKeyword] = useState("");
  const [results, setResults] = useState([]);
  const [searched, setSearched] = useState(false);

  const handleSearch = () => {
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    const donors = users.filter(
      (u) => u.role === "customer" && u.donateRegisterDate
    );
    const filtered = donors.filter(
      (d) =>
        (d.fullName || "").toLowerCase().includes(keyword.toLowerCase()) ||
        (d.bloodType || "").toLowerCase().includes(keyword.toLowerCase()) ||
        (d.phone || "").includes(keyword)
    );
    setResults(filtered);
    setSearched(true);
  };

  if (!searched && results.length === 0) {
    return (
      <div>
        <div className="flex gap-4 mb-6">
          <input
            type="text"
            placeholder="Tìm theo tên, nhóm máu, SĐT..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
          />
          <button
            onClick={handleSearch}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg"
          >
            Tìm kiếm
          </button>
        </div>
        <p className="text-gray-500">Nhập từ khóa để tìm kiếm người hiến máu</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex gap-4 mb-6">
        <input
          type="text"
          placeholder="Tìm theo tên, nhóm máu, SĐT..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
        />
        <button
          onClick={handleSearch}
          className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg"
        >
          Tìm kiếm
        </button>
      </div>
      {results.length === 0 ? (
        <p className="text-red-500">MS10: Không tìm thấy kết quả phù hợp</p>
      ) : (
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 text-left">STT</th>
              <th className="p-2 text-left">Họ tên</th>
              <th className="p-2 text-left">Nhóm máu</th>
              <th className="p-2 text-left">SĐT</th>
              <th className="p-2 text-left">Ngày đăng ký hiến</th>
              <th className="p-2 text-left">Lượt hiến</th>
              <th className="p-2 text-left">Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {results.map((d, index) => (
              <tr key={d.email} className="border-b">
                <td className="p-2">{index + 1}</td>
                <td className="p-2">{d.fullName || "---"}</td>
                <td className="p-2">{d.bloodType || "---"}</td>
                <td className="p-2">{d.phone || "---"}</td>
                <td className="p-2">{d.donateRegisterDate || "---"}</td>
                <td className="p-2">{d.donateCount || 0}</td>
                <td className="p-2">
                  {d.donateCount > 0 ? "Đã hiến" : "Sẵn sàng"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default SearchDonor;