// frontend/src/pages/Publics/HospitalList.jsx
import { useState, useEffect } from "react";
import Layout from "../Layout";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faHospital, faPhone, faEnvelope, faMapMarkerAlt, faUser } from "@fortawesome/free-solid-svg-icons";

const HospitalList = () => {
  const [hospitals, setHospitals] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchHospitals();
  }, []);

  const fetchHospitals = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/hospitals");
      if (!res.ok) {
        throw new Error('Không thể tải danh sách bệnh viện');
      }
      const data = await res.json();
      
      // ✅ CHỈ lọc 2 trạng thái hợp tác đúng
      const activeHospitals = data.filter(
        (h) => h.TrangThai === "dang hop tac" || h.TrangThai === "Đang hợp tác"
      );
      
      setHospitals(activeHospitals);
      setFiltered(activeHospitals);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setError('Không thể tải danh sách bệnh viện');
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    const keyword = e.target.value.toLowerCase();
    setSearchTerm(keyword);
    if (!keyword.trim()) {
      setFiltered(hospitals);
      return;
    }
    const result = hospitals.filter(
      (h) =>
        (h.TenBenhVien || "").toLowerCase().includes(keyword) ||
        (h.DiaChiBenhVien || "").toLowerCase().includes(keyword) ||
        (h.Email || "").toLowerCase().includes(keyword)
    );
    setFiltered(result);
  };

  return (
    <Layout>
      <div className="mx-auto max-w-6xl px-3 py-4 sm:px-4 sm:py-6 lg:px-6 lg:py-8">
        <h1 className="mb-4 flex items-center gap-3 text-2xl font-bold text-gray-800 sm:mb-6 sm:text-3xl">
          <FontAwesomeIcon icon={faHospital} className="text-red-600" />
          Danh sách bệnh viện hợp tác
        </h1>

        <div className="mb-6">
          <div className="relative w-full max-w-xl">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FontAwesomeIcon icon={faSearch} className="text-gray-400" />
            </div>
            <input
              type="text"
              maxLength={255}
              placeholder="Tìm theo tên, địa chỉ, email..."
              value={searchTerm}
              onChange={handleSearch}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
        </div>

        {loading && <p className="text-gray-500">Đang tải danh sách...</p>}
        {error && <p className="text-red-500">{error}</p>}

        {!loading && !error && filtered.length === 0 && (
          <p className="text-gray-500">Không tìm thấy bệnh viện nào</p>
        )}

        {!loading && filtered.length > 0 && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((hospital) => (
              <div
                key={hospital.MaBenhVien}
                className="bg-white rounded-lg shadow-md border border-gray-200 p-5 hover:shadow-lg transition"
              >
                <div className="flex items-start justify-between">
                  <h3 className="text-lg font-bold text-gray-800">{hospital.TenBenhVien}</h3>
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                    {hospital.TrangThai === "dang hop tac" || hospital.TrangThai === "Đang hợp tác" 
                      ? "Đang hợp tác" 
                      : "Ngừng hợp tác"}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
                  <FontAwesomeIcon icon={faMapMarkerAlt} className="text-gray-400" />
                  {hospital.DiaChiBenhVien}
                </p>
                <p className="text-sm text-gray-500 flex items-center gap-2">
                  <FontAwesomeIcon icon={faPhone} className="text-gray-400" />
                  {hospital.SoDienThoaiLienHe || "Chưa cập nhật"}
                </p>
                <p className="text-sm text-gray-500 flex items-center gap-2">
                  <FontAwesomeIcon icon={faEnvelope} className="text-gray-400" />
                  {hospital.Email}
                </p>
                <p className="text-sm text-gray-500 flex items-center gap-2">
                  <FontAwesomeIcon icon={faUser} className="text-gray-400" />
                  <span>Liên hệ: {hospital.TenNguoiLienHe}</span>
                </p>
                <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-400">
                  Mã BV: {hospital.MaBenhVien}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default HospitalList;