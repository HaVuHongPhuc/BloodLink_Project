import Homepage from './Pages/Publics/Homepage';
import Cus_Profile from './Pages/Customer/Cus_Profile';
import './App.css';

function App() {
  const currentPath = window.location.pathname;
  let PageComponent;
  if (currentPath.toLowerCase() === '/Cus_Profile') {
    PageComponent = Cus_Profile;
  }
  else {
    PageComponent = Homepage; // Mặc định là trang chủ
  }


  return (
      <PageComponent />
  );
}

export default App;
