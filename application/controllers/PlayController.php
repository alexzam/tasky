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
    }

    function updateAction(){
        $this->_helper->viewRenderer->setNoRender();
        $req = $this->getRequest();
        $data = $req->getParam('data');
        $out = array();

        foreach($data as $item){
            $act = $item['act'];
            if($act == 'i'){
                $tdata = $item['task'];
                require_once 'AuthController.php';
                $task = AuthController::getUser()->addTask();
                $task->label = $tdata['label'];
                $task->x = $tdata['x'];
                $task->y = $tdata['y'];
                $task->complete = ($tdata['marked'] == 'true');
                $task->save();

                $oitem = new stdclass();
                $oitem->type = 'i';
                $oitem->o = $tdata['id'];
                $oitem->n = $task->id;
                $out[] = $oitem;
            }
        }

        echo Zend_Json::encode($out);
    }
}
