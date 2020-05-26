import React from 'react';
import {mapStateToProps} from '.';
import {BACKEND_URL} from '../../constants';

type Props = ReturnType<typeof mapStateToProps> & {children?: React.ReactNode};

class LoginConditional extends React.PureComponent<Props> {
  constructor(props) {
    super(props);
    this.state = {};
  }

  public render() {
    const githubLink = (
      /* eslint-disable-next-line react/jsx-no-target-blank */
      <a href={`${BACKEND_URL}auth/github`} target="_blank">
        Login with GitHub
      </a>
    );

    return <>{this.props.isAuthenticated ? this.props.children : <span>{githubLink} to use the Gist feature.</span>}</>;
  }
}

export default LoginConditional;
