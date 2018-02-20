import './index.css';

import * as React from 'react';
import {Portal, PortalWithState} from 'react-portal';
import {withRouter} from 'react-router-dom';

import {LAYOUT, Mode} from '../../constants';
import {NAMES} from '../../constants/consts';
import {VEGA_LITE_SPECS, VEGA_SPECS} from '../../constants/specs';

const formatExampleName = (name) => {
  return name
    .split(/[_-]/)
    .map((i) => i[0].toUpperCase() + i.substring(1))
    .join(' ');
};

const validateUrl = (url) => {
  const reg = /^((http(s)?:\/\/)?(www.)?[-a-zA-Z0-9]+\.[-a-zA-Z0-9\.]+\/)?[-a-zA-Z0-9]+\/[-a-zA-Z0-9]+\/?$/g;
  return reg.test(url);
};

type Props = {
  mode: Mode;
};

type State = {
  customIsOpened?: boolean;
  left?: any;
  showVega: boolean;
  url: string;
  width?: number;
  invalidUrl?: boolean;
};

class Header extends React.Component<Props & {history: any}, State> {
  constructor(props) {
    super(props);
    // $FixMe - default state?
    this.state = {
      showVega: props.mode === Mode.Vega,
      url: '',
    };
    this.onSelectVega = this.onSelectVega.bind(this);
  }
  public handleChange(event) {
    this.setState({url: event.target.value});
  }
  public onSelectVega(name) {
    this.props.history.push('/examples/vega/' + name);
  }
  public onSelectNewVega() {
    this.props.history.push('/custom/vega');
  }
  public onSelectVegaLite(name) {
    this.props.history.push('/examples/vega-lite/' + name);
  }
  public onSelectNewVegaLite() {
    this.props.history.push('/custom/vega-lite');
  }
  public onSelectVegaGist(gistUrl, closePortal) {
    if (validateUrl(gistUrl)) {
      this.setState({
        url: '',
        invalidUrl: false
      });
      const username = this.getGistNameAndId(gistUrl)[0];
      const id = this.getGistNameAndId(gistUrl)[1];
      this.props.history.push('/gist/vega/' + username + '/' + id);
      closePortal();
    } else {
      this.setState({
        invalidUrl: true
      });
    }
  }
  public onSelectVegaLiteGist(gistUrl, closePortal) {
    if (validateUrl(gistUrl)) {
      this.setState({
        url: '',
        invalidUrl: false
      });
      const username = this.getGistNameAndId(gistUrl)[0];
      const id = this.getGistNameAndId(gistUrl)[1];
      this.props.history.push('/gist/vega-lite/' + username + '/' + id);
      closePortal();
    } else {
      this.setState({
        invalidUrl: true
      });
    }
  }
  public getGistNameAndId(gistUrl) {
    const suffix = gistUrl.substring(gistUrl.indexOf('.com/') + './com'.length);
    const arrayNames = suffix.split('/');
    if (arrayNames.length < 2) {
      console.warn('invalid url');
      return;
    }
    return arrayNames;
  }
  public render() {
    const examplesButton = (
      <div className='button'>
        {'Examples'}
      </div>
    );
    const gistButton = (
      <div className='button'>
        {'Gist'}
      </div>
    );
    const docsLink = (
      <a className='button right' href={this.props.mode === Mode.Vega ? 'https://vega.github.io/vega/docs/' : 'https://vega.github.io/vega-lite/docs/'} target='_blank' rel='noopener noreferrer'>
        {NAMES[this.props.mode]} Docs
      </a>
    );
    const customButton = (
      <div onMouseOver={(e) => {
          const targetRect = (e.target as any).getBoundingClientRect();
          this.setState({
            customIsOpened: true,
            left: targetRect.left,
          });
      }}>
        {'New'}
      </div>
    );
    const vega = (closePortal) => {
      return (
        <div className='vega'>
          {Object.keys(VEGA_SPECS).map((specType, i) => {
            const specs = VEGA_SPECS[specType];
            return (
              <div className='itemGroup' key={i}>
                <div className='specType'>{specType}</div>
                <div className='items'>
                  {specs.map((spec, j) => {
                    return (
                      <div key={j} onClick={() => {this.onSelectVega(spec.name); closePortal();}} className='item'>
                        <div style={{backgroundImage: `url(images/examples/vg/${spec.name}.vg.png)`}} className='img'/>
                        <div className='name'>{formatExampleName(spec.name)}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      );
    };
    const vegalite = (closePortal) => {
      return (
        <div className='vega-Lite'>
          {Object.keys(VEGA_LITE_SPECS).map((specType, i) => {
            const specs = VEGA_LITE_SPECS[specType];
            return (
              <div className='itemGroup' key={i}>
                <div className='specType'>{specType}</div>
                <div className='items'>
                  {specs.map((spec, j) => {
                    return (
                      <div key={j} onClick={() => {this.onSelectVegaLite(spec.name); closePortal();}} className='item'>
                        <div style={{backgroundImage: `url(images/examples/vl/${spec.name}.vl.png)`}} className='img'/>
                        <div className='name'>{spec.title}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      );
    };
    const gist = (closePortal) => {
      return (
        <div>
          <header>Enter Gist URL: </header>
          <div className='gist-content'>
            <div className='gist-text'>For example (Vega-Lite)</div>
            <div className='gist-url'>
            https://gist.github.com/domoritz/455e1c7872c4b38a58b90df0c3d7b1b9
            </div>
            <input className='gist-input' type='text' placeholder='enter gist url here' value={this.state.url} onChange={this.handleChange.bind(this)}/>
            <div className='error-message'>{this.state.invalidUrl && <span>Please enter a valid URL.</span>}</div>
            <button className='gist-button' onClick={() => {this.onSelectVegaGist(this.state.url, closePortal);}}>
              Vega
            </button>
            <button className='gist-button' onClick={() => {this.onSelectVegaLiteGist(this.state.url, closePortal);}}>
              Vega-Lite
            </button>
          </div>
        </div>
      );
    };
    return (
      <div className='header'>
        <a className='idl-logo' href='https://idl.cs.washington.edu/' target='_blank' rel='noopener noreferrer'>
          <img height={37} alt='IDL Logo' src='https://vega.github.io/images/idl-logo.png'/>
        </a>

        {this.state.customIsOpened && (
          <Portal>
            <div className='customSubmenuGroup'
              onMouseOver={() => {
                this.setState({customIsOpened: true});
              }}
              onMouseLeave={() => {
                this.setState({customIsOpened: false});
              }}
              onClick={() => {
                this.setState({customIsOpened: false});
              }}
              style={{
                left: this.state.left,
                width: this.state.width, // $FixMe
                position: 'absolute',
                cursor: 'pointer',
                zIndex: 1000000000,
                top: 0,
              }}
            >
              <div id='emptyButton' style={{height: LAYOUT.HeaderHeight}} />

              <div className='customSubmenu' onClick={() => this.onSelectNewVega()}>
                {'Vega'}
              </div>
              <div className='customSubmenu' onClick={() => this.onSelectNewVegaLite()}>
                {'Vega-Lite'}
              </div>
            </div>
          </Portal>
        )}
        <PortalWithState closeOnEsc>
          {({openPortal, closePortal, isOpen, portal}) => [
            <span key='0' onClick={openPortal}>
              {examplesButton}
            </span>,
            portal(
              <div className='modal-background' onClick={closePortal}>
                <div className='modal-header'>
                  <div className='button-groups' onClick={(e) => {e.stopPropagation();}}>
                    <button className={this.state.showVega ? 'selected' : ''}
                      onClick={() => {
                        this.setState({showVega: true});
                      }}
                    >
                      {'Vega'}
                    </button>
                    <button className={this.state.showVega ? '' : 'selected'}
                      onClick={() => {
                        this.setState({showVega: false});
                      }}
                    >
                      {'Vega-Lite'}
                    </button>
                  </div>
                  <button className='close-button' onClick={closePortal}>✖</button>
                </div>
                <div className='modal-area'>
                  <div className='modal' onClick={(e) => {e.stopPropagation();}}>
                    {this.state.showVega ? vega(closePortal) : vegalite(closePortal)}
                  </div>
                </div>
              </div>
            )
          ]}
        </PortalWithState>
        <PortalWithState closeOnEsc>
          {({openPortal, closePortal, isOpen, portal}) => [
            <span key='0' onClick={openPortal}>
              {gistButton}
            </span>,
            portal(
              <div className='modal-background' onClick={closePortal}>
                <div className='modal-header'>
                <button className='close-button' onClick={closePortal}>✖</button>
                </div>
                <div className='modal-area'>
                  <div className='modal' onClick={(e) => {e.stopPropagation();}}>{gist(closePortal)}</div>
                </div>
              </div>
            )
          ]}
        </PortalWithState>
        <span>{docsLink}</span>
        <span>{customButton}</span>
      </div>
    );
  }
}

export default withRouter(Header);
