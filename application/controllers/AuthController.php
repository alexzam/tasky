<?php
class AuthController extends Zend_Controller_Action{
    public function tmploginAction(){
        $user = User::createTmp();
        $sess = new Zend_Session_Namespace('auth');
        $sess->user = $user->toArray();

        $this->_helper->viewRenderer->setNoRender();
        $this->_redirect('play');
        return;
    }

    public static function getUser(){
        $sess = new Zend_Session_Namespace('auth');
        $auser = $sess->user;
        if ($auser == null) return null;
        return Doctrine_Core::getTable('User')->find($auser['id']);
    }
}