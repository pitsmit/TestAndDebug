if (typeof global.File === 'undefined') {
    global.File = class File {
        constructor(bits, name, options = {}) {
            this.bits = bits;
            this.name = name;
            this.options = options;
        }
    };
}

if (typeof global.Blob === 'undefined') {
    global.Blob = class Blob {
        constructor(bits, options = {}) {
            this.bits = bits;
            this.options = options;
        }
    };
}