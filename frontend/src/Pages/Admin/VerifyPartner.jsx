import { useState, useEffect } from "react";

const VerifyPartner = () => {
  const [pendingPartners, setPendingPartners] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadPendingPartners();
  }, []);

  const loadPendingPartners = () => {
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    const pending = users.filter(
      (u) => u.role === "hospital" && u.status === "pending"
    );
    setPendingPartners(pending);
  };

  const handleVerify = (email, action) => {
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    const updated = users.map((u) => {
      if (u.email === email && u.role === "hospital") {
        if (action === "approve") {
          u.status = "approved";
          setMessage(`MS03: Đã tạo tài khoản cho ${u.hospitalName}`);
        } else if (action === "reject") {
          u.status = "rejected";
          setMessage(`MS04: Đã từ chối yêu cầu của ${u.hospitalName}`);
        }
      }
      return u;
    });
    localStorage.setItem("users", JSON.stringify(updated));
    loadPendingPartners();
    setTimeout(() => setMessage(""), 3000);
  };

  if (pendingPartners.length === 0) {
    return <p className="text-gray-500">Không có yêu cầu xác thực nào đang chờ.</p>;
  }

  return (
    <div>
      {message && (
        <div className="mb-4 p-3 bg-blue-100 text-blue-700 rounded">{message}</div>
      )}
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 text-left">STT</th>
            <th className="p-2 text-left">Tên bệnh viện</th>
            <th className="p-2 text-left">Người đại diện</th>
            <th className="p-2 text-left">Email</th>
            <th className="p-2 text-left">Ngày đăng ký</th>
            <th className="p-2 text-left">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {pendingPartners.map((partner, index) => (
            <tr key={partner.email} className="border-b">
              <td className="p-2">{index + 1}</td>
              <td className="p-2">{partner.hospitalName}</td>
              <td className="p-2">{partner.representative || "---"}</td>
              <td className="p-2">{partner.email}</td>
              <td className="p-2">{new Date(partner.createdAt).toLocaleDateString()}</td>
              <td className="p-2">
                <button
                  onClick={() => handleVerify(partner.email, "approve")}
                  className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded mr-2 text-sm"
                >
                  Duyệt
                </button>
                <button
                  onClick={() => handleVerify(partner.email, "reject")}
                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
                >
                  Từ chối
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default VerifyPartner;