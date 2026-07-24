import { useState } from 'react';
import Homepage from './Pages/Publics/Homepage';
import CusProfile from './Pages/Customer/Cus_Profile';
import HospitalPage from './Pages/Hospital/HospitalPage';
import HospitalList from './Pages/Publics/HospitalList';
import ListTinKhanCap from './Pages/Publics/ListTinKhanCap';
import './App.css';

function App() {
  // Lấy đường dẫn URL hiện tại để xử lý điều hướng (Routing thủ công)
  const currentPath = window.location.pathname;

  // =========================================================
  // STATE TẬP TRUNG (Nguồn dữ liệu duy nhất cho toàn bộ hệ thống)
  // Giúp đồng bộ dữ liệu real-time giữa HospitalPage và ListTinKhanCap
  // =========================================================
  const [emergencyList, setEmergencyList] = useState([
    { 
      id: "TKC001", 
      maTin: "TKC001", 
      maBV: "BVCR", 
      tenBV: "Bệnh viện Chợ Rẫy", 
      sdt: "02838554137", 
      email: "choray@bloodlink.vn", 
      nhomMau: "O+", 
      soLuong: "3 đơn vị", 
      mucDich: "Cấp cứu tai nạn giao thông nghiêm trọng", 
      ngayDang: "24/07/2026", 
      gioDang: "08:30", 
      slDaNhan: "1 đơn vị" 
    },
    { 
      id: "TKC002", 
      maTin: "TKC002", 
      maBV: "BVCR", 
      tenBV: "Bệnh viện Chợ Rẫy", 
      sdt: "02838554137", 
      email: "choray@bloodlink.vn", 
      nhomMau: "A-", 
      soLuong: "2 đơn vị", 
      mucDich: "Phẫu thuật tim cấp bách", 
      ngayDang: "24/07/2026", 
      gioDang: "09:15", 
      slDaNhan: "0 đơn vị" 
    },
  ]);

  // Biến chứa Component sẽ được render ra màn hình
  let PageComponent;

  // =========================================================
  // HỆ THỐNG PHÂN LUỒNG ĐIỀU HƯỚNG (ROUTING LOGIC)
  // =========================================================
  if (currentPath.toLowerCase() === '/cus_profile') {
    PageComponent = <CusProfile />;
  } 
  else if (currentPath.toLowerCase() === '/hospital') {
    // Trang quản lý của bệnh viện: cần cả danh sách và hàm cập nhật dữ liệu (Đăng, Sửa, Xóa)
    PageComponent = (
      <HospitalPage 
        emergencyList={emergencyList} 
        setEmergencyList={setEmergencyList} 
      />
    );
  } 
  else if (currentPath.toLowerCase() === '/hospitals') {
    // Trang danh sách bệnh viện hợp tác (UC12 / BM07)
    PageComponent = <HospitalList />;
  } 
  else if (currentPath.toLowerCase() === '/listtinkhancap') {
    // Trang danh sách tin khẩn cấp công cộng (UC17 / BM06): Chỉ cần truyền danh sách vào để đọc
    PageComponent = <ListTinKhanCap emergencyList={emergencyList} />;
  } 
  else {
    // Mặc định phản hồi về trang chủ hệ thống
    PageComponent = <Homepage />;
  }

  // Render component tương ứng ra giao diện
  return PageComponent;
}

export default App;