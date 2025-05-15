import React from 'react';
import {mapStateToProps} from './index.js';
import {BACKEND_URL} from '../../constants/index.js';

type Props = ReturnType<typeof mapStateToProps> & {children?: React.ReactNode};

class LoginConditional extends React.PureComponent<Props> {
  constructor(props) {
    super(props);
    this.state = {};
  }

  handleLogin = (e) => {
    e.preventDefault();

    const popup = window.open(`${BACKEND_URL}auth/github`, 'github-login', 'width=600,height=600,resizable=yes');
    if (popup) {
      popup.focus();
    } else {
      window.location.href = `${BACKEND_URL}auth/github`;
    }

    return false;
  };

  public render() {
    const githubLink = (
      <a href={`${BACKEND_URL}auth/github`} onClick={this.handleLogin}>
        Login with GitHub
      </a>
    );

    return <>{this.props.isAuthenticated ? this.props.children : <span>{githubLink} to use the Gist feature.</span>}</>;
  }
}

export default LoginConditional;
