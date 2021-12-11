import { ChevronDownIcon } from '@heroicons/react/solid';
import React, { useEffect, useState } from 'react';
import ReactPaginate from 'react-paginate';
import { useDispatch } from 'react-redux';
import { useHistory, useLocation } from 'react-router-dom';
import { setHeaderTitle } from '../../../actions/HeaderTitleAction';
import { ExportCSV } from '../../../components/Export';
import Table from '../../../components/Table';
import { reportHeaders } from '../../../data/reportData';
import { getReport } from '../../../services/asset.service';

const ManageReport = () => {
  const dispatch = useDispatch();
  const [report, setReport] = useState([]);
  const [sortBy, setSortBy] = useState({
    direction: 'ASC',
    value: 'nameCategory',
  });
  //file name when export
  const [filename, setFilename] = useState('');

  const userLocation = JSON.parse(localStorage.getItem('user')).location.id;

  const location = useLocation();
  const history = useHistory();

  const from = location?.state?.from;
  const newEntity = location.state?.newEntity;
  useEffect(() => {
    dispatch(setHeaderTitle('Report'));
  }, [dispatch]);

  useEffect(() => {
    loadData();
    FileName();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortBy]);

  //Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [reportPerPage] = useState(10);
  const indexOfLastReport = currentPage * reportPerPage;
  const indexOfFirstReport = indexOfLastReport - reportPerPage;
  const currentReports = report.slice(indexOfFirstReport, indexOfLastReport);
  const [totalPages, setTotalPages] = useState(1);

  const compareObjects = (object1, object2, sortBy) => {
    const obj1 = object1[sortBy.value];
    const obj2 = object2[sortBy.value];
    if (sortBy.direction === 'ASC') {
      if (obj1 < obj2) {
        return -1;
      }
      if (obj1 > obj2) {
        return 1;
      }
      return 0;
    } else {
      if (obj1 > obj2) {
        return -1;
      }
      if (obj1 < obj2) {
        return 1;
      }
      return 0;
    }
  };
  const loadData = () => {
    getReport(userLocation).then((res) => {
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
        setReport(
          result.sort((a, b) => {
            return compareObjects(a, b, sortBy);
          })
        );
        setTotalPages(Math.ceil(result.length / reportPerPage));
      } else {
        setReport(null);
      }
    });
  };
  const FileName = () => {
    var date = new Date().getDate();
    var month = new Date().getMonth() + 1;
    var year = new Date().getFullYear();

    setFilename('asset_list_' + date + month + year); //format: dd-mm-yyyy;
  };
  return (
    <div className='relative w-full mb-10'>
      <h3 className='text-org font-bold text-base mb-5 2xl:ml-3'>Report</h3>
      <div className='w-full justify-between flex items-center xl:pr-3'>
        <div className='flex justify-end items-center w-full'>
          <ExportCSV csvData={report} fileName={filename} />
        </div>
      </div>
      <Table
        headers={
          reportHeaders &&
          reportHeaders.map((header, index) => (
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
          currentReports &&
          currentReports.map((item, index) => (
            <tr key={`row_${index}`} className='hover:bg-gray-100'>
              <td className='table-custom-row max-row'>
                <div className='flex flex-col'>
                  <span className='h-6'>{item.nameCategory}</span>
                  <div className='border-b-2 border-gray-300'></div>
                </div>
              </td>
              <td className='table-custom-row'>
                <div className='flex flex-col'>
                  <span className='h-6'>{item.total}</span>
                  <div className='border-b-2 border-gray-300'></div>
                </div>
              </td>
              <td className='table-custom-row'>
                <div className='flex flex-col'>
                  <span className='h-6'>{item.ammountWaitingForAssign}</span>
                  <div className='border-b-2 border-gray-300'></div>
                </div>
              </td>
              <td className='table-custom-row'>
                <div className='flex flex-col'>
                  <span className='h-6'>{item.ammountAssigned}</span>
                  <div className='border-b-2 border-gray-300'></div>
                </div>
              </td>
              <td className='table-custom-row'>
                <div className='flex flex-col'>
                  <span className='h-6'>{item.ammountAvailable}</span>
                  <div className='border-b-2 border-gray-300'></div>
                </div>
              </td>
              <td className='table-custom-row'>
                <div className='flex flex-col'>
                  <span className='h-6'>{item.ammountNotAvailable}</span>
                  <div className='border-b-2 border-gray-300'></div>
                </div>
              </td>
              <td className='table-custom-row'>
                <div className='flex flex-col'>
                  <span className='h-6'>{item.ammountWaitingForRecycling}</span>
                  <div className='border-b-2 border-gray-300'></div>
                </div>
              </td>
              <td className='table-custom-row'>
                <div className='flex flex-col'>
                  <span className='h-6'>{item.ammountRecycled}</span>
                  <div className='border-b-2 border-gray-300'></div>
                </div>
              </td>
            </tr>
          ))
        }
      />
      <div className='flex justify-end mt-5 xl:pr-10'>
        <div>
          <ReactPaginate
            previousLabel={'Previous'}
            nextLabel={'Next'}
            pageCount={totalPages}
            pageRangeDisplayed={3}
            marginPagesDisplayed={1}
            onPageChange={({ selected }) => setCurrentPage(selected + 1)}
            containerClassName={'flex'}
            breakClassName={'bg-white border-gray-300 text-gray-500 relative inline-flex items-center p-1 border'}
            previousLinkClassName={`inline-flex rounded-l-md  items-center p-1 px-2 border border-gray-300 bg-white text-gray-500 text-sm ${
              !currentReports || currentReports?.length === 0 || totalPages === 1
                ? 'hidden'
                : currentPage === 1
                ? 'text-gray-400 cursor-default'
                : 'text-org-light hover:bg-gray-50'
            }`}
            nextLinkClassName={`inline-flex items-center p-1 px-2 rounded-r-md border border-gray-300 bg-white text-sm ${
              !currentReports || currentReports?.length === 0 || totalPages === 1
                ? 'hidden'
                : currentPage === totalPages
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
            forcePage={currentPage - 1}
          />
        </div>
      </div>
    </div>
  );
};

export default ManageReport;
