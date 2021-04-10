import { TAG_ROOT, ELEMENT_TEXT, TAG_HOST, TAG_TEXT, PLACEMENT,DELETION ,UPDATE } from "./constants";
import { setProps } from './utils'
let nextUnitOfWork = null; //下一个工作单元
let workInProgressRoot = null;//RootFiber应用的根
let currentRoot = null; //渲染成功后的当前根rootFiber
let deletions = [];//删除的节点不放在effect list 要单独记录并执行
/**
 * 从根节点开始渲染和调度
 * 两个阶段（diff+render阶段，commit阶段）
 * diff+render阶段 对比新旧虚拟DOM，进行增量更新或创建
 * 花时间长，可进行任务拆分，此阶段可暂停
 * render阶段的成果是effect list知道哪些节点更新哪些节点增加删除了
 * render阶段两个任务1.根据虚拟DOM生成fiber树 2.收集effectlist
 * commit阶段，进行DOM更新创建阶段，此间断不能暂停
 * @param {tag:TAG_ROOT,stateNode:container,props:{children:[element]} rootFiber 
 */
export function scheduleRoot(rootFiber) {
    if(currentRoot && currentRoot.alternate) { //这就是第二次之后渲染，不能每次都创建树，如起始时可以把第一个树赋给第三个
        workInProgressRoot = currentRoot.alternate;
        workInProgressRoot.props = rootFiber.props;//让他的props更新成新的
        workInProgressRoot.alternate = currentRoot;//他的替身指向当前树
    }else if(currentRoot) {//第一次更新
        rootFiber.alternate = currentRoot;
        workInProgressRoot = rootFiber;
    }else{//如果是第一次渲染
        workInProgressRoot = rootFiber;
    }
    //清空指针
    workInProgressRoot.firstEffect = workInProgressRoot.lastEffect = workInProgressRoot.nextEffect = null;
    nextUnitOfWork = workInProgressRoot;
}

function performUnitOfWork(currentFiber) {
    beginWork(currentFiber);
    if(currentFiber.child) {
        return currentFiber.child; //有孩子返回孩子
    }
    while(currentFiber) {
        completeUnitOfWork(currentFiber);
        if(currentFiber.sibling) {
            return currentFiber.sibling; //有弟弟返回弟弟
        }
        currentFiber = currentFiber.return; //返回父亲
        
    }
}

/**
 * 在完成时收集副作用 组成effect list
 * 每个fiber有两个属性 firstEffect指向第一个有副作用的子fiber 
 * lastEffect指向最后一个有副作用的子fiber，中间用nextEffect做成单链表
 * @param {*} currentFiber 
 */
function completeUnitOfWork(currentFiber) {
    let returnFiber = currentFiber.return;
    if(returnFiber) {
        if(!returnFiber.firstEffect) {
            returnFiber.firstEffect = currentFiber.firstEffect;
        }
        if(currentFiber.lastEffect) {
            if(returnFiber.lastEffect){
                returnFiber.lastEffect.nextEffect = currentFiber.firstEffect;
            }
            returnFiber.lastEffect = currentFiber.lastEffect;
        }

        const effectTag = currentFiber.effectTag;
        if(effectTag){ //如果有副作用，（第一次时肯定有，新增默认PLACEMENT）
            if(returnFiber.lastEffect){
                returnFiber.lastEffect.nextEffect = currentFiber;
            }else{
                returnFiber.firstEffect = currentFiber;
            }
            returnFiber.lastEffect = currentFiber;
        }
    }
}

/**
 * beginWork开始遍历每一个节点
 * 
 * 1.创建真实DOM元素
 * 2.创建子fiber
 * @param {*} currentFiber 
 */
function beginWork(currentFiber) {
    if(currentFiber.tag === TAG_ROOT) {
        updateHostRoot(currentFiber);
    }else if(currentFiber.tag === TAG_TEXT) {
        updateHostText(currentFiber);
    }else if(currentFiber.tag === TAG_HOST) {
        updateHost(currentFiber)
    }
}

function updateHost(currentFiber) {
    if(!currentFiber.stateNode) {//如果此fiber没有创建DOM节点
        currentFiber.stateNode = createDom(currentFiber);
    }
    const newChildren = currentFiber.props.children;
    reconcileChildren(currentFiber,newChildren);
}

function updateHostText(currentFiber) {
    if(!currentFiber.stateNode) {//如果此fiber没有创建DOM节点
        currentFiber.stateNode = createDom(currentFiber);
    }
}


function createDom(currentFiber) {
    if(currentFiber.tag === TAG_TEXT) {
        return document.createTextNode(currentFiber.props.text);
    }else if(currentFiber.tag === TAG_HOST) {
        let stateNode = document.createElement(currentFiber.type);
        updateDOM(stateNode,{},currentFiber.props);
        return stateNode;
    }
}

function updateDOM(stateNode,oldProps,newProps) {
    setProps(stateNode,oldProps,newProps);
}


function updateHostRoot(currentFiber) {
    //先处理自己 如果是一个原生节点，创建真实DOM 2.创建子fiber
    let newChildren = currentFiber.props.children;//[element]
    reconcileChildren(currentFiber,newChildren);//reconcile协调
}

/**
 * 调和
 * @param {*} currentFiber 
 * @param {*} newChildren 
 */
function reconcileChildren(currentFiber,newChildren){
    let newChildIndex = 0;//新子节点的索引
    //如果说当前的currentFiber有alternate属性并且alternate有child属性
    let oldFiber = currentFiber.alternate && currentFiber.alternate.child;
    let prevSibiling;//上一个新的子fiber
    //遍历我们子虚拟DOM元素数组，为每一个虚拟DOM创建子Fiber
    while(newChildIndex < newChildren.length || oldFiber) {
        let newChild = newChildren[newChildIndex]; //取出虚拟DOM节点
        let newFiber;
        const sameType = oldFiber&&newFiber&&oldFiber.type === newChild.type;

        let tag;
        if(newChild && newChild.type == ELEMENT_TEXT) {
            tag = TAG_TEXT;
        }else if(newChild && typeof newChild.type === 'string') {
            tag = TAG_HOST;//如果type是字符串，那么这是一个原生DOM节点div
        }
        if(sameType) { //说明老fiber和新虚拟DOM类型一样，可以复用，更新即可
            newFiber = {
                tag:oldFiber.tag,
                type:   oldFiber.type,
                props:  newChild.props, //一定要新的
                stateNode:  oldFiber.stateNode,//div还没有创建DOM元素
                return: currentFiber,//父Fiber returnFiber
                alternate: oldFiber,//让新的fiber的alternate指向老的fiber
                effectTag:  UPDATE,//副作用标示，render会收集副作用 增加 删除 更新
                nextEffect:null,//effect list也是一个单链表 顺序和完成顺序一样 节点可能会少
            }
        }else{
            if(newChild) { //看看新的DOM节点可有child（有可能是null）
                newFiber = {
                    tag,
                    type:   newChild.type,
                    props:  newChild.props,
                    stateNode:  null,//div还没有创建DOM元素
                    return: currentFiber,//父Fiber returnFiber
                    effectTag:  PLACEMENT,//副作用标示，render会收集副作用 增加 删除 更新
                    nextEffect:null,//effect list也是一个单链表 顺序和完成顺序一样 节点可能会少
                }
            }

            if(oldFiber) {
                oldFiber.effectTag = DELETION;
                deletions.push(oldFiber);
            }
        }
        
        if(oldFiber) {
            oldFiber = oldFiber.sibling; //oldFiber指针也向后移动一次,为了保持与下次对比
        }

        if(newFiber) {
            if(newChildIndex == 0) {//如果索引是0，就是大儿子
                currentFiber.child = newFiber;
            }else {
                prevSibiling.sibling = newFiber;//大儿子指向弟弟
            }
            prevSibiling = newFiber;
        }
        newChildIndex++;
    }
}

/**
 * 回调返回浏览器空闲时间，判断是否继续执行任务
 * @param {*} deadline 
 */
function workLoop(deadline) {
    let shouldYield = false; //react是否要让出时间或说控制权
    while (nextUnitOfWork && !shouldYield) {
        nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
        shouldYield = deadline.timeRemaining() < 1;
    }
    if(!nextUnitOfWork && workInProgressRoot) {
        // console.log('render阶段结束');
        commitRoot();
    }
    //每一帧都要执行这个代码
    window.requestIdleCallback(workLoop,{ timeout : 500});
}

function commitRoot() {
    deletions.forEach(commitWork);//执行 effect list之前先把该删除的元素删除
    let currentFiber =  workInProgressRoot.firstEffect;
    while(currentFiber) {
        commitWork(currentFiber);
        currentFiber = currentFiber.nextEffect;
    }
    deletions.length = 0;//提交后清空deletions数组
    currentRoot = workInProgressRoot; //把当前渲染成功的根fiber 赋给currentRoot
    workInProgressRoot = null;
}

function commitWork(currentFiber) {
    if(!currentFiber) return;
    let returnFiber = currentFiber.return;
    let domReturn = returnFiber.stateNode;
    if(currentFiber.effectTag === PLACEMENT) {//处理新增节点
        domReturn.appendChild(currentFiber.stateNode);
    }else if(currentFiber.effectTag === DELETION) {//删除节点
        domReturn.removeChild(currentFiber.stateNode);
    }else if(currentFiber.effectTag === UPDATE) {
        if(currentFiber.type === ELEMENT_TEXT) {
            if(currentFiber.alternate.props.text != currentFiber.props.text){
                currentFiber.stateNode.textContent = currentFiber.props.text;
            }
        }else{
            updateDOM(currentFiber.stateNode,currentFiber.alternate.props,currentFiber.props)
        }
    }
    currentFiber.effectTag = null;
}
//react询问浏览器是否空闲,这里有个优先级的概念 expirationTime
window.requestIdleCallback(workLoop,{timeout:500});
