import { Transition } from '@headlessui/react';
import React from 'react';
import { useLocation } from 'react-router';
import Logo from '../../assets/Logo_lk@2x.png';
import SubMenu from './SubMenu';

const Sidebar = ({ items, openSidebar, setOpenSidebar }) => {
  const location = useLocation();

  return (
    <Transition
      appear={true}
      show={openSidebar}
      enter='transition-all duration-500'
      enterFrom='-ml-60'
      enterTo='ml-0'
      leave='transiton-all duration-500'
      leaveFrom='ml-0'
      leaveTo='-ml-60'
    >
      <div
        className='absolute pt-14  shadow-lg xl:shadow-none xl:border-0 xl:pt-0 xl:fixed h-full bg-white top-0 w-60 xl:w-80'
        style={{ zIndex: '99' }}
      >
        <button
          className='mt-5 mr-2 p-0.5 border-2 border-gray-500 text-gray-500 rounded-md absolute right-0 hover:text-org hover:border-org xl:hidden'
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
        <div className='pt-5 xl:pt-28 xl:ml-16'>
          <div className='w-60'>
            <div className='mb-8 ml-2 xl:ml-0'>
              <img src={Logo} alt='Logo' className='h-14 w-14 xl:h-16 xl:w-16 2xl:h-20 2xl:w-20' />
              <span className='font-bold text-base lg:text-lg text-org'>Online Asset Management</span>
            </div>
            <nav className='z-50'>
              {items && items.map((item, index) => <SubMenu item={item} key={index} from={location.pathname} />)}
            </nav>
          </div>
        </div>
      </div>
    </Transition>
  );
};

export default Sidebar;
