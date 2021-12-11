import React from 'react';
import { Route } from 'react-router-dom';
import Header from '../components/Header';

const LoginLayout = ({ children }) => (
  <div>
    <Header />
    <main className='mt-40 container max-w-7xl mx-auto px-6'>{children}</main>
  </div>
);

export const LoginLayoutRoute = ({ component: Component, ...rest }) => {
  return (
    <Route
      {...rest}
      render={(props) => (
        <LoginLayout>
          <Component {...props} />
        </LoginLayout>
      )}
    />
  );
};
