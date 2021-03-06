//发布订阅
function PubSub () {
	//储存订阅者的对象
	this.handler = {}
}

PubSub.prototype = {
	//订阅
	on: function(eventType, handler){
		var that = this
		//如果订阅时没有对应主题，则创建一个属于该主题的空数组用于存放订阅者的回调函数
		if(!(eventType in that.handler)){
			that.handler[eventType] = []
		}
		//把订阅者的回调函数推入该主题的数组
		that.handler[eventType].push(handler)		
		return that
	},
	//发布 eg: emit('A',"我是参数") eventType = 'A'
	emit: function(eventType){
		var that = this
		//发布的参数
		var handlerArgs = Array.prototype.slice.call(arguments,1)		
		//同on
		if(!(eventType in that.handler)){
			that.handler[eventType] = []
		}
		for(var i = 0; i < that.handler[eventType].length; i++){
			//循环调用订阅者的回调函数,传入对应参数
			that.handler[eventType][i].apply(that,handlerArgs)
		}		
		return that
	}
}

//观察者
function Observer (options) {
 	this._init(options)
}

//初始化函数
Observer.prototype._init = function(options){
	this.$options = options
	this.$pubsub = new PubSub()
	
	//数据初始化
	this._parseData(this.$options)
}

//添加get和set
Observer.prototype.convert = function(key,val){
	var that = this
	Object.defineProperty(this.$options,key,{
		//是否可以删除目标属性或是否可以再次修改属性的特性
		configurable: true,
		//此对象是否可枚举
		enmerable: true,
		get: function(){
			console.log('你访问了'+ key + '值为' + JSON.stringify(val))
			return val
		},
		set: function(newVal){
			console.log('你设置了'+ key + ',' + '新的值为' + JSON.stringify(newVal))
			val = newVal
			//如果新赋值为对象，则深层遍历			
			if(typeof val === 'object'){
				new Observer(val)
			}
			//每当赋值的时候，发布
			that.$pubsub.emit(key,val)
		}
	})
}


//遍历数据函数,添加get和set
Observer.prototype._parseData = function(obj){
	var value
	for(var key in obj){
		//排除原型链上的属性，仅仅遍历对象本身拥有的属性
		if(obj.hasOwnProperty(key)){
			value = obj[key]
			//如果value为对象，则递归遍历
			if(typeof value === 'object'){
				//this._parseData(value) 不能正确console，但是能添加get和set，为啥
				new Observer(value)  //可以
			}
			this.convert(key,value)
		}
	}
}

//watch，订阅
Observer.prototype.$watch = function(key, callback){
	this.$pubsub.on(key,callback)
}
