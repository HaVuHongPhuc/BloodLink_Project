import { useState, useEffect } from "react";
import Layout from "../Layout";
import posterhienmau from "../HinhAnh,icons/poster_hienmau_homepage.jpg";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faBullhorn, 
  faExclamationTriangle, faCheckCircle, faClock 
} from "@fortawesome/free-solid-svg-icons";

const HospitalPage = ({ emergencyList = [], setEmergencyList }) => {
  // --- STATES QUẢN LÝ POPUP MODAL ---
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);

  // --- STATES XỬ LÝ DỮ LIỆU ---
  const [selectedNewsId, setSelectedNewsId] = useState(null);
  const [newsToDelete, setNewsToDelete] = useState(null);
  const [systemMessage, setSystemMessage] = useState({ type: "", text: "" });

  // State Form lưu trữ dữ liệu theo cấu trúc biểu mẫu (BM05)
  const [formData, setFormData] = useState({
    tenBV: "Bệnh viện Chợ Rẫy",
    sdt: "02838554137",
    email: "choray@bloodlink.vn",
    nhomMau: "O+",
    soLuong: "",
    mucDich: ""
  });

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
  // TIẾN TRÌNH TỰ ĐỘNG: KIỂM TRA ĐIỀU KIỆN TỰ ĐỘNG XÓA SAU 3 NGÀY
  // =========================================================
  useEffect(() => {
    const systemCurrentDate = new Date("2026-07-24");

    const validList = emergencyList.filter((item) => {
      if (!item.ngayDang) return true;
      
      const [day, month, year] = item.ngayDang.split("/");
      const dateDang = new Date(`${year}-${month}-${day}`);
      
      const diffTime = Math.abs(systemCurrentDate - dateDang);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      return diffDays < 3;
    });

    if (validList.length !== emergencyList.length) {
      setEmergencyList(validList);
    }
  }, [emergencyList, setEmergencyList]);

  // =========================================================
  // XỬ LÝ USECASE UC14: ĐĂNG TIN KHẨN CẤP (BM05)
  // =========================================================
  const handleOpenCreateModal = () => {
    setSystemMessage({ type: "", text: "" });
    setFormData({
      tenBV: "Bệnh viện Chợ Rẫy",
      sdt: "02838554137",
      email: "choray@bloodlink.vn",
      nhomMau: "O+",
      soLuong: "",
      mucDich: ""
    });
    setIsCreateModalOpen(true);
  };

  const handleCreatePost = (e) => {
    e.preventDefault();
    setSystemMessage({ type: "", text: "" });

    if (!formData.tenBV.trim() || !formData.sdt.trim() || !formData.email.trim() || !formData.mucDich.trim() || Number(formData.soLuong) <= 0) {
      setSystemMessage({ type: "error", text: "Vui lòng nhập đúng trường dữ liệu" });
      return;
    }

    if (emergencyList.length >= 100) {
      setSystemMessage({ type: "error", text: "Tin khẩn cấp đã vượt quá giới hạn đăng" });
      return;
    }

    const isDuplicate = emergencyList.some(
      (item) => 
        item.tenBV.toLowerCase() === formData.tenBV.toLowerCase() &&
        item.nhomMau === formData.nhomMau &&
        item.mucDich.toLowerCase().trim() === formData.mucDich.toLowerCase().trim()
    );

    if (isDuplicate) {
      setSystemMessage({ type: "error", text: "Tin khẩn cấp đã tồn tại" });
      return;
    }

    const newPost = {
      id: "TKC" + Date.now().toString().slice(-3),
      maTin: "TKC" + Date.now().toString().slice(-3),
      maBV: "BVCR",
      ...formData,
      soLuong: Number(formData.soLuong) + " đơn vị",
      ngayDang: "24/07/2026",
      gioDang: "10:30",
      slDaNhan: "0 đơn vị"
    };

    setEmergencyList([newPost, ...emergencyList]);
    setSystemMessage({ type: "success", text: "Đăng tin khẩn cấp thành công" });
    setIsCreateModalOpen(false);
  };

  // =========================================================
  // XỬ LÝ USECASE UC15: CẬP NHẬT TIN KHẨN CẤP (BM06)
  // =========================================================
  const handleOpenEditModal = (item) => {
    setSystemMessage({ type: "", text: "" });
    setSelectedNewsId(item.id);
    const exactAmount = item.soLuong.replace(/[^0-9]/g, "");

    setFormData({
      maTin: item.maTin,
      tenBV: item.tenBV,
      sdt: item.sdt,
      email: item.email,
      nhomMau: item.nhomMau,
      soLuong: exactAmount,
      mucDich: item.mucDich
    });
    setIsEditModalOpen(true);
  };

  const handleUpdatePost = (e) => {
    e.preventDefault();
    setSystemMessage({ type: "", text: "" });

    if (!formData.tenBV.trim() || !formData.sdt.trim() || !formData.email.trim() || !formData.mucDich.trim() || Number(formData.soLuong) <= 0) {
      setSystemMessage({ type: "error", text: "Vui lòng nhập đúng trường dữ liệu" });
      return;
    }

    const isDuplicate = emergencyList.some(
      (item) => 
        item.id !== selectedNewsId && 
        item.tenBV.toLowerCase() === formData.tenBV.toLowerCase() &&
        item.nhomMau === formData.nhomMau &&
        item.mucDich.toLowerCase().trim() === formData.mucDich.toLowerCase().trim()
    );

    if (isDuplicate) {
      setSystemMessage({ type: "error", text: "Tin khẩn cấp đã tồn tại" });
      return;
    }

    setEmergencyList((prev) =>
      prev.map((item) =>
        item.id === selectedNewsId
          ? {
              ...item,
              tenBV: formData.tenBV,
              sdt: formData.sdt,
              email: formData.email,
              nhomMau: formData.nhomMau,
              soLuong: Number(formData.soLuong) + " đơn vị",
              mucDich: formData.mucDich,
            }
          : item
      )
    );

    setSystemMessage({ type: "success", text: "Cập nhật tin khẩn cấp thành công" });
    setIsEditModalOpen(false);
  };

  // =========================================================
  // XỬ LÝ USECASE UC16: XÓA TIN KHẨN CẤP
  // =========================================================
  const handleTriggerDelete = (item) => {
    setSystemMessage({ type: "", text: "" });
    
    const exists = emergencyList.find((el) => el.id === item.id);
    if (!exists) {
      setSystemMessage({ type: "error", text: "Tin khẩn cấp đã được xóa trước đó" });
      return;
    }

    setNewsToDelete(item);
    setIsConfirmDeleteOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!newsToDelete) return;

    const exists = emergencyList.find((el) => el.id === newsToDelete.id);
    if (!exists) {
      setSystemMessage({ type: "error", text: "Tin khẩn cấp đã được xóa trước đó" });
      setIsConfirmDeleteOpen(false);
      return;
    }

    setEmergencyList((prev) => prev.filter((el) => el.id !== newsToDelete.id));
    setSystemMessage({ type: "success", text: "Xóa tin khẩn cấp thành công" });
    setIsConfirmDeleteOpen(false);
    setNewsToDelete(null);
  };

  const handleCancelDelete = () => {
    setIsConfirmDeleteOpen(false);
    setNewsToDelete(null);
  };

  return (
    <Layout>
      <div className="w-full">
        {/* Banner đầu trang */}
        <div>
            <img src={posterhienmau} 
            alt="Description"
            className="w-full h-auto rounded-lg shadow"
            style={{display: 'flex', justifyContent: 'center',width: '1600px', height: '600px' }}
            />
        </div>

        {/* Khối hiển thị thông báo */}
        {systemMessage.text && (
          <div className={`p-[16px] rounded-[8px] flex items-center gap-[12px] mb-[24px] border text-[14px] max-w-[1600px] mx-auto transition-all ${
            systemMessage.type === "error" ? "bg-red-50 text-red-700 border-red-200" : "bg-emerald-50 text-emerald-700 border-emerald-200"
          }`}>
            <FontAwesomeIcon icon={systemMessage.type === "error" ? faExclamationTriangle : faCheckCircle} className="text-[16px]" />
            <p className="font-semibold">{systemMessage.text}</p>
          </div>
        )}

        {/* Tiêu đề & Nút đăng tin khẩn cấp */}
        <div className="flex justify-between items-center mb-[32px] max-w-[1600px] mx-auto">
          <h1 className="text-3xl font-bold text-gray-950 uppercase flex items-center gap-[12px]">
            <FontAwesomeIcon icon={faBullhorn} className="text-red-600" />
            Quản Lý Tin Khẩn Cấp 
          </h1>
          <button 
            onClick={handleOpenCreateModal}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-[12px] px-[24px] rounded-[8px] transition shadow-md uppercase text-[14px]"
          >
            Đăng tin khẩn cấp
          </button>
        </div>

        {/* Grid Danh sách hiển thị */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[24px] max-w-[1600px] mx-auto">
          {emergencyList.map((item) => {
            const currentAmount = parseInt(item.soLuong) || 0;
            const receivedAmount = parseInt(item.slDaNhan) || 0;
            const isFullyReceived = receivedAmount >= currentAmount && currentAmount > 0;

            return (
              <div key={item.id} className="bg-white rounded-[12px] border border-gray-200 p-[24px] shadow-sm flex flex-col justify-between hover:shadow-md transition">
                <div>
                  <div className="flex justify-between items-start border-b border-gray-100 pb-[12px] mb-[16px]">
                    <div>
                      <span className="text-[12px] font-bold text-gray-400 block">{item.maTin}</span>
                      <h3 className="text-[17px] font-bold text-gray-900 uppercase">{item.tenBV}</h3>
                    </div>
                    <div className="flex flex-col items-end gap-[4px]">
                      <span className="bg-red-100 text-red-700 font-bold px-[10px] py-[4px] rounded-[6px] text-[14px]">{item.nhomMau}</span>
                      {isFullyReceived && (
                        <span className="text-[11px] bg-emerald-100 text-emerald-800 px-[6px] py-[2px] rounded font-bold">Đạt số lượng</span>
                      )}
                    </div>
                  </div>
                  <div className="space-y-[8px] text-[14px] text-gray-600">
                    <p><span className="font-semibold text-gray-800">Cần:</span> {item.soLuong}</p>
                    <p><span className="font-semibold text-gray-800">Đã nhận:</span> {item.slDaNhan}</p>
                    <p><span className="font-semibold text-gray-800">Mục đích:</span> {item.mucDich}</p>
                    <p className="flex items-center gap-[4px] text-[12px] text-gray-400 pt-[4px]">
                      <FontAwesomeIcon icon={faClock} /> Ngày đăng: {item.ngayDang} | {item.gioDang}
                    </p>
                  </div>
                </div>

                {/* Khối nút tác vụ Cập nhật & Xóa */}
                <div className="grid grid-cols-2 gap-[12px] mt-[24px] pt-[16px] border-t border-gray-100">
                  <button 
                    onClick={() => handleOpenEditModal(item)}
                    className="flex items-center justify-center gap-[6px] text-gray-700 border border-gray-300 hover:bg-gray-50 font-bold py-[8px] rounded-[6px] text-[13px] transition"
                  >
                    CẬP NHẬT
                  </button>
                  <button 
                    onClick={() => handleTriggerDelete(item)}
                    className="flex items-center justify-center gap-[6px] text-red-600 border border-red-200 hover:bg-red-50 font-bold py-[8px] rounded-[6px] text-[13px] transition"
                  >
                    XÓA TIN
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* =========================================================
          MODAL: BM05 PHIẾU ĐĂNG TIN KHẨN CẤP
          ========================================================= */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-[16px]">
          <div className="bg-white rounded-[16px] w-full max-w-[600px] p-[32px] shadow-2xl overflow-y-auto max-h-[90vh] border border-gray-300">
            <div className="text-center border-b border-gray-200 pb-[16px] mb-[20px]">
              <span className="text-[12px] font-bold text-gray-400 block tracking-widest mb-[2px]">BM05</span>
              <h2 className="text-[22px] font-bold text-gray-900 uppercase">Phiếu đăng tin khẩn cấp</h2>
            </div>
            <form onSubmit={handleCreatePost} className="space-y-[16px]">
              <div>
                <label className="block text-[14px] font-bold text-gray-700 mb-[6px]">Tên bệnh viện:</label>
                <input type="text" value={formData.tenBV} onChange={(e) => setFormData({...formData, tenBV: e.target.value})} className="w-full border border-gray-300 rounded-[8px] p-[10px] text-[14px] text-gray-900 bg-gray-50" />
              </div>
              <div className="grid grid-cols-2 gap-[16px]">
                <div>
                  <label className="block text-[14px] font-bold text-gray-700 mb-[6px]">Số điện thoại:</label>
                  <input type="text" value={formData.sdt} onChange={(e) => setFormData({...formData, sdt: e.target.value})} className="w-full border border-gray-300 rounded-[8px] p-[10px] text-[14px] text-gray-900 bg-gray-50" />
                </div>
                <div>
                  <label className="block text-[14px] font-bold text-gray-700 mb-[6px]">Email:</label>
                  <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full border border-gray-300 rounded-[8px] p-[10px] text-[14px] text-gray-900 bg-gray-50" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-[16px]">
                <div>
                  <label className="block text-[14px] font-bold text-gray-700 mb-[6px]">Nhóm máu:</label>
                  <select value={formData.nhomMau} onChange={(e) => setFormData({...formData, nhomMau: e.target.value})} className="w-full border border-gray-300 rounded-[8px] p-[10px] text-[14px] bg-white text-gray-900">
                    <option value="O+">O+</option><option value="O-">O-</option><option value="A+">A+</option><option value="A-">A-</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[14px] font-bold text-gray-700 mb-[6px]">Số lượng (đơn vị):</label>
                  <input type="number" value={formData.soLuong} onChange={(e) => setFormData({...formData, soLuong: e.target.value})} className="w-full border border-gray-300 rounded-[8px] p-[10px] text-[14px] text-gray-900" placeholder="Ví dụ: 3" />
                </div>
              </div>
              <div>
                <label className="block text-[14px] font-bold text-gray-700 mb-[6px]">Mục đích:</label>
                <textarea rows="3" value={formData.mucDich} onChange={(e) => setFormData({...formData, mucDich: e.target.value})} className="w-full border border-gray-300 rounded-[8px] p-[10px] text-[14px] text-gray-900" placeholder="Lý do hoặc tình trạng khẩn cấp của bệnh nhân..."></textarea>
              </div>
              <div className="flex justify-end gap-[12px] pt-[16px] border-t border-gray-100">
                <button type="button" onClick={() => setIsCreateModalOpen(false)} className="px-[18px] py-[10px] rounded-[8px] border border-gray-300 hover:bg-gray-50 text-[14px] font-medium">HỦY BỎ</button>
                <button type="submit" className="px-[24px] py-[10px] rounded-[8px] bg-red-600 hover:bg-red-700 text-white font-bold text-[14px] uppercase shadow-sm">ĐĂNG TIN</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL: PHIẾU CHỈNH SỬA / CẬP NHẬT TIN KHẨN CẤP
          ========================================================= */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-[16px]">
          <div className="bg-white rounded-[16px] w-full max-w-[600px] p-[32px] shadow-2xl overflow-y-auto max-h-[90vh] border border-gray-300">
            <div className="text-center border-b border-gray-200 pb-[16px] mb-[20px]">
              <span className="text-[13px] font-bold text-red-600 block mb-[2px]">Mã tin sửa: {formData.maTin}</span>
              <h2 className="text-[22px] font-bold text-gray-900 uppercase">Cập nhật thông tin khẩn cấp</h2>
            </div>
            <form onSubmit={handleUpdatePost} className="space-y-[16px]">
              <div>
                <label className="block text-[14px] font-bold text-gray-700 mb-[6px]">Tên bệnh viện:</label>
                <input type="text" value={formData.tenBV} onChange={(e) => setFormData({...formData, tenBV: e.target.value})} className="w-full border border-gray-300 rounded-[8px] p-[10px] text-[14px] text-gray-900" />
              </div>
              <div className="grid grid-cols-2 gap-[16px]">
                <div>
                  <label className="block text-[14px] font-bold text-gray-700 mb-[6px]">Số điện thoại:</label>
                  <input type="text" value={formData.sdt} onChange={(e) => setFormData({...formData, sdt: e.target.value})} className="w-full border border-gray-300 rounded-[8px] p-[10px] text-[14px] text-gray-900" />
                </div>
                <div>
                  <label className="block text-[14px] font-bold text-gray-700 mb-[6px]">Email:</label>
                  <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full border border-gray-300 rounded-[8px] p-[10px] text-[14px] text-gray-900" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-[16px]">
                <div>
                  <label className="block text-[14px] font-bold text-gray-700 mb-[6px]">Nhóm máu tuyển:</label>
                  <select value={formData.nhomMau} onChange={(e) => setFormData({...formData, nhomMau: e.target.value})} className="w-full border border-gray-300 rounded-[8px] p-[10px] text-[14px] bg-white text-gray-900">
                    <option value="O+">O+</option><option value="O-">O-</option><option value="A+">A+</option><option value="A-">A-</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[14px] font-bold text-gray-700 mb-[6px]">Số lượng đơn vị:</label>
                  <input type="number" value={formData.soLuong} onChange={(e) => setFormData({...formData, soLuong: e.target.value})} className="w-full border border-gray-300 rounded-[8px] p-[10px] text-[14px] text-gray-900" />
                </div>
              </div>
              <div>
                <label className="block text-[14px] font-bold text-gray-700 mb-[6px]">Mục đích:</label>
                <textarea rows="3" value={formData.mucDich} onChange={(e) => setFormData({...formData, mucDich: e.target.value})} className="w-full border border-gray-300 rounded-[8px] p-[10px] text-[14px] text-gray-900"></textarea>
              </div>
              <div className="flex justify-end gap-[12px] pt-[16px] border-t border-gray-100">
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-[18px] py-[10px] rounded-[8px] border border-gray-300 hover:bg-gray-50 text-[14px] font-medium">HỦY BỎ</button>
                <button type="submit" className="px-[24px] py-[10px] rounded-[8px] bg-gray-950 hover:bg-gray-900 text-white font-bold text-[14px] uppercase shadow-sm">XÁC NHẬN CẬP NHẬT</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: HỘP THOẠI XÁC NHẬN XOÁ DỮ LIỆU */}
      {isConfirmDeleteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-[16px]">
          <div className="bg-white rounded-[12px] w-full max-w-[450px] p-[28px] shadow-2xl text-center border border-gray-100">
            <div className="text-red-600 mb-[16px]">
              <FontAwesomeIcon icon={faExclamationTriangle} className="text-[44px]" />
            </div>
            <h3 className="text-[18px] font-bold text-gray-950 mb-[8px]">Xác nhận xóa dữ liệu?</h3>
            <p className="text-[14px] text-gray-600 mb-[24px]">
              Bạn có chắc chắn muốn xóa gỡ bỏ hoàn toàn mã tin <span className="font-bold text-red-600">{newsToDelete?.maTin}</span> ra khỏi hệ thống công cộng không?
            </p>
            <div className="flex items-center gap-[12px]">
              <button type="button" onClick={handleCancelDelete} className="w-full px-[16px] py-[10px] rounded-[6px] border border-gray-300 hover:bg-gray-50 text-[14px] font-semibold text-gray-700 transition">HỦY BỎ</button>
              <button type="button" onClick={handleConfirmDelete} className="w-full px-[16px] py-[10px] rounded-[6px] bg-red-600 hover:bg-red-700 text-white font-bold text-[14px] uppercase shadow-sm">XÁC NHẬN XÓA</button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default HospitalPage;