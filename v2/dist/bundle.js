var t = {
    d: (e, r) => {
      for (var o in r)
        t.o(r, o) &&
          !t.o(e, o) &&
          Object.defineProperty(e, o, { enumerable: !0, get: r[o] });
    },
    o: (t, e) => Object.prototype.hasOwnProperty.call(t, e),
  },
  e = {};
function r(t, e, r) {
  return !!(t && e && r);
}
function o(t) {
  return Object.prototype.toString.call(t).slice(8, -1).toLowerCase();
}
t.d(e, { i: () => h, A: () => u });
class s {
  reportOptions = {
    url: "http://localhost:8090/reportData",
    method: "xhr",
    headers: {},
    payloadType: "json",
  };
  codeErrorOptions = { stkLimit: 3 };
  breadcrumbOptions = { enable: !0, maxBreadcrumbs: 100 };
  plugins = [];
  constructor(t) {
    const { reportOptions: e, plugins: r } = t;
    var s, n;
    e && (this.reportOptions = e),
      (n = "array"),
      (s = r) &&
        (o(s) === n ||
          void console.error(
            `whisper-monitor: plugins期望传入${n}类型，目前是${o(s)}类型`
          )) &&
        r?.length &&
        this.plugins.push(...r);
  }
}
const n = new (class {
  deps = new Map();
  on(t, e) {
    const r = this.deps.get(t);
    r ? this.deps.set(t, r.concat(e)) : this.deps.set(t, [e]);
  }
  emit(t, e) {
    const r = this.deps.get(t);
    t &&
      r &&
      r.forEach((t) => {
        try {
          t(e);
        } catch (t) {
          console.error(t);
        }
      });
  }
})();
class a {
  maxBreadcrumbs;
  stack = [];
  constructor(t) {
    (this.maxBreadcrumbs = t?.breadcrumbOptions?.maxBreadcrumbs || 10),
      (this.stack = []);
  }
  unshift(t) {
    return (
      this.stack.length >= this.maxBreadcrumbs && this.pop(),
      this.stack.unshift(t),
      this.stack
    );
  }
  pop() {
    return void 0 !== this.stack.pop();
  }
  clear() {
    this.stack = [];
  }
  getStack() {
    return this.stack.slice(0);
  }
}
var i, c;
!(function (t) {
  (t[(t.CUSTOMER = 0)] = "CUSTOMER"),
    (t[(t.LIFECYCLE = 1)] = "LIFECYCLE"),
    (t[(t.ERROR = 2)] = "ERROR"),
    (t[(t.PERFORMANCE = 3)] = "PERFORMANCE"),
    (t[(t.CLICK = 4)] = "CLICK"),
    (t[(t.CONSOLE = 5)] = "CONSOLE"),
    (t[(t.RECORD = 6)] = "RECORD"),
    (t[(t.XHR = 7)] = "XHR"),
    (t[(t.API = 8)] = "API"),
    (t[(t.PROMISE = 9)] = "PROMISE"),
    (t[(t.HASH = 10)] = "HASH"),
    (t[(t.HISTORY = 11)] = "HISTORY"),
    (t[(t.WHITE_SCREEN = 12)] = "WHITE_SCREEN");
})(i || (i = {})),
  (function (t) {
    (t[(t.RESOURCE_ERROR = 1)] = "RESOURCE_ERROR"),
      (t[(t.JS_ERROR = 2)] = "JS_ERROR"),
      (t[(t.API_ERROR = 3)] = "API_ERROR"),
      (t[(t.UNKNOWN_ERROR = 4)] = "UNKNOWN_ERROR");
  })(c || (c = {}));
class p {
  options;
  breadcrumb;
  constructor(t, e) {
    (this.options = t), (this.breadcrumb = e);
  }
  report(t, e) {
    const r = { ...this.options.reportOptions, ...e },
      o = this.attach(t);
    switch (r.method) {
      case "fetch":
        return this.reportWithFetch(o, r);
      case "beacon":
        return this.reportWithBeacon(o, r);
      default:
        return this.reportWithXHR(o, r).catch((t) =>
          console.error("XHR report failed:", t)
        );
    }
  }
  reportWithXHR(t, e) {
    return new Promise((r, o) => {
      const s = new XMLHttpRequest();
      s.open("POST", e.url, !0),
        e.headers &&
          Object.entries(e.headers).forEach(([t, e]) => {
            s.setRequestHeader(t, e);
          }),
        s.setRequestHeader(
          "Content-Type",
          "json" === e.payloadType
            ? "application/json"
            : "application/x-www-form-urlencoded"
        ),
        s.send(
          "json" === e.payloadType ? JSON.stringify(t) : this.toFormData(t)
        ),
        (s.onload = () => {
          s.status >= 200 && s.status < 300 ? r(s.response) : o(s.statusText);
        }),
        (s.onerror = () => {
          o(s.statusText);
        });
    });
  }
  async reportWithFetch(t, e) {
    try {
      return await fetch(e.url, {
        method: "POST",
        headers: {
          ...e.headers,
          "Content-Type":
            "json" === e.payloadType
              ? "application/json"
              : "application/x-www-form-urlencoded",
        },
        body: "json" === e.payloadType ? JSON.stringify(t) : this.toFormData(t),
      });
    } catch (t) {
      console.error("Fetch report failed:", t);
    }
  }
  reportWithBeacon(t, e) {
    return new Promise((r) => {
      const o =
        "json" === e.payloadType ? JSON.stringify(t) : this.toFormData(t);
      r(navigator.sendBeacon(e.url, o));
    });
  }
  toFormData(t) {
    return Object.entries(t)
      .map(
        ([t, e]) => encodeURIComponent(t) + "=" + encodeURIComponent(String(e))
      )
      .join("&");
  }
  attach(t) {
    return (
      this.options?.breadcrumbOptions?.enable ||
        [i.PERFORMANCE, i.RECORD, i.WHITE_SCREEN].includes(t.type) ||
        (t.breadcrumb = this.breadcrumb.getStack()),
      Object.assign(t, this.options?.reportOptions?.globalData || {}),
      (t.timestamp = Date.now()),
      t
    );
  }
  isSdkTransportUrl(t) {
    return t.includes(this.options?.reportOptions?.url || "");
  }
}
class h {
  breadcrumb;
  tracker;
  options;
  constructor(t) {
    (this.options = new s(t)),
      (this.breadcrumb = new a(this.options)),
      (this.tracker = new p(this.options, this.breadcrumb));
  }
  use(t) {
    for (const e of t) {
      const { name: t, observer: o, watcher: s } = e || {};
      if (!r(t, o, s)) {
        console.error(`The plugin name [${t}] is invalid, please check it.`);
        continue;
      }
      try {
        o.call(this, n.emit.bind(n, t));
      } catch (e) {
        console.error(`The plugin [${t}] encountered an error: ${e.message}`);
        continue;
      }
      const a = (...t) => {
        const e = s.apply(this, t);
        e &&
          this.tracker.report(e).then(() => {
            console.log("上报成功", this.breadcrumb);
          });
      };
      n.on(t, a);
    }
  }
}
const l = (t) => {
    const e = new h(t),
      { plugins: r = [] } = e.options;
    return e.use(r), e;
  },
  u = {
    install: (t, e) => {
      const r = l(e),
        o = t.config.errorHandler;
      (t.config.errorHandler = (t, e, r) => {
        n.emit("jsErrorPlugin", { type: i.ERROR, data: t }),
          o && o.call(void 0, t, e, r);
      }),
        t.version && t.version.startsWith("3")
          ? (t.config.globalProperties.$tracker = r.tracker)
          : (t.prototype.$tracker = r.tracker);
    },
    init: l,
  };
var R = e.i,
  d = e.A;
export { R as Core, d as default };
