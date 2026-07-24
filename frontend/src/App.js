import { useState } from 'react';
import Homepage from './Pages/Publics/Homepage';
import CusProfile from './Pages/Customer/Cus_Profile';
import HospitalPage from './Pages/Hospital/HospitalPage';
import HospitalList from './Pages/Publics/HospitalList';
import ListTinKhanCap from './Pages/Publics/ListTinKhanCap';
import './App.css';

function App() {
  const currentPath = window.location.pathname;
  const [emergencyList, setEmergencyList] = useState([]);
  let PageComponent;

  if (currentPath.toLowerCase() === '/cus_profile') {
    PageComponent = <CusProfile />;
  } 
  else if (currentPath.toLowerCase() === '/hospital') {
    PageComponent = (
      <HospitalPage 
        emergencyList={emergencyList} 
        setEmergencyList={setEmergencyList} 
      />
    );
  } 
  else if (currentPath.toLowerCase() === '/hospitals') {
    
    PageComponent = <HospitalList />;
  } 
  else if (currentPath.toLowerCase() === '/listtinkhancap') {
    
    PageComponent = <ListTinKhanCap emergencyList={emergencyList} />;
  } 
  else {
    PageComponent = <Homepage />; // Mặc định là trang chủ 
  }

  return PageComponent;
}

export default App;