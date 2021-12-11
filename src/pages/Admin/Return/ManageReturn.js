import React, { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setHeaderTitle } from '../../../actions/HeaderTitleAction';
import { Transition } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/solid';
import dayjs from 'dayjs';
import { useState } from 'react';
import { useHistory } from 'react-router-dom';
import Modal from '../../../components/Modal';
import Table from '../../../components/Table';
import { hideLoader, showLoader } from '../../../actions/LoaderAction';
import ReactPaginate from 'react-paginate';
import Calendar from 'react-calendar';
import { showError, showErrorMessage } from '../../../helpers/showToast';
import ERRORS from '../../../constants/ErrorCode';
import _ from 'lodash';
import {
  cancelReturn,
  completeReturn,
  countListReturn,
  countListSearchAndFilterReturn,
  getListReturn,
  getListSearchAndFilterReturn,
  getReturnLastDate,
} from '../../../services/return.service';
import { returnHeaders, states } from '../../../data/returnData';
import { logout } from '../../../actions/AuthAction';
import { hideModal, showDisabledUserModal } from '../../../actions/ModalAction';
import { checkIfDisabledUser } from '../../../services/auth.service';
import useComponentVisible from '../../../helpers/useComponentVisible';

const ManageReturn = () => {
  const [returns, setReturns] = useState(null);

  const [selectedState, setSelectedState] = useState('All');
  const [returnedDate, setReturnedDate] = useState({
    visible: false,
    value: null,
  });
  const [latestDate, setLatestDate] = useState(null);

  const [searchedBy, setSearchedBy] = useState('');
  const [searchedText, setSearchedText] = useState('');
  const [sortBy, setSortBy] = useState({
    direction: 'ASC',
    value: '',
  });

  const [totalPages, setTotalPages] = useState(1);
  const [pageNum, setPageNum] = useState(1);
  const pageSize = 10;

  const [selectedReturn, setSelectedReturn] = useState(null);

  const {
    ref: refState,
    isComponentVisible: openState,
    setIsComponentVisible: setOpenState,
  } = useComponentVisible(false);
  const wrapperRef = useRef(null);
  useOutsideAlerter(wrapperRef);

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
  const history = useHistory();

  useEffect(() => {
    dispatch(setHeaderTitle('Request for Returning'));
  }, [dispatch]);

  useEffect(() => {
    getReturnLastDate().then((res) => {
      let result = new Date();
      if (res.data.data) {
        result = new Date(res.data.data);
      }
      setLatestDate(result.setDate(result.getDate()));
    });
  }, []);

  useEffect(() => {
    loadData();
  }, [pageNum, searchedBy, selectedState, returnedDate.value, sortBy]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    countData();
  }, [pageNum, searchedBy, selectedState, returnedDate.value, sortBy]); // eslint-disable-line react-hooks/exhaustive-deps

  const countData = () => {
    if ((searchedBy && searchedBy.trim() !== '') || selectedState !== 'All' || returnedDate.value) {
      var dateReturn = null;
      if (returnedDate.value) {
        dateReturn = new Date(new Date(returnedDate.value).setHours(0, 0, 0, 0));

        dateReturn = new Date(dateReturn.getTime() - dateReturn.getTimezoneOffset() * 60000).toJSON();
      }

      countListSearchAndFilterReturn(
        selectedState.split(',').length > 1 || selectedState === 'All' ? null : selectedState,
        searchedBy.trim(),
        dateReturn
      ).then((res) => {
        const pages = _.ceil(res.data.data / pageSize);
        setTotalPages(pages);
      });
    } else {
      countListReturn().then((res) => {
        const pages = _.ceil(res.data.data / pageSize);
        setTotalPages(pages);
      });
    }
  };

  const loadData = () => {
    if ((searchedBy && searchedBy.trim() !== '') || selectedState !== 'All' || returnedDate.value) {
      var dateReturn = null;
      if (returnedDate.value) {
        dateReturn = new Date(new Date(returnedDate.value).setHours(0, 0, 0, 0));

        dateReturn = new Date(dateReturn.getTime() - dateReturn.getTimezoneOffset() * 60000).toJSON();
      }

      getListSearchAndFilterReturn(
        pageNum,
        pageSize,
        sortBy.value.trim(),
        sortBy.direction.trim(),
        selectedState.split(',').length > 1 || selectedState === 'All' ? null : selectedState,
        searchedBy.trim(),
        dateReturn
      ).then((res) => {
        if (res.data.data) {
          setReturns(res.data.data);
        } else {
          setReturns(null);
        }
      });
    } else {
      getListReturn(pageNum, pageSize, sortBy.value.trim(), sortBy.direction.trim()).then((res) => {
        if (res.data.data) {
          setReturns(res.data.data);
        } else {
          setReturns(null);
        }
      });
    }
  };

  const logOut = () => {
    dispatch(logout());
    dispatch(hideModal());
    history.push('/signin');
    history.go(0);
  };

  const handleCompleteReturn = () => {
    if (!selectedReturn) {
      return;
    }

    dispatch(showLoader());

    completeReturn(selectedReturn, currentUser.code)
      .then((res) => {
        if (res.data.successCode) {
          setModal({
            ...modal,
            isOpen: false,
          });
          loadData();
          countData();
        } else {
          showError(ERRORS[res.data.errorCode]);
        }

        dispatch(hideLoader());
      })
      .catch((err) => {
        showErrorMessage(err, selectedReturn, dispatch);
      });

    setSelectedReturn(null);
  };

  const handleCancelReturn = () => {
    if (!selectedReturn) {
      return;
    }

    dispatch(showLoader());

    cancelReturn(selectedReturn)
      .then((res) => {
        if (res.data.successCode) {
          setModal({
            ...modal,
            isOpen: false,
          });
          loadData();
          countData();
        } else {
          showError(ERRORS[res.data.errorCode]);
        }

        dispatch(hideLoader());
      })
      .catch((err) => {
        showErrorMessage(err, selectedReturn, dispatch);
      });

    setSelectedReturn(null);
  };

  const openCompleteModal = () => {
    if (currentUser) {
      checkIfDisabledUser(currentUser.code).then((res) => {
        if (res.data.data) {
          dispatch(showDisabledUserModal(logOut));
          return;
        } else {
          setModal({
            isOpen: true,
            title: 'Are you sure?',
            name: 'COMPLETE',
            desc: '',
            message: "Do you want to mark this returning request as 'Completed'?",
            content: null,
            btnOk: 'Yes',
            btnCancel: 'No',
            isValid: true,
          });
        }
      });
    }
  };

  const openCancelModal = () => {
    if (currentUser) {
      checkIfDisabledUser(currentUser.code).then((res) => {
        if (res.data.data) {
          dispatch(showDisabledUserModal(logOut));
          return;
        } else {
          setModal({
            isOpen: true,
            title: 'Are you sure?',
            name: 'CANCEL',
            desc: '',
            message: 'Do you want to cancel this returning request?',
            content: null,
            btnOk: 'Yes',
            btnCancel: 'No',
            isValid: true,
          });
        }
      });
    }
  };

  const filterStates = (e, isClear) => {
    let search = '';
    let value = e.target.value;

    if (!isClear) {
      if (!selectedState) {
        search = value;
      } else {
        if (value === 'All') {
          search = value;
        } else {
          const indexOfValue = selectedState.indexOf('All');
          if (indexOfValue > -1) {
            if (indexOfValue === 0) {
              if (selectedState.replace('All', '').length === 0) {
                search = value;
              } else {
                search = 'All';
              }
            } else {
              search = 'All';
            }
          } else {
            search = 'All';
          }
        }
      }
    } else {
      if (selectedState.replace(value, '').length === 0) {
        search = 'All';
      } else {
        const indexOfValue = selectedState.indexOf(value);
        if (indexOfValue === 0) {
          search = selectedState.replace(selectedState.slice(indexOfValue, indexOfValue + value.length + 1), '');
        } else {
          search = selectedState.replace(selectedState.slice(indexOfValue - 1, indexOfValue + value.length), '');
        }
      }
    }

    setSelectedState(search);
  };

  function useOutsideAlerter(ref) {
    useEffect(() => {
      function handleClickOutside(event) {
        if (ref.current && !ref.current.contains(event.target)) {
          setReturnedDate({
            ...returnedDate,
            visible: false,
          });
        }
      }

      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, [ref]);
  }

  return (
    <div className='relative w-full'>
      <h3 className='text-org font-bold text-base mb-5 2xl:ml-3'>Request List</h3>
      <div className='w-full justify-between flex items-center'>
        <div className='flex items-center'>
          <div className='relative w-1/3'>
            <div className='w-full' ref={refState}>
              <button className='relative cursor-pointer' onClick={() => setOpenState(!openState)}>
                <input
                  type='text'
                  name='type'
                  placeholder='Type'
                  className='2xl:ml-3 h-10 border-2 w-full rounded-md focus:outline-none text-sm cursor-default'
                  value={selectedState.name}
                  readOnly={true}
                />
                <span className='absolute mr-1 2xl:mr-0 top-0 right-0 pt-1.5 cursor-pointer border-l h-8 border-gray-800'>
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
              </button>
              <Transition
                show={openState}
                enter='transition duration-100 ease-out'
                enterFrom='transform scale-95 opacity-0'
                enterTo='transform scale-100 opacity-100'
                leave='transition duration-75 ease-out'
                leaveFrom='transform scale-100 opacity-100'
                leaveTo='transform scale-95 opacity-0'
              >
                <div className='flex flex-col shadow-md p-3 gap-y-2 bg-gray-50 absolute w-full border-l border-r border-b border-gray-800 rounded-b-md focus:outline-none 2xl:ml-3'>
                  {states &&
                    states.map((state, index) => (
                      <div key={`state_${index}`}>
                        <label className='inline-flex flex-row items-center'>
                          <input
                            type='checkbox'
                            value={state.value}
                            className='cursor-pointer w-4 h-4'
                            onChange={(e) => {
                              if (selectedState && selectedState.includes(state.value) && state.value !== 'All') {
                                filterStates(e, true);
                              } else {
                                filterStates(e, false);
                              }

                              setPageNum(1);
                            }}
                            checked={
                              (selectedState && selectedState.includes(state.value)) ||
                              selectedState === 'All' ||
                              selectedState.split(',').length > 1
                            }
                          />
                          <span className='pl-3 text-sm'>{state.name}</span>
                        </label>
                      </div>
                    ))}
                </div>
              </Transition>
            </div>
          </div>
          <div
            className='ml-3 relative w-2/5'
            onClick={() =>
              setReturnedDate({
                ...returnedDate,
                visible: true,
              })
            }
          >
            <div className='relative'>
              <input
                type='text'
                value={returnedDate.value ? dayjs(returnedDate.value).format('DD/MM/YYYY') : ''}
                className='pr-10 2xl:ml-3 h-10 border-2 w-full rounded-md focus:outline-none cursor-default'
                placeholder='Returned Date'
                readOnly={true}
              />
              <span className='absolute mr-1 2xl:mr-0 top-0 right-0 pt-1.5 cursor-pointer border-l h-8 border-gray-800'>
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  className='h-5 w-5 ml-1 2xl:ml-2 hover:text-org-dark'
                  viewBox='0 0 20 20'
                  fill='currentColor'
                  onClick={() =>
                    setReturnedDate({
                      ...returnedDate,
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
            {returnedDate.visible && (
              <div className='absolute p-2 bg-white border rounded-sm z-10 mt-1' ref={wrapperRef}>
                <Calendar
                  onChange={(value, event) => {
                    setReturnedDate({
                      visible: false,
                      value,
                    });
                  }}
                  value={returnedDate.value}
                  maxDate={new Date(latestDate)}
                  className='react-calendar hover:text-brand-dark text-sm'
                />
              </div>
            )}
          </div>
        </div>
        <div className='flex justify-end items-center'>
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
      </div>
      <Table
        headers={
          returnHeaders &&
          returnHeaders.map((header, index) => (
            <th
              scope='col'
              className={`table-custom-header ${index > 0 ? 'cursor-pointer hover:bg-gray-100 hover:text-org' : ''}`}
              key={`header_${index}`}
              onClick={() => {
                if (index > 0) {
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
          returns &&
          returns.map((item, index) => (
            <tr key={`row_${(pageNum - 1) * 10 + index + 1}`} className='hover:bg-gray-100'>
              <td className='table-custom-row max-row'>
                <div className='flex flex-col'>
                  <span className='h-6'>{(pageNum - 1) * pageSize + index + 1}</span>
                  <div className='border-b-2 border-gray-300'></div>
                </div>
              </td>
              <td className='table-custom-row max-row'>
                <div className='flex flex-col'>
                  <span className='h-6'>{item.assetCode}</span>
                  <div className='border-b-2 border-gray-300'></div>
                </div>
              </td>
              <td className='table-custom-row max-row'>
                <div className='flex flex-col'>
                  <span className='h-6'>{item.assetName}</span>
                  <div className='border-b-2 border-gray-300'></div>
                </div>
              </td>
              <td className='table-custom-row max-row'>
                <div className='flex flex-col'>
                  <span className='h-6'>{item.requestBy}</span>
                  <div className='border-b-2 border-gray-300'></div>
                </div>
              </td>
              <td className='table-custom-row max-row'>
                <div className='flex flex-col'>
                  <span className='h-6'>{dayjs(new Date(item.assignedDate)).format('DD/MM/YYYY')}</span>
                  <div className='border-b-2 border-gray-300'></div>
                </div>
              </td>
              <td className='table-custom-row max-row'>
                <div className='flex flex-col'>
                  <span className='h-6'>{item.acceptedBy ? item.acceptedBy : ''}</span>
                  <div className='border-b-2 border-gray-300'></div>
                </div>
              </td>
              <td className='table-custom-row max-row'>
                <div className='flex flex-col'>
                  <span className='h-6'>
                    {item.returnedDate ? dayjs(new Date(item.returnedDate)).format('DD/MM/YYYY') : ''}
                  </span>
                  <div className='border-b-2 border-gray-300'></div>
                </div>
              </td>
              <td className='table-custom-row max-row'>
                <div className='flex flex-col'>
                  <span className='h-6'>
                    {
                      states.find((state) => {
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
                  disabled={item.state === true}
                  onClick={() => {
                    openCompleteModal();
                    setSelectedReturn(item.id);
                  }}
                >
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    className={`h-5 w-5 mr-2 text-org-light ${
                      item.state === true
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
                  disabled={item.state === true}
                  onClick={() => {
                    openCancelModal();
                    setSelectedReturn(item.id);
                  }}
                >
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    className={`h-5 w-5 mr-2 ${
                      item.state === true
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
              </td>
            </tr>
          ))
        }
      />
      {searchedBy && (!returns || returns?.length === 0) && (
        <div className='min-w-screen col-span-2 md:col-span-4 shadow-lg rounded-md my-5'>
          <div className='flex flex-col justify-center items-center w-full py-6 bg-white px-4 sm:px-6 lg:px-16'>
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
      {!searchedBy && (!returns || returns?.length === 0) && (
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
        handled={setSelectedReturn}
        handleSubmit={modal.name === 'COMPLETE' ? handleCompleteReturn : handleCancelReturn}
      />

      <div className='flex justify-end mt-5 xl:pr-5'>
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
              !returns || returns?.length === 0 || totalPages === 1
                ? 'hidden'
                : pageNum === 1
                ? 'text-gray-400 cursor-default'
                : 'text-org-light hover:bg-gray-50'
            }`}
            nextLinkClassName={`inline-flex items-center p-1 px-2 rounded-r-md border border-gray-300 bg-white text-sm ${
              !returns || returns?.length === 0 || totalPages === 1
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

export default ManageReturn;
