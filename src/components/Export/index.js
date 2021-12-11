import React from 'react';
import ReactExport from 'react-data-export';

export const ExportCSV = ({ csvData, fileName }) => {
  const ExcelFile = ReactExport.ExcelFile;
  const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
  const ExcelColumn = ReactExport.ExcelFile.ExcelColumn;
  return (
    <ExcelFile
      filename={fileName}
      element={
        <button className='bg-org-light hover:bg-org text-white p-2 px-4 rounded-md whitespace-nowrap'>Export</button>
      }
    >
      <ExcelSheet data={csvData} name='Report'>
        <ExcelColumn label='Category' value='nameCategory' />
        <ExcelColumn label='Total' value='total' />
        <ExcelColumn label='Waiting for assigned' value='ammountWaitingForAssign' />
        <ExcelColumn label='Assigned' value='ammountAssigned' />
        <ExcelColumn label='Available' value='ammountAvailable' />
        <ExcelColumn label='Not Available' value='ammountNotAvailable' />
        <ExcelColumn label='Waiting for recycling' value='ammountWaitingForRecycling' />
        <ExcelColumn label='Recycled' value='ammountRecycled' />
      </ExcelSheet>
    </ExcelFile>
  );
};
