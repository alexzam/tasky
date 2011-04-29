<?php

class PlayController extends Zend_Controller_Action{
    function indexAction(){
        require_once 'AuthController.php';
        $view = $this->view;
        $user = AuthController::getUser();
	
	$view->rootId = $user->roottask_id;
    }

    function getTaskPageAction(){
        $this->_helper->viewRenderer->setNoRender();
        $req = $this->getRequest();
        
        $taskId = $req->getParam('id');
        if($taskId == null){
            require_once 'AuthController.php';
            $user = AuthController::getUser();
            $taskId = $user->roottask_id;
        }

        $task = Doctrine_Core::getTable('Task')->find($taskId);
        $out = array();
        foreach($task->Subtasks as $subtask){
            $out[] = $subtask->toJsonObj();
        }

        echo Zend_Json::encode($out);
        return;
    }
}
