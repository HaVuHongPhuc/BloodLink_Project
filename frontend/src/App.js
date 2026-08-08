import React, { useState } from 'react';
//public
import Homepage from './Pages/Publics/Homepage';
import Cus_Login from './Pages/Publics/Cus_Login';
import Cus_Register from './Pages/Publics/Cus_Register';
//customer
import Cus_Profile from './Pages/Customer/Cus_Profile';
import RegisterDonate from './Pages/Customer/RegisterDonate';
import RegisterReceive from './Pages/Customer/RegisterReceive';
//bệnh viện
import HospitalDashboard from './Pages/Hospital/HospitalDashboard';
import Hospital_Login from './Pages/Hospital/Hospital_Login';
import Hospital_Register from './Pages/Hospital/Hospital_Register';
import Hospital_Profile from './Pages/Hospital/Hospital_Profile';
import HospitalPage from './Pages/Hospital/HospitalPage';
import HospitalList from './Pages/Publics/HospitalList';
import ListTinKhanCap from './Pages/Publics/ListTinKhanCap';
import SearchDonorMatch from './Pages/Hospital/SearchDonorMatch';
import HospitalInventory from './Pages/Hospital/HospitalInventory';
import HospitalOrders from './Pages/Hospital/HospitalOrders';
//admin
import AdminDashboard from './Pages/Admin/AdminDashboard';
import './App.css';

function App() {
  const currentPath = window.location.pathname.toLowerCase(); 
  const [emergencyList, setEmergencyList] = useState([]);
  let PageComponent;

  if (currentPath === '/cus_profile' || currentPath === '/profile') {
    PageComponent = Cus_Profile;
  }
  else if (currentPath === '/login' || currentPath === '/cus_login') {
    PageComponent = Cus_Login;
  }
  else if (currentPath === '/register' || currentPath === '/cus_register') {
    PageComponent = Cus_Register;
  }
  else if (currentPath === '/partner-login' || currentPath === '/hospital-login') {
    PageComponent = Hospital_Login;
  }
  else if (currentPath === '/partner-register' || currentPath === '/hospital-register') {
    PageComponent = Hospital_Register;
  }
  else if (currentPath === '/hospitals') {
    PageComponent = HospitalList;
  }
  else if (currentPath === '/listtinkhancap') {
    PageComponent = ListTinKhanCap;
  }
  else if (currentPath === '/hospital') {
    PageComponent = () => (
      <HospitalPage
        emergencyList={emergencyList}
        setEmergencyList={setEmergencyList}/>
    );
  }
  else if (currentPath === '/admin' || currentPath === '/admindashboard') {
    PageComponent = AdminDashboard;
  }
  else if (currentPath === '/hospital-profile' || currentPath === '/hospital_profile') {
    PageComponent = Hospital_Profile;
  }
  else if (currentPath === '/search-donor' || currentPath === '/searchdonor') {
    PageComponent = SearchDonorMatch;
  }
  else if (currentPath === '/register-donate' || currentPath === '/registerdonate') {
    PageComponent = RegisterDonate;
  }
  else if (currentPath === '/register-receive' || currentPath === '/registerreceive') {
    PageComponent = RegisterReceive;
  }
  else if (currentPath === '/hospital-dashboard' || currentPath === '/hospital_dashboard') {
  PageComponent = HospitalDashboard;
  }
  else if (currentPath === '/hospital/emergency') {
  PageComponent = HospitalPage; // hoặc import và dùng
  }
  else if (currentPath === '/hospital/inventory' || currentPath === '/hospital_inventory') {
    PageComponent = HospitalInventory;
  }
  else if (currentPath === '/hospital/orders' || currentPath === '/hospital_orders') {
    PageComponent = HospitalOrders;
  }
  else {
    PageComponent = Homepage; // Mặc định là trang chủ
  }
  

  return <PageComponent/>;
}

export default App;
