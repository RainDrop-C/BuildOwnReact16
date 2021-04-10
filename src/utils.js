
export function setProps(dom,oldProps,newProps) {
    for(let key in oldProps){

    }
    for(let key in newProps){
        if(key !== 'children') {
            setProp(dom,key,newProps[key])
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