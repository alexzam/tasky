<?php

class PlayController extends Zend_Controller_Action{
    function indexAction(){
        $req=$this->getRequest();
        if($req->getParam('newuser',0) == 1){
            $user = new User();
            $user->name = 'Test User';
            $user->role = User::ROLE_TEMP;
            $user->save();

            $this->_redirect('play');
            return;
        }
    }

    function getTaskPageAction(){
        $this->_helper->viewRenderer->setNoRender();
        echo '{}';
        return;
    }
}
