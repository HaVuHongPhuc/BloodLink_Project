import { useState, useEffect } from "react";
import Layout from "../Layout";
import VerifyPartner from "./VerifyPartner";
import SearchDonor from "./SearchDonor";
import SearchRecipient from "./SearchRecipient";
import ManageHospitals from "./ManageHospitals"; 

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("verify");
  const [user, setUser] = useState(null);

  useEffect(() => {
    const email = localStorage.getItem("userEmail");
    const role = localStorage.getItem("userRole");
    if (role !== "admin") {
      window.location.href = "/homepage";
      return;
    }
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    const found = users.find((u) => u.email === email);
    setUser(found);
  }, []);

  if (!user) return <Layout><div>Loading...</div></Layout>;

  return (
    <Layout>
      <div className="min-h-[80vh] py-[40px] px-[16px]">
        <div className="max-w-[1300px] mx-auto"> 
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Quản trị hệ thống</h1>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex flex-wrap border-b border-gray-200 mb-6 gap-2">
              <button
                className={`py-3 px-6 font-medium text-sm ${
                  activeTab === "verify"
                    ? "border-b-2 border-red-600 text-red-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => setActiveTab("verify")}
              >
                Xác thực đối tác (BM02)
              </button>
              
              <button
                className={`py-3 px-6 font-medium text-sm ${
                  activeTab === "manageHospitals"
                    ? "border-b-2 border-red-600 text-red-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => setActiveTab("manageHospitals")}
              >
                Quản lý tài khoản BV (UC13)
              </button>

              <button
                className={`py-3 px-6 font-medium text-sm ${
                  activeTab === "searchDonor"
                    ? "border-b-2 border-red-600 text-red-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => setActiveTab("searchDonor")}
              >
                Tra cứu người hiến (BM12)
              </button>
              <button
                className={`py-3 px-6 font-medium text-sm ${
                  activeTab === "searchRecipient"
                    ? "border-b-2 border-red-600 text-red-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => setActiveTab("searchRecipient")}
              >
                Tra cứu người nhận (BM12)
              </button>
            </div>
            
            {/* Render các view tương ứng với Tab */}
            {activeTab === "verify" && <VerifyPartner />}
            {activeTab === "manageHospitals" && <ManageHospitals />} 
            {activeTab === "searchDonor" && <SearchDonor />}
            {activeTab === "searchRecipient" && <SearchRecipient />}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AdminDashboard;