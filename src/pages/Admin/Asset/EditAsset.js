import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import { setHeaderTitle } from '../../../actions/HeaderTitleAction';
import Calendar from 'react-calendar';
import Tippy from '@tippyjs/react';
import dayjs from 'dayjs';
import { Link, useHistory } from 'react-router-dom';
import ERRORS from '../../../constants/ErrorCode';
import { hideLoader, showLoader } from '../../../actions/LoaderAction';
import { clearMessage } from '../../../actions/MessageAction';
import { showStoreErrorMessage } from '../../../helpers/setErrorMessage';
import { states } from '../../../data/assetData';
import { ChevronDownIcon } from '@heroicons/react/solid';
import { getAssetDetail, getListAssetState, updateAsset } from '../../../services/asset.service';
import { showError, showErrorMessage } from '../../../helpers/showToast';
import { format } from '../../../helpers/formatString';
import { checkIfDisabledUser } from '../../../services/auth.service';
import { logout } from '../../../actions/AuthAction';
import { hideModal, showDisabledUserModal } from '../../../actions/ModalAction';

const EditAsset = (props) => {
  const { id } = props.location.state;

  const [asset, setAsset] = useState(null);
  const [assetStates, setAssetStates] = useState(null);

  const [installedDate, setInstalledDate] = useState({
    visible: false,
    value: null,
  });

  const { user: currentUser } = useSelector((state) => state.authReducer);
  const { message } = useSelector((state) => state.messageReducer);
  const dispatch = useDispatch();
  const history = useHistory();

  const {
    register,
    handleSubmit,
    formState: { errors },
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
    dispatch(showLoader());

    getAssetDetail(id)
      .then((res) => {
        if (res.data.data) {
          setAsset(res.data.data);
          dispatch(hideLoader());
        } else {
          showError(format(ERRORS[res.data.errorCode], id));
          dispatch(hideLoader());
          props.history.push('/asset');
        }
      })
      .catch((err) => {
        showErrorMessage(err, id, dispatch);
        props.history.push('/asset');
      });
  }, [id, dispatch, props.history]);

  useEffect(() => {
    if (asset) {
      setInstalledDate({
        ...installedDate,
        value: new Date(asset.installedDate),
      });
    }
  }, [asset]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    getListAssetState().then((res) => {
      setAssetStates(res.data.data);
    });
  }, []);

  const editAsset = ({ name, specification, state }) => {
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

          updateAsset(id, name.trim(), null, specification.trim(), state.trim(), dateinstalledDate)
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
              showStoreErrorMessage(error, id, dispatch);
            });
        }
      });
    }
  };

  return (
    <div className='container'>
      <h3 className='text-org font-bold text-base mb-5'>Edit Asset</h3>
      <div className='mt-6'>
        {asset && (
          <form className='mb-0 grid-cols-3 inline-grid space-y-3 w-full lg:mr-16' onSubmit={handleSubmit(editAsset)}>
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
                  defaultValue={asset.name}
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
                    className='border-2 w-full rounded-md focus:outline-none cursor-default bg-gray-100 text-gray-300'
                    value={asset.categoryName}
                    disabled={true}
                  />
                  <span className='absolute top-0 mt-2 right-0'>
                    <ChevronDownIcon className='w-4 h-4 mr-3' />
                  </span>
                </div>
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
                  draggable={false}
                  className={`${errors.name && 'error-input'} resize-none`}
                  rows={4}
                  defaultValue={asset.specification}
                  {...register('specification')}
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
              </div>
            </div>
            <div className='flex'>
              <label htmlFor='state' className='block'>
                State
              </label>
            </div>
            <div className='col-span-2 group-hover:bg-org'>
              {assetStates &&
                assetStates.map((state, index) => (
                  <label className='relative flex items-center mb-3' key={`state_${index}`}>
                    <input
                      type='radio'
                      name='state'
                      {...register('state')}
                      value={state.id}
                      defaultChecked={asset.stateName === state.name}
                    />
                    <span className='absolute ml-5 text-sm'>
                      {
                        states.find((s) => {
                          if (s.value.includes('1') || s.value.includes('2')) {
                            return s.value.slice(0, s.value.length - 1) === state.name;
                          }
                          return s.value === state.name;
                        })?.name
                      }
                    </span>
                  </label>
                ))}
            </div>
            <div></div>
            <div className='col-span-2 w-60 flex justify-end items-center gap-5 pt-2'>
              <button
                type='submit'
                className={`text-white p-2 rounded-md w-20 ${
                  watch('name')?.trim() === '' ||
                  watch('specification')?.trim() === '' ||
                  watch('state')?.trim() === '' ||
                  !installedDate.value
                    ? 'bg-gray-500 cursor-default'
                    : 'bg-org-light hover:bg-org focus:bg-org'
                }`}
                disabled={
                  watch('name')?.trim() === '' ||
                  watch('specification')?.trim() === '' ||
                  watch('state')?.trim() === '' ||
                  !installedDate.value
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
        )}
      </div>
    </div>
  );
};

export default EditAsset;
