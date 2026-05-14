import Homepage from './Web_Cus/Homepage';
import Test from './Web_Cus/Test';
import './App.css';

function App() {
  const currentPath = window.location.pathname;
  let PageComponent;
 if (currentPath.toLowerCase() === '/Test') {
    PageComponent = Test;
  }
  else {
    PageComponent = Homepage; // Mặc định là trang chủ
  }


  return (
      <PageComponent />
  );
}

export default App;
