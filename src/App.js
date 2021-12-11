import React, { useEffect } from 'react';
import { Router, Switch } from 'react-router-dom';
import { history } from './helpers/history';
import LayoutRoute from './routes/LayoutRoute';
import Home from './pages/Home';
import Signin from './pages/Signin';
import ManageUser from './pages/Admin/User/ManageUser';
import { toast, ToastContainer } from 'react-toastify';
import EditUser from './pages/Admin/User/EditUser';
import Loader from './components/Loader/Loader';
import { useDispatch, useSelector } from 'react-redux';
import { clearMessage } from './actions/MessageAction';
import { ROLE } from './constants/Role';
import { LoginLayoutRoute } from './routes/LoginLayoutRoute';
import ManageAsset from './pages/Admin/Asset/ManageAsset';
import ManageReturn from './pages/Admin/Return/ManageReturn';
import ManageReport from './pages/Admin/Report/ManageReport';
import ManageAssignment from './pages/Admin/Assignment/ManageAssignment';
import CreateUser from './pages/Admin/User/CreateUser';
import EditAssignment from './pages/Admin/Assignment/EditAssignment';
import CreateAsset from './pages/Admin/Asset/CreateAsset';
import EditAsset from './pages/Admin/Asset/EditAsset';
import CreateAssignment from './pages/Admin/Assignment/CreateAssignment';

function App() {
  const { user: currentUser } = useSelector((state) => state.authReducer);

  const dispatch = useDispatch();
  toast.configure();

  useEffect(() => {
    history.listen((location) => {
      dispatch(clearMessage());
    });
  }, [dispatch]);

  return (
    <>
      <Router history={history}>
        <Switch>
          <LoginLayoutRoute exact path='/signin' component={Signin} />
          <LayoutRoute exact path='/' currentUser={currentUser} component={Home} />
          <LayoutRoute exact path='/user' currentUser={currentUser} roles={[ROLE.ADMIN]} component={ManageUser} />
          <LayoutRoute
            exact
            path='/user/create-new'
            currentUser={currentUser}
            roles={[ROLE.ADMIN]}
            component={CreateUser}
          />
          <LayoutRoute exact path='/user/:code' currentUser={currentUser} roles={[ROLE.ADMIN]} component={EditUser} />
          <LayoutRoute exact path='/asset' currentUser={currentUser} roles={[ROLE.ADMIN]} component={ManageAsset} />
          <LayoutRoute
            exact
            path='/asset/create-new'
            currentUser={currentUser}
            roles={[ROLE.ADMIN]}
            component={CreateAsset}
          />
          <LayoutRoute exact path='/asset/:code' currentUser={currentUser} roles={[ROLE.ADMIN]} component={EditAsset} />
          <LayoutRoute
            exact
            path='/assignment'
            currentUser={currentUser}
            roles={[ROLE.ADMIN]}
            component={ManageAssignment}
          />
          <LayoutRoute
            exact
            path='/assignment/create-new'
            currentUser={currentUser}
            roles={[ROLE.ADMIN]}
            component={CreateAssignment}
          />
          <LayoutRoute
            exact
            path='/assignment/:id'
            currentUser={currentUser}
            roles={[ROLE.ADMIN]}
            component={EditAssignment}
          />
          <LayoutRoute exact path='/return' currentUser={currentUser} roles={[ROLE.ADMIN]} component={ManageReturn} />
          <LayoutRoute exact path='/report' currentUser={currentUser} roles={[ROLE.ADMIN]} component={ManageReport} />
        </Switch>
      </Router>

      <Loader />
      <ToastContainer />
    </>
  );
}

export default App;
