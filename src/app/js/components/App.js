import React, { Component } from 'react';
import ioSocket from 'socket.io-client';

const socket = ioSocket('http://localhost:3000');

export default class App extends Component {

    constructor(props) {
        super(props);
        this.state = { count: 0, users: [], file: '', chunk: 0, progress: 0 };
    }

    componentDidMount() {
        this.subscribeToSocket()
        this.startProgress()
    }

    subscribeToSocket = () => {

        socket.on('count', (count) => {
            this.setState({ count })
        });

        socket.on('users', (users) => {
            this.setState({ users })
        });

        socket.on('file', (file) => {
            this.setState({ file })
        });

        socket.on('chunk', (chunk) => {
            this.setState({ chunk })
        });

        socket.on('progress', (progress) => {
            this.setState({ progress })
        });
    }

    startProgress = () => {
        setInterval(() => {
            socket.emit('progress');
        }, 100)
    }

    renderCount = () => {
        if (parseInt(this.state.count) === 1) {
            return 'No one else is sharing their GPU... ';
        } else if (parseInt(this.state.count) === 2) {
            return '1 other person is sharing their GPU.';
        } else {
            return this.state.count - 1 + ' other people are sharing their GPU.';
        }
    }

    renderLines = () => {
        if (this.state.file.image) {
            return this.state.file.image.map((line, index) => {
                let visible = (this.state.progress * (this.state.file.image.length / 100) > line.id);
                return <div key={index} className="line" style={{
                    backgroundColor: `rgba(${line.rgb[0]},${line.rgb[1]},${line.rgb[2]})`,
                    // opacity: visible ? 1 : 0,
                    transform: `scaleY(${visible ? 1 : 0})`
                }}></div>
            })
        }
    }

    renderProgress = () => {
        if (this.state.progress) {
            let bars = [<span>[</span>];
            for (var i = 0; i < 10; i++) {
                bars.push(<span key={i}>{(Math.round(this.state.progress / 10) > i) ? '=' : '-'}</span>);
            }
            bars.push(<span>]</span>)
            return bars;
        }
    }

    renderUsers = () => {
        return this.state.users.map((user, index) => {
            return <li key={index}>
                <small>{user.id} </small>
                {/* <small className="grey">{user.handshake.time}</small><br /> */}
                <small className="grey">{user.handshake.headers['user-agent']}</small>
            </li>
        });
    }

    render() {

        let style = { color: 'black' }
        if (this.state.file) {
            const line = this.state.file.image.filter((l) => {
                return (l.id === Math.floor(this.state.progress))
            })[0]
            style = { color: `rgba(${line.rgb[0]},${line.rgb[1]},${line.rgb[2]})` }
        }

        return (
            <div>
                <div className="canvas">{this.renderLines()}</div>
                <div className="list">
                    <p>Rendering {this.state.file.title}</p>
                    <p>Chunk: {this.state.chunk} <span style={style}>{this.renderProgress()}</span> {this.state.progress.toFixed(2)}%</p>
                    <h1>Nodes</h1>
                    <p>{this.renderCount()}</p>
                    <ul>{this.renderUsers()}</ul>
                </div>
            </div>
        );
    }
};
