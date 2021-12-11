import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import * as Yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import { setHeaderTitle } from '../../../actions/HeaderTitleAction';
import Calendar from 'react-calendar';
import Tippy from '@tippyjs/react';
import dayjs from 'dayjs';
import { Link, useHistory } from 'react-router-dom';
import { ROLE } from '../../../constants/Role';
import ERRORS from '../../../constants/ErrorCode';
import moment from 'moment';
import _ from 'lodash';
import { hideLoader, showLoader } from '../../../actions/LoaderAction';
import { createNewAccount } from '../../../services/user.service';
import { clearMessage } from '../../../actions/MessageAction';
import { showStoreErrorMessage } from '../../../helpers/setErrorMessage';
import { checkIfDisabledUser } from '../../../services/auth.service';
import { logout } from '../../../actions/AuthAction';
import { hideModal, showDisabledUserModal } from '../../../actions/ModalAction';

const types = [
  {
    label: 'Admin',
    value: ROLE.ADMIN,
  },
  {
    label: 'Staff',
    value: ROLE.STAFF,
  },
];

const CreateUser = (props) => {
  const [joinedDate, setJoinedDate] = useState({
    visible: false,
    value: null,
  });
  const [dob, setDOB] = useState({
    visible: false,
    value: null,
  });

  const { user: currentUser } = useSelector((state) => state.authReducer);
  const { message } = useSelector((state) => state.messageReducer);
  const dispatch = useDispatch();
  const history = useHistory();

  const validationSchema = Yup.object().shape({
    firstName: Yup.string()
      .trim()
      .matches(/^[aA-zZ]+$/, ERRORS.ERR_SPECIAL_CHAR_SPACE_NUMBER)
      .max(20, ERRORS.ERR_FIRST_NAME_MAX_LENGTH),
    lastName: Yup.string()
      .trim()
      .matches(/^[aA-zZ\s]+$/, ERRORS.ERR_SPECIAL_CHAR_NUMBER)
      .max(20, ERRORS.ERR_LAST_NAME_MAX_LENGTH),
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
    formState: { errors, isDirty },
    reset,
    watch,
  } = useForm({
    resolver: yupResolver(validationSchema),
  });

  useEffect(() => {
    dispatch(setHeaderTitle('Manage User > Create New User'));
  }, [dispatch]);

  const logOut = () => {
    dispatch(logout());
    dispatch(hideModal());
    history.push('/signin');
    history.go(0);
  };

  const createUser = ({ firstName, lastName, gender, type }) => {
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

          const role = {
            name: type,
          };

          createNewAccount(firstName, lastName, dateOfBirth, gender, dateJoined, role, currentUser.location.id)
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
      <h3 className='text-org font-bold text-base mb-5'>Create New User</h3>
      <div className='mt-4'>
        <form className='mb-0 grid-cols-3 inline-grid space-y-3 w-full lg:mr-16' onSubmit={handleSubmit(createUser)}>
          {message && <p className='error-message col-span-3'>{message}</p>}
          <div className='flex items-center'>
            <label htmlFor='firstName' className='block text-sm'>
              First Name
            </label>
          </div>
          <div className='flex items-center col-span-2'>
            <div className='input-field'>
              <input
                className={`${errors.firstName && 'error-input'} text-sm`}
                type='text'
                name='firstName'
                id='firstName'
                {...register('firstName')}
                defaultValue={''}
              />
              {errors.firstName && (
                <>
                  <p className='error-message'>{errors.firstName?.message}</p>
                </>
              )}
            </div>
          </div>
          <div className='flex items-center'>
            <label htmlFor='firstName' className='block text-sm'>
              Last Name
            </label>
          </div>
          <div className='flex items-center col-span-2'>
            <div className='input-field'>
              <input
                className={`${errors.lastName && 'error-input'} text-sm`}
                type='text'
                name='lastName'
                id='lastName'
                {...register('lastName')}
                defaultValue={''}
              />
              {errors.lastName && (
                <>
                  <p className='error-message'>{errors.lastName?.message}</p>
                </>
              )}
            </div>
          </div>
          <div className='flex items-center'>
            <label htmlFor='saleFromDate' className='block text-sm'>
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
                      className={`cursor-default text-sm ${errors.dob && 'error-input'}`}
                      type='text'
                      value={dob.value ? dayjs(dob.value).format('DD/MM/YYYY') : ''}
                      readOnly={true}
                    />
                    <input
                      type='text'
                      name='dob'
                      id='dob'
                      className='hidden'
                      {...register('dob')}
                      value={dob.value ? dob.value : ''}
                    />
                    <span className='absolute top-0 right-0 mt-1.5 mr-2 cursor-pointer'>
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
              {errors.dob && (
                <>
                  <p className='error-message'>{errors.dob?.message}</p>
                </>
              )}
            </div>
          </div>
          <div className='flex items-center'>
            <label htmlFor='firstName' className='block text-sm'>
              Gender
            </label>
          </div>
          <div className='flex items-center col-span-2 gap-x-10 group-hover:bg-org'>
            <label className='relative flex items-center'>
              <input type='radio' name='gender' {...register('gender')} value={false} defaultChecked={true} />
              <span className='absolute ml-5 text-sm'>Female</span>
            </label>
            <label className='relative ml-10 flex items-center'>
              <input type='radio' name='gender' {...register('gender')} value={true} />
              <span className='absolute ml-5 text-sm'>Male</span>
            </label>
          </div>
          <div className='flex items-center'>
            <label htmlFor='firstName' className='block text-sm'>
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
                      className={`cursor-default text-sm ${errors.joinedDate && 'error-input'}`}
                      type='text'
                      value={joinedDate.value ? dayjs(joinedDate.value).format('DD/MM/YYYY') : ''}
                      readOnly={true}
                    />
                    <input
                      type='text'
                      name='joinedDate'
                      id='joinedDate'
                      className='hidden'
                      {...register('joinedDate')}
                      value={joinedDate.value ? joinedDate.value : ''}
                    />
                    <span className='absolute top-0 right-0 mt-2 mr-2 cursor-pointer'>
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
              {errors.joinedDate && (
                <>
                  <p className='error-message'>{errors.joinedDate?.message}</p>
                </>
              )}
            </div>
          </div>
          <div className='flex items-center'>
            <label htmlFor='firstName' className='block text-sm'>
              Type
            </label>
          </div>
          <div className='flex items-center col-span-2'>
            <div className='input-field'>
              <select name='type' id='type' {...register('type')} defaultValue={''}>
                <option className='text-sm' value='' disabled hidden></option>
                {types &&
                  types.map((type, index) => (
                    <option className='text-sm' value={type.value} key={`type_${index}`}>
                      {type.label}
                    </option>
                  ))}
              </select>
            </div>
          </div>
          <div></div>
          <div className='col-span-2 flex justify-end items-center gap-5 pt-5 w-60'>
            <button
              type='submit'
              className={`text-white p-2 text-sm rounded-md w-20 ${
                !isDirty ||
                _.isEmpty(watch()) ||
                watch('firstName').trim() === '' ||
                watch('lastName').trim() === '' ||
                watch('type').trim() === '' ||
                !joinedDate.value ||
                !dob.value
                  ? 'bg-gray-500 cursor-default'
                  : 'bg-org-light hover:bg-org focus:bg-org'
              }`}
              disabled={
                !isDirty ||
                _.isEmpty(watch()) ||
                watch('firstName').trim() === '' ||
                watch('lastName').trim() === '' ||
                watch('type').trim() === '' ||
                !joinedDate.value ||
                !dob.value
              }
            >
              Save
            </button>
            <Link
              to={{
                pathname: '/user',
                state: {
                  from: props.location.pathname,
                },
              }}
              className='bg-white text-sm text-gray-600 p-2 border border-gray-600 rounded-md w-20 text-center hover:border-gray-800 hover:text-gray-800'
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateUser;
