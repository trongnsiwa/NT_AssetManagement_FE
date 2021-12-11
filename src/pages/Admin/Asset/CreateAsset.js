import React, { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import { setHeaderTitle } from '../../../actions/HeaderTitleAction';
import Calendar from 'react-calendar';
import Tippy from '@tippyjs/react';
import dayjs from 'dayjs';
import { Link, useHistory } from 'react-router-dom';
import ERRORS from '../../../constants/ErrorCode';
import _ from 'lodash';
import { hideLoader, showLoader } from '../../../actions/LoaderAction';
import { clearMessage } from '../../../actions/MessageAction';
import { showStoreErrorMessage } from '../../../helpers/setErrorMessage';
import { ChevronDownIcon } from '@heroicons/react/solid';
import { createCategory, getListCategory } from '../../../services/category.service';
import { format } from '../../../helpers/formatString';
import { createNewAsset } from '../../../services/asset.service';
import { Transition } from '@headlessui/react';
import { checkIfDisabledUser } from '../../../services/auth.service';
import { logout } from '../../../actions/AuthAction';
import { hideModal, showDisabledUserModal } from '../../../actions/ModalAction';

const CreateAsset = (props) => {
  const [installedDate, setInstalledDate] = useState({
    visible: false,
    value: null,
  });

  const [categories, setCategories] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [clickedAddCategory, setClickedAddCategory] = useState(false);
  const [categoryName, setCategoryName] = useState('');
  const [categoryPrefix, setCategoryPrefix] = useState('');
  const [open, setOpen] = useState(false);
  const [categoryErrorMessage, setCategoryErrorMessage] = useState(null);

  const { user: currentUser } = useSelector((state) => state.authReducer);
  const { message } = useSelector((state) => state.messageReducer);
  const dispatch = useDispatch();
  const history = useHistory();

  const categoryWrapper = useRef();

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
    watch,
  } = useForm({
    mode: 'all',
    // resolver: yupResolver(validationSchema),
  });

  useEffect(() => {
    dispatch(setHeaderTitle('Manage Asset > Create New Asset'));
  }, [dispatch]);

  const logOut = () => {
    dispatch(logout());
    dispatch(hideModal());
    history.push('/signin');
    history.go(0);
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = () => {
    getListCategory().then((res) => {
      setCategories(res.data.data);
    });
  };

  const createAsset = ({ name, specification, state }) => {
    if (currentUser) {
      checkIfDisabledUser(currentUser.code).then((res) => {
        if (res.data.data) {
          dispatch(showDisabledUserModal(logOut));
          return;
        } else {
          var dateinstalledDate = null;
          dateinstalledDate = new Date(new Date(installedDate.value).setHours(0, 0, 0, 0));

          dateinstalledDate = new Date(
            dateinstalledDate.getTime() - dateinstalledDate.getTimezoneOffset() * 60000
          ).toJSON();

          dispatch(showLoader());

          const stateObject = {
            name: state,
          };

          createNewAsset(
            name.trim(),
            selectedCategory,
            specification.trim(),
            dateinstalledDate,
            currentUser.code,
            stateObject,
            currentUser.location.id
          )
            .then((res) => {
              dispatch(clearMessage());
              dispatch(hideLoader());
              reset();
              history.push({
                pathname: '/asset',
                state: {
                  from: props.location.pathname,
                  newEntity: res.data.data,
                },
              });
            })
            .catch((error) => {
              showStoreErrorMessage(error, name, dispatch);
            });
        }
      });
    }
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (categoryWrapper.current && !categoryWrapper.current.contains(event.target)) {
        setOpen(false);
        setClickedAddCategory(false);
        setCategoryErrorMessage(null);
        setCategoryName('');
        setCategoryPrefix('');
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [categoryWrapper]);

  const handleCreateCategory = () => {
    if (currentUser) {
      checkIfDisabledUser(currentUser.code).then((res) => {
        if (res.data.data) {
          dispatch(showDisabledUserModal(logOut));
          return;
        }
      });
    }

    dispatch(showLoader());

    createCategory(categoryName.trim(), categoryPrefix.trim())
      .then((res) => {
        if (!res.data.errorCode) {
          setSelectedCategory(res.data.data.name);
          setCategoryName('');
          setCategoryPrefix('');
          loadCategories();
          setCategoryErrorMessage(null);
        } else {
          if (Array.isArray(res.data.data)) {
            setCategoryErrorMessage(res.data.data.map((msg) => ERRORS[msg]));
          } else {
            setCategoryErrorMessage(res.data.data);
          }
        }

        dispatch(hideLoader());
      })
      .catch((error) => {
        const code =
          (error.response && error.response.data && error.response.data.message) || error.message || error.toString();

        var message = ERRORS[code];
        if (message) {
          message = format(message, categoryName);
        } else {
          message = code;
        }

        setCategoryErrorMessage(message);
        dispatch(hideLoader());
      });
  };

  return (
    <div className='container'>
      <h3 className='text-org font-bold text-base mb-5'>Create New Asset</h3>
      <div className='mt-6'>
        <form className='mb-0 grid-cols-3 inline-grid space-y-4 w-full lg:mr-16' onSubmit={handleSubmit(createAsset)}>
          {message && <p className='error-message col-span-3'>{message}</p>}
          <div className='flex items-center'>
            <label htmlFor='name' className='block'>
              Name
            </label>
          </div>
          <div className='flex items-center col-span-2'>
            <div className='input-field'>
              <input
                className={errors.name && 'error-input'}
                type='text'
                name='name'
                id='name'
                {...register('name')}
                defaultValue={''}
              />
              <p className='error-message'>{errors.name?.message}</p>
            </div>
          </div>
          <div className='flex items-center'>
            <label htmlFor='category' className='block'>
              Category
            </label>
          </div>
          <div className='flex items-center col-span-2'>
            <div className='input-field relative'>
              <div className='relative cursor-pointer w-full'>
                <input
                  type='text'
                  name='type'
                  className='border-2 w-full rounded-md focus:outline-none cursor-default'
                  readOnly={true}
                  value={selectedCategory ? selectedCategory : ''}
                  onClick={() => setOpen(true)}
                />
                <span className='absolute top-0 mt-2 right-0'>
                  <ChevronDownIcon className='w-4 h-4 mr-3' onClick={() => setOpen(true)} />
                </span>
              </div>
              <Transition
                show={open}
                enter='transition duration-100 ease-out'
                enterFrom='transform scale-95 opacity-0'
                enterTo='transform scale-100 opacity-100'
                leave='transition duration-75 ease-out'
                leaveFrom='transform scale-100 opacity-100'
                leaveTo='transform scale-95 opacity-0'
              >
                <div
                  className='shadow-md gap-y-2 bg-gray-50 absolute w-full border-l border-r border-b border-gray-800 rounded-b-md focus:outline-none z-20 pt-3'
                  ref={categoryWrapper}
                >
                  <div className='overflow-y-auto flex flex-col gap-y-2' style={{ height: '250px' }}>
                    {categories &&
                      categories.map((category, index) => (
                        <span
                          className='text-sm cursor-pointer hover:underline px-5'
                          key={`category_${index}`}
                          onClick={() => {
                            setSelectedCategory(category.name);
                            setOpen(false);
                            setClickedAddCategory(false);
                            setCategoryErrorMessage(null);
                            setCategoryName('');
                            setCategoryPrefix('');
                          }}
                        >
                          {category.name}
                        </span>
                      ))}
                  </div>
                  <div className='border-t border-gray-500 px-5 py-2 bg-gray-100 z-10'>
                    {!clickedAddCategory ? (
                      <span
                        className='underline text-org-light italic cursor-pointer hover:text-org z-10 text-sm'
                        onClick={() => {
                          setClickedAddCategory(true);
                        }}
                      >
                        Add new category
                      </span>
                    ) : (
                      <div className='flex items-center justify-between z-10'>
                        <div className='flex items-center mr-3'>
                          <input
                            placeholder='Bluetooth Mouse'
                            className={`${
                              categoryName && categoryName?.trim() === '' ? 'error-input' : ''
                            } italic w-2/3 text-gray-600 border border-gray-600 p-0.5 border-r-0 rounded-r-none text-sm`}
                            value={categoryName}
                            onChange={(e) => setCategoryName(e.target.value)}
                          />
                          <input
                            placeholder='BM'
                            maxLength={2}
                            className={`
                              ${
                                categoryPrefix && categoryPrefix?.trim() === '' ? 'error-input' : ''
                              } w-1/3 italic text-gray-600 border border-gray-600 p-0.5 rounded-l-none text-sm`}
                            value={categoryPrefix}
                            onChange={(e) => setCategoryPrefix(e.target.value)}
                          />
                        </div>
                        <svg
                          xmlns='http://www.w3.org/2000/svg'
                          className={`${
                            categoryName && categoryName.trim() !== '' && categoryPrefix && categoryPrefix.trim() !== ''
                              ? 'cursor-pointer text-org-light'
                              : 'cursor-default text-gray-400'
                          } h-7 w-7  mr-3`}
                          fill='none'
                          viewBox='0 0 24 24'
                          stroke='currentColor'
                          onClick={() => {
                            if (
                              categoryName &&
                              categoryName?.trim() !== '' &&
                              categoryPrefix &&
                              categoryPrefix?.trim() !== ''
                            ) {
                              handleCreateCategory();
                            }
                          }}
                        >
                          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={3} d='M5 13l4 4L19 7' />
                        </svg>
                        <svg
                          xmlns='http://www.w3.org/2000/svg'
                          className='cursor-pointer h-7 w-7'
                          fill='none'
                          viewBox='0 0 24 24'
                          stroke='currentColor'
                          onClick={() => {
                            setClickedAddCategory(false);
                            setCategoryName('');
                            setCategoryPrefix('');
                            setCategoryErrorMessage(null);
                          }}
                        >
                          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={3} d='M6 18L18 6M6 6l12 12' />
                        </svg>
                      </div>
                    )}
                    {categoryErrorMessage &&
                      (Array.isArray(categoryErrorMessage) ? (
                        categoryErrorMessage?.map((msg, index) => (
                          <p className='error-message col-span-3' key={`err_msg_${index}`}>
                            {msg}
                          </p>
                        ))
                      ) : (
                        <p className='error-message col-span-3'>{categoryErrorMessage}</p>
                      ))}
                  </div>
                </div>
              </Transition>
            </div>
          </div>
          <div className='flex'>
            <label htmlFor='specification' className='block text-gray-700'>
              Specification
            </label>
          </div>
          <div className='flex items-center col-span-2'>
            <div className='input-field'>
              <textarea
                className={`${errors.specification && 'error-input'} resize-none`}
                draggable={false}
                {...register('specification')}
                rows={4}
              />
              <p className='error-message'>{errors.specification?.message}</p>
            </div>
          </div>
          <div className='flex items-center'>
            <label htmlFor='firstName' className='block'>
              Installed Date
            </label>
          </div>
          <div className='flex items-center col-span-2'>
            <div
              className='input-field'
              onClick={() =>
                setInstalledDate({
                  ...installedDate,
                  visible: true,
                })
              }
            >
              <div>
                <Tippy
                  visible={installedDate.visible}
                  onClickOutside={() =>
                    setInstalledDate({
                      ...installedDate,
                      visible: false,
                    })
                  }
                  interactive={true}
                  placement={'bottom'}
                  theme={'light-border'}
                  content={
                    <Calendar
                      onChange={(value, event) =>
                        setInstalledDate({
                          visible: false,
                          value,
                        })
                      }
                      value={installedDate.value}
                      className='ring-2 ring-org shadow-lg rounded-base hover:text-brand-dark'
                    />
                  }
                >
                  <div className='relative'>
                    <input
                      className={`cursor-default ${errors.installedDate && 'error-input'}`}
                      type='text'
                      value={installedDate.value ? dayjs(installedDate.value).format('DD/MM/YYYY') : ''}
                      readOnly={true}
                    />
                    <input
                      type='text'
                      name='joinedDate'
                      id='joinedDate'
                      className='hidden'
                      {...register('joinedDate')}
                      value={installedDate.value ? installedDate.value : ''}
                    />
                    <span className='absolute top-0 right-0 mt-1.5 mr-2 cursor-pointer'>
                      <svg
                        xmlns='http://www.w3.org/2000/svg'
                        className='h-5 w-5 text-gray-600 hover:text-indigo-300'
                        viewBox='0 0 20 20'
                        fill='currentColor'
                        onClick={() =>
                          setInstalledDate({
                            ...installedDate,
                            visible: true,
                          })
                        }
                      >
                        <path
                          fillRule='evenodd'
                          d='M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z'
                          clipRule='evenodd'
                        />
                      </svg>
                    </span>
                  </div>
                </Tippy>{' '}
              </div>
              <p className='error-message'>{errors.installedDate?.message}</p>
            </div>
          </div>
          <div className='flex'>
            <label htmlFor='state' className='block'>
              State
            </label>
          </div>
          <div className='col-span-2 group-hover:bg-org'>
            <label className='relative flex items-center mb-3'>
              <input type='radio' name='state' {...register('state')} value={'AVAILABLE'} defaultChecked={true} />
              <span className='absolute ml-5 text-sm'>Available</span>
            </label>
            <label className='relative flex items-center'>
              <input type='radio' name='state' {...register('state')} value={'NOT_AVAILABLE'} />
              <span className='absolute ml-5 text-sm'>Not available</span>
            </label>
          </div>
          <div></div>
          <div className='col-span-2 flex justify-end items-center gap-5 pt-5 w-60'>
            <button
              type='submit'
              className={`text-white p-2 rounded-md w-20 ${
                !isDirty ||
                _.isEmpty(watch()) ||
                watch('name')?.trim() === '' ||
                watch('specification')?.trim() === '' ||
                watch('state')?.trim() === '' ||
                !installedDate.value ||
                !selectedCategory
                  ? 'bg-gray-500 cursor-default'
                  : 'bg-org-light hover:bg-org focus:bg-org'
              }`}
              disabled={
                !isDirty ||
                _.isEmpty(watch()) ||
                watch('name')?.trim() === '' ||
                watch('specification')?.trim() === '' ||
                watch('state')?.trim() === '' ||
                !installedDate.value ||
                !selectedCategory
              }
            >
              Save
            </button>
            <Link
              to={{
                pathname: '/asset',
                state: {
                  from: props.location.pathname,
                },
              }}
              className='bg-white text-gray-600 p-2 border border-gray-600 rounded-md w-20 text-center hover:border-gray-800 hover:text-gray-800'
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateAsset;
