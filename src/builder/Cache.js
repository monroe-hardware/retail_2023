const EventEmitter = require("events");

/**
    Simple cache handler that uses a queue-like mechanism to keep most
    recently referenced items in the cache and dereferences items once
    they "age" out of the queue.
*/
exports.Cache = class Cache extends EventEmitter {
    /**
        Create cache of given size. The size is immutable. 
        @param {number} size 
    */
    constructor(size) {
        super();

        this.Entries = new Map();
        this.Index = [];

        Object.defineProperty(this, 'CACHE_SIZE', {
            writable: false,
            configurable: false,
            value: size
        });
    }

    /**
        Retrieve an item from cache.
        @param {string} id - The id of the stored item.
        @return {any} Cached item or null if not found.
    */
    get(id) {
        if(this.Entries.has(id)) {
            var i = this.Index.findIndex(e => e==id);
            if(i >= 0) this.Index.splice(i, 1);
            this.Index.push(id);
            return this.Entries.get(id);
        } else return null; 
    }

    /**
        Add an item to cache.
        @param {string} id - The id of the item to be stored.
        @param {any} entry - The item to be cached.
        @return {any} The entry is returned so this call may be chained.
    */
    set(id, entry) {
        this.Entries.set(id, entry);
        this.Index.push(id);
        while(this.Index.length > this.CACHE_SIZE) {
            var id = this.Index.shift();
            this.emit('deref', id, this.Entries.get(id));
            this.Entries.delete(id);
        }
        return entry;
    }

    /**
        Flush an item from cache.
        @param {string} id - The id of the item to remove.
        @return {any} The item removed from cache or null if not present.
    */
    flush(id) {
        var item = this.Entries.get(id);
        if(item) {
            var i = this.Index.findIndex(e => e==id);
            if(i >= 0) this.Index.splice(i, 1);
            this.Entries.delete(id);
        }
        return item;
    }
}
