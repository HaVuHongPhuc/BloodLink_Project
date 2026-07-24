import { useState, useEffect } from 'react';
import Layout from '../Layout';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faHospital, faExclamationTriangle, faCheckCircle } from '@fortawesome/free-solid-svg-icons';

const mockHospitalsFromSystem = [
  { maBV: "BVCR", tenBV: "Bệnh viện Chợ Rẫy", diaChi: "201B Nguyễn Chí Thanh, Q.5, TP.HCM", nguoiLienHe: "Nguyễn Văn A", sdt: "028 3855 4137", email: "choray@bloodlink.vn", trangThai: "Đang hoạt động" },
  { maBV: "BVTMHH", tenBV: "Bệnh viện Truyền máu Huyết học", diaChi: "118 Hồng Bàng, Q.5, TP.HCM", nguoiLienHe: "Trần Thị B", sdt: "028 3957 1342", email: "truyenmau@bloodlink.vn", trangThai: "Đang hoạt động" },
  { maBV: "BVYDUOC", tenBV: "Bệnh viện Đại học Y Dược", diaChi: "215 Hồng Bàng, Q.5, TP.HCM", nguoiLienHe: "Phạm Minh C", sdt: "028 3855 4269", email: "yduoc@bloodlink.vn", trangThai: "Đang hoạt động" },
  { maBV: "BVTDU", tenBV: "Bệnh viện Từ Dũ", diaChi: "284 Cống Quỳnh, Q.1, TP.HCM", nguoiLienHe: "Lê Hoàng D", sdt: "028 5404 2829", email: "tudu@bloodlink.vn", trangThai: "Ngừng hoạt động" }
];

const HospitalList = () => {

  // --- STATES QUẢN LÝ ---
  const [activeHospitals, setActiveHospitals] = useState([]);
  const [filteredHospitals, setFilteredHospitals] = useState([]);
  const [systemMessage, setSystemMessage] = useState({ type: "", text: "" });
  const [inputSearch, setInputSearch] = useState("");

  // =========================================================
  // EFFECT: TỰ ĐỘNG ẨN THÔNG BÁO SAU 2 GIÂY
  // =========================================================
  useEffect(() => {
    if (systemMessage.text) {
      const timer = setTimeout(() => {
        setSystemMessage({ type: "", text: "" });
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [systemMessage]);

  // =========================================================
  // LOAD DANH SÁCH BAN ĐẦU THEO BR14
  // =========================================================
  useEffect(() => {
    setSystemMessage({ type: "", text: "" });

    if (!mockHospitalsFromSystem || mockHospitalsFromSystem.length === 0) {
      setSystemMessage({ type: "error", text: "Không tìm thấy bệnh viện" });
      return;
    }

    const operatingHospitals = mockHospitalsFromSystem.filter(h => h.trangThai === "Đang hoạt động");

    if (operatingHospitals.length === 0) {
      setSystemMessage({ type: "error", text: "Không tìm thấy bệnh viện" });
      setActiveHospitals([]);
      setFilteredHospitals([]);
      return;
    }

    setActiveHospitals(operatingHospitals);
    setFilteredHospitals(operatingHospitals);
  }, []);

  // =========================================================
  // XỬ LÝ USECASE UC11: TRA CỨU BỆNH VIỆN
  // =========================================================
  const handleExecuteSearch = (e) => {
    e.preventDefault();
    setSystemMessage({ type: "", text: "" });

    const keyword = inputSearch.trim().toLowerCase();

    if (!keyword) {
      setFilteredHospitals(activeHospitals);
      return;
    }

    const results = activeHospitals.filter(h => 
      h.tenBV.toLowerCase().includes(keyword) || 
      h.diaChi.toLowerCase().includes(keyword)
    );

    if (results.length === 0) {
      setSystemMessage({ type: "error", text: "Không tìm thấy bệnh viện" });
      setFilteredHospitals([]);
    } else {
      setFilteredHospitals(results);
    }
  };

  const handleResetSearch = () => {
    setInputSearch("");
    setFilteredHospitals(activeHospitals);
    setSystemMessage({ type: "", text: "" });
  };

  return (
    <Layout>
      <div className="w-full">
        <div className="flex items-center gap-[12px] mb-[28px]">
          <FontAwesomeIcon icon={faHospital} className="text-gray-950 text-[28px]" />
          <h1 className="text-3xl font-bold text-gray-900 uppercase tracking-tight">Danh Sách Bệnh Viện Hợp Tác</h1>
        </div>

        {/* Khối hiển thị thông báo */}
        {systemMessage.text && (
          <div className="p-[14px] rounded-[8px] flex items-center gap-[10px] mb-[20px] bg-red-50 text-red-700 border border-red-200 text-[14px]">
            <FontAwesomeIcon icon={faExclamationTriangle} className="flex-shrink-0" />
            <p className="font-semibold">{systemMessage.text}</p>
          </div>
        )}

        <div className="bg-white p-[16px] rounded-[8px] shadow-sm border border-gray-200 mb-[20px] flex items-center justify-start gap-[12px]">
          <form onSubmit={handleExecuteSearch} className="flex items-center gap-[8px] w-full sm:max-w-[450px]">
            <div className="relative w-full">
              <span className="absolute inset-y-0 left-0 flex items-center pl-[12px] text-gray-400">
                <FontAwesomeIcon icon={faSearch} />
              </span>
              <input 
                type="text"
                placeholder="Nhập tên bệnh viện hoặc địa chỉ cần tra cứu..."
                value={inputSearch}
                onChange={(e) => setInputSearch(e.target.value)}
                className="w-full border border-gray-300 rounded-[6px] py-[8px] pl-[36px] pr-[12px] text-[14px] text-gray-950 focus:outline-none focus:border-black"
              />
            </div>
            <button type="submit" className="px-[20px] py-[8px] bg-gray-950 text-white font-bold rounded-[6px] text-[14px] hover:bg-gray-800 transition shadow-sm uppercase tracking-wide">Tra cứu</button>
          </form>
          {inputSearch && (
            <button type="button" onClick={handleResetSearch} className="text-[13px] font-medium text-gray-500 hover:text-gray-900 underline">Xem tất cả</button>
          )}
        </div>

        <div className="w-full bg-white rounded-[8px] border border-gray-300 shadow-sm overflow-x-auto">
          <table className="w-full table-auto text-left border-collapse text-[14px]">
            <thead>
              <tr className="bg-gray-100 text-gray-800 uppercase font-bold text-[13px] border-b border-gray-300">
                <th className="px-[16px] py-[14px] border-r border-gray-300 text-center w-[60px]">STT</th>
                <th className="px-[16px] py-[14px] border-r border-gray-300">Tên bệnh viện</th>
                <th className="px-[16px] py-[14px] border-r border-gray-300">Địa chỉ bệnh viện</th>
                <th className="px-[16px] py-[14px] border-r border-gray-300">Tên người liên hệ</th>
                <th className="px-[16px] py-[14px] border-r border-gray-300">Số điện thoại liên hệ</th>
                <th className="px-[16px] py-[14px] border-r border-gray-300">Email</th>
                <th className="px-[16px] py-[14px] text-center">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-gray-700">
              {filteredHospitals.map((row, index) => (
                <tr key={row.maBV} className="hover:bg-gray-50 transition-colors">
                  <td className="px-[16px] py-[14px] border-r border-gray-200 text-center font-medium">{index + 1}</td>
                  <td className="px-[16px] py-[14px] border-r border-gray-200 font-semibold text-red-600">{row.tenBV}</td>
                  <td className="px-[16px] py-[14px] border-r border-gray-200 max-w-[320px] truncate" title={row.diaChi}>{row.diaChi}</td>
                  <td className="px-[16px] py-[14px] border-r border-gray-200">{row.nguoiLienHe}</td>
                  <td className="px-[16px] py-[14px] border-r border-gray-200 font-medium text-gray-900">{row.sdt}</td>
                  <td className="px-[16px] py-[14px] border-r border-gray-200">{row.email}</td>
                  <td className="px-[16px] py-[14px] text-center">
                    <span className="inline-flex items-center gap-[4px] font-bold px-[10px] py-[3px] rounded text-[12px] bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <FontAwesomeIcon icon={faCheckCircle} className="text-[11px]" />
                      {row.trangThai}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
};

export default HospitalList;