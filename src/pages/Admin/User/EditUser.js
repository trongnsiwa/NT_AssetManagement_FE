import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import * as Yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import Calendar from 'react-calendar';
import Tippy from '@tippyjs/react';
import dayjs from 'dayjs';
import { setHeaderTitle } from '../../../actions/HeaderTitleAction';
import { Link, useHistory } from 'react-router-dom';
import moment from 'moment';
import ERRORS from '../../../constants/ErrorCode';
import { hideLoader, showLoader } from '../../../actions/LoaderAction';
import { getUserDetail, updateUser } from '../../../services/user.service';
import { showError, showErrorMessage } from '../../../helpers/showToast';
import { format } from '../../../helpers/formatString';
import { clearMessage } from '../../../actions/MessageAction';
import { showStoreErrorMessage } from '../../../helpers/setErrorMessage';
import { checkIfDisabledUser } from '../../../services/auth.service';
import { logout } from '../../../actions/AuthAction';
import { hideModal, showDisabledUserModal } from '../../../actions/ModalAction';

const types = [
  {
    label: 'Admin',
    value: 1,
  },
  {
    label: 'Staff',
    value: 2,
  },
];

const EditAsset = (props) => {
  const { code } = props.match.params;

  const [user, setUser] = useState(null);

  const [joinedDate, setJoinedDate] = useState({
    visible: false,
    value: new Date(),
  });
  const [dob, setDOB] = useState({
    visible: false,
    value: new Date(),
  });

  const { user: currentUser } = useSelector((state) => state.authReducer);
  const dispatch = useDispatch();
  const history = useHistory();

  const validationSchema = Yup.object().shape({
    dob: Yup.string().test('dob', ERRORS.ERR_INVALID_DOB, (value) => {
      return moment().diff(dob.value, 'years') >= 18;
    }),
    joinedDate: Yup.string()
      .test('Joined Date earlier', ERRORS.ERR_JOINED_DATE_EARLIER_THAN_DOB, (value) => {
        return moment(joinedDate.value).isAfter(dob.value);
      })
      .test('Joined Date weekend', ERRORS.ERR_JOINED_DATE_WEEKEND, (value) => {
        return new Date(joinedDate.value).getDay() > 0 && new Date(joinedDate.value).getDay() < 6;
      }),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    mode: 'all',
    resolver: yupResolver(validationSchema),
  });

  useEffect(() => {
    dispatch(setHeaderTitle('Manage User > Edit User'));
  }, [dispatch]);

  const logOut = () => {
    dispatch(logout());
    dispatch(hideModal());
    history.push('/signin');
    history.go(0);
  };

  useEffect(() => {
    dispatch(showLoader());

    getUserDetail(code)
      .then((res) => {
        if (res.data.data) {
          setUser(res.data.data);
          dispatch(hideLoader());
        } else {
          showError(format(ERRORS[res.data.errorCode], code));
          dispatch(hideLoader());
          props.history.push('/user');
        }
      })
      .catch((err) => {
        showErrorMessage(err, code, dispatch);
        props.history.push('/user');
      });
  }, [code, dispatch, props.history]);

  useEffect(() => {
    if (user) {
      setDOB({
        ...dob,
        value: new Date(user.dob),
      });
    }
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (user) {
      setJoinedDate({
        ...joinedDate,
        value: new Date(user.joinedDate),
      });
    }
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  const editUser = ({ firstName, lastName, gender, type }) => {
    if (currentUser) {
      checkIfDisabledUser(currentUser.code).then((res) => {
        if (res.data.data) {
          dispatch(showDisabledUserModal(logOut));
          return;
        } else {
          var dateJoined = null;
          var dateOfBirth = null;
          dateJoined = new Date(new Date(joinedDate.value).setHours(0, 0, 0, 0));
          dateOfBirth = new Date(new Date(dob.value).setHours(0, 0, 0, 0));

          dateJoined = new Date(dateJoined.getTime() - dateJoined.getTimezoneOffset() * 60000).toJSON();
          dateOfBirth = new Date(dateOfBirth.getTime() - dateOfBirth.getTimezoneOffset() * 60000).toJSON();

          dispatch(showLoader());

          updateUser(code, firstName, lastName, dateOfBirth, gender, dateJoined, type)
            .then((res) => {
              dispatch(clearMessage());
              dispatch(hideLoader());
              reset();
              history.push({
                pathname: '/user',
                state: {
                  from: props.location.pathname,
                  newEntity: res.data.data,
                },
              });
            })
            .catch((error) => {
              showStoreErrorMessage(error, firstName + ' ' + lastName, dispatch);
            });
        }
      });
    }
  };

  return (
    <div className='container'>
      <h3 className='text-org font-bold text-base mb-5'>Edit User</h3>
      <div className='mt-6'>
        {user && (
          <form className='mb-0 grid-cols-3 inline-grid space-y-4 w-full lg:mr-16' onSubmit={handleSubmit(editUser)}>
            <div className='flex items-center'>
              <label htmlFor='firstName' className='block'>
                First Name
              </label>
            </div>
            <div className='flex items-center col-span-2'>
              <div className='input-field'>
                <input
                  type='text'
                  name='firstName'
                  className='bg-gray-50'
                  id='firstName'
                  value={user.firstName}
                  disabled={true}
                />
              </div>
            </div>
            <div className='flex items-center'>
              <label htmlFor='firstName' className='block'>
                Last Name
              </label>
            </div>
            <div className='flex items-center col-span-2'>
              <div className='input-field'>
                <input
                  type='text'
                  name='lastName'
                  className='bg-gray-50'
                  id='lastName'
                  value={user.lastName}
                  disabled={true}
                />
              </div>
            </div>
            <div className='flex items-center'>
              <label htmlFor='saleFromDate' className='block text-gray-700'>
                Date of Birth
              </label>
            </div>
            <div className='flex items-center col-span-2'>
              <div
                className='input-field'
                onClick={() =>
                  setDOB({
                    ...dob,
                    visible: true,
                  })
                }
              >
                <div>
                  <Tippy
                    visible={dob.visible}
                    onClickOutside={() =>
                      setDOB({
                        ...dob,
                        visible: false,
                      })
                    }
                    interactive={true}
                    placement={'bottom'}
                    theme={'light-border'}
                    content={
                      <Calendar
                        onChange={(value, event) =>
                          setDOB({
                            visible: false,
                            value,
                          })
                        }
                        value={dob.value}
                        className='ring-2 ring-org shadow-lg rounded-base hover:text-brand-dark text-sm'
                      />
                    }
                  >
                    <div className='relative'>
                      <input
                        className={`cursor-default ${errors?.dob && 'error-input'}`}
                        type='text'
                        value={dayjs(dob.value).format('DD/MM/YYYY')}
                        readOnly={true}
                      />
                      <input type='hidden' name='dob' id='dob' {...register('dob')} value={dob.value} />
                      <span className='absolute top-0 right-0 mt-1 mr-2 cursor-pointer'>
                        <svg
                          xmlns='http://www.w3.org/2000/svg'
                          className='h-5 w-5 text-gray-600 hover:text-indigo-300'
                          viewBox='0 0 20 20'
                          fill='currentColor'
                          onClick={() =>
                            setDOB({
                              ...dob,
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
                <p className='error-message'>{errors?.dob?.message}</p>
              </div>
            </div>
            <div className='flex items-center'>
              <label htmlFor='firstName' className='block'>
                Gender
              </label>
            </div>
            <div className='flex items-center col-span-2 gap-x-10 group-hover:bg-org'>
              <label className='relative flex items-center'>
                <input type='radio' name='gender' {...register('gender')} value={false} defaultChecked={!user.gender} />
                <span className='absolute ml-5'>Female</span>
              </label>
              <label className='relative ml-10 flex items-center'>
                <input type='radio' name='gender' {...register('gender')} value={true} defaultChecked={user.gender} />
                <span className='absolute ml-5'>Male</span>
              </label>
            </div>
            <div className='flex items-center'>
              <label htmlFor='firstName' className='block'>
                Joined Date
              </label>
            </div>
            <div className='flex items-center col-span-2'>
              <div
                className='input-field'
                onClick={() =>
                  setJoinedDate({
                    ...joinedDate,
                    visible: true,
                  })
                }
              >
                <div>
                  <Tippy
                    visible={joinedDate.visible}
                    onClickOutside={() =>
                      setJoinedDate({
                        ...joinedDate,
                        visible: false,
                      })
                    }
                    interactive={true}
                    placement={'bottom'}
                    theme={'light-border'}
                    content={
                      <Calendar
                        onChange={(value, event) =>
                          setJoinedDate({
                            visible: false,
                            value,
                          })
                        }
                        value={joinedDate.value}
                        className='ring-2 ring-org shadow-lg rounded-base hover:text-brand-dark text-sm'
                      />
                    }
                  >
                    <div className='relative'>
                      <input
                        className={`cursor-default ${errors?.joinedDate && 'error-input'}`}
                        type='text'
                        value={dayjs(joinedDate.value).format('DD/MM/YYYY')}
                        readOnly={true}
                      />
                      <input
                        type='hidden'
                        name='joinedDate'
                        id='joinedDate'
                        {...register('joinedDate')}
                        value={joinedDate.value}
                      />
                      <span className='absolute top-0 right-0 mt-1 mr-2 cursor-pointer'>
                        <svg
                          xmlns='http://www.w3.org/2000/svg'
                          className='h-5 w-5 text-gray-600 hover:text-indigo-300'
                          viewBox='0 0 20 20'
                          fill='currentColor'
                          onClick={() =>
                            setJoinedDate({
                              ...joinedDate,
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
                <p className='error-message'>{errors?.joinedDate?.message}</p>
              </div>
            </div>
            <div className='flex items-center'>
              <label htmlFor='firstName' className='block'>
                Type
              </label>
            </div>
            <div className='flex items-center col-span-2'>
              <div className='input-field'>
                <select name='type' id='type' {...register('type')} defaultValue={user.role.id}>
                  {types &&
                    types.map((type, index) => (
                      <option value={type.value} key={`type_${index}`}>
                        {type.label}
                      </option>
                    ))}
                </select>
              </div>
            </div>
            <div></div>
            <div className='col-span-2 flex justify-end items-center gap-5 pt-5 w-60'>
              <button type='submit' className={`text-white p-2 rounded-md w-20 bg-org-light hover:bg-org focus:bg-org`}>
                Save
              </button>
              <Link
                to={{
                  pathname: '/user',
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
        )}
      </div>
    </div>
  );
};

export default EditAsset;
