import { useState, useEffect } from 'react';
import Layout from '../Layout';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faHospital, faExclamationTriangle, faCheckCircle } from '@fortawesome/free-solid-svg-icons';

const HospitalList = () => {
  // STATES QUẢN LÝ 
  const [activeHospitals, setActiveHospitals] = useState([]);
  const [filteredHospitals, setFilteredHospitals] = useState([]);
  const [systemMessage, setSystemMessage] = useState({ type: "", text: "" });
  const [inputSearch, setInputSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // TỰ ĐỘNG ẨN THÔNG BÁO SAU 2 GIÂY
  useEffect(() => {
    if (systemMessage.text) {
      const timer = setTimeout(() => {
        setSystemMessage({ type: "", text: "" });
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [systemMessage]);

  // TẢI DANH SÁCH BỆNH VIỆN TỪ MONGODB API
  useEffect(() => {
    const fetchHospitals = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/hospitals");
        if (response.ok) {
          const resData = await response.json();

          const rawList = Array.isArray(resData) 
            ? resData 
            : (resData.data || resData.hospitals || []);

          if (rawList.length > 0) {
            setActiveHospitals(rawList);
            setFilteredHospitals(rawList);
            setSystemMessage({ type: "", text: "" });
          } else {
            setSystemMessage({ type: "error", text: "Chưa có dữ liệu bệnh viện trong Database" });
            setActiveHospitals([]);
            setFilteredHospitals([]);
          }
        } else {
          setSystemMessage({ type: "error", text: "Không thể kết nối máy chủ Backend" });
        }
      } catch (error) {
        console.error("Lỗi khi kết nối API lấy danh sách bệnh viện:", error);
        setSystemMessage({ type: "error", text: "Không thể lấy dữ liệu từ máy chủ Backend" });
      } finally {
        setLoading(false);
      }
    };

    fetchHospitals();
  }, []);

  // XỬ LÝ USECASE UC11: TRA CỨU BỆNH VIỆN
  const handleExecuteSearch = (e) => {
    e.preventDefault();
    setSystemMessage({ type: "", text: "" });

    const keyword = inputSearch.trim().toLowerCase();

    if (!keyword) {
      setFilteredHospitals(activeHospitals);
      return;
    }

    const results = activeHospitals.filter((h) => {
      const maBV = String(h.MaBenhVien || h.maBV || "").toLowerCase();
      const tenBV = String(h.TenBenhVien || h.tenBV || "").toLowerCase();
      const diaChi = String(h.DiaChiBenhVien || h.diaChi || "").toLowerCase();

      return tenBV.includes(keyword) || diaChi.includes(keyword) || maBV.includes(keyword);
    });

    if (results.length === 0) {
      setSystemMessage({ type: "error", text: "Không tìm thấy bệnh viện phù hợp" });
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

  if (loading) {
    return (
      <Layout>
        <div className="text-center mt-10 text-gray-600 font-medium">Đang tải danh sách bệnh viện hợp tác từ Database...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="w-full">
        {/* Tiêu đề trang */}
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

        {/* Thanh tìm kiếm tra cứu */}
        <div className="bg-white p-[16px] rounded-[8px] shadow-sm border border-gray-200 mb-[20px] flex items-center justify-start gap-[12px]">
          <form onSubmit={handleExecuteSearch} className="flex flex-row items-center gap-[8px] w-full max-w-[550px]">
            <div className="relative flex-1">
              <span className="absolute inset-y-0 left-0 flex items-center pl-[12px] text-gray-400">
                <FontAwesomeIcon icon={faSearch} />
              </span>
              <input 
                type="text"
                placeholder="Nhập mã, tên bệnh viện hoặc địa chỉ cần tra cứu..."
                value={inputSearch}
                onChange={(e) => setInputSearch(e.target.value)}
                className="w-full border border-gray-300 rounded-[6px] py-[8px] pl-[36px] pr-[12px] text-[14px] text-gray-950 focus:outline-none focus:border-black"
              />
            </div>
    
            <button 
              type="submit" 
              className="whitespace-nowrap px-[20px] py-[8px] bg-gray-950 text-white font-bold rounded-[6px] text-[14px] hover:bg-gray-800 transition shadow-sm uppercase tracking-wide cursor-pointer"
            >
              Tra cứu
            </button>
          </form>
          {inputSearch && (
            <button type="button" onClick={handleResetSearch} className="text-[13px] font-medium text-gray-500 hover:text-gray-900 underline cursor-pointer">Xem tất cả</button>
          )}
        </div>

        {/* Bảng hiển thị danh sách bệnh viện */}
        <div className="w-full bg-white rounded-[8px] border border-gray-300 shadow-sm overflow-x-auto">
          <table className="w-full table-auto text-left border-collapse text-[14px]">
            <thead>
              <tr className="bg-gray-100 text-gray-800 uppercase font-bold text-[13px] border-b border-gray-300">
                <th className="px-[16px] py-[14px] border-r border-gray-300 text-center w-[60px]">STT</th>
                <th className="px-[16px] py-[14px] border-r border-gray-300">Mã bệnh viện</th>
                <th className="px-[16px] py-[14px] border-r border-gray-300">Tên bệnh viện</th>
                <th className="px-[16px] py-[14px] border-r border-gray-300">Địa chỉ bệnh viện</th>
                <th className="px-[16px] py-[14px] border-r border-gray-300">Tên người liên hệ</th>
                <th className="px-[16px] py-[14px] border-r border-gray-300">Số điện thoại liên hệ</th>
                <th className="px-[16px] py-[14px] border-r border-gray-300">Email</th>
                <th className="px-[16px] py-[14px] text-center">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-gray-700">
              {filteredHospitals.map((row, index) => {
                const maBV = row.MaBenhVien || row.maBV;
                const tenBV = row.TenBenhVien || row.tenBV;
                const diaChi = row.DiaChiBenhVien || row.diaChi;
                const nguoiLienHe = row.TenNguoiLienHe || row.nguoiLienHe;
                const sdt = row.SoDienThoaiLienHe || row.sdt;
                const email = row.Email || row.email;
                const trangThai = row.TrangThai || row.trangThai || "Đang hợp tác";

                return (
                  <tr key={row._id || maBV} className="hover:bg-gray-50 transition-colors">
                    <td className="px-[16px] py-[14px] border-r border-gray-200 text-center font-medium">{index + 1}</td>
                    <td className="px-[16px] py-[14px] border-r border-gray-200 font-bold text-gray-950">{maBV}</td>
                    <td className="px-[16px] py-[14px] border-r border-gray-200 font-semibold text-red-600">{tenBV}</td>
                    <td className="px-[16px] py-[14px] border-r border-gray-200 max-w-[320px] truncate" title={diaChi}>{diaChi}</td>
                    <td className="px-[16px] py-[14px] border-r border-gray-200">{nguoiLienHe}</td>
                    <td className="px-[16px] py-[14px] border-r border-gray-200 font-medium text-gray-900">{sdt}</td>
                    <td className="px-[16px] py-[14px] border-r border-gray-200">{email}</td>
                    <td className="px-[16px] py-[14px] text-center">
                      <span className="inline-flex items-center gap-[4px] font-bold px-[10px] py-[3px] rounded text-[12px] bg-emerald-50 text-emerald-700 border border-emerald-200 capitalize">
                        <FontAwesomeIcon icon={faCheckCircle} className="text-[11px]" />
                        {trangThai}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
};

export default HospitalList;