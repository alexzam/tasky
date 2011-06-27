<?php

class PlayControllerTest extends ControllerTestCase 
{
    private static $uid;
    private static $root;

    public static function setUpBeforeClass(){
        $user = User::createTmp();
        $sess = new Zend_Session_Namespace('auth');
        $sess->user = $user->toArray();
        self::$uid = $user->id;
        self::$root = $user->roottask_id;
    }

    public function testInsertTask()
    {
        $this->request->setMethod('POST')->setPost(array(
		'data[0][act]'		=> 'i',
		'data[0][task][id]'	=> '-1',
		'data[0][task][label]'	=> 'New Task',
		'data[0][task][x]'	=> '100',
		'data[0][task][y]'	=> '100',
		'data[0][task][marked]'	=> 'false',
		'data[0][task][sub]'	=> '',
		'data[0][task][parent]'	=> self::$root,
		'data[0][task][tid]'	=> 't1'
              ));
        $this->dispatch("/play/update");
        $this->assertController("play");
        $this->assertAction("update");
        $this->assertResponseCode(200);
        $this->assertNotRedirect();
	echo ':';print_r($this->getResponse()->getHeaders());echo ':';
    }
}