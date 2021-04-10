/**
 * index.js:webpack入口起点文件
 */
import React from './react';
import ReactDOM from './react-dom';

let style = {border:'3px solid red',margin:'5px'};
let element = (
    <div id="A1" style={style}>
        A1文本
        <div id="B1" style={style}>B1文本
            <div id="C1" style={style}>C1文本</div>
            <div id="C2" style={style}>C2文本</div>
        </div>
        <div id ="B2" style={style}>B2文本</div>
    </div>
)
ReactDOM.render(element,document.querySelector('#root'));