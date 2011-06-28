<?php

class PlayController extends Zend_Controller_Action{
    // Show main screen
    function indexAction(){
        require_once 'AuthController.php';
        $view = $this->view;
        $user = AuthController::getUser();
	
	$view->rootId = $user->roottask_id;
    }

    // Return JSON: task set (page).
    // Get: [id] - task id for page
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

    // Store some updates.
    // Get: data[] - array of events
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
                $task->x = isset($tdata['x'])?$tdata['x']:-1;
                $task->y = isset($tdata['y'])?$tdata['y']:-1;
                $task->complete = ($tdata['marked'] == 'true');
                $task->parent_id = $tdata['parent'];
                $task->save();

                $oitem = new stdclass();
                $oitem->type = 'i';
                $oitem->o = $tdata['tid'];
                $oitem->n = $task->id;
                $out[] = $oitem;
            } else if ($act == 'u') {
                $tdata = $item['task'];
                $task = Doctrine_Core::getTable('Task')->find($tdata['id']);
                $task->label = $tdata['label'];
                $task->x = isset($tdata['x'])?$tdata['x']:-1;
                $task->y = isset($tdata['y'])?$tdata['y']:-1;
                $task->complete = ($tdata['marked'] == 'true');
                $task->parent_id = $tdata['parent'];
                $task->page = ($tdata['page'] == 'true');
                $task->save();

                $oitem = new stdclass();
                $oitem->type = 'u';
                $oitem->id = $tdata['id'];
                $out[] = $oitem;
            } else if ($act == 'd') {
                $id = $item['id'];
                $task = Doctrine_Core::getTable('Task')->find($id);
                $task->remove();

                $oitem = new stdclass();
                $oitem->type = 'd';
                $oitem->id = $id;
                $out[] = $oitem;
            }
        }

        echo Zend_Json::encode($out);
    }
}
