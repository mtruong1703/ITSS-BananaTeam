import React, { Component } from 'react';
import { Router } from "react-router-dom";
import { createBrowserHistory } from 'history';

import Routes from './react-routes/routes';
import { IntlActions } from 'react-redux-multilingual';
import store from './redux/store';
import { PinnedPanel } from '../src/common-components';

import AuthAlert from './modules/alert/components/authAlert';
import ServerDisconnectedAlert from './modules/alert/components/serverDisconnectdAlert';
import { ToastContainer, toast } from 'react-toastify';
import { SocketConstants } from './modules/socket/redux/constants';

import 'react-toastify/dist/ReactToastify.css';
import { getStorage, setStorage } from './config';

const history = createBrowserHistory();

class App extends Component {
    constructor() {
        super();
        this.state = { }
    }

    componentDidMount() {
        const lang = localStorage.getItem('lang');
        if(lang !== null){
            switch(lang){
                case 'en':
                case 'vn':
                    store.dispatch(IntlActions.setLocale(lang));
                    break;
                default:
                    localStorage.setItem('lang', 'vn');
                    store.dispatch(IntlActions.setLocale('vn'));
                    break;
            }
        }else{
            localStorage.setItem('lang', 'vn');
            store.dispatch(IntlActions.setLocale('vn'));
        }
        
        const userId = getStorage('userId');
        if(userId){
            const {socket} = store.getState();
            if(!socket.connected) store.dispatch({ type: SocketConstants.CONNECT_SOCKET_IO });                                                                                                     
        }
    }

    render() {
        return (
            <React.Fragment>
                <ServerDisconnectedAlert/>
                <AuthAlert />
                <ToastContainer 
                    enableMultiContainer={true}
                    closeOnClick={true}
                    draggable={false}
                    containerId={'toast-notification'}
                    position={toast.POSITION.TOP_RIGHT}
                />
                <Router history={history}>
                    <Routes/>
                </Router>
            </React.Fragment>
        );
    }
}

export default App;