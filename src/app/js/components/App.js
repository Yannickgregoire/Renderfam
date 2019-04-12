import React, { Component } from 'react';
import ioSocket from 'socket.io-client';

const socket = ioSocket('http://localhost:3000');
const title = 'My Minimal React Webpack Babel Setuasdp';

export default class App extends Component {

    constructor(props) {
        super(props);
        this.state = { count: 0, users: [] };
    }

    componentDidMount() {
        this.subscribeToCount()
    }

    subscribeToCount = () => {
        socket.on('count', (count) => {
            this.setState({ count: count - 1 })
        });
        socket.on('users', (users) => {
            console.log(users)
            this.setState({ users: users })
        });
    }

    renderCount = () => {
        if (parseInt(this.state.count) === 0) {
            return 'No one else is sharing their GPU... ';
        } else if (parseInt(this.state.count) === 1) {
            return '1 other person is sharing their GPU.';
        } else {
            return this.state.count + ' other people are sharing their GPU.';
        }
    }

    renderUsers = () => {
        return this.state.users.map((user, index) => {
            return <li key={index}>
                <h6 className="purple">→ {user.id}</h6>
                <small className="red">{user.handshake.time}</small><br />
                <small className="red">{user.handshake.headers['user-agent']}</small></li>
        })
    }

    render() {
        return (
            <div>
                <h1>Hello Renderfam.</h1>
                <p>{this.renderCount()}</p>
                <ul>{this.renderUsers()}</ul>
            </div>
        );
    }
};
