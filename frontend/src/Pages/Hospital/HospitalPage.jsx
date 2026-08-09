import { useState, useEffect } from "react";
import HospitalLayout from "./HospitalLayout"; 
import posterhienmau from "../HinhAnh,icons/poster_hienmau_hospitalpage.jpg";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faBullhorn, 
  faExclamationTriangle, 
  faCheckCircle, 
  faClock 
} from "@fortawesome/free-solid-svg-icons";

const HospitalPage = () => {
  const [listData, setListData] = useState([]);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [selectedNewsId, setSelectedNewsId] = useState(null);
  const [newsToDelete, setNewsToDelete] = useState(null);
  const [systemMessage, setSystemMessage] = useState({ type: "", text: "" });
  const [hospitalProfile, setHospitalProfile] = useState(null);

  const [formData, setFormData] = useState({
    tenBV: "",
    sdt: "",
    email: "",
    nhomMau: "A+",
    soLuong: "",
    mucDich: ""
  });

  const formatDate = (dateVal) => {
    if (!dateVal) return "";
    if (typeof dateVal === "string" && dateVal.includes("/")) return dateVal;
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return dateVal;
    return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
  };

  const fetchUrgentNews = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/urgent-news");
      if (response.ok) {
        const data = await response.json();
        const now = new Date();
        const activeNews = data.filter((item) => {
          const isStatusActive = (item.TrangThai || item.trangThai || "Đang hiển thị") === "Đang hiển thị";
          const soLuongCan = Number(item.SoLuong !== undefined ? item.SoLuong : item.soLuong || 0);
          const soLuongDaNhan = Number(item.SoLuongDaNhan !== undefined ? item.SoLuongDaNhan : item.slDaNhan || 0);
          const isFullyReceived = soLuongDaNhan >= soLuongCan && soLuongCan > 0;
          let isExpired3Days = false;
          const dateDang = item.NgayDang || item.ngayDang;
          if (dateDang) {
            const d = new Date(dateDang);
            const diffDays = Math.abs(now - d) / (1000 * 60 * 60 * 24);
            if (diffDays >= 3) isExpired3Days = true;
          }
          return isStatusActive && !isFullyReceived && !isExpired3Days;
        });
        setListData(activeNews);
      }
    } catch (error) {
      console.error("Lỗi kết nối API:", error);
    }
  };

  const loadHospitalProfile = async () => {
    const token = localStorage.getItem("userToken");
    if (!token) return null;

    try {
      const response = await fetch("http://localhost:5000/api/hospital/profile", {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) {
        return null;
      }

      const profile = await response.json();
      setHospitalProfile(profile);
      setFormData((prev) => ({
        ...prev,
        tenBV: profile.TenBenhVien || prev.tenBV || "",
        sdt: profile.SoDienThoaiBenhVien || prev.sdt || "",
        email: profile.Email || prev.email || ""
      }));
      return profile;
    } catch (error) {
      console.error("Lỗi tải thông tin bệnh viện:", error);
      return null;
    }
  };

  useEffect(() => {
    fetchUrgentNews();
  }, []);

  useEffect(() => {
    loadHospitalProfile();
  }, []);

  useEffect(() => {
    if (systemMessage.text) {
      const timer = setTimeout(() => setSystemMessage({ type: "", text: "" }), 2000);
      return () => clearTimeout(timer);
    }
  }, [systemMessage]);

  const handleOpenCreateModal = () => {
    setSystemMessage({ type: "", text: "" });
    if (!hospitalProfile) {
      loadHospitalProfile();
    }
    setFormData({
      tenBV: hospitalProfile?.TenBenhVien || localStorage.getItem("hospitalName") || "",
      sdt: hospitalProfile?.SoDienThoaiBenhVien || "",
      email: hospitalProfile?.Email || localStorage.getItem("userEmail") || "",
      nhomMau: "A+",
      soLuong: "",
      mucDich: ""
    });
    setIsCreateModalOpen(true);
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    setSystemMessage({ type: "", text: "" });
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.tenBV.trim() || formData.tenBV.length > 50 ||
      !formData.mucDich.trim() || formData.mucDich.length > 200 ||
      Number(formData.soLuong) <= 0) {
      setSystemMessage({ type: "error", text: "Vui lòng nhập đúng trường dữ liệu (Tên bệnh viện ≤ 50 ký tự, Mục đích ≤ 200 ký tự)" });
      return;
    }
    if (formData.sdt.length < 10 || formData.sdt.length > 11) {
      setSystemMessage({ type: "error", text: "Số điện thoại bệnh viện phải có độ dài từ 10 đến 11 chữ số" });
      return;
    }
    if (!emailRegex.test(formData.email.trim())) {
      setSystemMessage({ type: "error", text: "Địa chỉ Email không hợp lệ" });
      return;
    }
    try {
      const freshProfile = hospitalProfile || await loadHospitalProfile();
      const token = localStorage.getItem("userToken");
      const resolvedTenBV = freshProfile?.TenBenhVien || formData.tenBV.trim() || localStorage.getItem("hospitalName") || "";
      const resolvedMaBV = freshProfile?.MaBenhVien || localStorage.getItem("maBenhVien") || "";
      const resolvedSdt = freshProfile?.SoDienThoaiBenhVien || formData.sdt;
      const resolvedEmail = freshProfile?.Email || formData.email.trim() || localStorage.getItem("userEmail") || "";

      if (!resolvedMaBV || !resolvedTenBV || !resolvedSdt || !resolvedEmail) {
        setSystemMessage({ type: "error", text: "Không lấy được đầy đủ thông tin bệnh viện từ cơ sở dữ liệu" });
        return;
      }

      const bodyPayload = {
        MaBenhVien: resolvedMaBV,
        TenBenhVien: resolvedTenBV,
        SoDienThoaiBenhVien: resolvedSdt,
        Email: resolvedEmail,
        NhomMau: formData.nhomMau || "A+",
        SoLuong: Number(formData.soLuong),
        MucDich: formData.mucDich.trim()
      };
      const response = await fetch("http://localhost:5000/api/urgent-news", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(bodyPayload),
      });
      const resData = await response.json();
      if (response.ok) {
        setListData((prev) => [resData.data || resData, ...prev]);
        setSystemMessage({ type: "success", text: resData.message || "Đăng tin khẩn cấp thành công" });
        setIsCreateModalOpen(false);
      } else {
        setSystemMessage({ type: "error", text: resData.message || "Đăng tin thất bại" });
      }
    } catch (error) {
      setSystemMessage({ type: "error", text: "Không thể kết nối với máy chủ Backend" });
    }
  };

  const handleOpenEditModal = (item, e) => {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    setSystemMessage({ type: "", text: "" });
    setSelectedNewsId(item._id);
    const exactAmount = String(item.SoLuong !== undefined ? item.SoLuong : item.soLuong || "").replace(/[^0-9]/g, "");
    setFormData({
      maTin: item.MaTin || item.maTin,
      tenBV: item.TenBenhVien || item.tenBV || "",
      sdt: item.SoDienThoaiBenhVien || item.sdt || "",
      email: item.Email || item.email || "",
      nhomMau: item.NhomMau || item.nhomMau || "A+",
      soLuong: exactAmount,
      mucDich: item.MucDich || item.mucDich || ""
    });
    setIsEditModalOpen(true);
  };

  const handleUpdatePost = async (e) => {
    e.preventDefault();
    setSystemMessage({ type: "", text: "" });
    const token = localStorage.getItem("userToken");
    if (!token) {
      setSystemMessage({ type: "error", text: "Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại" });
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.tenBV.trim() || formData.tenBV.length > 50 ||
      !formData.mucDich.trim() || formData.mucDich.length > 200 ||
      Number(formData.soLuong) <= 0) {
      setSystemMessage({ type: "error", text: "Vui lòng nhập đúng trường dữ liệu" });
      return;
    }
    if (formData.sdt.length < 10 || formData.sdt.length > 11) {
      setSystemMessage({ type: "error", text: "Số điện thoại bệnh viện phải có độ dài từ 10 đến 11 chữ số" });
      return;
    }
    if (!emailRegex.test(formData.email.trim())) {
      setSystemMessage({ type: "error", text: "Địa chỉ Email không hợp lệ" });
      return;
    }
    try {
      const bodyPayload = {
        TenBenhVien: formData.tenBV.trim(),
        SoDienThoaiBenhVien: formData.sdt,
        Email: formData.email.trim(),
        NhomMau: formData.nhomMau,
        SoLuong: Number(formData.soLuong),
        MucDich: formData.mucDich.trim(),
        TrangThai: "Đang hiển thị"
      };
      const response = await fetch(`http://localhost:5000/api/urgent-news/${selectedNewsId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(bodyPayload),
      });
      const resData = await response.json();
      if (response.ok) {
        const updatedItem = resData.data || resData;
        if (updatedItem.TrangThai === "Đã ẩn") {
          setListData((prev) => prev.filter((item) => item._id !== selectedNewsId));
        } else {
          setListData((prev) => prev.map((item) => item._id === selectedNewsId ? updatedItem : item));
        }
        setSystemMessage({ type: "success", text: resData.message || "Cập nhật tin khẩn cấp thành công" });
        setIsEditModalOpen(false);
      } else {
        setSystemMessage({ type: "error", text: resData.message || "Cập nhật tin thất bại" });
      }
    } catch (error) {
      setSystemMessage({ type: "error", text: "Không thể kết nối với máy chủ Backend" });
    }
  };

  const handleTriggerDelete = (item, e) => {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    setSystemMessage({ type: "", text: "" });
    setNewsToDelete(item);
    setIsConfirmDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!newsToDelete) return;
    const token = localStorage.getItem("userToken");
    if (!token) {
      setSystemMessage({ type: "error", text: "Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại" });
      setIsConfirmDeleteOpen(false);
      return;
    }
    try {
      const response = await fetch(`http://localhost:5000/api/urgent-news/${newsToDelete._id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const resData = await response.json();
      if (response.ok) {
        setListData((prev) => prev.filter((el) => el._id !== newsToDelete._id));
        setSystemMessage({ type: "success", text: resData.message || "Xóa tin khẩn cấp thành công" });
        setIsConfirmDeleteOpen(false);
        setNewsToDelete(null);
      } else {
        setSystemMessage({ type: "error", text: resData.message || "Xóa tin thất bại" });
        setIsConfirmDeleteOpen(false);
      }
    } catch (error) {
      setSystemMessage({ type: "error", text: "Không thể kết nối với máy chủ Backend" });
      setIsConfirmDeleteOpen(false);
    }
  };

  return (
    <HospitalLayout onOpenCreateModal={handleOpenCreateModal}>
      <div className="w-full flex justify-center mb-[40px]">
        <img src={posterhienmau} alt="Description" className="w-full h-[450px] object-fill rounded-lg shadow" />
      </div>

      {systemMessage.text && !isCreateModalOpen && !isEditModalOpen && (
        <div className={`p-[16px] rounded-[8px] flex items-center gap-[12px] mb-[24px] border text-[14px] max-w-[1600px] mx-auto transition-all ${
          systemMessage.type === "error" ? "bg-red-50 text-red-700 border-red-200" : "bg-emerald-50 text-emerald-700 border-emerald-200"
        }`}>
          <FontAwesomeIcon icon={systemMessage.type === "error" ? faExclamationTriangle : faCheckCircle} className="text-[16px]" />
          <p className="font-semibold">{systemMessage.text}</p>
        </div>
      )}

      <div className="flex justify-between items-center mt-[32px] mb-[32px] max-w-[1600px] mx-auto">
        <h1 className="text-3xl font-bold text-gray-950 uppercase flex items-center gap-[12px]">
          <FontAwesomeIcon icon={faBullhorn} className="text-red-600" />
          Tin Khẩn Cấp 
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[24px] max-w-[1600px] mx-auto">
        {listData.map((item) => {
          const maTinStr = item.MaTin || item.maTin;
          const tenBVStr = item.TenBenhVien || item.tenBV;
          const nhomMauStr = item.NhomMau || item.nhomMau;
          const soLuongNum = item.SoLuong !== undefined ? item.SoLuong : (parseInt(item.soLuong) || 0);
          const slDaNhanNum = item.SoLuongDaNhan !== undefined ? item.SoLuongDaNhan : (parseInt(item.slDaNhan) || 0);
          const mucDichStr = item.MucDich || item.mucDich;
          const ngayDangStr = formatDate(item.NgayDang || item.ngayDang);
          const gioDangStr = item.GioDang || item.gioDang || "00:00";
          const isFullyReceived = slDaNhanNum >= soLuongNum && soLuongNum > 0;

          return (
            <div key={item._id} className="bg-white rounded-[12px] border border-gray-200 p-[24px] shadow-sm flex flex-col justify-between hover:shadow-md transition h-[320px] overflow-hidden">
              <div>
                <div className="flex justify-between items-start border-b border-gray-100 pb-[12px] mb-[16px]">
                  <div className="max-w-[75%] break-words">
                    <span className="text-[12px] font-bold text-gray-400 block">{maTinStr}</span>
                    <h3 className="text-[17px] font-bold text-gray-900 uppercase line-clamp-2">{tenBVStr}</h3>
                  </div>
                  <div className="flex flex-col items-end gap-[4px] flex-shrink-0">
                    <span className="bg-red-100 text-red-700 font-bold px-[10px] py-[4px] rounded-[6px] text-[14px]">{nhomMauStr}</span>
                    {isFullyReceived && <span className="text-[11px] bg-emerald-100 text-emerald-800 px-[6px] py-[2px] rounded font-bold">Đạt số lượng</span>}
                  </div>
                </div>
                <div className="space-y-[6px] text-[14px] text-gray-600 break-words">
                  <p><span className="font-semibold text-gray-800">Cần:</span> {soLuongNum} đơn vị</p>
                  <p><span className="font-semibold text-gray-800">Đã nhận:</span> {slDaNhanNum} đơn vị</p>
                  <p className="line-clamp-2"><span className="font-semibold text-gray-800">Mục đích:</span> {mucDichStr}</p>
                  <p className="flex items-center gap-[4px] text-[12px] text-gray-400 pt-[4px]">
                    <FontAwesomeIcon icon={faClock} /> Ngày đăng: {ngayDangStr} | {gioDangStr}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-[12px] pt-[12px] border-t border-gray-100">
                <button onClick={(e) => handleOpenEditModal(item, e)} className="flex items-center justify-center gap-[6px] text-gray-700 border border-gray-300 hover:bg-gray-50 font-bold py-[8px] rounded-[6px] text-[13px] transition cursor-pointer">CẬP NHẬT</button>
                <button onClick={(e) => handleTriggerDelete(item, e)} className="flex items-center justify-center gap-[6px] text-red-600 border border-red-200 hover:bg-red-50 font-bold py-[8px] rounded-[6px] text-[13px] transition cursor-pointer">XÓA TIN</button>
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL ĐĂNG TIN KHẨN CẤP */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-[16px]">
          <div className="bg-white rounded-[16px] w-full max-w-[600px] p-[32px] shadow-2xl overflow-y-auto max-h-[90vh] border border-gray-300">
            <div className="text-center border-b border-gray-200 pb-[16px] mb-[20px]">
              <h2 className="text-[22px] font-bold text-gray-900 uppercase">Đăng tin khẩn cấp</h2>
            </div>
            <form onSubmit={handleCreatePost} className="space-y-[16px]">
              {systemMessage.text && systemMessage.type === "error" && (
                <div className="rounded-[8px] border border-red-200 bg-red-50 p-[12px] text-[13px] text-red-700 flex items-start gap-[8px]">
                  <FontAwesomeIcon icon={faExclamationTriangle} className="mt-[2px]" />
                  <p className="font-semibold">{systemMessage.text}</p>
                </div>
              )}
              <div>
                <label className="block text-[14px] font-bold text-gray-700 mb-[6px]">Tên bệnh viện:</label>
                <input type="text" maxLength={50} value={formData.tenBV} readOnly className="w-full border border-gray-300 rounded-[8px] p-[10px] text-[14px] text-gray-900 bg-gray-50" placeholder="Tên bệnh viện từ hồ sơ đối tác" />
              </div>
              <div className="grid grid-cols-2 gap-[16px]">
                <div>
                  <label className="block text-[14px] font-bold text-gray-700 mb-[6px]">Số điện thoại bệnh viện:</label>
                  <input type="text" maxLength={11} value={formData.sdt} onChange={(e) => setFormData({...formData, sdt: e.target.value.replace(/[^0-9]/g, "")})} className="w-full border border-gray-300 rounded-[8px] p-[10px] text-[14px] text-gray-900 bg-gray-50" placeholder="Từ 10 đến 11 chữ số..." />
                </div>
                <div>
                  <label className="block text-[14px] font-bold text-gray-700 mb-[6px]">Email:</label>
                  <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full border border-gray-300 rounded-[8px] p-[10px] text-[14px] text-gray-900 bg-gray-50" placeholder="Ví dụ: hospital@domain.com" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-[16px]">
                <div>
                  <label className="block text-[14px] font-bold text-gray-700 mb-[6px]">Nhóm máu:</label>
                  <select value={formData.nhomMau} onChange={(e) => setFormData({...formData, nhomMau: e.target.value})} className="w-full border border-gray-300 rounded-[8px] p-[10px] text-[14px] bg-white text-gray-900">
                    <option value="A+">A+</option><option value="A-">A-</option><option value="B+">B+</option><option value="B-">B-</option>
                    <option value="AB+">AB+</option><option value="AB-">AB-</option><option value="O+">O+</option><option value="O-">O-</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[14px] font-bold text-gray-700 mb-[6px]">Số lượng đơn vị cần:</label>
                  <input type="number" value={formData.soLuong} onChange={(e) => setFormData({...formData, soLuong: e.target.value})} className="w-full border border-gray-300 rounded-[8px] p-[10px] text-[14px] text-gray-900" placeholder="Ví dụ: 3" />
                </div>
              </div>
              <div>
                <label className="block text-[14px] font-bold text-gray-700 mb-[6px]">Mục đích:</label>
                <textarea rows="3" maxLength={200} value={formData.mucDich} onChange={(e) => setFormData({...formData, mucDich: e.target.value})} className="w-full border border-gray-300 rounded-[8px] p-[10px] text-[14px] text-gray-900" placeholder="Lý do hoặc tình trạng khẩn cấp của bệnh nhân (≤ 200 ký tự)..."></textarea>
              </div>
              <div className="flex justify-end gap-[12px] pt-[16px] border-t border-gray-100">
                <button type="button" onClick={() => setIsCreateModalOpen(false)} className="px-[18px] py-[10px] rounded-[8px] border border-gray-300 hover:bg-gray-50 text-[14px] font-medium cursor-pointer">HỦY BỎ</button>
                <button type="submit" className="px-[24px] py-[10px] rounded-[8px] bg-red-600 hover:bg-red-700 text-white font-bold text-[14px] uppercase shadow-sm cursor-pointer">ĐĂNG TIN</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL CẬP NHẬT TIN KHẨN CẤP */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-[16px]">
          <div className="bg-white rounded-[16px] w-full max-w-[600px] p-[32px] shadow-2xl overflow-y-auto max-h-[90vh] border border-gray-300">
            <div className="text-center border-b border-gray-200 pb-[16px] mb-[20px]">
              <span className="text-[13px] font-bold text-red-600 block mb-[2px]">Mã tin sửa: {formData.maTin}</span>
              <h2 className="text-[22px] font-bold text-gray-900 uppercase">Cập nhật thông tin khẩn cấp</h2>
            </div>
            <form onSubmit={handleUpdatePost} className="space-y-[16px]">
              {systemMessage.text && systemMessage.type === "error" && (
                <div className="rounded-[8px] border border-red-200 bg-red-50 p-[12px] text-[13px] text-red-700 flex items-start gap-[8px]">
                  <FontAwesomeIcon icon={faExclamationTriangle} className="mt-[2px]" />
                  <p className="font-semibold">{systemMessage.text}</p>
                </div>
              )}
              <div>
                <label className="block text-[14px] font-bold text-gray-700 mb-[6px]">Tên bệnh viện:</label>
                <input type="text" maxLength={50} value={formData.tenBV} onChange={(e) => setFormData({...formData, tenBV: e.target.value})} className="w-full border border-gray-300 rounded-[8px] p-[10px] text-[14px] text-gray-900" />
              </div>
              <div className="grid grid-cols-2 gap-[16px]">
                <div><label className="block text-[14px] font-bold text-gray-700 mb-[6px]">Số điện thoại bệnh viện:</label>
                  <input type="text" maxLength={11} value={formData.sdt} onChange={(e) => setFormData({...formData, sdt: e.target.value.replace(/[^0-9]/g, "")})} className="w-full border border-gray-300 rounded-[8px] p-[10px] text-[14px] text-gray-900" />
                </div>
                <div><label className="block text-[14px] font-bold text-gray-700 mb-[6px]">Email:</label>
                  <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full border border-gray-300 rounded-[8px] p-[10px] text-[14px] text-gray-900" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-[16px]">
                <div><label className="block text-[14px] font-bold text-gray-700 mb-[6px]">Nhóm máu:</label>
                  <select value={formData.nhomMau} onChange={(e) => setFormData({...formData, nhomMau: e.target.value})} className="w-full border border-gray-300 rounded-[8px] p-[10px] text-[14px] bg-white text-gray-900">
                    <option value="A+">A+</option><option value="A-">A-</option><option value="B+">B+</option><option value="B-">B-</option>
                    <option value="AB+">AB+</option><option value="AB-">AB-</option><option value="O+">O+</option><option value="O-">O-</option>
                  </select>
                </div>
                <div><label className="block text-[14px] font-bold text-gray-700 mb-[6px]">Số lượng:</label>
                  <input type="number" value={formData.soLuong} onChange={(e) => setFormData({...formData, soLuong: e.target.value})} className="w-full border border-gray-300 rounded-[8px] p-[10px] text-[14px] text-gray-900" />
                </div>
              </div>
              <div><label className="block text-[14px] font-bold text-gray-700 mb-[6px]">Mục đích:</label>
                <textarea rows="3" maxLength={200} value={formData.mucDich} onChange={(e) => setFormData({...formData, mucDich: e.target.value})} className="w-full border border-gray-300 rounded-[8px] p-[10px] text-[14px] text-gray-900"></textarea>
              </div>
              <div className="flex justify-end gap-[12px] pt-[16px] border-t border-gray-100">
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-[18px] py-[10px] rounded-[8px] border border-gray-300 hover:bg-gray-50 text-[14px] font-medium cursor-pointer">HỦY BỎ</button>
                <button type="submit" className="px-[24px] py-[10px] rounded-[8px] bg-gray-950 hover:bg-gray-900 text-white font-bold text-[14px] uppercase shadow-sm cursor-pointer">XÁC NHẬN CẬP NHẬT</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL XÁC NHẬN XÓA */}
      {isConfirmDeleteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-[16px]">
          <div className="bg-white rounded-[12px] w-full max-w-[450px] p-[28px] shadow-2xl text-center border border-gray-100">
            <div className="text-red-600 mb-[16px]"><FontAwesomeIcon icon={faExclamationTriangle} className="text-[44px]" /></div>
            <h3 className="text-[18px] font-bold text-gray-950 mb-[8px]">Xác nhận xóa dữ liệu?</h3>
            <p className="text-[14px] text-gray-600 mb-[24px]">
              Bạn có chắc chắn muốn xóa gỡ bỏ hoàn toàn mã tin <span className="font-bold text-red-600">{newsToDelete?.MaTin || newsToDelete?.maTin}</span> ra khỏi hệ thống công cộng không?
            </p>
            <div className="flex items-center gap-[12px]">
              <button type="button" onClick={() => setIsConfirmDeleteOpen(false)} className="w-full px-[16px] py-[10px] rounded-[6px] border border-gray-300 hover:bg-gray-50 text-[14px] font-semibold text-gray-700 transition cursor-pointer">HỦY BỎ</button>
              <button type="button" onClick={handleConfirmDelete} className="w-full px-[16px] py-[10px] rounded-[6px] bg-red-600 hover:bg-red-700 text-white font-bold text-[14px] uppercase shadow-sm cursor-pointer">XÁC NHẬN XÓA</button>
            </div>
          </div>
        </div>
      )}
    </HospitalLayout>
  );
};

export default HospitalPage;