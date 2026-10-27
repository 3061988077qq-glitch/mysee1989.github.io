const fs = require('fs');
const vm = require('vm');
const assert = require('assert/strict');
const base = require('path').join(__dirname, '..') + require('path').sep;
const init = fs.readFileSync(base + 'theme-init.js', 'utf8');
const app = fs.readFileSync(base + 'app.js', 'utf8');
function boot(systemDark, storage = {}) {
  const listeners = {}; const systemListeners = [];
  const summary = { attrs: {}, setAttribute(k,v){this.attrs[k]=v;}, focus(){} };
  const picker = { open:false, querySelector(){return summary;}, contains(){return false;} };
  const buttons = ['system','light','dark'].map(value=>({dataset:{themeChoice:value},handlers:{},attrs:{},addEventListener(k,f){this.handlers[k]=f;},setAttribute(k,v){this.attrs[k]=v;}}));
  const root = {dataset:{}};
  const media = {matches:systemDark,addEventListener(k,f){systemListeners.push(f);}};
  const localStorage={getItem(k){return storage[k]??null;},setItem(k,v){storage[k]=v;}};
  const location={href:'http://localhost/v2/research.html',search:'',pathname:'/v2/research.html'};
  const document={documentElement:root,body:{dataset:{titleZh:'研究方向',titleEn:'Research'}},querySelector(s){return s==='.theme-picker'?picker:null;},querySelectorAll(s){return s==='[data-theme-choice]'?buttons:[];},addEventListener(){}};
  const window={addEventListener(k,f){listeners[k]=f;}};
  const ctx=vm.createContext({document,window,localStorage,location,URL,URLSearchParams,history:{replaceState(){}},matchMedia:()=>media});
  vm.runInContext(init,ctx);vm.runInContext(app,ctx);
  return {root,storage,buttons,summary,document,changeSystem(value){media.matches=value;systemListeners.forEach(f=>f({matches:value}));},click(choice){buttons.find(b=>b.dataset.themeChoice===choice).handlers.click();},storageEvent(value){listeners.storage({key:'aimg-theme',newValue:value});}};
}
let a=boot(false);assert.equal(a.root.dataset.theme,'light');assert.equal(a.root.dataset.themePreference,'system');a.changeSystem(true);assert.equal(a.root.dataset.theme,'dark');a.changeSystem(false);assert.equal(a.root.dataset.theme,'light');
a.click('dark');assert.equal(a.storage['aimg-theme'],'dark');a.changeSystem(false);assert.equal(a.root.dataset.theme,'dark');
let b=boot(false,a.storage);assert.equal(b.root.dataset.theme,'dark');b.click('light');b.changeSystem(true);assert.equal(b.root.dataset.theme,'light');
b.click('system');assert.equal(b.root.dataset.theme,'dark');b.changeSystem(false);assert.equal(b.root.dataset.theme,'light');b.storageEvent('dark');assert.equal(b.root.dataset.theme,'dark');b.storageEvent(null);assert.equal(b.root.dataset.themePreference,'system');
let c=boot(true,{'aimg-theme':'invalid'});assert.equal(c.root.dataset.themePreference,'system');assert.equal(c.root.dataset.theme,'dark');
console.log('PASS: system default, live system changes, manual overrides, reload/cross-page persistence, cross-tab update, invalid storage fallback.');

// The selected language wins over stale links and survives the next page load.
let english = boot(false, {'aimg-v2-lang':'en'});
assert.equal(english.root.lang, 'en');
assert.equal(english.summary.attrs['aria-label'], 'Appearance: System');
let chinese = boot(false, {'aimg-v2-lang':'zh'});
assert.equal(chinese.root.lang, 'zh-CN');
assert.equal(chinese.summary.attrs['aria-label'], '显示模式：跟随系统');
console.log('PASS: stored English/Chinese and localized appearance labels.');
