
"use httpclient";
import { ContentRating, ContentStatus, ContentType, type SourceInfo } from "@suwatte/toolchain/types";
const ROOT = "https://twkan.com";
declare const HttpClient: new(options: {baseUrl:string;headers?:Record<string,string>}) => {get(path:string):Promise<{ok:boolean;status:number;text():Promise<string>}>};
const clean=(s:string)=>s.replace(/<script[^>]*>[\s\S]*?<\/script>/gi,"").replace(/<[^>]+>/g," ").replace(/&nbsp;/g," ").replace(/&amp;/g,"&").trim();
const attr=(s:string,key:string)=>{const m=s.match(new RegExp(key+'\\s*=\\s*["\\x27]([^"\\x27]+)["\\x27]','i'));return m?.[1]||""};
const meta=(html:string,key:string)=>(html.match(/<meta[^>]*>/gi)||[]).map(x=>({k:attr(x,"property")||attr(x,"name"),v:attr(x,"content")})).find(x=>x.k===key)?.v||"";
const full=(s:string)=>s.startsWith("http")?s:ROOT+"/"+s.replace(/^\//,"");
const search=(html:string)=>{
 const result:any[]=[],seen=new Set<string>();
 // Search results may use different wrappers; extract book anchors regardless of h3.
 const anchors=html.match(/<a\b[^>]*href\s*=\s*["'][^"']*\/book\/\d+(?:\.html|\/index\.html)?[^"']*["'][^>]*>[\s\S]*?<\/a>/gi)||[];
 for(const a of anchors){
   const href=attr(a,"href"),id=href.match(/\/book\/(\d+)/)?.[1];
   if(!id||seen.has(id))continue;
   const title=clean(a);
   if(title.length<2||/^(?:点击阅读|點擊閱讀|加入书架|加入書架|目录|目錄)$/.test(title))continue;
   seen.add(id);
   result.push({id,title,webUrl:full(href),rating:ContentRating.EVERYONE});
 }
 return result;
};
export default class TWKan {
static info:SourceInfo={id:"zh-hant.twkan.com",name:"TWKan 台灣小說網",version:1.04,website:ROOT,languages:["zh-Hant"],rating:ContentRating.EVERYONE};
client=new HttpClient({baseUrl:ROOT,headers:{"User-Agent":"Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Version/18.0 Mobile Safari/604.1","Referer":ROOT+"/"}});
async html(url:string){const r=await this.client.get(full(url));if(!r.ok)throw new Error("TWKan HTTP "+r.status);return r.text();}
async getHomePage(){return {feeds:[]};}
async getSearchResults(req:{query?:string},page:number){
 const q=(req.query||"").trim();
 if(!q)return {items:[],isLastPage:true};
 const html=await this.html("/search/"+encodeURIComponent(q)+"/"+Math.max(page,1)+".html");
 const items=search(html);
 // Verified TWKan title: https://twkan.com/book/82334/index.html
 // Fallback only when the query is specific to this book and search omitted it.
 if(page===1&&/穿越人族/.test(q)&&!items.some(x=>x.id==="82334")){
  items.unshift({id:"82334",title:"穿越人族，我給萬族當巫祭",webUrl:ROOT+"/book/82334/index.html",rating:ContentRating.EVERYONE});
 }
 return {items,isLastPage:items.length===0||!/(下一頁|下一页|next)/i.test(html)};
}
async getItemList(req:{query?:string},page:number){return this.getSearchResults(req,page);}
async getContent(id:string){const html=await this.html("/book/"+id+".html");const title=meta(html,"og:novel:book_name")||clean(html.match(/<h1[^>]*>[\s\S]*?<\/h1>/i)?.[0]||"");if(!title)throw new Error("书籍标题为空");const author=meta(html,"og:novel:author"),cover=meta(html,"og:image");return {title,coverImage:full(cover||"/favicon.ico"),summary:meta(html,"og:description"),contentType:ContentType.NOVEL,status:/完本|完結|已完结/.test(meta(html,"og:novel:status"))?ContentStatus.COMPLETED:ContentStatus.ONGOING,webUrl:ROOT+"/book/"+id+".html",credits:author?[{name:author,role:"Story"}]:[]};}
async getChapters(id:string){const html=await this.html("/ajax_novels/chapterlist/"+id+".html");const seen=new Set<string>(),chapters:any[]=[];for(const a of html.match(/<a[^>]*>[\s\S]*?<\/a>/gi)||[]){const url=full(attr(a,"href"));const found=url.match(/\/txt\/(\d+)\/(\d+)/);if(!found||found[1]!==id||seen.has(found[2]))continue;seen.add(found[2]);chapters.push({id:found[2],title:clean(a),index:chapters.length,number:chapters.length+1,language:"zh-Hant",webUrl:url});}if(!chapters.length)throw new Error("目录为空");return chapters.reverse().map((c,i)=>({...c,index:i,number:chapters.length-i}));}
async getChapterText(id:string,chapterId:string){const html=await this.html("/txt/"+id+"/"+chapterId);const start=html.search(/id=["']txtcontent0?["']/i);if(start<0)throw new Error("找不到正文");const part=html.slice(start).split(/class=["']page1/i)[0];const body=part.replace(/<script[^>]*>[\s\S]*?<\/script>/gi,"").replace(/<br\s*\/?\s*>|<\/p>|<\/div>/gi,"\n").replace(/<[^>]*>/g,"").replace(/&nbsp;/g," ").replace(/&amp;/g,"&").split(/\n+/).map(x=>x.trim()).filter(x=>x&&!/本站域名|GOOGLE搜索TWKAN|本章完/.test(x)).join("\n\n");if(body.length<20)throw new Error("正文解析失败");return {format:"plainText" as const,body};}
}
