
export function setProps(dom,oldProps,newProps) {
    for(let key in oldProps){
        if(key !== 'children') {
            if(newProps.hasOwnProperty('key')) {//新老都有更新
                setProp(dom, key,newProps[key]);
            }else{//老的有新的没有删除
                dom.removeAttribute(key);
            }
        }
    }
    for(let key in newProps){
        if(key !== 'children') {
            if(!oldProps.hasOwnProperty('key')) {//老的没有新的有，添加
                setProp(dom, key, newProps[key]);
            }
        }
    }
}

function setProp(dom,key,value) {
    if(/^on/.test(key)) {
        dom[key.toLowerCase()] = value;//没有用合成事件
    }else if(key === 'style') {
        if(value){
            for (let styleName in value){
                if (value.hasOwnProperty(styleName)) {
                    dom.style[styleName] = value[styleName];
                }
            }
        }
    }else {
        dom.setAttribute(key,value);
    }
    return dom;
}