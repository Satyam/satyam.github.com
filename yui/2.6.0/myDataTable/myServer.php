<?php
	include 'ajaxServices.php';
	
	ajaxReq();

	ajaxReply(505,'nothing to do');
	
	function randomText($len) {
		return substr("rcousxqxgexvihcf wnmnxiwtrbkgyhyavtstjqzonvwvda daxenuspmdobskxqmpbbvlywpopvppzwrcousxqxgexvihcfwn mnxiwtrbkgyhyavtstjqz onvwvdadaxenuspmdob skxqmpbbvlywpopv ppzwrcousxqxgexvihcfwnmnxiwtrb kgyhyavtstjqzonvw vdadaxenuspmd obskxqmpbbvlywpopvppzw", rand(1,strlen(TEXT)), rand(1,$len));
	}
	
	function randomDate() {
		return date('Y-m-d H:i:s' , time() - rand(0,PHP_INT_MAX));
	}
		
	
	function ajax_TEST_select() {
	
		$data = array();
		for ($i = 0;$i < 22;$i++) {
			$data[] = array(
				'id' => $i,
				'name' => randomText(10),
				'date' => randomDate(),
				'price' => rand(10,100000) / 100,
				'number' => rand(1,99),
				'address' => randomText(20)
			);
		}
		
				
		ajaxReply(201,'Data Follows',array('data' => $data));
	}
	
	function ajax_TEST_insert() {
		ajaxReply(201,'Data Follows',array('data' => array(
			'id'=> rand(23,100),
			'date'=> date('Y-m-d H:i:s'),
			'number'=> rand(1000,9999)
		)));
	}
	function ajax_TEST_delete() {
		$id = $_REQUEST['id'];
		if ($id & 1) {
			ajaxReply(200,'Ok');
		} else {
			ajaxReply(500,'Cannot delete even records');
		}
	}
	function ajax_TEST_cellEdit() {
		if ( $_REQUEST['column'] == 'date') {
			ajaxReply(201,'Data Follows', array(data => array( $_REQUEST['column'] => strtoupper($_REQUEST['newValue']))));
		} 
		ajaxReply(201,'Data Follows', array(data => array( $_REQUEST['column'] => strtoupper($_REQUEST['newValue']),'date' => date('Y-m-d H:i:s'))));
	}
		
			
?>