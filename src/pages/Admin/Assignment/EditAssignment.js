import React, { Fragment, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import Calendar from 'react-calendar';
import Tippy from '@tippyjs/react';
import dayjs from 'dayjs';
import { setHeaderTitle } from '../../../actions/HeaderTitleAction';
import { Link, useHistory } from 'react-router-dom';
import ERRORS from '../../../constants/ErrorCode';
import { hideLoader, showLoader } from '../../../actions/LoaderAction';
import { showError, showErrorMessage } from '../../../helpers/showToast';
import { format } from '../../../helpers/formatString';
import { clearMessage } from '../../../actions/MessageAction';
import { showStoreErrorMessage } from '../../../helpers/setErrorMessage';
import { assetHeaderForm, userHeaderForm } from '../../../data/assignmentData';
import Table from '../../../components/Table';
import { ChevronDownIcon } from '@heroicons/react/solid';
import { Transition } from '@headlessui/react';
import { countListSearchAndFilterUser, getListSearchAndFilterUser } from '../../../services/user.service';
import { countListSearchAndFilterAsset, getListSearchAndFilterAsset } from '../../../services/asset.service';
import _ from 'lodash';
import { getAssignmentDetail, updateAssignment } from '../../../services/assignment.service';
import { checkIfDisabledUser } from '../../../services/auth.service';
import { logout } from '../../../actions/AuthAction';
import { hideModal, showDisabledUserModal } from '../../../actions/ModalAction';

const EditAssignment = (props) => {
  const { id } = props.match.params;

  const [assignment, setAssignment] = useState(null);

  const [users, setUsers] = useState([]);
  const [assets, setAssets] = useState([]);

  const [selectedUser, setSelectedUser] = useState({
    visible: false,
    value: null,
    name: '',
  });
  const [previousAsset, setPreviousAsset] = useState(null);
  const [selectedAsset, setSelectedAsset] = useState({
    visible: false,
    value: null,
    name: '',
  });
  const [assignedDate, setAssignedDate] = useState({
    visible: false,
    value: new Date(),
  });

  const [searchedBy, setSearchedBy] = useState('');
  const [searchedText, setSearchedText] = useState('');
  const [sortBy, setSortBy] = useState({
    value: '',
    direction: 'ASC',
  });

  const [pageNum, setPageNum] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 5;

  const { user: currentUser } = useSelector((state) => state.authReducer);
  const { message } = useSelector((state) => state.messageReducer);
  const dispatch = useDispatch();
  const history = useHistory();

  const { register, handleSubmit, reset } = useForm({
    mode: 'all',
  });

  useEffect(() => {
    dispatch(setHeaderTitle('Manage Assignment > Edit Assignment'));
  }, [dispatch]);

  const logOut = () => {
    dispatch(logout());
    dispatch(hideModal());
    history.push('/signin');
    history.go(0);
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const loadUserData = () => {
    if (selectedUser.visible) {
      getListSearchAndFilterUser(
        pageNum,
        pageSize,
        sortBy.value,
        sortBy.direction,
        currentUser.location.id,
        searchedBy.trim(),
        0
      ).then((res) => {
        if (res.data.data) {
          if (pageNum === 1) {
            setUsers(res.data.data);
          } else {
            setUsers([...users, ...res.data.data]);
          }
        } else {
          setUsers([]);
        }
      });
    }
  };

  const countUserData = () => {
    if (selectedUser.visible) {
      countListSearchAndFilterUser(currentUser.location.id, searchedBy.trim(), 0).then((res) => {
        const pages = _.ceil(res.data.data / pageSize);
        setTotalPages(pages);
      });
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const loadAssetData = () => {
    if (selectedAsset.visible) {
      getListSearchAndFilterAsset(
        pageNum,
        pageSize,
        sortBy.value,
        sortBy.direction,
        currentUser.location.id,
        searchedBy.trim(),
        'AVAILABLE',
        ''
      ).then((res) => {
        if (res.data.data) {
          if (pageNum === 1) {
            setAssets(res.data.data);
          } else {
            setAssets([...assets, ...res.data.data]);
          }
        } else {
          setAssets([]);
        }
      });
    }
  };

  const countAssetData = () => {
    if (selectedAsset.visible) {
      countListSearchAndFilterAsset(currentUser.location.id, searchedBy.trim(), 'AVAILABLE', '').then((res) => {
        const pages = _.ceil(res.data.data / pageSize);
        setTotalPages(pages);
      });
    }
  };

  const scrollEvent = (e) => {
    var bottom = e.target.scrollHeight - e.target.scrollTop - e.target.clientHeight < 1;

    if (bottom && pageNum < totalPages) {
      setPageNum(pageNum + 1);
    }
  };

  useEffect(() => {
    loadUserData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedUser.visible, pageNum, searchedBy, sortBy]);

  useEffect(() => {
    countUserData();
  }, [selectedUser.visible, pageNum, searchedBy, sortBy]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    loadAssetData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAsset.visible, pageNum, searchedBy, sortBy]);

  useEffect(() => {
    countAssetData();
  }, [selectedAsset.visible, pageNum, searchedBy, sortBy]); //eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    dispatch(showLoader());

    getAssignmentDetail(id)
      .then((res) => {
        if (res.data.data) {
          setAssignment(res.data.data);
          dispatch(hideLoader());
        } else {
          showError(format(ERRORS[res.data.errorCode], id));
          dispatch(hideLoader());
          props.history.push('/assignment');
        }
      })
      .catch((err) => {
        showErrorMessage(err, id, dispatch);
        props.history.push('/assignment');
      });
  }, [id, dispatch, props.history]);

  useEffect(() => {
    if (assignment) {
      setAssignedDate({
        ...assignedDate,
        value: new Date(assignment.assignedDate),
      });
    }
  }, [assignment]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (assignment) {
      setSelectedUser({
        ...selectedUser,
        name: assignment.assignedToFullName,
        value: assignment.assignedTo,
      });
    }
  }, [assignment]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (assignment) {
      setSelectedAsset({
        ...selectedAsset,
        name: assignment.assetName,
        value: assignment.assetId,
      });
    }
  }, [assignment]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (assignment) {
      setPreviousAsset(assignment.assetId);
    }
  }, [assignment]); // eslint-disable-line react-hooks/exhaustive-deps

  const editAssignment = ({ note }) => {
    if (currentUser) {
      checkIfDisabledUser(currentUser.code).then((res) => {
        if (res.data.data) {
          dispatch(showDisabledUserModal(logOut));
          return;
        } else {
          var dateAssigned = null;

          dateAssigned = new Date(new Date(assignedDate.value).setHours(0, 0, 0, 0));

          dateAssigned = new Date(dateAssigned.getTime() - dateAssigned.getTimezoneOffset() * 60000).toJSON();

          dispatch(showLoader());

          updateAssignment(id, selectedUser.value, previousAsset, selectedAsset.value, dateAssigned, note)
            .then((res) => {
              dispatch(clearMessage());
              dispatch(hideLoader());
              reset();
              history.push({
                pathname: '/assignment',
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

  const saveSelectedUser = () => {
    if (currentUser) {
      checkIfDisabledUser(currentUser.code).then((res) => {
        if (res.data.data) {
          dispatch(showDisabledUserModal(logOut));
          return;
        } else {
          setSelectedUser({
            ...selectedUser,
            visible: false,
          });

          setSearchedBy('');
          setSearchedText('');
          setSortBy({
            value: '',
            direction: 'ASC',
          });
          setPageNum(1);
        }
      });
    }
  };

  const saveSelectedAsset = () => {
    setSelectedAsset({
      ...selectedAsset,
      visible: false,
    });

    setSearchedBy('');
    setSearchedText('');
    setSortBy({
      value: '',
      direction: 'ASC',
    });
    setPageNum(1);
  };

  const cancelSelectedUser = () => {
    if (currentUser) {
      checkIfDisabledUser(currentUser.code).then((res) => {
        if (res.data.data) {
          dispatch(showDisabledUserModal(logOut));
          return;
        } else {
          setSelectedUser({
            ...selectedUser,
            visible: false,
          });
          setSearchedBy('');
          setSearchedText('');
          setSortBy({
            value: '',
            direction: 'ASC',
          });
          setPageNum(1);
        }
      });
    }
  };

  const cancelSelectedAsset = () => {
    setSelectedAsset({
      ...selectedAsset,
      visible: false,
    });
    setSearchedBy('');
    setSearchedText('');
    setSortBy({
      value: '',
      direction: 'ASC',
    });
    setPageNum(1);
  };

  const invisibleUser = () => {
    setSelectedUser({
      ...selectedUser,
      visible: false,
    });
    setSearchedBy('');
    setSearchedText('');
    setSortBy({
      value: '',
      direction: 'ASC',
    });
    setPageNum(1);
  };

  const invisibleAsset = () => {
    setSelectedAsset({
      ...selectedAsset,
      visible: false,
    });
    setSearchedBy('');
    setSearchedText('');
    setSortBy({
      value: '',
      direction: 'ASC',
    });
    setPageNum(1);
  };

  return (
    <div className='container'>
      <h3 className='text-org font-bold text-base mb-5'>Edit Assignment</h3>
      <div className='mt-6'>
        {assignment && (
          <form
            className='mb-0 grid-cols-3 inline-grid space-y-4 w-full lg:mr-16'
            onSubmit={handleSubmit(editAssignment)}
          >
            {message && <p className='error-message col-span-3'>{message}</p>}
            <div className='flex items-center'>
              <label htmlFor='user' className='block'>
                User
              </label>
            </div>
            <div className='flex items-center col-span-2 relative w-full'>
              <div className='relative input-field'>
                <input
                  type='text'
                  name='user'
                  id='user'
                  defaultValue={selectedUser.name}
                  className='cursor-default'
                  readOnly={true}
                  onClick={() => {
                    setSelectedUser({
                      ...selectedUser,
                      visible: true,
                    });
                    invisibleAsset();
                  }}
                />
                <span className='absolute top-0 right-0 pt-1.5 cursor-pointer mr-2'>
                  <svg
                    stroke='currentColor'
                    fill='none'
                    strokeWidth='2'
                    viewBox='0 0 24 24'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    className='stroke-current h-5 w-5 text-gray-500 ml-2 cursor-pointer hover:text-org-dark'
                    height='1em'
                    width='1em'
                    xmlns='http://www.w3.org/2000/svg'
                    onClick={() => {
                      setSelectedUser({
                        ...selectedUser,
                        visible: true,
                      });
                      invisibleAsset();
                    }}
                  >
                    <circle cx='11' cy='11' r='8'></circle>
                    <line x1='21' y1='21' x2='16.65' y2='16.65'></line>
                  </svg>
                </span>
              </div>
              <Transition
                show={selectedUser.visible}
                as={Fragment}
                enter='transition duration-100 ease-out'
                enterFrom='transform scale-95 opacity-0'
                enterTo='transform scale-100 opacity-100'
                leave='transition duration-75 ease-out'
                leaveFrom='transform scale-100 opacity-100'
                leaveTo='transform scale-95 opacity-0'
              >
                <div
                  className='absolute h-auto top-0 left-0 bg-white border border-gray-600 shadow-md rounded-md p-5 z-10'
                  style={{ width: '35rem' }}
                >
                  <div className='flex items-center justify-between w-full h-full'>
                    <h3 className='text-org font-bold text-lg mb-5'>Select User</h3>
                    <div className='relative mr-3'>
                      <input
                        type='search'
                        name='search'
                        className='pr-10 pl-5 border h-10 w-full rounded-md focus:outline-none focus:border-gray-500 focus:ring-gray-500 border-gray-600'
                        onChange={(e) => setSearchedText(e.target.value)}
                      />
                      <span className='absolute top-0 right-0 pt-1.5 cursor-pointer border-l h-8 border-gray-800 mr-3'>
                        <svg
                          stroke='currentColor'
                          fill='none'
                          strokeWidth='2'
                          viewBox='0 0 24 24'
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          className='stroke-current h-5 w-5 text-gray-500 ml-2 cursor-pointer hover:text-org-dark'
                          height='1em'
                          width='1em'
                          xmlns='http://www.w3.org/2000/svg'
                          onClick={() => {
                            setSearchedBy(searchedText);
                            setPageNum(1);
                          }}
                        >
                          <circle cx='11' cy='11' r='8'></circle>
                          <line x1='21' y1='21' x2='16.65' y2='16.65'></line>
                        </svg>
                      </span>
                    </div>
                  </div>
                  <div className='w-full relative'>
                    <Table
                      inForm={true}
                      rowLength={users.length}
                      scrollEvent={scrollEvent}
                      headers={
                        <>
                          <th className='my-3 px-3 tracking-wider bg-white sticky top-0'></th>
                          {userHeaderForm &&
                            userHeaderForm.map(
                              (header, index) =>
                                index > 0 && (
                                  <th
                                    scope='col'
                                    className='sticky 
                                  top-0 
                                  bg-white
                                  table-custom-header cursor-pointer hover:bg-gray-100 hover:text-org'
                                    key={`header_user_${index}`}
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
                                      setPageNum(1);
                                    }}
                                  >
                                    <div className='flex flex-col'>
                                      <div className='flex items-center justify-start h-10 xl:h-6 w-full'>
                                        {header.label}
                                        <ChevronDownIcon className='h-4 w-4 ml-2' />
                                      </div>
                                      <div
                                        className={`${
                                          sortBy.value === header.value ? 'border-b-2' : 'border-b'
                                        } border-gray-800`}
                                      ></div>
                                    </div>
                                  </th>
                                )
                            )}
                        </>
                      }
                      rows={
                        users.length > 0 &&
                        users.map((item, index) => (
                          <tr
                            key={`row_${index}`}
                            className='hover:bg-gray-100 cursor-pointer'
                            onClick={() => {
                              if (item.code !== currentUser.code) {
                                setSelectedUser({
                                  ...selectedUser,
                                  value: item.username,
                                  name: item.fullName,
                                });
                              }
                            }}
                          >
                            <td className='px-3 pt-1 whitespace-nowrap flex items-center' colSpan={1}>
                              <input
                                type='radio'
                                name='asset'
                                value={item.username}
                                disabled={item.code === currentUser.code}
                                checked={selectedUser.value === item.username}
                                onChange={(e) =>
                                  setSelectedUser({
                                    ...selectedUser,
                                    value: e.target.value,
                                    name: item.fullName,
                                  })
                                }
                              />
                            </td>
                            <td className='table-custom-row' width={250}>
                              <div className='flex flex-col'>
                                <span className='h-8 xl:h-6'>{item.code}</span>
                                <div className='border-b-2 border-gray-300'></div>
                              </div>
                            </td>
                            <td className='table-custom-row' width={450}>
                              <div className='flex flex-col'>
                                <span className='h-8 xl:h-6'>{item.fullName}</span>
                                <div className='border-b-2 border-gray-300'></div>
                              </div>
                            </td>
                            <td className='table-custom-row' width={150}>
                              <div className='flex flex-col'>
                                <span className='h-8 xl:h-6'>{item.roleName}</span>
                                <div className='border-b-2 border-gray-300'></div>
                              </div>
                            </td>
                          </tr>
                        ))
                      }
                    />
                    {searchedBy && users.length === 0 && (
                      <div className='w-full col-span-2 md:col-span-4 absolute top-0 left-0 my-5 mt-14'>
                        <div className='flex flex-col justify-center items-center w-full bg-white px-4 sm:px-6 lg:px-16'>
                          <img
                            src='https://ik.imagekit.io/tnyyngwxvx9/no-results_sbm3UFZiL.svg?updatedAt=1626878273006'
                            alt='Not Found'
                            className='h-14 w-16=4 mx-auto mb-4 text-gray-900'
                          />
                          <p className='text-base leading-5 font-medium text-gray-900 mb-3'>No Result Found</p>
                          <p className='text-sm'>No result were found to match your search "{searchedBy}".</p>
                        </div>
                      </div>
                    )}
                    {!searchedBy && users.length === 0 && (
                      <div className='w-full col-span-2 md:col-span-4 absolute top-0 left-0 my-5 mt-14'>
                        <div className='flex flex-col justify-center items-center w-full bg-white px-4 sm:px-6 lg:px-16'>
                          <img
                            src='https://ik.imagekit.io/tnyyngwxvx9/no-results_sbm3UFZiL.svg?updatedAt=1626878273006'
                            alt='Not Found'
                            className='h-14 w-14 mx-auto mb-4 text-gray-900'
                          />
                          <p className='text-base leading-5 font-medium text-gray-900 mb-3'>No Result Found</p>
                        </div>
                      </div>
                    )}

                    <div className='flex justify-end items-center gap-5 pt-7'>
                      {users && users.length > 0 && (
                        <button
                          type='button'
                          className={`text-white p-1.5 rounded-md w-20 ${
                            !selectedUser.value
                              ? 'bg-gray-500 cursor-default'
                              : 'bg-org-light hover:bg-org focus:bg-org'
                          }`}
                          disabled={!selectedUser.value}
                          onClick={saveSelectedUser}
                        >
                          Save
                        </button>
                      )}
                      <button
                        type='button'
                        className='bg-white text-gray-600 p-1.5 border border-gray-600 rounded-md w-20 text-center hover:border-gray-800 hover:text-gray-800'
                        onClick={cancelSelectedUser}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              </Transition>
            </div>
            <div className='flex items-center'>
              <label htmlFor='asset' className='block'>
                Asset
              </label>
            </div>
            <div className='flex items-center col-span-2 relative w-full'>
              <div className='relative input-field'>
                <input
                  type='text'
                  name='user'
                  id='asset'
                  defaultValue={selectedAsset.name}
                  className='cursor-default'
                  readOnly={true}
                  onClick={() => {
                    setSelectedAsset({
                      ...selectedAsset,
                      visible: true,
                    });
                    invisibleUser();
                  }}
                />
                <span className='absolute top-0 right-0 pt-1.5 cursor-pointer mr-2'>
                  <svg
                    stroke='currentColor'
                    fill='none'
                    strokeWidth='2'
                    viewBox='0 0 24 24'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    className='stroke-current h-5 w-5 text-gray-500 ml-2 cursor-pointer hover:text-org-dark'
                    height='1em'
                    width='1em'
                    xmlns='http://www.w3.org/2000/svg'
                    onClick={() => {
                      setSelectedAsset({
                        ...selectedAsset,
                        visible: true,
                      });
                      invisibleUser();
                    }}
                  >
                    <circle cx='11' cy='11' r='8'></circle>
                    <line x1='21' y1='21' x2='16.65' y2='16.65'></line>
                  </svg>
                </span>
              </div>
              <Transition
                show={selectedAsset.visible}
                as={Fragment}
                enter='transition duration-100 ease-out'
                enterFrom='transform scale-95 opacity-0'
                enterTo='transform scale-100 opacity-100'
                leave='transition duration-75 ease-out'
                leaveFrom='transform scale-100 opacity-100'
                leaveTo='transform scale-95 opacity-0'
              >
                <div
                  className='absolute h-auto top-0 left-0 bg-white border border-gray-600 shadow-md rounded-md p-5 z-10'
                  style={{ width: '35rem' }}
                >
                  <div className='flex items-center justify-between w-full h-full'>
                    <h3 className='text-org font-bold text-lg mb-5'>Select Asset</h3>
                    <div className='relative mr-3'>
                      <input
                        type='search'
                        name='search'
                        className='pr-10 pl-5 border h-10 w-full rounded-md focus:outline-none focus:border-gray-500 focus:ring-gray-500 border-gray-600'
                        onChange={(e) => setSearchedText(e.target.value)}
                      />
                      <span className='absolute top-0 right-0 pt-2 cursor-pointer border-l h-8 border-gray-800 mr-2'>
                        <svg
                          stroke='currentColor'
                          fill='none'
                          strokeWidth='2'
                          viewBox='0 0 24 24'
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          className='stroke-current h-5 w-5 text-gray-500 ml-2 cursor-pointer hover:text-org-dark'
                          height='1em'
                          width='1em'
                          xmlns='http://www.w3.org/2000/svg'
                          onClick={() => {
                            setSearchedBy(searchedText);
                            setPageNum(1);
                          }}
                        >
                          <circle cx='11' cy='11' r='8'></circle>
                          <line x1='21' y1='21' x2='16.65' y2='16.65'></line>
                        </svg>
                      </span>
                    </div>
                  </div>
                  <div className='w-full relative'>
                    <Table
                      inForm={true}
                      rowLength={assets.length}
                      scrollEvent={scrollEvent}
                      headers={
                        <>
                          <th className='my-3 px-3 tracking-wider sticky top-0 bg-white'></th>
                          {assetHeaderForm &&
                            assetHeaderForm.map(
                              (header, index) =>
                                index > 0 && (
                                  <th
                                    scope='col'
                                    className='sticky top-0 bg-white table-custom-header cursor-pointer hover:bg-gray-100 hover:text-org'
                                    key={`header_asset_${index}`}
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
                                      setPageNum(1);
                                    }}
                                  >
                                    <div className='flex flex-col'>
                                      <div className='flex items-center justify-start h-10 xl:h-6 w-full'>
                                        {header.label}
                                        <ChevronDownIcon className='h-4 w-4 ml-2' />
                                      </div>
                                      <div
                                        className={`${
                                          sortBy.value === header.value ? 'border-b-2' : 'border-b'
                                        } border-gray-800`}
                                      ></div>
                                    </div>
                                  </th>
                                )
                            )}
                        </>
                      }
                      rows={
                        assets &&
                        assets.map((item, index) => (
                          <tr
                            key={`row_${index}`}
                            className='hover:bg-gray-100 cursor-pointer'
                            onClick={() =>
                              setSelectedAsset({
                                ...selectedAsset,
                                value: item.id,
                                name: item.name,
                              })
                            }
                          >
                            <td className='px-3 pt-1 whitespace-nowrap flex items-center'>
                              <input
                                type='radio'
                                name='asset'
                                value={item.id}
                                checked={selectedAsset.value === item.id}
                                onChange={(e) =>
                                  setSelectedAsset({
                                    ...selectedAsset,
                                    value: e.target.value,
                                    name: item.name,
                                  })
                                }
                              />
                            </td>
                            <td className='table-custom-row' width={200}>
                              <div className='flex flex-col'>
                                <span className='h-8 xl:h-6'>{item.code}</span>
                                <div className='border-b-2 border-gray-300'></div>
                              </div>
                            </td>
                            <td className='table-custom-row' width={450}>
                              <div className='flex flex-col'>
                                <span className='h-8 xl:h-6'>{item.name}</span>
                                <div className='border-b-2 border-gray-300'></div>
                              </div>
                            </td>
                            <td className='table-custom-row' width={150}>
                              <div className='flex flex-col'>
                                <span className='h-8 xl:h-6'>{item.categoryName}</span>
                                <div className='border-b-2 border-gray-300'></div>
                              </div>
                            </td>
                          </tr>
                        ))
                      }
                    />
                    {searchedBy && assets.length === 0 && (
                      <div className='w-full col-span-2 md:col-span-4 my-5 absolute top-0 left-0 mt-14'>
                        <div className='flex flex-col justify-center items-center w-full bg-white px-4 sm:px-6 lg:px-16'>
                          <img
                            src='https://ik.imagekit.io/tnyyngwxvx9/no-results_sbm3UFZiL.svg?updatedAt=1626878273006'
                            alt='Not Found'
                            className='h-14 w-14 mx-auto mb-4 text-gray-900'
                          />
                          <p className='text-base leading-5 font-medium text-gray-900 mb-3'>No Result Found</p>
                          <p className='text-sm'>No result were found to match your search "{searchedBy}".</p>
                        </div>
                      </div>
                    )}
                    {!searchedBy && assets.length === 0 && (
                      <div className='w-full col-span-2 md:col-span-4 my-5 absolute top-0 left-0 mt-14'>
                        <div className='flex flex-col justify-center items-center w-full bg-white px-4 sm:px-6 lg:px-16'>
                          <img
                            src='https://ik.imagekit.io/tnyyngwxvx9/no-results_sbm3UFZiL.svg?updatedAt=1626878273006'
                            alt='Not Found'
                            className='h-14 w-14 mx-auto mb-4 text-gray-900'
                          />
                          <p className='text-base leading-5 font-medium text-gray-900 mb-3'>No Result Found</p>
                        </div>
                      </div>
                    )}

                    <div className='flex justify-end items-center gap-5 pt-7'>
                      {assets && assets.length > 0 && (
                        <button
                          type='button'
                          className={`text-white p-1.5 rounded-md w-20 ${
                            !selectedAsset.value
                              ? 'bg-gray-500 cursor-default'
                              : 'bg-org-light hover:bg-org focus:bg-org'
                          }`}
                          disabled={!selectedAsset.value}
                          onClick={saveSelectedAsset}
                        >
                          Save
                        </button>
                      )}
                      <button
                        type='button'
                        className='bg-white text-gray-600 p-1.5 border border-gray-600 rounded-md w-20 text-center hover:border-gray-800 hover:text-gray-800'
                        onClick={cancelSelectedAsset}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              </Transition>
            </div>
            <div className='flex items-center'>
              <label htmlFor='saleFromDate' className='block text-gray-700'>
                Assigned Date
              </label>
            </div>
            <div className='flex items-center col-span-2'>
              <div
                className='input-field'
                onClick={() =>
                  setAssignedDate({
                    ...assignedDate,
                    visible: true,
                  })
                }
              >
                <div>
                  <Tippy
                    visible={assignedDate.visible}
                    onClickOutside={() =>
                      setAssignedDate({
                        ...assignedDate,
                        visible: false,
                      })
                    }
                    interactive={true}
                    placement={'bottom'}
                    theme={'light-border'}
                    content={
                      <Calendar
                        onChange={(value, event) =>
                          setAssignedDate({
                            visible: false,
                            value,
                          })
                        }
                        minDate={new Date()}
                        maxDate={new Date(new Date().setDate(new Date().getDate() + 30))}
                        value={assignedDate.value}
                        className='ring-2 ring-org shadow-lg rounded-base hover:text-brand-dark'
                      />
                    }
                  >
                    <div className='relative'>
                      <input
                        type='text'
                        value={dayjs(assignedDate.value).format('DD/MM/YYYY')}
                        readOnly={true}
                        className='cursor-default'
                      />
                      <input
                        type='hidden'
                        name='assignedDate'
                        id='assignedDate'
                        {...register('assignedDate')}
                        value={assignedDate.value}
                      />
                      <span className='absolute top-0 right-0 mt-1 mr-2 cursor-pointer'>
                        <svg
                          xmlns='http://www.w3.org/2000/svg'
                          className='h-6 w-6 text-gray-600 hover:text-indigo-300'
                          viewBox='0 0 20 20'
                          fill='currentColor'
                          onClick={() =>
                            setAssignedDate({
                              ...assignedDate,
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
              <label htmlFor='note' className='block'>
                Note
              </label>
            </div>
            <div className='flex items-center col-span-2'>
              <div className='input-field'>
                <textarea
                  draggable={false}
                  className='resize-none'
                  defaultValue={assignment.note ? assignment.note : ''}
                  {...register('note')}
                  rows={4}
                />
              </div>
            </div>
            <div></div>
            <div className='col-span-2 w-60 flex justify-end items-center gap-5 pt-10'>
              <button
                type='submit'
                className={`text-white p-2 rounded-md w-20 ${
                  !selectedUser.value || !selectedAsset.value || !assignedDate.value
                    ? 'bg-gray-500 cursor-default'
                    : 'bg-org-light hover:bg-org focus:bg-org'
                }`}
                disabled={!selectedUser.value || !selectedAsset.value || !assignedDate.value}
              >
                Save
              </button>
              <Link
                to={{
                  pathname: '/assignment',
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

export default EditAssignment;
