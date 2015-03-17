//得到url地址中code参数
var projectCode = "";
//url参数获取
var getUrlParam = function(name){
	var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)"); //构造一个含有目标参数的正则表达式对象
	var r = window.location.search.substr(1).match(reg);  //匹配目标参数
	if (r!=null) return unescape(r[2]); return null; //返回参数值
}
//上传edl文件
function uploadEdl(selectFile) {
	var filename = selectFile.value;
	var mime = filename.toLowerCase().substr(filename.lastIndexOf("."));
    if (mime != ".edl") {
        alert("请选择edl格式的文件上传");
        selectFile.outerHTML = selectFile.outerHTML;
        return false;
    }
	var form = document.getElementById("edl-form");
	var edlfile = document.getElementById("edlfile");
	var files = edlfile.files;
	var formData = new FormData();
	for(var i=0; i<files.length; i++){
		var file = files[i];
		formData.append("files", file, file.name);
	}
	formData.append("ProjectCode", projectCode);
	var xhr = new XMLHttpRequest();
	xhr.open("POST", "post_upload_edl", true);
	xhr.onload = function(){
		if(xhr.status === 200){
			var rs = JSON.parse(xhr.responseText);
			if(rs.FeedbackCode == 0) {
				var shotList = JSON.parse(rs.Data);
				if (shotList == null || shotList.length == 0){
					alert("EDL文件未能获取镜头数据!");
					return;
				}
				createShotPage(shotList);
			}else{
				alert(rs.FeedbackText);
			}
		}else{
			alert("upload error");
		}
	}
	xhr.send(formData);
}
//自定义镜头组列表加载
var folders_ajax = function(pc){
	$.post("/post_shot_folder",
		JSON.stringify({ProjectCode: pc}),
        function(data) {
            if(data.FeedbackCode == 0) {
				var rs = JSON.parse(data.Data);
				d = new dTree('d');
				//遍历查询,格式为d.add(id,父id,'素材名称','','','1');
				for(var i=0; i<rs.length; i++){
					d.add(rs[i]["FolderCode"],rs[i]["FatherCode"],rs[i]["FolderName"],'','','1');
				}
				$(".tree").html(d + '');
				$(".dtree").children("div.dTreeNode").addClass("grouptit");
			}
        },
        "json"
    );
}
//查询"Load EDL"的镜头
var shots_ajax = function(pc, callback){
	$.post("/post_shot_list",
		JSON.stringify({ProjectCode: pc}),
        function(data) {
            callback(data);
        },
        "json"
    );
}
//查询镜头基本信息
var shot_info_ajax = function(sc, callback){
	$.post("/post_shot_que",
		JSON.stringify({ShotCode: sc}),
        function(data) {
            callback(data);
        },
        "json"
    );
}
//修改镜头名称
var shot_updshotname_ajax = function(sc, sn, callback){
	$.post("/post_shot_updshotname",
		JSON.stringify({ShotCode: sc, ShotName: sn}),
        function(data) {
            callback(data);
        },
        "json"
    );
}
//镜头制作需求list
var shot_demandlist_ajax = function(sc, callback){
	$.post("/post_shot_demand_que",
		JSON.stringify({ShotCode: sc}),
        function(data) {
            callback(data);
        },
        "json"
    );
}
//镜头制作需求新增
var shot_demandadd_ajax = function(pc, sc, dd, p, callback){
	$.post("/post_shot_demand_add",
		JSON.stringify({ProjectCode: pc, ShotCode: sc, DemandDetail: dd, Picture: p}),
        function(data) {
            callback(data);
        },
        "json"
    );
}
//镜头制作需求更新
var shot_demandupd_ajax = function(dc, dd, p, callback){
	$.post("/post_shot_demand_upd",
		JSON.stringify({DemandCode: dc, DemandDetail: dd, Picture: p}),
        function(data) {
            callback(data);
        },
        "json"
    );
}
//创建页面镜头视图列表
var createShotPage = function(rs){
	var html = "";
	for(i=0;i<rs.length;i++){
		var code = rs[i]["ShotCode"];//镜头id
		var names = rs[i]["ShotName"];//镜头名
		var pic = rs[i]["Picture"];//图片
		var liInfo = "";
		if(rs[i]["SourcePath"] == "Y") {
			liInfo += "<li>Source</li>";
		}
		if(rs[i]["DpxPath"] == "Y") {
			liInfo += "<li>DPX</li>";
		}
		if(rs[i]["JpgPath"] == "Y") {
			liInfo += "<li>JPG</li>";
		}
		if(rs[i]["MovPath"] == "Y") {
			liInfo += "<li>Mov</li>";
		}
		html += "<span class='videoimg'><div class='view'></div><input type='hidden' id='code' value='"+code+"'><input class='check' name='checks' type='checkbox' value='"+code+"'><div class='state'></div><input class='play' type='button' value='回放'><h2 class='names'>"+names+"</h2><div class='downdiv'>                            <input class='downl' type='button' value='下载'><span class='disnone'><ul class='"+code+"'>"+liInfo+"</ul></span></div><div class='files'><img src='"+pic+"'></div></span>";
	}
	$(".videodiv").html(html);
}

// JavaScript Document
$(function(){
	projectCode = getUrlParam("code");
	if (projectCode !== ""){
		$(".editoralpage").attr("href","editoral.html?code=" + projectCode);
		folders_ajax(projectCode);
	}else{
		return;
	}

	shots_ajax(projectCode, function(data){
		if(data.FeedbackCode == 0) {
			var rs = JSON.parse(data.Data);
			if(rs == null || rs.length === 0){
				// 没有数据,"Load EDL"可以点击
				$(".updedl").css("display","block");
				return;
			}
			// 有数据,"Load EDL"禁止点击,创建页面镜头视图列表
			$(".updedl").css("display","none");
			createShotPage(rs);
		}
	});

	$(".dtree").children("div.dTreeNode").css("background","#e3e3e3");

	//初始化右侧窗口 隐藏
	$(".metadata").children(".basicinfo").css("display","block");
	$(".videodiv").on("click",".view",function(){
		var rightabs = $(".rightdivabs").css("display");
		if(rightabs=="block"){
			$(".rightdivabs").css("display","none");
		}else{
			$(".rightdivabs").css("display","block");
			//获得当前镜头的id
			var thiscode = $(this).siblings("#code").attr("value");
			$(".float").find(".sourceid").val(thiscode);
			//获取img的url
			$(".roughimg").children("img").attr("src",$(this).siblings(".files").children("img").attr("src"));
			//TODO 根据当前选中镜头的id thiscode，查询该镜头id的信息:镜头名 尺寸 帧速率 始码 止码 描述
			shot_info_ajax(thiscode, function(data){
				if(data.FeedbackCode == 0) {
					var rs = JSON.parse(data.Data);
					var names = rs["ShotName"];//镜头名
					var size = rs["Width"]+" x "+rs["Height"];//尺寸
					var speed = rs["ShotFps"];//帧速率
					var start = rs["StartTime"];//始码
					var end = rs["EndTime"];//止码
					//处理长字符串
					if(names.length>12)
						names = names.substring(0,11)+"...";
					if(size.length>12)
						size = size.substring(0,11);
					if(speed.length>12)
						speed = speed.substring(0,11);
					if(start.length>12)
						start = start.substring(0,11);
					if(end.length>12)
						end = end.substring(0,11);
					//初始化右侧窗口 隐藏
					$(".metadata").children("div").css("display","none");
					$(".metadata").find(".basicinfo").css("display","block");
					$(".withtit").children("li").css("background","#FFF");
					$(".withtit").find(".basic").css("background","#ccc");
					$(".tab1").find(".names").html(names);//镜头名
					$(".tab1").find(".size").html(size);//尺寸
					$(".tab1").find(".speed").html(speed);//帧速率
					$(".tab1").find(".start").html(start);//始码
					$(".tab1").find(".end").html(end);//止码
					basic(thiscode);
				}
			});
		}
	});
	/*var displays = function(){
		//循环显示镜头
		var html = "";
		for(i=0;i<20;i++){
			var code = i;//镜头id
			var names = i;//镜头名
			html += "<span class='videoimg'><div class='view'></div><input type='hidden' id='code' value='"+code+"'><input class='check' name='checks' type='checkbox' value='"+code+"'><div class='state'></div><input class='play' type='button' value='回放'><h2 class='names'>"+names+1+"</h2><div class='downdiv'>                            <input class='downl' type='button' value='下载'><span class='disnone'><ul>                                    <li>Source</li><li>DPX</li><li>JPG</li><li>Mov</li></ul></span></div><div class='files'><img src=''></div></span>";
		}
		$(".videodiv").append(html);
	};
	displays();*/
	$(".dels").click(function(){
		//获得当前选中复选框的id
		var str = "";
		$('input[class="check"]:checked').each(function() {
			str += $(this).val() + ",";
		});
		if (str == "") {
			alert("请选中镜头复选框再删除镜头");
			return;
		}
		//添加镜头id到该镜头组id，镜头组id是str，镜头id是thiscode
		alert("要删除的镜头code：" + str);
	});
	//便捷的修改素材名
	$(".bgimgdiv").on("click",".names",function(){
		//判断该h2标签是否已经包含input标签 若有 说明正在编辑
		if($(this).children("input").length>0){
			return;
		}
		//获得当前镜头的镜头名
		var names = $(this).html().trim();

		$(this).html("<input type='text' class='updlab'>");
		$(this).children("input").focus();//获得焦点
		$(this).children("input").val(names);
	})
	$(".bgimgdiv").on("blur",".updlab",function(){//释放焦点时 修改数据库中该code的镜头名
		//获得当前镜头的code
		var code = $(this).parent().siblings("#code").val();
		//获得修改后文本框的文字
		var names = $(this).val();
		var temp = $(this);
		//TODO 往数据库中根据该code修改该镜头的镜头名称
		shot_updshotname_ajax(code, names, function(data){
			if(data.FeedbackCode == 0) {
				var rs = JSON.parse(data.Data);
				//修改页面显示内容
				temp.parent().html(rs["ShotName"]);
			}
		});
	});
	$(".withtit li").click(function(){
		//获得点击元素class
		var names = $(this).attr("class");
		//初始化点击按钮
		$(".withtit").children("li").css("background","none");
		$(this).css("background","#ccc");
		//初始化右侧窗口 隐藏
		$(".metadata").children("div").css("display","none");
		$("."+names+"info").show();
		//获取当前选中镜头的id
		var code = $(".float").find(".sourceid").val();
		if(names == "basic"){
			basic(code);
		}else if(names == "need"){
			need(code);
		}else if(names == "material"){
			material(code);
		}else if(names == "note"){
			node(code);
		}else if(names == "edition"){
			edition(code);
		}
	});
	var basic = function(code){//详细信息
		$(".tab2").find(".names").html("a");//镜头名
		$(".tab2").find(".size").html("a");//尺寸
		$(".tab2").find(".speed").html("a");//帧速率
		$(".tab2").find(".start").html("a");//始码
		$(".tab2").find(".end").html("a");//止码
		$(".tab2").find(".bewrite").html("a");//描述
	}
	var need = function(code){//制作需求
		//TODO 根据镜头id查询制作需求list,并遍历
		shot_demandlist_ajax(code, function(data){
			if (data.FeedbackCode == 0) {
				 var rs = JSON.parse(data.Data);
				if(rs == null || rs.length == 0){
					//alert("No data");
					return;
				}
				// TODO 数据存在创建页面信息
				var html = "";//要拼接的html
				for(i = 0; i < rs.length; i++){
					var code = (i*1)+1;
					var imgurl = "";
					var mation = "ab";
					var length = (i*1)+1;
					html += '<div class="piece"><input type="hidden" class="makecode" value="'+code+'"><div class="number">'+length+'<div class="del">X</div></div><div class="news"><div class="imgradius"><img src="'+imgurl+'" width="60" height="60"></div><div class="stage">'+mation+'</div><input type="button" value="编辑" class="edit"></div>                        </div>';
				}
				$(".needinfo .make").html(html);
			}
		});
	}
	var material = function(code){
		//TODO 根据该镜头code查询该镜头的参考素材列表
		var html = "<tr><td width='25%'>素材名</td><td width='25%'>素材格式</td><td colspan='2'>描述</td></tr>";
		for(i=0;i<2;i++){
			var code = i+1;//素材code
			var names = "素材名"+i;//素材名
			var layout = "素材格式"+i;//素材格式
			var depict = "描述"+i;//描述
			html += "<tr><td>"+names+"</td><td>"+layout+"</td><td>"+depict+"</td><td class='symbol2'  width='5%'>+<div class='bolpoab2'><ul name='"+code+"'><li class='download'>下载</li><li class='delete'>删除</li></ul></div></td></tr>";
		}
		$(".edittable").html(html);
	}
	//编辑详细信息
	$("#submits").click(function(){
		//获得该按钮上的文字 判断该编辑还是直接保存
		var butval = $(this).val();
		if(butval == "编辑"){
			//获得当前镜头ID和字段内容 并变成可编辑的文本框
			var names = $(".basicinfo").find(".names").html().trim();//镜头名
			var size = $(".basicinfo").find(".size").html().trim();//尺寸
			var speed = $(".basicinfo").find(".speed").html().trim();//帧速率
			var start = $(".basicinfo").find(".start").html().trim();//始码
			var end = $(".basicinfo").find(".end").html().trim();//止码
			var bewrite = $(".basicinfo").find(".bewrite").html().trim();//描述
			$(".basicinfo").find(".names").html("<input type='text' id='namesinp' value='"+names+"'>");
			$(".basicinfo").find(".size").html("<input type='text' id='sizeinp' value='"+size+"'>");
			$(".basicinfo").find(".speed").html("<input type='text' id='speedinp' value='"+speed+"'>");
			$(".basicinfo").find(".start").html("<input type='text' id='startinp' value='"+start+"'>");
			$(".basicinfo").find(".end").html("<input type='text' id='endinp' value='"+end+"'>");
			$(".basicinfo").find(".bewrite").html("<input type='text' id='bewriteinp' value='"+bewrite+"'>");
			$(this).val("保存");
		}else{//保存
			var names = $(".basicinfo").find("#namesinp").val();//镜头名
			var size = $(".basicinfo").find("#sizeinp").val();//尺寸
			var speed = $(".basicinfo").find("#speedinp").val();//帧速率
			var start = $(".basicinfo").find("#startinp").val();//始码
			var end = $(".basicinfo").find("#endinp").val();//止码
			var bewrite = $(".basicinfo").find("#bewriteinp").val();//描述
			//后台保存方法

			//文本框改成字符串
			$(".basicinfo").find(".names").html(names);
			$(".basicinfo").find(".size").html(size);
			$(".basicinfo").find(".speed").html(speed);
			$(".basicinfo").find(".start").html(start);
			$(".basicinfo").find(".end").html(end);
			$(".basicinfo").find(".bewrite").html(bewrite);
			$(this).val("编辑");
		}
	});
	//详细信息页面 编辑制作需求
	$(".make").on("click",".edit",function(){
		var value = $(this).val();
		if(value=="编辑"){
			if($(".needinfo").find("#demand").length>0){//判断是否已经打开判断的窗口
				alert("您正在编辑");
				$("#demand").focus();
				return;
			}
			var makeval = $(this).siblings(".stage").html().trim();
			$(this).siblings(".stage").html("<textarea name='' cols='' rows='' id='demand'>"+makeval+"</textarea>");
			$(this).val("保存");
		}else{
			var makeval = $(this).siblings(".stage").children("#demand").val();//当前制作需求输入框
			var makecode = $(this).parent().siblings(".makecode").val();//当前制作需求id
			//TODO 当前需求id makecode 当前需求字符串 makeval 更新到数据库
			var p = "";//图片
			shot_demandupd_ajax(makecode, makeval, p, function(data){
				if (data.FeedbackCode == 0) {
					alert("更新成功");
					$(this).val("编辑");
				}else{
					alert("保存失败,请稍后重试!");
				}
			});
			$(this).siblings(".stage").html(makeval);
		}
	});
//详细信息页面 编辑制作需求
	$(".make").on("click",".edit",function(){
		var value = $(this).val();
		if(value=="编辑"){
			if($(".needinfo").find("#demand").length>0){//判断是否已经打开判断的窗口
				alert("您正在编辑");
				$("#demand").focus();
				return;
			}
			var makeval = $(this).siblings(".stage").html().trim();
			$(this).siblings(".stage").html("<textarea name='' cols='' rows='' id='demand'>"+makeval+"</textarea>");
			$(this).val("保存");
		}else{
			var makeval = $(this).siblings(".stage").children("#demand").val();//当前制作需求输入框
			var makecode = $(this).parent().siblings(".makecode").val();//当前制作需求id
			//TODO 当前需求id makecode 当前需求字符串 makeval 更新到数据库
			$(this).siblings(".stage").html(makeval);
			$(this).val("编辑");
		}
	});
	//详细信息页面 编辑制作需求
	$(".make").on("click",".addedit",function(){
		var makeval = $(this).siblings(".stage").children("#demand").val();//当前制作需求输入框
		if(makeval==""){
			alert("请输入需求");
			$("#demand").focus();
			return;
		}
		//TODO 当前镜头id code src地址 srcstr 和 需求字符串 makeval 添加到数据库
		var code = $(".sourceid").val();
		var srcstr = $(this).siblings(".imgradius").children("img").attr("src");
		$(this).siblings(".stage").html(makeval);
		$(this).attr("class","edit");
		$(this).val("编辑");
		$(this).siblings(".imgradius").children("#file_input").remove();
	});
	//制作需求的删除
	$(".make").on("click",".del",function(){
		//获得该制作需求code
		var code =$(this).parent().siblings(".makecode").val();
		//TODO 从数据库中删除该code

		$(this).parents(".piece").remove();
	});
	$(".addmark").click(function(){
		if($(".needinfo").find("#demand").length>0){//判断是否已经打开判断的窗口
			alert("您正在添加");
			$("#demand").focus();
			return;
		}
		var length = ($(".make").children(".piece").length*1)+1;
		var html = '<div class="piece"><input type="hidden" class="makecode" value="1"><div class="number">'+length+'<div class="del">X</div></div><div class="news"><div class="imgradius"><img src="#" width="60" height="60"><input type="file" id="file_input"/></div><div class="stage"><textarea id="demand" rows="" cols="" name=""></textarea></div><input type="button" value="保存" class="addedit"></div></div>';
		$(".needinfo .make").append(html);
		var input = document.getElementById("file_input");
		input.addEventListener('change', readFile, false);
		$("#demand").focus();
	});
	//参考素材的下载
	$(".edittable").on("click",".download",function(){
		//获取当前参考素材的code
		var code = $(this).parent().attr("name");
		//TODO 数据库根据该code获取相应的下载地址

	});
	//参考素材的删除
	$(".edittable").on("click",".delete",function(){
		//获取当前参考素材的code
		var code = $(this).parent().attr("name");
		//TODO 数据库删除该code

		//删除该页面对应的数据
		$(this).parents("tr").remove();
	});
	//note消息读取
	var node = function(code){
		//TODO 根据该镜头code 获得该code的消息列表
		var html = "";
		for(i=0;i<10;i++){
			var content =""+i;
			html += "<div class='newinfo'>"+content+"</div>";
		}
		$(".noteinfo").find(".chat").html(html);
		var input = document.getElementById("fileimg");
		input.addEventListener('change', readImg, false);
		$(".noteinfo").find(".chat").html(html);
	}
	//发送消息
	$(".but").click(function(){
		//获得图片消息
		var imgsrc = $("#imgs").attr("src");
		//获得文本框消息
		var txt = $(".textarea").val();
		//获得镜头code
		var code = $(".sourceid").val();
		if(imgsrc=="#"&&txt==""){
			alert("请输入消息内容或图片");
			return;
		}
		var srchtml = "<img src='"+imgsrc+"'>";
		var html = '<div class="newinfo">'+srchtml+''+txt+'</div>';
		//TODO 把消息对应该镜头code记录到数据库 消息为news
		var news = srchtml+txt;

		//添加到页面
		$(".chat").append(html);
		//初始化文本框
		$(".textarea").val("");
		$("#imgs").attr("src","#");
		//初始化下拉
		$(".chat").scrollTop(200000);
	});
	//根据镜头code 查询版本列表信息
	var edition = function(code){
		//TODO 根据code 获得版本信息
		var html = "";
		for(i=0;i<3;i++){
			var code = i;//当前版本code
			var num = "版本号";//版本号
			var img = "缩略图";//缩略图url
			html += '<div class="tag" name="'+code+'"><div class="num">'+num+'</div><div class="frame"><div class="imgs"><img src="'+img+'" alt="缩略图"></div><div class="menu_tab">+<div class="bolpoabs"><ul><li class="viewhue">查看小样</li><li class="down">下载成品</li></ul></div></div></div></div>';
		}
		$(".editioninfo").html(html);
	}
	//查看版本小样
	$(".editioninfo").on("click",".viewhue",function(){
		//获得该版本的code
		var code = $(this).parents(".tag").attr("name");
		alert(code);
	});
	//下载版本成品
	$(".editioninfo").on("click",".down",function(){
		//获得该版本的code
		var code = $(this).parents(".tag").attr("name");
		alert(code);
	});
	$(".updfile").click(function(){
		var height = $(window).height();
		var width = $(window).width();
		$(".outer").css({"height":height+"px","width":width+"px"});
		$(".formdiv1").css({"left":(width/2)-200+"px","top":(height/2)-200+"px"});
		$(".outer").show(500);
		$(".formdiv1").show(500);
	});
	$(".outer").click(function(){
		$(".outer").hide(500);
		$(".formdiv1").find(":text").val("");
		$(".formdiv1").hide(500);
		$(".formdiv2").find(":text").val("");
		$(".formdiv2").hide(500);
		$(".formdiv3").find(":text").val("");
		$(".formdiv3").find("textarea").val("");
		$(".formdiv3").hide(500);
		$(".formdiv4").find(":text").val("");
		$(".formdiv4").find("textarea").val("");
		$(".formdiv4").hide(500);
		$(".formdiv5").find(":text").val("");
		$(".formdiv5").find("textarea").val("");
		$(".formdiv5").hide(500);
		$(".formdiv5").find(".modify").val("编辑");
		$(".formdiv6").hide(500);
		$(".formdiv7").hide(500);
		$(".formdiv1").find(".size").val("1*2");
		$(".formdiv1").find("#sizew").attr("disabled","true");
		$(".formdiv1").find("#sizeh").attr("disabled","true");
	});//外包商弹出层
	$(".venul").on("click",".addvgr",function(){
		if($(this).children("div").css("display")=="block"){
			$(".venul").find(".addvgr div").css("display","none");
			$(this).children("div").css("display","none");
		}
		else{
			$(".venul").find(".addvgr div").css("display","none");
			$(this).children("div").css("display","inline-block");
		}

	});
	//添加外包商
	$("#addven").click(function(){
		var height = $(window).height();
		var width = $(window).width();
		$(".outer").css({
			"height": height + "px",
			"width": width + "px"
		});
		$(".formdiv3").css({
			"left": (width / 2) - 200 + "px",
			"top": (height / 2) - 100 + "px"
		});
		$(".outer").show(500);
		$(".formdiv3").show(500);
	});
	//点击添加列表的确定按钮
	$(".addvenbut").click(function(){
		//获得列表名称
		var names = $("#packinginp").val();
		//获得外包商描述
		var descrinp = $(".formdiv3").find("#descrinp").val();
		if(names==""){
			alert("请输入外包商");
			return;
		}
		if(descrinp==""||descrinp==null){
			alert("请输入描述");
			return;
		}
		//TODO 添加外包商 names 跟描述 descrinp 到数据库 并返回刚添加外包商之后的id

		var code = "5";

		var html = '<li class="li1" name="'+code+'"><a href="javascript:void(0);">'+names+'</a><span class="addvgr">+<div><ul><li class="addlens">添加镜头</li><li class="factory">指定外包商</li><li class="with">描述</li><li class="power">设置权限</li><li class="delfactory">删除</li></ul></div></span></li>';
		$(".venul").append(html);
		$(".outer").click();
	});
	$(".venul").on("click",".addlens",function(){
		var code = $(this).parents(".li1").attr("name");//获得当前组的code
		//获得当前选中镜头的id
		var str = "";
		$('input[class="check"]:checked').each(function() {
			str += $(this).val() + ",";
		});
		if(str==""){
			alert("请选中镜头后再添加");
			return;
		}
		alert("分组id为"+code+"镜头id为"+str);
	});
	//指定外包商窗口
	$(".venul").on("click",".factory",function(){
		//获得当前分组的code
		var code = $(this).parents(".li1").attr("name");
		//code赋给隐藏文本框
		$(".formdiv4").find(".code").val(code);
		//显示窗口
		var height = $(window).height();
		var width = $(window).width();
		$(".outer").css({
			"height": height + "px",
			"width": width + "px"
		});
		$(".formdiv4").css({
			"left": (width / 2) - 200 + "px",
			"top": (height / 2) - 100 + "px"
		});
		$(".outer").show(500);
		$(".formdiv4").show(500);
	});
	$(".addoutsidebut").click(function(){
		//获得当前列表code
		var listcode = $(".formdiv4").find(".code").val();
		//获得当前选中外包公司code
		var company = $(".formdiv4").find("#factorysel").val();

		//TODO 设置列表code 外包公司code
		alert("列表code为"+listcode+"外包公司code为"+company);

		$(".outer").click();
	});
	$(".venul").on("click",".with",function(){
		//获得列表code
		var listcode = $(this).parents(".li1").attr("name");
		//TODO 根据列表code 获得描述信息
		var description = "这是描述内容";
		//赋值列表code给描述页面
		$(".formdiv5").find(".code").val(listcode);
		//赋值描述信息给描述页面
		$(".formdiv5").find(".descrtr").html(description);
		//显示窗口
		var height = $(window).height();
		var width = $(window).width();
		$(".outer").css({
			"height": height + "px",
			"width": width + "px"
		});
		$(".formdiv5").css({
			"left": (width / 2) - 200 + "px",
			"top": (height / 2) - 100 + "px"
		});
		$(".outer").show(500);
		$(".formdiv5").show(500);
	});
	$(".modify").click(function(){
		var txt = $(this).val();
		if(txt=="编辑"){//编辑 把html变为编辑框
			//获取描述的文字
			var html = $(".descrtr").html().trim();
			$(".descrtr").html("<input type='text' value="+html+">");
			$(this).val("保存");
		}else{
			//获得该列表值的code
			var listcode = $(".formdiv5").find(".code").val();
			var value = $(".descrtr").find("input").val();
			//TODO 保存列表值code和描述

			$(".descrtr").html(value);
			$(this).val("编辑");
		}
	});
	$(".upddescbut").click(function(){
		if($(".formdiv5").find(".descrtr input").val()!=null){
			alert("请保存后再确定");
			$(".formdiv5").find(".descrtr input").focus();
			return;
		}
		$(".outer").click();
	});
	//权限设置
	$(".venul").on("click",".power",function(){
		//取该列表id设置到页面
		var code = $(this).parents(".li1").attr("name");
		$(".formdiv6").find(".code").val(code);
		//TODO 根据该列表id 获取该id权限标识
		var flog = '1,0,1,0,1';
		var result = flog.split(",");
		for(var i = 0;i<result.length;i++){
			if(result[i]=="0"){
				$(".formdiv6").find("input[type='checkbox']").eq(i).attr("checked",false);
			}else{
				$(".formdiv6").find("input[type='checkbox']").eq(i).attr("checked",true);
			}
		}


		//显示窗口
		var height = $(window).height();
		var width = $(window).width();
		$(".outer").css({
			"height": height + "px",
			"width": width + "px"
		});
		$(".formdiv6").css({
			"left": (width / 2) - 200 + "px",
			"top": (height / 2) - 100 + "px"
		});
		$(".outer").show(500);
		$(".formdiv6").show(500);
	});
	$(".yesbut").click(function(){
		//获取当前列表code
		var code = $(".formdiv6").find(".code").val();
		//获得当前选中权限的标识
		var str = "";
		$('input[name="droit"]').each(function() {
			if($(this).prop("checked")){
				str += "1,";
			}else{
				str += "0,";
			}
		});
		/*var length = $(".formdiv6").find("input[type='checkbox']").length;
		alert(length);
		for(var i = 0;i < length;i++){
			alert($(".formdiv6").find("input[type='checkbox']").eq(i).attr("checked"));
		}*/
		//TODO 当前列表code 和 当前列表权限的标识 str 存到数据库
		alert("当前列表code为"+code+",当前权限列表的标识为"+str);
		$(".outer").click();
	});
	$(".venul").on("click",".delfactory",function(){
		//获得当前列表code，
		var code = $(this).parents(".li1").attr("name");

		//TODO 从数据库中删除该列表code

		//从页面中删除
		$(this).parents(".li1").remove();
	});
	$(".venul").on("click",".li1 a",function(){
		//获得当前code
		var code = $(this).parent().attr("name");
		//TODO 根据该code 从后台取 并便利到页面
		var html = "";//用于拼接字符串
		for(i=0;i<10;i++){
			var code = i+"";//镜头code
			var names = i+"";//镜头名称
			html += "<span class='videoimg'><div class='view'></div><input type='hidden' id='code' value='"+code+"'><input class='check' name='checks' type='checkbox' value='"+code+"'><div class='state'></div><input class='play' type='button' value='回放'><h2 class='names'>"+names+1+"</h2><div class='downdiv'>                            <input class='downl' type='button' value='下载'><span class='disnone'><ul>                                    <li>Source</li><li>DPX</li><li>JPG</li><li>Mov</li></ul></span></div><div class='files'><img src=''></div></span>";
		}
		$(".bgimgdiv .videodiv").html(html);
	});
	//添加镜头
	$(".subut").click(function(){
		var names = $(".formdiv1").find(".name").val();//获取镜头名
		if(names==""){
			alert("请输入镜头名");
			$(".formdiv1").find(".name").focus();
			return;
		}
		//获取尺寸 宽 sizew 高 sizeh
		var sizes = $(".formdiv1").find(".size").val();
		var sizew = "";
		var sizeh = "";
		if(sizes=="自定义"){
			sizew = $(".formdiv1").find("#sizew").val();
			sizeh = $(".formdiv1").find("#sizeh").val();
			if(sizew==""){
				alert("请输入宽");
				$(".formdiv1").find("#sizew").focus();
				return;
			}
			if(sizeh==""){
				alert("请输入高");
				$(".formdiv1").find("#sizeh").focus();
				return;
			}
			//匹配正则表达式
			var reg = /^[1-9]\d*$/;
			if(!reg.test(sizew)){
				alert("请输入数字");
				$(".formdiv1").find("#sizew").focus();
				return;
			}
			if(!reg.test(sizeh)){
				alert("请输入数字");
				$(".formdiv1").find("#sizeh").focus();
				return;
			}
		}else{
			//获取*号的下标
			var index = sizes.indexOf("*");
			sizew = sizes.substr(0,index);
			sizeh = sizes.substr(index+1,sizes.length);
		}
		//获取帧速率
		var speed = $(".formdiv1").find(".speed").val();
		if(speed==""){
			alert("请输入帧速率");
			$(".formdiv1").find(".speed").focus();
			return;
		}
		//获取类型
		var types = $(".formdiv1").find(".types").val();
		//获取描述
		var description = $(".formdiv1").find(".description").val();
		//TODO 添加到数据库
		var html = "镜头名:"+names+",尺寸w:"+sizew+",尺寸h:"+sizeh+",帧速率:"+speed+",类型:"+types+",描述:"+description;
		alert(html);

		$(".outer").click();
	});
	$(".addmaterial").click(function(){
		//显示窗口
		var height = $(window).height();
		var width = $(window).width();
		$(".outer").css({
			"height": height + "px",
			"width": width + "px"
		});
		$(".formdiv7").css({
			"left": (width / 2) - 200 + "px",
			"top": (height / 2) - 100 + "px"
		});
		$(".outer").show(500);
		$(".formdiv7").show(500);
	});
	$(".upfile").click(function(){
		//得到描述内容
		var explain = $(".explain").val();
		$("#f7").submit();
		$(".outer").click();

		//TODO 根据该镜头code查询该镜头的参考素材列表
		var html = "<tr><td width='25%'>素材名</td><td width='25%'>素材格式</td><td colspan='2'>描述</td></tr>";
		for(i=0;i<2;i++){
			var code = i+1;//素材code
			var names = "素材名"+i;//素材名
			var layout = "素材格式"+i;//素材格式
			var depict = "描述"+i;//描述
			html += "<tr><td>"+names+"</td><td>"+layout+"</td><td>"+depict+"</td><td class='symbol2'  width='5%'>+<div class='bolpoab2'><ul name='"+code+"'><li class='download'>下载</li><li class='delete'>删除</li></ul></div></td></tr>";
		}
		$(".edittable").html(html);
	});
	//下载
	$(".videodiv").on("click",".disnone ul li",function(){
		var source = $(this).html().trim();
		var code = $(this).parent().attr("class");
	});
});
function selectChange(val){
	if(val!="自定义"){
		$("#sizew").attr("disabled","true");
		$("#sizeh").attr("disabled","true");
	}else{
		$("#sizew").val("");
		$("#sizeh").val("");
		$("#sizew").removeAttr('disabled');
		$("#sizeh").removeAttr('disabled');
	}
}
function upload(fnUpload){
	var filename = fnUpload.value;
	var mime = filename.toLowerCase().substr(filename.lastIndexOf("."));
	if(mime!=".edl")
	{
		alert("请选择edl格式的文件上传");
		fnUpload.outerHTML=fnUpload.outerHTML;
		return false;
	}else{
		$("#f1").submit();
	}
}
function readFile() {
	var file = this.files[0];
	//判断类型如果不是图片就返回 去掉就可以上传任意文件
	if (!/image\/\w+/.test(file.type)) {
		alert("请确保文件为图像类型");
		return false;
	}
	var reader = new FileReader();
	reader.readAsDataURL(file);
	reader.onload = function(e) {
		$("#file_input").siblings("img").attr("src",this.result);
	}
}
function readImg() {
	var file = this.files[0];
	//判断类型如果不是图片就返回 去掉就可以上传任意文件
	if (!/image\/\w+/.test(file.type)) {
		alert("请确保文件为图像类型");
		return false;
	}
	var reader = new FileReader();
	reader.readAsDataURL(file);
	reader.onload = function(e) {
		$(".sendout").children("#imgs").attr("src",this.result);
	}
}
