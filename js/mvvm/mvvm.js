function MVVM(options) {
    // 保存配置对象到vm上
    this.$options = options || {};
    // 保存data对象到vm上 vm._data
    var data = this._data = this.$options.data;
    // 存储vm
    var me = this;

    // 数据代理
    // 实现 vm.xxx -> vm._data.xxx
    // 将data的key存到一个数组里
    // 并且遍历数组里面的每一个key的值 调用函数处理后实现给vm对象添加和data对象中名字相同的属性
    // 读取vm.xxx是 调用 该属性的get来读取 _data中的xxx的值
    // 修改属性的时候 调用set来修改_data中的属性值
    // 总的来说 就是遍历data中的属性
    // 給vm添加data中有的属性 实现用户代理
    Object.keys(data).forEach(function(key) {
        me._proxyData(key);
    });

    this._initComputed();

    observe(data, this);

    this.$compile = new Compile(options.el || document.body, this)
}

MVVM.prototype = {
    $watch: function(key, cb, options) {
        new Watcher(this, key, cb);
    },

    _proxyData: function(key, setter, getter) {
        var me = this;
        setter = setter ||
        // 給vm添加属性 属性名和data中的属性名相同
        Object.defineProperty(me, key, {
            configurable: false,
            enumerable: true,
            // 当通过vm.xxx读取值的时候自动调用
            get: function proxyGetter() {
                return me._data[key]; // 从data中读取对应的属性值并返回
            },
            // 通过vm.xxx= 来修改的值的时候自动调用
            set: function proxySetter(newVal) {
                me._data[key] = newVal;  // 将最新的值保存到data对象对应的属性中
            }
        });
    },

    _initComputed: function() {
        var me = this;
        var computed = this.$options.computed;
        if (typeof computed === 'object') {
            Object.keys(computed).forEach(function(key) {
                Object.defineProperty(me, key, {
                    get: typeof computed[key] === 'function' 
                            ? computed[key] 
                            : computed[key].get,
                    set: function() {}
                });
            });
        }
    }
};