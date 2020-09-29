


//为什么这么写
// umd模块管理

// 参考地址：https://www.w3cschool.cn/zobyhd/1ldb4ozt.html
// (function ( root, factory ) {
//     if ( typeof exports === 'object' ) {
//         // CommonJS
//         factory( exports, require('b') );
//     } else if ( typeof define === 'function' && define.amd ) {
//         // AMD. Register as an anonymous module.
//         define( ['exports', 'b'], factory);
//     } else {
//         // Browser globals
//         factory( (root.commonJsStrict = {}), root.b );
//     }
// }(this, function ( exports, b ) {
//     //use b in some fashion.

//     // attach properties to the exports object to define
//     // the exported module properties.
//     exports.action = function () {};
// }));
(function (root, fatory) {
    var Pub = {}
    root.Pub = Pub
    var define = root.define;
    fatory(Pub)

    if (typeof exports === 'object') {
        if (module !== undefined && module.exports) {
            exports = module.exports = PubSub; // Node.js specific `module.exports`
        }
        // CommonJS
        exports.Pub = Pub;
        module.exports = exports = PubSub
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(function () { return PubSub; });
    }

    return Pub
})(typeof window === 'object' ? 'window' : this, function (Pub) {
    var messages = {}//保留
    var All_Message = '*'
    var lastUid = -1



    function publish(message, data) {

    }


    function subscribe(message, fun) {
        if (!messages.hasOwnProperty(message)) {
            messages[message] = {}
        }
        // 同样的事件可能被多次订阅，需要用uid来区分每一次订阅
        const token = 'uid' + (++lastUid)
        messages[message][token] = fun
        return token
    }

    Pub.publish = function (message, data) {
        return publish(message, data)
    }

    Pub.subscribe = function (message, fun) {
        if (typeof fun !== 'function' || !message) {
            return
        }
        return subscribe(message, fun)
    }

    Pub.subscribeOnce = function (message, fun) {
        const token = Pub.subscribe(message, function () {
            Pub.unsubscribe(token)
            fun.apply(this, arguments)

        })
        return Pub
    }

    Pub.subscribeSync = function (message, fun) {

    }
})