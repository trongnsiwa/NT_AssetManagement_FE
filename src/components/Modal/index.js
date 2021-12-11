import { Dialog, Transition } from '@headlessui/react';
import React, { Fragment, useRef } from 'react';
import _ from 'lodash';
import Table from '../Table';
import dayjs from 'dayjs';
import { Link } from 'react-router-dom';

const Modal = ({ modal, setModal, handleSubmit, handled }) => {
  const refDiv = useRef(null);

  return (
    <Transition.Root show={modal.isOpen} as={Fragment}>
      <Dialog
        as='div'
        static
        className={`absolute z-10 ${modal?.brand === 'ASSIGNMENT' ? 'xl:left-24 top-0 w-full' : 'inset-0 m-0'}`}
        open={modal.isOpen}
        onClose={() =>
          setModal({
            ...modal,
            isOpen: false,
          })
        }
        initialFocus={refDiv}
      >
        <div className='min-h-screen text-center' ref={refDiv}>
          <Transition.Child
            as={Fragment}
            enter='ease-out duration-300'
            enterFrom='opacity-0'
            enterTo='opacity-100'
            leave='ease-in duration-200'
            leaveFrom='opacity-100'
            leaveTo='opacity-0'
          >
            <Dialog.Overlay className='fixed inset-0' />
          </Transition.Child>
          <span className='inline-block h-screen align-middle' aria-hidden='true'>
            &#8203;
          </span>
          <Transition.Child
            as={Fragment}
            enter='ease-out duration-300'
            enterFrom='opacity-0 scale-95'
            enterTo='opacity-100 scale-100'
            leave='ease-in duration-200'
            leaveFrom='opacity-100 scale-100'
            leaveTo='opacity-0 scale-95'
          >
            <div
              className={`inline-block w-auto ${
                modal.headers ? 'max-w-xl' : !modal.content ? 'max-w-md' : 'max-w-lg'
              } overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-lg border border-gray-800`}
            >
              <Dialog.Title
                as='h3'
                className='text-base font-bold leading-6 text-org border-b border-gray-800 py-3 px-10 bg-gray-100'
              >
                {!modal.content ? (
                  modal.title
                ) : (
                  <div className='flex justify-between'>
                    <span>{modal.title}</span>
                    <span
                      onClick={() =>
                        setModal({
                          ...modal,
                          isOpen: false,
                        })
                      }
                    >
                      <svg
                        xmlns='http://www.w3.org/2000/svg'
                        className='h-6 w-6 text-org  cursor-pointer p-1 hover:text-org-dark border-2 border-org'
                        fill='none'
                        viewBox='0 0 24 24'
                        stroke='currentColor'
                      >
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={4} d='M6 18L18 6M6 6l12 12' />
                      </svg>
                    </span>
                  </div>
                )}
              </Dialog.Title>

              {modal.content ? (
                _.isString(modal.content) ? (
                  <div className='mx-10 my-5'>
                    {!modal.link
                      ? modal.content.split('.').map((cont, index) => <p key={`cont_${index}`}>{cont}</p>)
                      : modal.content.split('.').map((cont, index) =>
                          modal.content.split('.').length - 1 === index ? (
                            <p key={`detail_${index}`}>
                              {cont}{' '}
                              <Link to={modal.link} className='underline text-link hover:text-blue-800 text-sm'>
                                {modal.linkTitle}
                              </Link>
                            </p>
                          ) : (
                            <p>{cont}</p>
                          )
                        )}
                  </div>
                ) : (
                  <div className='mb-10 mt-5 w-full'>
                    {Object.keys(modal.content).map((key, index) => (
                      <div
                        className={`px-10 grid ${
                          modal.headers
                            ? 'grid-cols-6 space-x-7'
                            : modal.name === 'ASSIGNMENT'
                            ? 'grid-cols-7 space-x-3'
                            : 'grid-cols-7 space-x-7'
                        } mt-3 w-full`}
                        key={`content_${index}`}
                      >
                        <p className={`text-sm ${modal.headers ? '' : 'col-span-2'} text-gray-700`}>{key}</p>
                        {!Array.isArray(modal.content[key]) ? (
                          <p
                            className={`text-sm break-all ${modal.headers ? 'col-span-5' : 'col-span-5'} text-gray-700`}
                          >
                            {modal.content[key]}
                          </p>
                        ) : (
                          <div className='col-span-5 text-gray-700 w-full'>
                            <Table
                              modal={true}
                              headers={
                                modal.headers &&
                                modal.headers.map((header, index) => (
                                  <th scope='col' className='pr-3 text-left font-medium' key={`header_${index}`}>
                                    <div className='flex flex-col'>
                                      <div className='flex items-center justify-start h-10 xl:h-8 text-sm'>
                                        {header.label}
                                      </div>
                                      <div className='border-b-2 border-gray-400'></div>
                                    </div>
                                  </th>
                                ))
                              }
                              rows={
                                modal.content[key] &&
                                modal.content[key].map(
                                  (item, index) =>
                                    key === 'History' && (
                                      <tr key={`row_${index}`} className='hover:bg-gray-100'>
                                        <td className='mb-3 pr-3 pt-1 whitespace-nowrap'>
                                          <div className='flex flex-col'>
                                            <span className='h-6 text-sm'>
                                              {dayjs(item.assignedDate).format('DD/MM/YYYY')}
                                            </span>
                                            <div className='border-b-2 border-gray-300'></div>
                                          </div>
                                        </td>
                                        <td className='table-custom-row'>
                                          <div className='flex flex-col'>
                                            <span className='h-6 text-sm'>{item.assignedTo}</span>
                                            <div className='border-b-2 border-gray-300'></div>
                                          </div>
                                        </td>
                                        <td className='table-custom-row'>
                                          <div className='flex flex-col'>
                                            <span className='h-6 text-sm'>{item.assignedBy}</span>
                                            <div className='border-b-2 border-gray-300'></div>
                                          </div>
                                        </td>
                                        <td className='table-custom-row'>
                                          <div className='flex flex-col'>
                                            <span className='h-6 text-sm'>
                                              {dayjs(item.returnedDate).format('DD/MM/YYYY')}
                                            </span>
                                            <div className='border-b-2 border-gray-300'></div>
                                          </div>
                                        </td>
                                      </tr>
                                    )
                                )
                              }
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )
              ) : (
                <div className='mx-10 my-5'>
                  <div>
                    <p>{modal.message}</p>
                  </div>

                  <div className='mt-6'>
                    <button
                      type='button'
                      className='w-full inline-flex justify-center rounded-md border border-transparent shadow-sm p-2 px-4 bg-red-600 font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:w-auto'
                      onClick={() => (modal.code && modal.id ? handleSubmit(modal.code, modal.id) : handleSubmit())}
                    >
                      {modal.btnOk}
                    </button>
                    <button
                      type='button'
                      className='mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm p-2 px-4 bg-white font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 sm:mt-0 sm:ml-3 sm:w-auto'
                      onClick={() =>
                        setModal({
                          ...modal,
                          isOpen: false,
                        })
                      }
                    >
                      {modal.btnCancel ? modal.btnCancel : 'Cancel'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </Transition.Child>
        </div>
        <button className='opacity-0 absolute bottom-0'></button>
      </Dialog>
    </Transition.Root>
  );
};

export default Modal;
