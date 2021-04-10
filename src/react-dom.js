import { TAG_ROOT } from "./constants";
import {scheduleRoot} from './scheduler';
/**
 * render是要把一个元素渲染到一个容器内部
 * @param {*} element 元素
 * @param {*} container 容器
 */
function render(element,container) {
    let rootFiber = {
        tag:TAG_ROOT, //每个fiber会有一个tag标示此元素类型
        stateNode:container,//一般情况下如果这个元素是一个原生节点的话，stateNode指向真实DOM元素
        props:{children:[element]}//这个fiber的属性对象children属性，里面放的是要渲染的元素
    }
    scheduleRoot(rootFiber);
}

const ReactDOM = {
    render,
}
export default ReactDOM;