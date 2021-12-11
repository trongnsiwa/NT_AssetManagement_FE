import { Dialog, Transition } from '@headlessui/react';
import React, { Fragment, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { hideModal } from '../../../actions/ModalAction';

const ModalForm = () => {
  const modal = useSelector((state) => state.modalReducer);
  const dispatch = useDispatch();

  const refDiv = useRef(null);

  return (
    <>
      {modal && (
        <Transition.Root show={modal.isOpen} as={Fragment}>
          <Dialog
            as='div'
            static
            className={`absolute -top-20 ${!modal.allowCloseOutside ? 'left-0 w-screen h-screen' : 'w-full'}`}
            style={{ zIndex: '999' }}
            open={modal.isOpen}
            onClose={
              modal.allowCloseOutside
                ? () => {
                    dispatch(hideModal());
                    modal.reset && modal.reset();
                  }
                : () => false
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
                <Dialog.Overlay
                  className={`fixed inset-0 ${!modal.allowCloseOutside ? 'bg-opacity-50 bg-white' : ''}`}
                />
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
                <div className='inline-block w-auto max-w-md overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-lg border border-gray-800'>
                  <Dialog.Title
                    as='h3'
                    className='text-lg font-bold leading-6 text-org border-b border-gray-800 py-5 px-10 bg-gray-100'
                  >
                    {modal.title}
                  </Dialog.Title>

                  <div className='mx-10 my-5 text-sm'>{modal.form}</div>
                </div>
              </Transition.Child>
            </div>
            <button className='opacity-0 absolute bottom-0'></button>
          </Dialog>
        </Transition.Root>
      )}
    </>
  );
};

export default ModalForm;
