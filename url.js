// alert('url=' + location.href);
var url = location.href;

$(document).ready(function(){
	if (/^(http:\/\/)?ars.sng.local\/Rel_FileTestRequest.htm/.test(url)) {
		setTimeout(function(){
			if (localStorage.getItem('m_wap') != 1) {
				return;
			}
			var arsObj = localStorage.getItem('arsObj') ? JSON.parse(localStorage.getItem('arsObj')) : {
				'selProduct' : '114',
				'selModule'	:	'327',
				'selModuleHtml' : '<option value="327"> [CDN内包][imgcache] </option>',
				'selReasonType'	: '48',
				'idTestcaseUpdate' : '0',
				'isTestcaseUpdate'	: '0',
				'svnproject'	:	'isd/isd_qzonetouch_rep/wap_qzonefront_proj',
				'svnprojectHtml'	:	'<option value="isd/isd_qzonetouch_rep/wap_qzonefront_proj">isd/isd_qzonetouch_rep/wap_qzonefront_proj</option>',
				'txtContent'	:	'114:327:|isd/isd_qzonetouch_rep/wap_qzonefront_proj|isd/isd_qzonetouch_rep|'
			};
			$("#selProduct").val(arsObj.selProduct);
			$("#hdProductId").val(arsObj.selProduct);
			$("#selModule").html(arsObj.selModuleHtml).val(arsObj.selModule);
			$("#hdModuleId").val(arsObj.selModule);
			$("#selReasonType").val(arsObj.selReasonType);
			$("#idTestcaseUpdate").val(arsObj.idTestcaseUpdate);
			
			d = new Date();
			s = d.getUTCFullYear() + '' + (d.getMonth() + 1 < 10 ? '0' + parseInt(d.getMonth() + 1) : d.getMonth() + 1) + '' + d.getDate();

			$("#isTestcaseUpdate").val(arsObj.isTestcaseUpdate);
			$("#txtVersion").val(s);
			$("#codeOrigin").val(1);
			$("#compileOriginTR").hide();
			$("#svnproject").html(arsObj.svnprojectHtml).val(arsObj.svnproject);
			var contentParent = $("#txtContent").parent();
			$("#txtContent").remove();
			$("#svnOriginTR").show();
			contentParent.prepend('<textarea id="txtContent" style=" width: 630px;height:120px; "></textarea>');
			$("#txtContent").val(arsObj.txtContent);
			$("#selNextOperator_TextBoxValue").val($("#selCcs_TextBoxValue").val());
			$("#txtContentDescription").val('功能优化');
			$("#lblFileCount").html('1');
			$("#txtContent").focus();
		}, 1000);
		
		$("#btnPreRelease").click(function(){
			if (localStorage.getItem('arsObj')) {
				return;
			}
			localStorage.setItem('arsObj', JSON.stringify({
				'selProduct' : $("#selProduct").val(),
				'selModule'	:	$("#selModule").val(),
				'selModuleHtml' : $("#selModule").html(),
				'selReasonType'	: $("#selReasonType").val(),
				'idTestcaseUpdate' : $("#idTestcaseUpdate").val(),
				'isTestcaseUpdate'	: $("#isTestcaseUpdate").val(),
				'svnproject'	:	$("#svnproject").val(),
				'svnprojectHtml'	:	$("#svnproject").html(),
				'txtContent'	:	$("#txtContent").val()
			}));
			localStorage.setItem('m_wap', 1);
			// console.log('ars=' + localStorage.getItem('arsObj'));
		});
		
	}
});