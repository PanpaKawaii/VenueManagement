import { useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/AuthContext/AuthContext.jsx';
import './NavigationBar.css';

export default function NavigationBar() {
  const { logout, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  console.log('NavigationBar', location.pathname);

  const menuItems = [
    // { name: 'CUSTOMER', icon: 'user', path: '/admin/user-management' },
    // { name: 'ORDER', icon: 'cart-shopping', path: '/admin/order-management' },
    // { name: 'TRANSACTION', icon: 'money-check-dollar', path: '/admin/transaction-management', },
    // { name: 'REVENUE', icon: 'dollar', path: '/admin/revenue-management', },
    { name: 'VENUE', icon: 'house-user', path: '/admin/venue-management' },
  ];

  useEffect(() => {
    if (!localStorage.getItem('user')) navigate('/');
  }, [user]);

  return (
    <>
      <div className={`navigation-bar-container`}>
        <Link to='/admin'>
          <div className='logo'>Xnova</div>
        </Link>
        <div className='items'>
          {menuItems.map((item, index) => (
            <div
              key={index}
              className={`item ${location.pathname.includes(item.path) ? 'located' : ''}`}
            >
              <Link className='link' to={`${item.path}`}>
                <i className={`fa-solid fa-${item.icon}`}></i>
                <span>{item.name}</span>
              </Link>
            </div>
          ))}
          <div className='item' onClick={() => logout()}>
            <div className='link'>
              <i className={`fa-solid fa-right-to-bracket`}></i>
              <span>LOG OUT</span>
            </div>
          </div>
        </div>
      </div>
      <Outlet />
    </>
  )
}
