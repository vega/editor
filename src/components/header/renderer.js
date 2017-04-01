import React from 'react';
import Portal from 'react-portal';
import { MODES, SPECS } from '../../constants';
import './index.css';
import { hashHistory } from 'react-router';

var req = require.context('../../../spec', true, /^(.*\.(json$))[^.]*$/igm);
req.keys().forEach(req);

const formatExampleName = (name) => {
  return name.split('_').map(i => i[0].toUpperCase() + i.substring(1)).join(' ');
}

export default class Header extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showVega: props.mode === MODES.Vega,
      url: ''
    };
    this.onSelectVega = this.onSelectVega.bind(this);
  }

  handleChange(event) {
    this.setState({url: event.target.value});
  }

  onSelectVega (name) {
    this.setState({
      exampleIsOpened: false
    });
    hashHistory.push('/editor/examples/vega/' + name);
  }

  onSelectVegaLite (name) {
    this.setState({
      exampleIsOpened: false
    });
    hashHistory.push('/editor/examples/vega_lite/' + name);
  }

  onSelect (selection) {
    const key = selection.key;
    if (key.startsWith('vega-lite-')) {
      this.onSelectVegaLite(key.substr(10));
    } else if (key.startsWith('vega-')) {
      this.onSelectVega(key.substr(5));
    } else if (key === 'custom-vega') {
      this.props.updateVegaSpec('{}');
    } else if (key === 'custom-vega-lite') {
      this.props.updateVegaLiteSpec('{}');
    }
  }

  fetchData(gistUrl, vegaVersion) {
    let prefix = 'https://hook.io/tianyiii/vegaeditor/';
    let hookUrl = prefix + vegaVersion + '/' 
      + gistUrl.substring(gistUrl.indexOf('.com/') + '.com/'.length);
    let suffix = hookUrl.substring(prefix.length);
   
    fetch(hookUrl, {
      method: 'get',
      mode: 'cors'
    })
    .then((response) => {
      if (response.status === 200) {
        return Promise.resolve(response);
      } else {
        return Promise.reject(new Error(response.statusText));
      }
    })
    .then((response) => {
      let arrayNames = suffix.split('/');
      if (arrayNames.length < 3) {
        console.warn('invalid url');
        return;
      }
      let username = arrayNames[1];
      let id = arrayNames[2];
      hashHistory.push('/editor/gist/' + vegaVersion +'/' + username + '/' + id);
      return response.json();
    })
    .then((data) => {
      if (data['message'] !== 'Not Found') {
        if (vegaVersion === 'vega') {
          this.props.setGistVegaSpec(hookUrl, JSON.stringify(data, null, 2));
        } else if (vegaVersion === 'vega-lite') {
          this.props.setGistVegaLiteSpec(hookUrl, JSON.stringify(data, null, 2));
        }
      } else {
        console.warn('invalid url');
      }
    })
    .catch((ex) => {
      console.error(ex);
    })
  }

  render () {
    const examplesButton = (
      <div className='button'
        onClick={(e) => {
          this.setState({
            exampleIsOpened: true
          });
        }}>
        {'Examples'}
      </div>
    );

    const gistButton = (
      <div className='button'
        onClick={(e) => {
          this.setState({
            gistIsOpened: true
          });
        }}>
        {'Gist'}
      </div>
    )

    const vega = (
      <div className="vega">
        {
            Object.keys(SPECS.Vega).map((specType) => {
              const specs = SPECS.Vega[specType];
              return (
                
                <div className='itemGroup'>
                  <div className='specType'>{specType}</div>
                  <div className='items'>
                    {
                      specs.map((spec) => {
                        return (
                          <div onClick={() => this.onSelectVega(spec.name)} className='item'>
                            <div style={{backgroundImage: `url(images/examples/vega/${spec.name}.vg.png)` }} className='img' />
                            <div className='name'>{formatExampleName(spec.name)}</div>
                          </div>
                        )
                      })
                    }
                  </div>
                </div>
              );
            })
        }
      </div>
    );

    const vegalite = (
      <div className="vega-Lite">
        {
          Object.keys(SPECS.VegaLite).map((specType) => {
            const specs = SPECS.VegaLite[specType];
            return (
              <div className='itemGroup'>
                <div className='specType'>{specType}</div>
                <div className='items'>
                  {
                    specs.map((spec) => {
                      return (
                        <div onClick={() => this.onSelectVegaLite(spec.name)} className='item'>
                          <div style={{backgroundImage: `url(images/examples/vl/${spec.name}.vl.png)` }} className='img' />
                          <div className='name'>{spec.title}</div>
                        </div>
                      )
                    })
                  }
                </div>
              </div>
            );
          })
        }
      </div>
    );

    const gist = (
      <div>
        <header>Enter Gist URL: </header>
        <div className='gist-content'>
          <div className='gist-text'>For example</div>
          <div className='gist-url'>https://gist.github.com/mathisonian/542616c4af5606784e97e59e3c65b7e5</div>
          
          <input className='gist-input' type='text' placeholder='enter gist url here' value={this.state.url} 
          onChange={this.handleChange.bind(this)}/> 

          <button className='gist-button' onClick={() => {            
            this.fetchData(this.state.url, 'vega');
            this.setState({
              gistIsOpened: false, 
              url: ''
            })
          }}> Vega 
          </button>
          <button className='gist-button' onClick={() => {
            this.fetchData(this.state.url, 'vega-lite');
            this.setState({ 
              gistIsOpened: false,
              url: ''
              }); 
            }}> Vega Lite 
          </button>
        </div>
      </div> 
    );

    return (
      <div className='header'>
        <img height={37} style={{margin: 10}} alt="IDL Logo" src="https://vega.github.io/images/idl-logo.png" />
        {examplesButton}
        {gistButton}
        <Portal 
          closeOnOutsideClick={true}
          isOpened={this.state.exampleIsOpened}
          onClose={() => { this.setState({ exampleIsOpened: false});}}
        >
          <div className='modal-background'>
            <div className='modal-header'>
              <div className='button-groups'>
                <button className={this.state.showVega ? 'selected' : ''} onClick={() => { this.setState({ showVega: true });}}>{'Vega'}</button>
                <button className={this.state.showVega ? '' : 'selected'} onClick={() => { this.setState({ showVega: false });}}>{'Vega Lite'}</button>
              </div>

              <button className='close-button' onClick={() => {this.setState({ exampleIsOpened: false });}}>✖</button>
            </div>
            <div className='modal-area'>
              <div className='modal'>
                { this.state.showVega ? vega : vegalite }
              </div>
            </div>
          </div>
        </Portal>

        <Portal 
          closeOnOutsideClick={true}
          isOpened={this.state.gistIsOpened}
          onClose={() => { this.setState({ gistIsOpened: false});}}
        >
        <div className='modal-background'>
          <div className='modal-header'>
            <button className='close-button' onClick={() => {this.setState({ gistIsOpened: false });}}>✖</button>
          </div>
          <div className='modal-area'>
            <div className='modal'>
              {gist}
            </div>
          </div>
        </div>
        </Portal>
      </div>
    );
  };
};
