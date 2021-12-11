import React, { useEffect, useState } from 'react';
import { ChevronDownIcon, EyeIcon, EyeOffIcon } from '@heroicons/react/solid';
import Table from '../components/Table';
import { useDispatch, useSelector } from 'react-redux';
import { setHeaderTitle } from '../actions/HeaderTitleAction';
import { hideLoader, showLoader } from '../actions/LoaderAction';
import * as Yup from 'yup';
import ERRORS from '../constants/ErrorCode';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { hideModal, showDisabledUserModal, showModal } from '../actions/ModalAction';
import { changePasswordFirstLogin, checkIfDisabledUser } from '../services/auth.service';
import { showError, showErrorMessage, showSuccess, showSuccessMessage } from '../helpers/showToast';
import SUCCESS from '../constants/SuccessCode';
import { setMessage } from '../actions/MessageAction';
import { acceptAssignment, declineAssignment, getAssignmentDetail, viewUserAssignment } from '../services/home.service';
import { homeHeader } from '../data/homeData';
import dayjs from 'dayjs';
import { states } from '../data/assignmentData';
import Modal from '../components/Modal';
import { useHistory } from 'react-router';
import { logout } from '../actions/AuthAction';
import { createNewReturn, createNewReturnForStaff } from '../services/return.service';

const Home = (props) => {
  const [userAssignments, setUserAssignments] = useState(null);

  const [revealPassword, setRevealPassword] = useState(false);
  const [confirmRevealPassword, setConfirmRevealPassword] = useState(false);

  const { user: currentUser } = useSelector((state) => state.authReducer);
  const { message } = useSelector((state) => state.messageReducer);
  const dispatch = useDispatch();
  const history = useHistory();

  const [selectedAssignment, setSelectedAssignment] = useState(null);

  const [sortBy, setSortBy] = useState({
    direction: 'ASC',
    value: '',
  });

  const [modal, setModal] = useState({
    isOpen: false,
    title: '',
    name: '',
    message: '',
    content: null,
    btnOk: '',
    isValid: true,
  });

  const validationSchema = Yup.object().shape({
    newPassword: Yup.string().required(ERRORS.ERR_NEW_PASSWORD_NOT_BLANK),
    confirmPassword: Yup.string().test('match', ERRORS.ERR_PASSWORD_NOT_MATCH, function (confirm) {
      return confirm === this.parent.newPassword;
    }),
  });

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

  const logOut = () => {
    dispatch(logout());
    dispatch(hideModal());
    history.push('/signin');
    history.go(0);
  };

  const handleChangePassword = ({ newPassword }) => {
    if (currentUser) {
      checkIfDisabledUser(currentUser.code).then((res) => {
        if (res.data.data) {
          dispatch(showDisabledUserModal(logOut));
          return;
        } else {
          dispatch(showLoader());

          changePasswordFirstLogin(currentUser.code, newPassword)
            .then((res) => {
              dispatch(hideLoader());
              dispatch(hideModal());

              showSuccess(SUCCESS[res.data.successCode]);
              localStorage.setItem(
                'user',
                JSON.stringify({
                  ...currentUser,
                  new: false,
                })
              );
            })
            .then(() => {
              setTimeout(function () {
                window.location.reload();
              }, 1500);
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
      });
    }
  };

  const changePasswordForm = (
    <>
      <p>This is the first time you logged in.</p>
      <p>Your have to change your password to continue.</p>
      <form onSubmit={handleSubmit(handleChangePassword)}>
        {message && <p className='error-message col-span-3'>{message}</p>}
        <div className='mb-0 grid-cols-3 inline-grid space-y-4 w-full lg:mr-16'>
          <div className='flex items-center'>
            <label htmlFor='newPassword' className='block'>
              New password
            </label>
          </div>
          <div className='flex items-center col-span-2'>
            <div className='w-full'>
              <div className='relative'>
                <input
                  className={errors.newPassword && 'error-input'}
                  type={`${revealPassword ? 'text' : 'password'}`}
                  name='newPassword'
                  id='newPassword'
                  {...register('newPassword')}
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

              <p className='error-message'>{errors.newPassword?.message}</p>
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
          {message && <p className='error-message text-sm'>{message}</p>}
        </div>
        <div className='mt-6 flex justify-end'>
          <button
            type='submit'
            className={`rounded-md border border-transparent shadow-sm p-2 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 sm:w-auto text-white ${
              !isDirty || watch('newPassword')?.trim() === '' || watch('confirmPassword')?.trim() === ''
                ? 'opacity-80 cursor-default bg-gray-500'
                : 'bg-org-light hover:bg-red-700  focus:ring-red-500'
            }`}
            disabled={!isDirty || watch('newPassword')?.trim() === '' || watch('confirmPassword')?.trim() === ''}
          >
            Save
          </button>
        </div>
      </form>
    </>
  );

  useEffect(() => {
    if (currentUser && currentUser.new) {
      dispatch(showModal('Change password', 'CHANGEPASSWORDFIRST', changePasswordForm, false, reset));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    message,
    currentUser,
    errors.newPassword,
    errors.confirmPassword,
    isDirty,
    watch,
    revealPassword,
    confirmRevealPassword,
  ]);

  useEffect(() => {
    dispatch(setHeaderTitle('Home'));
  }, [dispatch]);

  useEffect(() => {
    if (currentUser) {
      loadData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser, sortBy]);

  const loadData = () => {
    if (currentUser) {
      checkIfDisabledUser(currentUser.code).then((res) => {
        if (res.data.data) {
          dispatch(showDisabledUserModal(logOut));
          return;
        } else {
          viewUserAssignment(currentUser.code, sortBy.value, sortBy.direction).then((res) => {
            setUserAssignments(res.data.data);
          });
        }
      });
    }
  };

  const handleShowDetail = (id) => {
    if (currentUser) {
      checkIfDisabledUser(currentUser.code).then((res) => {
        if (res.data.data) {
          dispatch(showDisabledUserModal(logOut));
          return;
        } else {
          dispatch(showLoader());

          getAssignmentDetail(id).then((res) => {
            if (res.data.data) {
              const item = res.data.data;

              setModal({
                ...modal,
                isOpen: true,
                title: 'Detailed Assignment Information',
                content: {
                  'Asset Code': item.assetCode,
                  'Asset Name': item.assetName,
                  Specification: item.specification,
                  'Assigned to': item.assignedTo,
                  'Assigned by': item.assignedBy,
                  'Assigned Date': dayjs(item.assignedDate).format('DD/MM/YYYY'),
                  State: states.find((state) => {
                    if (state.value.includes('1') || state.value.includes('2')) {
                      return state.value.slice(0, state.value.length - 1) === item.state;
                    }
                    return state.value === item.state;
                  })?.name,
                  Note: item.note,
                },
              });

              dispatch(hideLoader());
            } else {
              setModal(null);

              dispatch(hideLoader());
            }
          });
        }
      });
    }
  };

  const handleAcceptAssignment = () => {
    if (currentUser) {
      checkIfDisabledUser(currentUser.code).then((res) => {
        if (res.data.data) {
          dispatch(showDisabledUserModal(logOut));
          return;
        } else {
          if (!selectedAssignment) {
            return;
          }

          dispatch(showLoader());

          acceptAssignment(selectedAssignment)
            .then((res) => {
              if (res.data.successCode) {
                setModal({
                  ...modal,
                  isOpen: false,
                });
                loadData();
              } else {
                showError(ERRORS[res.data.errorCode]);
              }

              dispatch(hideLoader());
            })
            .catch((err) => {
              showErrorMessage(err, selectedAssignment, dispatch);
            });

          setSelectedAssignment(null);
        }
      });
    }
  };

  const handleDeclineAssignment = () => {
    if (currentUser) {
      checkIfDisabledUser(currentUser.code).then((res) => {
        if (res.data.data) {
          dispatch(showDisabledUserModal(logOut));
          return;
        } else {
          if (!selectedAssignment) {
            return;
          }

          dispatch(showLoader());

          declineAssignment(selectedAssignment)
            .then((res) => {
              if (res.data.successCode) {
                setModal({
                  ...modal,
                  isOpen: false,
                });
                loadData();
              } else {
                showError(ERRORS[res.data.errorCode]);
              }

              dispatch(hideLoader());
            })
            .catch((err) => {
              showErrorMessage(err, selectedAssignment, dispatch);
            });

          setSelectedAssignment(null);
        }
      });
    }
  };

  const handleCreateReturn = () => {
    if (currentUser) {
      checkIfDisabledUser(currentUser.code).then((res) => {
        if (res.data.data) {
          dispatch(showDisabledUserModal(logOut));
          return;
        } else {
          if (!selectedAssignment) {
            return;
          }

          dispatch(showLoader());

          if (currentUser.role.name.includes('ADMIN')) {
            createNewReturn(selectedAssignment, currentUser.code)
              .then((res) => {
                setModal({
                  ...modal,
                  isOpen: false,
                });
                loadData();
                showSuccessMessage(res, res.data.data.assetCode, dispatch);
              })
              .catch((err) => {
                showErrorMessage(err, selectedAssignment, dispatch);
              });
          } else {
            createNewReturnForStaff(selectedAssignment, currentUser.username)
              .then((res) => {
                if (res.data.successCode) {
                  setModal({
                    ...modal,
                    isOpen: false,
                  });
                  loadData();
                  showSuccessMessage(res, res.data.data.assetCode, dispatch);
                } else {
                  showError(ERRORS[res.data.errorCode]);
                }

                dispatch(hideLoader());
              })
              .catch((err) => {
                showErrorMessage(err, selectedAssignment, dispatch);
              });
          }

          setSelectedAssignment(null);
        }
      });
    }
  };

  const openAcceptModal = () => {
    setModal({
      isOpen: true,
      title: 'Are you sure?',
      name: 'ACCEPT',
      desc: '',
      message: 'Do you want to accept this assignment?',
      content: null,
      btnOk: 'Accept',
      isValid: true,
    });
  };

  const openDeclineModal = () => {
    setModal({
      isOpen: true,
      title: 'Are you sure?',
      name: 'DECLINE',
      desc: '',
      message: 'Do you want to decline this assignment?',
      content: null,
      btnOk: 'Decline',
      isValid: true,
    });
  };

  const openCreateReturnModal = () => {
    setModal({
      isOpen: true,
      title: 'Are you sure?',
      name: 'RETURN',
      desc: '',
      message: 'Do you want to create a returning request for this asset?',
      content: null,
      btnOk: 'Yes',
      btnCancel: 'No',
      isValid: true,
    });
  };

  return (
    <div className='w-full relative'>
      <h3 className='text-org font-bold text-base mb-5 2xl:ml-3'>My Assignment</h3>

      <Table
        headers={
          homeHeader &&
          homeHeader.map((header, index) => (
            <th
              scope='col'
              className='table-custom-header cursor-pointer hover:bg-gray-100 hover:text-org text-sm'
              key={`header_${index}`}
              onClick={() => {
                if (sortBy.value === header.value) {
                  setSortBy({
                    ...sortBy,
                    direction: sortBy.direction === 'ASC' ? 'DESC' : 'ASC',
                  });
                } else {
                  setSortBy({
                    direction: 'ASC',
                    value: header.value,
                  });
                }
              }}
            >
              <div className='flex flex-col'>
                <div className='flex items-center justify-start h-6 w-max whitespace-nowrap'>
                  {header.label}
                  <ChevronDownIcon className='h-4 w-4' />
                </div>
                <div className={`${sortBy.value === header.value ? 'border-b-2' : 'border-b'} border-gray-800`}></div>
              </div>
            </th>
          ))
        }
        rows={
          userAssignments &&
          userAssignments.map((item, index) => (
            <tr key={`row_${index}`} className='hover:bg-gray-100 cursor-pointer'>
              <td className='table-custom-row max-row' onClick={() => handleShowDetail(item.id)}>
                <div className='flex flex-col'>
                  <span className='h-6 text-sm'>{item.assetCode}</span>
                  <div className='border-b-2 border-gray-300'></div>
                </div>
              </td>
              <td className='table-custom-row max-row' onClick={() => handleShowDetail(item.id)}>
                <div className='flex flex-col'>
                  <span className='h-6 text-sm'>{item.assetName}</span>
                  <div className='border-b-2 border-gray-300'></div>
                </div>
              </td>
              <td className='table-custom-row max-row' onClick={() => handleShowDetail(item.id)}>
                <div className='flex flex-col'>
                  <span className='h-6 text-sm'>{item.categoryName}</span>
                  <div className='border-b-2 border-gray-300'></div>
                </div>
              </td>
              <td className='table-custom-row max-row' onClick={() => handleShowDetail(item.id)}>
                <div className='flex flex-col'>
                  <span className='h-8 xl:h-6'>{dayjs(new Date(item.assignedDate)).format('DD/MM/YYYY')}</span>
                  <div className='border-b-2 border-gray-300'></div>
                </div>
              </td>
              <td className='table-custom-row max-row' onClick={() => handleShowDetail(item.id)}>
                <div className='flex flex-col'>
                  <span className='h-6 text-sm'>
                    {
                      states.find((state) => {
                        if (state.value.includes('1') || state.value.includes('2')) {
                          return state.value.slice(0, state.value.length - 1) === item.state;
                        }
                        return state.value === item.state;
                      })?.name
                    }
                  </span>
                  <div className='border-b-2 border-gray-300'></div>
                </div>
              </td>
              <td className='px-3 pt-1 whitespace-nowrap flex items-center'>
                <button
                  type='button'
                  disabled={item.state !== 'WAITING_FOR_ACCEPTANCE'}
                  onClick={() => {
                    openAcceptModal();
                    setSelectedAssignment(item.id);
                  }}
                >
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    className={`h-5 w-5 mr-2 text-org-light ${
                      item.state !== 'WAITING_FOR_ACCEPTANCE'
                        ? 'cursor-default opacity-50'
                        : 'cursor-pointer hover:text-org-dark opacity-100'
                    }`}
                    fill='none'
                    viewBox='0 0 24 24'
                    stroke='currentColor'
                  >
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={5} d='M5 13l4 4L19 7' />
                  </svg>
                </button>
                <button
                  type='button'
                  disabled={item.state !== 'WAITING_FOR_ACCEPTANCE'}
                  onClick={() => {
                    openDeclineModal();
                    setSelectedAssignment(item.id);
                  }}
                >
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    className={`h-5 w-5 mr-2 ${
                      item.state !== 'WAITING_FOR_ACCEPTANCE'
                        ? 'cursor-default text-gray-400'
                        : 'cursor-pointer text-black hover:text-gray-800'
                    }`}
                    fill='none'
                    viewBox='0 0 24 24'
                    stroke='currentColor'
                  >
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={5} d='M6 18L18 6M6 6l12 12' />
                  </svg>
                </button>
                <button
                  type='button'
                  disabled={item.state !== 'ACCEPT' || item.returning}
                  onClick={() => {
                    openCreateReturnModal();
                    setSelectedAssignment(item.id);
                  }}
                >
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    className={`h-5 w-5 ${
                      item.state !== 'ACCEPT' || item.returning
                        ? 'cursor-default text-gray-400'
                        : 'text-blue-500 hover:text-blue-800 cursor-pointer'
                    }`}
                    fill='none'
                    viewBox='0 0 24 24'
                    stroke='currentColor'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2.5}
                      d='M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15'
                    />
                  </svg>
                </button>
              </td>
            </tr>
          ))
        }
      />
      {(!userAssignments || userAssignments?.length === 0) && (
        <div className='w-full col-span-2 md:col-span-4 shadow-lg rounded-md my-5'>
          <div className='flex flex-col justify-center items-center w-full py-6 bg-white px-4 sm:px-6 lg:px-16'>
            <img
              src='https://ik.imagekit.io/tnyyngwxvx9/no-results_sbm3UFZiL.svg?updatedAt=1626878273006'
              alt='Not Found'
              className='h-14 w-14 mx-auto mb-4 text-gray-900'
            />
            <p className='text-base leading-5 font-medium text-gray-900 mb-3'>No Result Found</p>
          </div>
        </div>
      )}

      <Modal
        modal={modal}
        setModal={setModal}
        handled={setSelectedAssignment}
        handleSubmit={
          modal.name === 'ACCEPT'
            ? handleAcceptAssignment
            : modal.name === 'RETURN'
            ? handleCreateReturn
            : handleDeclineAssignment
        }
      />
    </div>
  );
};

export default Home;
