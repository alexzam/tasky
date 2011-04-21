<?php

class PlayController extends Zend_Controller_Action{
    function indexAction(){
        $req=$this->getRequest();
        if($req->getParam('newuser',0) == 1){
            require_once APPLICATION_PATH.'/models/User.php';
            $user = new User();
            $user->name = 'Test User';
            $user->role = User::ROLE_TEMP;
            $user->save();
            var_dump($user->identifier());
            echo 'New user here!';
        }
    }
}
