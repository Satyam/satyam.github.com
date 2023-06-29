<?php
	if ($_GET['data']) {
		$handle = fopen('php://input','r');
		$jsonInput = fgets($handle);
		require '/usr/home/satyam/scripts/Services_JSON.php';
		$json = new Services_JSON();
		$decoded = $json->decode($jsonInput);
		//$decoded = json_decode($jsonInput,true);
		//var_dump($decoded);
		echo $decoded[2]->title;
		fclose($handle);
	} else {
?>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">
<html>
	<head>
		<title>JSON over post</title> 
		<script type="text/javascript" src="http://yui.yahooapis.com/2.5.2/build/yahoo-dom-event/yahoo-dom-event.js" ></script>
		<script type="text/javascript" src="http://yui.yahooapis.com/2.5.2/build/connection/connection.js" ></script>
		<script type="text/javascript" src="http://yui.yahooapis.com/2.5.2/build/json/json.js" ></script>
	</head>
	<body>		<p align="right"><a href="../index.html">Back to the index of articles and examples</a></p>

	<h3>Sending raw JSON over POST</h3>
	<p>If everything goes fine, a transaction should have been initiated against this 
	very same PHP script and one of the elements of a JSON array should be returned
	and shown in an alert. </p>
	<p>The alert should read "<code>there should be children here</code>".</p>
	<p>You might get an alert telling you that function <code>json_decode</code> does not exist.  
	Run a <code>phpinfo()</code> on your server, your PHP interpreter might not have the JSON option compiled in.
	<p>My ISP does not have JSON compiled in its interpreter.  
	The running code in my server actually uses Services_JSON, an external package coded in PHP so that it can run in any version of PHP.
	</p>
	<p>Another gotcha is that you might not have the corresponding <a href="http://www.php.net/manual/en/wrappers.php.php">wrappers</a> enabled 
	so that you cannot open <code>php://input</code>.  The PHP Manual lists several ways to read the raw POST input.</p>
	<hr/>
	<h3>The code</h3>
	
	
	<pre>&lt;?php
	if ($_GET['data']) {
		$handle = fopen('php://input','r');
		$jsonInput = fgets($handle);
		$decoded = json_decode($jsonInput,true);
		echo $decoded[2]['title'];
		/* If you don't have native JSON support in PHP,
		   comment the two lines above and uncomment the lines below.
		   Adjust the path to the library as needed.
		require '/scripts/Services_JSON.php';
		$json = new Services_JSON();
		$decoded = $json->decode($jsonInput);
		echo $decoded[2]->title;
		*/
		fclose($handle);
	} else {
?&gt;
&lt;!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd"&gt;
&lt;html&gt;
	&lt;head&gt;
		&lt;title&gt;JSON over post&lt;/title&gt; 
		&lt;script type="text/javascript" src="http://yui.yahooapis.com/2.5.2/build/yahoo-dom-event/yahoo-dom-event.js" &gt;&lt;/script&gt;
		&lt;script type="text/javascript" src="http://yui.yahooapis.com/2.5.2/build/connection/connection.js" &gt;&lt;/script&gt;
		&lt;script type="text/javascript" src="http://yui.yahooapis.com/2.5.2/build/json/json.js" &gt;&lt;/script&gt;
	&lt;/head&gt;
	&lt;body&gt;
	&lt;dl&gt;
		&lt;dt&gt;Self-referencing&lt;/dt&gt;  
		&lt;dd&gt;see self-referencing.&lt;/dd&gt;
	&lt;/dl&gt;
	&lt;pre&gt;
	
	&lt;/pre&gt;
	&lt;/body&gt;
	&lt;script&gt;
		YAHOO.util.Connect.setDefaultPostHeader(false);
		YAHOO.util.Connect.initHeader("Content-Type","application/json; charset=utf-8");
		YAHOO.util.Connect.asyncRequest(
			'POST',
			'JSONsend.php?data=true',
			{
				success:function(o) {
					alert(o.responseText);
				},
				failure: function (o) {
					alert(o.statusText);
				}
			},
			YAHOO.lang.JSON.stringify([
				'Label 0',
				{type:'Text',label:'text label 1',title:'this is the tooltip for text label 1', editable:true},
				{type:'Text',label:'branch 1',title:'there should be children here', expanded:true, children:[
					'Label 1-0'
				]},
				{type:'Text',label:'text label 2',title:'this should be an href', href:'http://www.yahoo.com', target:'something'},
				{type:'HTML',html:'&lt;a href="developer.yahoo.com/yui"&gt;YUI&lt;/a&gt;',hasIcon:false},
				{type:'MenuNode',label:'branch 3',title:'this is a menu node', expanded:false, children:[
					'Label 3-0',
					'Label 3-1'
				]}

			])
		);
	&lt;/script&gt;
&lt;/html&gt;
&lt;?php } ?&gt;
	
	</pre>
	</body>
	<script>
		YAHOO.util.Connect.setDefaultPostHeader(false);
		YAHOO.util.Connect.initHeader("Content-Type","application/json; charset=utf-8");
		YAHOO.util.Connect.asyncRequest(
			'POST',
			'JSONsend.php?data=true',
			{
				success:function(o) {
					alert(o.responseText);
				},
				failure: function (o) {
					alert(o.statusText);
				}
			},
			YAHOO.lang.JSON.stringify([
				'Label 0',
				{type:'Text',label:'text label 1',title:'this is the tooltip for text label 1', editable:true},
				{type:'Text',label:'branch 1',title:'there should be children here', expanded:true, children:[
					'Label 1-0'
				]},
				{type:'Text',label:'text label 2',title:'this should be an href', href:'http://www.yahoo.com', target:'something'},
				{type:'HTML',html:'<a href="developer.yahoo.com/yui">YUI</a>',hasIcon:false},
				{type:'MenuNode',label:'branch 3',title:'this is a menu node', expanded:false, children:[
					'Label 3-0',
					'Label 3-1'
				]}

			])
		);
	</script>
</html>
<?php } ?>



				
	
		