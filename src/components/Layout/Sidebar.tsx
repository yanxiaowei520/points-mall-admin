import { Layout, Menu } from 'antd';
import { AppstoreOutlined } from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import './Sidebar.css';

const { Sider } = Layout;

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      key: '/products',
      icon: <AppstoreOutlined />,
      label: '商品管理',
    },
  ];

  const selectedKey = location.pathname.startsWith('/products') ? '/products' : '';

  return (
    <Sider width={200} className="sidebar">
      <Menu
        mode="inline"
        selectedKeys={[selectedKey]}
        items={menuItems}
        onClick={({ key }) => navigate(key)}
        className="sidebar-menu"
      />
    </Sider>
  );
}

export default Sidebar;
