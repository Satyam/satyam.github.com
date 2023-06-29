<?php
    require '/usr/home/satyam/scripts/Services_JSON.php';
	date_default_timezone_set('Europe/Madrid');

	function ajaxReq() {
		global $IdAlumno;


		$ajaxObj = trim($_REQUEST['ajaxObj']);
		if (strlen($ajaxObj)) {
			if (preg_match('/^[a-zA-Z]+$/',$ajaxObj)) {
				$ajaxAction = trim($_REQUEST['ajaxAction']);
				if (strlen($ajaxAction)) {
					if (preg_match('/^[a-zA-Z]+$/',$ajaxAction)) {
						$func = "ajax_${ajaxObj}_${ajaxAction}";
						if (function_exists($func)) {
							header('Cache-Control: no-cache, must-revalidate'); // HTTP/1.1
							header('Expires: Mon, 26 Jul 1997 05:00:00 GMT'); // Date in the past
							header('Content-type:  application/json; charset=iso-8859-15');
							set_error_handler('ajaxErrorHandler');
							$func($IdAlumno);
							ajaxReply();
						}
						ajaxReply(610,'function not defined: ' . $func);
					}
					ajaxReply(611,'action contains invalid chars: ' . $ajaxAction);
				}
				ajaxReply(612,'missing action');
			} 
			ajaxReply (613,'object name has invalid characters: ' . $ajaxObj);
		}
	}
	
	function ajaxReply($replyCode = 200,$replyText = 'Ok') {
		$s = '';
		$nSql = '';
		$json = new Services_JSON();
		for ($iArg = 2;$iArg < func_num_args();$iArg++) {
			$arg = func_get_arg($iArg);
			if (is_array($arg)) {
				$arg = $json->encode($arg);
				$s .= ',' . substr($arg,1,strlen($arg)-2);
			} elseif (is_string($arg)) {
				$result = ajaxSqlQuery($arg);
				$s .= ',"data' . $nSql . '":[';
				while ($row = mysql_fetch_assoc($result)) {
					if ($nextRow) {
						$s .= ',';
					} else {
						$nextRow = true;
					}
					$s .= $json->encode($row);
				}
				$s .= ']';
				mysql_free_result($result);
				$nSql++;
			} else {
				trigger_error("ajaxReply: optional argument at position $iArg value $arg is invalid, only arrays or SQL statements allowed",E_USER_ERROR);
			}
		}
	    $ajaxCallback = trim($_REQUEST['ajaxCallback']);
	    if (strlen($ajaxCallback)) {
	        header('Content-type: application/javascript; charset=utf-8');
	        echo $ajaxCallback, '({"replyCode":' , $replyCode , ',"replyText":"' , $replyText , '"' , $s, '});';
	    } else {
	        echo '{"replyCode":' , $replyCode , ',"replyText":"' , $replyText , '"' , $s, '}';
	    }
	    exit;
	}

	function ajaxSqlQuery($sql) {
		$result = mysql_query($sql);
		if ($result) return $result;
		ajaxReply(620,'Sql error: ' . mysql_error(),array('sql' => $sql));
	}
	
	function ajaxErrorHandler($errno, $errstr, $errfile, $errline)	{
		switch ($errno) {
		case E_USER_ERROR:
			echo '{"replyCode":601,"replyText":"User Error: ' , str_replace("\n",'\\n',addslashes($errstr)) . '","errno":', $errno;
			break;
		case E_USER_WARNING:
			echo '{"replyCode":602,"replyText":"User Warning: ' , str_replace("\n",'\\n',addslashes($errstr)) . '","errno":', $errno;
			break;
		case E_USER_NOTICE:
		case E_NOTICE:
			return false;
		default:
			echo '{"replyCode":600,"replyText":"' , str_replace("\n",'\\n',addslashes($errstr)) . '","errno":', $errno;
			break;
		}
		if ($errfile) {
			echo ',"errfile":"' , addslashes($errfile) ,'"';
		}
		if ($errline) {
			echo ',"errline":"', $errline ,'"';
		}
		echo '}';
		die();
	}

?>
