import { Layout } from 'antd';
import { ShoppingCartOutlined } from '@ant-design/icons';
import './TopNav.css';

const { Header } = Layout;

function TopNav() {
  return (
    <Header className="top-nav">
      <div className="top-nav-brand">
        <ShoppingCartOutlined style={{ fontSize: 22 }} />
        <span className="top-nav-title">积分商城</span>
      </div>
    </Header>
  );
}

export default TopNav;
