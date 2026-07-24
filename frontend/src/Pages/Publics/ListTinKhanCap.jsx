import { useState, useEffect } from 'react';
import Layout from '../Layout';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faFilter, faBullhorn, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';

const ListTinKhanCap = ({ emergencyList = [] }) => {
  // --- STATES QUẢN LÝ DỮ LIỆU HỆ THỐNG ---
  const [displayList, setDisplayList] = useState([]);
  const [systemMessage, setSystemMessage] = useState({ type: "", text: "" });

  // --- STATES INPUT TẠM THỜI ---
  const [inputSearch, setInputSearch] = useState("");
  const [inputBloodFilter, setInputBloodFilter] = useState("");

  // --- STATES ĐÃ KÍCH HOẠT THEO NÚT ---
  const [activeSearch, setActiveSearch] = useState("");
  const [activeBloodFilter, setActiveBloodFilter] = useState("");

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
  // XỬ LÝ SẮP XẾP DANH SÁCH THEO THỜI GIAN MỚI NHẤT
  // =========================================================
  useEffect(() => {
    setSystemMessage({ type: "", text: "" });

    if (!emergencyList || emergencyList.length === 0) {
      setSystemMessage({
        type: "error",
        text: "Không có tin khẩn cấp nào"
      });
      setDisplayList([]);
      return;
    }

    const sortedList = [...emergencyList].sort((a, b) => {
      const [dayA, monthA, yearA] = (a.ngayDang || "24/07/2026").split("/");
      const [dayB, monthB, yearB] = (b.ngayDang || "24/07/2026").split("/");
      
      const timeA = new Date(`${yearA}-${monthA}-${dayA}T${a.gioDang || "00:00"}`);
      const timeB = new Date(`${yearB}-${monthB}-${dayB}T${b.gioDang || "00:00"}`);
      
      return timeB - timeA;
    });

    setDisplayList(sortedList);
  }, [emergencyList]);

  // =========================================================
  // LOGIC LỌC DỮ LIỆU
  // =========================================================
  const filteredData = displayList.filter(item => {
    const matchesSearch = activeSearch 
      ? item.tenBV.toLowerCase().includes(activeSearch.toLowerCase()) || item.maTin.toLowerCase().includes(activeSearch.toLowerCase())
      : true;

    const matchesBlood = activeBloodFilter 
      ? item.nhomMau === activeBloodFilter 
      : true;

    return matchesSearch && matchesBlood;
  });

  // Kiểm tra lỗi hiển thị sau khi áp dụng bộ lọc
  useEffect(() => {
    if (displayList.length > 0) {
      if (activeSearch && filteredData.length === 0) {
        setSystemMessage({ type: "error", text: "Không tìm thấy tin khẩn cấp phù hợp" });
      } else if (activeBloodFilter && filteredData.length === 0) {
        setSystemMessage({ type: "error", text: "Không có dữ liệu phù hợp với điều kiện lọc nhóm máu này" });
      } else {
        setSystemMessage({ type: "", text: "" });
      }
    }
  }, [activeSearch, activeBloodFilter, displayList, filteredData.length]);

  const handleExecuteSearch = (e) => {
    e.preventDefault();
    setActiveSearch(inputSearch.trim());
  };

  const handleExecuteFilter = () => {
    setActiveBloodFilter(inputBloodFilter);
  };

  const handleResetControls = () => {
    setInputSearch("");
    setInputBloodFilter("");
    setActiveSearch("");
    setActiveBloodFilter("");
    setSystemMessage({ type: "", text: "" });
  };

  return (
    <Layout>
      <div className="w-full">
        {/* Tiêu đề trang */}
        <div className="flex items-center gap-[12px] mb-[28px]">
          <FontAwesomeIcon icon={faBullhorn} className="text-red-600 text-[28px]" />
          <h1 className="text-3xl font-bold text-gray-950 uppercase tracking-tight">Danh Sách Tin Khẩn Cấp</h1>
        </div>

        {/* Khối hiển thị thông báo tự biến mất */}
        {systemMessage.text && (
          <div className="p-[14px] rounded-[8px] flex items-center gap-[10px] mb-[20px] bg-red-50 text-red-700 border border-red-200 text-[14px] transition-all">
            <FontAwesomeIcon icon={faExclamationTriangle} className="flex-shrink-0" />
            <p className="font-semibold">{systemMessage.text}</p>
          </div>
        )}

        {/* Thanh công cụ Tìm kiếm & Bộ lọc */}
        <div className="bg-white p-[16px] rounded-[8px] shadow-sm border border-gray-200 mb-[20px] flex flex-col md:flex-row gap-[16px] justify-between items-center">
          <form onSubmit={handleExecuteSearch} className="flex items-center gap-[8px] w-full md:max-w-[400px]">
            <div className="relative w-full">
              <span className="absolute inset-y-0 left-0 flex items-center pl-[12px] text-gray-400">
                <FontAwesomeIcon icon={faSearch} />
              </span>
              <input 
                type="text"
                placeholder="Nhập Mã tin hoặc Tên bệnh viện..."
                value={inputSearch}
                onChange={(e) => setInputSearch(e.target.value)}
                className="w-full border border-gray-300 rounded-[6px] py-[8px] pl-[36px] pr-[12px] text-[14px] text-gray-950 focus:outline-none focus:border-red-600"
              />
            </div>
            <button type="submit" className="px-[16px] py-[8px] bg-gray-950 text-white rounded-[6px] text-[14px] font-medium hover:bg-gray-800 transition shadow-sm">Tìm</button>
          </form>

          <div className="flex items-center gap-[12px] w-full md:w-auto justify-end">
            <div className="flex items-center gap-[8px]">
              <span className="text-[14px] font-medium text-gray-600 whitespace-nowrap">
                <FontAwesomeIcon icon={faFilter} className="mr-[4px]" /> Nhóm máu:
              </span>
              {/* Ô SELECT ĐÃ CẬP NHẬT ĐẦY ĐỦ 8 NHÓM MÁU Y TẾ */}
              <select 
                value={inputBloodFilter}
                onChange={(e) => setInputBloodFilter(e.target.value)}
                className="border border-gray-300 rounded-[6px] py-[8px] px-[12px] text-[14px] text-gray-950 focus:outline-none focus:border-red-600 bg-white min-w-[130px]"
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
            <button onClick={handleExecuteFilter} className="px-[16px] py-[8px] bg-red-600 text-white rounded-[6px] text-[14px] font-bold hover:bg-red-700 transition shadow-sm">Lọc</button>
            {(activeSearch || activeBloodFilter) && (
              <button onClick={handleResetControls} className="px-[12px] py-[8px] text-gray-500 hover:text-gray-800 text-[13px] font-medium underline">Đặt lại</button>
            )}
          </div>
        </div>

        {/* Bảng hiển thị dữ liệu */}
        <div className="w-full bg-white rounded-[8px] border border-gray-300 shadow-sm overflow-x-auto">
          <table className="w-full table-auto text-left border-collapse text-[14px]">
            <thead>
              <tr className="bg-gray-100 text-gray-800 uppercase font-bold text-[13px] border-b border-gray-300">
                <th className="px-[12px] py-[14px] border-r border-gray-300 text-center w-[60px]">STT</th>
                <th className="px-[12px] py-[14px] border-r border-gray-300">Mã tin</th>
                <th className="px-[12px] py-[14px] border-r border-gray-300">Mã bệnh viện</th>
                <th className="px-[12px] py-[14px] border-r border-gray-300">Tên bệnh viện</th>
                <th className="px-[12px] py-[14px] border-r border-gray-300">Số điện thoại</th>
                <th className="px-[12px] py-[14px] border-r border-gray-300">Email</th>
                <th className="px-[12px] py-[14px] border-r border-gray-300 text-center">Nhóm máu</th>
                <th className="px-[12px] py-[14px] border-r border-gray-300 text-center">Số lượng</th>
                <th className="px-[12px] py-[14px] border-r border-gray-300">Mục đích</th>
                <th className="px-[12px] py-[14px] border-r border-gray-300 text-center">Ngày đăng</th>
                <th className="px-[12px] py-[14px] border-r border-gray-300 text-center">Giờ đăng</th>
                <th className="px-[12px] py-[14px] text-center bg-red-50 text-red-700">SL đã nhận</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-gray-700">
              {filteredData.map((row, index) => (
                <tr key={row.id || row.maTin} className="hover:bg-gray-50 transition-colors">
                  <td className="px-[12px] py-[12px] border-r border-gray-200 text-center font-medium">{index + 1}</td>
                  <td className="px-[12px] py-[12px] border-r border-gray-200 font-bold text-red-600">{row.maTin}</td>
                  <td className="px-[12px] py-[12px] border-r border-gray-200">{row.maBV || "N/A"}</td>
                  <td className="px-[12px] py-[12px] border-r border-gray-200 font-semibold text-gray-900">{row.tenBV}</td>
                  <td className="px-[12px] py-[12px] border-r border-gray-200">{row.sdt}</td>
                  <td className="px-[12px] py-[12px] border-r border-gray-200">{row.email}</td>
                  <td className="px-[12px] py-[12px] border-r border-gray-200 text-center">
                    <span className="bg-red-100 text-red-700 px-[8px] py-[2px] rounded font-bold">{row.nhomMau}</span>
                  </td>
                  <td className="px-[12px] py-[12px] border-r border-gray-200 text-center">{row.soLuong}</td>
                  <td className="px-[12px] py-[12px] border-r border-gray-200 max-w-[180px] truncate" title={row.mucDich}>{row.mucDich}</td>
                  <td className="px-[12px] py-[12px] border-r border-gray-200 text-center">{row.ngayDang || "24/07/2026"}</td>
                  <td className="px-[12px] py-[12px] border-r border-gray-200 text-center">{row.gioDang || "00:00"}</td>
                  <td className="px-[12px] py-[12px] text-center bg-red-50 text-red-800 font-bold">{row.slDaNhan || "0 đơn vị"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
};

export default ListTinKhanCap;
