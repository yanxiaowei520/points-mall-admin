import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout, ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import TopNav from './components/Layout/TopNav';
import Sidebar from './components/Layout/Sidebar';
import ProductListPage from './pages/Product/ProductListPage';
import ProductFormPage from './pages/Product/ProductFormPage';

const { Content } = Layout;

function App() {
  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        token: {
          colorPrimary: '#1677ff',
          borderRadius: 6,
        },
      }}
    >
      <BrowserRouter>
        <Layout style={{ minHeight: '100vh' }}>
          <TopNav />
          <Layout>
            <Sidebar />
            <Content style={{ padding: 0, minHeight: 'calc(100vh - 56px)' }}>
              <Routes>
                <Route path="/" element={<Navigate to="/products" replace />} />
                <Route path="/products" element={<ProductListPage />} />
                <Route path="/products/add" element={<ProductFormPage />} />
                <Route path="/products/edit/:id" element={<ProductFormPage />} />
              </Routes>
            </Content>
          </Layout>
        </Layout>
      </BrowserRouter>
    </ConfigProvider>
  );
}

export default App;
