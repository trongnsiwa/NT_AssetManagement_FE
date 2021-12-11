import { Menu, Transition } from '@headlessui/react';
import React, { Fragment, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { logout } from '../../actions/AuthAction';
import { hideLoader, showLoader } from '../../actions/LoaderAction';
import logo from '../../assets/Logo_lk.png';
import { useForm } from 'react-hook-form';
import ERRORS from '../../constants/ErrorCode';
import { hideModal, showDisabledUserModal, showModal } from '../../actions/ModalAction';
import { ChevronDownIcon, EyeIcon, EyeOffIcon } from '@heroicons/react/solid';
import { changePassword, changePasswordForStaff } from '../../services/user.service';
import { setMessage, clearMessage } from '../../actions/MessageAction';
import * as Yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { checkIfDisabledUser } from '../../services/auth.service';
import { ROLE } from '../../constants/Role';

const Header = () => {
  const [revealOldPassword, setRevealOldPassword] = useState(false);
  const [revealNewPassword, setRevealNewPassword] = useState(false);
  const [confirmRevealPassword, setConfirmRevealPassword] = useState(false);

  const { user: currentUser } = useSelector((state) => state.authReducer);
  const modal = useSelector((state) => state.modalReducer);
  const dispatch = useDispatch();
  const history = useHistory();

  const validationSchema = Yup.object().shape({
    oldPassword: Yup.string().required(ERRORS.ERR_NEW_PASSWORD_NOT_BLANK),
    newPassword: Yup.string().required(ERRORS.ERR_NEW_PASSWORD_NOT_BLANK),
    confirmPassword: Yup.string().test('match', ERRORS.ERR_PASSWORD_NOT_MATCH, function (confirm) {
      return confirm === this.parent.newPassword;
    }),
  });

  const { title } = useSelector((state) => state.headerTitleReducer);
  const { message } = useSelector((state) => state.messageReducer);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
    watch,
  } = useForm({
    mode: 'all',
    resolver: yupResolver(validationSchema),
  });

  const handleChangePassword = ({ oldPassword, newPassword }) => {
    if (currentUser) {
      checkIfDisabledUser(currentUser.code).then((res) => {
        if (res.data.data) {
          dispatch(showDisabledUserModal(logOut));
          return;
        } else {
          dispatch(showLoader());

          if (currentUser.role.name === ROLE.ADMIN) {
            changePassword(currentUser.code, oldPassword, newPassword)
              .then((res) => {
                dispatch(hideLoader());
                dispatch(showModal('Change password', 'CHANGESUCCESS', changePasswordSuccessful, true, reset));
              })
              .catch((error) => {
                const code =
                  (error.response && error.response.data && error.response.data.message) ||
                  error.message ||
                  error.toString();
                dispatch(setMessage(ERRORS[code]));
                dispatch(hideLoader());
              });
          } else {
            changePasswordForStaff(currentUser.code, oldPassword, newPassword)
              .then((res) => {
                dispatch(hideLoader());
                dispatch(showModal('Change password', 'CHANGESUCCESS', changePasswordSuccessful, true, reset));
              })
              .catch((error) => {
                const code =
                  (error.response && error.response.data && error.response.data.message) ||
                  error.message ||
                  error.toString();
                dispatch(setMessage(ERRORS[code]));
                dispatch(hideLoader());
              });
          }
        }
      });
    }
  };

  const changePasswordSuccessful = (
    <>
      <div>
        <p>Your password has been changed successfully</p>
      </div>

      <div className='mt-6 flex justify-end'>
        <button
          type='button'
          className='mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm p-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 sm:mt-0 sm:ml-3 sm:w-auto'
          onClick={() => dispatch(hideModal())}
        >
          Cancel
        </button>
      </div>
    </>
  );

  //eslint-disable-next-line react-hooks/exhaustive-deps
  const changePasswordForm = (
    <>
      <form onSubmit={handleSubmit(handleChangePassword)}>
        <div className='mb-0 grid-cols-3 inline-grid space-y-4 w-full lg:mr-16'>
          <div className='flex items-center'>
            <label htmlFor='oldPassword' className='block'>
              Old password
            </label>
          </div>
          <div className='flex items-center col-span-2'>
            <div className='w-full'>
              <div className='relative'>
                <input
                  className={message && 'error-input'}
                  type={`${revealOldPassword ? 'text' : 'password'}`}
                  name='oldPassword'
                  id='oldPassword'
                  {...register('oldPassword')}
                />
                {!revealOldPassword ? (
                  <EyeIcon
                    className='h-5 w-5 mr-2 mt-1.5 cursor-pointer absolute top-0 right-0 text-gray-500'
                    onClick={() => setRevealOldPassword(true)}
                  />
                ) : (
                  <EyeOffIcon
                    className='h-5 w-5 mr-2 mt-1.5 cursor-pointer absolute top-0 right-0 text-gray-500'
                    onClick={() => setRevealOldPassword(false)}
                  />
                )}
              </div>
              {message && <p className='error-message text-sm'>{message}</p>}
            </div>
          </div>
          <div className='flex'>
            <label htmlFor='newPassword' className='block'>
              New password
            </label>
          </div>
          <div className='flex items-center col-span-2'>
            <div className='w-full'>
              <div className='relative'>
                <input
                  type={`${revealNewPassword ? 'text' : 'password'}`}
                  name='newPassword'
                  id='newPassword'
                  {...register('newPassword')}
                />
                {!revealNewPassword ? (
                  <EyeIcon
                    className='h-5 w-5 mr-2 mt-1.5 cursor-pointer absolute top-0 right-0 text-gray-500'
                    onClick={() => setRevealNewPassword(true)}
                  />
                ) : (
                  <EyeOffIcon
                    className='h-5 w-5 mr-2 mt-1.5 cursor-pointer absolute top-0 right-0 text-gray-500'
                    onClick={() => setRevealNewPassword(false)}
                  />
                )}
              </div>
            </div>
          </div>
          <div className='flex'>
            <label htmlFor='newPassword' className='block'>
              Confirm password
            </label>
          </div>
          <div className='flex items-center col-span-2'>
            <div className='w-full'>
              <div className='relative'>
                <input
                  className={errors.confirmPassword && 'error-input'}
                  type={`${confirmRevealPassword ? 'text' : 'password'}`}
                  name='confirmPassword'
                  id='confirmPassword'
                  {...register('confirmPassword')}
                />
                {!confirmRevealPassword ? (
                  <EyeIcon
                    className='h-5 w-5 mr-2 mt-1.5 cursor-pointer absolute top-0 right-0 text-gray-500'
                    onClick={() => setConfirmRevealPassword(true)}
                  />
                ) : (
                  <EyeOffIcon
                    className='h-5 w-5 mr-2 mt-1.5 cursor-pointer absolute top-0 right-0 text-gray-500'
                    onClick={() => setConfirmRevealPassword(false)}
                  />
                )}
              </div>
              <p className='error-message'>{errors.confirmPassword?.message}</p>
            </div>
          </div>
        </div>
        <div className='mt-6 flex justify-end'>
          <button
            type='submit'
            className={`rounded-md border border-transparent shadow-sm p-2 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 sm:w-auto text-white ${
              !isDirty ||
              watch('oldPassword')?.trim() === '' ||
              watch('newPassword')?.trim() === '' ||
              watch('confirmPassword')?.trim() === ''
                ? 'opacity-80 cursor-default bg-gray-500'
                : 'bg-org-light hover:bg-red-700  focus:ring-red-500'
            }`}
            disabled={
              !isDirty ||
              watch('oldPassword')?.trim() === '' ||
              watch('newPassword')?.trim() === '' ||
              watch('confirmPassword')?.trim() === ''
            }
          >
            Save
          </button>
          <button
            type='button'
            className='mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm'
            onClick={() => {
              dispatch(clearMessage());
              dispatch(hideModal());
            }}
          >
            Cancel
          </button>
        </div>
      </form>
    </>
  );

  useEffect(() => {
    if (modal?.isOpen && modal?.name === 'CHANGEFORM') {
      dispatch(showModal('Change password', 'CHANGEFORM', changePasswordForm, false, reset));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    modal?.isOpen,
    message,
    errors.oldPassword,
    errors.newPassword,
    errors.confirmPassword,
    revealOldPassword,
    revealNewPassword,
    confirmRevealPassword,
  ]);

  const logOut = () => {
    dispatch(logout());
    dispatch(hideModal());
    history.push('/signin');
    history.go(0);
  };

  const confirmLogout = (
    <>
      <div>
        <p>Do you want to log out?</p>
      </div>

      <div className='mt-6'>
        <button
          type='button'
          className='w-full inline-flex justify-center rounded-md border border-transparent shadow-sm font-semibold p-2 bg-red-600 text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:w-auto'
          onClick={logOut}
        >
          Log out
        </button>
        <button
          type='button'
          className='mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm p-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 sm:mt-0 sm:ml-3 sm:w-auto'
          onClick={() => dispatch(hideModal())}
        >
          Cancel
        </button>
      </div>
    </>
  );

  return (
    <div
      className='fixed bg-org w-full top-0 h-14 xl:h-16'
      style={{ boxShadow: '0px 0px 5px rgb(0 0 0 / 40%)', zIndex: '100' }}
    >
      <div className='px-1 sm:px-10 xl:px-16'>
        <div className={`flex justify-between items-center h-14`}>
          {!currentUser ? (
            <div className='flex justify-start items-center'>
              <img src={logo} alt='OAM' className='h-10 w-10 mr-3 mt-1 lg:mt-2' />
              <span className='text-white font-bold text-lg'>Online Asset Mangement</span>
            </div>
          ) : (
            <>
              <div className='flex justify-start'>
                <span className='text-white font-bold text-lg'>{title}</span>
              </div>
              <div className='flex items-center justify-end md:flex-1 lg:w-0'>
                <div className='text-right'>
                  <Menu as='div' className='relative inline-block text-left'>
                    <div>
                      <Menu.Button>
                        <div className='inline-flex -space-x-1 overflow-hidden justify-center items-center'>
                          <p className='pl-4 font-bold text-white text-base flex items-center'>
                            {currentUser.fullname} <ChevronDownIcon className='h-6 w-6 text-white' />
                          </p>
                        </div>
                      </Menu.Button>
                    </div>
                    <Transition
                      as={Fragment}
                      enter='transition ease-out duration-100'
                      enterFrom='transform opacity-0 scale-95'
                      enterTo='transform opacity-100 scale-100'
                      leave='transition ease-in duration-75'
                      leaveFrom='transform opacity-100 scale-100'
                      leaveTo='transform opacity-0 scale-95'
                    >
                      <Menu.Items className='absolute right-0 w-56 mt-2 origin-top-right bg-white divide-y divide-gray-100 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none'>
                        <div className='px-1 py-1'>
                          <Menu.Item>
                            {({ active }) => (
                              <div
                                className={`${
                                  active ? 'bg-org' : 'text-gray-900'
                                } group flex rounded-md items-center w-full px-2 py-2 text-sm cursor-pointer`}
                                onClick={() => {
                                  reset();
                                  dispatch(showModal('Change password', 'CHANGEFORM', changePasswordForm, true, reset));
                                }}
                              >
                                <svg
                                  xmlns='http://www.w3.org/2000/svg'
                                  className={`h-6 w-6 ${active ? 'text-white' : ''}`}
                                  fill='none'
                                  viewBox='0 0 24 24'
                                  stroke='currentColor'
                                >
                                  <path
                                    strokeLinecap='round'
                                    strokeLinejoin='round'
                                    strokeWidth={2}
                                    d='M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z'
                                  />
                                </svg>
                                <div className='ml-2'>
                                  <p className={`text-sm font-medium ${active ? 'text-white' : ''}`}>Change Password</p>
                                </div>
                              </div>
                            )}
                          </Menu.Item>
                        </div>
                        <div className='px-1 py-1'>
                          <Menu.Item>
                            {({ active }) => (
                              <div
                                className={`${
                                  active ? 'bg-org' : 'text-gray-900'
                                } group flex rounded-md items-center w-full px-2 py-2 text-sm cursor-pointer`}
                                onClick={() => {
                                  dispatch(showModal('Are you sure?', 'LOGOUT', confirmLogout, true, null));
                                }}
                              >
                                <svg
                                  xmlns='http://www.w3.org/2000/svg'
                                  className={`h-5 w-5 ${active ? 'text-white' : ''}`}
                                  fill='none'
                                  viewBox='0 0 24 24'
                                  stroke='currentColor'
                                >
                                  <path
                                    strokeLinecap='round'
                                    strokeLinejoin='round'
                                    strokeWidth={2}
                                    d='M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1'
                                  />
                                </svg>
                                <div className='ml-2'>
                                  <p className={`text-sm font-medium ${active ? 'text-white' : ''}`}>Log out</p>
                                </div>
                              </div>
                            )}
                          </Menu.Item>
                        </div>
                      </Menu.Items>
                    </Transition>
                  </Menu>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Header;
