import { HIDE_MODAL, SHOW_MODAL } from '../constants/ActionTypes';

export const showModal = (title, name, form, allowCloseOutside, reset) => {
  return {
    type: SHOW_MODAL,
    title,
    name,
    form,
    allowCloseOutside,
    reset,
  };
};

export const hideModal = () => {
  return {
    type: HIDE_MODAL,
  };
};

export const showDisabledUserModal = (logOut) => {
  return {
    type: SHOW_MODAL,
    title: 'SORRY!!',
    name: 'DISABLEDUSER',
    form: (
      <>
        <div>
          <p>This account can not access this site any more. Please switch to another account.</p>
        </div>

        <div className='mt-6'>
          <button
            type='button'
            className='mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm p-2 px-4 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 sm:mt-0 sm:w-auto'
            onClick={logOut}
          >
            Log out
          </button>
        </div>
      </>
    ),
    allowCloseOutside: false,
    reset: null,
  };
};
