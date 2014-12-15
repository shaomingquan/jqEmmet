(function($){
	var is ={
	    types : ["Array", "Boolean", "Date", "Number", "Object", "RegExp", "String", "Window", "HTMLDocument"]
	};
	for(var i = 0, c; c = is.types[i ++ ]; ){
	    is[c] = (function(type){
	        return function(obj){
	           return Object.prototype.toString.call(obj) == "[object " + type + "]";
	        }
	    })(c);
	}
	$.fn.end = function(tree ,parent){
		console.log(tree);
		var node = null,
			index = 0,
			constructed = false;
		if(!tree.firstChild && !tree.next){
			node = tree.toEntity();
			parent.append($(node));
			return ;
		}
		
		if(tree.firstChild){
			node = tree.toEntity();
			parent.append($(node));
			arguments.callee(tree.firstChild ,$(node));
			constructed = true;
		}
		if(tree.next){
			if(!constructed){	
				node = tree.toEntity();
				parent.append($(node));
			}
			arguments.callee(tree.next ,$(parent));
		}
	}
	$.fn.emmet = function( expression ) {
		var index = 0,
			expr = expression.match(/\S/g).join(""),
			curChar = null,
			eLength = expr.length,
			subExpr = [],
			postfixExp = [],
			opStack = [],
			priority = {
				"*" : 2,
				">" : 1,
				"+" : 0
			};
		Array.prototype.top = function() {
			var length = this.length;
			return this[length - 1];
		}
		Array.prototype.isEmpty = function() {
			return !!!this.length;
		}
		for( ; index < eLength ; index ++){
			curChar = expr.charAt(index);
			if(curChar == "*"|| curChar == ">" || curChar == "+" || curChar == "(" || curChar == ")") {
				subExpr.join("") != "" ? postfixExp.push(subExpr.join("")) : {};
				subExpr = [];
				infixToPostfix(opStack , curChar);
			}else{
				subExpr.push(curChar);
			}
		}
		subExpr.join("") != "" ? postfixExp.push(subExpr.join("")) : {};
		while(!opStack.isEmpty()){
			postfixExp.push(opStack.pop());
		}

		execute.call( this , postfixExp );

		function infixToPostfix(S ,C){
			var op = null;
			if(S.isEmpty() || S.top() == "(" || C == "("){
				S.push(curChar);
				return true;
			}else if(C == ")"){
				while((op = S.pop()) != "("){
					postfixExp.push(op);
				}
				return true;
			}else{
				while(1){
					if( (op = S.top()) != "(" && !S.isEmpty()){
						if(priority[C] < priority[op]){
							postfixExp.push(op);
							S.pop();
						}else{
							S.push(C);
							return true;
						}
					}else{
						S.push(C);
						return true;
					}
				}
			}
		}
	}
	function executeSubExpr(op){
		return document.createElement(op);
	}
	function Node (expression){
		this.next = null;
		this.firstChild = null;
		this.expression = expression;
		this.toEntity = function(){
			var length = this.expression.length,
				expression = this.expression,
				nodeType = [],
				node = null,
				curIndex = 0,
				Class = [],
				id = [],
				innerH = "",
				attrLength = 0,
				attrs = "",
				curAttr = [];
			for(var i = 0 ; i < length ; i ++){
				if(expression.charAt(i) == "." ||
				   expression.charAt(i) == "#" || 
				   expression.charAt(i) == "{" || 
				   expression.charAt(i) == "[" ){
					node = document.createElement(nodeType.join(""));
					break;
				}else{
					nodeType.push(expression.charAt(i));
					if(i == length - 1){
						node = document.createElement(nodeType.join(""));
					}
				}
			}
			if((curIndex = expression.indexOf("#"))!=-1){
				curIndex ++;
				for(var i = 0 ; i + curIndex < length ; i ++){
					if(expression.charAt(i + curIndex) == "." ||
					   expression.charAt(i + curIndex) == "#" || 
					   expression.charAt(i + curIndex) == "{" || 
					   expression.charAt(i + curIndex) == "[" ){
						node.setAttribute("id" ,id.join(""));
						break;
					}else{
						id.push(expression.charAt(i + curIndex));
						if(i + curIndex == length - 1){
							node.setAttribute("id" ,id.join(""));
						}
					}

				}
			}
			if((curIndex = expression.indexOf("."))!=-1){
				curIndex ++;
				for(var i = 0 ; i + curIndex < length ; i ++){
					if(expression.charAt(i + curIndex) == "." ||
					   expression.charAt(i + curIndex) == "#" || 
					   expression.charAt(i + curIndex) == "{" || 
					   expression.charAt(i + curIndex) == "[" ){
						node.setAttribute("class" ,Class.join(""));
						break;
					}else{
						Class.push(expression.charAt(i + curIndex));
						if(i + curIndex == length - 1){
							node.setAttribute("class" ,Class.join(""));
						}
					}

				}
			}
			if(/\{([^\}]+)\}/.test(expression)){
				innerH = RegExp.$1;
				node.innerHTML = innerH;
			}
			if(/\[([^\]]+)\]/.test(expression)){
				attrs = RegExp.$1;
				attrs = attrs.match(/\w+:\w+/g);
				attrLength = attrs.length;
				for(var i = 0 ; i < attrLength ; i++){
					curAttr = attrs[i].split(":");
					node.setAttribute(curAttr[0],curAttr[1]);
				}
				
			}

			return node;
		}
		this.end = function(){
			var curNode = this;
			while(1){
				if(!curNode.next){
					return curNode;
				}
				curNode = curNode.next;
			}
		}
	}
	
	function append(ee ,er ,subExpr ,ended){//ee may linklist
		var appender = null;
		switch(true){
			case is.String(er) && is.String(ee) : {
				appender = new Node(er);
				appender.firstChild = new Node(ee);
				break;	
			} 
			case is.String(er) && !is.String(ee) : {
				appender = new Node(er);
				appender.firstChild = ee;
				break;	
			} 
			case !is.String(er) && is.String(ee) : {
				appender = er;
				appender.firstChild = new Node(ee);
				break;	
			} 
			case !is.String(er) && !is.String(ee) : {
				appender = er;
				appender.firstChild = ee;
				break;	
			} 
		}

		if(ended){
			this.end(appender ,this);
		}else{
			subExpr.push(appender);
		}
	}
	function merge(follow ,front ,subExpr ,ended){//follow may linklist
		var fronter = null;
		switch(true){
			case is.String(follow) && is.String(front) : {
				fronter = new Node(front);
				fronter.next = new Node(follow);
				break;	
			} 
			case !is.String(follow) && is.String(front) : {
				fronter = new Node(front);
				fronter.next = follow;
				break;	
			} 
			case is.String(follow) && !is.String(front) : {
				fronter = front;
				fronter.end().next = new Node(follow);
				break;	
			} 
			case !is.String(follow) && !is.String(front) : {
				fronter = front;
				fronter.end().next = follow;
				break;	
			} 
		}

		if(ended){
			this.end(fronter ,this);
		}else{
			subExpr.push(fronter);
		}

	}
	function multi(num ,node ,subExpr ,ended){//node my linklist
		var headNode = null,
			curNode = null,
			curExp = "",
			expLength = node.length,
			index = 0,
			subTree = null,
			indexs = [],
			curIndex = 0;

		
		if(is.String(node)){
			while((curIndex = node.indexOf("$",curIndex)) != -1){
				var newIndexs = {start:1 ,index:curIndex ,mode:"asc" ,length:1};
				if(curIndex > 0){
					if(node.charAt(curIndex + 1) == "-"){
						newIndexs.mode = "desc";
						curIndex = curIndex + 2;
						newIndexs.length ++ ;
						if(node.charAt(curIndex) == "@"){
							curIndex = curIndex + 1;
							newIndexs.length += 1 ;
							var numOf = parseInt(node.substring(curIndex));
							newIndexs.length += (function(numOf){
								dividend = 10;
								re = 1;
								while( parseInt(numOf / dividend) > 0 ) {
									dividend = dividend * 10;
									re ++;
								}
								console.log(numOf)
								console.log(re)
								return re;
							})(numOf)
							newIndexs.start = parseInt(numOf);
						}else{
							newIndexs.start = num + 1;
						}
					}else{
						curIndex = curIndex + 1;
						var numOf = parseInt(node.substring(curIndex));
							newIndexs.start = parseInt(numOf);
						if(node.charAt(curIndex) == "@"){
							curIndex = curIndex + 1;
							newIndexs.length += 1 ;
							var numOf = parseInt(node.substring(curIndex));
							newIndexs.length += (function(numOf){
								dividend = 10;
								re = 1;
								while( parseInt(numOf / dividend) > 0){
									dividend = dividend * 10;
									re ++;
								}
								console.log(numOf)
								console.log(re)
								return re;
							})(numOf)
							newIndexs.start = parseInt(node.charAt(curIndex));
						}
					}

				}
				indexs.push(newIndexs);
			}
			console.log(indexs);
			for( ; index < num ; index++){
				curExp = (function(index){
					var reNode = node;
					for(var i = 0 ; i < indexs.length ; i ++){
						reNode = reNode.replace(
							node.substring(indexs[i].index ,indexs[i].index + indexs[i].length) ,
							indexs[i].mode == "asc" ? indexs[i].start + index : indexs[i].start - index
						);
					}
					return reNode;
				})(index);
				console.log(curExp);
				if(index == 0){
					headNode = curNode = new Node(curExp);
				}else{
					curNode.next = new Node(curExp);
					curNode = curNode.next;
				}
			}
		}else{
			for( ; index < num ; index++){
				if(index == 0){
					headNode = curNode = node;
				}else{
					subTree = deepCopy(node);
					curNode.end().next = subTree;
					curNode = subTree;
				}
			}
		}

		if(ended){
			this.end(headNode ,this);
		}else{
			subExpr.push(headNode);
		}
	}
	function deepCopy(obj){
		if(!is.Object(obj)){
			return obj;
		}
		var newObj = {}
		for( x in obj ){
			if(obj.hasOwnProperty(x)){
				newObj[x] = arguments.callee(obj[x]);
			}
		}
		return newObj;
	}
	function execute( postfixExp ){
		var pfe = postfixExp,
			length = pfe.length,
			index = 0,
			curChar = null,
			subExpr = [],
			result = null;
		for( ; index < length ; index ++){
			curChar = pfe[index];
			if(curChar == ">" || curChar == "+" || curChar == "*"){
				switch(curChar){
					case ">" : {
						append.call(this ,subExpr.pop() ,subExpr.pop() ,subExpr ,index == length - 1);
						break;
					}case "+" : {
						merge.call(this ,subExpr.pop() ,subExpr.pop() ,subExpr ,index == length - 1);
						break;
					}case "*" : {
						multi.call(this ,subExpr.pop() ,subExpr.pop() ,subExpr ,index == length - 1);
						break;
					}
				}
			}else{
				subExpr.push(curChar);
			}
		}
	}
})(jQuery)