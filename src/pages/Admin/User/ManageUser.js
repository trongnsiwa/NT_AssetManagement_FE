/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable jsx-a11y/anchor-is-valid */
import { Transition } from '@headlessui/react';
import { ChevronDownIcon, PencilIcon } from '@heroicons/react/solid';
import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useLocation, useHistory } from 'react-router-dom';
import _ from 'lodash';
import { setHeaderTitle } from '../../../actions/HeaderTitleAction';
import Modal from '../../../components/Modal';
import Table from '../../../components/Table';
import {
  countListSearchAndFilterUser,
  countListUser,
  disableUser,
  getListSearchAndFilterUser,
  getListUser,
  getUserDetail,
} from '../../../services/user.service';
import { types, userHeader } from '../../../data/userData';
import { hideLoader, showLoader } from '../../../actions/LoaderAction';
import ReactPaginate from 'react-paginate';
import { ROLE } from '../../../constants/Role';
import { showErrorMessage } from '../../../helpers/showToast';
import { checkIfValidAssignment } from '../../../services/assignment.service';
import { checkIfDisabledUser } from '../../../services/auth.service';
import { logout } from '../../../actions/AuthAction';
import { hideModal, showDisabledUserModal } from '../../../actions/ModalAction';
import useComponentVisible from '../../../helpers/useComponentVisible';

const ManageUser = () => {
  const [users, setUsers] = useState(null);

  const [selectedType, setSelectedType] = useState('0');

  const [searchedBy, setSearchedBy] = useState('');
  const [searchedText, setSearchedText] = useState('');
  const [sortBy, setSortBy] = useState({
    direction: 'ASC',
    value: '',
  });

  const [totalPages, setTotalPages] = useState(1);
  const [pageNum, setPageNum] = useState(1);
  const pageSize = 10;

  const { ref: refType, isComponentVisible: openType, setIsComponentVisible: setOpenType } = useComponentVisible(false);

  const [selectedDisableUser, setSelectedDisableUser] = useState(null);

  const [modal, setModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    content: null,
    btnOk: '',
    isValid: true,
  });

  const { user: currentUser } = useSelector((state) => state.authReducer);
  const dispatch = useDispatch();
  const location = useLocation();
  const history = useHistory();

  const from = location?.state?.from;
  const newEntity = location.state?.newEntity;

  useEffect(() => {
    dispatch(setHeaderTitle('Manage User'));
  }, [dispatch]);

  const logOut = () => {
    dispatch(logout());
    dispatch(hideModal());
    history.push('/signin');
    history.go(0);
  };

  useEffect(() => {
    loadData();
  }, [pageNum, searchedBy, selectedType, sortBy]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    countData();
  }, [pageNum, pageSize, searchedBy, selectedType, sortBy]); // eslint-disable-line react-hooks/exhaustive-deps

  const countData = () => {
    if ((searchedBy && searchedBy.trim() !== '') || selectedType !== '0') {
      countListSearchAndFilterUser(
        currentUser.location.id,
        searchedBy.trim(),
        selectedType.split(',').length > 1 ? 0 : parseInt(selectedType)
      ).then((res) => {
        const pages = _.ceil(res.data.data / pageSize);
        setTotalPages(pages);
      });
    } else {
      countListUser(currentUser.location.id).then((res) => {
        let countable = res.data.data;
        const pages = _.ceil(countable / pageSize);
        setTotalPages(pages);
      });
    }
  };

  const loadData = () => {
    if ((searchedBy && searchedBy.trim() !== '') || selectedType !== '0') {
      getListSearchAndFilterUser(
        pageNum,
        pageSize,
        sortBy.value,
        sortBy.direction,
        currentUser.location.id,
        searchedBy.trim(),
        selectedType.split(',').length > 1 ? 0 : parseInt(selectedType)
      ).then((res) => {
        if (res.data.data) {
          setUsers(res.data.data);
        } else {
          setUsers(null);
        }
      });
    } else {
      getListUser(pageNum, pageSize, sortBy.value, sortBy.direction, currentUser.location.id).then((res) => {
        if (res.data.data) {
          let result = [];
          if (newEntity && from && from.split('/').length > 2) {
            result[0] = newEntity;
            const response = [...res.data.data].filter((item) => item.code !== result[0].code);
            result = [...result, ...response];
            history.replace(location.pathname, null);
          } else {
            result = res.data.data;
          }

          setUsers(result);
        } else {
          setUsers(null);
        }
      });
    }
  };

  const handleOpenModal = (code) => {
    if (currentUser) {
      checkIfDisabledUser(currentUser.code).then((res) => {
        if (res.data.data) {
          dispatch(showDisabledUserModal(logOut));
          return;
        } else {
          checkIfValidAssignment(code)
            .then((res) => {
              if (res.data.data) {
                setModal({
                  ...modal,
                  isOpen: true,
                  title: 'Can not disable user',
                  content:
                    'There are valid assignments belonging to this user. Please close all assignments before disabling user',
                });
              } else {
                setModal({
                  isOpen: true,
                  title: 'Are you sure?',
                  desc: '',
                  message: 'Do you want to disable this user?',
                  content: null,
                  btnOk: 'Disable',
                  isValid: true,
                });
              }
            })
            .catch((err) => {
              showErrorMessage(err, code, dispatch);
            });
        }
      });
    }
  };

  const handleShowDetail = (code) => {
    if (currentUser) {
      checkIfDisabledUser(currentUser.code).then((res) => {
        if (res.data.data) {
          dispatch(showDisabledUserModal(logOut));
          return;
        } else {
          dispatch(showLoader());

          getUserDetail(code).then((res) => {
            if (res.data.data) {
              const item = res.data.data;

              setModal({
                ...modal,
                isOpen: true,
                title: 'Detailed User Information',
                content: {
                  'Staff Code': item.code,
                  'Full Name': item.firstName + ' ' + item.lastName,
                  Username: item.username,
                  'Date of Birth': dayjs(item.dob).format('DD/MM/YYYY'),
                  Gender: item.gender ? 'Male' : 'Female',
                  'Joined Date': dayjs(item.joinedDate).format('DD/MM/YYYY'),
                  Type: item.role.name === ROLE.ADMIN ? 'Admin' : 'Staff',
                  Location: item.locationName,
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

  const handleDisableUser = () => {
    if (!selectedDisableUser) {
      return;
    }

    dispatch(showLoader());

    disableUser(selectedDisableUser)
      .then((res) => {
        setModal({
          ...modal,
          isOpen: false,
        });
        loadData();
        countData();
        dispatch(hideLoader());
      })
      .catch((err) => {
        showErrorMessage(err, selectedDisableUser, dispatch);
      });
  };

  const filterTypes = (e, isClear) => {
    let search = '';
    let value = e.target.value;

    if (!isClear) {
      if (!selectedType) {
        search = value;
      } else {
        if (value === '0') {
          search = value;
        } else {
          const indexOfValue = selectedType.indexOf('0');
          if (indexOfValue > -1) {
            if (indexOfValue === 0) {
              if (selectedType.replace('0', '').length === 0) {
                search = value;
              } else {
                search = '0';
              }
            } else {
              search = '0';
            }
          } else {
            search = '0';
          }
        }
      }
    } else {
      if (selectedType.replace(value, '').length === 0) {
        search = '0';
      } else {
        const indexOfValue = selectedType.indexOf(value);
        if (indexOfValue === 0) {
          search = selectedType.replace(selectedType.slice(indexOfValue, indexOfValue + value.length + 1), '');
        } else {
          search = selectedType.replace(selectedType.slice(indexOfValue - 1, indexOfValue + value.length), '');
        }
      }
    }

    setSelectedType(search);
  };

  return (
    <div className='relative w-full'>
      <h3 className='text-org font-bold text-base mb-5 2xl:ml-3'>User List</h3>
      <div className='w-full justify-between flex items-center xl:pr-3'>
        <div className='flex items-center w-auto'>
          <div className='relative w-2/3' ref={refType}>
            <div className='relative' onClick={() => setOpenType(!openType)}>
              <input
                type='text'
                name='type'
                placeholder='Type'
                className='2xl:ml-3 h-8 border-2 w-full rounded-md focus:outline-none text-sm cursor-default'
                value={selectedType.name}
                readOnly={true}
              />
              <span className='absolute top-0 right-0 mr-1 2xl:mr-0 pt-1.5 cursor-pointer border-l h-8 border-gray-800'>
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  className='h-5 w-5 ml-1 2xl:ml-2 hover:text-org-dark'
                  viewBox='0 0 20 20'
                  fill='currentColor'
                >
                  <path
                    fillRule='evenodd'
                    d='M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z'
                    clipRule='evenodd'
                  />
                </svg>
              </span>
            </div>
            <Transition
              show={openType}
              enter='transition duration-100 ease-out'
              enterFrom='transform scale-95 opacity-0'
              enterTo='transform scale-100 opacity-100'
              leave='transition duration-75 ease-out'
              leaveFrom='transform scale-100 opacity-100'
              leaveTo='transform scale-95 opacity-0'
            >
              <div className='flex flex-col shadow-md p-3 gap-y-2 bg-gray-50 absolute w-full border-l border-r border-b border-gray-800 rounded-b-md focus:outline-none 2xl:ml-3'>
                {types &&
                  types.map((type, index) => (
                    <div key={`type_${index}`}>
                      <label className='inline-flex flex-row items-center'>
                        <input
                          type='checkbox'
                          value={type.id}
                          className='cursor-pointer w-4 h-4 md:w-5 md:h-5'
                          onChange={(e) => {
                            if (selectedType && selectedType.includes(type.id.toString()) && type.id !== 0) {
                              filterTypes(e, true);
                            } else {
                              filterTypes(e, false);
                            }

                            setPageNum(1);
                          }}
                          checked={
                            (selectedType && selectedType.includes(type.id.toString())) ||
                            selectedType === '0' ||
                            selectedType.split(',').length > 1
                          }
                        />
                        <span className='pl-3 text-sm'>{type.name}</span>
                      </label>
                    </div>
                  ))}
              </div>
            </Transition>
          </div>
        </div>
        <div className='flex justify-end items-center'>
          <div className='relative mr-3'>
            <input
              type='search'
              name='search'
              className='pr-10 pl-5 border h-10 w-full rounded-md focus:outline-none focus:border-gray-500 focus:ring-gray-500 border-gray-600 text-sm'
              onChange={(e) => setSearchedText(e.target.value)}
            />
            <span className='absolute top-0 right-0 pt-1.5 cursor-pointer border-l h-8 border-gray-800 mr-2'>
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
          <Link
            to={'/user/create-new'}
            className='bg-org-light hover:bg-org text-white p-2 rounded-md text-sm whitespace-nowrap'
          >
            Create new user
          </Link>
        </div>
      </div>
      <Table
        headers={
          userHeader &&
          userHeader.map((header, index) => (
            <th
              scope='col'
              className='table-custom-header cursor-pointer hover:bg-gray-100 hover:text-org'
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
          users &&
          users.map((item, index) => (
            <tr key={`row_${index}`} className='hover:bg-gray-100 cursor-pointer'>
              <td className='table-custom-row max-row' onClick={() => handleShowDetail(item.code)}>
                <div className='flex flex-col'>
                  <span className='h-6 text-sm'>{item.code}</span>
                  <div className='border-b-2 border-gray-300'></div>
                </div>
              </td>
              <td className='table-custom-row break-words max-row' onClick={() => handleShowDetail(item.code)}>
                <div className='flex flex-col'>
                  <span className='h-6 text-sm'>{item.fullName}</span>
                  <div className='border-b-2 border-gray-300'></div>
                </div>
              </td>
              <td className='table-custom-row max-row' onClick={() => handleShowDetail(item.code)}>
                <div className='flex flex-col'>
                  <span className='h-6 text-sm'>{item.username}</span>
                  <div className='border-b-2 border-gray-300'></div>
                </div>
              </td>
              <td className='table-custom-row max-row' onClick={() => handleShowDetail(item.code)}>
                <div className='flex flex-col'>
                  <span className='h-6 text-sm'>{dayjs(new Date(item.joinedDate)).format('DD/MM/YYYY')}</span>
                  <div className='border-b-2 border-gray-300'></div>
                </div>
              </td>
              <td className='table-custom-row max-row' onClick={() => handleShowDetail(item.code)}>
                <div className='flex flex-col'>
                  <span className='h-6 text-sm'>{item.roleName}</span>
                  <div className='border-b-2 border-gray-300'></div>
                </div>
              </td>
              <td className='px-3 pt-1 whitespace-nowrap flex items-center gap-x-3'>
                <Link
                  to={`/user/${item.code}`}
                  className={`${currentUser.code === item.code ? 'pointer-events-none' : ''}`}
                >
                  <PencilIcon
                    className={`h-5 w-5 ${
                      currentUser.code === item.code
                        ? 'text-gray-400 cursor-default'
                        : 'cursor-pointer hover:text-indigo-300'
                    }`}
                  />
                </Link>
                <button
                  onClick={() => {
                    setSelectedDisableUser(item.code);
                    handleOpenModal(item.code);
                  }}
                  disabled={currentUser.code === item.code}
                >
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    className={`h-5 w-5 ${
                      currentUser.code === item.code
                        ? 'text-gray-400 cursor-default'
                        : 'text-red-500 hover:text-red-800 cursor-pointer'
                    }`}
                    fill='none'
                    viewBox='0 0 24 24'
                    stroke='currentColor'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z'
                    />
                  </svg>
                </button>
              </td>
            </tr>
          ))
        }
      />
      {searchedBy && (!users || users?.length === 0) && (
        <div className='min-w-screen col-span-2 md:col-span-4 shadow-lg rounded-md my-5'>
          <div className='flex flex-col justify-center items-center w-full py-6 bg-white px-4 sm:px-6 lg:px-16'>
            <img
              src='https://ik.imagekit.io/tnyyngwxvx9/no-results_sbm3UFZiL.svg?updatedAt=1626878273006'
              alt='Not Found'
              className='h-14 w-14 mx-auto mb-4 text-gray-900'
            />
            <p className='text-base leading-5 font-medium text-gray-900 mb-3'>No Result Found</p>
            <p className='text-sm'>We did not find user has code or name "{searchedBy}" for your search.</p>
          </div>
        </div>
      )}
      {!searchedBy && (!users || users?.length === 0) && (
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

      <Modal modal={modal} setModal={setModal} handleSubmit={handleDisableUser} />

      <div className='flex justify-end mt-5 xl:pr-3'>
        <div>
          <ReactPaginate
            previousLabel={'Previous'}
            nextLabel={'Next'}
            pageCount={totalPages}
            pageRangeDisplayed={3}
            marginPagesDisplayed={1}
            onPageChange={({ selected }) => setPageNum(selected + 1)}
            containerClassName={'flex'}
            breakClassName={'bg-white border-gray-300 text-gray-500 relative inline-flex items-center p-1 border'}
            previousLinkClassName={`inline-flex rounded-l-md  items-center p-1 px-2 border border-gray-300 bg-white text-gray-500 text-sm ${
              !users || users?.length === 0 || totalPages === 1
                ? 'hidden'
                : pageNum === 1
                ? 'text-gray-400 cursor-default'
                : 'text-org-light hover:bg-gray-50'
            }`}
            nextLinkClassName={`inline-flex items-center p-1 px-2 rounded-r-md border border-gray-300 bg-white text-sm ${
              !users || users?.length === 0 || totalPages === 1
                ? 'hidden'
                : pageNum === totalPages
                ? 'text-gray-400 cursor-default'
                : 'text-org-light hover:bg-gray-50'
            }`}
            activeClassName={'bg-org-light cursor-pointer text-sm'}
            activeLinkClassName={'text-white'}
            pageClassName={`${
              totalPages > 1
                ? 'bg-white border-gray-300 text-org-light hover:bg-org-light hover:text-white relative inline-flex items-center border cursor-pointer text-sm'
                : 'hidden'
            } `}
            pageLinkClassName={'p-1 px-2 text-sm'}
            forcePage={pageNum - 1}
          />
        </div>
      </div>
    </div>
  );
};

export default ManageUser;
