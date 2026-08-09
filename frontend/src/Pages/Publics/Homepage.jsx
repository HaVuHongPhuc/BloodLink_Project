import { useState, useEffect } from "react";
import Layout from "../Layout";
import posterhienmau from "../HinhAnh,icons/poster_hienmau_homepage.jpg";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHospital, faHandHoldingDroplet, faClipboardList } from '@fortawesome/free-solid-svg-icons';

const Homepage = () => {
  // State lưu danh sách tin khẩn cấp từ MongoDB
  const [emergencyList, setEmergencyList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Định dạng ngày DD/MM/YYYY
  const formatDate = (dateVal) => {
    if (!dateVal) return "";
    if (typeof dateVal === "string" && dateVal.includes("/")) return dateVal;
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return dateVal;
    return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
  };

  // TẢI DỮ LIỆU TIN KHẨN CẤP TỪ MONGODB API
  useEffect(() => {
    const fetchUrgentNews = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/urgent-news");
        if (response.ok) {
          const data = await response.json();
          const now = new Date();

          // Lọc loại bỏ tin bị ẩn (do quá 3 ngày, đã đủ máu, hoặc TrangThai !== 'Đang hiển thị')
          const activeNews = data.filter((item) => {
            const isStatusActive = (item.TrangThai || item.trangThai || "Đang hiển thị") === "Đang hiển thị"; 
            const soLuongCan = Number(item.SoLuong !== undefined ? item.SoLuong : item.soLuong || 0);
            const soLuongDaNhan = Number(item.SoLuongDaNhan !== undefined ? item.SoLuongDaNhan : item.slDaNhan || 0);
            const isFullyReceived = soLuongDaNhan >= soLuongCan && soLuongCan > 0;

            let isExpired3Days = false;
            const dateDang = item.NgayDang || item.ngayDang;
            if (dateDang) {
              const diffDays = Math.abs(now - new Date(dateDang)) / (1000 * 60 * 60 * 24);
              if (diffDays >= 3) isExpired3Days = true;
            }

            return isStatusActive && !isFullyReceived && !isExpired3Days;
          });

          setEmergencyList(activeNews);
        }
      } catch (error) {
        console.error("Lỗi khi tải danh sách tin khẩn cấp:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUrgentNews();
  }, []);

  return (
    <Layout>
      <div className="w-full">
        {/* POSTER BANNER */}
        <div className="mx-auto w-full max-w-7xl px-3 sm:px-4 lg:px-6">
          <img 
            src={posterhienmau} 
            alt="Poster hiến máu"
            className="h-auto max-h-[360px] w-full rounded-2xl object-cover shadow-lg sm:max-h-[480px] lg:max-h-[600px]"
          />
        </div>

        {/* TIÊU ĐỀ DANH SÁCH */}
        <div className="mx-auto mt-8 w-full max-w-7xl px-3 sm:px-4 lg:px-6">
          <h1 className="mb-4 text-2xl font-bold text-black sm:text-3xl lg:text-4xl">
            DANH SÁCH TIN KHẨN CẤP
          </h1>
        </div>

        {/* Khung chứa danh sách tin khẩn cấp */}
        <div className="mx-auto mt-2 w-full max-w-7xl rounded-[16px] bg-red-400 p-4 sm:p-6 lg:p-8">
          {loading ? (
            <div className="flex min-h-[320px] items-center justify-center text-center text-[18px] font-bold text-white sm:text-[20px]">
              Đang tải danh sách tin khẩn cấp từ máy chủ...
            </div>
          ) : emergencyList.length === 0 ? (
            <div className="flex min-h-[320px] items-center justify-center text-center text-[18px] font-bold text-white sm:text-[20px]">
              Hiện tại không có tin khẩn cấp nào cần hỗ trợ.
            </div>
          ) : (
            /* Hàng chứa các ô tin nằm ngang */
            <div className="flex flex-nowrap gap-4 overflow-x-auto pb-2">
              {emergencyList.map((item, index) => {
                const maTinStr = item.MaTin || item.maTin || `TKC${index + 1}`;
                const tenBVStr = item.TenBenhVien || item.tenBV || "Bệnh viện";       
                const sdtStr = item.SoDienThoaiBenhVien || item.sdt || "Đang cập nhật";
                const nhomMauStr = item.NhomMau || item.nhomMau || "A+";
                const soLuongCan = Number(item.SoLuong !== undefined ? item.SoLuong : item.soLuong || 0);
                const slDaNhan = Number(item.SoLuongDaNhan !== undefined ? item.SoLuongDaNhan : item.slDaNhan || 0);
                const mucDichStr = item.MucDich || item.mucDich || "Cần hỗ trợ máu gấp";
                const ngayDangStr = formatDate(item.NgayDang || item.ngayDang);

                return (
                  /* Ô CHỨA TIN */
                  <div 
                    key={item._id || index} 
                    className="flex h-[480px] w-[85vw] max-w-[320px] flex-shrink-0 flex-col justify-between rounded-[12px] bg-white p-4 shadow-md sm:max-w-[360px] sm:p-5 md:h-[500px] md:w-[420px] lg:max-w-[500px] lg:p-7"
                  >
                    <div>
                      {/* Dòng tiêu đề chữ đỏ */}
                      <h2 className="text-[22px] font-bold text-red-600 mb-[20px] uppercase border-b border-gray-200 pb-[12px]">
                        CẦN NGƯỜI HIẾN MÁU KHẨN CẤP #{maTinStr}
                      </h2>

                      {/* Thông tin chi tiết */}
                      <div className="space-y-[12px] text-gray-800 text-[15px]">
                        <p>
                          <span className="font-bold text-red-600">Nhóm máu cần:</span>{" "}
                          <span className="bg-red-100 text-red-700 font-bold px-2 py-1 rounded">
                            {nhomMauStr}
                          </span>
                        </p>
                        <p><span className="font-bold">Bệnh viện:</span> {tenBVStr}</p>
                        <p><span className="font-bold">Cần lượng máu:</span> {soLuongCan} đơn vị (Đã nhận: {slDaNhan})</p>
                        <p><span className="font-bold">Ngày đăng:</span> {ngayDangStr}</p>
                        <p><span className="font-bold">Liên hệ:</span> {sdtStr}</p>
                        <div className="bg-red-50 p-[12px] rounded-[8px] text-red-700 border border-red-200 mt-[12px]">
                          <span className="font-bold">Ghi chú:</span> {mucDichStr}
                        </div>
                      </div>
                    </div>

                    {/* Nút đăng ký cho từng thẻ */}
                    <button 
                      onClick={() => window.location.href = "/register-donate"}
                      className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-[14px] rounded-[8px] transition duration-200 uppercase cursor-pointer"
                    >
                      ĐĂNG KÝ HIẾN MÁU
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* KHỐI ĐIỀU HƯỚNG NHANH */}
        <div className="mx-auto my-6 w-full max-w-6xl overflow-hidden rounded-[12px] px-3 shadow-xl sm:px-4 lg:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {/* Ô 1: Tìm Bệnh Viện */}
            <a 
              href="/hospitals" 
              className="bg-[#b91c1c] hover:bg-[#991b1b] text-white h-[140px] flex flex-col items-center justify-center gap-[12px] transition-all cursor-pointer group"
            >
              <div className="text-[36px] group-hover:scale-110 transition-transform">
                <FontAwesomeIcon icon={faHospital} style={{ color: "rgb(255, 255, 255)" }} />
              </div>
              <span className="text-[18px] font-bold uppercase tracking-wide">
                Tìm Bệnh Viện
              </span>
            </a>

            {/* Ô 2: Danh Sách Máu */}
            <a 
              href="/blood-bank" 
              className="flex h-[140px] flex-col items-center justify-center gap-[12px] bg-[#111111] text-white transition-all group hover:bg-[#222222]"
            >
              <div className="text-[30px] transition-transform group-hover:scale-110 sm:text-[36px]">
                <FontAwesomeIcon icon={faClipboardList} style={{ color: "rgb(255, 255, 255)" }} />
              </div>
              <span className="text-[18px] font-bold uppercase tracking-wide">
                Danh Sách Máu
              </span>
            </a>

            {/* Ô 3: Trở thành người hiến máu */}
            <a 
              href="/listtinkhancap" 
              className="bg-[#b91c1c] hover:bg-[#991b1b] text-white h-[140px] flex flex-col items-center justify-center gap-[12px] transition-all cursor-pointer group"
            >
              <div className="text-[36px] group-hover:scale-110 transition-transform">
                <FontAwesomeIcon icon={faHandHoldingDroplet} style={{ color: "rgb(255, 255, 255)" }} />
              </div>
              <span className="text-[18px] font-bold uppercase tracking-wide">
                Trở thành người hiến máu
              </span>
            </a>
          </div>
        </div>

        {/* KHỐI KÊU GỌI HÀNH ĐỘNG (HIẾN VÀ NHẬN MÁU) */}
        <div className="mx-auto my-6 w-full max-w-7xl rounded-[16px] border border-red-100 bg-gradient-to-r from-red-400 via-red-100 to-red-400 p-4 text-center shadow-sm sm:p-6 lg:p-8">
          <h2 className="text-[24px] font-bold tracking-tight text-gray-900 sm:text-[28px] lg:text-[32px]">
            Chung Tay Vì Cộng Đồng
          </h2>

          <div className="mx-auto mb-4 mt-3 h-[4px] w-[80px] rounded-full bg-red-600"></div>

          <p className="mx-auto mb-6 max-w-[700px] text-[14px] leading-relaxed text-gray-600 sm:text-[15px] lg:text-[16px]">
            Hãy cùng chúng tôi lan tỏa tình yêu thương và cứu sống thêm nhiều người. 
            Mọi bệnh nhân đều có quyền được tiếp cận nguồn máu an toàn và kịp thời.
          </p>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-[16px]">
            <a
              href="/register-receive"
              className="w-full sm:w-auto px-[32px] py-[14px] bg-black hover:bg-gray-800 text-white text-[15px] font-bold uppercase tracking-wider rounded-[8px] shadow-md hover:shadow-xl transition-all transform hover:-translate-y-0.5"
            >
              Đăng Ký Nhận Máu
            </a>

            <a
              href="/listtinkhancap"
              className="w-full sm:w-auto px-[32px] py-[14px] bg-red-600 hover:bg-red-700 text-white text-[15px] font-bold uppercase tracking-wider rounded-[8px] shadow-md hover:shadow-xl transition-all transform hover:-translate-y-0.5"
            >
              Đăng Ký Hiến Máu
            </a>
          </div>
        </div>

        {/* KHỐI OUR AIM (MỤC TIÊU CỦA CHÚNG TÔI) */}
        <div className="mx-auto my-8 w-full max-w-7xl px-3 sm:px-4 lg:px-6">
          <div className="mb-8 text-center">
            <h2 className="text-[24px] font-bold tracking-tight text-gray-900 sm:text-[28px] lg:text-[32px]">
              Mục Tiêu Của Chúng Tôi
            </h2>
            <div className="mx-auto mt-3 h-[4px] w-[80px] rounded-full bg-red-600"></div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex min-h-[240px] flex-col items-center justify-center rounded-[12px] border border-gray-100 bg-white p-6 text-center shadow-sm transition-all duration-300 group hover:border-red-200 hover:shadow-xl">
              <img 
                src={require('../HinhAnh,icons/ourAim1.png')} 
                alt="Số hóa quy trình" 
                className="w-[80px] h-[80px] object-contain mb-[20px] group-hover:scale-110 transition-transform" 
              />
              <h3 className="text-[20px] font-bold text-gray-800 leading-snug">
                Digitalizing of current Blood Donation Process
              </h3>
            </div>

            <div className="bg-white p-[32px] rounded-[12px] border border-gray-100 shadow-sm hover:shadow-xl hover:border-red-200 transition-all duration-300 flex flex-col items-center text-center group cursor-pointer min-h-[240px] justify-center">
              <img 
                src={require('../HinhAnh,icons/ourAim2.png')} 
                alt="Thúc đẩy sự thuận tiện" 
                className="w-[80px] h-[80px] object-contain mb-[20px] group-hover:scale-110 transition-transform" 
              />
              <h3 className="text-[20px] font-bold text-gray-800 leading-snug">
                Promote ease of donating blood
              </h3>
            </div>

            <div className="bg-white p-[32px] rounded-[12px] border border-gray-100 shadow-sm hover:shadow-xl hover:border-red-200 transition-all duration-300 flex flex-col items-center text-center group cursor-pointer min-h-[240px] justify-center">
              <img 
                src={require('../HinhAnh,icons/ourAim3.png')} 
                alt="Lan tỏa nhận thức" 
                className="w-[80px] h-[80px] object-contain mb-[20px] group-hover:scale-110 transition-transform" 
              />
              <h3 className="text-[20px] font-bold text-gray-800 leading-snug">
                Spread Blood Donation Awareness
              </h3>
            </div>

            <div className="bg-white p-[32px] rounded-[12px] border border-gray-100 shadow-sm hover:shadow-xl hover:border-red-200 transition-all duration-300 flex flex-col items-center text-center group cursor-pointer min-h-[240px] justify-center">
              <img 
                src={require('../HinhAnh,icons/ourAim4.png')} 
                alt="Hệ sinh thái bền vững" 
                className="w-[80px] h-[80px] object-contain mb-[20px] group-hover:scale-110 transition-transform" 
              />
              <h3 className="text-[20px] font-bold text-gray-800 leading-snug">
                Build a sustainable Blood ecosystem.
              </h3>
            </div>
          </div>
        </div>

      </div>
    </Layout>
  );
};

export default Homepage;