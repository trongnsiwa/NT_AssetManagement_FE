import React from 'react';

const Table = ({ headers, rows, modal, inForm, rowLength, scrollEvent }) => {
  return (
    <div className={`flex flex-col ${modal ? '' : 'mt-5'}`}>
      <div className={`-my-2 ${modal ? '' : 'sm:-mx-6 lg:-mx-8'}`}>
        <div className={`align-middle inline-block min-w-full py-2 ${modal ? 'sm:pr-6 2xl:pr-8' : 'sm:px-6 2xl:px-8'}`}>
          <div
            onScroll={inForm ? scrollEvent : () => false}
            style={{
              height: `${inForm ? (rowLength > 0 ? '11rem' : '190px') : '100%'}`,
              overflowY: `${inForm ? 'auto' : 'none'}`,
            }}
          >
            <table className='min-w-full'>
              <thead>
                <tr>{headers}</tr>
              </thead>
              <tbody className='bg-white'>{rows}</tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Table;
