import Homepage from './Pages/Publics/Homepage';
import Test from './Pages/test';
import './App.css';

function App() {
  const currentPath = window.location.pathname;
  let PageComponent;
 if (currentPath.toLowerCase() === '/test') {
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
