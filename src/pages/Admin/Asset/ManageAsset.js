/* eslint-disable jsx-a11y/anchor-is-valid */
import { Transition } from '@headlessui/react';
import { ChevronDownIcon, PencilIcon } from '@heroicons/react/solid';
import dayjs from 'dayjs';
import React, { useEffect } from 'react';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useLocation, useHistory } from 'react-router-dom';
import _ from 'lodash';
import { setHeaderTitle } from '../../../actions/HeaderTitleAction';
import Modal from '../../../components/Modal';
import Table from '../../../components/Table';
import { hideLoader, showLoader } from '../../../actions/LoaderAction';
import ReactPaginate from 'react-paginate';
import { assetHeader, states, historyHeader } from '../../../data/assetData';
import {
  checkForDeleteAsset,
  countListAsset,
  countListSearchAndFilterAsset,
  deleteAsset,
  getAssetDetail,
  getListAsset,
  getListSearchAndFilterAsset,
} from '../../../services/asset.service';
import { getListCategory } from '../../../services/category.service';
import { showErrorMessage } from '../../../helpers/showToast';
import { checkIfDisabledUser } from '../../../services/auth.service';
import { logout } from '../../../actions/AuthAction';
import { hideModal, showDisabledUserModal } from '../../../actions/ModalAction';
import useComponentVisible from '../../../helpers/useComponentVisible';

const ManageAsset = () => {
  const [assets, setAssets] = useState(null);
  const [categories, setCategories] = useState(null);

  const [selectedStates, setSelectedStates] = useState('AVAILABLE1,NOT_AVAILABLE2,ASSIGNED2,WAITING_FOR_ASSIGNED1');
  const [selectedRealStates, setSelectedRealStates] = useState('AVAILABLE,NOT_AVAILABLE,ASSIGNED,WAITING_FOR_ASSIGNED');
  const [selectedCategories, setSelectedCategories] = useState('All');
  const [selectedRealCategories, setSelectedRealCategories] = useState('');

  const [searchedBy, setSearchedBy] = useState('');
  const [searchedText, setSearchedText] = useState('');
  const [sortBy, setSortBy] = useState({
    direction: 'ASC',
    value: '',
  });

  const [totalPages, setTotalPages] = useState(1);
  const [pageNum, setPageNum] = useState(1);
  const pageSize = 10;

  const [selectedDisableAsset, setSelectedDisableAsset] = useState(null);

  const [modal, setModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    content: null,
    btnOk: '',
    isValid: true,
  });

  const {
    ref: refState,
    isComponentVisible: openState,
    setIsComponentVisible: setOpenState,
  } = useComponentVisible(false);
  const { ref: refCate, isComponentVisible: openCate, setIsComponentVisible: setOpenCate } = useComponentVisible(false);

  const { user: currentUser } = useSelector((state) => state.authReducer);
  const dispatch = useDispatch();
  const location = useLocation();
  const history = useHistory();

  const from = location?.state?.from;
  const newEntity = location.state?.newEntity;

  useEffect(() => {
    dispatch(setHeaderTitle('Manage Asset'));
  }, [dispatch]);

  useEffect(() => {
    getListCategory().then((res) => {
      let result = res.data.data;
      result = result.map((re) => {
        return {
          ...re,
          fake: '@@*/*@@' + re.name + '@@*/*@@',
        };
      });
      setCategories(result);
    });
  }, []);

  const logOut = () => {
    dispatch(logout());
    dispatch(hideModal());
    history.push('/signin');
    history.go(0);
  };

  useEffect(() => {
    loadData();
  }, [pageNum, searchedBy, selectedStates, selectedCategories, sortBy]); //eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    countData();
  }, [pageNum, pageSize, searchedBy, selectedStates, selectedCategories, sortBy]); //eslint-disable-line react-hooks/exhaustive-deps

  const countData = () => {
    if (
      selectedStates &&
      selectedStates === 'All' &&
      selectedCategories &&
      selectedCategories === 'All' &&
      searchedBy &&
      searchedBy.trim() === ''
    ) {
      countListAsset(currentUser.location.id).then((res) => {
        let countable = res.data.data;
        const pages = _.ceil(countable / pageSize);
        setTotalPages(pages);
      });
    } else {
      countListSearchAndFilterAsset(
        currentUser.location.id,
        searchedBy.trim(),
        selectedRealStates,
        selectedRealCategories
      ).then((res) => {
        let countable = res.data.data;
        const pages = _.ceil(countable / pageSize);
        setTotalPages(pages);
      });
    }
  };

  const loadData = () => {
    if (
      selectedStates &&
      selectedStates.trim() === 'All' &&
      selectedCategories &&
      selectedCategories.trim() === 'All' &&
      searchedBy &&
      searchedBy.trim() === ''
    ) {
      getListAsset(pageNum, pageSize, sortBy.value, sortBy.direction, currentUser.location.id).then((res) => {
        if (res.data.data) {
          var result = [];
          if (newEntity && from && from.split('/').length > 2) {
            result[0] = newEntity;
            const response = [...res.data.data].filter((item) => item.id !== result[0].id);
            result = [...result, ...response];
            history.replace(location.pathname, null);
          } else {
            result = res.data.data;
          }

          setAssets(result);
        } else {
          setAssets(null);
        }
      });
    } else {
      getListSearchAndFilterAsset(
        pageNum,
        pageSize,
        sortBy.value,
        sortBy.direction,
        currentUser.location.id,
        searchedBy.trim(),
        selectedRealStates,
        selectedRealCategories
      ).then((res) => {
        if (res.data.data) {
          var result = [];
          if (newEntity && from && from.split('/').length > 2) {
            result[0] = newEntity;
            const response = [...res.data.data].filter((item) => item.id !== result[0].id);
            result = [...result, ...response];
            history.replace(location.pathname, null);
          } else {
            result = res.data.data;
          }

          setAssets(result);
        } else {
          setAssets(null);
        }
      });
    }
  };

  const deleteConfirm = (code, id) => {
    setModal({
      isOpen: true,
      title: 'Are you sure?',
      desc: '',
      message: 'Do you want to delete this asset?',
      content: null,
      btnOk: 'Delete',
      isValid: true,
      code,
      id,
    });
  };

  const deleteFailModal = (code, id) => {
    setModal({
      ...modal,
      isOpen: true,
      title: 'Cannot Delete Asset',
      content:
        'Cannot delete the asset because it belongs to one or more historical assignments. If the asset is not able to be used anymore, please update its state in',
      linkTitle: 'Edit Asset page',
      link: { pathname: `/asset/${code}`, state: { id } },
    });
  };

  const handleOpenModal = (id, code, state) => {
    if (currentUser) {
      checkIfDisabledUser(currentUser.code).then((res) => {
        if (res.data.data) {
          dispatch(showDisabledUserModal(logOut));
          return;
        } else {
          if (['RECYCLED', 'WAITING_FOR_RECYCLED'].includes(state)) {
            deleteConfirm(code, id);
            setSelectedDisableAsset(id);
            return;
          }

          checkForDeleteAsset(id)
            .then((res) => {
              if (res.data.data) {
                deleteFailModal(code, id);
              } else {
                deleteConfirm(code, id);
                setSelectedDisableAsset(id);
              }
            })
            .catch((err) => {
              showErrorMessage(err, code, dispatch);
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

          getAssetDetail(id).then((res) => {
            if (res.data.data) {
              const item = res.data.data;

              setModal({
                ...modal,
                isOpen: true,
                title: 'Detailed Asset Information',
                content: {
                  'Asset Code': item.code,
                  'Asset Name': item.name,
                  Category: item.categoryName,
                  'Installed Date': dayjs(item.installedDate).format('DD/MM/YYYY'),
                  State: states.find((state) => {
                    if (state.value.includes('1') || state.value.includes('2')) {
                      return state.value.slice(0, state.value.length - 1) === item.stateName;
                    }
                    return state.value === item.stateName;
                  })?.name,
                  Location: item.locationName,
                  Specification: item.specification,
                  History: item.history ? item.history : [],
                },
                headers: historyHeader,
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

  const handleDeleteAsset = (code, id) => {
    if (!selectedDisableAsset) {
      return;
    }

    dispatch(showLoader());

    deleteAsset(selectedDisableAsset)
      .then((res) => {
        dispatch(hideLoader());
        setModal({
          ...modal,
          isOpen: false,
        });
        loadData();
        countData();
      })
      .catch((error) => {
        dispatch(hideLoader());
        deleteFailModal(code, id);
      });

    setSelectedDisableAsset(null);
  };

  const filterStates = (e, isClear) => {
    let search = '';
    let value = e.target.value;

    if (!isClear) {
      if (!selectedStates) {
        search = value;
      } else {
        if (value === 'All') {
          search = value;
        } else {
          const indexOfValue = selectedStates.indexOf('All');
          if (indexOfValue > -1) {
            if (indexOfValue === 0) {
              if (selectedStates.replace('All', '').length === 0) {
                search = value;
              } else {
                search = selectedStates.replace(
                  selectedStates.slice(indexOfValue, indexOfValue + value.length + 1),
                  ''
                );
                search = search + ',' + value;
              }
            } else {
              search = selectedStates.replace(selectedStates.slice(indexOfValue - 1, indexOfValue + value.length), '');
              search = search + ',' + value;
            }
          } else {
            search = selectedStates + ',' + value;
          }
        }
      }
    } else {
      if (selectedStates.replace(value, '').length === 0) {
        search = 'All';
      } else {
        const indexOfValue = selectedStates.indexOf(value);
        if (indexOfValue === 0) {
          search = selectedStates.replace(selectedStates.slice(indexOfValue, indexOfValue + value.length + 1), '');
        } else {
          search = selectedStates.replace(selectedStates.slice(indexOfValue - 1, indexOfValue + value.length), '');
        }
      }
    }

    if (search.split(',').length > 1) {
      const searchRealArr = search.split(',').map((s) => {
        if (s.includes('1') || s.includes('2')) {
          return s.slice(0, s.length - 1);
        }
        return s;
      });

      if (searchRealArr.length === 6) {
        search = 'All';
        setSelectedRealStates('');
      } else {
        setSelectedRealStates(searchRealArr.join(','));
      }
    } else {
      if (search === 'All') {
        setSelectedRealStates('');
      } else {
        if (search.includes('1') || search.includes('2')) {
          setSelectedRealStates(search.slice(0, search.length - 1));
        } else {
          setSelectedRealStates(search);
        }
      }
    }

    setSelectedStates(search);
  };

  const filterCategories = (e, isClear) => {
    let search = '';
    const value = e.target.value;

    if (!isClear) {
      if (!selectedCategories) {
        search = value;
      } else {
        if (value === 'All') {
          search = value;
        } else {
          const indexOfValue = selectedCategories.indexOf('All');
          if (indexOfValue > -1) {
            if (indexOfValue === 0) {
              if (selectedCategories.replace('All', '').length === 0) {
                search = value;
              } else {
                search = selectedCategories.replace(
                  selectedCategories.slice(indexOfValue, indexOfValue + value.length + 1),
                  ''
                );
                search = search + ',' + value;
              }
            } else {
              search = selectedCategories.replace(
                selectedCategories.slice(indexOfValue - 1, indexOfValue + value.length),
                ''
              );
              search = search + ',' + value;
            }
          } else {
            search = selectedCategories + ',' + value;
          }
        }
      }
    } else {
      if (selectedCategories.replace(value, '').length === 0) {
        search = 'All';
      } else {
        const indexOfValue = selectedCategories.indexOf(value);
        if (indexOfValue === 0) {
          search = selectedCategories.replace(
            selectedCategories.slice(indexOfValue, indexOfValue + value.length + 1),
            ''
          );
        } else {
          search = selectedCategories.replace(
            selectedCategories.slice(indexOfValue - 1, indexOfValue + value.length),
            ''
          );
        }
      }
    }

    if (search.split(',').length > 1) {
      const searchRealArr = search.split(',').map((s) => {
        if (s.includes('@@*/*@@')) {
          return s.replaceAll('@@*/*@@', '');
        }
        return s;
      });

      if (searchRealArr.length === categories?.length) {
        search = 'All';
        setSelectedRealCategories('');
      } else {
        setSelectedRealCategories(searchRealArr.join(','));
      }
    } else {
      if (search === 'All') {
        setSelectedRealCategories('');
      } else {
        if (search.includes('@@*/*@@')) {
          setSelectedRealCategories(search.replaceAll('@@*/*@@', ''));
        } else {
          setSelectedRealCategories(search);
        }
      }
    }

    setSelectedCategories(search);
  };

  return (
    <div className='relative w-full'>
      <h3 className='text-org font-bold text-base mb-5 2xl:ml-3'>Asset List</h3>
      <div className='justify-between flex items-center xl:pr-7'>
        <div className='flex items-center'>
          <div className='relative mr-3 w-1/3'>
            <div className='w-full' ref={refState}>
              <button className='relative cursor-pointer' onClick={() => setOpenState(!openState)}>
                <input
                  type='text'
                  name='type'
                  placeholder='State'
                  className='2xl:ml-3 h-10 border-2 rounded-md focus:outline-none cursor-default'
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
                      <div key={`type_${index}`}>
                        <label className='inline-flex flex-row items-center'>
                          <input
                            type='checkbox'
                            value={state.value}
                            className='cursor-pointer w-4 h-4'
                            onChange={(e) => {
                              if (selectedStates && selectedStates.includes(state.value) && state.value !== 'All') {
                                filterStates(e, true);
                              } else {
                                filterStates(e, false);
                              }
                              setPageNum(1);
                            }}
                            checked={
                              (selectedStates && selectedStates.includes(state.value)) || selectedStates === 'All'
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
          <div className='relative w-1/3'>
            <div ref={refCate}>
              <button className='relative cursor-pointer' onClick={() => setOpenCate(!openCate)}>
                <input
                  type='text'
                  name='type'
                  placeholder='Category'
                  className='2xl:ml-3 h-10 border-2 w-full rounded-md focus:outline-none cursor-default'
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
                show={openCate}
                enter='transition duration-100 ease-out'
                enterFrom='transform scale-95 opacity-0'
                enterTo='transform scale-100 opacity-100'
                leave='transition duration-75 ease-out'
                leaveFrom='transform scale-100 opacity-100'
                leaveTo='transform scale-95 opacity-0'
              >
                <div
                  className='flex flex-col shadow-md p-3 gap-y-2 bg-gray-50 absolute w-full border-l border-r border-b border-gray-800 rounded-b-md focus:outline-none 2xl:ml-3 overflow-y-auto'
                  style={{ height: '250px' }}
                >
                  <div key={`type_${0}`}>
                    <label className='inline-flex flex-row items-center'>
                      <input
                        type='checkbox'
                        value={'All'}
                        className='cursor-pointer w-4 h-4'
                        onChange={(e) => {
                          filterCategories(e, false);
                          setPageNum(1);
                        }}
                        checked={selectedCategories && selectedCategories === 'All'}
                      />
                      <span className='pl-3 text-sm'>{'All'}</span>
                    </label>
                  </div>
                  {categories &&
                    categories.map((category, index) => (
                      <div key={`type_${index}`}>
                        <label className='inline-flex flex-row items-center'>
                          <input
                            type='checkbox'
                            value={category.fake}
                            className='cursor-pointer w-4 h-4'
                            onChange={(e) => {
                              if (selectedCategories && selectedCategories.includes(category.fake)) {
                                filterCategories(e, true);
                              } else {
                                filterCategories(e, false);
                              }
                              setPageNum(1);
                            }}
                            checked={
                              (selectedCategories && selectedCategories.includes(category.fake)) ||
                              selectedCategories === 'All'
                            }
                          />
                          <span className='pl-3 text-sm'>{category.name}</span>
                        </label>
                      </div>
                    ))}
                </div>
              </Transition>
            </div>
          </div>
        </div>
        <div className='flex items-center'>
          <div className='relative mr-3'>
            <input
              type='search'
              name='search'
              className='pr-10 pl-5 border h-10 w-full rounded-md focus:outline-none focus:border-gray-500 focus:ring-gray-500 border-gray-600'
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
          <div className='relative'>
            <Link
              to='/asset/create-new'
              className='bg-org-light hover:bg-org text-white p-2 rounded-md whitespace-nowrap'
            >
              Create new asset
            </Link>
          </div>
        </div>
      </div>

      <Table
        headers={
          assetHeader &&
          assetHeader.map((header, index) => (
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
          assets &&
          assets.map((item, index) => (
            <tr key={`row_${index}`} className='hover:bg-gray-100 cursor-pointer'>
              <td className='table-custom-row max-row' onClick={() => handleShowDetail(item.id)}>
                <div className='flex flex-col'>
                  <span className='h-6 text-sm'>{item.code}</span>
                  <div className='border-b-2 border-gray-300'></div>
                </div>
              </td>
              <td className='table-custom-row max-row' onClick={() => handleShowDetail(item.id)}>
                <div className='flex flex-col'>
                  <span className='h-6 text-sm'>{item.name}</span>
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
                  <span className='h-6 text-sm'>
                    {
                      states.find((state) => {
                        if (state.value.includes('1') || state.value.includes('2')) {
                          return state.value.slice(0, state.value.length - 1) === item.state.name;
                        }
                        return state.value === item.state.name;
                      })?.name
                    }
                  </span>
                  <div className='border-b-2 border-gray-300'></div>
                </div>
              </td>
              <td className='px-3 pt-1 whitespace-nowrap flex items-center gap-x-3'>
                <Link
                  to={{
                    pathname: `/asset/${item.code}`,
                    state: {
                      id: item.id,
                    },
                  }}
                  className={`${
                    ['ASSIGNED', 'WAITING_FOR_ASSIGNED'].includes(item.state.name)
                      ? 'pointer-events-none cursor-default'
                      : ''
                  }`}
                >
                  <PencilIcon
                    className={`h-5 w-5 ${
                      ['ASSIGNED', 'WAITING_FOR_ASSIGNED'].includes(item.state.name)
                        ? 'cursor-default text-gray-400'
                        : 'cursor-pointer hover:text-indigo-300'
                    } `}
                  />
                </Link>
                <button
                  onClick={() => {
                    handleOpenModal(item.id, item.code, item.state.name);
                  }}
                  disabled={['ASSIGNED', 'WAITING_FOR_ASSIGNED'].includes(item.state.name)}
                >
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    className={`h-5 w-5 ${
                      ['ASSIGNED', 'WAITING_FOR_ASSIGNED'].includes(item.state.name)
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
      {searchedBy && (!assets || assets?.length === 0) && (
        <div className='min-w-screen col-span-2 md:col-span-4 shadow-lg rounded-md my-5'>
          <div className='flex flex-col justify-center items-center w-full py-6 bg-white px-4 sm:px-6 lg:px-16'>
            <img
              src='https://ik.imagekit.io/tnyyngwxvx9/no-results_sbm3UFZiL.svg?updatedAt=1626878273006'
              alt='Not Found'
              className='h-14 w-14 mx-auto mb-4 text-gray-900'
            />
            <p className='text-base leading-5 font-medium text-gray-900 mb-3'>No Result Found</p>
            <p className='text-sm'>We did not find asset has code or name "{searchedBy}" for your search.</p>
          </div>
        </div>
      )}
      {!searchedBy && (!assets || assets?.length === 0) && (
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

      <Modal modal={modal} setModal={setModal} handleSubmit={handleDeleteAsset} />

      <div className='flex justify-end mt-5 xl:pr-7'>
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
              !assets || assets?.length === 0 || totalPages === 1
                ? 'hidden'
                : pageNum === 1
                ? 'text-gray-400 cursor-default'
                : 'text-org-light hover:bg-gray-50'
            }`}
            nextLinkClassName={`inline-flex items-center p-1 px-2 rounded-r-md border border-gray-300 bg-white text-sm ${
              !assets || assets?.length === 0 || totalPages === 1
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

export default ManageAsset;
