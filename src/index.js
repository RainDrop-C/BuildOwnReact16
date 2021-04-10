/**
 * index.js:webpack入口起点文件
 */
import React from './react';
import ReactDOM from './react-dom';

class ClassCounter extends React.Component {
    constructor(props) {
        super(props);
        this.state = { number:0 };
    }

    onClick = () =>{
        this.setState(state => ({
            number: state.number + 1
        }))
    }

    render() {
        let { number } = this.state;
        return (
            <div id = "counter" name={this.props.name}>
                <span>{number}</span>
                <button onClick={this.onClick}>加1</button>
            </div>
        )
    }
}

const ADD = 'ADD';

function reducer(state,action) {
    switch (action.type) {
        case ADD:
            return { count:state.count +1 };
        default:
            return state;
    }
}

function FunctionCounter() {
    const [numberState,setNumberState] = React.useState({ number:0 });
    const [countState,dispatch] = React.useReducer(reducer, { count:0 });
    return (
        <div>
            <div id = "counter1">
                <span>{numberState.number}</span>
                <button onClick={() => setNumberState({ number: numberState.number + 1 })}>加1</button>
            </div>
            <div id = "counter2">
                <span>{countState.count}</span>
                <button onClick={() => dispatch({ type: ADD })}>加1</button>
            </div>
        </div>
    )
}

ReactDOM.render(<FunctionCounter />,document.getElementById("root"));