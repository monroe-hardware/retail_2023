
const fs = require('fs'),
    path = require('path');


/*
    Content is a fancy template. It may start with a header that contains JSON data.
    May add Markdown support later.
*/


function loadData(filepath, meta) {
    const data = {
        frontmatter: {},
        tmpl: '',
        meta: meta
    };

    let raw = fs.readFileSync(filepath, 'utf8');

    let fm = raw.match(/^---\{?([\s\S]*?)\}?---$/m);
    if(fm) try {
        let jdat = fm[0].replace(/^---\{?/,'{').replace(/\}?---$/,'}');
        //jdat = jdat.replace(/(['"])?([a-z0-9_$]+)(['"])?:/gi, '"$2": ');
        data.frontmatter = JSON.parse(jdat);
        data.tmpl = raw.replace(fm[0], '');
    } catch(e) { console.log(`Bad frontmatter in '${filepath}'.`); console.log(e); }
    else data.tmpl = raw;

    return data;
}


module.exports = class Content {
    constructor(filepath, meta) {
        const basename = path.basename(filepath);
        const id = basename.replace(new RegExp(path.extname(basename)+"$"), '');

        this.filepath = filepath;
        this.meta = meta;

        this.data = loadData(filepath, meta);
        this.data.id = id;
    }

    async process(cfg) {
        const data = Object.assign(
            { id: this.data.id, page:{} },
            cfg,
            {
                page: Object.assign({}, cfg.page, this.data.frontmatter),
                file: this.data.meta
            }
        );
        
        /* replace variables */
        var partial = this.data.tmpl.replace(/\{\{([a-z0-9_\.]*)\}\}/gi, (w,g) => (g.replace(/^\s+|\s+$/g,'').split('.').reduce((o,i)=>o[i],data)||w));

        data.content = partial;
        return data;
    }
}
