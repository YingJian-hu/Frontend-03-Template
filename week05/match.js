function match(selector, element) {
    //  分出复合选择器，并让选择器由内向外排序
    let selectors = selector.split(',');
    selectors = selectors.map(item => item.split(' ').reverse());
    
    //  构建当前elementDOM树，用队列存储，从内向外
    let queue = [];
    while(element && element.tagName) {
      queue.push(element);
      element = element.parent;
    }
    
    //  因可能是并集复合选择器，因此先循环选择器，匹配任意一个选择器即可 #a b, #a c {...}
    for(let i = 0; i < selectors.length; i++) {
      let selectorParts = selectors[i];
      let matchNum = 0;
      
      //  循环元素
      for(let j = 0; j < queue.length; j++ ) {
        if(matchHelper(queue[j], selectorParts[matchNum])) {
          matchNum++;
        }
      }
      
      //  所有元素匹配上
      if(matchNum >= selectorParts.length) {
        return true;
      }
    }
    return false;
  }
  
  //  匹配辅助函数
  function matchHelper(element, selector) {
    if(!selector || !element.attribuites) {
      return false;
    }
  
    //  id选择器
    if(selector.startsWith('#')) {
      let attr = element.attribuites.filter(attr => attr.name === 'id')[0];
      if(attr && attr.value === selector.replace('#', '')) {
        return true;
      }
    } 
  
    //  类选择器
    else if(selector.startsWith('.')) {
      let attr = element.attribuites.filter(attr => attr.name === 'class')[0];
      if(attr && attr.value === selector.replace('.', '')) {
        return true;
      }
      //  匹配带空格的class选择器
      if(attr && attr.value.split(' ').includes(selector.replace('.', ''))) {
        return true;
      }
    } 
    
    //  组合选择器
    else if(selector.match(/[.#:\[]/)){
      const simpleSelectors = selector.split(/(?<=[\w\]\)])(?=[#.:\[])/);
      return simpleSelectors.every(simpleSelector => matchHelper(element, simpleSelector));
    } 
    
    //  标签选择器
    else {
        return selector === element.tagName;
    }
    return false;
  }
  
  
  
  const dom = [
      {
          tagName: 'div',
          attribuites: [{
              name: 'id',
              value: 'l3'
          }],
          parent: {
              tagName: 'div',
              attribuites: [{
                  name: 'id',
                  value: 'container'
              }],
              parent: {
                  tagName: 'body',
                  parent: {
                      tagName: 'html'
                  }
              }
          }
      },
      {
          tagName: 'span',
          attribuites: [{
              name: 'class',
              value: 'l2'
          }],
          parent: {
              tagName: 'div',
              attribuites: [{
                  name: 'id',
                  value: 'container'
              }],
              parent: {
                  tagName: 'body',
                  parent: {
                      tagName: 'html'
                  }
              }
          }
      }
  ]
  
  // test
  
  //  #container #myid,#container cl1 => #myid    true
  // match("#container #myid,#container cl1", dom)
  
  //  #container #myid,#container cl1 => .cl1     true
  // match("#container #myid,#container cl1", dom)
  
  //  #container #myid => #l3                     false
  // match("#container #myid,#container cl1", dom)
  
  //  #container span.l2 => span                  true
  // match("#container span.l2", dom)
  
  //  #container span#l2 => span                  false
  // match("#container span#l2", dom)
  
  //  #container span => span                     true
  // match("#container span", dom)
  
  console.log(match("#container span", dom[1]));