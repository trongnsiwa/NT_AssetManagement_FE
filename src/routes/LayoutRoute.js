import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Route, Redirect, useHistory, useLocation } from 'react-router-dom';
import { logout } from '../actions/AuthAction';
import { hideModal, showDisabledUserModal } from '../actions/ModalAction';
import Header from '../components/Header';
import ModalForm from '../components/Modal/ModalForm';
import Sidebar from '../components/Sidebar';
import { ROLE } from '../constants/Role';
import { adminSidebar, staffSidebar } from '../data/sidebarData';
import useViewport from '../helpers/useViewport';
import { checkIfDisabledUser } from '../services/auth.service';

const StaffLayout = ({ children }) => {
  const { user: currentUser } = useSelector((state) => state.authReducer);

  const dispatch = useDispatch();
  const history = useHistory();

  const [openSidebar, setOpenSidebar] = useState(true);
  const { width } = useViewport();

  const logOut = () => {
    dispatch(logout());
    history.push('/');
  };

  if (currentUser) {
    checkIfDisabledUser(currentUser.code).then((res) => {
      if (res.data.data) {
        dispatch(showDisabledUserModal(logOut));
        return;
      }
    });
  }

  useEffect(() => {
    const breakpoint = 1024;
    if (width >= breakpoint) {
      setOpenSidebar(true);
    }
  }, [width]);

  return (
    <div className='overflow-hidden'>
      <Header />
      <div className='w-full'>
        <Sidebar items={staffSidebar} openSidebar={openSidebar} setOpenSidebar={setOpenSidebar} />
        <main className='flex h-screen overflow-x-auto pl-3 lg:pl-0  sm:justify-center xl:justify-start xl:ml-96'>
          <div className='relative h-full pt-10'>
            <button
              className={`p-0.5 border-2 border-gray-500 text-gray-500 rounded-md absolute hover:text-org hover:border-org top-0 mt-20 ${
                openSidebar ? 'hidden' : ''
              }`}
              onClick={() => setOpenSidebar((openSidebar) => !openSidebar)}
            >
              <svg
                stroke='currentColor'
                fill='none'
                strokeWidth='2'
                viewBox='0 0 24 24'
                strokeLinecap='round'
                strokeLinejoin='round'
                height='25'
                width='25'
                xmlns='http://www.w3.org/2000/svg'
              >
                <line x1='3' y1='12' x2='21' y2='12'></line>
                <line x1='3' y1='6' x2='21' y2='6'></line>
                <line x1='3' y1='18' x2='21' y2='18'></line>
              </svg>
            </button>
            <div className='pt-24'>
              {children}
              <ModalForm />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

const AdminLayout = ({ children }) => {
  const { user: currentUser } = useSelector((state) => state.authReducer);
  const history = useHistory();
  const pathname = useLocation().pathname;

  const dispatch = useDispatch();

  const [openSidebar, setOpenSidebar] = useState(true);
  const { width } = useViewport();

  const logOut = () => {
    dispatch(logout());
    dispatch(hideModal());
    history.push('/');
  };

  if (currentUser) {
    checkIfDisabledUser(currentUser.code).then((res) => {
      if (res.data.data) {
        dispatch(showDisabledUserModal(logOut));
        return;
      }
    });
  }

  useEffect(() => {
    const breakpoint = 1024;
    if (width >= breakpoint) {
      setOpenSidebar(true);
    }
  }, [width]);

  return (
    <div className='overflow-hidden'>
      <Header />
      <div className='w-full'>
        <Sidebar items={adminSidebar} openSidebar={openSidebar} setOpenSidebar={setOpenSidebar} />
        <main
          className={`flex h-screen overflow-x-auto w-auto ${
            pathname === '/return'
              ? 'pl-3 lg:pl-0 lg:justify-center xl:justify-start xl:ml-80 2xl:ml-96'
              : 'pl-3 lg:pl-0 lg:justify-center  xl:justify-start xl:ml-96'
          }`}
        >
          <div className='relative h-full pt-10'>
            <button
              className={`p-0.5 border-2 border-gray-500 text-gray-500 rounded-md absolute hover:text-org hover:border-org top-0 mt-20 ${
                openSidebar ? 'hidden' : ''
              }`}
              onClick={() => setOpenSidebar((openSidebar) => !openSidebar)}
            >
              <svg
                stroke='currentColor'
                fill='none'
                strokeWidth='2'
                viewBox='0 0 24 24'
                strokeLinecap='round'
                strokeLinejoin='round'
                height='25'
                width='25'
                xmlns='http://www.w3.org/2000/svg'
              >
                <line x1='3' y1='12' x2='21' y2='12'></line>
                <line x1='3' y1='6' x2='21' y2='6'></line>
                <line x1='3' y1='18' x2='21' y2='18'></line>
              </svg>
            </button>
            <div className='pt-24'>
              {children}
              <ModalForm />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

const LayoutRoute = ({ component: Component, currentUser, roles, ...rest }) => (
  <Route
    {...rest}
    render={(props) => {
      if (!currentUser) {
        return <Redirect to={{ pathname: '/signin', state: { from: props.location } }} />;
      }

      if (roles && roles.includes(ROLE.ADMIN) && currentUser.role?.name !== ROLE.ADMIN) {
        return <Redirect to='/' />;
      }

      if (currentUser && currentUser.role?.name === ROLE.ADMIN) {
        return (
          <AdminLayout>
            <Component {...props} />
          </AdminLayout>
        );
      }

      return (
        <StaffLayout>
          <Component {...props} />
        </StaffLayout>
      );
    }}
  />
);

export default LayoutRoute;
