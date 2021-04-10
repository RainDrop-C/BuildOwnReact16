/**
 * index.js:webpack入口起点文件
 */
import React from './react';
import ReactDOM from './react-dom';

let style = {border:'3px solid red',margin:'5px'};
let element1 = (
    <div id="A1" style={style}>
        A1文本
        <div id="B1" style={style}>B1文本
            <div id="C1" style={style}>C1文本</div>
            <div id="C2" style={style}>C2文本</div>
        </div>
        <div id ="B2" style={style}>B2文本</div>
    </div>
)
ReactDOM.render(element1,document.querySelector('#root'));

let render2 = document.getElementById('render2');
render2.addEventListener('click',() =>{
    let element2 = (
        <div id="A1-new" style={style}>
            A1文本-new
            <div id="B1-new" style={style}>B1文本-new
                <div id="C1-new" style={style}>C1文本-new</div>
                <div id="C2-new" style={style}>C2文本-new</div>
            </div>
            <div id ="B2-new" style={style}>B2文本-new</div>
            <div id ="B3-new" style={style}>B3文本-new</div>
        </div>
    )
    ReactDOM.render(element2,document.querySelector('#root'));
});

let render3 = document.getElementById('render3');
render3.addEventListener('click',() =>{
    let element2 = (
        <div id="A1-new2" style={style}>
            A1文本-new2
            <div id="B1-new2" style={style}>B1文本-new2
                <div id="C1-new2" style={style}>C1文本-new2</div>
                <div id="C2-new2" style={style}>C2文本-new2</div>
            </div>
            <div id ="B2-new2" style={style}>B2文本-new2</div>
        </div>
    )
    ReactDOM.render(element2,document.querySelector('#root'));
});