import { useState } from "react";

const SearchRecipient = () => {
  const [keyword, setKeyword] = useState("");
  const [results, setResults] = useState([]);
  const [searched, setSearched] = useState(false);

  const handleSearch = () => {
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    const recipients = users.filter(
      (u) => u.role === "customer" && u.receiveRegisterDate
    );
    const filtered = recipients.filter(
      (r) =>
        (r.fullName || "").toLowerCase().includes(keyword.toLowerCase()) ||
        (r.bloodType || "").toLowerCase().includes(keyword.toLowerCase()) ||
        (r.phone || "").includes(keyword)
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
        <p className="text-gray-500">Nhập từ khóa để tìm kiếm người nhận máu</p>
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
              <th className="p-2 text-left">Ngày đăng ký nhận</th>
              <th className="p-2 text-left">Lượt đăng ký</th>
            </tr>
          </thead>
          <tbody>
            {results.map((r, index) => (
              <tr key={r.email} className="border-b">
                <td className="p-2">{index + 1}</td>
                <td className="p-2">{r.fullName || "---"}</td>
                <td className="p-2">{r.bloodType || "---"}</td>
                <td className="p-2">{r.phone || "---"}</td>
                <td className="p-2">{r.receiveRegisterDate || "---"}</td>
                <td className="p-2">{r.receiveCount || 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default SearchRecipient;