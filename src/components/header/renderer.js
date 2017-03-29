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
      showVega: props.mode === MODES.Vega
    };
    console.log(this.state);
    this.onSelectVega = this.onSelectVega.bind(this);
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

  // Ajax call: fetches data using the url.
  fetchData(url, functionName) {
    let ajax = new XMLHttpRequest();
    ajax.onload = functionName;
    ajax.open("GET", url, true);
    ajax.send();
  }

  displayGistVega () {
    
  }

  displayGistVegaLite () {
    
  }

  render () {
    const button = (
      <div className='button'
        onClick={(e) => {
          this.setState({
            exampleIsOpened: true
          });
        }}
      >
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
        <header className='header'>Example Gist URL: </header>
        <br/>
        <div className='gist-text'>For example</div>
        <div className='gist-text gist-url'>https://gist.github.com/mathisonian/542616c4af5606784e97e59e3c65b7e5</div>

        <textarea rows='1' placeholder='enter gist url here'></textarea>
        <br/>
        <button className='gist-button' onClick={(url, functionName) => this.fetchData}> Vega </button>
        <button className='gist-button' onClick={(url, functionName) => this.fetchData}> Vega Lite </button>
      </div> 
    );

    return (
      <div className='header'>
        <img height={37} style={{margin: 10}} alt="IDL Logo" src="https://vega.github.io/images/idl-logo.png" />
        {button}
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

              <button className='close-button' onClick={() => { this.setState({ exampleIsOpened: false });}}>✖</button>
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
            <button className='close-button' onClick={() => { this.setState({ gistIsOpened: false });}}>✖</button>
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
