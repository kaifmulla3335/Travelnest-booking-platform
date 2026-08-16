import Navbar from '../components/navbar/Navbar';
import Footer from '../components/footer/Footer';
import { Outlet } from 'react-router-dom';
import ChatWidget from '../components/common/ChatWidget';

const MainLayout = () => (
  <div className="flex flex-col min-h-screen">
    <Navbar />
    <main className="flex-1">
      <Outlet />
      <ChatWidget />
    </main>
    <Footer />
  </div>
);

export default MainLayout;
