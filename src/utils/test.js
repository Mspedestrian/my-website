
/**
 * Copyright (c) 2010,2011,2012,2013,2014 Morgan Roderick http://roderick.dk
 * License: MIT - http://mrgnrdrck.mit-license.org
 *
 * https://github.com/mroderick/PubSubJS
 */

(function (root, factory) {
    'use strict';

    var PubSub = {};
    root.PubSub = PubSub;

    var define = root.define;

    factory(PubSub);

    // AMD support
    if (typeof define === 'function' && define.amd) {
        define(function () { return PubSub; });

        // CommonJS and Node.js module support
    } else if (typeof exports === 'object') {
        if (module !== undefined && module.exports) {
            exports = module.exports = PubSub; // Node.js specific `module.exports`
        }
        exports.PubSub = PubSub; // CommonJS module 1.1.1 spec
        module.exports = exports = PubSub; // CommonJS
    }


}((typeof window === 'object' && window) || this, function (PubSub) {
    'use strict';

    var messages = {},
        lastUid = -1,
        ALL_SUBSCRIBING_MSG = '*';

    // todo 这个函数是用来干嘛的
    function hasKeys(obj) {
        var key;

        for (key in obj) {
            if (obj.hasOwnProperty(key)) {
                return true;
            }
        }
        return false;
    }

    /**
     * Returns a function that throws the passed exception, for use as argument for setTimeout
     * @alias throwException
     * @function
     * @param { Object } ex An Error object
     */
    function throwException(ex) {
        return function reThrowException() {
            throw ex;
        };
    }

    function callSubscriberWithDelayedExceptions(subscriber, message, data) {
        try {
            subscriber(message, data);
        } catch (ex) {
            setTimeout(throwException(ex), 0);
        }
    }

    function callSubscriberWithImmediateExceptions(subscriber, message, data) {
        subscriber(message, data);
    }
    // 依次执行 
    // deliverMessage('click.click1.click2','click.click1.click2',data..)
    // deliverMessage('click.click1.click2','click.click1',data..)
    // deliverMessage('click.click1.click2','click',data..)
    // deliverMessage('click.click1.click2','*',data..)

    // 大部分情况会执行
    // deliverMessage('click','click',data..)
    // deliverMessage('click','*',data..)
    function deliverMessage(originalMessage, matchedMessage, data, immediateExceptions) {
        // originalMessage：‘click.click1.click2’
        // matchedMessage：‘click.click1’
        // click
        // *

        // 执行函数按match 从messages里取函数
        // 也就是说publish ‘click.click1.click2’
        // subsrcibe click.click1.click2  click.click1  click  *
        // 都会收到通知，执行对应的回调函数
        var subscribers = messages[matchedMessage],
            callSubscriber = immediateExceptions ? callSubscriberWithImmediateExceptions : callSubscriberWithDelayedExceptions,
            s;

        if (!messages.hasOwnProperty(matchedMessage)) {
            return;
        }
        // for in 和 hasOwnProperty 区别
        // for in用来遍历对象  可以列举出可枚举的属性，包括原型链上
        // hasOwnProperty   为true的属性，为他本身，不在原型链上的可枚举属性，标识对象自身是否拥有这个属性
        for (s in subscribers) {
            if (subscribers.hasOwnProperty(s)) {
                // 分别执行messages 中subsrcibe click.click1.click2  click.click1  click  * 的token函数依次执行
                // 同时将publis的 message原值‘click.click1.click2’传给回调函数
                callSubscriber(subscribers[s], originalMessage, data);
            }
        }
    }

    function createDeliveryFunction(message, data, immediateExceptions) {
        // todo 不知道为什么要用闭包，好像并没有涉及到需要外部的变量
        // 返回的这个函数里面需要保存参数值
        return function deliverNamespaced() {

            // message 形如 ‘click.click1.click2’
            // publish 了一个形如 ‘click.click1.click2’的事件
            //调用如pub.publish('click.click1.click2',data)
            var topic = String(message),
                position = topic.lastIndexOf('.');

            // 依次执行 
            // deliverMessage('click.click1.click2','click.click1.click2',data..)
            // deliverMessage('click.click1.click2','click.click1',data..)
            // deliverMessage('click.click1.click2','click',data..)
            // deliverMessage('click.click1.click2','*',data..)

            // 大部分情况会执行
            // deliverMessage('click','click',data..)
            // deliverMessage('click','*',data..)
            // deliver the message as it is now
            deliverMessage(message, message, data, immediateExceptions);

            // trim the hierarchy and deliver message to each level
            while (position !== -1) {
                topic = topic.substr(0, position);
                position = topic.lastIndexOf('.');
                deliverMessage(message, topic, data, immediateExceptions);
            }

            deliverMessage(message, ALL_SUBSCRIBING_MSG, data, immediateExceptions);
        };
    }

    function hasDirectSubscribersFor(message) {
        var topic = String(message),
            found = Boolean(messages.hasOwnProperty(topic) && hasKeys(messages[topic]));

        return found;
    }
    // 返回对应的事件publish后有没有被订阅
    function messageHasSubscribers(message) {
        var topic = String(message),
            found = hasDirectSubscribersFor(topic) || hasDirectSubscribersFor(ALL_SUBSCRIBING_MSG),
            position = topic.lastIndexOf('.');

        while (!found && position !== -1) {
            topic = topic.substr(0, position);
            position = topic.lastIndexOf('.');
            found = hasDirectSubscribersFor(topic);
        }

        return found;
    }

    function publish(message, data, sync, immediateExceptions) {
        // 默认的publish  sync 是否同步 为false
        message = (typeof message === 'symbol') ? message.toString() : message;

        // 使用闭包获取执行subscribe的函数，接收publish时的message data和一个函数
        var deliver = createDeliveryFunction(message, data, immediateExceptions),
            hasSubscribers = messageHasSubscribers(message);

        // hasSubscribers 如果这个事件没有被订阅，就什么都不做
        if (!hasSubscribers) {
            return false;
        }

        if (sync === true) {
            deliver();
        } else {
            // 默认异步执行
            setTimeout(deliver, 0);
        }
        return true;
    }

    /**
     * Publishes the message, passing the data to it's subscribers
     * @function
     * @alias publish
     * @param { String } message The message to publish
     * @param {} data The data to pass to subscribers
     * @return { Boolean }
     */
    PubSub.publish = function (message, data) {
        // todo 这里感觉 immediateExceptions  不知道做什么用
        return publish(message, data, false, PubSub.immediateExceptions);
    };

    /**
     * Publishes the message synchronously, passing the data to it's subscribers
     * @function
     * @alias publishSync
     * @param { String } message The message to publish
     * @param {} data The data to pass to subscribers
     * @return { Boolean }
     */
    PubSub.publishSync = function (message, data) {
        return publish(message, data, true, PubSub.immediateExceptions);
    };

    /**
     * Subscribes the passed function to the passed message. Every returned token is unique and should be stored if you need to unsubscribe
     * @function
     * @alias subscribe
     * @param { String } message The message to subscribe to
     * @param { Function } func The function to call when a new message is published
     * @return { String }
     */
    PubSub.subscribe = function (message, func) {
        if (typeof func !== 'function') {
            return false;
        }
        // 对message值进行处理
        message = (typeof message === 'symbol') ? message.toString() : message;

        // message is not registered yet
        if (!messages.hasOwnProperty(message)) {
            messages[message] = {};
        }

        // forcing token as String, to allow for future expansions without breaking usage
        // and allow for easy use as key names for the 'messages' object
        var token = 'uid_' + String(++lastUid);
        messages[message][token] = func;

        // return token for unsubscribing
        return token;
    };

    PubSub.subscribeAll = function (func) {
        // 这个时候 事件类型为 *要看下*在publish中如何处理
        // publish 的时候，所有的事件都会执行subscribe *的函数
        return PubSub.subscribe(ALL_SUBSCRIBING_MSG, func);
    };

    /**
     * Subscribes the passed function to the passed message once
     * @function
     * @alias subscribeOnce
     * @param { String } message The message to subscribe to
     * @param { Function } func The function to call when a new message is published
     * @return { PubSub }
     */
    PubSub.subscribeOnce = function (message, func) {
        var token = PubSub.subscribe(message, function () {
            // before func apply, unsubscribe message

            // todo 没看懂为啥取消订阅要放在前面
            PubSub.unsubscribe(token);
            func.apply(this, arguments);
        });
        return PubSub;
    };

    /**
     * Clears all subscriptions
     * @function
     * @public
     * @alias clearAllSubscriptions
     */
    PubSub.clearAllSubscriptions = function clearAllSubscriptions() {
        messages = {};
    };

    /**
     * Clear subscriptions by the topic
     * @function
     * @public
     * @alias clearAllSubscriptions
     * @return { int }
     */
    PubSub.clearSubscriptions = function clearSubscriptions(topic) {
        var m;
        for (m in messages) {
            // m.indexOf(topic) === 0)  字符串以topic开头
            if (messages.hasOwnProperty(m) && m.indexOf(topic) === 0) {
                delete messages[m];
            }
        }
    };

    /** 
       Count subscriptions by the topic
     * @function
     * @public
     * @alias countSubscriptions
     * @return { Array }
    */
    PubSub.countSubscriptions = function countSubscriptions(topic) {
        var m;
        var count = 0;
        for (m in messages) {
            // click.click1.click2  [uid_1][uid_2]为1个
            if (messages.hasOwnProperty(m) && m.indexOf(topic) === 0) {
                count++;
            }
        }
        return count;
    };


    /** 
       Gets subscriptions by the topic
     * @function
     * @public
     * @alias getSubscriptions
    */
    PubSub.getSubscriptions = function getSubscriptions(topic) {
        var m;
        var list = [];
        for (m in messages) {
            if (messages.hasOwnProperty(m) && m.indexOf(topic) === 0) {
                list.push(m);
            }
        }
        return list;
    };

    /**
     * Removes subscriptions
     *
     * - When passed a token, removes a specific subscription.
     *
	 * - When passed a function, removes all subscriptions for that function
     *
	 * - When passed a topic, removes all subscriptions for that topic (hierarchy)
     * @function
     * @public
     * @alias subscribeOnce
     * @param { String | Function } value A token, function or topic to unsubscribe from
     * @example // Unsubscribing with a token
     * var token = PubSub.subscribe('mytopic', myFunc);
     * PubSub.unsubscribe(token);
     * @example // Unsubscribing with a function
     * PubSub.unsubscribe(myFunc);
     * @example // Unsubscribing from a topic
     * PubSub.unsubscribe('mytopic');
     */
    PubSub.unsubscribe = function (value) {
        // 判断topic 是否存在 messages中
        // todo 不知道为啥不直接用messages[topic]来判断
        var descendantTopicExists = function (topic) {
            var m;
            for (m in messages) {
                if (messages.hasOwnProperty(m) && m.indexOf(topic) === 0) {
                    // a descendant of the topic exists:
                    return true;
                }
            }

            return false;
        },
            // todo messages.hasOwnProperty(value) || descendantTopicExists(value)  这里的判断有点迷
            //判断传入三种类型
            isTopic = typeof value === 'string' && (messages.hasOwnProperty(value) || descendantTopicExists(value)),
            isToken = !isTopic && typeof value === 'string',
            isFunction = typeof value === 'function',
            result = false,
            m, message, t;

        if (isTopic) {
            PubSub.clearSubscriptions(value);
            return;
        }

        for (m in messages) {
            if (messages.hasOwnProperty(m)) {
                message = messages[m];

                if (isToken && message[value]) {
                    delete message[value];
                    result = value;
                    // tokens are unique, so we can just stop here
                    break;
                }
                // 目前还没有见过会取消订阅一个函数的需求  delete 删除不了原型链中的变量
                if (isFunction) {
                    for (t in message) {
                        if (message.hasOwnProperty(t) && message[t] === value) {
                            delete message[t];
                            result = true;
                        }
                    }
                }
            }
        }

        return result;
    };
}));

