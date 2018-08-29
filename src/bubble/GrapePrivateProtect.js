var privateKey = function(mode){
	//var data;
	var array;
	var kv =[];
	var errno = 0;
	var maxLength = 30000;
	var hide = mode && mode != undefined ? mode : false;
	kv.push('phone');
	kv.push('telphone');
	kv.push('idcard');
	kv.push('bankcard');
	var _color = {
		phone:{
			color:'#e5a420',
			bgcolor:'#fdfe03',
		},
		telphone:{
			color:'#e5a4f0',
			bgcolor:'#fd0e03',
		},
		idcard:{
			color:'#a30b85',
			bgcolor:'#fdfe03',
		},
		bankcard:{
			color:'#0b35a3',
			bgcolor:'#fdfe03',
		},
	};
	var regx = /[1-9]\d{8,}(x|[1-9]|X)/g;
	this.hideMode =  function(){
		hide = true;
		return this;
	}
	this.checkMode = function(){
		hide = false;
		return this;
	}
	this.getErrorNo =function(){
		return errno;
	}
	var _scanText =function(data){//扫描内存块
		var line;
		var i = 0;
		errno = 0;
		array = [];
		do{
			line= regx.exec(data);
			if( line != null && line.length < 20 ){
				data = !hide ? setColor(line,data) : hideInfo(line,data);
				i++;
			}
			if( i > 1000 ){
				break;
			}
		}while( line != null );
		return rsData(data);
	}
	var splitString = function(data){
		var m = data.length % maxLength;
		var l = data.length/maxLength + (m > 0 ? 1 : 0);
		var a = [];
		for(var i =0; i < l; i++){
			var c = (data.length - (i * maxLength));
			a.push(data.substr( i * maxLength, c >= maxLength ? maxLength : c));
		}
		data = undefined;
		return a;
	}
	this.scanText = function(data){//maxLength
		var dataList = splitString(data);
		var rData = '';
		for(var i =0; i<dataList.length; i++){
			rData +=_scanText(dataList[i]);
		}
		return rData;
	}
	var uuid =function(){
		var r = "{pt:uuid}" + array.length + "{/pt}";
		return r;
	}
	var rsData = function(data){
		for(var i =0; i<array.length; i++){
			data = String(data).replace("{pt:uuid}" + i + "{/pt}",array[i]);
		}
		array = undefined;
		return data;
	}
	var type = -1;
	var filterPhone =  function(v){
		var rs = v;
		if( /^1[3|4|5|8][0-9]\d{4,8}$/.test(v) && v.length == 11 ){
			//rs = "疑似手机号:" + v;
			type = 1;
		}
		return rs;
	}
	var idCard =  function(v){
		var rs = v;
		if( IdentityCodeValid(v.toLocaleUpperCase()) ){
			//rs = "疑似身份证号:" + v;
			type = 2;
		}
		return rs;
	}
	var telphone = function(v){
		var value = v;
		var regTel1 = /^(([0\+]\d{2,3}-)?(0\d{2,3})-)(\d{7,8})(-(\d{3,}))?$/.test(value) && v.length == 12;//带区号的固定电话
		var regTel2 = /^(\d{7,8})(-(\d{3,}))?$/.test(value) && v.length == 7 ;//不带区号的固定电话
        if(regTel1 || regTel2){
			type = 4;
		}
		return v;
	}
	var bankCard =  function(v){
		var rs = v;
		if( luhmCheck(v) && v.length < 20 ){
			//rs = "疑似银行卡号:" + v;
			type = 3;
		}
		return rs;
	}
	var setColor = function (v,data) {
		var val = v[0];
		if (val) {
			type = -1;
			val = filterPhone(val);
			if( type == -1 ){
				val = telphone(val);
			}
			if( type == -1 ){
				val = idCard(val);
			}
			if( type == -1 ){
				val = bankCard(val);
			}
			if( type > 0){
				errno++;
			}
			switch(type){
				case 1:
				val = "疑似手机号:" + val;
				break;
				case 2:
				val = "疑似身份证号:" + val;
				break;
				case 3:
				val = "疑似银行卡号:" + val;
				break;
				case 4:
				val = "疑似固定电话:" + val;
				break;
			}
			var left = "";
			var right = "";
			if( type > 0 ){
				var m = _color[kv[type - 1]];
				left = "<span style='color:" + m.color + " ; background-color:" + m.bgcolor + ", font-weight: 900'>";
				right = "</span>";
			}
			data = data.substring(0, v.index) + left + uuid() + right + data.substring(v.index + v[0].length, data.length);//更新输入数据
			array.push(val);
		}
		return data;
	}
	var hideString =function(v){
		var left =  v.substring(0,3);
		var rigth= v.substring( v.length -4, v.length);
		var content = '';
		var l = v.length -  7;
		for(var i =0; i < l; i++){
			content += '*';
		}
		return left + content + rigth;
	}
	var hideInfo = function (v,data) {
		var val = v[0];
		if (val) {
			type = -1;
			val = filterPhone(val);
			if( type == -1 ){
				val = idCard(val);
			}

			if( type == -1 ){
				val = bankCard(val);
			}
			if( type > 0 ){
				val = hideString(val);
			}
			data = data.substring(0, v.index) + uuid() + data.substring(v.index + v[0].length, data.length);//更新输入数据
			array.push(val);
		}
		return data;
	}
	function IdentityCodeValid(code) { 
		var city={11:"北京",12:"天津",13:"河北",14:"山西",15:"内蒙古",21:"辽宁",22:"吉林",23:"黑龙江 ",31:"上海",32:"江苏",33:"浙江",34:"安徽",35:"福建",36:"江西",37:"山东",41:"河南",42:"湖北 ",43:"湖南",44:"广东",45:"广西",46:"海南",50:"重庆",51:"四川",52:"贵州",53:"云南",54:"西藏 ",61:"陕西",62:"甘肃",63:"青海",64:"宁夏",65:"新疆",71:"台湾",81:"香港",82:"澳门",91:"国外 "};
		var tip = "";
		var pass= true;
		
		if(!code || !/^\d{6}(18|19|20)?\d{2}(0[1-9]|1[12])(0[1-9]|[12]\d|3[01])\d{3}(\d|X)$/i.test(code)){
			tip = "身份证号格式错误";
			pass = false;
		}
		
	   else if(!city[code.substr(0,2)]){
			tip = "地址编码错误";
			pass = false;
		}
		else{
			//18位身份证需要验证最后一位校验位
			if(code.length == 18){
				code = code.split('');
				//∑(ai×Wi)(mod 11)
				//加权因子
				var factor = [ 7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2 ];
				//校验位
				var parity = [ 1, 0, 'X', 9, 8, 7, 6, 5, 4, 3, 2 ];
				var sum = 0;
				var ai = 0;
				var wi = 0;
				for (var i = 0; i < 17; i++)
				{
					ai = code[i];
					wi = factor[i];
					sum += ai * wi;
				}
				var last = parity[sum % 11];
				if(parity[sum % 11] != code[17]){
					tip = "校验位错误";
					pass =false;
				}
			}
		}
		return pass;
	}
	function luhmCheck(bankno){
		if (bankno.length < 16 || bankno.length > 19) {
			//$("#banknoInfo").html("银行卡号长度必须在16到19之间");
			return false;
		}
		var num = /^\d*$/;  //全数字
		if (!num.exec(bankno)) {
			//$("#banknoInfo").html("银行卡号必须全为数字");
			return false;
		}
		//开头6位
		var strBin="10,18,30,35,37,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,58,60,62,65,68,69,84,87,88,94,95,98,99";    
		if (strBin.indexOf(bankno.substring(0, 2))== -1) {
			//$("#banknoInfo").html("银行卡号开头6位不符合规范");
			return false;
		}
		var lastNum=bankno.substr(bankno.length-1,1);//取出最后一位（与luhm进行比较）
	
		var first15Num=bankno.substr(0,bankno.length-1);//前15或18位
		var newArr=new Array();
		for(var i=first15Num.length-1;i>-1;i--){    //前15或18位倒序存进数组
			newArr.push(first15Num.substr(i,1));
		}
		var arrJiShu=new Array();  //奇数位*2的积 <9
		var arrJiShu2=new Array(); //奇数位*2的积 >9
		
		var arrOuShu=new Array();  //偶数位数组
		for(var j=0;j<newArr.length;j++){
			if((j+1)%2==1){//奇数位
				if(parseInt(newArr[j])*2<9)
				arrJiShu.push(parseInt(newArr[j])*2);
				else
				arrJiShu2.push(parseInt(newArr[j])*2);
			}
			else //偶数位
			arrOuShu.push(newArr[j]);
		}
		
		var jishu_child1=new Array();//奇数位*2 >9 的分割之后的数组个位数
		var jishu_child2=new Array();//奇数位*2 >9 的分割之后的数组十位数
		for(var h=0;h<arrJiShu2.length;h++){
			jishu_child1.push(parseInt(arrJiShu2[h])%10);
			jishu_child2.push(parseInt(arrJiShu2[h])/10);
		}        
		
		var sumJiShu=0; //奇数位*2 < 9 的数组之和
		var sumOuShu=0; //偶数位数组之和
		var sumJiShuChild1=0; //奇数位*2 >9 的分割之后的数组个位数之和
		var sumJiShuChild2=0; //奇数位*2 >9 的分割之后的数组十位数之和
		var sumTotal=0;
		for(var m=0;m<arrJiShu.length;m++){
			sumJiShu=sumJiShu+parseInt(arrJiShu[m]);
		}
		
		for(var n=0;n<arrOuShu.length;n++){
			sumOuShu=sumOuShu+parseInt(arrOuShu[n]);
		}
		
		for(var p=0;p<jishu_child1.length;p++){
			sumJiShuChild1=sumJiShuChild1+parseInt(jishu_child1[p]);
			sumJiShuChild2=sumJiShuChild2+parseInt(jishu_child2[p]);
		}      
		//计算总和
		sumTotal=parseInt(sumJiShu)+parseInt(sumOuShu)+parseInt(sumJiShuChild1)+parseInt(sumJiShuChild2);
		
		//计算Luhm值
		var k= parseInt(sumTotal)%10==0?10:parseInt(sumTotal)%10;        
		var luhm= 10-k;
		
		if(lastNum==luhm){
			return true;
		}
		else{
			return false;
		}        
	}
}

export default privateKey;
