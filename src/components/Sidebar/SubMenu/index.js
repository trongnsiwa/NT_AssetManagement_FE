import React from 'react';
import { NavLink } from 'react-router-dom';

const SubMenu = ({ item, from }) => {
  return (
    <div className='bg-gray-100' style={{ marginBottom: '2px' }}>
      <NavLink
        exact={item.path === '/' ? true : false}
        activeStyle={{ color: 'white', backgroundColor: '#CF2338' }}
        className='flex items-center py-2 px-5 cursor-pointer hover:bg-org hover:text-white focus:outline-none'
        to={{
          pathname: item.path,
          state: {
            from,
          },
        }}
      >
        <span className='pl-1 font-bold text-base lg:text-lg whitespace-nowrap'>{item.title}</span>
      </NavLink>
    </div>
  );
};

export default SubMenu;
