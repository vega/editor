import LZString from 'lz-string'
import * as React from 'react'
import Clipboard from 'react-clipboard.js'
import { Copy, Link } from 'react-feather'
import { withRouter } from 'react-router-dom'
import { mapStateToProps, mapDispatchToProps } from '.'
import './index.css'
import getCookie from '../../../utils/getCookie'
import { BACKEND_URL, COOKIE_NAME } from '../../../constants/consts'

type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>

interface State {
  copied: boolean
  done: boolean
  error: boolean
  fullScreen: boolean
  generatedURL: string
  gistFileName: string
  gistPrivate: boolean
  gistTitle: string
}

class ShareModal extends React.PureComponent<Props, State> {
  constructor(props) {
    super(props)
    this.state = {
      copied: false,
      done: true,
      error: false,
      fullScreen: false,
      generatedURL: '',
      gistFileName: '',
      gistPrivate: false,
      gistTitle: '',
    }
  }

  public exportURL() {
    const serializedSpec =
      LZString.compressToEncodedURIComponent(this.props.editorString) +
      (this.state.fullScreen ? '/view' : '')
    if (serializedSpec) {
      const url = `${document.location.href.split('#')[0]}#/url/${
        this.props.mode
        }/${serializedSpec}`
      this.setState({ generatedURL: url })
    }
  }

  public previewURL() {
    const win = window.open(this.state.generatedURL, '_blank')
    win.focus()
  }

  public onCopy() {
    if (!this.state.copied) {
      this.setState(
        {
          copied: true,
        },
        () => {
          setTimeout(() => {
            this.setState({ copied: false })
          }, 2500)
        }
      )
    }
  }

  public handleCheck(event) {
    this.setState({ fullScreen: event.target.checked }, () => {
      this.exportURL()
    })
  }

  public componentDidMount() {
    this.exportURL()
  }

  public updatePrivacy(event) {
    this.setState({
      gistPrivate: event.target.checked,
    })
  }

  public fileNameChange(event) {
    this.setState({
      gistFileName: event.target.value,
    })
  }

  public titleChange(event) {
    this.setState({
      gistTitle: event.target.value,
    })
  }

  public createGist() {
    this.setState({
      done: false,
    })
    const body = {
      content: this.props.editorString,
      name: this.state.gistFileName || 'spec',
      title: this.state.gistTitle,
      privacy: this.state.gistPrivate,
    }
    const cookieValue = encodeURIComponent(getCookie(COOKIE_NAME))
    fetch(`${BACKEND_URL}gists/create`, {
      body: JSON.stringify(body),
      mode: 'cors',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        Cookie: `${COOKIE_NAME}=${cookieValue}`,
      },
      method: 'post',
    })
      .then(res => {
        if (res.status === 201) {
          return res.json()
        } else {
          this.setState({
            done: true,
            error: true,
          })
          return Promise.reject()
        }
      })
      .then(json => {
        this.setState(
          {
            done: true,
          },
          () => {
            if (typeof json === 'object') {
              this.props.receiveCurrentUser(json.isAuthenticated)
            }
          }
        )
      })
      .catch(error => {
        this.setState({
          done: true,
        })
      })
  }

  public render() {
    return (
      <>
        <h1>Share</h1>
        <div className="share-split">
          <div className="share-url">
            <h3>Via URL</h3>
            <p>
              We pack the Vega or Vega-Lite specification and an encoded string
              in the URL.
            </p>
            <p>
              We use LZ-based compression algorithm and preserve indentation,
              newlines, and other whitespace.
            </p>
            <div>
              <label className="user-pref">
                <input
                  type="checkbox"
                  defaultChecked={this.state.fullScreen}
                  name="fullscreen"
                  onChange={this.handleCheck.bind(this)}
                />
                Open visualization in fullscreen
              </label>
            </div>
            <div className="sharing-buttons">
              <button
                className="sharing-button"
                onClick={() => this.previewURL()}
              >
                <Link />
                <span>Open Link</span>
              </button>
              <Clipboard
                className="sharing-button copy-icon"
                data-clipboard-text={this.state.generatedURL}
                onSuccess={this.onCopy.bind(this)}
              >
                <span>
                  <Copy />
                  Copy to Clipboard
                </span>
              </Clipboard>
              <div
                className={`copied + ${this.state.copied ? ' visible' : ''}`}
              >
                Copied!
              </div>
            </div>
            Number of charaters in the URL: {this.state.generatedURL.length}{' '}
            <span className="url-warning">
              {this.state.generatedURL.length > 2083 && (
                <>
                  Warning:{' '}
                  <a
                    href="https://support.microsoft.com/en-us/help/208427/maximum-url-length-is-2-083-characters-in-internet-explorer"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    URLs over 2083 characters may not be supported in Internet
                    Explorer.
                  </a>
                </>
              )}
            </span>
          </div>
          <div className="create-gist">
            <h3>Via gist</h3>
            <div className="share-input-container">
              <input
                type="checkbox"
                name="private-gist"
                id="private-gist"
                value="private-select"
                checked={this.state.gistPrivate}
                onChange={this.updatePrivacy.bind(this)}
              />
              <label htmlFor="private-gist">Private gist</label>
            </div>
            <div className="share-input-container">
              <label>
                File name (.json is automatically appended):
                <input
                  value={this.state.gistFileName}
                  onChange={this.fileNameChange.bind(this)}
                  type="text"
                  placeholder="Enter file name"
                />
              </label>
            </div>
            <div className="share-input-container">
              <label>
                Title (optional):
                <input
                  value={this.state.gistTitle}
                  onChange={this.titleChange.bind(this)}
                  type="text"
                  placeholder="Enter title of gist"
                />
              </label>
            </div>
            <div className="share-input-container">
              <button onClick={this.createGist.bind(this)}>
                {this.state.done ? 'Create' : 'Creating...'}
              </button>
            </div>
            {this.state.error && (
              <div className="error-message share-error">
                Gist could not be created
              </div>
            )}
          </div>
        </div>
      </>
    )
  }
}

export default withRouter(ShareModal)
