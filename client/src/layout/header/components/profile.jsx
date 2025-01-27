import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withTranslate } from 'react-redux-multilingual';
import { ApiImage } from '../../../common-components';
import { AuthActions } from '../../../modules/auth/redux/actions';
class Profile extends Component {
    constructor(props) {
        super(props);
        this.state = {}
    }

    _checkLink = (url) => {
        const arr = this.props.auth.links.filter((item) => item.url === url);
        if (arr.length > 0) return true;
        else return false;
    };

    render() {
        const { auth, translate } = this.props;
        return (
            <li className="dropdown user user-menu">
                <a className="dropdown-toggle" data-toggle="dropdown" style={{ cursor: 'pointer', width: '50px', minHeight: '50px' }}>
                    <img className="user-image" alt="User Avatar" src={process.env.REACT_APP_SERVER + auth.user.avatar} />
                </a>
                <ul className="dropdown-menu" style={{ border: '0.2px solid #d1d1d1' }}>
                    {/* User image */}
                    <li className="user-header" style={{ backgroundColor: '#343A40' }}>
                        <img className="img-circle" alt="User Avatar" src={process.env.REACT_APP_SERVER + auth.user.avatar} />
                        <p>
                            {auth.user.name}
                            <small>{auth.user.email}</small>
                        </p>
                    </li>
                    <li className="user-footer">

                        <div className="row">
                            {
                                this._checkLink("/hr-detail-employee") &&
                                <div style={{ marginTop: '10px' }} className="col-xs-12 col-sm-12 col-md-12 col-lg-12">
                                    <a style={{ width: '100%' }} href="/hr-detail-employee" data-toggle="modal" className="btn btn-default btn-flat"><i className="fa fa-info-circle"></i>Thông tin cá nhân</a>
                                </div>
                            }
                            <div style={{ marginTop: '10px' }} className="col-xs-12 col-sm-12 col-md-12 col-lg-12">
                                <a style={{ width: '100%' }} href="#modal-profile" data-toggle="modal" className="btn btn-default btn-flat"><i className="fa fa-info-circle"></i> {translate('auth.profile.title')} </a>
                            </div>
                            <div style={{ marginTop: '10px' }} className="col-xs-12 col-sm-12 col-md-6 col-lg-6">
                                <a style={{ width: '100%' }} href="#modal-security" data-toggle="modal" className="btn btn-default btn-flat"><i className="fa fa-gear"></i> {translate('auth.security.label')} </a>
                            </div>
                            <div style={{ marginTop: '10px' }} className="col-xs-12 col-sm-12 col-md-6 col-lg-6">
                                <button style={{ width: '100%' }} type="button" className="btn btn-default btn-flat pull-right" onClick={this.props.logout}><i className="fa fa-sign-out"></i> {translate('auth.logout')} </button>
                            </div>
                            <div style={{ marginTop: '10px' }} className="col-xs-12 col-sm-12 col-md-12 col-lg-12">
                                <button style={{ width: '100%' }} type="button" className="btn btn-default btn-flat" onClick={this.props.logoutAllAccount}><i className="fa fa-power-off"></i> {translate('auth.logout_all_account')} </button>
                            </div>
                        </div>
                    </li>
                </ul>
            </li>
        );
    }
}

const mapStateToProps = state => {
    return state;
}

const mapDispatchToProps = {
    logout: AuthActions.logout,
    logoutAllAccount: AuthActions.logoutAllAccount
}

export default connect(mapStateToProps, mapDispatchToProps)(withTranslate(Profile));