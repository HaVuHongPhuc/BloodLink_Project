import { useState, useEffect } from 'react';
import Layout from '../Layout';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faFilter, faBullhorn, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';

const ListTinKhanCap = () => {
  // STATES QUẢN LÝ DỮ LIỆU HỆ THỐNG 
  const [displayList, setDisplayList] = useState([]);
  const [systemMessage, setSystemMessage] = useState({ type: "", text: "" });
  const [loading, setLoading] = useState(true);

  // STATES INPUT TẠM THỜI 
  const [inputSearch, setInputSearch] = useState("");
  const [inputBloodFilter, setInputBloodFilter] = useState("");

  // STATES ĐÃ KÍCH HOẠT THEO NÚT 
  const [activeSearch, setActiveSearch] = useState("");
  const [activeBloodFilter, setActiveBloodFilter] = useState("");

  // HÀM CHUYỂN ĐỔI NGÀY ĐĂNG SANG DẠNG DD/MM/YYYY
  const formatDate = (dateVal) => {
    if (!dateVal) return "";
    if (typeof dateVal === "string" && dateVal.includes("/")) return dateVal;
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return dateVal;
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // TỰ ĐỘNG ẨN THÔNG BÁO SAU 2 GIÂY
  useEffect(() => {
    if (systemMessage.text) {
      const timer = setTimeout(() => {
        setSystemMessage({ type: "", text: "" });
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [systemMessage]);

  // TẢI BẢN GHI TỪ MONGODB API 
  useEffect(() => {
    const fetchUrgentNews = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/urgent-news");
        if (response.ok) {
          const data = await response.json();

          // Chỉ lấy những tin có TrangThai === "Đang hiển thị"
          const activeNews = data.filter(
            (item) => (item.TrangThai || item.trangThai || "Đang hiển thị") === "Đang hiển thị"
          );

          if (activeNews.length === 0) {
            setSystemMessage({ type: "error", text: "Không có tin khẩn cấp nào đang hiển thị" });
            setDisplayList([]);
            return;
          }

          // Sắp xếp theo thời gian mới nhất
          const sortedList = [...activeNews].sort((a, b) => {
            const timeA = new Date(a.createdAt || a.NgayDang || a.ngayDang);
            const timeB = new Date(b.createdAt || b.NgayDang || b.ngayDang);
            return timeB - timeA;
          });

          setDisplayList(sortedList);
        } else {
          setSystemMessage({ type: "error", text: "Không thể lấy dữ liệu từ máy chủ Backend" });
        }
      } catch (error) {
        console.error("Lỗi khi kết nối API lấy danh sách tin khẩn cấp:", error);
        setSystemMessage({ type: "error", text: "Lỗi kết nối máy chủ Backend" });
      } finally {
        setLoading(false);
      }
    };

    fetchUrgentNews();
  }, []);

  // LOGIC LỌC DỮ LIỆU (TÌM KIẾM & NHÓM MÁU)
  const filteredData = displayList.filter(item => {
    const maTin = item.MaTin || item.maTin || "";
    const tenBV = item.TenBenhVien || item.tenBV || "";
    const nhomMau = item.NhomMau || item.nhomMau || "";

    const matchesSearch = activeSearch 
      ? tenBV.toLowerCase().includes(activeSearch.toLowerCase()) || 
        maTin.toLowerCase().includes(activeSearch.toLowerCase())
      : true;

    const matchesBlood = activeBloodFilter 
      ? nhomMau === activeBloodFilter 
      : true;

    return matchesSearch && matchesBlood;
  });

  // Kiểm tra thông báo sau khi lọc
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

  if (loading) {
    return (
      <Layout>
        <div className="text-center mt-10 text-gray-600 font-medium">Đang tải danh sách tin khẩn cấp từ Database...</div>
      </Layout>
    );
  }

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
              {filteredData.map((row, index) => {
                const maTin = row.MaTin || row.maTin;
                const maBV = row.MaBenhVien || row.maBV || "N/A";
                const tenBV = row.TenBenhVien || row.tenBV;
                const sdt = row.SoDienThoaiBenhVien || row.sdt;
                const email = row.Email || row.email;
                const nhomMau = row.NhomMau || row.nhomMau;
                const soLuong = row.SoLuong !== undefined ? row.SoLuong : row.soLuong;
                const mucDich = row.MucDich || row.mucDich;
                const ngayDang = formatDate(row.NgayDang || row.ngayDang);
                const gioDang = row.GioDang || row.gioDang || "00:00";
                const slDaNhan = row.SoLuongDaNhan !== undefined ? row.SoLuongDaNhan : (row.slDaNhan || 0);

                return (
                  <tr key={row._id || maTin} className="hover:bg-gray-50 transition-colors">
                    <td className="px-[12px] py-[12px] border-r border-gray-200 text-center font-medium">{index + 1}</td>
                    <td className="px-[12px] py-[12px] border-r border-gray-200 font-bold text-red-600">{maTin}</td>
                    <td className="px-[12px] py-[12px] border-r border-gray-200">{maBV}</td>
                    <td className="px-[12px] py-[12px] border-r border-gray-200 font-semibold text-gray-900">{tenBV}</td>
                    <td className="px-[12px] py-[12px] border-r border-gray-200">{sdt}</td>
                    <td className="px-[12px] py-[12px] border-r border-gray-200">{email}</td>
                    <td className="px-[12px] py-[12px] border-r border-gray-200 text-center">
                      <span className="bg-red-100 text-red-700 px-[8px] py-[2px] rounded font-bold">{nhomMau}</span>
                    </td>
                    <td className="px-[12px] py-[12px] border-r border-gray-200 text-center">{soLuong} đơn vị</td>
                    <td className="px-[12px] py-[12px] border-r border-gray-200 max-w-[180px] truncate" title={mucDich}>{mucDich}</td>
                    <td className="px-[12px] py-[12px] border-r border-gray-200 text-center">{ngayDang}</td>
                    <td className="px-[12px] py-[12px] border-r border-gray-200 text-center">{gioDang}</td>
                    <td className="px-[12px] py-[12px] text-center bg-red-50 text-red-800 font-bold">{slDaNhan} đơn vị</td>
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

export default ListTinKhanCap;