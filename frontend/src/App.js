//public
import Homepage from './Pages/Publics/Homepage';
import Cus_Login from './Pages/Publics/Cus_Login';
import Cus_Register from './Pages/Publics/Cus_Register';
//customer
import Cus_Profile from './Pages/Customer/Cus_Profile'; // chưa sử dụng đc
//bệnh viện
import Hospital_Login from './Pages/Hospital/Hospital_Login';
import Hospital_Register from './Pages/Hospital/Hospital_Register';
import Hospital_Profile from './Pages/Hospital/Hospital_Profile'; //chưa sử dụng đc
import SearchDonorMatch from './Pages/Hospital/SearchDonorMatch'; //chưa sử dụng đc
//admin
import AdminDashboard from './Pages/Admin/AdminDashboard'; //chưa sử dụng đc
//verify,search donor,search recipient,change password chưa có giao diện bệnh viện viện và chưa có logic đăng nhập qua các tài khoản nên xin phép bổ sung sau
import './App.css';

function App() {
  const currentPath = window.location.pathname;
  let PageComponent;
  if (currentPath.toLowerCase() === '/cus_profile') {
    PageComponent = Cus_Profile;
  }
  else if (currentPath.toLowerCase() === '/login' || currentPath.toLowerCase() === '/cus_login') { //khớp
    PageComponent = Cus_Login;
  }
  else if (currentPath.toLowerCase() === '/register' || currentPath.toLowerCase() === '/cus_register') { //khớp
    PageComponent = Cus_Register;
  }
  else if (currentPath.toLowerCase() === '/partner-login') { //khớp
    PageComponent = Hospital_Login;
  }
  else if (currentPath.toLowerCase() === '/partner-register') { //khớp
    PageComponent = Hospital_Register;
  }
  else {
    PageComponent = Homepage; // Mặc định là trang chủ
  }


  return (
      <PageComponent />
  );
}

export default App;
