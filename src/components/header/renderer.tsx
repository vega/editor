import './index.css';

import * as React from 'react';
import {Portal, PortalWithState} from 'react-portal';
import {withRouter} from 'react-router-dom';

import {LAYOUT, Mode} from '../../constants';
import {NAMES} from '../../constants/consts';
import {VEGA_LITE_SPECS, VEGA_SPECS} from '../../constants/specs';

const formatExampleName = name => {
  return name
    .split(/[_-]/)
    .map(i => i[0].toUpperCase() + i.substring(1))
    .join(' ');
};

type Props = {
  mode: Mode;
};

type State = {
  customIsOpened?: boolean;
  left?: any;
  showVega: boolean;
  gist: {
    type: string;
    url: string;
    revision: string;
    filename: string;
  };
  width?: number;
  invalidUrl?: boolean;
};

class Header extends React.Component<Props & {history: any}, State> {
  private refGistForm: HTMLFormElement;

  constructor(props) {
    super(props);
    // $FixMe - default state?
    this.state = {
      showVega: props.mode === Mode.Vega,
      gist: {
        type: 'vega',
        url: '',
        revision: '',
        filename: '',
      },
    };
    this.onSelectVega = this.onSelectVega.bind(this);
  }
  public updateGist(gist) {
    this.setState({
      gist: {
        ...this.state.gist,
        ...gist,
      },
    });
  }
  public updateGistType(event) {
    this.updateGist({type: event.currentTarget.value});
  }
  public updateGistUrl(event) {
    this.updateGist({url: event.currentTarget.value});
  }
  public updateGistRevision(event) {
    this.updateGist({revision: event.currentTarget.value});
  }
  public updateGistFile(event) {
    this.updateGist({filename: event.currentTarget.value});
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
  public async onSelectGist(closePortal) {
    const type = this.state.gist.type;
    const url = this.state.gist.url.trim().toLowerCase();

    let revision = this.state.gist.revision.trim().toLowerCase();
    let filename = this.state.gist.filename.trim();

    if (url.length === 0) {
      this.refGistForm.reportValidity();

      return;
    }

    const gistUrl = new URL(url, 'https://gist.github.com');
    const [username, gistId] = gistUrl.pathname.split('/').slice(1);

    if (revision.length === 0) {
      const gistCommits = await fetch(`https://api.github.com/gists/${gistId}/commits`).then(r => r.json());

      revision = gistCommits[0].version;
    }

    if (filename.length === 0) {
      const gistData = await fetch(`https://api.github.com/gists/${gistId}`).then(r => r.json());

      filename = Object.keys(gistData.files).find(f => gistData.files[f].language === 'JSON');

      if (filename === undefined) {
        throw Error();
      }
    }

    this.props.history.push(`/gist/${type}/${username}/${gistId}/${revision}/${filename}`);

    this.setState({
      gist: {
        type: 'vega',
        url: '',
        revision: '',
        filename: '',
      },

      invalidUrl: false,
    });

    closePortal();
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
          {Object.keys(VEGA_LITE_SPECS).map((specGroup, i) => {
            return (
              <div key={i}>
                <h3>{specGroup}</h3>
                {Object.keys(VEGA_LITE_SPECS[specGroup]).map((specType, j) => {
                  const specs = VEGA_LITE_SPECS[specGroup][specType];
                    return (
                      <div className='itemGroup' key={j}>
                        <div className='specType'>{specType}</div>
                        <div className='items'>
                          {specs.map((spec, k) => {
                            return (
                              <div key={k} onClick={() => {this.onSelectVegaLite(spec.name); closePortal();}} className='item'>
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
          })}
        </div>
      );
    };
    const gist = (closePortal) => {
      return (
        <div>
          <h2>Load Gist</h2>
          <div className='gist-content'>
            <form ref={(form) => this.refGistForm = form}>
              <div className='gist-input-container'>
                Gist Type:
                <input type='radio' name='gist-type' id='gist-type[vega]' value='vega' checked={this.state.gist.type === 'vega'} onChange={this.updateGistType.bind(this)} />
                <label htmlFor='gist-type[vega]'>Vega</label>
                <input type='radio' name='gist-type' id='gist-type[vega-lite]' value='vega-lite' checked={this.state.gist.type === 'vega-lite'} onChange={this.updateGistType.bind(this)} />
                <label htmlFor='gist-type[vega-lite]'>Vega Lite</label>
              </div>
              <div className='gist-input-container'>
                <label>
                  Gist URL
                  <div><small>Example: <span className='gist-url'>https://gist.github.com/domoritz/455e1c7872c4b38a58b90df0c3d7b1b9</span></small></div>
                  <input required className='gist-input' type='text' placeholder='Enter url' value={this.state.gist.url} onChange={this.updateGistUrl.bind(this)}/>
                </label>
              </div>
              <div className='gist-optional'>
                <div className='gist-input-container gist-optional-input-container'>
                  <label>
                    Revision (<small>optional</small>)
                    <input className='gist-input' type='text' placeholder='Enter revision' value={this.state.gist.revision} onChange={this.updateGistRevision.bind(this)}/>
                  </label>
                </div>
                <div className='gist-input-container gist-optional-input-container'>
                  <label>
                    Filename (<small>optional</small>)
                    <input className='gist-input' type='text' placeholder='Enter filename' value={this.state.gist.filename} onChange={this.updateGistFile.bind(this)}/>
                  </label>
                </div>
              </div>
              <div className='error-message'>{this.state.invalidUrl && <span>Please enter a valid URL.</span>}</div>
              <button type='button' className='gist-button' onClick={() => {this.onSelectGist(closePortal);}}>
                Load
              </button>
            </form>
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
                <div className='modal'>
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
                  <div className='modal-body' onClick={(e) => {e.stopPropagation();}}>
                    {this.state.showVega ? vega(closePortal) : vegalite(closePortal)}
                  </div>
                </div>
              </div>,
            ),
          ]}
        </PortalWithState>
        <PortalWithState closeOnEsc>
          {({openPortal, closePortal, isOpen, portal}) => [
            <span key='0' onClick={openPortal}>
              {gistButton}
            </span>,
            portal(
              <div className='modal-background' onClick={closePortal}>
                <div className='modal'>
                  <div className='modal-header'>
                    <button className='close-button' onClick={closePortal}>✖</button>
                  </div>
                  <div className='modal-body' onClick={(e) => {e.stopPropagation();}}>{gist(closePortal)}</div>
                </div>
              </div>,
            ),
          ]}
        </PortalWithState>
        <span>{docsLink}</span>
        <span>{customButton}</span>
      </div>
    );
  }
}

export default withRouter(Header);
