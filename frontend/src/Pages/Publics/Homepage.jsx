import { useState, useEffect } from "react";
import Layout from "../Layout";
import posterhienmau from "../HinhAnh,icons/poster_hienmau_homepage.jpg"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHospital, faHandHoldingDroplet, faClipboardList } from '@fortawesome/free-solid-svg-icons';
const Homepage = () => {
    //State lưu danh sách 10 tin khẩn cấp
  const [emergencyList, setEmergencyList] = useState([]);

  useEffect(() => {
    // Tạo mảng 10 tin mẫu để hiển thị ngay ra màn hình
    const mockData = Array.from({ length: 10 }, (_, index) => ({
      id: index + 1,
      title: "CẦN NGƯỜI HIẾN MÁU KHẨN CẤP",
      bloodType: "O+",
      hospital: "Bệnh viện Chợ Rẫy",
      location: "201B Nguyễn Chí Thanh, Q.5, TP.HCM",
      amount: "2 đơn vị",
      deadline: "25/07/2026",
      phone: "0901234567",
      note: "Bệnh nhân đang cấp cứu phẫu thuật gấp, rất cần máu!"
    }));

    setEmergencyList(mockData);

    /* ĐÂY LÀ MẪU ĐỂ XEM, SAU NÀY SẼ LẤY DỮ LIỆU TỪ API BACKEND QUA */
  }, []);

    return (
        <Layout>
            <div>
                <div>
                    <img src={posterhienmau} 
                    alt="Description"
                    className="w-full h-auto rounded-lg shadow"
                    style={{display: 'flex', justifyContent: 'center',width: '1600px', height: '600px' }}
                    />
                </div>
                <div>
                    <h1 className="text-4xl text-black font-bold mt-[50px] mb-[16px]">DANH SÁCH TIN KHẨN CẤP</h1>
                </div>

                {/* Khung chứa danhy sách tin khẩn cấp */}

                <div className="w-full max-w-[1600px] h-[600px] bg-red-400 rounded-[16px] p-[30px] mx-auto overflow-x-auto">
                    {/* Hàng chứa các ô tin nằm ngang */}
                    <div className="flex gap-[25px] h-full items-center">
                        {emergencyList.map((item) => (
                        
                        /* Ô CHỨA TIN:*/
                        <div 
                            key={item.id} 
                            className="w-[500px] h-[500px] bg-white rounded-[12px] p-[28px] flex-shrink-0 shadow-md flex flex-col justify-between"
                        >
                            <div>
                            {/* Dòng tiêu đề chữ đỏ */}
                            <h2 className="text-[22px] font-bold text-red-600 mb-[20px] uppercase border-b border-gray-200 pb-[12px]">
                                {item.title} #{item.id}
                            </h2>

                            {/* Thông tin chi tiết lấy từ Database */}
                            <div className="space-y-[14px] text-gray-800 text-[16px]">
                                <p><span className="font-bold text-red-600">Nhóm máu cần:</span> <span className="bg-red-100 text-red-700 font-bold px-2 py-1 rounded">{item.bloodType}</span></p>
                                <p><span className="font-bold">Bệnh viện:</span> {item.hospital}</p>
                                <p><span className="font-bold">Địa chỉ:</span> {item.location}</p>
                                <p><span className="font-bold">Cần lượng máu:</span> {item.amount}</p>
                                <p><span className="font-bold">Hạn chót:</span> {item.deadline}</p>
                                <p><span className="font-bold">Liên hệ:</span> {item.phone}</p>
                                <div className="bg-red-50 p-[12px] rounded-[8px] text-red-700 border border-red-200 mt-[16px]">
                                <span className="font-bold">Ghi chú:</span> {item.note}
                                </div>
                            </div>
                            </div>

                            {/* Nút đăng ký*/}
                            <button className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-[14px] rounded-[8px] transition duration-200">
                            ĐĂNG KÝ HIẾN MÁU
                            </button>
                        </div>
                        ))}
                    </div>
                </div>

                {/* KHỐI ĐIỀU HƯỚNG NHANH */}
                <div className="w-full max-w-[1000px] mx-auto my-[30px] shadow-xl rounded-[12px] overflow-hidden">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                        
                        {/* Ô 1: Tìm Bệnh Viện  */}
                        <a 
                        href="/hospitals" 
                        className="bg-[#b91c1c] hover:bg-[#991b1b] text-white h-[140px] flex flex-col items-center justify-center gap-[12px] transition-all cursor-pointer group"
                        >
                        <div className="text-[36px] group-hover:scale-110 transition-transform">
                            <FontAwesomeIcon icon={faHospital} style={{color: "rgb(255, 255, 255)",}} />
                        </div>
                        <span className="text-[18px] font-bold uppercase tracking-wide">
                            Tìm Bệnh Viện
                        </span>
                        </a>

                        {/* Ô 2: Danh Sách Máu */}
                        <a 
                        href="/blood-bank" 
                        className="bg-[#111111] hover:bg-[#222222] text-white h-[140px] flex flex-col items-center justify-center gap-[12px] transition-all cursor-pointer group"
                        >
                        <div className="text-[36px] group-hover:scale-110 transition-transform">
                            <FontAwesomeIcon icon={faClipboardList} style={{color: "rgb(255, 255, 255)",}} />
                        </div>
                        <span className="text-[18px] font-bold uppercase tracking-wide">
                            Danh Sách Máu
                        </span>
                        </a>

                        {/* Ô 3: Trở thành người hiến máu */}
                        <a 
                        href="/labs" 
                        className="bg-[#b91c1c] hover:bg-[#991b1b] text-white h-[140px] flex flex-col items-center justify-center gap-[12px] transition-all cursor-pointer group"
                        >
                        <div className="text-[36px] group-hover:scale-110 transition-transform">
                            <FontAwesomeIcon icon={faHandHoldingDroplet} style={{color: "rgb(255, 255, 255)",}} />
                        </div>
                        <span className="text-[18px] font-bold uppercase tracking-wide">
                            Trở thành người hiến máu
                        </span>
                        </a>
                    </div>
                </div>

                {/* KHỐI KÊU GỌI HÀNH ĐỘNG (HIẾN VÀ NHẬN MÁ */}
                    <div className="w-[1600px] p-[10px] bg-gradient-to-r from-red-400 via-red-100 to-red-400 rounded-[16px] border border-red-100 shadow-sm text-center">
                    
                    {/* Tiêu đề chính */}
                    <h2 className="text-[32px] font-bold text-gray-900 tracking-tight">
                        Chung Tay Vì Cộng Đồng
                    </h2>

                    {/* Dấu gạch chân màu đỏ trang trí (giống trong hình) */}
                    <div className="w-[80px] h-[4px] bg-red-600 mx-auto mt-[12px] mb-[18px] rounded-full"></div>

                    {/* Đoạn văn mô tả */}
                    <p className="text-gray-600 text-[16px] max-w-[700px] mx-auto mb-[32px] leading-relaxed">
                        Hãy cùng chúng tôi lan tỏa tình yêu thương và cứu sống thêm nhiều người. 
                        Mọi bệnh nhân đều có quyền được tiếp cận nguồn máu an toàn và kịp thời.
                    </p>

                    {/* Cặp nút hành động */}
                    <div className="flex flex-col sm:flex-row justify-center items-center gap-[16px]">
                        
                        {/* Nút 1: Đăng ký nhận máu (Màu Đen) */}
                        <a
                        href="/register-receive"
                        className="w-full sm:w-auto px-[32px] py-[14px] bg-black hover:bg-gray-800 text-white text-[15px] font-bold uppercase tracking-wider rounded-[8px] shadow-md hover:shadow-xl transition-all transform hover:-translate-y-0.5"
                        >
                        Đăng Ký Nhận Máu
                        </a>

                        {/* Nút 2: Đăng ký hiến máu (Màu Đỏ) */}
                        <a
                        href="/register-donate"
                        className="w-full sm:w-auto px-[32px] py-[14px] bg-red-600 hover:bg-red-700 text-white text-[15px] font-bold uppercase tracking-wider rounded-[8px] shadow-md hover:shadow-xl transition-all transform hover:-translate-y-0.5"
                        >
                        Đăng Ký Hiến Máu
                        </a>

                    </div>
                </div>

                {/* KHỐI OURAIM */}
                <div className="w-full max-w-[1600px] mx-auto my-[60px]">              
                    <div className="text-center mb-[40px]">
                        <h2 className="text-[32px] font-bold text-gray-900 tracking-tight">
                        Mục Tiêu Của Chúng Tôi
                        </h2>
                        <div className="w-[80px] h-[4px] bg-red-600 mx-auto mt-[12px] rounded-full"></div>
                    </div>

                    {/* Lưới 4 thẻ mục tiêu */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[24px]">
                        
                        {/* Thẻ 1 */}
                        <div className="bg-white p-[32px] rounded-[12px] border border-gray-100 shadow-sm hover:shadow-xl hover:border-red-200 transition-all duration-300 flex flex-col items-center text-center group cursor-pointer min-h-[240px] justify-center">
                            <img 
                                src={require('../HinhAnh,icons/ourAim1.png')} 
                                alt="Số hóa quy trình" 
                                className="w-[80px] h-[80px] object-contain mb-[20px] group-hover:scale-110 transition-transform" 
                            />
                            <h3 className="text-[20px] font-bold text-gray-800 leading-snug">
                                Digitalizing of current Blood Donation Process
                            </h3>
                        </div>

                        {/* Thẻ 2 */}
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

                        {/* Thẻ 3 */}
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

                        {/* Thẻ 4 */}
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