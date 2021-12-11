import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setHeaderTitle } from '../actions/HeaderTitleAction';
import * as Yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import ERRORS from '../constants/ErrorCode';
import { useForm } from 'react-hook-form';
import { Redirect } from 'react-router';
import { hideLoader, showLoader } from '../actions/LoaderAction';
import { login } from '../actions/AuthAction';
import { showError } from '../helpers/showToast';
import _ from 'lodash';
import { EyeIcon, EyeOffIcon } from '@heroicons/react/solid';

const Signin = (props) => {
  const { isLoggedIn } = useSelector((state) => state.authReducer);
  const { message } = useSelector((state) => state.messageReducer);
  const dispatch = useDispatch();
  const [revealPassword, setRevealPassword] = useState(false);

  useEffect(() => {
    dispatch(setHeaderTitle('Sign In'));
  }, [dispatch]);

  const validationSchema = Yup.object().shape({
    username: Yup.string().required(ERRORS.ERR_USERNAME_NOT_BLANK).trim(),
    password: Yup.string().required(ERRORS.ERR_PASSWORD_NOT_BLANK).trim(),
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    watch,
  } = useForm({
    resolver: yupResolver(validationSchema),
  });

  const handleLogin = ({ username, password }) => {
    dispatch(showLoader());

    dispatch(login(username, password))
      .then(() => {
        const { from } = props.location.state || { from: { pathname: '/' } };
        props.history.push(from);
        props.history.go(0);
      })
      .catch((error) => {
        if (error && !error.response) {
          showError('Error: Network Error');
        }

        dispatch(hideLoader());
      });
  };

  if (isLoggedIn) {
    return <Redirect to='/' />;
  }

  return (
    <div className='w-full flex justify-center'>
      <div className='inline-block w-full mt-20 max-w-md overflow-hidden text-left align-middle transition-all transform bg-white rounded-lg border border-gray-800'>
        <h3 className='text-lg font-bold leading-6 text-org border-b border-gray-800 py-5 px-10 bg-gray-100'>
          Welcome to Online Asset Management
        </h3>
        <div className='mx-10 my-5'>
          <form onSubmit={handleSubmit(handleLogin)}>
            {message && <p className='error-message text-sm'>{message}</p>}
            <div className='mb-0 grid-cols-3 inline-grid space-y-4 w-full lg:mr-16'>
              <div className='flex items-center'>
                <label htmlFor='username' className='block text-sm'>
                  Username <span className='text-red-600'>*</span>
                </label>
              </div>
              <div className='flex items-center col-span-2'>
                <div className='w-full'>
                  <input
                    className={errors.username && 'error-input'}
                    type='text'
                    name='username'
                    id='username'
                    {...register('username')}
                  />
                  <p className='error-message'>{errors.username?.message}</p>
                </div>
              </div>
              <div className='flex'>
                <label htmlFor='password' className='block text-sm'>
                  Password <span className='text-red-600'>*</span>
                </label>
              </div>
              <div className='flex items-center col-span-2'>
                <div className='w-full'>
                  <div className='relative'>
                    <input
                      className={errors.password && 'error-input'}
                      type={`${revealPassword ? 'text' : 'password'}`}
                      name='password'
                      id='password'
                      {...register('password')}
                    />
                    {!revealPassword ? (
                      <EyeIcon
                        className='h-5 w-5 mr-2 mt-1.5 cursor-pointer absolute top-0 right-0 text-gray-500'
                        onClick={() => setRevealPassword(true)}
                      />
                    ) : (
                      <EyeOffIcon
                        className='h-5 w-5 mr-2 mt-1.5 cursor-pointer absolute top-0 right-0 text-gray-500'
                        onClick={() => setRevealPassword(false)}
                      />
                    )}
                  </div>

                  <p className='error-message'>{errors.password?.message}</p>
                </div>
              </div>
            </div>
            <div className='mt-6 flex justify-end'>
              <button
                type='submit'
                className={`text-white p-2 rounded-md w-20 text-sm ${
                  !isDirty || _.isEmpty(watch()) || watch('username')?.trim() === '' || watch('password')?.trim() === ''
                    ? 'bg-gray-500 cursor-default'
                    : 'bg-org-light hover:bg-org focus:bg-org'
                }`}
                disabled={
                  !isDirty || _.isEmpty(watch()) || watch('username')?.trim() === '' || watch('password')?.trim() === ''
                }
              >
                Login
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Signin;
