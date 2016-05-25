var qs=require("querystring");
var fs=require("fs");

function Template( html , data , reg , debug){
  if( !data ){return html ;}
  var reg = reg ||  /\{([\w-]+)\}/g ;
    html=specialEscape(html);
  return html.replace( reg, function( m , name ){
    if( data[name] !== undefined ){
      var ret ;
      if(data[name] instanceof Function){
        ret =  data[name].call(data);
      }else{
        ret =  specialEscape(data[name]);
      }
      return reg.test( ret ) ?  
       Template( ret , data , reg ) : ret ;
    }else{
      if(debug){
        return name;
      }else{
        return "" ;
      }
    }
  });
}
function specialEscape(str){
  /*
  var o={
    "{quot}":"'"
  }
  for(var p in o){
    if(o.hasOwnProperty(p)){
      str = (str+"").replace(p,o[p]);
    }
  }
  */
  return str;
}

module.exports=function(content){
  var params=qs.parse(this.query.substring(1));
  var data={};
  var srcDir=(__dirname).split("/").slice(0,-2).join("/")
  var url=srcDir+"/"+params.file;
  var access=true
  try{
    fs.accessSync(url,fs.R_OK);
  }catch(e){
    access=false;
  }
  if(access){
    var dataLine=fs.readFileSync(url,'utf8').split("\n");
    dataLine.forEach(function(item,index){
      var idx=item.indexOf("=");
      if(idx>1){
        data[item.substring(0,idx)]=item.substring(idx+1)
      }
    });
  }
  if(params.reg){
    var reg=new RegExp(params.reg)
  }
  return   Template( content, data , reg , params.debug);
}
