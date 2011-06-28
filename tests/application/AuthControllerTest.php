<?php

class AuthControllerTest extends ControllerTestCase {
    public function testGetUser(){
        require_once APPLICATION_PATH.'/controllers/AuthController.php';

        $user = User::createTmp();
        $sess = new Zend_Session_Namespace('auth');
        $sess->user = $user->toArray();

        $ruser = AuthController::getUser();
        $this->assertEquals($ruser, $user);
    }
}